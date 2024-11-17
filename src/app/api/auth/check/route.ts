import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const token = (await cookies()).get("spotify_access_token");
  if (!token) return new NextResponse("Unauthorized", { status: 401 });
  return NextResponse.json({ isLoggedIn: true });
}
