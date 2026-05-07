import { getSession } from "@/lib/session";
import { DEMO_MODE, getDemoKeys } from "@/lib/demo";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Fingerprint,
  Gauge,
  Key,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const MAX_KEYS = 4;

export default async function DashboardPage() {
  const session = await getSession();

  let keyCount = 0;
  let activeCount = 0;

  if (DEMO_MODE) {
    const demoKeys = getDemoKeys();
    keyCount = demoKeys.length;
    activeCount = demoKeys.filter((k) => k.isActive).length;
  } else {
    const [{ value }] = await db
      .select({ value: count() })
      .from(apiKeys)
      .where(eq(apiKeys.userId, session.userId!));
    keyCount = Number(value);

    const allKeys = await db.query.apiKeys.findMany({
      where: eq(apiKeys.userId, session.userId!),
    });
    activeCount = allKeys.filter((k) => k.isActive).length;
  }

  const availableSlots = MAX_KEYS - keyCount;
  const usagePercent = Math.min(100, Math.round((keyCount / MAX_KEYS) * 100));

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      {DEMO_MODE && (
        <Card className="border-primary/15 bg-primary/5 shadow-sm shadow-primary/5">
          <CardContent className="px-4 py-3">
            <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center">
              <Badge variant="secondary" className="w-fit border-primary/10 bg-card text-primary">Demo Mode</Badge>
              <span className="text-muted-foreground">
                You are viewing safe demo data. Set <code className="rounded bg-card px-1.5 py-0.5 text-xs text-foreground">NEXT_PUBLIC_DEMO_MODE=false</code> to connect live services.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.65fr_0.9fr]">
        <Card className="relative overflow-hidden border-primary/10 bg-card shadow-sm shadow-foreground/5">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(97,31,105,0.18),transparent_56%)]" />
          <CardContent className="relative flex min-h-[360px] flex-col justify-between gap-10 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-7">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="border-primary/15 bg-primary/5 text-primary">
                  <ShieldCheck className="mr-1 size-3" />
                  Verified biometric API access
                </Badge>
                <span className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
                  iVALT Developer Portal
                </span>
              </div>
              <div className="max-w-3xl">
                <h2 className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl lg:text-5xl">
                  Secure API access, ready for biometric auth.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Manage production-bound keys, review the biometric request cycle, and keep every integration moving from one calm control surface.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="shadow-sm shadow-primary/20">
                  <Link href="/dashboard/keys">
                    Manage API keys
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-card/80">
                  <Link href="/dashboard/docs">
                    Read integration docs
                    <BookOpen data-icon="inline-end" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/80 bg-background/70 p-4">
                <p className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">Total keys</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{keyCount}/{MAX_KEYS}</p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-background/70 p-4">
                <p className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">Active</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{activeCount}</p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-background/70 p-4">
                <p className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">Available</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{availableSlots}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-card shadow-sm shadow-foreground/5">
          <CardHeader className="p-6 pb-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl tracking-[-0.02em]">Key capacity</CardTitle>
                <CardDescription>Keep room for staging, production, and test integrations.</CardDescription>
              </div>
              <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Gauge className="size-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 p-6">
            <div>
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-5xl font-semibold tracking-[-0.04em]">{usagePercent}%</p>
                  <p className="text-sm text-muted-foreground">of key allowance used</p>
                </div>
                <Badge variant={availableSlots > 0 ? "secondary" : "destructive"}>
                  {availableSlots > 0 ? `${availableSlots} slot${availableSlots === 1 ? "" : "s"} open` : "Limit reached"}
                </Badge>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${usagePercent}%` }} />
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-background/70 p-3">
                <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <LockKeyhole className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Keys are shown once</p>
                  <p className="text-xs text-muted-foreground">Store new secrets immediately after creation.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-background/70 p-3">
                <div className="size-9 rounded-xl bg-accent flex items-center justify-center text-accent-foreground">
                  <Activity className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{activeCount} active credential{activeCount === 1 ? "" : "s"}</p>
                  <p className="text-xs text-muted-foreground">Disable unused keys without deleting history.</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/40 p-6">
            <Button asChild variant={keyCount < MAX_KEYS ? "default" : "secondary"} className="w-full">
              <Link href="/dashboard/keys">
                {keyCount < MAX_KEYS ? "Create or manage keys" : "Review keys"}
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr_0.9fr]">
        <Card className="border-primary/10 bg-card shadow-sm shadow-foreground/5">
          <CardHeader className="p-6 pb-0">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Key className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg tracking-[-0.01em]">API keys</CardTitle>
                <CardDescription>Provision credentials for each environment.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 p-6">
            <p className="text-sm leading-6 text-muted-foreground">
              Create, disable, and remove AWS API Gateway keys linked to your iVALT usage plan. You can keep up to {MAX_KEYS} keys per account.
            </p>
            <Button asChild className="w-fit">
              <Link href="/dashboard/keys">
                Open key vault
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-card shadow-sm shadow-foreground/5">
          <CardHeader className="p-6 pb-0">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-accent flex items-center justify-center text-accent-foreground">
                <BookOpen className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg tracking-[-0.01em]">API documentation</CardTitle>
                <CardDescription>Reference endpoints and integration timing.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 p-6">
            <p className="text-sm leading-6 text-muted-foreground">
              Review the biometric auth request and polling contract with implementation notes for production applications.
            </p>
            <Button asChild variant="outline" className="w-fit bg-card">
              <Link href="/dashboard/docs">
                View API guide
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-primary text-primary-foreground shadow-sm shadow-primary/15">
          <CardHeader className="p-6 pb-0">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-primary-foreground/12 flex items-center justify-center">
                <Fingerprint className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg tracking-[-0.01em]">Biometric trust layer</CardTitle>
                <CardDescription className="text-primary-foreground/70">No passwords in the sign-in path.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-6 text-sm text-primary-foreground/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary-foreground" />
              Push approval through the iVALT mobile app
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary-foreground" />
              Polling contract with explicit pending state
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary-foreground" />
              Session starts only after biometric success
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-primary/10 bg-card shadow-sm shadow-foreground/5">
        <CardHeader className="p-6 pb-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-2xl tracking-[-0.025em]">Authentication flow</CardTitle>
              <CardDescription>The production handoff is intentionally short: request, poll, then create a session.</CardDescription>
            </div>
            <Badge variant="outline" className="w-fit bg-background">
              <Clock3 className="mr-1 size-3" />
              Poll every 2 seconds
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="relative rounded-2xl border border-border/80 bg-background/70 p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="size-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  01
                </div>
                <Key className="size-5 text-muted-foreground" />
              </div>
              <p className="font-semibold tracking-[-0.01em]">BiometricAuthRequest</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Trigger a secure push notification to the user’s iVALT app from your backend.
              </p>
            </div>
            <div className="relative rounded-2xl border border-border/80 bg-background/70 p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="size-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-semibold">
                  02
                </div>
                <Activity className="size-5 text-muted-foreground" />
              </div>
              <p className="font-semibold tracking-[-0.01em]">BiometricResultRequest</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Poll the result endpoint while status 422 indicates the user is still reviewing.
              </p>
            </div>
            <div className="relative rounded-2xl border border-border/80 bg-background/70 p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="size-9 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-semibold">
                  03
                </div>
                <ShieldCheck className="size-5 text-muted-foreground" />
              </div>
              <p className="font-semibold tracking-[-0.01em]">Authenticated</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Status 200 confirms the biometric match, then your application creates the session.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
