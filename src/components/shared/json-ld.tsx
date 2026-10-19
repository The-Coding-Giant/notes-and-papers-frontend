import type { JsonLd } from "@/lib/seo";

/** Server-rendered structured data. Escapes `<` so data can never close the script tag (XSS-safe). */
export function JsonLdScript({ data }: { data: JsonLd | JsonLd[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
