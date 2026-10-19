"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track, type TrackType } from "@/lib/track";

/** Records a page view whenever the route changes. Admin pages are not tracked. */
export function PageViewTracker() {
  const path = usePathname();
  useEffect(() => {
    if (!path.startsWith("/admin")) track("page_view", { path });
  }, [path]);
  return null;
}

/** Records one event when the component mounts (e.g. a paper was viewed). */
export function TrackOnMount(props: {
  type: TrackType;
  paperSlug?: string;
  query?: string;
  meta?: Record<string, unknown>;
}) {
  const { type, paperSlug, query, meta } = props;
  useEffect(() => {
    track(type, { paper_slug: paperSlug, query, meta });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, paperSlug, query]);
  return null;
}
