import { NextResponse } from "next/server";
import { spotifyApi } from "@/lib/spotify";
import { cookies } from "next/headers";
import redisClient from "@/lib/redis";
import { formatHours } from "@/lib/utils";

export async function GET() {
  const token = (await cookies()).get("spotify_access_token");
  if (!token) return new NextResponse("Unauthorized", { status: 401 });

  try {
    spotifyApi.setAccessToken(token.value);
    const response = await spotifyApi.getMyCurrentPlayingTrack();

    if (response?.body?.item && "name" in response.body.item) {
      const track = response.body.item;

      // Get play history from Redis
      const historyData = await redisClient.get(`track:${track.id}:history`);
      const history = historyData
        ? JSON.parse(historyData)
        : {
            plays: 0,
            totalPlayTimeMs: 0,
            lastPlayedAt: new Date().toISOString(),
          };

      return NextResponse.json({
        id: track.id,
        name: track.name,
        artist:
          track.type === "track" &&
          Array.isArray(track.artists) &&
          track.artists[0]
            ? track.artists[0].name
            : "Unknown Artist",
        playedAt: new Date().toISOString(),
        durationMs: track.duration_ms,
        albumArt: "album" in track ? track.album.images[0]?.url : null,
        isPlaying: response.body.is_playing,
        hoursOnRecord: formatHours(history.totalPlayTimeMs),
        plays: history.plays,
      });
    }
    return NextResponse.json(null);
  } catch (error) {
    console.error("Error fetching track:", error);
    return new NextResponse("Error fetching track", { status: 500 });
  }
}
