import { NextResponse } from "next/server";
import { spotifyApi } from "@/lib/spotify";
import { cookies } from "next/headers";

export async function GET() {
  const token = (await cookies()).get("spotify_access_token");
  if (!token) return new NextResponse("Unauthorized", { status: 401 });

  try {
    spotifyApi.setAccessToken(token.value);
    const response = await spotifyApi.getMyCurrentPlayingTrack();

    if (response?.body?.item && "name" in response.body.item) {
      const track = response.body.item;
      return NextResponse.json({
        name: track.name,
        artist:
          track.type === "track" &&
          Array.isArray(track.artists) &&
          track.artists[0]
            ? track.artists[0].name
            : "Unknown Artist",
        playedAt: new Date().toISOString(),
      });
    }
    return NextResponse.json(null);
  } catch {
    return new NextResponse("Error fetching track", { status: 500 });
  }
}
