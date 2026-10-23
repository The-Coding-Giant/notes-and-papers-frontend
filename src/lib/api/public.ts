import { apiFetch, apiFetchOrNull } from "./client";
import type {
  CatalogCourse,
  CourseDetail,
  ExamDetail,
  ExamSummary,
  NoteSummary,
  Paginated,
  PaperDetail,
  PaperSummary,
  SearchResponse,
  SitemapPage,
  SubjectDetail,
  TermDetail,
  UniversityDetail,
  UniversityListItem,
} from "./types";

export const tags = {
  home: "home",
  paper: (slug: string) => `paper:${slug}`,
  subject: (slug: string) => `subject:${slug}`,
  term: (slug: string) => `term:${slug}`,
  course: (slug: string) => `course:${slug}`,
};

export const getUniversities = () =>
  apiFetch<UniversityListItem[]>("/universities", { tags: [tags.home], revalidate: 3600 });

export const getUniversity = (u: string) =>
  apiFetchOrNull<UniversityDetail>(`/universities/${u}`, { tags: [tags.home] });

export const getCourse = (u: string, course: string) =>
  apiFetchOrNull<CourseDetail>(`/courses/${u}/${course}`, { tags: [tags.course(course)] });

export const getTerm = (u: string, course: string, term: string) =>
  apiFetchOrNull<TermDetail>(`/terms/${u}/${course}/${term}`, {
    tags: [tags.term(`${course}/${term}`), tags.course(course)],
  });

export const getSubject = (u: string, course: string, term: string, subject: string) =>
  apiFetchOrNull<SubjectDetail>(`/subjects/${u}/${course}/${term}/${subject}`, {
    tags: [tags.subject(`${course}/${term}/${subject}`), tags.term(`${course}/${term}`)],
  });

export const getPaper = (slug: string) =>
  apiFetchOrNull<PaperDetail>(`/papers/${slug}`, { tags: [tags.paper(slug)] });

/** Renamed slugs: `{ new_slug }` or null. The page then 301s to the new URL. */
export const getPaperRedirect = (slug: string) =>
  apiFetchOrNull<{ new_slug: string }>(`/redirects/paper/${slug}`, { tags: [tags.paper(slug)] });

export interface ListParams {
  course?: string;
  term?: string;
  subject?: string;
  year?: string;
  kind?: string;
  q?: string;
  sort?: "latest" | "year" | "popular" | "relevance";
  page?: number;
  size?: number;
}

export const listPapers = (params: ListParams) =>
  apiFetch<Paginated<PaperSummary>>("/papers", {
    query: { ...params },
    tags: [tags.home],
    revalidate: 300,
  });

export const getLatestPapers = (size = 8) =>
  apiFetch<Paginated<PaperSummary>>("/papers", {
    query: { page: 1, size, sort: "latest" },
    tags: [tags.home],
    revalidate: 3600,
  });

export interface SearchParams {
  q?: string;
  course?: string;
  term?: string;
  year?: string;
  kind?: string;
  page?: number;
  size?: number;
}

/** Dynamic: never cached, search results must be fresh and are logged by the API. */
export const searchPapers = (params: SearchParams) =>
  apiFetch<SearchResponse>("/search", { query: { ...params }, revalidate: false });

export const getSitemapPage = (type: string, page: number) =>
  apiFetch<SitemapPage>(`/seo/sitemap/${type}`, { query: { page }, revalidate: 3600 });

export { downloadUrl } from "./urls";

export const getCatalog = () => apiFetch<CatalogCourse[]>("/catalog", { revalidate: 3600 });

export const listNotes = (params: { q?: string; page?: number; size?: number }) =>
  apiFetch<Paginated<NoteSummary>>("/notes", { query: params, tags: ["notes"], revalidate: 3600 });

export const getNote = (slug: string) =>
  apiFetchOrNull<NoteSummary>(`/notes/${slug}`, {
    tags: ["notes", `note:${slug}`],
    revalidate: 3600,
  });

export interface Features {
  uploads: boolean;
  stored_files: boolean;
  link_only_mode: boolean;
}

/** What the deployment supports. Falls back to "paused" so a broken API never advertises a feature that fails. */
export const getFeatures = (): Promise<Features> =>
  apiFetch<Features>("/features", { revalidate: 60 }).catch(() => ({
    uploads: false,
    stored_files: false,
    link_only_mode: true,
  }));

export const getExams = (kind?: "exam" | "board" | "university_site") =>
  apiFetch<ExamSummary[]>("/exams", { query: { kind }, tags: [tags.home], revalidate: 3600 });

export const getExam = (slug: string) =>
  apiFetchOrNull<ExamDetail>(`/exams/${slug}`, {
    tags: [tags.home, `exam:${slug}`],
    revalidate: 3600,
  });

export interface SiteStats {
  papers_total: number;
  university_papers: number;
  exam_papers: number;
  board_papers: number;
  courses: number;
  exams: number;
}

export const getStats = () => apiFetch<SiteStats>("/stats", { tags: [tags.home], revalidate: 600 });
