import "server-only";
import { cookies } from "next/headers";
import { ACCESS_COOKIE, secondsLeft } from "@/lib/auth/cookies";

/** The bearer token for the signed-in visitor, or null. Reading cookies makes the caller dynamic. */
export async function getAccessToken(): Promise<string | null> {
  // Always touch cookies() first: it opts the page out of static prerendering, so a "signed out" render can never
  // be baked into a build. proxy.ts refreshes an expiring token before the page renders.
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  return token && secondsLeft(token) > 0 ? token : null;
}
