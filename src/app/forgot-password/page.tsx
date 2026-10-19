import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/shared/auth-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "How to get back into your Notes & Papers account if you forgot your password.",
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      description="Password reset by email is not available yet."
    >
      <p className="text-sm text-muted-foreground">
        Send us a message from the contact page with the email address of your account, and we will
        reset your password for you.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/contact" className={cn(buttonVariants({ size: "lg" }))}>
          Contact us
        </Link>
        <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
          Back to log in
        </Link>
      </div>
    </AuthCard>
  );
}
