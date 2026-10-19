import { getUniversity } from "@/lib/api/public";
import { fail, ok } from "../_lib/json";

/** GET /api/courses -> the university with its courses and published-paper counts. */
export async function GET() {
  try {
    const uni = await getUniversity();
    if (!uni) return Response.json({ error: { message: "University not found" } }, { status: 404 });
    return ok(uni, 300);
  } catch (e) {
    return fail(e);
  }
}
