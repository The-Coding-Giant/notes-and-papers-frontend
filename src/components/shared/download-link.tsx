"use client";

import { useState } from "react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useMe } from "@/hooks/use-me";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";

/**
 * The download button. Signed in: one click gets the PDF straight onto the device, with a "Getting your PDF" state while
 * the file is fetched (the first download of a paper can take a few seconds). Signed out: the link goes to the login page
 * and comes back to the paper afterwards. Also records a "download_attempt" analytics event.
 */
export function DownloadLink({
  slug,
  href,
  children,
}: {
  slug: string;
  href: string;
  children: React.ReactNode;
}) {
  const { data: me } = useMe();
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);

  async function getPdf(e: React.MouseEvent<HTMLAnchorElement>) {
    track("download_attempt", { paper_slug: slug });
    if (!me) {
      toast.info("Log in to download this paper. We will bring you back here.");
      return; // the link itself takes them to the login page
    }
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setSlow(false);
    const wait = setTimeout(() => setSlow(true), 5000);
    try {
      const res = await fetch(href, { cache: "no-store", credentials: "same-origin" });
      if (res.redirected && new URL(res.url).pathname.startsWith("/login")) {
        window.location.assign(res.url); // the session ended: sign in again, then back to this paper
        return;
      }
      if (res.status === 404)
        throw new Error("This PDF is still being prepared. Please try again later.");
      const isPdf = (res.headers.get("content-type") ?? "").includes("pdf");
      if (!res.ok || !isPdf)
        throw new Error("We could not get the PDF just now. Please try again.");
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
      toast.success("Your PDF has been downloaded");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "We could not get the PDF just now. Please try again.",
      );
    } finally {
      clearTimeout(wait);
      setBusy(false);
      setSlow(false);
    }
  }

  return (
    <>
      <a
        href={href}
        rel="nofollow noopener"
        onClick={(e) => void getPdf(e)}
        aria-busy={busy}
        aria-disabled={busy}
        className={cn(
          buttonVariants({ size: "lg" }),
          "w-full sm:w-auto",
          busy && "pointer-events-none opacity-90",
        )}
      >
        {busy ? (
          <>
            <Spinner label="Getting your PDF" /> Getting your PDF…
          </>
        ) : (
          children
        )}
      </a>
      <span role="status" className="w-full text-sm text-muted-foreground sm:w-auto">
        {busy && slow ? "Still working. The first download of a paper can take a few seconds." : ""}
      </span>
    </>
  );
}
