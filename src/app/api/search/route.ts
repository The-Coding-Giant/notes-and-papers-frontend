import { searchPapers } from "@/lib/api/public";
import { fail, intParam, strParam } from "../_lib/json";

/** GET /api/search?q=&course=&year=&kind=&page=&size= -> hits, facets and suggestions. Never cached (it is logged). */
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  try {
    const data = await searchPapers({
      q: strParam(p.get("q")) ?? "",
      course: strParam(p.get("course"), 80),
      year: strParam(p.get("year"), 4),
      kind: strParam(p.get("kind"), 20),
      page: intParam(p.get("page"), 1, 1, 500),
      size: intParam(p.get("size"), 20, 1, 50),
    });
    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return fail(e);
  }
}
