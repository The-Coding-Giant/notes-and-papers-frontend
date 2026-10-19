import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Bookmark, Download, LayoutDashboard, Upload } from "lucide-react";
import { Avatar } from "@/components/profile/avatar";
import { ProfileForm } from "@/components/profile/profile-form";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { getMe } from "@/lib/api/server";

export const metadata: Metadata = { title: "My account", robots: { index: false, follow: false } };

export default async function AccountPage() {
  const me = await getMe();
  if (!me) redirect("/login?next=/account");
  const staff = me.role === "admin" || me.role === "moderator";
  const links = [
    { href: "/bookmarks", label: "Bookmarks", hint: "Papers you saved", icon: Bookmark },
    { href: "/downloads", label: "Downloads", hint: "Your download history", icon: Download },
    { href: "/upload", label: "Upload", hint: "Share a paper or notes", icon: Upload },
    ...(staff
      ? [
          {
            href: "/admin",
            label: "Admin",
            hint: "Review queue, sources, analytics",
            icon: LayoutDashboard,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-14">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Avatar
            value={me.avatar}
            label="Your avatar"
            className="size-20 shadow-hard sm:size-24"
          />
          <div className="space-y-2">
            <p className="eyebrow inline-block bg-accent px-2 py-0.5 capitalize text-accent-foreground">
              {me.role}
            </p>
            <h1 className="text-4xl sm:text-6xl">{me.display_name ?? "Student"}</h1>
            <p className="text-sm text-muted-foreground">
              {me.email}
              {me.college ? ` · ${me.college}` : ""}
              {me.city || me.state ? ` · ${[me.city, me.state].filter(Boolean).join(", ")}` : ""}
            </p>
          </div>
        </div>
        <SignOutButton />
      </header>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {links.map(({ href, label, hint, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="brutal brutal-hover group flex h-full items-center gap-4 p-5"
            >
              <span className="grid size-12 shrink-0 place-items-center border-2 border-border bg-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold uppercase tracking-wide">{label}</span>
                <span className="block text-sm text-muted-foreground">{hint}</span>
              </span>
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="profile-heading" className="space-y-8">
        <h2 id="profile-heading" className="text-4xl sm:text-5xl">
          Your profile
        </h2>
        <ProfileForm me={me} />
      </section>
    </div>
  );
}
