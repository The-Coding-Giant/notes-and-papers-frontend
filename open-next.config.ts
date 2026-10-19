import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import kvNextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/kv-next-tag-cache";

/**
 * Where Next.js keeps its page cache on Cloudflare:
 * - ISR pages (revalidate: N) live in the R2 bucket NEXT_INC_CACHE_R2_BUCKET.
 * - Tags (revalidateTag from POST /api/revalidate, called by the backend after an import) live in KV NEXT_TAG_CACHE_KV.
 * Both bindings are declared in wrangler.jsonc.
 */
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  tagCache: kvNextTagCache,
});
