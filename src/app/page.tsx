import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Download,
  School,
  ScrollText,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  CoursesSection,
  ExamsSection,
  LatestPapersSection,
} from "@/components/shared/home-sections";
import { SearchBar } from "@/components/shared/search-bar";
import { buttonVariants } from "@/components/ui/button";
import { getExams, getLatestPapers, getStats, getUniversity } from "@/lib/api/public";
import { getNavFlags } from "@/lib/api/nav-flags";
import { UNIVERSITY_NAME } from "@/lib/env";
import { routes } from "@/lib/routes";
import { buildMetadata } from "@/lib/seo";
import { cn, plural } from "@/lib/utils";

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "Notes & Papers - Free Previous Year Question Papers",
  description:
    "Free previous year question papers for Rajasthan University (BA, BSc, BCom, BCA...) and competitive exams (UPSC, SSC, GATE, NEET, UGC NET...). Search by subject, course, exam and year.",
  path: "/",
});

const QUICK = [
  { label: "BCA", href: "/rajasthan-university/bca" },
  { label: "BSc Part 1", href: "/rajasthan-university/bsc/part-1" },
  { label: "UPSC", href: "/exams/upsc" },
  { label: "NEET", href: "/exams/neet" },
  { label: "GATE", href: "/exams/gate" },
  { label: "UGC NET", href: "/exams/ugc-net" },
];

/**
 * Server-render the first copy (real links and content for search engines and no-JS visitors), then the
 * sections below refresh themselves from the JSON API once the page loads.
 * An unreachable API must not take the page down, so each fetch degrades to null.
 */
async function load() {
  const [uni, latest, exams, stats] = await Promise.allSettled([
    getUniversity(),
    getLatestPapers(8),
    getExams("exam"),
    getStats(),
  ]);
  return {
    university: uni.status === "fulfilled" ? uni.value : null,
    latest: latest.status === "fulfilled" ? latest.value : null,
    exams: exams.status === "fulfilled" ? exams.value : null,
    stats: stats.status === "fulfilled" ? stats.value : null,
  };
}

