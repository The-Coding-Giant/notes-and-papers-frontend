import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { JsonLdScript } from "@/components/shared/json-ld";
import { Card } from "@/components/ui/card";
import { getUniversities } from "@/lib/api/public";
import { routes } from "@/lib/routes";
import { buildMetadata, collectionPageLd, itemListLd } from "@/lib/seo";
import { plural } from "@/lib/utils";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "University Question Papers - All Universities",
  description:
    "Previous year question papers of Indian universities, organised by course, semester and subject. Free PDFs.",
  path: routes.universities,
});

export default async function UniversitiesPage() {
  const unis = await getUniversities().catch(() => null);

  return (
    <div className="space-y-12">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Universities", path: routes.universities },
        ]}
      />
      <header className="space-y-4">
        <h1 className="text-5xl sm:text-6xl">University Question Papers</h1>
        <p className="max-w-3xl text-muted-foreground">
          Pick your university, then your course, term and subject.
        </p>
      </header>

      {!unis || unis.length === 0 ? (
        <EmptyState
          title="Universities are temporarily unavailable"
          description="Please try again in a few minutes, or use the search."
          action={{ href: "/search", label: "Search papers" }}
        />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {unis.map((u) => (
            <li key={u.slug}>
              <Card className="h-full transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard">
                <Link href={routes.university(u.slug)} className="block space-y-2 p-5">
                  <h2 className="text-2xl">{u.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {plural(u.paper_count, "paper")} · {plural(u.course_count, "course")}
                  </p>
                  {u.top_courses.length > 0 && (
                    <p className="text-sm">{u.top_courses.map((c) => c.name).join(" · ")}</p>
                  )}
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {unis && (
        <JsonLdScript
          data={[
            collectionPageLd("University Question Papers", routes.universities, "All universities"),
            itemListLd(unis.map((u) => ({ name: u.name, path: routes.university(u.slug) }))),
          ]}
        />
      )}
    </div>
  );
}
