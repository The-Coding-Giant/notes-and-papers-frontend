import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { JsonLdScript } from "@/components/shared/json-ld";
import { Card } from "@/components/ui/card";
import { getCourse } from "@/lib/api/public";
import { routes, termLabel } from "@/lib/routes";
import { buildMetadata, collectionPageLd, courseMeta } from "@/lib/seo";
import { plural } from "@/lib/utils";

export const revalidate = 86400;
export const dynamicParams = true;

// Nothing is built in advance: Cloudflare's free KV allows about 1,000 cache writes a day and every deploy would spend
// hundreds of them on pre-built pages. These pages are built on their first visit and then cached (see `revalidate`).
export function generateStaticParams() {
  return [];
}

export async function generateMetadata(props: PageProps<"/universities/[university]/[course]">) {
  const { university, course } = await props.params;
  const c = await getCourse(university, course);
  if (!c) return { title: "Course not found", robots: { index: false } };
  const m = courseMeta(c);
  return buildMetadata({
    title: m.title,
    description: m.description,
    path: routes.course(university, course),
    noindex: c.paper_count === 0,
  });
}

export default async function CoursePage(props: PageProps<"/universities/[university]/[course]">) {
  const { university, course } = await props.params;
  const c = await getCourse(university, course);
  if (!c) notFound();
  const m = courseMeta(c);
  const path = routes.course(university, course);

  return (
    <div className="space-y-12">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Universities", path: routes.universities },
          { name: c.university_name, path: routes.university(university) },
          { name: c.name, path },
        ]}
      />
      <header className="space-y-4">
        <h1 className="text-5xl sm:text-6xl">{m.h1}</h1>
        <p className="max-w-3xl text-muted-foreground">
          {c.description ??
            `${c.name} is a ${c.scheme === "semester" ? "semester" : "annual"}-scheme programme of ${c.university_name}. We have ${c.paper_count} previous year question papers across ${c.terms.length} ${c.scheme === "semester" ? "semesters" : "parts"}. Choose yours below.`}
        </p>
      </header>

      {c.terms.length === 0 ? (
        <EmptyState
          title="No papers yet"
          description={`No ${c.name} papers have been published yet. Try the search or another course.`}
        />
      ) : (
        <ul className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {c.terms.map((t) => (
            <li key={t.slug}>
              <Card className="h-full transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard">
                <Link
                  href={routes.term(university, course, t.slug)}
                  className="block space-y-1 p-5"
                >
                  <h2 className="text-2xl">{termLabel(t.kind, t.number)}</h2>
                  <p className="text-sm text-muted-foreground">
                    {plural(t.subject_count, "subject")} · {plural(t.paper_count, "paper")}
                  </p>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <JsonLdScript data={collectionPageLd(m.h1, path, m.description)} />
    </div>
  );
}
