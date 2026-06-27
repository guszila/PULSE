import { getDashboardData } from "@/lib/free-market-api";
import { EventsCard } from "@/components/events/events-card";
import { MacroCard } from "@/components/events/macro-card";

export const revalidate = 300;

export default async function EventsPage() {
  const data = await getDashboardData();

  return (
    <section id="events" className="mt-8 grid gap-3 xl:grid-cols-[1fr_420px]">
      <EventsCard />
      <MacroCard items={data.macro} />
    </section>
  );
}
