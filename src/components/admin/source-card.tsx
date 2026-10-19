"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { AdminSource } from "@/lib/api/types";
import { bff } from "@/services/api-client";
import { StatusBadge, fmtDate } from "./ui";
import { Select } from "@/components/ui/select";

const sel =
  "h-10 w-full border-2 border-input bg-card font-medium focus-visible:shadow-hard-sm focus-visible:outline-none placeholder:font-normal placeholder:text-muted-foreground px-2 text-sm";
const RESTRICTED = new Set(["uoronline", "pyqonline"]);

interface TestResult {
  reachable: boolean;
  status: number | null;
  robots: number | null;
  allowed_by_robots: boolean | null;
  error?: string;
}

export function SourceCard({ source }: { source: AdminSource }) {
  const router = useRouter();
  const [s, setS] = useState({
    name: source.name,
    base_url: source.base_url,
    enabled: source.enabled,
    rights_status: source.rights_status,
    respect_robots: source.respect_robots,
    schedule_cron: source.schedule_cron,
    rate_per_sec: String(source.rate_per_sec),
    permission_note: source.permission_note ?? "",
    config: JSON.stringify(source.config, null, 2),
  });
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [test, setTest] = useState<TestResult | null>(null);

  let configError: string | undefined;
  try {
    const parsed = JSON.parse(s.config || "{}");
    if (typeof parsed !== "object" || Array.isArray(parsed) || parsed === null)
      configError = "Config must be a JSON object";
  } catch {
    configError = "Config is not valid JSON";
  }
  const rate = Number(s.rate_per_sec);
  const rateError = !(rate > 0 && rate <= 20) ? "Between 0 and 20 requests per second" : undefined;

  // Rule 2.1: these changes need recorded written permission.
  const enabling = s.enabled && !source.enabled && RESTRICTED.has(source.adapter);
  const robotsOff = !s.respect_robots && source.respect_robots;
  const needsPermission = enabling || robotsOff;
  const permissionError =
    needsPermission && (!confirmed || !s.permission_note.trim())
      ? "Record the written permission and tick the confirmation."
      : undefined;
  const canSave = !configError && !rateError && !permissionError && !busy;

  async function run<T>(label: string, fn: () => Promise<T>, ok?: string) {
    setBusy(label);
    try {
      const r = await fn();
      if (ok) toast.success(ok);
      router.refresh();
      return r;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  const save = () =>
    run(
      "save",
      () =>
        bff(`admin/sources/${source.id}`, {
          method: "PATCH",
          body: {
            name: s.name,
            base_url: s.base_url,
            enabled: s.enabled,
            rights_status: s.rights_status,
            respect_robots: s.respect_robots,
            schedule_cron: s.schedule_cron,
            rate_per_sec: rate,
            permission_note: s.permission_note || null,
            permission_confirmed: confirmed,
            config: JSON.parse(s.config || "{}"),
          },
        }),
      "Source saved",
    );

  return (
    <details className="border-2 border-border bg-card bg-card" open={false}>
      <summary className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 p-4">
        <span className="font-semibold">{source.name}</span>
        <span className="rounded bg-muted px-1.5 py-0.5 text-xs">{source.adapter}</span>
        <span className={`text-xs ${source.enabled ? "text-success" : "text-muted-foreground"}`}>
          {source.enabled ? "enabled" : "disabled"}
        </span>
        <span className="text-xs text-muted-foreground">
          rights: {source.rights_status.replace("_", " ")}
        </span>
        {source.last_run_status && <StatusBadge status={source.last_run_status} />}
        <span className="ml-auto text-xs text-muted-foreground">
          last run {fmtDate(source.last_run_at)}
        </span>
      </summary>

      <div className="space-y-4 border-t p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Field id={`name-${source.id}`} label="Name" required>
            <Input
              id={`name-${source.id}`}
              placeholder="Source name"
              value={s.name}
              onChange={(e) => setS({ ...s, name: e.target.value })}
            />
          </Field>
          <Field id={`url-${source.id}`} label="Base URL" required>
            <Input
              id={`url-${source.id}`}
              placeholder="https://www.example.com/"
              type="url"
              value={s.base_url}
              onChange={(e) => setS({ ...s, base_url: e.target.value })}
            />
          </Field>
          <Field
            id={`rights-${source.id}`}
            label="Rights status"
            hint="link_only: never copy files, the download button goes to the original."
          >
            <Select
              id={`rights-${source.id}`}
              className={sel}
              value={s.rights_status}
              onChange={(e) =>
                setS({ ...s, rights_status: e.target.value as AdminSource["rights_status"] })
              }
            >
              <option value="owned">Owned</option>
              <option value="permitted">Permitted</option>
              <option value="link_only">Link only</option>
              <option value="unknown">Unknown</option>
            </Select>
          </Field>
          <Field
            id={`cron-${source.id}`}
            label="Schedule (cron, UTC)"
            hint="0 2 * * * = daily at 02:00"
          >
            <Input
              id={`cron-${source.id}`}
              placeholder="0 2 * * *"
              value={s.schedule_cron}
              onChange={(e) => setS({ ...s, schedule_cron: e.target.value })}
            />
          </Field>
          <Field id={`rate-${source.id}`} label="Requests per second" error={rateError}>
            <Input
              id={`rate-${source.id}`}
              placeholder="2"
              inputMode="decimal"
              value={s.rate_per_sec}
              invalid={!!rateError}
              onChange={(e) => setS({ ...s, rate_per_sec: e.target.value })}
            />
          </Field>
          <div className="flex flex-col justify-end gap-2 pb-1 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={s.enabled}
                onChange={(e) => setS({ ...s, enabled: e.target.checked })}
              />{" "}
              Enabled
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={s.respect_robots}
                onChange={(e) => setS({ ...s, respect_robots: e.target.checked })}
              />{" "}
              Respect robots.txt
            </label>
          </div>
        </div>

        {(needsPermission || s.permission_note) && (
          <div className="space-y-2 rounded-md border border-amber-500/50 bg-amber-500/5 p-3">
            <Field
              id={`note-${source.id}`}
              label="Written permission note"
              required={needsPermission}
              error={permissionError}
              hint="Who gave permission, how and when (e.g. email from the site owner, date)."
            >
              <Input
                id={`note-${source.id}`}
                placeholder="e.g. Email from the site owner, 12 Oct 2026"
                value={s.permission_note}
                onChange={(e) => setS({ ...s, permission_note: e.target.value })}
              />
            </Field>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <span>I confirm the site owner gave written permission for this.</span>
            </label>
          </div>
        )}

        <Field
          id={`config-${source.id}`}
          label="Adapter config (JSON)"
          error={configError}
          hint="e.g. paper_url_regex, max_papers_per_run, include, exclude"
        >
          <textarea
            id={`config-${source.id}`}
            rows={4}
            spellCheck={false}
            value={s.config}
            onChange={(e) => setS({ ...s, config: e.target.value })}
            aria-invalid={!!configError}
            className="w-full border-2 border-input bg-card font-medium focus-visible:shadow-hard-sm focus-visible:outline-none placeholder:font-normal placeholder:text-muted-foreground p-2 font-mono text-xs"
          />
        </Field>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={save} disabled={!canSave} aria-disabled={!canSave}>
            {busy === "save" ? <Spinner label="Saving" /> : "Save changes"}
          </Button>
          <Button
            variant="outline"
            disabled={!!busy}
            onClick={async () => {
              const r = await run("test", () =>
                bff<TestResult>(`admin/sources/${source.id}/test`, { method: "POST" }),
              );
              if (r) setTest(r);
            }}
          >
            {busy === "test" ? <Spinner label="Testing" /> : "Test connection"}
          </Button>
          <Button
            variant="secondary"
            disabled={!!busy || !source.enabled || source.adapter === "uploads"}
            onClick={() =>
              run(
                "run",
                () => bff(`admin/sources/${source.id}/run`, { method: "POST" }),
                "Run queued. The GitHub workflow is starting.",
              )
            }
          >
            {busy === "run" ? <Spinner label="Starting" /> : "Run now"}
          </Button>
          <Link href={`/admin/runs?source_id=${source.id}`} className="text-sm text-link underline">
            Run history
          </Link>
        </div>
        {test && (
          <p role="status" className="rounded-md bg-muted p-3 text-sm">
            {test.error
              ? `Could not connect: ${test.error}`
              : `Reachable: ${test.reachable ? "yes" : "no"} (HTTP ${test.status}). robots.txt: HTTP ${test.robots}. ` +
                `${test.allowed_by_robots === null ? "" : test.allowed_by_robots ? "robots.txt allows our crawler." : "robots.txt DISALLOWS our crawler."}`}
          </p>
        )}
      </div>
    </details>
  );
}
