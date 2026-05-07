import { getSession } from "@/lib/session";
import { DEMO_MODE, getDemoKeys } from "@/lib/demo";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";
import { Key, BookOpen, ShieldCheck, ArrowRight, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Demo mode banner */}
      {DEMO_MODE && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-3 text-sm">
              <Badge variant="secondary">🎭 Demo Mode</Badge>
              <span className="text-muted-foreground">
                No real credentials needed. Set <code className="text-xs bg-muted px-1 rounded">NEXT_PUBLIC_DEMO_MODE=false</code> to use live services.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Welcome banner */}
      <Card className="bg-primary text-primary-foreground border-0">
        <CardContent className="py-8 px-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 opacity-50" />
            <span className="text-sm opacity-50">iVALT Developer Portal {DEMO_MODE && "· Demo Mode"}</span>
          </div>
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-primary-foreground/70">
            Manage your API keys and integrate biometric authentication into your applications.
          </p>
        </CardContent>
      </Card>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">{keyCount} / {MAX_KEYS}</CardTitle>
            <CardDescription>Total API Keys</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold">{activeCount}</CardTitle>
            <CardDescription>Active Keys</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold">{MAX_KEYS - keyCount}</CardTitle>
            <CardDescription>Available Slots</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Key className="w-5 h-5 text-primary" />
              </div>
              <CardTitle>API Keys</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate and manage your API keys for integrating iVALT biometric authentication. Up to {MAX_KEYS} keys allowed.
            </p>
            {keyCount < MAX_KEYS ? (
              <Link href="/dashboard/keys">
                <Button>
                  Manage Keys <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Badge variant="secondary">Max keys reached</Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle>API Documentation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Explore the complete iVALT Biometric Auth API reference with code samples and integration guides.
            </p>
            <Link href="/dashboard/docs">
              <Button variant="secondary">
                View Docs <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Auth flow overview */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex gap-3 p-4 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                01
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">BiometricAuthRequest</p>
                <p className="text-xs text-muted-foreground">
                  Call this API to trigger a push notification to the user's iVALT app.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                02
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">Poll BiometricResultRequest</p>
                <p className="text-xs text-muted-foreground">
                  Poll every 2 seconds. Status 422 = pending, 200 = authenticated.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-muted-foreground text-background flex items-center justify-center text-sm font-bold shrink-0">
                03
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">Authenticated</p>
                <p className="text-xs text-muted-foreground">
                  On status 200, create your session and proceed with the user.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
