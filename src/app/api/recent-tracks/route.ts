import { NextResponse } from "next/server";
import { spotifyApi } from "@/lib/spotify";
import { cookies } from "next/headers";
import redisClient from "@/lib/redis";

export async function GET(request: Request) {
  const token = (await cookies()).get("spotify_access_token");
  if (!token) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "3");

  try {
    spotifyApi.setAccessToken(token.value);
    const response = await spotifyApi.getMyRecentlyPlayedTracks({ limit });

    const playHistories = await Promise.all(
      response.body.items.map((item) =>
        redisClient
          .get(`track:${item.track.id}:history`)
          .then((data) => (data ? JSON.parse(data) : null))
      )
    );

    const tracks = response.body.items.map((item, i) => {
      const history = playHistories[i] || {
        plays: 0,
        totalPlayTimeMs: 0,
        lastPlayedAt: item.played_at,
      };

      return {
        id: item.track.id,
        name: item.track.name,
        artist: item.track.artists[0].name,
        albumArt: item.track.album.images[0]?.url,
        playedAt: item.played_at,
        plays: history.plays,
      };
    });

    return NextResponse.json(tracks);
  } catch {
    return new NextResponse("Error fetching tracks", { status: 500 });
  }
}
