"use client";
import Head from 'next/head';
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
      const data = await response.json();
      setAccessToken(data.accessToken);
      // Set token expiry to 1 hour from now
      setTokenExpiry(Date.now() + (3600 * 1000));
    } catch (error) {
      console.error("Error fetching Spotify token:", error);
    }
  }, []);

  useEffect(() => {
    fetchSpotifyToken();
  }, [fetchSpotifyToken]);

  useEffect(() => {
    const checkTokenExpiry = () => {
      const now = Date.now();
      if (now > tokenExpiry - (5 * 60 * 1000)) { // Refresh 5 mins before expiry
        fetchSpotifyToken();
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiry, 60 * 1000);
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
          await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
          return fetchPlaylists();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.playlists && data.playlists.items.length > 0) {
        setPlaylists(data.playlists.items);
      } else {
        console.warn("No playlists found for the given mood:", data);
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
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black opacity-30"></div>
        <svg
          className="absolute top-0 left-0 w-full h-full opacity-30"
          viewBox="0 0 100 100"
        >
          {/* Smaller Circles with Gradient Colors */}
          <circle
            cx="20"
            cy="20"
            r="2"
            fill="url(#grad1)"
            className="animate-pulse"
          />
          <circle
            cx="80"
            cy="30"
            r="2"
            fill="url(#grad2)"
            className="animate-pulse"
          />
          <circle
            cx="50"
            cy="70"
            r="2"
            fill="url(#grad3)"
            className="animate-pulse"
          />
          <circle
            cx="10"
            cy="50"
            r="2"
            fill="url(#grad4)"
            className="animate-pulse"
          />

          {/* Smaller Stars */}
          <polygon
            points="10,15 12,10 15,10 13,7 15,5 10,8 5,5 7,7 5,10 8,10"
            fill="white"
            className="animate-pulse"
          />
          <polygon
            points="70,8 72,3 75,3 73,0 75,-3 70,-1 65,-3 67,0 65,3 68,3"
            fill="white"
            className="animate-pulse"
          />
          <polygon
            points="30,45 32,40 35,40 33,37 35,35 30,37 25,35 27,37 25,40 28,40"
            fill="white"
            className="animate-pulse"
          />
          <polygon
            points="90,20 92,15 95,15 93,12 95,10 90,11 85,10 87,12 85,15 88,15"
            fill="white"
            className="animate-pulse"
          />

          {/* Gradients for Circles */}
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                style={{ stopColor: "rgb(34,193,195)", stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "rgb(253,187,45)", stopOpacity: 1 }}
              />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                style={{ stopColor: "rgb(253,187,45)", stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "rgb(34,193,195)", stopOpacity: 1 }}
              />
            </linearGradient>
            <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                style={{ stopColor: "rgb(34,193,195)", stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "rgb(253,187,45)", stopOpacity: 1 }}
              />
            </linearGradient>
            <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                style={{ stopColor: "rgb(253,187,45)", stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "rgb(34,193,195)", stopOpacity: 1 }}
              />
            </linearGradient>
          </defs>
        </svg>
      </div>

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

      {loading && <p className="relative z-10">Loading playlists...</p>}

      <ul className="relative z-10 w-full max-w-md space-y-4">
        {playlists.map((playlist) => (
          <li
            key={playlist.id}
            className="bg-black bg-opacity-50 p-4 rounded-lg shadow-lg hover:bg-opacity-70 transition-all duration-300"
          >
            <a
              href={playlist.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold hover:text-green-400"
            >
              {playlist.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
