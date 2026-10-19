import * as React from "react";
import { cn } from "@/lib/utils";

export const fieldBase =
  "w-full border-2 border-input bg-card px-3 text-sm placeholder:text-muted-foreground focus-visible:shadow-hard-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        fieldBase,
        "h-11",
        invalid && "border-destructive focus-visible:ring-destructive",
        className,
      )}
      {...props}
    />
  );
}
