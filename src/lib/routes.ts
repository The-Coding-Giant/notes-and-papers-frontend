import type { PaperSummary, TermKind } from "@/lib/api/types";

const base = "/universities";

export const routes = {
  home: "/",
  universities: base,
  university: (u: string) => `${base}/${u}`,
  course: (u: string, course: string) => `${base}/${u}/${course}`,
  term: (u: string, course: string, term: string) => `${base}/${u}/${course}/${term}`,
  subject: (u: string, course: string, term: string, subject: string) =>
    `${base}/${u}/${course}/${term}/${subject}`,
  paper: (slug: string) => `/papers/${slug}`,
  download: (slug: string) => `/papers/${slug}/download`,
  exams: "/exams",
  exam: (slug: string) => `/exams/${slug}`,
  examPaper: (exam: string, slug: string) => `/exams/${exam}/${slug}`,
  search: (q?: string) => (q ? `/search?q=${encodeURIComponent(q)}` : "/search"),
};

export function termLabel(kind: TermKind | null, number: number | null) {
  if (!kind || !number) return "";
  return kind === "part"
    ? `Part ${number}`
    : kind === "year"
      ? `Year ${number}`
      : `Semester ${number}`;
}

/** Where a paper belongs: "BCA · Semester 1" for university papers, the exam name for exam/board papers. */
export function paperContext(p: PaperSummary) {
  if (p.course_name)
    return [p.course_name, termLabel(p.term_kind, p.term_number)].filter(Boolean).join(" · ");
  return p.exam_name ?? "";
}

export function yearRange(min: number | null | undefined, max: number | null | undefined) {
  if (!min && !max) return "";
  if (!min || !max || min === max) return String(min ?? max);
  return `${min}-${max}`;
}

/** The one canonical URL of a paper: under its exam for exam/board papers, /papers/<slug> for university papers. */
export function paperHref(p: {
  slug: string;
  course_slug: string | null;
  exam_slug: string | null;
}) {
  return !p.course_slug && p.exam_slug
    ? routes.examPaper(p.exam_slug, p.slug)
    : routes.paper(p.slug);
}

export function subjectHref(p: PaperSummary) {
  if (p.university_slug && p.course_slug && p.term_slug && p.subject_slug)
    return routes.subject(p.university_slug, p.course_slug, p.term_slug, p.subject_slug);
  return p.exam_slug ? routes.exam(p.exam_slug) : routes.search();
}

export function kindLabel(kind: string) {
  return (
    {
      question_paper: "Question Paper",
      solution: "Solution",
      syllabus: "Syllabus",
      notes: "Notes",
      mock_test: "Mock Test",
      answer_key: "Answer Key",
    }[kind] ?? kind
  );
}

export function parsePositiveInt(value: string | undefined, fallback = 1) {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
