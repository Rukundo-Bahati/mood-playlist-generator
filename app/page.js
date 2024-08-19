'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [mood, setMood] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [accessToken, setAccessToken] = useState('');

  // Fetch Spotify Access Token
  const fetchSpotifyToken = async () => {
    try {
      const response = await fetch('/api/getSpotifyToken');
      const data = await response.json();
      setAccessToken(data.accessToken);
      console.log('Access Token:', data.accessToken); // Debug log
    } catch (error) {
      console.error('Error fetching Spotify token:', error);
    }
  };

  useEffect(() => {
    fetchSpotifyToken();
  }, []);

  const fetchPlaylists = async () => {
    if (!accessToken) {
      console.error('No access token available');
      return;
    }

    console.log('Fetching playlists for mood:', mood); // Debug log

    try {
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(mood)}&type=playlist`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error('Error with Spotify API response:', response.status, response.statusText);
        return;
      }

      const data = await response.json();
      console.log('Playlists:', data.playlists.items); // Debug log
      setPlaylists(data.playlists.items);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-6">Mood Playlist Generator</h1>
      <>
        <input
          type="text"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="Enter your mood"
          className="w-full max-w-md p-2 mb-4 text-gray-900 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={fetchPlaylists}
          className="w-full max-w-md p-2 mb-6 bg-purple-600 hover:bg-purple-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          Get Playlists
        </button>
        <ul className="w-full max-w-md space-y-4">
          {playlists.map((playlist) => (
            <li key={playlist.id} className="bg-gray-800 p-4 rounded shadow-lg">
              <a
                href={playlist.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold hover:text-purple-400"
              >
                {playlist.name}
              </a>
            </li>
          ))}
        </ul>
      </>
    </div>
  );
}
