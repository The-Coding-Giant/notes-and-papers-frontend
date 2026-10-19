import { NoPermission } from "@/components/admin/no-permission";
import { PageHeader } from "@/components/admin/ui";
import { SettingsForm, type SettingsValues } from "@/components/admin/settings-form";
import { authedFetch, getMe } from "@/lib/api/server";

export default async function SettingsPage() {
  if ((await getMe())?.role !== "admin") return <NoPermission />;
  const raw = await authedFetch<Partial<SettingsValues>>("/admin/settings", {}, "/admin/settings");
  const initial: SettingsValues = {
    auto_publish_confidence: raw.auto_publish_confidence ?? 0.8,
    anomaly_drop_ratio: raw.anomaly_drop_ratio ?? 0.5,
    alert_recipients: raw.alert_recipients ?? [],
    feature_flags: raw.feature_flags ?? {},
    rate_limits: raw.rate_limits ?? {},
  };
  return (
    <>
      <PageHeader
        title="Settings"
        description="Thresholds, alert recipients and feature flags. Every change is written to the audit log."
      />
      <SettingsForm initial={initial} />
    </>
  );
}
