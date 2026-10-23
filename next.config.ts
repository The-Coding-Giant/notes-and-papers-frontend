import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Gives `next dev` access to the Cloudflare bindings declared in wrangler.jsonc.
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Cloudflare Workers has no image optimiser without an extra paid product; the site only shows a few small icons.
  images: { unoptimized: true },
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // The first release served one university at /rajasthan-university; keep those links (and their ranking) alive.
  async redirects() {
    return [
      {
        source: "/rajasthan-university/:path*",
        destination: "/universities/rajasthan-university/:path*",
        permanent: true,
      },
      {
        source: "/rajasthan-university",
        destination: "/universities/rajasthan-university",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
