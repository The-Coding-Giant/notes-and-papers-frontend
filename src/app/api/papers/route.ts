import { listPapers } from "@/lib/api/public";
import { fail, intParam, ok, strParam } from "../_lib/json";

/** GET /api/papers?course=&term=&subject=&year=&kind=&q=&sort=&page=&size= -> a page of published papers. */
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const sort = p.get("sort");
  try {
    const data = await listPapers({
      course: strParam(p.get("course"), 80),
      term: strParam(p.get("term"), 80),
      subject: strParam(p.get("subject"), 120),
      year: strParam(p.get("year"), 4),
      kind: strParam(p.get("kind"), 20),
      q: strParam(p.get("q")),
      sort: sort === "year" || sort === "popular" || sort === "relevance" ? sort : "latest",
      page: intParam(p.get("page"), 1, 1, 1000),
      size: intParam(p.get("size"), 20, 1, 50),
    });
    return ok(data, 60);
  } catch (e) {
    return fail(e);
  }
}
