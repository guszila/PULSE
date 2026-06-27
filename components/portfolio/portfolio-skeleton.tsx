import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PortfolioSkeleton() {
  return (
    <section className="mt-8 space-y-4">
      <Skeleton className="h-6 w-40 bg-zinc-800" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-20 bg-zinc-800" />
              <Skeleton className="h-8 w-24 bg-zinc-800" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-4">
        <CardHeader>
          <Skeleton className="h-5 w-32 bg-zinc-800" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full bg-zinc-800 rounded-lg" />
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader>
          <Skeleton className="h-5 w-32 bg-zinc-800" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full bg-zinc-800 rounded-lg" />
        </CardContent>
      </Card>
    </section>
  );
}
