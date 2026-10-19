import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: "default" | "primary" | "accent" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center border-2 border-border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
        tone === "default" && "bg-card text-foreground",
        tone === "primary" && "bg-primary text-primary-foreground",
        tone === "accent" && "bg-accent text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}
