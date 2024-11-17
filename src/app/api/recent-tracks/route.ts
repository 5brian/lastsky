import { NextResponse } from "next/server";
import { spotifyApi } from "@/lib/spotify";
import { cookies } from "next/headers";

export async function GET() {
  const token = (await cookies()).get("spotify_access_token");
  if (!token) return new NextResponse("Unauthorized", { status: 401 });

  try {
    spotifyApi.setAccessToken(token.value);
    const response = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 20 });
    const tracks = response.body.items.map((item) => ({
      name: item.track.name,
      artist: item.track.artists[0].name,
      playedAt: item.played_at,
    }));
    return NextResponse.json(tracks);
  } catch {
    return new NextResponse("Error fetching tracks", { status: 500 });
  }
}
