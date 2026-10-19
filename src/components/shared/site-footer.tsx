import Image from "next/image";
import Link from "next/link";
import { getNavFlags } from "@/lib/api/nav-flags";
import { ContactDetails } from "./contact-details";
import { SITE_NAME } from "@/lib/env";
import { routes } from "@/lib/routes";

export async function SiteFooter() {
  const flags = await getNavFlags();
  const COLUMNS = [
    {
      title: "Explore",
      links: [
        { href: routes.university, label: "Rajasthan University" },
        { href: routes.exams, label: "Competitive exams" },
        ...(flags.notes ? [{ href: "/notes", label: "Notes" }] : []),
        { href: "/search", label: "Search papers" },
      ],
    },
    {
      title: "Help",
      links: [
        ...(flags.uploads ? [{ href: "/upload", label: "Upload a paper" }] : []),
        { href: "/contact", label: "Request a paper" },
        { href: "/about", label: "About" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/privacy", label: "Privacy policy" },
        { href: "/terms", label: "Terms of use" },
        { href: "/takedown", label: "Takedown request" },
      ],
    },
  ];
  return (
    <footer className="mt-20 border-t-4 border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="space-y-3">
          <Link
            href="/"
            aria-label={`${SITE_NAME} home`}
            className="flex items-center gap-2.5 font-display text-2xl uppercase leading-[1.2]"
          >
            <Image
              src="/favicon/android-chrome-192x192.png"
              alt=""
              width={36}
              height={36}
              className="size-9 border-2 border-border"
            />
            {SITE_NAME}
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">
            A free library of previous year question papers for university students and competitive
            exam aspirants.
          </p>
          <ContactDetails />
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-3 border-2 border-border bg-primary" />
            <span className="size-3 border-2 border-border bg-accent" />
            <span className="size-3 border-2 border-border bg-foreground" />
          </div>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="eyebrow mb-3 inline-block bg-primary px-1.5 py-0.5 text-primary-foreground">
              {col.title}
            </p>
            <ul className="space-y-2 text-sm font-medium">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="hover:underline hover:decoration-2 hover:underline-offset-4"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p className="eyebrow border-t-2 border-border px-4 py-4 text-center text-muted-foreground">
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved. Question papers belong to
        their respective universities and boards.
      </p>
    </footer>
  );
}
