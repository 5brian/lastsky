import { NextResponse } from "next/server";
import redisClient from "@/lib/redis";
import { PlayHistory } from "@/lib/db/types";

export async function POST(request: Request) {
  const { trackId, playTimeMs } = await request.json();

  try {
    const key = `track:${trackId}:history`;

    // Get existing history from Redis
    const existingData = await redisClient.get(key);
    const history: PlayHistory = existingData
      ? JSON.parse(existingData)
      : {
          trackId,
          plays: 0,
          totalPlayTimeMs: 0,
          lastPlayedAt: new Date().toISOString(),
        };

    // Only update if this is a new play (based on lastPlayedAt)
    const lastPlayed = new Date(history.lastPlayedAt);
    const now = new Date();
    const timeDiff = now.getTime() - lastPlayed.getTime();

    // Only count as a new play if more than 30 seconds have passed
    if (timeDiff > 30000) {
      history.plays += 1;
      history.totalPlayTimeMs += playTimeMs;
      history.lastPlayedAt = now.toISOString();

      // Save to Redis
      await redisClient.set(key, JSON.stringify(history));
    }

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error updating play history:", error);
    return new NextResponse("Error updating play count", { status: 500 });
  }
}
