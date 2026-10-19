"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/services/actions/auth-actions";

export function SignOutButton() {
  const router = useRouter();
  const qc = useQueryClient();
  return (
    <Button
      variant="outline"
      onClick={async () => {
        await signOutAction();
        qc.clear();
        toast.success("Signed out");
        router.push("/");
        router.refresh();
      }}
    >
      <LogOut className="size-4" aria-hidden="true" /> Sign out
    </Button>
  );
}
