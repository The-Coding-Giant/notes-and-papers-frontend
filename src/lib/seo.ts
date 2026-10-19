import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, UNIVERSITY_NAME } from "@/lib/env";
import type { CourseDetail, PaperDetail, SubjectDetail, TermDetail } from "@/lib/api/types";
import { paperHref, termLabel, yearRange } from "@/lib/routes";

export const absoluteUrl = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

/** Clip to a hard character budget without cutting mid-word where possible. */
export function clip(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

interface MetaInput {
  title: string;
  description: string;
  path: string;
  /** Thin or private pages. */
  noindex?: boolean;
  image?: string;
  type?: "website" | "article";
}

export function buildMetadata({
  title,
  description,
  path,
  noindex,
  image,
  type = "website",
}: MetaInput): Metadata {
  // "Page | Notes & Papers" when it fits in 60 characters; long titles keep their own words instead of the brand.
  const full =
    title.includes(SITE_NAME) || title.length + SITE_NAME.length + 3 > 60
      ? title
      : `${title} | ${SITE_NAME}`;
  const t = clip(full, 60);
  const d = clip(description, 155);
  const url = absoluteUrl(path);
  return {
    title: { absolute: t },
    description: d,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: t,
      description: d,
      url,
      siteName: SITE_NAME,
      type,
      locale: "en_IN",
      images: [{ url: image ?? absoluteUrl("/og-default.png"), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: t,
      description: d,
      images: [image ?? absoluteUrl("/og-default.png")],
    },
  };
}

/* ---------- Title / description templates (docs/projectflow.md section 10) ---------- */

export function courseMeta(c: CourseDetail) {
  const range = yearRange(c.year_min, c.year_max);
  const terms = c.terms.map((t) => termLabel(t.kind, t.number)).join(", ");
  return {
    title: `${c.name} Question Papers${range ? ` ${range}` : ""} - ${UNIVERSITY_NAME}`,
    description: `Download ${c.name} previous year question papers of ${UNIVERSITY_NAME}${terms ? ` for all terms (${terms})` : ""}. Free PDFs, subject-wise.`,
    h1: `${c.name} Previous Year Papers`,
  };
}

export function termMeta(t: TermDetail) {
  const label = termLabel(t.term.kind, t.term.number);
  const range = yearRange(t.year_min, t.year_max);
  return {
    title: `${t.course.name} ${label} Previous Year Papers - UNIRAJ`,
    description: `${t.paper_count} papers across ${t.subjects.length} subjects for ${t.course.name} ${label}${range ? `, years ${range}` : ""}.`,
    h1: `${t.course.name} ${label} Question Papers`,
    label,
  };
}

export function subjectMeta(s: SubjectDetail) {
  const label = termLabel(s.term.kind, s.term.number);
  const range = yearRange(s.subject.year_min, s.subject.year_max);
  const years = new Set(s.papers.map((p) => p.year).filter(Boolean)).size;
  return {
    title: `${s.subject.name} ${s.course.name} ${label} Question Papers${range ? ` ${range}` : ""}`,
    description: `${s.subject.name} previous year papers for ${s.course.name} ${label}, ${years} year${years === 1 ? "" : "s"} available.`,
    h1: `${s.subject.name} Question Papers`,
    label,
    years,
  };
}

export function paperMeta(p: PaperDetail) {
  const label = termLabel(p.term_kind, p.term_number);
  const year = p.year ? `${p.year} ` : "";
  if (!p.course_name) {
    // Exam / board papers: the title already names the paper.
    const where = p.exam_name ?? "";
    const bits = [p.year ? String(p.year) : "", p.session ?? "", p.language ?? ""]
      .filter(Boolean)
      .join(", ");
    return {
      title:
        p.meta_title ??
        `${p.title}${where && !p.title.includes(where) ? ` - ${where}` : ""} | Previous Year Paper PDF`,
      description:
        p.meta_description ??
        `Download the ${p.title}${where ? ` from ${where}` : ""} previous year question paper as a PDF${bits ? ` (${bits})` : ""}. Free with an account, with other years of the same exam on the page.`,
      h1: p.title,
      label: where,
    };
  }
  return {
    title:
      p.meta_title ??
      `${p.subject_name} ${year}Question Paper - ${p.course_name} ${label} ${UNIVERSITY_NAME}`,
    description:
      p.meta_description ??
      `${p.subject_name} ${p.course_name} ${label} ${year}question paper PDF.${p.paper_code ? ` Paper code ${p.paper_code}.` : ""} View online or download free.`,
    h1: `${p.subject_name} ${year}Question Paper`.replace(/\s+/g, " ").trim(),
    label,
  };
}

/* ---------- JSON-LD builders ---------- */

export type JsonLd = Record<string, unknown>;

export function breadcrumbLd(items: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function collectionPageLd(name: string, path: string, description: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };
}

export function itemListLd(items: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: absoluteUrl(it.path),
    })),
  };
}

export function faqLd(faqs: { q: string; a: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function learningResourceLd(p: PaperDetail, title: string, description: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: title,
    description,
    url: absoluteUrl(paperHref(p)),
    learningResourceType: p.kind === "notes" ? "Notes" : "Exam",
    educationalLevel: p.course_name ?? undefined,
    inLanguage: "en",
    isAccessibleForFree: true,
    datePublished: p.published_at ?? undefined,
    dateModified: p.updated_at,
    ...(p.year ? { temporalCoverage: String(p.year) } : {}),
    provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    about: p.course_name
      ? { "@type": "CollegeOrUniversity", name: UNIVERSITY_NAME }
      : { "@type": "Thing", name: p.exam_name ?? p.title },
  };
}
