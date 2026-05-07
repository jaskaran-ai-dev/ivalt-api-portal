import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function KeysLoading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="relative overflow-hidden border-primary/10 bg-card shadow-sm shadow-foreground/5">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(97,31,105,0.16),transparent_58%)]" />
          <CardContent className="relative flex min-h-[310px] flex-col justify-between gap-10 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-7 w-40 rounded-full" />
                <Skeleton className="h-4 w-36" />
              </div>
              <div className="max-w-3xl">
                <Skeleton className="h-10 w-full max-w-2xl rounded-2xl" />
                <Skeleton className="mt-3 h-10 w-5/6 rounded-2xl" />
                <div className="mt-5 flex max-w-2xl flex-col gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </div>
            <Skeleton className="h-11 w-40 rounded-md" />
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-card shadow-sm shadow-foreground/5">
          <CardHeader className="p-6 pb-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-4 w-56 max-w-full" />
              </div>
              <Skeleton className="size-11 rounded-2xl" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 p-6">
            <div>
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <Skeleton className="h-14 w-24 rounded-2xl" />
                  <Skeleton className="mt-2 h-4 w-28" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
            <Separator />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
              {[0, 1].map((item) => (
                <div key={item} className="rounded-2xl border border-border/80 bg-background/70 p-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-3 h-9 w-14 rounded-xl" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
        <Card className="border-primary/10 bg-card shadow-sm shadow-foreground/5">
          <CardHeader className="p-6 pb-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-4 w-72 max-w-full" />
              </div>
              <Skeleton className="h-10 w-28 rounded-md" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((item) => (
                <Card key={item} size="sm" className="border-border/80 bg-background/70 shadow-none">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
                      <div className="flex min-w-0 flex-1 gap-4">
                        <Skeleton className="size-11 shrink-0 rounded-2xl" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Skeleton className="h-5 w-36" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                          </div>
                          <Skeleton className="mt-3 h-4 w-64 max-w-full" />
                          <Skeleton className="mt-3 h-3 w-56 max-w-full" />
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-border/80 pt-4 xl:border-t-0 xl:pt-0">
                        <Skeleton className="h-10 w-28 rounded-full" />
                        <Skeleton className="size-10 rounded-md" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-card shadow-sm shadow-foreground/5">
          <CardHeader className="p-6 pb-0">
            <div className="flex items-center gap-3">
              <Skeleton className="size-11 rounded-2xl" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-56 max-w-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="rounded-2xl border border-border/80 bg-background/70 p-4">
              <Skeleton className="mb-3 h-3 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-4/5" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
          <CardFooter className="p-6">
            <Skeleton className="h-10 w-full rounded-md" />
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
