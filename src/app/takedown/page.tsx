import { ProsePage } from "@/components/shared/prose-page";
import { TakedownForm } from "@/components/shared/takedown-form";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Takedown request | Notes & Papers",
  description:
    "Own a question paper or notes shown on this site? Ask us to remove or unpublish it.",
  path: "/takedown",
});

export default function TakedownPage() {
  return (
    <ProsePage
      title="Takedown request"
      path="/takedown"
      intro="If you own content shown here, or believe a paper should not be published, tell us and we will unpublish it after review."
    >
      <TakedownForm />
      <h2>What happens next</h2>
      <ul>
        <li>The page is unpublished while we review your request.</li>
        <li>We may contact you at the email you provide to confirm ownership.</li>
        <li>Every action is recorded in our audit log.</li>
      </ul>
    </ProsePage>
  );
}
