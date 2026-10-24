import { AdminAction } from "@/components/admin/admin-action";
import { CoverUpload } from "@/components/admin/cover-upload";
import { NoPermission } from "@/components/admin/no-permission";
import { PageHeader, StatCard, fmtDate } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { authedFetch, getMe } from "@/lib/api/server";

interface Cover {
  source: "default" | "custom";
  filename: string | null;
  size: number | null;
  uploaded_at: string | null;
  sha256: string | null;
}
interface Covers {
  front: Cover;
  back: Cover;
  applies_to: number;
  fixed_in_file: number;
}

const kb = (n: number | null) => (n ? `${Math.round(n / 1024).toLocaleString("en-IN")} KB` : "");

function CoverCard({ which, cover }: { which: "front" | "back"; cover: Cover }) {
  const title = which === "front" ? "Front cover" : "Back cover";
  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl">{title}</h2>
        <Badge className={cover.source === "custom" ? "bg-primary/15 text-link" : "bg-muted"}>
          {cover.source === "custom" ? "Custom" : "Default"}
        </Badge>
      </div>
      {/* A plain img: the preview comes from the API through the session proxy, so it cannot be optimised. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/backend/admin/covers/${which}/preview?v=${cover.sha256 ?? "default"}`}
        alt={`${title} as it appears in every paper`}
        className="mx-auto max-h-[28rem] w-auto border-2 border-border bg-muted"
      />
      <p className="text-sm text-muted-foreground">
        {cover.filename}
        {cover.size ? ` · ${kb(cover.size)}` : ""}
        {cover.uploaded_at ? ` · uploaded ${fmtDate(cover.uploaded_at)}` : ""}
      </p>
      <div className="flex flex-wrap gap-2">
        <CoverUpload which={which} />
        {cover.source === "custom" && (
          <AdminAction
            label="Use the default"
            path={`admin/covers/${which}`}
            method="DELETE"
            success="Back to the default cover"
            confirm={`Go back to the default ${which} cover on every paper?`}
          />
        )}
      </div>
    </Card>
  );
}

export default async function CoversPage() {
  if ((await getMe())?.role !== "admin") return <NoPermission />;
  const data = await authedFetch<Covers>("/admin/covers", {}, "/admin/covers");

  return (
    <>
      <PageHeader
        title="Cover pages"
        description="The front and back page added around every paper. Upload a PDF to replace one; only its first page is used. The change shows on every paper within a minute."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Papers using these covers"
          value={data.applies_to}
          hint="The covers are added when a paper is opened or downloaded."
        />
        <StatCard
          label="Older papers with covers inside the file"
          value={data.fixed_in_file}
          hint="Re-brand them to give them the current covers."
        />
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <CoverCard which="front" cover={data.front} />
        <CoverCard which="back" cover={data.back} />
      </div>
      <p className="mt-6 max-w-3xl text-sm text-muted-foreground">
        Tips: use a portrait page (A4 works best) of at most 6 MB. Links on the cover stay
        clickable. The footer line on each page, &quot;Download more Notes &amp; Papers&quot;, is
        set separately.
      </p>
    </>
  );
}
