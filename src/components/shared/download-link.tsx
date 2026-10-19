"use client";

import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { useMe } from "@/hooks/use-me";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";

/**
 * Link to the login-aware download route. Signed in: the PDF opens in a new tab. Signed out: the same tab goes to
 * the login page and comes back to the paper afterwards. Also records a "download_attempt" analytics event.
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
  return (
    <a
      href={href}
      rel="nofollow noopener"
      target={me ? "_blank" : undefined}
      onClick={() => {
        track("download_attempt", { paper_slug: slug });
        if (me) toast.success("Opening the PDF in a new tab");
        else toast.info("Log in to download this paper. We will bring you back here.");
      }}
      className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
    >
      {children}
    </a>
  );
}
