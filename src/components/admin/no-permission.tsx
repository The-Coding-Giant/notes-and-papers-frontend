import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

/** The "no permission" UX state: says why access is denied and what to do next. */
export function NoPermission({ need = "an admin account" }: { need?: string }) {
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <ShieldAlert className="mb-3 size-10 text-amber-500" aria-hidden="true" />
      <h1 className="text-3xl">You do not have access to this area</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        This section needs {need}. Ask an admin to change your role, or switch accounts.
      </p>
      <div className="mt-5 flex gap-2">
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Go to home
        </Link>
        <Link href="/login?next=/admin" className={buttonVariants()}>
          Switch account
        </Link>
      </div>
    </div>
  );
}
