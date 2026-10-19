"use client";

/** Fire-and-forget analytics. Never throws and never blocks the UI; failures are silently dropped. */
export type TrackType =
  "page_view" | "search" | "result_click" | "resource_view" | "download_attempt" | "login_required";

const SID_KEY = "np_sid";

function sessionId(): string | undefined {
  try {
    let id = sessionStorage.getItem(SID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SID_KEY, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

export function track(
  type: TrackType,
  extra: {
    path?: string;
    paper_slug?: string;
    query?: string;
    meta?: Record<string, unknown>;
  } = {},
) {
  try {
    void fetch("/api/backend/events", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        path: extra.path ?? window.location.pathname,
        session_id: sessionId(),
        ...extra,
      }),
    }).catch(() => undefined);
  } catch {
    /* analytics must never break the page */
  }
}
