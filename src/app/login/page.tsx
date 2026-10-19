import type { Metadata } from "next";
import { AuthCard } from "@/components/shared/auth-card";
import { LoginForm } from "@/components/shared/auth-forms";
import { TrackOnMount } from "@/components/shared/tracker";
import { safeNext } from "@/lib/utils";

export const metadata: Metadata = { title: "Log in", robots: { index: false, follow: true } };

export default async function LoginPage(props: PageProps<"/login">) {
  const next = safeNext((await props.searchParams).next);
  return (
    <AuthCard title="Log in" description="Log in to download papers and keep your bookmarks.">
      {next.startsWith("/papers/") && (
        <TrackOnMount type="login_required" paperSlug={next.split("/")[2]} />
      )}
      <LoginForm next={next} />
    </AuthCard>
  );
}
