"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { termLabel } from "@/lib/routes";
import type { AdminCourse } from "@/lib/api/types";
import { bff } from "@/services/api-client";
import { Select } from "@/components/ui/select";

function useSave() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function save(path: string, method: "PATCH" | "POST", body: unknown, ok: string) {
    setBusy(true);
    try {
      await bff(path, { method, body });
      toast.success(ok);
      router.refresh();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  return { busy, save };
}

/** Inline rename. Changing the name changes the slug, and the API records a redirect from the old one. */
export function SubjectRename({ id, name }: { id: string; name: string }) {
  const [value, setValue] = useState(name);
  const { busy, save } = useSave();
  const changed = value.trim() && value.trim() !== name;
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (changed)
          void save(`admin/subjects/${id}`, "PATCH", { name: value.trim() }, "Subject renamed");
      }}
    >
      <label className="sr-only" htmlFor={`sub-${id}`}>
        Subject name
      </label>
      <Input
        id={`sub-${id}`}
        placeholder="Subject name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 min-w-48"
      />
      <Button type="submit" size="sm" variant="secondary" disabled={!changed || busy}>
        Rename
      </Button>
    </form>
  );
}

export function CourseAliases({ course }: { course: AdminCourse }) {
  const [value, setValue] = useState(course.aliases.join(", "));
  const { busy, save } = useSave();
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        void save(
          `admin/courses/${course.id}`,
          "PATCH",
          {
            aliases: value
              .split(",")
              .map((a) => a.trim())
              .filter(Boolean),
          },
          "Aliases saved",
        );
      }}
    >
      <label className="sr-only" htmlFor={`al-${course.id}`}>
        Aliases for {course.name}
      </label>
      <Input
        id={`al-${course.id}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Comma separated, e.g. bachelor of arts, b.a."
        className="h-9"
      />
      <Button type="submit" size="sm" variant="secondary" disabled={busy}>
        Save
      </Button>
    </form>
  );
}

export function AddSubject({ courses }: { courses: AdminCourse[] }) {
  const [termId, setTermId] = useState("");
  const [name, setName] = useState("");
  const { busy, save } = useSave();
  const valid = termId && name.trim().length > 1;
  return (
    <form
      className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      onSubmit={async (e) => {
        e.preventDefault();
        if (
          valid &&
          (await save(
            "admin/subjects",
            "POST",
            { term_id: termId, name: name.trim() },
            "Subject added",
          ))
        )
          setName("");
      }}
    >
      <Field id="as-term" label="Part / semester" required>
        <Select
          id="as-term"
          className="h-10 w-full border-2 border-input bg-card font-medium focus-visible:shadow-hard-sm focus-visible:outline-none placeholder:font-normal placeholder:text-muted-foreground px-2 text-sm"
          value={termId}
          onChange={(e) => setTermId(e.target.value)}
        >
          <option value="">Select</option>
          {courses.map((c) => (
            <optgroup key={c.id} label={c.name}>
              {c.terms.map((t) => (
                <option key={t.id} value={t.id}>
                  {c.name} {termLabel(t.kind, t.number)}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </Field>
      <Field id="as-name" label="Subject name" required>
        <Input
          id="as-name"
          placeholder="Subject name, e.g. Data Structures"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>
      <Button type="submit" disabled={!valid || busy} aria-disabled={!valid || busy}>
        Add subject
      </Button>
    </form>
  );
}
