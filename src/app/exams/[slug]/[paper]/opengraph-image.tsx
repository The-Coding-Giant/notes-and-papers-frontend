import OgImage from "@/app/papers/[slug]/opengraph-image";

export const alt = "Question paper preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 86400;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string; paper: string }>;
}) {
  const { paper } = await params;
  return OgImage({ params: Promise.resolve({ slug: paper }) });
}
