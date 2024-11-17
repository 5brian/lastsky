import { NextRequest, NextResponse } from "next/server";
import { spotifyApi } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  try {
    const data = await spotifyApi.authorizationCodeGrant(code as string);
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set("spotify_access_token", data.body.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600,
    });
    return response;
  } catch (error) {
    return NextResponse.redirect(new URL("/error", request.url));
  }
}
