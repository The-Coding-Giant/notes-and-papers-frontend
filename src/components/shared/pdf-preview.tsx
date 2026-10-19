"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { previewUrl } from "@/lib/api/urls";

/**
 * Lazy in-page PDF preview using the browser's own viewer. Nothing loads until the visitor asks for it,
 * and it does not count as a download (`?inline=true`). The download button remains a plain link.
 */
export function PdfPreview({ slug, title, src }: { slug: string; title: string; src?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <section aria-labelledby={`preview-heading-${slug}`} className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id={`preview-heading-${slug}`} className="text-3xl sm:text-4xl">
          View online
        </h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          {open ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
          {open ? "Hide preview" : "Show preview"}
        </Button>
      </div>
      {open && (
        <iframe
          src={src ?? previewUrl(slug)}
          title={`${title} (PDF preview)`}
          loading="lazy"
          className="h-[70vh] min-h-96 w-full border-2 border-border bg-muted shadow-hard"
        />
      )}
    </section>
  );
}
