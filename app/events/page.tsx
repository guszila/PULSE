import { getDashboardData } from "@/lib/free-market-api";
import { EventsCard } from "@/components/events/events-card";
export const revalidate = 300;

export default async function EventsPage() {
  const data = await getDashboardData();

  return (
    <section id="events" className="mt-8">
      <EventsCard />
    </section>
  );
}
