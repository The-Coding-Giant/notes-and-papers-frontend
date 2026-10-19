"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { fieldBase } from "./input";

const MAX = 500;

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value"> {
  value: string;
  invalid?: boolean;
}

/** Always capped at 500 characters with a live counter (amber at 450, red at 500). */
export function Textarea({ className, value, invalid, id, ...props }: TextareaProps) {
  const len = value.length;
  const counterId = `${id}-counter`;
  return (
    <div>
      <textarea
        id={id}
        rows={4}
        maxLength={MAX}
        value={value}
        aria-invalid={invalid || undefined}
        aria-describedby={counterId}
        className={cn(
          fieldBase,
          "resize-none py-2",
          (invalid || len >= MAX) && "border-destructive focus-visible:ring-destructive",
          len >= 450 && len < MAX && "border-amber-500",
          className,
        )}
        {...props}
      />
      <p
        id={counterId}
        className={cn(
          "mt-1 text-right text-xs",
          len >= MAX
            ? "text-destructive"
            : len >= 450
              ? "text-amber-600 dark:text-amber-400"
              : "text-muted-foreground",
        )}
      >
        {len} / {MAX}
      </p>
    </div>
  );
}
