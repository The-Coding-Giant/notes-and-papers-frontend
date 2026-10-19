"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarkSlugs, useToggleBookmark } from "@/hooks/use-bookmarks";
import { useMe } from "@/hooks/use-me";

export function BookmarkButton({ slug }: { slug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: me, isPending } = useMe();
  const { data: saved } = useBookmarkSlugs();
  const toggle = useToggleBookmark(slug);
  const isSaved = saved?.has(slug) ?? false;

  function onClick() {
    if (!me) return router.push(`/login?next=${encodeURIComponent(pathname)}`);
    toggle.mutate(!isSaved);
  }

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={onClick}
      disabled={isPending || toggle.isPending}
      aria-pressed={isSaved}
      className="w-full sm:w-auto"
    >
      {isSaved ? (
        <BookmarkCheck className="size-4" aria-hidden="true" />
      ) : (
        <Bookmark className="size-4" aria-hidden="true" />
      )}
      {isSaved ? "Bookmarked" : "Bookmark"}
    </Button>
  );
}
