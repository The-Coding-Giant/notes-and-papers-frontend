import { ImageResponse } from "next/og";
import { getPaper } from "@/lib/api/public";
import { SITE_NAME } from "@/lib/env";
import { termLabel } from "@/lib/routes";

export const alt = "Question paper preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 86400;

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPaper(slug).catch(() => null);
  const title = p
    ? p.subject_name
      ? `${p.subject_name}${p.year ? ` ${p.year}` : ""} Question Paper`
      : p.title
    : "Question Paper";
  const sub = p
    ? p.course_name
      ? `${p.course_name} ${termLabel(p.term_kind, p.term_number)}${p.university_name ? ` · ${p.university_name}` : ""}`
      : (p.exam_name ?? SITE_NAME)
    : SITE_NAME;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "linear-gradient(135deg, #1e2a8a 0%, #3b4fd8 100%)",
        color: "white",
      }}
    >
      <div style={{ fontSize: 34, opacity: 0.9 }}>{SITE_NAME}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
        <div style={{ fontSize: 36, opacity: 0.9 }}>{sub}</div>
      </div>
      <div style={{ fontSize: 28, opacity: 0.85 }}>Free PDF · View online or download</div>
    </div>,
    size,
  );
}
