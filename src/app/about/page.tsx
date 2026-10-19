import { ProsePage } from "@/components/shared/prose-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About Notes & Papers",
  description:
    "Notes & Papers helps Rajasthan University students find previous year question papers and notes, subject-wise and year-wise, for free.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <ProsePage
      title="About Notes & Papers"
      path="/about"
      intro="A fast, searchable home for Rajasthan University (UNIRAJ) previous year question papers and notes."
    >
      <p>
        Finding the right past paper should take seconds, not an evening. We organise papers by
        course, part or semester, subject and year so you can practise with exactly what you need.
      </p>
      <h2>Where papers come from</h2>
      <p>
        Papers belong to their universities. We publish only from sources we are permitted to use,
        link to the original where we are not, and remove anything on request. See the{" "}
        <a href="/takedown">takedown page</a>.
      </p>
    </ProsePage>
  );
}
