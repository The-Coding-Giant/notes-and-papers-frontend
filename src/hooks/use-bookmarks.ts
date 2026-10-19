"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Paginated, PaperSummary } from "@/lib/api/types";
import { bff } from "@/services/api-client";
import { useMe } from "./use-me";

/** Slugs the user has bookmarked (first 100), for toggling hearts without a request per card. */
export function useBookmarkSlugs() {
  const { data: me } = useMe();
  return useQuery({
    queryKey: ["bookmarks", me?.id],
    enabled: Boolean(me),
    queryFn: async () => {
      const page = await bff<Paginated<PaperSummary>>("me/bookmarks?size=100");
      return new Set(page.items.map((p) => p.slug));
    },
  });
}

export function useToggleBookmark(slug: string) {
  const qc = useQueryClient();
  const { data: me } = useMe();
  return useMutation({
    mutationFn: async (add: boolean) => {
      if (add) await bff("me/bookmarks", { method: "POST", body: { paper_slug: slug } });
      else await bff(`me/bookmarks/${encodeURIComponent(slug)}`, { method: "DELETE" });
      return add;
    },
    onSuccess: (added) => {
      qc.setQueryData<Set<string>>(["bookmarks", me?.id], (old) => {
        const next = new Set(old ?? []);
        if (added) next.add(slug);
        else next.delete(slug);
        return next;
      });
      toast.success(added ? "Saved to your bookmarks" : "Removed from bookmarks");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update bookmarks."),
  });
}
