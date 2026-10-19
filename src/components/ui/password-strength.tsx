import { cn } from "@/lib/utils";
import { passwordStrength } from "@/lib/validation";

const LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"];

export function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;
  const score = passwordStrength(value);
  return (
    <div aria-live="polite" className="space-y-1">
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full bg-muted",
              score >= i &&
                (score <= 2 ? "bg-destructive" : score === 3 ? "bg-amber-500" : "bg-success"),
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Password strength: {LABELS[score]}</p>
    </div>
  );
}
