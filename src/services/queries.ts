/**
 * Browser-side data fetchers for public data. Each one is a plain request to this site's JSON API
 * (`/api/*`, see src/app/api) and returns the parsed response, so the request/response cycle is visible in
 * the browser's Network tab and easy to follow.
 */
import type { ListParams } from "@/lib/api/public";
import type {
  ExamSummary,
  Paginated,
  PaperSummary,
  SearchResponse,
  UniversityDetail,
} from "@/lib/api/types";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

function qs(params: Record<string, string | number | undefined | null>) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") u.set(k, String(v));
  }
  const s = u.toString();
  return s ? `?${s}` : "";
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" }, signal });
  if (!res.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      message = ((await res.json()) as { error?: { message?: string } }).error?.message ?? message;
    } catch {
      /* non-JSON body */
    }
    throw new HttpError(res.status, message);
  }
  return (await res.json()) as T;
}

/** GET /api/courses */
export const fetchCourses = (signal?: AbortSignal) =>
  getJson<UniversityDetail>("/api/courses", signal);

/** GET /api/exams */
export const fetchExams = (kind?: ExamSummary["kind"], signal?: AbortSignal) =>
  getJson<ExamSummary[]>(`/api/exams${qs({ kind })}`, signal);

/** GET /api/papers */
export const fetchPapers = (params: ListParams, signal?: AbortSignal) =>
  getJson<Paginated<PaperSummary>>(`/api/papers${qs({ ...params })}`, signal);

export interface SearchQuery {
  q?: string;
  course?: string;
  year?: string;
  kind?: string;
  page?: number;
  size?: number;
}

/** GET /api/search */
export const fetchSearch = (params: SearchQuery, signal?: AbortSignal) =>
  getJson<SearchResponse>(`/api/search${qs({ ...params })}`, signal);
