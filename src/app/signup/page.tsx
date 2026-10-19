import type { Metadata } from "next";
import { AuthCard } from "@/components/shared/auth-card";
import { SignupForm } from "@/components/shared/auth-forms";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: true },
};

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your account"
      description="A free account lets you download papers and bookmark them."
    >
      <SignupForm />
    </AuthCard>
  );
}
