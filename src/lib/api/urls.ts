import { API_URL } from "@/lib/env";

/** Plain link target: the API answers with a 302 to a short-lived signed URL (or streams in dev). */
export const downloadUrl = (slug: string) => `${API_URL}/papers/${slug}/download`;
/** Same file, rendered inline and not counted as a download. */
export const previewUrl = (slug: string) => `${API_URL}/papers/${slug}/download?inline=true`;
export const noteDownloadUrl = (slug: string, inline = false) =>
  `${API_URL}/notes/${slug}/download${inline ? "?inline=true" : ""}`;
