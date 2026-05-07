import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function CodeSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-[#17121a] shadow-sm shadow-foreground/5">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <Skeleton className="size-2.5 rounded-full bg-white/20" />
            <Skeleton className="size-2.5 rounded-full bg-white/20" />
            <Skeleton className="size-2.5 rounded-full bg-white/20" />
          </div>
          <Skeleton className="h-3 w-12 bg-white/15" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full bg-white/15" />
      </div>
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-4 w-11/12 bg-white/15" />
        <Skeleton className="h-4 w-full bg-white/15" />
        <Skeleton className="h-4 w-4/5 bg-white/15" />
        <Skeleton className="h-4 w-2/3 bg-white/15" />
      </div>
    </div>
  );
}

export default function DocsLoading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <Card className="relative overflow-hidden border-primary/10 bg-card shadow-sm shadow-foreground/5">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(97,31,105,0.16),transparent_58%)]" />
          <CardContent className="relative flex min-h-[330px] flex-col justify-between gap-10 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-7 w-44 rounded-full" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="max-w-3xl">
                <Skeleton className="h-10 w-full max-w-2xl rounded-2xl" />
                <Skeleton className="mt-3 h-10 w-4/5 rounded-2xl" />
                <div className="mt-5 flex max-w-2xl flex-col gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Skeleton className="h-11 w-40 rounded-md" />
              <Skeleton className="h-11 w-44 rounded-md" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-card shadow-sm shadow-foreground/5">
          <CardHeader className="p-6 pb-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-4 w-64 max-w-full" />
              </div>
              <Skeleton className="size-11 rounded-2xl" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 p-6">
            <div className="rounded-2xl border border-border/80 bg-background/70 p-4">
              <Skeleton className="mb-3 h-3 w-28" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 min-w-0 flex-1" />
                <Skeleton className="size-10 rounded-md" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {[0, 1].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-2xl border border-border/80 bg-background/70 px-3 py-2">
                  <Skeleton className="size-4 rounded-md" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-primary/10 bg-card shadow-sm shadow-foreground/5">
        <CardHeader className="p-6 pb-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-4 w-80 max-w-full" />
            </div>
            <Skeleton className="h-6 w-44 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-6 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="rounded-2xl border border-border/80 bg-background/70 p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <Skeleton className="size-9 rounded-full" />
                <Skeleton className="size-5 rounded-md" />
              </div>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-3 h-4 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <Skeleton className="h-6 w-36 rounded-full" />
        </div>

        {[0, 1, 2].map((item) => (
          <Card key={item} className="overflow-hidden border-primary/10 bg-card shadow-sm shadow-foreground/5">
            <div className="border-b border-border/80 bg-muted/35 p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-7 w-56 rounded-full" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-6 w-64 max-w-full" />
                    <Skeleton className="h-4 w-[42rem] max-w-full" />
                  </div>
                </div>
                <Skeleton className="size-11 rounded-2xl" />
              </div>
            </div>
            <CardContent className="flex flex-col gap-6 p-6">
              <div className="grid gap-6 xl:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-3 w-20" />
                  <CodeSkeleton />
                </div>
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-3 w-24" />
                  <CodeSkeleton />
                </div>
              </div>
              <Separator />
              <div className="flex flex-col gap-3">
                <Skeleton className="h-3 w-24" />
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2, 3].map((badge) => (
                    <Skeleton key={badge} className="h-8 w-32 rounded-full" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border-primary/10 bg-card shadow-sm shadow-foreground/5">
        <CardHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
            <Skeleton className="size-11 rounded-2xl" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-7 w-52" />
              <Skeleton className="h-4 w-64 max-w-full" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 p-6 md:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="rounded-2xl border border-border/80 bg-background/70 p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="size-10 shrink-0 rounded-2xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-6 w-14 rounded-full" />
                    <Skeleton className="h-5 w-36" />
                  </div>
                  <Skeleton className="mt-3 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-4/5" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
