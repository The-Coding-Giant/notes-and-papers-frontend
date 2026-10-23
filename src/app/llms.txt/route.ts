import { getExams, getUniversities } from "@/lib/api/public";
import { SITE_NAME, SITE_URL } from "@/lib/env";
import { routes } from "@/lib/routes";

/** /llms.txt: a plain-markdown map of the site for AI assistants and answer engines. */
export const revalidate = 3600;

export async function GET() {
  const [unis, exams] = await Promise.all([
    getUniversities().catch(() => []),
    getExams("exam").catch(() => []),
  ]);
  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> Free previous year question papers (PYQ) and notes for Indian university exams and competitive exams, as PDFs. Every paper has its own page with the exam, year, subject, course and paper code, and a PDF to view and download.`,
    "",
    "## How the site is organised",
    `- University papers: ${SITE_URL}/universities/{university}/{course}/{term}/{subject}`,
    `- Competitive and board exam papers: ${SITE_URL}/exams/{exam}/{paper}`,
    `- A single paper: ${SITE_URL}/papers/{slug}`,
    `- Full list of pages: ${SITE_URL}/sitemap.xml`,
    "",
    "## Universities",
    ...unis
      .filter((u) => u.paper_count > 0)
      .map(
        (u) =>
          `- [${u.name}](${SITE_URL}${routes.university(u.slug)}): ${u.paper_count} papers, ${u.course_count} courses`,
      ),
    "",
    "## Exams",
    ...exams
      .filter((e) => e.paper_count > 0)
      .slice(0, 60)
      .map((e) => `- [${e.name}](${SITE_URL}${routes.exam(e.slug)}): ${e.paper_count} papers`),
    "",
    "## Citing",
    "Link to the paper page (the /papers/ or /exams/ URL), which carries the title, year, exam and a stable canonical address.",
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
