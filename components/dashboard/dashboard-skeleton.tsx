import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <>
      <section className="mt-4 sm:mt-6">
        <Card className="overflow-hidden border-t-[3px] border-t-zinc-700/50">
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48 bg-zinc-800" />
                <Skeleton className="h-4 w-32 bg-zinc-800" />
              </div>
              <Skeleton className="h-10 w-24 bg-zinc-800 rounded-full" />
            </div>
            <Skeleton className="h-[200px] w-full bg-zinc-800 rounded-xl" />
          </CardContent>
        </Card>
      </section>

      <div className="mt-4 sm:mt-6 grid gap-4 sm:gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32 bg-zinc-800" />
          </div>
          <Card>
            <CardContent className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-10 w-full bg-zinc-800 rounded-lg" />
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32 bg-zinc-800" />
          </div>
          <Card>
            <CardContent className="p-4 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-3/4 bg-zinc-800" />
                  <Skeleton className="h-4 w-full bg-zinc-800" />
                  <Skeleton className="h-3 w-20 bg-zinc-800" />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}
