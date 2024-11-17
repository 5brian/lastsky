import { NextResponse } from "next/server";
import { spotifyApi } from "@/lib/spotify";

export async function GET() {
  const scopes = ["user-read-currently-playing", "user-read-recently-played"];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, "state");
  return NextResponse.redirect(authorizeURL);
}
