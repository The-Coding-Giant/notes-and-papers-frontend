"use client";

import { User } from "lucide-react";
import { avatarSrc } from "@/lib/avatars";
import { cn } from "@/lib/utils";

/** The user's cartoon avatar, or a plain person icon when none is chosen. */
export function Avatar({
  value,
  className,
  label = "",
}: {
  value: string | null | undefined;
  className?: string;
  label?: string;
}) {
  const src = avatarSrc(value);
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden border-2 border-border bg-primary",
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- a generated data: URI, nothing to optimise
        <img src={src} alt={label} className="size-full object-cover" />
      ) : (
        <User className="size-1/2" aria-hidden="true" />
      )}
    </span>
  );
}
