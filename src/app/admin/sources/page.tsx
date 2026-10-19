import { NewSourceForm } from "@/components/admin/new-source-form";
import { NoPermission } from "@/components/admin/no-permission";
import { SourceCard } from "@/components/admin/source-card";
import { PageHeader } from "@/components/admin/ui";
import { authedFetch, getMe } from "@/lib/api/server";
import type { AdminSource } from "@/lib/api/types";

// Mirrors app/pipeline/adapters/registry.py in the backend.
const ADAPTERS = ["generic_site", "uniraj", "uoronline", "pyqonline", "uploads"];

export default async function SourcesPage() {
  if ((await getMe())?.role !== "admin") return <NoPermission />;
  const sources = await authedFetch<AdminSource[]>("/admin/sources", {}, "/admin/sources");
  return (
    <>
      <PageHeader
        title="Sources"
        description="Where papers come from. uoronline and pyqonline stay disabled unless you record written permission from the site owner."
      />
      <div className="space-y-3">
        {sources.map((s) => (
          <SourceCard key={s.id} source={s} />
        ))}
        <NewSourceForm adapters={ADAPTERS} />
      </div>
    </>
  );
}
