import type { Metadata } from "next";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchBar } from "@/components/shared/search-bar";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl space-y-6 py-12">
      <EmptyState
        title="We could not find that page"
        description="The paper may have been renamed or removed. Try searching for it instead."
        action={{ href: "/", label: "Go to home" }}
      />
      <SearchBar />
    </div>
  );
}
