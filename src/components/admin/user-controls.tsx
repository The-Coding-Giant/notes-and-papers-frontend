"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AdminUser, Role } from "@/lib/api/types";
import { bff } from "@/services/api-client";
import { AdminAction } from "./admin-action";
import { Select } from "@/components/ui/select";

export function UserControls({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(user.role);
  async function change(next: Role) {
    const prev = role;
    setRole(next);
    try {
      await bff(`admin/users/${user.id}`, { method: "PATCH", body: { role: next } });
      toast.success("Role updated");
      router.refresh();
    } catch (e) {
      setRole(prev);
      toast.error(e instanceof Error ? e.message : "Could not change the role.");
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor={`role-${user.id}`}>
        Role for {user.display_name ?? user.id}
      </label>
      <Select
        id={`role-${user.id}`}
        value={role}
        disabled={isSelf}
        onChange={(e) => change(e.target.value as Role)}
        className="h-9 border-2 border-input bg-card font-medium focus-visible:shadow-hard-sm focus-visible:outline-none placeholder:font-normal placeholder:text-muted-foreground px-2 text-sm"
      >
        <option value="user">user</option>
        <option value="moderator">moderator</option>
        <option value="admin">admin</option>
      </Select>
      {!isSelf &&
        (user.is_banned ? (
          <AdminAction
            label="Unban"
            path={`admin/users/${user.id}`}
            method="PATCH"
            body={{ is_banned: false }}
          />
        ) : (
          <AdminAction
            label="Ban"
            path={`admin/users/${user.id}`}
            method="PATCH"
            body={{ is_banned: true }}
            confirm="Ban this user? They will be signed out of every API call."
            variant="destructive"
          />
        ))}
      {isSelf && <span className="text-xs text-muted-foreground">you</span>}
    </div>
  );
}
