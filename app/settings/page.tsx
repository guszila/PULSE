import { getDashboardData } from "@/lib/free-market-api";
import { SectionTitle } from "@/components/shared/section-title";
import { SettingsClient } from "@/components/settings-client";

export const revalidate = 60;

export default async function SettingsPage() {
  const data = await getDashboardData();
  
  return (
    <SettingsClient data={data} />
  );
}

