"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Track } from "./types";

export default function Home() {
  const router = useRouter();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const lastPlayingStatus = useRef<boolean>(false);
  const playStartTime = useRef<number | null>(null);
  const currentTrackId = useRef<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/check").then((res) => setIsLoggedIn(res.ok));
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const scrobbleTrack = async (track: Track) => {
      if (!track) return;

      if (track.isPlaying && !lastPlayingStatus.current) {
        if (track.id !== currentTrackId.current) {
          playStartTime.current = Date.now();
          currentTrackId.current = track.id;
        }
      }

      if (
        !track.isPlaying &&
        lastPlayingStatus.current &&
        playStartTime.current
      ) {
        const playDuration = Date.now() - playStartTime.current;
        const requiredDuration = Math.min(
          (track.durationMs ?? 0) * 0.5,
          240000
        );

        if (playDuration >= requiredDuration) {
          await fetch("/api/scrobble", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              trackId: track.id,
              playTimeMs: playDuration,
            }),
          });
        }

        playStartTime.current = null;
      }

      lastPlayingStatus.current = track.isPlaying ?? false;
    };

    const fetchData = async () => {
      const [currentRes, recentRes] = await Promise.all([
        fetch("/api/current-track"),
        fetch("/api/recent-tracks"),
      ]);

      if (currentRes.ok) {
        const track = await currentRes.json();
        if (track) {
          setCurrentTrack(track);
          await scrobbleTrack(track);
        } else {
          setCurrentTrack(null);
          lastPlayingStatus.current = false;
          playStartTime.current = null;
          currentTrackId.current = null;
        }
      }

      if (recentRes.ok) {
        const tracks = await recentRes.json();
        setRecentTracks(tracks);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  return (
    <div className="min-h-screen bg-[#1b2838] text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {!isLoggedIn ? (
          <div className="flex flex-col items-center justify-center h-[80vh] space-y-6">
            <h1 className="text-4xl font-bold text-blue-400">lastsky</h1>
            <button
              onClick={() => (window.location.href = "/api/auth")}
              className="bg-green-600 hover:bg-green-500 text-white font-bold px-8 py-3 rounded-md flex items-center space-x-2"
            >
              <span>connect spotify</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full"></div>
                <div>
                  <h1 className="text-2xl font-bold">Username</h1>
                  <p className="text-gray-400">
                    {currentTrack?.isPlaying ? "online" : "offline"}
                  </p>
                </div>
              </div>

              {currentTrack && (
                <div className="flex items-center space-x-4 bg-[#16202d] p-4 rounded-lg max-w-xs">
                  {currentTrack.albumArt ? (
                    <Image
                      src={currentTrack.albumArt}
                      alt={`${currentTrack.name} album art`}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-700 rounded flex-shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{currentTrack.name}</p>
                    <p className="text-sm text-gray-400 truncate">
                      {currentTrack.artist}
                    </p>
                    <p className="text-xs text-green-400">
                      {currentTrack.isPlaying ? "now playing" : "paused"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#16202d] rounded-lg p-4">
              <h2 className="text-blue-300 font-medium mb-4">
                Recent Activity
              </h2>

              {recentTracks.slice(0, 3).map((track, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 py-3 border-t border-gray-700"
                >
                  {track.albumArt ? (
                    <Image
                      src={track.albumArt}
                      alt={`${track.name} album art`}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-700 rounded flex-shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.name}</p>
                    <p className="text-sm text-gray-400 truncate">
                      {track.artist}
                    </p>
                  </div>

                  <div className="text-right text-sm text-gray-400">
                    <p>
                      {track.hoursOnRecord?.includes("min")
                        ? track.hoursOnRecord
                        : `${track.hoursOnRecord} hrs`}{" "}
                      on record
                    </p>
                    <p className="text-xs">
                      {new Date(track.playedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => router.push("/library")}
                className="text-[#66c0f4] hover:text-white text-sm"
              >
                View All Scrobbles
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
