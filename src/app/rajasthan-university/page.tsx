import { plural } from "@/lib/utils";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { JsonLdScript } from "@/components/shared/json-ld";
import { Card } from "@/components/ui/card";
import { getUniversity } from "@/lib/api/public";
import { UNIVERSITY_NAME } from "@/lib/env";
import { routes } from "@/lib/routes";
import { buildMetadata, collectionPageLd, itemListLd } from "@/lib/seo";
import { notFound } from "next/navigation";

// Shorter than other pages: if the API was down during a build, the degraded page heals within the hour.
export const revalidate = 3600;

async function load() {
  try {
    return { u: await getUniversity(), failed: false };
  } catch {
    return { u: null, failed: true };
  }
}

export async function generateMetadata() {
  const { u, failed } = await load();
  return buildMetadata({
    title: `${UNIVERSITY_NAME} (UNIRAJ) Question Papers - All Courses`,
    description: `Previous year question papers for every ${UNIVERSITY_NAME} course: BA, BSc, BCom, BCA and more. Free PDFs, subject-wise.`,
    path: routes.university,
    noindex: failed || !u || u.courses.length === 0,
  });
}

export default async function UniversityPage() {
  const { u, failed } = await load();
  const path = routes.university;
  if (failed) {
    return (
      <EmptyState
        title="Courses are temporarily unavailable"
        description="Please try again in a few minutes, or use the search."
        action={{ href: "/search", label: "Search papers" }}
      />
    );
  }
  if (!u) notFound();

  return (
    <div className="space-y-12">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: UNIVERSITY_NAME, path },
        ]}
      />
      <header className="space-y-4">
        <h1 className="text-5xl sm:text-6xl">{UNIVERSITY_NAME} Question Papers</h1>
        <p className="max-w-3xl text-muted-foreground">
          {u.description ??
            `Browse ${u.paper_count} previous year question papers across ${u.courses.length} courses of ${UNIVERSITY_NAME}. Pick your course, then your part or semester, then your subject.`}
        </p>
      </header>

      {u.courses.length === 0 ? (
        <EmptyState
          title="No courses yet"
          description="Courses will appear here once papers are published."
        />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {u.courses.map((c) => (
            <li key={c.slug}>
              <Card className="h-full transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard">
                <Link href={routes.course(c.slug)} className="block space-y-1 p-5">
                  <h2 className="text-2xl">{c.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {c.level ?? "Course"} · {plural(c.paper_count, "paper")}
                  </p>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <JsonLdScript
        data={[
          collectionPageLd(`${UNIVERSITY_NAME} Question Papers`, path, "All courses"),
          itemListLd(u.courses.map((c) => ({ name: c.name, path: routes.course(c.slug) }))),
        ]}
      />
    </div>
  );
}
