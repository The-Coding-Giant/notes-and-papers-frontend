"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api/client";
import { emailField, messageField } from "@/lib/validation";
import { z } from "zod";
import { useOnline } from "./offline-banner";

const schema = z.object({ email: emailField, details: messageField });
type Values = z.infer<typeof schema>;

/** Posts to `POST /reports` with reason "takedown". Rate limited by the API. */
export function TakedownForm() {
  const online = useOnline();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, touchedFields, isValid, isSubmitting, isSubmitSuccessful },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { email: "", details: "" },
  });

  async function onSubmit(values: Values) {
    try {
      await apiFetch("/reports", {
        method: "POST",
        revalidate: false,
        body: { reason: "takedown", ...values },
      });
      toast.success("Request received. We will review it promptly.");
      reset();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <p className="text-xs text-muted-foreground">Fields marked * are required.</p>
      <Field
        id="email"
        label="Your email"
        required
        error={touchedFields.email ? errors.email?.message : undefined}
      >
        <Input
          id="email"
          placeholder="you@example.com"
          type="email"
          autoComplete="email"
          aria-required="true"
          invalid={!!(touchedFields.email && errors.email)}
          {...register("email")}
        />
      </Field>
      <Field
        id="details"
        label="Paper URL and details"
        required
        hint="Paste the page URL and explain who owns the content."
        error={touchedFields.details ? errors.details?.message : undefined}
      >
        <Controller
          control={control}
          name="details"
          render={({ field }) => (
            <Textarea
              id="details"
              placeholder="Tell us which page and why it should be removed"
              aria-required="true"
              invalid={!!(touchedFields.details && errors.details)}
              {...field}
            />
          )}
        />
      </Field>
      <Button
        type="submit"
        disabled={!isValid || isSubmitting || !online}
        aria-disabled={!isValid || isSubmitting || !online}
      >
        {isSubmitting ? <Spinner label="Sending" /> : "Submit request"}
      </Button>
      {isSubmitSuccessful && (
        <p role="status" className="text-sm text-success">
          Thank you. Your request has been received.
        </p>
      )}
    </form>
  );
}
