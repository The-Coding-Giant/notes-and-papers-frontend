import { ProsePage } from "@/components/shared/prose-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy policy | Notes & Papers",
  description: "What data Notes & Papers collects, why, and how you can control it.",
  path: "/privacy",
});

/** DRAFT: have this reviewed before launch (see .agents/known_issues.md). */
export default function PrivacyPage() {
  return (
    <ProsePage title="Privacy policy" path="/privacy" intro="Draft - last updated October 2026.">
      <h2>What we collect</h2>
      <ul>
        <li>Account details (email, display name) when you sign up.</li>
        <li>Bookmarks, download history and uploads linked to your account.</li>
        <li>Search queries, stored to improve results and find missing content.</li>
        <li>A hashed form of your IP address for rate limiting and download counts.</li>
      </ul>
      <h2>How we use it</h2>
      <p>
        To run the service, prevent abuse and improve the catalogue. We do not sell personal data.
      </p>
      <h2>Your choices</h2>
      <p>You can ask us to delete your account and its data at any time via the contact page.</p>
    </ProsePage>
  );
}
