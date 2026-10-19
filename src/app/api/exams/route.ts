import { getExams } from "@/lib/api/public";
import { fail, ok } from "../_lib/json";

/** GET /api/exams?kind=exam|board|university_site -> exams and boards with their paper counts. */
export async function GET(req: Request) {
  try {
    const kind = new URL(req.url).searchParams.get("kind");
    const valid =
      kind === "exam" || kind === "board" || kind === "university_site" ? kind : undefined;
    return ok(await getExams(valid), 300);
  } catch (e) {
    return fail(e);
  }
}
