import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { NoPermission } from "@/components/admin/no-permission";
import { getMe } from "@/lib/api/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const me = await getMe();
  if (!me) redirect("/login?next=/admin");
  if (me.role !== "admin" && me.role !== "moderator")
    return <NoPermission need="an admin or moderator account" />;
  return (
    <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-2 hidden px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:block">
          {me.role === "admin" ? "Admin" : "Moderation"}
        </p>
        <AdminNav role={me.role} />
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
