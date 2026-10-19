import type { Metadata } from "next";
import { UploadForm } from "@/components/shared/upload-form";
import { EmptyState } from "@/components/shared/empty-state";
import { getCatalog, getFeatures } from "@/lib/api/public";
import type { CatalogCourse } from "@/lib/api/types";
import { getMe } from "@/lib/api/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Upload a paper or notes",
  robots: { index: false, follow: false },
};

export default async function UploadPage() {
  if (!(await getMe())) redirect("/login?next=/upload");
  if (!(await getFeatures()).uploads) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-5xl sm:text-6xl">Upload a paper or notes</h1>
        <EmptyState
          title="Uploads are paused"
          description="For now this site links to papers on their original sources instead of storing files. Uploads will return later."
          action={{ href: "/rajasthan-university", label: "Browse papers" }}
        />
      </div>
    );
  }
  const catalog: CatalogCourse[] = await getCatalog().catch(() => []);
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-5xl sm:text-6xl">Upload a paper or notes</h1>
        <p className="text-muted-foreground">
          Share previous year papers or your own notes. Every upload is reviewed by a moderator
          before it is published. Only upload material you have the right to share.
        </p>
      </header>
      <UploadForm catalog={catalog} />
    </div>
  );
}
