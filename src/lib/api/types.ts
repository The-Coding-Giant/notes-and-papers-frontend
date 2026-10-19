/**
 * API contract between this frontend and the FastAPI backend (/api/v1).
 * The endpoint list comes from docs/projectflow.md section 12; the response SHAPES below are the
 * frontend's proposal and must be mirrored by the backend's Pydantic schemas (see .agents/decisions.md ADR-004).
 */

export type PaperKind =
  "question_paper" | "solution" | "syllabus" | "notes" | "mock_test" | "answer_key";
export type RightsStatus = "owned" | "permitted" | "link_only" | "unknown";
export type TermKind = "part" | "semester" | "year";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export interface PaperSummary {
  slug: string;
  title: string;
  year: number | null;
  session: string | null;
  paper_code: string | null;
  kind: PaperKind;
  /** Course-tree papers (university) carry course/term/subject; exam and board papers carry exam_* instead. */
  course_name: string | null;
  course_slug: string | null;
  term_kind: TermKind | null;
  term_number: number | null;
  term_slug: string | null;
  subject_name: string | null;
  subject_slug: string | null;
  exam_name: string | null;
  exam_slug: string | null;
  section: string | null;
  language: string | null;
  thumbnail_url: string | null;
  updated_at: string;
}

export interface PaperDetail extends PaperSummary {
  meta_title: string | null;
  meta_description: string | null;
  content_excerpt: string | null;
  rights_status: RightsStatus;
  pages: number | null;
  download_count: number;
  view_count: number;
  published_at: string | null;
  related: PaperSummary[];
  other_years: PaperSummary[];
}

export interface TermSummary {
  slug: string;
  kind: TermKind;
  number: number;
  paper_count: number;
  subject_count: number;
}

export interface CourseSummary {
  slug: string;
  name: string;
  level: "UG" | "PG" | "DIPLOMA" | "OTHER" | null;
  scheme: "annual" | "semester" | null;
  description: string | null;
  paper_count: number;
}

export interface UniversityDetail {
  slug: string;
  name: string;
  website: string | null;
  description: string | null;
  paper_count: number;
  courses: CourseSummary[];
}

export interface CourseDetail extends CourseSummary {
  year_min: number | null;
  year_max: number | null;
  terms: TermSummary[];
}

export interface SubjectSummary {
  slug: string;
  name: string;
  paper_code: string | null;
  paper_count: number;
  year_min: number | null;
  year_max: number | null;
}

export interface TermDetail {
  course: { slug: string; name: string };
  term: TermSummary;
  paper_count: number;
  year_min: number | null;
  year_max: number | null;
  subjects: SubjectSummary[];
}

export interface SubjectDetail {
  course: { slug: string; name: string };
  term: TermSummary;
  subject: SubjectSummary;
  papers: PaperSummary[];
}

export interface FacetBucket {
  value: string;
  label: string;
  count: number;
}

export interface SearchResponse extends Paginated<PaperSummary> {
  facets: { courses: FacetBucket[]; years: FacetBucket[]; kinds: FacetBucket[] };
  suggestions: string[];
}

export interface SitemapEntry {
  /** Site-relative path, e.g. `/papers/some-slug`. */
  path: string;
  lastmod: string;
}

export interface SitemapPage {
  items: SitemapEntry[];
  total_pages: number;
}

export interface ErrorBody {
  error?: { code?: string; message?: string };
  detail?: string;
}

/* ---------- signed-in user ---------- */

export type Role = "user" | "moderator" | "admin";

export interface Me {
  id: string;
  email: string | null;
  display_name: string | null;
  role: Role;
  avatar: string | null;
  phone: string | null;
  college: string | null;
  state: string | null;
  city: string | null;
  course: string | null;
}

export interface DownloadItem {
  paper: PaperSummary;
  downloaded_at: string;
}

export interface PresignOut {
  key: string;
  upload_url: string;
  method: "PUT";
  headers: Record<string, string>;
  max_bytes: number;
}

export interface UploadCompleteOut {
  paper_id: string;
  kind: "paper" | "note";
  status: string;
  duplicate_of_existing_file: boolean;
}

export interface CatalogTerm {
  id: string;
  slug: string;
  kind: TermKind;
  number: number;
}

export interface CatalogCourse {
  id: string;
  slug: string;
  name: string;
  level: string | null;
  terms: CatalogTerm[];
}

export interface NoteSummary {
  slug: string;
  title: string;
  description: string | null;
  course_name: string | null;
  course_slug: string | null;
  term_slug: string | null;
  subject_name: string | null;
  created_at: string;
}

/* ---------- admin ---------- */

export type PaperStatus = "pending_review" | "published" | "unpublished" | "rejected";

export interface AdminPaper {
  id: string;
  slug: string;
  title: string;
  status: PaperStatus;
  confidence: number | null;
  year: number | null;
  session: string | null;
  paper_code: string | null;
  kind: PaperKind;
  course_id: string | null;
  course_name: string | null;
  term_id: string | null;
  term_slug: string | null;
  subject_id: string | null;
  subject_name: string | null;
  source_id: string | null;
  source_name: string | null;
  source_url: string;
  original_pdf_url: string | null;
  has_file: boolean;
  preview_url: string | null;
  rights_status: RightsStatus;
  missing_from_source: boolean;
  download_count: number;
  meta_title: string | null;
  meta_description: string | null;
  content_excerpt: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface AdminSource {
  id: string;
  name: string;
  adapter: string;
  base_url: string;
  enabled: boolean;
  rights_status: RightsStatus;
  respect_robots: boolean;
  permission_note: string | null;
  schedule_cron: string;
  rate_per_sec: number;
  config: Record<string, unknown>;
  last_run_at: string | null;
  last_run_status: string | null;
}

export interface AdminRun {
  id: string;
  source_id: string;
  source_name: string | null;
  status: string;
  trigger: string;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  pages_crawled: number;
  new_count: number;
  changed_count: number;
  removed_count: number;
  failed_count: number;
  bytes_stored: number;
  error: string | null;
  duration_seconds: number | null;
  log?: { t?: string; level?: string; msg: string }[];
}

export interface AdminReport {
  id: string;
  paper_id: string | null;
  paper_slug: string | null;
  reason: string | null;
  details: string | null;
  email: string | null;
  status: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  display_name: string | null;
  role: Role;
  is_banned: boolean;
  created_at: string;
}

export interface AdminOverview {
  kpis: Record<string, number>;
  last_run: AdminRun | null;
  charts: Record<"new_papers" | "searches" | "downloads", { date: string; count: number }[]>;
}

export interface AuditEntry {
  id: number;
  actor_id: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  diff: Record<string, unknown> | null;
  created_at: string;
}

export interface AdminCourse {
  id: string;
  slug: string;
  name: string;
  level: string | null;
  scheme: string | null;
  aliases: string[];
  terms: { id: string; slug: string; kind: TermKind; number: number }[];
}

export interface ExamSummary {
  slug: string;
  name: string;
  kind: "exam" | "board" | "university_site";
  source_url: string | null;
  paper_count: number;
  year_min: number | null;
  year_max: number | null;
}

export interface ExamSection {
  name: string;
  paper_count: number;
  papers: PaperSummary[];
}

export interface ExamDetail extends ExamSummary {
  sections: ExamSection[];
}
