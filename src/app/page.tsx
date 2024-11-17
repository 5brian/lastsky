"use client";
import { useEffect, useState } from "react";

interface Track {
  name: string;
  artist: string;
  playedAt: string;
}

export default function Home() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/check").then((res) => setIsLoggedIn(res.ok));
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchCurrentTrack = async () => {
      const res = await fetch("/api/current-track");
      if (res.ok) setCurrentTrack(await res.json());
    };

    const fetchRecentTracks = async () => {
      const res = await fetch("/api/recent-tracks");
      if (res.ok) setRecentTracks(await res.json());
    };

    fetchCurrentTrack();
    fetchRecentTracks();
    const interval = setInterval(fetchCurrentTrack, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">lastsky</h1>
      {!isLoggedIn ? (
        <button
          onClick={() => (window.location.href = "/api/auth")}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          connect spotify
        </button>
      ) : (
        <div className="space-y-8">
          {currentTrack && (
            <div className="border p-4 rounded">
              <h2 className="text-2xl font-bold mb-2">now playing</h2>
              <p>
                {currentTrack.name} - {currentTrack.artist}
              </p>
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold mb-4">recently played</h2>
            <div className="space-y-2">
              {recentTracks.map((track, i) => (
                <div key={i} className="border p-2 rounded">
                  <p>
                    {track.name} - {track.artist}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(track.playedAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
