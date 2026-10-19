"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api/client";
import { emailField, messageField } from "@/lib/validation";
import { useOnline } from "./offline-banner";
import { Select } from "@/components/ui/select";

const REASONS = [
  { value: "wrong", label: "Wrong details (year, subject, course)" },
  { value: "broken", label: "File is broken or will not open" },
  { value: "takedown", label: "I own this content, please remove it" },
  { value: "other", label: "Something else" },
] as const;

const schema = z.object({
  reason: z.enum(["wrong", "broken", "takedown", "other"]),
  email: emailField,
  details: messageField,
});
type Values = z.infer<typeof schema>;

/** Native <dialog>: focus trap, Escape to close and backdrop come from the browser. */
export function ReportDialog({ slug }: { slug: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  // Drive the native dialog from state so event handlers never touch the ref during render.
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  const online = useOnline();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, touchedFields, isValid, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { reason: "wrong", email: "", details: "" },
  });

  async function onSubmit(values: Values) {
    try {
      await apiFetch("/reports", {
        method: "POST",
        revalidate: false,
        body: { ...values, paper_slug: slug },
      });
      toast.success("Thanks, we will look into it.");
      reset();
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Flag className="size-4" aria-hidden="true" /> Report a problem
      </Button>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onMouseDown={(e) => {
          // a click on the dimmed backdrop lands on the <dialog> element itself, not on its content
          if (e.target === e.currentTarget) setOpen(false);
        }}
        aria-labelledby={`report-title-${slug}`}
        className="m-auto w-[min(32rem,calc(100vw-2rem))] border-2 border-border bg-card p-0 text-card-foreground shadow-xl backdrop:bg-black/50"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 p-5">
          <h2 id={`report-title-${slug}`} className="text-2xl">
            Report a problem
          </h2>
          <p className="text-xs text-muted-foreground">Fields marked * are required.</p>
          <Field id={`reason-${slug}`} label="What is wrong?" required>
            <Select
              id={`reason-${slug}`}
              className="h-10 w-full border-2 border-input bg-card font-medium focus-visible:shadow-hard-sm focus-visible:outline-none placeholder:font-normal placeholder:text-muted-foreground px-2 text-sm"
              {...register("reason")}
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            id={`email-${slug}`}
            label="Your email"
            required
            error={touchedFields.email ? errors.email?.message : undefined}
          >
            <Input
              id={`email-${slug}`}
              placeholder="you@example.com (optional)"
              type="email"
              autoComplete="email"
              aria-required="true"
              invalid={!!(touchedFields.email && errors.email)}
              {...register("email")}
            />
          </Field>
          <Field
            id={`details-${slug}`}
            label="Details"
            required
            error={touchedFields.details ? errors.details?.message : undefined}
          >
            <Controller
              control={control}
              name="details"
              render={({ field }) => (
                <Textarea
                  id={`details-${slug}`}
                  placeholder="What is wrong with this paper?"
                  aria-required="true"
                  invalid={!!(touchedFields.details && errors.details)}
                  {...field}
                />
              )}
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting || !online}
              aria-disabled={!isValid || isSubmitting || !online}
            >
              {isSubmitting ? <Spinner label="Sending" /> : "Send report"}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
