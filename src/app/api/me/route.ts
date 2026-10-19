import { NextResponse } from "next/server";
import { getMe } from "@/lib/api/server";

/**
 * GET /api/me -> { user: Me | null }. Always 200, so a signed-out visitor does not get a red 401 in the console;
 * the session cookie is read server-side and never exposed to page scripts.
 */
export async function GET() {
  try {
    return NextResponse.json({ user: await getMe() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });
  }
}
