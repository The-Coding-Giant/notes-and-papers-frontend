"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type {
  ExamSummary,
  Paginated,
  PaperSummary,
  SearchResponse,
  UniversityListItem,
} from "@/lib/api/types";
import {
  fetchUniversities,
  fetchExams,
  fetchPapers,
  fetchSearch,
  type SearchQuery,
} from "@/services/queries";

/**
 * `initial` is the server-rendered copy (so the HTML has real content for search engines and no-JS visitors).
 * `refetchOnMount: "always"` then asks the JSON API for fresh data as soon as the page is interactive.
 */
export function useUniversities(initial?: UniversityListItem[] | null) {
  return useQuery({
    queryKey: ["universities"],
    queryFn: ({ signal }) => fetchUniversities(signal),
    initialData: initial ?? undefined,
    refetchOnMount: "always",
    staleTime: 0,
  });
}

export function useExams(kind: ExamSummary["kind"] | undefined, initial?: ExamSummary[] | null) {
  return useQuery({
    queryKey: ["exams", kind ?? "all"],
    queryFn: ({ signal }) => fetchExams(kind, signal),
    initialData: initial ?? undefined,
    refetchOnMount: "always",
    staleTime: 0,
  });
}

export function useLatestPapers(size: number, initial?: Paginated<PaperSummary> | null) {
  return useQuery({
    queryKey: ["papers", "latest", size],
    queryFn: ({ signal }) => fetchPapers({ sort: "latest", page: 1, size }, signal),
    initialData: initial ?? undefined,
    refetchOnMount: "always",
    staleTime: 0,
  });
}

export function useSearch(params: SearchQuery, enabled: boolean) {
  return useQuery<SearchResponse>({
    queryKey: ["search", params],
    queryFn: ({ signal }) => fetchSearch(params, signal),
    enabled,
    placeholderData: keepPreviousData, // keep showing the old results while the next page loads
    staleTime: 30_000,
  });
}
