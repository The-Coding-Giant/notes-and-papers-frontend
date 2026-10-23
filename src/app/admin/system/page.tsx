import { AdminAction } from "@/components/admin/admin-action";
import { NoPermission } from "@/components/admin/no-permission";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { authedFetch, getMe } from "@/lib/api/server";

interface Check {
  group: string;
  label: string;
  status: "ok" | "warn" | "fail" | "info";
  detail: string;
  fix: string;
}
interface System {
  environment: string;
  production: boolean;
  production_errors: string[];
  production_warnings: string[];
  checks: Check[];
  summary: { fail: number; warn: number; ok: number };
  papers: { published: number; branded: number };
}

const TONE: Record<Check["status"], string> = {
  ok: "bg-success/15 text-success",
  warn: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  fail: "bg-destructive/15 text-destructive",
  info: "bg-muted text-muted-foreground",
};
const LABEL: Record<Check["status"], string> = {
  ok: "OK",
  warn: "Check",
  fail: "Fix",
  info: "Info",
};

const TESTS = [
  {
    id: "storage",
    label: "Test storage",
    ok: "Storage works: wrote, read and deleted a test file",
  },
  { id: "telegram", label: "Test Telegram", ok: "Test message sent to the backup channel" },
  { id: "drive", label: "Test Google Drive", ok: "Google Drive folder is reachable" },
  {
    id: "revalidate",
    label: "Test website refresh",
    ok: "The website accepted the refresh request",
  },
];

export default async function SystemPage() {
  if ((await getMe())?.role !== "admin") return <NoPermission />;
  const sys = await authedFetch<System>("/admin/system", {}, "/admin/system");
  const groups = [...new Set(sys.checks.map((c) => c.group))];

  return (
    <>
      <PageHeader
        title="System status"
        description="What is configured on the server and what still needs attention. Secret values are never shown: change them in the server's environment variables (.env locally, the hosting dashboard in production)."
        actions={
          <div className="flex flex-wrap gap-2">
            {TESTS.map((t) => (
              <AdminAction
                key={t.id}
                label={t.label}
                path={`/admin/system/test/${t.id}`}
                success={t.ok}
              />
            ))}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Environment"
          value={sys.environment}
          hint={sys.production ? "production rules on" : "development"}
        />
        <StatCard
          label="Needs fixing"
          value={sys.summary.fail}
          tone={sys.summary.fail ? "bad" : undefined}
        />
        <StatCard
          label="Worth checking"
          value={sys.summary.warn}
          tone={sys.summary.warn ? "warn" : undefined}
        />
        <StatCard
          label="PDFs branded"
          value={`${sys.papers.branded.toLocaleString("en-IN")} / ${sys.papers.published.toLocaleString("en-IN")}`}
          hint="stored in our own storage"
        />
      </div>

      {sys.production && sys.production_errors.length > 0 && (
        <p
          role="alert"
          className="mt-6 border-2 border-destructive bg-card p-4 text-sm text-destructive"
        >
          Production problems: {sys.production_errors.join("; ")}
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {groups.map((g) => (
          <section
            key={g}
            aria-labelledby={`g-${g}`}
            className="border-2 border-border bg-card shadow-hard-sm"
          >
            <h2 id={`g-${g}`} className="border-b-2 border-border px-4 py-3 text-xl">
              {g}
            </h2>
            <ul className="divide-y text-sm">
              {sys.checks
                .filter((c) => c.group === g)
                .map((c) => (
                  <li key={c.label} className="flex items-start gap-3 px-4 py-3">
                    <Badge className={`mt-0.5 w-14 shrink-0 justify-center ${TONE[c.status]}`}>
                      {LABEL[c.status]}
                    </Badge>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{c.label}</span>
                      <span className="block break-words text-muted-foreground">{c.detail}</span>
                      {c.fix && c.status !== "ok" && (
                        <span className="mt-1 block break-words text-xs font-medium">
                          How to fix: {c.fix}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
