"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { Me } from "@/lib/api/types";
import { AVATAR_CHOICES } from "@/lib/avatars";
import { INDIAN_STATES } from "@/lib/india";
import { cn } from "@/lib/utils";
import { bff } from "@/services/api-client";
import { Avatar } from "./avatar";

const PHONE = /^\+?[0-9 ()-]{7,20}$/;

/** Edit the optional profile: avatar, name, phone, college, state, city, course. Saved with PATCH /me. */
export function ProfileForm({ me }: { me: Me }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [v, setV] = useState({
    display_name: me.display_name ?? "",
    avatar: me.avatar ?? "",
    phone: me.phone ?? "",
    college: me.college ?? "",
    state: me.state ?? "",
    city: me.city ?? "",
    course: me.course ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setV((p) => ({ ...p, [k]: e.target.value }));
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  const nameError = !v.display_name.trim() ? "Please enter your name." : undefined;
  const phoneError =
    v.phone && !PHONE.test(v.phone)
      ? "Enter a valid phone number, e.g. +91 98765 43210."
      : undefined;
  const invalid = Boolean(nameError || phoneError);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ display_name: true, phone: true });
    if (invalid) return toast.error("Please fix the highlighted fields.");
    setBusy(true);
    try {
      await bff("/me", { method: "PATCH", body: v });
      await qc.invalidateQueries({ queryKey: ["me"] });
      router.refresh();
      toast.success("Profile saved");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not save your profile. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} noValidate className="space-y-10">
      <fieldset className="space-y-4">
        <legend className="mb-4 text-3xl">Choose your avatar</legend>
        <div className="flex items-center gap-4">
          <Avatar value={v.avatar} label="Selected avatar" className="size-24 shadow-hard" />
          <p className="max-w-sm text-sm text-muted-foreground">
            Pick a cartoon avatar. It shows next to your name across the site.
            {v.avatar && (
              <button
                type="button"
                onClick={() => setV((p) => ({ ...p, avatar: "" }))}
                className="ml-2 font-bold uppercase text-link underline"
              >
                Remove
              </button>
            )}
          </p>
        </div>
        <ul className="scroll-slim grid max-h-72 grid-cols-4 gap-3 overflow-y-auto border-2 border-border bg-card p-3 sm:grid-cols-6 lg:grid-cols-8">
          {AVATAR_CHOICES.map((a) => {
            const on = v.avatar === a;
            return (
              <li key={a}>
                <button
                  type="button"
                  aria-pressed={on}
                  aria-label={`Use avatar ${a.replace(":", " ")}`}
                  onClick={() => setV((p) => ({ ...p, avatar: a }))}
                  className={cn(
                    "relative block w-full border-2 border-transparent transition-transform hover:-translate-y-0.5 hover:border-border",
                    on && "border-border shadow-hard-sm",
                  )}
                >
                  <Avatar value={a} className="aspect-square w-full border-0" />
                  {on && (
                    <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center border-2 border-border bg-accent">
                      <Check className="size-3" aria-hidden="true" />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-4 text-3xl">About you</legend>
        <p className="text-xs text-muted-foreground">Everything except your name is optional.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="p-name"
            label="Full name"
            required
            error={touched.display_name ? nameError : undefined}
          >
            <Input
              id="p-name"
              placeholder="Your full name"
              autoComplete="name"
              maxLength={80}
              value={v.display_name}
              onChange={set("display_name")}
              onBlur={blur("display_name")}
              invalid={!!(touched.display_name && nameError)}
            />
          </Field>
          <Field
            id="p-phone"
            label="Phone number"
            error={touched.phone ? phoneError : undefined}
            hint="Optional. Never shown publicly."
          >
            <Input
              id="p-phone"
              type="tel"
              inputMode="tel"
              placeholder="+91 98765 43210"
              autoComplete="tel"
              maxLength={20}
              value={v.phone}
              onChange={set("phone")}
              onBlur={blur("phone")}
              invalid={!!(touched.phone && phoneError)}
            />
          </Field>
          <Field id="p-college" label="College or university" className="sm:col-span-2">
            <Input
              id="p-college"
              placeholder="e.g. University of Rajasthan, Jaipur"
              maxLength={120}
              value={v.college}
              onChange={set("college")}
            />
          </Field>
          <Field id="p-course" label="Course or exam you are preparing for">
            <Input
              id="p-course"
              placeholder="e.g. BCA 3rd year, UPSC, NEET"
              maxLength={80}
              value={v.course}
              onChange={set("course")}
            />
          </Field>
          <Field id="p-state" label="State">
            <Select id="p-state" value={v.state} onChange={set("state")}>
              <option value="">Select your state</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="p-city" label="City">
            <Input
              id="p-city"
              placeholder="e.g. Jaipur"
              autoComplete="address-level2"
              maxLength={60}
              value={v.city}
              onChange={set("city")}
            />
          </Field>
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? <Spinner label="Saving" /> : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
