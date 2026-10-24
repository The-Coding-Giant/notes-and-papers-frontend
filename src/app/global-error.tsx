"use client";

import "./globals.css";

/**
 * The last resort: shown only when the page layout itself fails, so it cannot use the header, footer or fonts.
 * It carries its own markup and the site's colours and hard-shadow look (from globals.css).
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
        <main
          role="alert"
          className="w-full max-w-xl space-y-6 border-2 border-border bg-card p-8 shadow-hard-lg sm:p-12"
        >
          <p className="inline-block border-2 border-border bg-accent px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-accent-foreground">
            Something went wrong
          </p>
          <h1 className="text-4xl font-black uppercase leading-tight sm:text-5xl">
            Notes &amp; Papers is having a moment
          </h1>
          <p className="text-muted-foreground">
            The page could not be shown. Please try again; if it keeps happening, come back in a few
            minutes.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="border-2 border-border bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-hard-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-hard active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              Try again
            </button>
            {/* A plain link: the app's router may be what failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="border-2 border-border bg-card px-6 py-3 text-sm font-bold uppercase tracking-wide shadow-hard-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-hard"
            >
              Go to home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
