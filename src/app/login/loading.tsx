import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(97,31,105,0.13),transparent_32%),radial-gradient(circle_at_86%_18%,rgba(53,91,146,0.12),transparent_30%),linear-gradient(135deg,rgba(97,31,105,0.06),transparent_42%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(97,31,105,0.05),transparent)]" />

      <main className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.08fr_0.82fr]">
        <section className="hidden flex-col gap-8 lg:flex">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-2xl" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          <div className="max-w-2xl">
            <Skeleton className="mb-5 h-7 w-56 rounded-full" />
            <Skeleton className="h-16 w-full rounded-3xl xl:h-20" />
            <Skeleton className="mt-3 h-16 w-5/6 rounded-3xl xl:h-20" />
            <div className="mt-6 flex max-w-xl flex-col gap-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-11/12" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          </div>

          <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="rounded-2xl border border-border/80 bg-card/70 p-4 shadow-sm shadow-foreground/5 backdrop-blur">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="mt-3 h-3 w-full" />
                <Skeleton className="mt-2 h-3 w-4/5" />
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-md flex-col gap-6">
          <div className="flex items-center justify-center gap-3 lg:hidden">
            <Skeleton className="size-11 rounded-2xl" />
            <Skeleton className="h-8 w-20" />
          </div>

          <Card className="border-primary/10 bg-card/95 shadow-xl shadow-foreground/10 backdrop-blur">
            <CardHeader className="p-6 pb-0">
              <Skeleton className="mb-5 size-12 rounded-3xl" />
              <Skeleton className="h-7 w-32" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-4/5" />
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-28" />
                  <div className="flex rounded-2xl border border-input bg-background shadow-sm shadow-foreground/5">
                    <div className="flex items-center gap-2 rounded-l-2xl border-r border-input px-3 py-3">
                      <Skeleton className="size-5 rounded-md" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                    <div className="flex flex-1 items-center px-3 py-3">
                      <Skeleton className="h-4 w-36" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-11 w-full rounded-md" />
                <Skeleton className="mx-auto h-3 w-72 max-w-full" />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-1.5">
            <Skeleton className="size-3 rounded-md" />
            <Skeleton className="h-3 w-56" />
          </div>
        </section>
      </main>
    </div>
  );
}
