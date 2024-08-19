// app/api/getSpotifyToken/route.js

import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      console.error('Spotify token fetch failed:', response.status, response.statusText);
      return NextResponse.json({ error: 'Failed to fetch Spotify token' }, { status: response.status });
    }

    const data = await response.json();
    console.log('Spotify token data:', data); // Debug log

    return NextResponse.json({ accessToken: data.access_token }, { status: 200 });
  } catch (error) {
    console.error('Error in getSpotifyToken API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
