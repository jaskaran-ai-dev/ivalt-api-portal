import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function IconSkeleton({ className = "" }: { className?: string }) {
  return <Skeleton className={`size-11 rounded-2xl ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="grid gap-6 xl:grid-cols-[1.65fr_0.9fr]">
        <Card className="relative overflow-hidden border-primary/10 bg-card shadow-sm shadow-foreground/5">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(97,31,105,0.18),transparent_56%)]" />
          <CardContent className="relative flex min-h-[360px] flex-col justify-between gap-10 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-7">
              <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-7 w-56 rounded-full" />
                <Skeleton className="h-4 w-44" />
              </div>
              <div className="max-w-3xl">
                <Skeleton className="h-12 w-full max-w-2xl rounded-2xl sm:h-16" />
                <Skeleton className="mt-3 h-12 w-5/6 rounded-2xl sm:h-16" />
                <div className="mt-5 flex max-w-2xl flex-col gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Skeleton className="h-11 w-44 rounded-md" />
                <Skeleton className="h-11 w-48 rounded-md" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="rounded-2xl border border-border/80 bg-background/70 p-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-3 h-9 w-20 rounded-xl" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-card shadow-sm shadow-foreground/5">
          <CardHeader className="p-6 pb-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-4 w-64 max-w-full" />
              </div>
              <IconSkeleton />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 p-6">
            <div>
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <Skeleton className="h-14 w-28 rounded-2xl" />
                  <Skeleton className="mt-2 h-4 w-36" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
            <Separator />
            <div className="flex flex-col gap-3">
              {[0, 1].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-border/80 bg-background/70 p-3">
                  <Skeleton className="size-9 rounded-xl" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-52 max-w-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="p-6">
            <Skeleton className="h-10 w-full rounded-md" />
          </CardFooter>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr_0.9fr]">
        {[0, 1, 2].map((item) => (
          <Card key={item} className="border-primary/10 bg-card shadow-sm shadow-foreground/5">
            <CardHeader className="p-6 pb-0">
              <div className="flex items-center gap-3">
                <IconSkeleton />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-56 max-w-full" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 p-6">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="h-10 w-36 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border-primary/10 bg-card shadow-sm shadow-foreground/5">
        <CardHeader className="p-6 pb-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-4 w-96 max-w-full" />
            </div>
            <Skeleton className="h-6 w-40 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="rounded-2xl border border-border/80 bg-background/70 p-5">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <Skeleton className="size-9 rounded-full" />
                  <Skeleton className="size-5 rounded-md" />
                </div>
                <Skeleton className="h-5 w-40" />
                <div className="mt-3 flex flex-col gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
