"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { bff } from "@/services/api-client";

/** Choose a PDF and replace the front or back cover. The server checks it and says what is wrong if it cannot be used. */
export function CoverUpload({ which }: { which: "front" | "back" }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onPick(file: File | undefined) {
    if (!file) return;
    if (file.type && file.type !== "application/pdf") {
      toast.error("Please choose a PDF file.");
      if (input.current) input.current.value = "";
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      await bff(`admin/covers/${which}`, { method: "POST", raw: form });
      toast.success(`New ${which} cover is live on every paper`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        id={`cover-${which}`}
        onChange={(e) => void onPick(e.target.files?.[0])}
      />
      <Button size="sm" onClick={() => input.current?.click()} disabled={busy} aria-disabled={busy}>
        {busy ? <Spinner label="Uploading" /> : `Upload new ${which} cover`}
      </Button>
    </>
  );
}
