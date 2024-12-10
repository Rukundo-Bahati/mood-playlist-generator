"use client";

import { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import { countries } from "./countries";

export default function Home() {
  const [mood, setMood] = useState("");
  const [country, setCountry] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [accessToken, setAccessToken] = useState("");
  const [tokenExpiry, setTokenExpiry] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchSpotifyToken = useCallback(async () => {
    try {
      const response = await fetch("/api/getSpotifyToken");
      if (!response.ok) {
        throw new Error("Failed to fetch Spotify token");
      }
      const data = await response.json();
      setAccessToken(data.accessToken);
      setTokenExpiry(Date.now() + 3600 * 1000); // Token expires in 1 hour
    } catch (error) {
      console.error("Error fetching Spotify token:", error.message);
    }
  }, []);

  useEffect(() => {
    fetchSpotifyToken();
  }, [fetchSpotifyToken]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() > tokenExpiry - 5 * 60 * 1000) {
        fetchSpotifyToken();
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchSpotifyToken, tokenExpiry]);

  const fetchPlaylists = async () => {
    if (!accessToken) {
      console.error("No access token available");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(mood)}${
          country ? `&market=${country}` : ""
        }&type=playlist`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          await fetchSpotifyToken(); // Refresh token if expired
          return fetchPlaylists(); // Retry fetching playlists
        } else if (response.status === 429) {
          console.warn("Rate limit exceeded, retrying...");
          await new Promise((resolve) => setTimeout(resolve, 60000));
          return fetchPlaylists();
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.playlists?.items?.length > 0) {
        setPlaylists(data.playlists.items);
      } else {
        console.warn("No playlists found for the given mood");
        setPlaylists([]);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background */}
      <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-blue-500 to-purple-600">
        Mood Playlist Generator
      </h1>

      <div className="relative w-full max-w-md mb-4">
        <input
          type="text"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="Enter your mood"
          className="w-full p-3 text-gray-950 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white bg-opacity-80"
        />
      </div>

      <div className="relative w-full max-w-md mb-6">
        <Select
          options={countries}
          onChange={(selectedOption) =>
            setCountry(selectedOption?.value || null)
          }
          placeholder="Select your country"
          className="text-gray-900"
        />
      </div>

      <button
        onClick={fetchPlaylists}
        className="relative w-full max-w-md p-3 mb-6 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 hover:from-purple-600 hover:via-blue-500 hover:to-green-400 text-black rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        disabled={loading || !mood}
      >
        {loading ? "Fetching playlist..." : "Get Playlists"}
      </button>

      {loading && <p>Loading playlists...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 w-full max-w-4xl">
        {playlists.map((playlist) => (
          <div
            key={playlist?.id}
            className="bg-black bg-opacity-50 p-4 rounded-lg shadow-lg"
          >
            <a
              href={playlist?.external_urls?.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold hover:text-green-400"
            >
              {playlist?.name}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
