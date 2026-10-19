"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { AdminPaper, CatalogCourse, Role } from "@/lib/api/types";
import { termLabel } from "@/lib/routes";
import { bff } from "@/services/api-client";
import { AdminAction } from "./admin-action";
import { Select } from "@/components/ui/select";

const sel =
  "h-10 w-full border-2 border-input bg-card font-medium focus-visible:shadow-hard-sm focus-visible:outline-none placeholder:font-normal placeholder:text-muted-foreground px-2 text-sm";
interface SubjectOpt {
  id: string;
  name: string;
}

export function ReviewEditor({
  paper,
  catalog,
  role,
}: {
  paper: AdminPaper;
  catalog: CatalogCourse[];
  role: Role;
}) {
  const router = useRouter();
  const initialCourse = paper.course_id ?? "";
  const [courseId, setCourseId] = useState(initialCourse);
  const [termId, setTermId] = useState(paper.term_id ?? "");
  const [subjectId, setSubjectId] = useState(paper.subject_id ?? "");
  const [subjects, setSubjects] = useState<SubjectOpt[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [f, setF] = useState({
    title: paper.title,
    year: paper.year?.toString() ?? "",
    session: paper.session ?? "",
    paper_code: paper.paper_code ?? "",
    kind: paper.kind,
    rights_status: paper.rights_status,
    meta_title: paper.meta_title ?? "",
    meta_description: paper.meta_description ?? "",
  });
  const [mergeInto, setMergeInto] = useState("");
  const [busy, setBusy] = useState(false);
  const terms = catalog.find((c) => c.id === courseId)?.terms ?? [];
  const yearOk = f.year === "" || /^(19|20)\d{2}$/.test(f.year);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  useEffect(() => {
    if (!termId) return;
    let alive = true;
    bff<{ items: SubjectOpt[] }>(`admin/subjects?term_id=${termId}&size=200`)
      .then((r) => alive && setSubjects(r.items))
      .catch(() => alive && setSubjects([]));
    return () => {
      alive = false;
    };
  }, [termId]);

  async function save(): Promise<boolean> {
    setBusy(true);
    try {
      let sid = subjectId;
      if (!sid && newSubject.trim() && termId) {
        const created = await bff<{ id: string }>("admin/subjects", {
          method: "POST",
          body: { term_id: termId, name: newSubject.trim() },
        });
        sid = created.id;
      }
      const body: Record<string, unknown> = {
        title: f.title.trim(),
        year: f.year ? Number(f.year) : null,
        session: f.session || null,
        paper_code: f.paper_code || null,
        kind: f.kind,
        meta_title: f.meta_title || null,
        meta_description: f.meta_description || null,
        ...(role === "admin" ? { rights_status: f.rights_status } : {}),
      };
      if (sid) body.subject_id = sid;
      else if (termId) body.term_id = termId;
      await bff(`admin/papers/${paper.id}`, { method: "PATCH", body });
      toast.success("Saved");
      router.refresh();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function saveAndPublish() {
    if (await save()) {
      try {
        await bff(`admin/papers/${paper.id}/publish`, { method: "POST" });
        toast.success("Published");
        router.push("/admin/review");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not publish.");
      }
    }
  }

  const canSave = f.title.trim().length > 0 && yearOk && !busy;

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="space-y-2">
        {paper.has_file ? (
          <iframe
            src={`/api/backend/admin/papers/${paper.id}/file`}
            title={`${paper.title} (PDF)`}
            className="h-[75vh] w-full border-2 border-border bg-card bg-muted"
          />
        ) : (
          <div className="border-2 border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No file is stored for this paper{paper.original_pdf_url ? " (link-only source)." : "."}
            {paper.original_pdf_url && (
              <>
                {" "}
                <a
                  className="text-link underline"
                  href={paper.original_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  Open the original
                </a>
              </>
            )}
          </div>
        )}
        {paper.content_excerpt && (
          <details className="border-2 border-border bg-card p-3 text-sm">
            <summary className="cursor-pointer font-medium">Extracted text</summary>
            <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
              {paper.content_excerpt}
            </pre>
          </details>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
        className="space-y-4"
        noValidate
      >
        <p className="text-xs text-muted-foreground">Fields marked * are required.</p>
        <Field
          id="title"
          label="Title"
          required
          error={!f.title.trim() ? "Title is required" : undefined}
        >
          <Input
            id="title"
            placeholder="e.g. Data Structures and Algorithms"
            value={f.title}
            onChange={set("title")}
            aria-required="true"
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field id="course" label="Course">
            <Select
              id="course"
              className={sel}
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setTermId("");
                setSubjectId("");
                setSubjects([]);
              }}
            >
              <option value="">Select a course</option>
              {catalog.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="term" label="Part / semester">
            <Select
              id="term"
              className={sel}
              value={termId}
              disabled={!courseId}
              onChange={(e) => {
                setTermId(e.target.value);
                setSubjectId("");
                setSubjects([]);
              }}
            >
              <option value="">Select</option>
              {terms.map((t) => (
                <option key={t.id} value={t.id}>
                  {termLabel(t.kind, t.number)}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field
          id="subject"
          label="Subject"
          hint={role === "admin" ? "Pick one, or type a new subject below." : undefined}
        >
          <Select
            id="subject"
            className={sel}
            value={subjectId}
            disabled={!termId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            <option value="">{termId ? "Select a subject" : "Pick a term first"}</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        {role === "admin" && !subjectId && termId && (
          <Field id="new-subject" label="New subject name">
            <Input
              id="new-subject"
              placeholder="New subject name"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
            />
          </Field>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <Field
            id="year"
            label="Year"
            error={!yearOk ? "Enter a four-digit year, e.g. 2023" : undefined}
          >
            <Input
              id="year"
              placeholder="e.g. 2024"
              inputMode="numeric"
              maxLength={4}
              value={f.year}
              onChange={set("year")}
              invalid={!yearOk}
            />
          </Field>
          <Field id="session" label="Session">
            <Input
              id="session"
              placeholder="e.g. Dec"
              value={f.session}
              onChange={set("session")}
            />
          </Field>
          <Field id="code" label="Paper code">
            <Input
              id="code"
              placeholder="e.g. BCA-51T-101"
              value={f.paper_code}
              onChange={set("paper_code")}
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field id="kind" label="Type">
            <Select id="kind" className={sel} value={f.kind} onChange={set("kind")}>
              <option value="question_paper">Question paper</option>
              <option value="solution">Solution</option>
              <option value="syllabus">Syllabus</option>
              <option value="notes">Notes</option>
            </Select>
          </Field>
          <Field
            id="rights"
            label="Rights"
            hint={role !== "admin" ? "Only admins can change this." : undefined}
          >
            <Select
              id="rights"
              className={sel}
              value={f.rights_status}
              disabled={role !== "admin"}
              onChange={set("rights_status")}
            >
              <option value="owned">Owned</option>
              <option value="permitted">Permitted</option>
              <option value="link_only">Link only</option>
              <option value="unknown">Unknown</option>
            </Select>
          </Field>
        </div>

        <Field id="mt" label="Meta title" hint="Up to 60 characters shows fully in Google.">
          <Input
            id="mt"
            placeholder="Page title shown in search results"
            value={f.meta_title}
            maxLength={70}
            onChange={set("meta_title")}
          />
        </Field>
        <Field id="md" label="Meta description">
          <Input
            id="md"
            placeholder="One or two sentences for search results"
            value={f.meta_description}
            maxLength={170}
            onChange={set("meta_description")}
          />
        </Field>

        <div className="flex flex-wrap gap-2 border-t pt-4">
          <Button type="submit" variant="secondary" disabled={!canSave} aria-disabled={!canSave}>
            {busy ? <Spinner label="Saving" /> : "Save"}
          </Button>
          {paper.status !== "published" && (
            <Button
              type="button"
              onClick={saveAndPublish}
              disabled={!canSave}
              aria-disabled={!canSave}
            >
              Save &amp; publish
            </Button>
          )}
          {paper.status === "published" && (
            <AdminAction
              label="Unpublish"
              path={`admin/papers/${paper.id}/unpublish`}
              confirm="Take this paper off the site?"
              variant="destructive"
              size="md"
            />
          )}
          {paper.status !== "rejected" && (
            <AdminAction
              label="Reject"
              path={`admin/papers/${paper.id}/reject`}
              confirm="Reject this paper?"
              variant="outline"
              size="md"
              onDone={() => router.push("/admin/review")}
            />
          )}
        </div>

        <details className="border-2 border-border bg-card p-3 text-sm">
          <summary className="cursor-pointer font-medium">Merge duplicate</summary>
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground">
              Reject this paper and redirect its URL to the paper whose id you paste (open that
              paper and copy the id from its address).
            </p>
            <Input
              aria-label="Paper id to merge into"
              placeholder="Paper id"
              value={mergeInto}
              onChange={(e) => setMergeInto(e.target.value.trim())}
            />
            <AdminAction
              label="Merge"
              path={`admin/papers/${paper.id}/merge`}
              body={{ into_id: mergeInto }}
              disabled={!/^[0-9a-f-]{36}$/i.test(mergeInto)}
              confirm="Merge this paper into the other one?"
              onDone={() => router.push("/admin/review")}
            />
          </div>
        </details>
      </form>
    </div>
  );
}