export default async function HomePage() {
  const { university, latest, exams, stats } = await load();
  const flags = await getNavFlags();

  const uniPapers = stats?.university_papers ?? 0;
  const examPapers = stats?.exam_papers ?? 0;
  const boardPapers = stats?.board_papers ?? 0;
  const totalPapers = stats?.papers_total ?? 0;
  const courseCount = stats?.courses ?? 0;
  const examCount = stats?.exams ?? 0;

  const categories = [
    {
      href: routes.university,
      icon: Building2,
      title: "University exams",
      text: `${UNIVERSITY_NAME} papers by course, part or semester and subject.`,
      count: uniPapers,
      tone: "bg-primary",
    },
    {
      href: `${routes.exams}#competitive-exams`,
      icon: ScrollText,
      title: "Competitive exams",
      text: "UPSC, SSC, GATE, NEET, UGC NET, state PSCs and more.",
      count: examPapers,
      tone: "bg-accent",
    },
    {
      href: `${routes.exams}#school-boards`,
      icon: School,
      title: "School boards",
      text: "Open school and board previous year papers.",
      count: boardPapers,
      tone: "bg-primary",
    },
    {
      href: "/notes",
      icon: BookOpen,
      title: "Study notes",
      text: "Notes shared by students, reviewed before they are published.",
      count: null,
      tone: "bg-accent",
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 lg:space-y-32">
      {/* HERO */}
      <section
        aria-labelledby="hero-heading"
        className="grid items-center gap-10 py-2 lg:grid-cols-[1.4fr_1fr] lg:gap-12 lg:py-10"
      >
        <div className="space-y-8">
          <p className="eyebrow inline-flex items-center gap-2 border-2 border-border bg-card px-2.5 py-1">
            <span className="size-2 bg-accent" aria-hidden="true" /> Open academic vault
          </p>
          <h1 id="hero-heading" className="text-5xl sm:text-7xl lg:text-8xl">
            Previous year papers.
            <br />
            Turn study into{" "}
            <span className="inline-block -rotate-1 border-2 border-border bg-primary px-3 shadow-hard">
              success.
            </span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            {totalPapers > 0
              ? `${totalPapers.toLocaleString("en-IN")} question papers`
              : "Question papers"}{" "}
            for university students and exam aspirants. Search, preview and download. Free, with a
            free account.
          </p>
          <div className="max-w-2xl space-y-4">
            <SearchBar size="lg" />
            <p className="flex flex-wrap items-center gap-2 text-sm">
              <span className="eyebrow text-muted-foreground">Quick links</span>
              {QUICK.map((q) => (
                <Link
                  key={q.label}
                  href={q.href}
                  className="border-2 border-border bg-card px-2.5 py-1 text-xs font-bold uppercase tracking-wide hover:bg-primary"
                >
                  {q.label}
                </Link>
              ))}
            </p>
          </div>
        </div>

        <aside aria-label="Library at a glance" className="brutal space-y-6 p-6 lg:rotate-1">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Vault metrics</p>
            <span className="eyebrow flex items-center gap-1.5 bg-primary px-1.5 py-0.5">
              <span className="size-1.5 bg-foreground" aria-hidden="true" /> Live
            </span>
          </div>
          <dl className="grid grid-cols-3 gap-3 text-center">
            {[
              { v: totalPapers, l: "Papers" },
              { v: courseCount, l: "Courses" },
              { v: examCount, l: "Exams & boards" },
            ].map((m) => (
              <div key={m.l} className="border-2 border-border bg-background px-1 py-4">
                <dd className="font-display text-4xl leading-[1.2]">
                  {m.v.toLocaleString("en-IN")}
                </dd>
                <dt className="eyebrow mt-2 text-muted-foreground">{m.l}</dt>
              </div>
            ))}
          </dl>
          <ul className="space-y-2 text-sm font-medium">
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4" aria-hidden="true" /> Linked to the original source
            </li>
            <li className="flex items-center gap-2">
              <Download className="size-4" aria-hidden="true" /> Free download with an account
            </li>
          </ul>
          <Link
            href={routes.exams}
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            Explore the catalog <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </aside>
      </section>

      {/* CATEGORIES */}
      <section aria-labelledby="cat-heading" className="space-y-8">
        <div className="space-y-2">
          <p className="eyebrow inline-block bg-accent px-2 py-0.5 text-accent-foreground">
            Start here
          </p>
          <h2 id="cat-heading" className="text-4xl sm:text-5xl">
            Explore the vault by category
          </h2>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <li key={c.title}>
              <Link href={c.href} className="brutal brutal-hover flex h-full flex-col gap-5 p-6">
                <span
                  className={`grid size-14 place-items-center border-2 border-border ${c.tone}`}
                >
                  <c.icon className="size-7" aria-hidden="true" />
                </span>
                <span className="space-y-2">
                  <span className="block font-display text-3xl uppercase leading-[1.2]">
                    {c.title}
                  </span>
                  <span className="block text-sm text-muted-foreground">{c.text}</span>
                </span>
                <span className="eyebrow mt-auto flex items-center justify-between border-t-2 border-border pt-3">
                  {c.count !== null ? plural(c.count, "paper") : "Browse notes"}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ExamsSection initial={exams} />
      <CoursesSection initial={university} />
      <LatestPapersSection initial={latest} />

      {/* HOW IT WORKS */}
      <section aria-labelledby="how-heading" className="space-y-8">
        <div className="space-y-2">
          <p className="eyebrow inline-block bg-accent px-2 py-0.5 text-accent-foreground">
            Simple
          </p>
          <h2 id="how-heading" className="text-4xl sm:text-5xl">
            Three steps to your paper
          </h2>
        </div>
        <ol className="grid gap-5 md:grid-cols-3">
          {[
            {
              n: "01",
              icon: Search,
              t: "Search or browse",
              d: "Type a subject, course or exam, or walk through courses and exams step by step.",
            },
            {
              n: "02",
              icon: BookOpen,
              t: "Open the paper",
              d: "See the year, session, paper code and other years of the same subject before you download.",
            },
            {
              n: "03",
              icon: Download,
              t: "Download free",
              d: "Log in once, then download. We take you straight back to the paper you wanted.",
            },
          ].map((s) => (
            <li key={s.n} className="brutal space-y-4 p-6">
              <div className="flex items-center justify-between">
                <span className="font-display text-6xl leading-[1.2] text-muted-foreground/40">
                  {s.n}
                </span>
                <span className="grid size-12 place-items-center border-2 border-border bg-primary">
                  <s.icon className="size-6" aria-hidden="true" />
                </span>
              </div>
              <h3 className="text-lg font-bold uppercase">{s.t}</h3>
              <p className="text-sm text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section
        aria-labelledby="cta-heading"
        className="border-2 border-border bg-primary p-6 text-primary-foreground shadow-hard-lg sm:p-12"
      >
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="space-y-3">
            <h2 id="cta-heading" className="text-4xl sm:text-5xl lg:text-6xl">
              Can&apos;t find your paper?
            </h2>
            <p className="max-w-xl font-medium">
              Tell us which paper is missing, or upload one you have. Every upload is reviewed
              before it goes live.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/contact"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Request a paper
            </Link>
            {flags.uploads && (
              <Link
                href="/upload"
                className={cn(buttonVariants({ size: "lg" }), "bg-foreground text-background")}
              >
                Upload a paper
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
