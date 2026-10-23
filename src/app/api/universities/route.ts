import { getUniversities } from "@/lib/api/public";
import { fail, ok } from "../_lib/json";

/** GET /api/universities -> every university with its paper count and top courses. */
export async function GET() {
  try {
    return ok(await getUniversities(), 300);
  } catch (e) {
    return fail(e);
  }
}
