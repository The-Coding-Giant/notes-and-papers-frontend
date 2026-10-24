/** IndexNow ownership proof. The backend sends keyLocation = {site}/indexnow-key.txt (see backend services/revalidate.py). */
// Read at request time: the key is a Cloudflare variable, not part of the build.
export const dynamic = "force-dynamic";

export function GET() {
  const key = process.env.INDEXNOW_KEY;
  if (!key) return new Response("Not found", { status: 404 });
  return new Response(key, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
