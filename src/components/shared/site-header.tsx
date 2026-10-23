import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { SITE_NAME } from "@/lib/env";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { DetailsMenu } from "@/components/ui/details-menu";
import { getNavFlags } from "@/lib/api/nav-flags";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export async function SiteHeader() {
  const flags = await getNavFlags();
  const NAV = [
    { href: routes.universities, label: "Universities" },
    { href: routes.exams, label: "Exams" },
    ...(flags.notes ? [{ href: "/notes", label: "Notes" }] : []),
    { href: "/search", label: "Search" },
  ];
  const MOBILE = [
    ...NAV,
    ...(flags.uploads ? [{ href: "/upload", label: "Upload" }] : []),
    { href: "/account", label: "My account" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${SITE_NAME} home`}>
          <Image
            src="/favicon/android-chrome-192x192.png"
            alt=""
            width={36}
            height={36}
            priority
            className="size-8 shrink-0 border-2 border-border shadow-hard-sm sm:size-9"
          />
          <span className="font-display text-base uppercase leading-[1.2] tracking-wide sm:text-xl">
            Notes <span className="text-accent">&amp;</span> Papers
          </span>
        </Link>

        <NavLinks items={NAV} />

        <div className="flex items-center gap-1.5 sm:gap-2">
          {flags.uploads && (
            <Link
              href="/upload"
              className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}
            >
              Upload
            </Link>
          )}
          <ThemeToggle />
          <UserMenu />
          {/* <details> keeps the mobile menu working with JavaScript disabled */}
          <DetailsMenu
            className="relative md:hidden"
            summary={
              <summary
                aria-label="Open menu"
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" }),
                  "cursor-pointer list-none",
                )}
              >
                <Menu className="size-5" aria-hidden="true" />
              </summary>
            }
          >
            <nav
              aria-label="Mobile"
              className="absolute right-0 top-14 w-60 space-y-1 border-2 border-border bg-card p-2 shadow-hard"
            >
              {MOBILE.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="block px-3 py-2.5 text-sm font-bold uppercase tracking-wide hover:bg-primary"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </DetailsMenu>
        </div>
      </div>
    </header>
  );
}
