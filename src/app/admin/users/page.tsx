import { DataTable, type Column } from "@/components/admin/data-table";
import { NoPermission } from "@/components/admin/no-permission";
import { UserControls } from "@/components/admin/user-controls";
import { PageHeader, SearchForm, Select, fmtDate } from "@/components/admin/ui";
import { authedFetch, getMe } from "@/lib/api/server";
import type { AdminUser, Paginated } from "@/lib/api/types";
import { enumParam, intParam } from "@/lib/search-params";

export default async function UsersPage(props: PageProps<"/admin/users">) {
  const me = await getMe();
  if (me?.role !== "admin") return <NoPermission />;
  const sp = await props.searchParams;
  const role = enumParam(sp.role, ["user", "moderator", "admin"] as const);
  const data = await authedFetch<Paginated<AdminUser>>(
    "/admin/users",
    { query: { role, page: intParam(sp.page), size: 25 } },
    "/admin/users",
  );

  const cols: Column<AdminUser>[] = [
    {
      key: "name",
      header: "User",
      cell: (u) => (
        <div>
          <p className="font-medium">{u.display_name ?? "(no name)"}</p>
          <p className="text-xs text-muted-foreground">{u.id}</p>
        </div>
      ),
    },
    {
      key: "banned",
      header: "Status",
      cell: (u) => (u.is_banned ? <span className="text-destructive">banned</span> : "active"),
    },
    { key: "joined", header: "Joined", cell: (u) => fmtDate(u.created_at) },
    {
      key: "ctl",
      header: "Role / actions",
      cell: (u) => <UserControls user={u} isSelf={u.id === me.id} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Users"
        description="Change roles and ban abusive accounts. Emails live in Supabase Auth."
      />
      <SearchForm action="/admin/users" placeholder="">
        <Select
          name="role"
          label="Role"
          value={role}
          options={[
            { value: "", label: "All roles" },
            { value: "user", label: "user" },
            { value: "moderator", label: "moderator" },
            { value: "admin", label: "admin" },
          ]}
        />
      </SearchForm>
      <DataTable
        caption="Users"
        columns={cols}
        rows={data.items}
        rowKey={(u) => u.id}
        basePath="/admin/users"
        params={{ role }}
        total={data.total}
        page={data.page}
        size={data.size}
        emptyTitle="No users yet"
      />
    </>
  );
}
