import { cache } from "react";
import { getFeatures, listNotes } from "./public";

/** What the site can currently do. Used to hide navigation for features that are switched off or empty. */
export const getNavFlags = cache(async () => {
  const [features, notes] = await Promise.allSettled([getFeatures(), listNotes({ size: 1 })]);
  return {
    uploads: features.status === "fulfilled" ? features.value.uploads : false,
    notes: notes.status === "fulfilled" ? notes.value.total > 0 : false,
  };
});
