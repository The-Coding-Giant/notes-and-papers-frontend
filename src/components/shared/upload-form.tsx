"use client";

import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, FileUp } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { CatalogCourse, PresignOut, UploadCompleteOut } from "@/lib/api/types";
import { termLabel } from "@/lib/routes";
import { messageField } from "@/lib/validation";
import { bff } from "@/services/api-client";
import { useOnline } from "./offline-banner";
import { Select } from "@/components/ui/select";

const MAX_BYTES = 25 * 1024 * 1024;
const selectCls =
  "h-10 w-full border-2 border-input bg-card font-medium focus-visible:shadow-hard-sm focus-visible:outline-none placeholder:font-normal placeholder:text-muted-foreground px-2 text-sm";

const schema = z
  .object({
    kind: z.enum(["question_paper", "solution", "syllabus", "notes"]),
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title is too long"),
    courseId: z.string(),
    termId: z.string(),
    subjectName: z.string().trim().max(120, "Subject name is too long"),
    year: z
      .string()
      .regex(/^(19|20)\d{2}$/, "Enter a four-digit year, e.g. 2023")
      .or(z.literal("")),
    description: messageField.or(z.literal("")),
  })
  .superRefine((v, ctx) => {
    if (v.kind !== "notes" && !v.termId) {
      ctx.addIssue({
        code: "custom",
        path: ["termId"],
        message: "Choose the course and part/semester",
      });
    }
  });
type Values = z.infer<typeof schema>;

function fileProblem(file: File | null): string | undefined {
  if (!file) return "Choose a PDF file";
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))
    return "Only PDF files can be uploaded";
  if (file.size > MAX_BYTES) return "Files can be at most 25 MB";
  return undefined;
}

