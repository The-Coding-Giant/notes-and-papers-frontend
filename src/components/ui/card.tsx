import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-2 border-border bg-card text-card-foreground shadow-hard-sm",
        className,
      )}
      {...props}
    />
  );
}
