import { plural } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { JsonLdScript } from "@/components/shared/json-ld";
import { Card } from "@/components/ui/card";
import { getCourse, getTerm, getUniversity } from "@/lib/api/public";
import { UNIVERSITY_NAME } from "@/lib/env";
import { routes, yearRange } from "@/lib/routes";
import { buildMetadata, collectionPageLd, itemListLd, termMeta } from "@/lib/seo";

export const revalidate = 86400;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const u = await getUniversity();
    const courses = await Promise.all((u?.courses ?? []).map((c) => getCourse(c.slug)));
    return courses.flatMap((c) =>
      c ? c.terms.map((t) => ({ course: c.slug, term: t.slug })) : [],
    );
  } catch {
    return [];
  }
}

export async function generateMetadata(props: PageProps<"/rajasthan-university/[course]/[term]">) {
  const { course, term } = await props.params;
  const t = await getTerm(course, term);
  if (!t) return { title: "Not found", robots: { index: false } };
  const m = termMeta(t);
  return buildMetadata({
    title: m.title,
    description: m.description,
    path: routes.term(course, term),
    noindex: t.subjects.length === 0,
  });
}

export default async function TermPage(props: PageProps<"/rajasthan-university/[course]/[term]">) {
  const { course, term } = await props.params;
  const t = await getTerm(course, term);
  if (!t) notFound();
  const m = termMeta(t);
  const path = routes.term(course, term);

  return (
    <div className="space-y-12">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: UNIVERSITY_NAME, path: routes.university },
          { name: t.course.name, path: routes.course(course) },
          { name: m.label, path },
        ]}
      />
      <header className="space-y-4">
        <h1 className="text-5xl sm:text-6xl">{m.h1}</h1>
        <p className="max-w-3xl text-muted-foreground">
          {t.paper_count} previous year question papers across {t.subjects.length} subjects for{" "}
          {t.course.name} {m.label}
          {t.year_min ? `, from ${yearRange(t.year_min, t.year_max)}` : ""}. Select a subject to see
          every available year.
        </p>
      </header>

      {t.subjects.length === 0 ? (
        <EmptyState
          title="No subjects yet"
          description="Subjects appear once papers are published."
        />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.subjects.map((s) => (
            <li key={s.slug}>
              <Card className="h-full transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard">
                <Link href={routes.subject(course, term, s.slug)} className="block space-y-1 p-5">
                  <h2 className="text-xl leading-tight">{s.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {plural(s.paper_count, "paper")}
                    {s.year_min ? ` · ${yearRange(s.year_min, s.year_max)}` : ""}
                    {s.paper_code ? ` · ${s.paper_code}` : ""}
                  </p>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <JsonLdScript
        data={[
          collectionPageLd(m.h1, path, m.description),
          itemListLd(
            t.subjects.map((s) => ({ name: s.name, path: routes.subject(course, term, s.slug) })),
          ),
        ]}
      />
    </div>
  );
}