export function UploadForm({ catalog }: { catalog: CatalogCourse[] }) {
  const online = useOnline();
  const [file, setFile] = useState<File | null>(null);
  const [fileTouched, setFileTouched] = useState(false);
  const [done, setDone] = useState<UploadCompleteOut | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, touchedFields, isValid, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      kind: "question_paper",
      title: "",
      courseId: "",
      termId: "",
      subjectName: "",
      year: "",
      description: "",
    },
  });
  const kind = useWatch({ control, name: "kind" });
  const courseId = useWatch({ control, name: "courseId" });
  const terms = useMemo(
    () => catalog.find((c) => c.id === courseId)?.terms ?? [],
    [catalog, courseId],
  );
  const problem = fileProblem(file);
  const canSubmit = isValid && !problem && online && !isSubmitting;

  async function onSubmit(v: Values) {
    if (!file || problem) return;
    try {
      const pre = await bff<PresignOut>("uploads/presign", {
        method: "POST",
        body: { filename: file.name, size_bytes: file.size, content_type: "application/pdf" },
      });
      // Local dev storage points back at the API; send it through the BFF so the session token is attached.
      const local = new URL(pre.upload_url, window.location.origin).pathname.endsWith(
        "/uploads/local",
      );
      const put = await fetch(
        local ? `/api/backend/uploads/local?key=${encodeURIComponent(pre.key)}` : pre.upload_url,
        {
          method: "PUT",
          headers: pre.headers,
          body: file,
        },
      );
      if (!put.ok) throw new Error("The file could not be uploaded. Please try again.");
      const res = await bff<UploadCompleteOut>("uploads/complete", {
        method: "POST",
        body: {
          key: pre.key,
          title: v.title,
          kind: v.kind,
          term_id: v.termId || undefined,
          subject_name: v.subjectName || undefined,
          year: v.year ? Number(v.year) : undefined,
          description: v.description || undefined,
        },
      });
      setDone(res);
      toast.success("Uploaded. A moderator will review it soon.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  }

  if (done) {
    return (
      <div
        role="status"
        className="space-y-4 border-2 border-border bg-card p-6 shadow-hard text-center"
      >
        <CheckCircle2 className="mx-auto size-10 text-success" aria-hidden="true" />
        <h2 className="text-3xl sm:text-4xl">Thank you!</h2>
        <p className="text-sm text-muted-foreground">
          Your {done.kind === "note" ? "notes are" : "paper is"} waiting for review
          {done.duplicate_of_existing_file
            ? " (we already had this exact file, so it will be linked to it)"
            : ""}
          .
        </p>
        <div className="flex justify-center gap-2">
          <Button
            onClick={() => {
              setDone(null);
              setFile(null);
              setFileTouched(false);
              reset();
            }}
          >
            Upload another
          </Button>
          <Link
            href="/account"
            className="inline-flex h-10 items-center border-2 border-border bg-card px-4 text-sm font-bold uppercase hover:bg-primary"
          >
            Back to account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <p className="text-xs text-muted-foreground">Fields marked * are required.</p>

      <Field id="kind" label="What are you sharing?" required>
        <Select id="kind" className={selectCls} {...register("kind")}>
          <option value="question_paper">Question paper</option>
          <option value="solution">Solution</option>
          <option value="syllabus">Syllabus</option>
          <option value="notes">Notes</option>
        </Select>
      </Field>

      <Field
        id="title"
        label="Title"
        required
        error={touchedFields.title ? errors.title?.message : undefined}
        hint="e.g. BSc Part 1 Physics 2023"
      >
        <Input
          id="title"
          placeholder="e.g. Data Structures and Algorithms"
          aria-required="true"
          invalid={!!(touchedFields.title && errors.title)}
          {...register("title")}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="courseId" label="Course" required={kind !== "notes"}>
          <Select
            id="courseId"
            className={selectCls}
            {...register("courseId", {
              onChange: () => setValue("termId", "", { shouldValidate: true }),
            })}
          >
            <option value="">Select a course</option>
            {catalog.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          id="termId"
          label="Part / semester"
          required={kind !== "notes"}
          error={touchedFields.termId ? errors.termId?.message : undefined}
        >
          <Select
            id="termId"
            className={selectCls}
            disabled={!courseId}
            aria-required={kind !== "notes"}
            {...register("termId")}
          >
            <option value="">{courseId ? "Select" : "Pick a course first"}</option>
            {terms.map((t) => (
              <option key={t.id} value={t.id}>
                {termLabel(t.kind, t.number)}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="subjectName"
          label="Subject"
          error={touchedFields.subjectName ? errors.subjectName?.message : undefined}
          hint="Optional. A moderator will confirm it."
        >
          <Input
            id="subjectName"
            placeholder="e.g. Data Structures"
            disabled={!courseId}
            {...register("subjectName")}
          />
        </Field>
        <Field
          id="year"
          label="Exam year"
          error={touchedFields.year ? errors.year?.message : undefined}
        >
          <Input
            id="year"
            inputMode="numeric"
            maxLength={4}
            placeholder="2023"
            invalid={!!(touchedFields.year && errors.year)}
            {...register("year")}
          />
        </Field>
      </div>

      {kind === "notes" && (
        <Field
          id="description"
          label="Short description"
          error={touchedFields.description ? errors.description?.message : undefined}
        >
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <Textarea
                id="description"
                placeholder="A short description of these notes"
                invalid={!!(touchedFields.description && errors.description)}
                {...field}
              />
            )}
          />
        </Field>
      )}

      <Field
        id="file"
        label="PDF file"
        required
        error={fileTouched ? problem : undefined}
        hint="PDF only, up to 25 MB."
      >
        <div className="flex items-center gap-3">
          <FileUp className="size-5 text-muted-foreground" aria-hidden="true" />
          <input
            id="file"
            type="file"
            accept="application/pdf,.pdf"
            aria-required="true"
            aria-invalid={fileTouched && !!problem}
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setFileTouched(true);
            }}
            onBlur={() => setFileTouched(true)}
            className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium"
          />
        </div>
      </Field>

      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto"
        disabled={!canSubmit}
        aria-disabled={!canSubmit}
      >
        {isSubmitting ? <Spinner label="Uploading" /> : "Upload for review"}
      </Button>
      {!online && <p className="text-sm text-amber-600">You are offline. Reconnect to upload.</p>}
    </form>
  );
}
