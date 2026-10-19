import { AddSubject, CourseAliases, SubjectRename } from "@/components/admin/content-editors";
import { DataTable, type Column } from "@/components/admin/data-table";
import { NoPermission } from "@/components/admin/no-permission";
import { PageHeader, SearchForm } from "@/components/admin/ui";
import { authedFetch, getMe } from "@/lib/api/server";
import type { AdminCourse, Paginated } from "@/lib/api/types";
import { first, intParam } from "@/lib/search-params";

interface SubjectRow {
  id: string;
  slug: string;
  name: string;
  paper_code: string | null;
  term_slug: string;
  course_name: string;
}

export default async function ContentPage(props: PageProps<"/admin/content">) {
  if ((await getMe())?.role !== "admin") return <NoPermission />;
  const sp = await props.searchParams;
  const q = first(sp.q)?.slice(0, 100);
  const [courses, subjects] = await Promise.all([
    authedFetch<AdminCourse[]>("/admin/courses", {}, "/admin/content"),
    authedFetch<Paginated<SubjectRow>>(
      "/admin/subjects",
      { query: { q, page: intParam(sp.page), size: 25 } },
      "/admin/content",
    ),
  ]);

  const subjectCols: Column<SubjectRow>[] = [
    { key: "course", header: "Course", cell: (s) => `${s.course_name} · ${s.term_slug}` },
    { key: "name", header: "Subject", cell: (s) => <SubjectRename id={s.id} name={s.name} /> },
    {
      key: "slug",
      header: "Slug",
      cell: (s) => <span className="text-xs text-muted-foreground">{s.slug}</span>,
    },
    { key: "code", header: "Paper code", cell: (s) => s.paper_code ?? "-" },
  ];

  return (
    <>
      <PageHeader
        title="Content"
        description="Courses, aliases (used to recognise course names in titles) and subjects. Renaming a subject keeps the old URL working with a redirect."
      />

      <section aria-labelledby="courses-h" className="mb-8">
        <h2 id="courses-h" className=" mb-4 text-2xl">
          Courses
        </h2>
        <ul className="divide-y rounded-lg border">
          {courses.map((c) => (
            <li key={c.id} className="grid gap-2 p-3 md:grid-cols-[12rem_1fr_auto] md:items-center">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.level} · {c.scheme} · {c.terms.length} terms
                </p>
              </div>
              <CourseAliases course={c} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="subjects-h" className="space-y-4">
        <h2 id="subjects-h" className=" mb-4 text-2xl">
          Subjects
        </h2>
        <div className="border-2 border-border bg-card p-4">
          <AddSubject courses={courses} />
        </div>
        <SearchForm action="/admin/content" q={q} placeholder="Search subjects" />
        <DataTable
          caption="Subjects"
          columns={subjectCols}
          rows={subjects.items}
          rowKey={(s) => s.id}
          basePath="/admin/content"
          params={{ q }}
          total={subjects.total}
          page={subjects.page}
          size={subjects.size}
          emptyTitle="No subjects"
          emptyDescription="Subjects are created automatically by the pipeline, or add one above."
        />
      </section>
    </>
  );
}
