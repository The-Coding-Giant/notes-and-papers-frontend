"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { bff } from "@/services/api-client";
import { Select } from "@/components/ui/select";

const sel =
  "h-10 w-full border-2 border-input bg-card font-medium focus-visible:shadow-hard-sm focus-visible:outline-none placeholder:font-normal placeholder:text-muted-foreground px-2 text-sm";

export function NewSourceForm({ adapters }: { adapters: string[] }) {
  const router = useRouter();
  const [v, setV] = useState({ name: "", adapter: adapters[0] ?? "generic_site", base_url: "" });
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  let urlOk = false;
  try {
    urlOk = ["http:", "https:"].includes(new URL(v.base_url).protocol);
  } catch {
    urlOk = false;
  }
  const valid = v.name.trim().length > 1 && urlOk;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    try {
      await bff("admin/sources", { method: "POST", body: v });
      toast.success("Source added (disabled). Review it, then enable it.");
      setV({ ...v, name: "", base_url: "" });
      setTouched(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add the source.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className="border-2 border-border bg-card">
      <summary className="cursor-pointer p-4 font-medium">Add a source</summary>
      <form onSubmit={submit} noValidate className="grid gap-3 border-t p-4 md:grid-cols-3">
        <Field
          id="ns-name"
          label="Name"
          required
          error={touched && v.name.trim().length < 2 ? "Enter a name" : undefined}
        >
          <Input
            id="ns-name"
            placeholder="e.g. UOR Online"
            value={v.name}
            onChange={(e) => setV({ ...v, name: e.target.value })}
            onBlur={() => setTouched(true)}
          />
        </Field>
        <Field id="ns-adapter" label="Adapter" required>
          <Select
            id="ns-adapter"
            className={sel}
            value={v.adapter}
            onChange={(e) => setV({ ...v, adapter: e.target.value })}
          >
            {adapters.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          id="ns-url"
          label="Base URL"
          required
          error={touched && !urlOk ? "Enter a URL starting with https://" : undefined}
        >
          <Input
            id="ns-url"
            placeholder="https://www.example.com/"
            type="url"
            value={v.base_url}
            onChange={(e) => setV({ ...v, base_url: e.target.value })}
            onBlur={() => setTouched(true)}
          />
        </Field>
        <div className="md:col-span-3">
          <Button type="submit" disabled={!valid || busy} aria-disabled={!valid || busy}>
            Add source
          </Button>
          <span className="ml-3 text-xs text-muted-foreground">New sources start disabled.</span>
        </div>
      </form>
    </details>
  );
}
