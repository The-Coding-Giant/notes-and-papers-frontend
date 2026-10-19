import { ProsePage } from "@/components/shared/prose-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Terms of use | Notes & Papers",
  description: "The rules for using Notes & Papers, including content ownership and uploads.",
  path: "/terms",
});

/** DRAFT: have this reviewed before launch (see .agents/known_issues.md). */
export default function TermsPage() {
  return (
    <ProsePage title="Terms of use" path="/terms" intro="Draft - last updated October 2026.">
      <h2>Content</h2>
      <p>
        Question papers belong to their respective universities. They are provided for personal
        study. Do not redistribute them commercially.
      </p>
      <h2>Uploads</h2>
      <p>
        Only upload material you have the right to share. Uploads are moderated and may be rejected
        or removed.
      </p>
      <h2>Removal</h2>
      <p>
        Owners can request removal through the <a href="/takedown">takedown form</a>.
      </p>
    </ProsePage>
  );
}
