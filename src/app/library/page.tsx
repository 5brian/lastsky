"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Track } from "../types";

export default function HistoryPage() {
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    fetch("/api/recent-tracks?limit=50")
      .then((res) => res.json())
      .then(setTracks);
  }, []);

  return (
    <div className="min-h-screen bg-[#1b2838] text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">library</h1>
        <div className="bg-[#16202d] rounded-lg p-4">
          {tracks.map((track, i) => (
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
                <p className="text-sm text-gray-400 truncate">{track.artist}</p>
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
      </div>
    </div>
  );
}
