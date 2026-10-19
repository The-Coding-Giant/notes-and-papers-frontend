import { Skeleton } from "@/components/ui/skeleton";
import { PaperListSkeleton } from "@/components/shared/paper-list";

export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <span className="sr-only" role="status">
        Loading
      </span>
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-10 w-3/4 max-w-xl" />
      <Skeleton className="h-5 w-full max-w-2xl" />
      <PaperListSkeleton />
    </div>
  );
}
