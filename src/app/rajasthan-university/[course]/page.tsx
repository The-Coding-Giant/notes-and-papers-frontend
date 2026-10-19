import { plural } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { JsonLdScript } from "@/components/shared/json-ld";
import { Card } from "@/components/ui/card";
import { getCourse, getUniversity } from "@/lib/api/public";
import { UNIVERSITY_NAME } from "@/lib/env";
import { routes, termLabel } from "@/lib/routes";
import { buildMetadata, collectionPageLd, courseMeta } from "@/lib/seo";

export const revalidate = 86400;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const u = await getUniversity();
    return (u?.courses ?? []).map((c) => ({ course: c.slug }));
  } catch {
    return []; // API unreachable at build time: fall back to on-demand ISR
  }
}

export async function generateMetadata(props: PageProps<"/rajasthan-university/[course]">) {
  const { course } = await props.params;
  const c = await getCourse(course);
  if (!c) return { title: "Course not found", robots: { index: false } };
  const m = courseMeta(c);
  return buildMetadata({
    title: m.title,
    description: m.description,
    path: routes.course(course),
    noindex: c.paper_count === 0,
  });
}

export default async function CoursePage(props: PageProps<"/rajasthan-university/[course]">) {
  const { course } = await props.params;
  const c = await getCourse(course);
  if (!c) notFound();
  const m = courseMeta(c);
  const path = routes.course(course);

  return (
    <div className="space-y-12">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: UNIVERSITY_NAME, path: routes.university },
          { name: c.name, path },
        ]}
      />
      <header className="space-y-4">
        <h1 className="text-5xl sm:text-6xl">{m.h1}</h1>
        <p className="max-w-3xl text-muted-foreground">
          {c.description ??
            `${c.name} is a ${c.scheme === "semester" ? "semester" : "annual"}-scheme programme of ${UNIVERSITY_NAME}. We have ${c.paper_count} previous year question papers across ${c.terms.length} ${c.scheme === "semester" ? "semesters" : "parts"}. Choose yours below.`}
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
                <Link href={routes.term(course, t.slug)} className="block space-y-1 p-5">
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
