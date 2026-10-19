"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { bff } from "@/services/api-client";

export interface SettingsValues {
  auto_publish_confidence: number;
  anomaly_drop_ratio: number;
  alert_recipients: string[];
  feature_flags: Record<string, boolean>;
  rate_limits: Record<string, number>;
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SettingsForm({ initial }: { initial: SettingsValues }) {
  const router = useRouter();
  const [conf, setConf] = useState(String(initial.auto_publish_confidence));
  const [drop, setDrop] = useState(String(initial.anomaly_drop_ratio));
  const [recipients, setRecipients] = useState(initial.alert_recipients.join(", "));
  const [flags, setFlags] = useState(initial.feature_flags);
  const [limits, setLimits] = useState(
    Object.fromEntries(Object.entries(initial.rate_limits).map(([k, v]) => [k, String(v)])),
  );
  const [busy, setBusy] = useState(false);

  const confN = Number(conf);
  const dropN = Number(drop);
  const confErr = !(conf !== "" && confN >= 0 && confN <= 1)
    ? "A number between 0 and 1"
    : undefined;
  const dropErr = !(drop !== "" && dropN > 0 && dropN < 1)
    ? "A number between 0 and 1 (exclusive)"
    : undefined;
  const list = recipients
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
  const mailErr = list.some((r) => !emailRe.test(r))
    ? "Every recipient must be a valid email address"
    : undefined;
  const limitErr = Object.values(limits).some((v) => !/^\d+$/.test(v) || Number(v) < 1)
    ? "Rate limits must be whole numbers of 1 or more"
    : undefined;
  const valid = !confErr && !dropErr && !mailErr && !limitErr;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    try {
      await bff("admin/settings", {
        method: "PUT",
        body: {
          auto_publish_confidence: confN,
          anomaly_drop_ratio: dropN,
          alert_recipients: list,
          feature_flags: flags,
          rate_limits: Object.fromEntries(Object.entries(limits).map(([k, v]) => [k, Number(v)])),
        },
      });
      toast.success("Settings saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save settings.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="max-w-2xl space-y-6">
      <p className="text-xs text-muted-foreground">Fields marked * are required.</p>
      <fieldset className="space-y-4 border-2 border-border bg-card p-4">
        <legend className="px-1 text-sm font-semibold">Publishing</legend>
        <Field
          id="conf"
          label="Auto-publish confidence"
          required
          error={confErr}
          hint="Papers at or above this score publish automatically; the rest go to the review queue. 0.8 needs 3 of 4 fields, 1.0 needs all four (course, term, subject, year)."
        >
          <Input
            id="conf"
            placeholder="e.g. 0.85"
            inputMode="decimal"
            value={conf}
            invalid={!!confErr}
            onChange={(e) => setConf(e.target.value)}
          />
        </Field>
        <Field
          id="drop"
          label="Source anomaly threshold"
          required
          error={dropErr}
          hint="Alert when a run finds this much fewer papers than the last one (0.5 = a drop of more than half)."
        >
          <Input
            id="drop"
            placeholder="e.g. 0.3"
            inputMode="decimal"
            value={drop}
            invalid={!!dropErr}
            onChange={(e) => setDrop(e.target.value)}
          />
        </Field>
      </fieldset>

      <fieldset className="space-y-4 border-2 border-border bg-card p-4">
        <legend className="px-1 text-sm font-semibold">Alerts</legend>
        <Field
          id="rcpt"
          label="Alert recipients"
          error={mailErr}
          hint="Comma separated email addresses."
        >
          <Input
            id="rcpt"
            placeholder="you@example.com, team@example.com"
            value={recipients}
            invalid={!!mailErr}
            onChange={(e) => setRecipients(e.target.value)}
          />
        </Field>
      </fieldset>

      <fieldset className="space-y-3 border-2 border-border bg-card p-4">
        <legend className="px-1 text-sm font-semibold">Feature flags</legend>
        {Object.entries(flags).map(([k, v]) => (
          <label key={k} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={v}
              onChange={(e) => setFlags({ ...flags, [k]: e.target.checked })}
            />{" "}
            {k.replace(/_/g, " ")}
          </label>
        ))}
      </fieldset>

      <fieldset className="space-y-3 border-2 border-border bg-card p-4">
        <legend className="px-1 text-sm font-semibold">Rate limits (reference)</legend>
        <p className="text-xs text-muted-foreground">
          Stored for the admin team. The API enforces its built-in limits today.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries(limits).map(([k, v]) => (
            <Field key={k} id={`rl-${k}`} label={k.replace(/_/g, " ")}>
              <Input
                id={`rl-${k}`}
                placeholder="Requests per minute"
                inputMode="numeric"
                value={v}
                onChange={(e) => setLimits({ ...limits, [k]: e.target.value })}
              />
            </Field>
          ))}
        </div>
        {limitErr && <p className="text-xs text-destructive">{limitErr}</p>}
      </fieldset>

      <Button type="submit" size="lg" disabled={!valid || busy} aria-disabled={!valid || busy}>
        {busy ? <Spinner label="Saving" /> : "Save settings"}
      </Button>
    </form>
  );
}
