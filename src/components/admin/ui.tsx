import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Select as UiSelect } from "@/components/ui/select";

const TONES: Record<string, string> = {
  published: "bg-success/15 text-success",
  succeeded: "bg-success/15 text-success",
  resolved: "bg-success/15 text-success",
  pending_review: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  queued: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  running: "bg-primary/15 text-link",
  open: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  partial: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  failed: "bg-destructive/15 text-destructive",
  rejected: "bg-destructive/15 text-destructive",
  unpublished: "bg-muted text-muted-foreground",
  dismissed: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={cn("whitespace-nowrap", TONES[status])}>{status.replace(/_/g, " ")}</Badge>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "warn" | "bad";
}) {
  return (
    <Card className="p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-3xl font-bold tabular-nums",
          tone === "warn" && "text-amber-600 dark:text-amber-400",
          tone === "bad" && "text-destructive",
        )}
      >
        {typeof value === "number" ? value.toLocaleString("en-IN") : value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}

/** Tiny dependency-free bar chart with a text summary for screen readers. */
export function BarChart({
  title,
  data,
}: {
  title: string;
  data: { date: string; count: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((a, d) => a + d.count, 0);
  const w = 100 / Math.max(1, data.length);
  return (
    <Card className="p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <span className="text-xs text-muted-foreground">
          {total.toLocaleString("en-IN")} in {data.length} days
        </span>
      </div>
      <svg
        viewBox="0 0 100 32"
        preserveAspectRatio="none"
        role="img"
        aria-label={`${title}: ${total} in the last ${data.length} days`}
        className="mt-3 h-24 w-full"
      >
        {data.map((d, i) => {
          const h = (d.count / max) * 30;
          return (
            <rect
              key={d.date}
              x={i * w + w * 0.15}
              y={31 - h}
              width={w * 0.7}
              height={Math.max(h, d.count ? 0.8 : 0.3)}
              rx={0.4}
              className="fill-primary/80"
            >
              <title>{`${d.date}: ${d.count}`}</title>
            </rect>
          );
        })}
      </svg>
    </Card>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-10 flex flex-wrap items-end justify-between gap-5">
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </header>
  );
}

export function SearchForm({
  action,
  q,
  placeholder = "Search",
  hidden = {},
  children,
}: {
  action: string;
  q?: string;
  placeholder?: string;
  hidden?: Record<string, string | undefined>;
  children?: React.ReactNode;
}) {
  return (
    <form action={action} role="search" className="mb-4 flex flex-wrap items-center gap-2">
      {Object.entries(hidden).map(([k, v]) =>
        v ? <input key={k} type="hidden" name={k} value={v} /> : null,
      )}
      <label htmlFor="admin-q" className="sr-only">
        {placeholder}
      </label>
      <input
        id="admin-q"
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        maxLength={120}
        className="h-10 min-w-48 flex-1 border-2 border-input bg-card font-medium focus-visible:shadow-hard-sm focus-visible:outline-none placeholder:font-normal placeholder:text-muted-foreground px-3 text-sm"
      />
      {children}
      <button
        type="submit"
        className="h-10 border-2 border-border bg-primary px-4 text-xs font-bold uppercase tracking-wide text-primary-foreground shadow-hard-sm hover:shadow-hard"
      >
        Apply
      </button>
    </form>
  );
}

export function Select({
  name,
  value,
  options,
  label,
}: {
  name: string;
  value?: string;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <>
      <label htmlFor={`f-${name}`} className="sr-only">
        {label}
      </label>
      <UiSelect
        id={`f-${name}`}
        name={name}
        defaultValue={value ?? ""}
        className="h-10 border-2 border-input bg-card font-medium focus-visible:shadow-hard-sm focus-visible:outline-none placeholder:font-normal placeholder:text-muted-foreground px-2 text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </UiSelect>
    </>
  );
}

export function fmtDate(v: string | null | undefined) {
  return v ? new Date(v).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "-";
}
