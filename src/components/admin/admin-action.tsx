"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { bff } from "@/services/api-client";

interface AdminActionProps {
  label: string;
  path: string;
  method?: "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  success?: string;
  /** Ask before doing it (native confirm keeps this accessible and tiny). */
  confirm?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  disabled?: boolean;
  onDone?: () => void;
}

/** A button that calls the admin API through the BFF, toasts the result and refreshes the server data. */
export function AdminAction({
  label,
  path,
  method = "POST",
  body,
  success,
  confirm,
  variant = "outline",
  size = "sm",
  disabled,
  onDone,
}: AdminActionProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run() {
    if (confirm && !window.confirm(confirm)) return;
    setBusy(true);
    try {
      await bff(path, { method, body });
      toast.success(success ?? `${label} done`);
      onDone?.();
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={run}
      disabled={disabled || busy}
      aria-disabled={disabled || busy}
    >
      {busy ? <Spinner label={`${label} in progress`} /> : label}
    </Button>
  );
}
