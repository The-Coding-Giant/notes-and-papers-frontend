import Link from "next/link";
import { FileSearch } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: { href: string; label: string };
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center border-2 border-dashed border-border bg-card px-6 py-14 text-center">
      <div className="mb-3 text-muted-foreground">
        {icon ?? <FileSearch className="size-10" aria-hidden="true" />}
      </div>
      <h2 className="text-2xl">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action && (
        <Link href={action.href} className={cn(buttonVariants({ variant: "primary" }), "mt-5")}>
          {action.label}
        </Link>
      )}
    </div>
  );
}
