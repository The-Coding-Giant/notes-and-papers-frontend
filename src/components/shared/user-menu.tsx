"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Bookmark, Download, LayoutDashboard, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { DetailsMenu } from "@/components/ui/details-menu";
import { Avatar } from "@/components/profile/avatar";
import { useMe } from "@/hooks/use-me";
import { signOutAction } from "@/services/actions/auth-actions";
import { cn } from "@/lib/utils";

const item =
  "flex w-full items-center gap-2 px-3 py-2.5 text-xs font-bold uppercase tracking-wide hover:bg-primary";

/** Client-side on purpose: reading the session in the server header would make every page dynamic. */
export function UserMenu() {
  const { data: me, isPending } = useMe();
  const router = useRouter();
  const qc = useQueryClient();

  if (isPending) return <span className="h-9 w-20 animate-pulse bg-muted" aria-hidden="true" />;

  if (!me) {
    return (
      <>
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "hidden xs:inline-flex",
          )}
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className={cn(buttonVariants({ size: "sm" }), "hidden md:inline-flex")}
        >
          Sign up
        </Link>
      </>
    );
  }

  const staff = me.role === "admin" || me.role === "moderator";
  async function signOut() {
    await signOutAction();
    qc.clear();
    toast.success("Signed out");
    router.push("/");
    router.refresh();
  }

  return (
    <DetailsMenu
      className="relative"
      summary={
        <summary
          aria-label="Account menu"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "cursor-pointer list-none gap-2 pl-1.5",
          )}
        >
          <Avatar value={me.avatar} className="size-6" />
          <span className="hidden max-w-28 truncate sm:inline">
            {me.display_name ?? me.email ?? "Account"}
          </span>
        </summary>
      }
    >
      <div className="absolute right-0 top-11 z-50 w-56 space-y-1 border-2 border-border bg-card p-2 shadow-hard">
        <Link href="/account" className={item}>
          <User className="size-4" aria-hidden="true" /> My account
        </Link>
        <Link href="/bookmarks" className={item}>
          <Bookmark className="size-4" aria-hidden="true" /> Bookmarks
        </Link>
        <Link href="/downloads" className={item}>
          <Download className="size-4" aria-hidden="true" /> Downloads
        </Link>
        {staff && (
          <Link href="/admin" className={item}>
            <LayoutDashboard className="size-4" aria-hidden="true" /> Admin
          </Link>
        )}
        <button type="button" onClick={signOut} className={item}>
          <LogOut className="size-4" aria-hidden="true" /> Sign out
        </button>
      </div>
    </DetailsMenu>
  );
}
