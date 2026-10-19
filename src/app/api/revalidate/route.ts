import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  tags: z.array(z.string().min(1).max(200)).max(500).default([]),
  paths: z.array(z.string().startsWith("/").max(300)).max(500).default([]),
});

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Called by the backend pipeline after publishing. See docs/projectflow.md section 8 (stage 10). */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const given = req.headers.get("x-revalidate-secret") ?? "";
  if (!secret || !safeEqual(given, secret)) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { message: "Invalid body" } }, { status: 400 });
  }

  // 'max' = stale-while-revalidate, so visitors never wait on the rebuild.
  parsed.data.tags.forEach((t) => revalidateTag(t, "max"));
  parsed.data.paths.forEach((p) => revalidatePath(p));

  return NextResponse.json({
    revalidated: { tags: parsed.data.tags.length, paths: parsed.data.paths.length },
  });
}
