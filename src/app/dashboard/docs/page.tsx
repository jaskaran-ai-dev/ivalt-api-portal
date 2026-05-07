"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight, Check, Copy, FileCode2, KeyRound, RadioTower, ShieldCheck, Timer, Waypoints } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
};

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-[#17121a] text-[#f6f0f7] shadow-sm shadow-foreground/5">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <div className="size-2.5 rounded-full bg-[#e57373]" />
            <div className="size-2.5 rounded-full bg-[#d8b24c]" />
            <div className="size-2.5 rounded-full bg-[#70b98f]" />
          </div>
          <span className="text-xs font-medium tracking-[0.12em] text-white/45 uppercase">{language}</span>
        </div>
        <button
          onClick={() => copyToClipboard(code)}
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Copy className="size-3.5" />
          Copy
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-7"><code>{code}</code></pre>
    </div>
  );
}

function StatusBadge({ code, label, type }: { code: string; label: string; type: "success" | "error" | "warning" | "info" }) {
  const colors = {
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
    error: "border-destructive/20 bg-destructive/10 text-destructive",
    warning: "border-amber-500/25 bg-amber-500/10 text-amber-700",
    info: "border-primary/15 bg-primary/10 text-primary",
  };

  return (
    <div className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5", colors[type])}>
      <span className="font-mono text-xs font-semibold">{code}</span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

const endpoints = [
  {
    method: "POST",
    path: "/biometric-auth-request",
    name: "Initiate authentication",
    description: "Send a biometric approval request to the user's iVALT mobile app. This starts every sign-in flow.",
    code: `curl -X POST https://api.ivalt.com/biometric-auth-request \\
  -H "Content-Type: application/json" \\
  -H "token: YOUR_IVALT_SECURITY_TOKEN" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{"mobile_number": "+919876543210"}'`,
    response: `{
  "success": true,
  "message": "Authentication request sent",
  "request_id": "auth_abc123xyz"
}`,
    statusCodes: [
      { code: "200", label: "Success", type: "success" as const },
      { code: "404", label: "User not found", type: "error" as const },
      { code: "403", label: "Invalid token", type: "error" as const },
    ],
  },
  {
    method: "POST",
    path: "/BiometricResultRequest",
    name: "Poll authentication result",
    description: "Poll every 2 seconds until the user approves, rejects, times out, or cannot be found.",
    code: `curl -X POST https://api.ivalt.com/BiometricResultRequest \\
  -H "Content-Type: application/json" \\
  -H "token: YOUR_IVALT_SECURITY_TOKEN" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{"mobile_number": "+919876543210"}'`,
    response: `{
  "authenticated": true,
  "user": {
    "mobile_number": "+919876543210",
    "verified_at": "2025-05-07T10:30:00Z"
  }
}`,
    statusCodes: [
      { code: "200", label: "Authenticated", type: "success" as const },
      { code: "422", label: "Pending", type: "warning" as const },
      { code: "403", label: "Failed / timeout", type: "error" as const },
      { code: "404", label: "Not found", type: "error" as const },
    ],
  },
  {
    method: "POST",
    path: "/BiometricGeoFenceResult",
    name: "Geo-fence authentication",
    description: "Verify biometric approval together with a latitude, longitude, and allowed radius.",
    code: `curl -X POST https://api.ivalt.com/BiometricGeoFenceResult \\
  -H "Content-Type: application/json" \\
  -H "token: YOUR_IVALT_SECURITY_TOKEN" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "mobile_number": "+919876543210",
    "latitude": 30.7333,
    "longitude": 76.7794,
    "radius_meters": 500
  }'`,
    response: `{
  "authenticated": true,
  "within_geofence": true,
  "user": {
    "mobile_number": "+919876543210",
    "verified_at": "2025-05-07T10:30:00Z"
  }
}`,
    statusCodes: [
      { code: "200", label: "Authenticated & inside fence", type: "success" as const },
      { code: "422", label: "Pending", type: "warning" as const },
      { code: "403", label: "Failed / outside fence", type: "error" as const },
      { code: "404", label: "Not found", type: "error" as const },
    ],
  },
];

const responseStates = [
  { code: "200", title: "Authenticated", text: "Stop polling. The biometric match succeeded and your app can create a session.", icon: Check, tone: "bg-emerald-500/10 text-emerald-700" },
  { code: "422", title: "Pending", text: "Keep polling every 2 seconds while the user reviews the request in the iVALT app.", icon: Timer, tone: "bg-amber-500/10 text-amber-700" },
  { code: "403", title: "Failed / timeout", text: "Authentication failed, the token is missing, or the approval window has expired.", icon: AlertCircle, tone: "bg-destructive/10 text-destructive" },
  { code: "404", title: "Not found", text: "The mobile number is not registered in iVALT, so no biometric challenge can start.", icon: AlertCircle, tone: "bg-destructive/10 text-destructive" },
];

export default function DocsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <Card className="relative overflow-hidden border-primary/10 bg-card shadow-sm shadow-foreground/5">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(97,31,105,0.16),transparent_58%)]" />
          <CardContent className="relative flex min-h-[330px] flex-col justify-between gap-10 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="border-primary/15 bg-primary/5 text-primary">
                  <FileCode2 className="mr-1 size-3" />
                  API reference v1.0
                </Badge>
                <span className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">Biometric auth contract</span>
              </div>
              <div className="max-w-3xl">
                <h2 className="text-4xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
                  Integrate the iVALT flow without guessing states.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Start with a biometric push, poll the result endpoint, and handle each terminal response with explicit application behavior.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="#endpoints">
                  Review endpoints
                  <ArrowRight data-icon="inline-end" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-card/80">
                <Link href="/dashboard/keys">
                  Manage API keys
                  <KeyRound data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-card shadow-sm shadow-foreground/5">
          <CardHeader className="p-6 pb-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl tracking-[-0.02em]">Base URL</CardTitle>
                <CardDescription>Use the same production host for all biometric endpoints.</CardDescription>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <RadioTower className="size-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 p-6">
            <div className="rounded-2xl border border-border/80 bg-background/70 p-4">
              <p className="mb-2 text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">Endpoint root</p>
              <div className="flex items-center gap-3">
                <code className="min-w-0 flex-1 break-all text-lg font-semibold tracking-[-0.02em] text-primary">https://api.ivalt.com</code>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard("https://api.ivalt.com")}>
                  <Copy />
                </Button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {[
                "REST API",
                "JSON responses",
                "Webhook-ready",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-2xl border border-border/80 bg-background/70 px-3 py-2 text-sm font-medium">
                  <Check className="size-4 text-emerald-700" />
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-primary/10 bg-card shadow-sm shadow-foreground/5" id="authentication">
        <CardHeader className="p-6 pb-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-2xl tracking-[-0.025em]">Authentication headers</CardTitle>
              <CardDescription>Send both credentials with every protected request.</CardDescription>
            </div>
            <Badge variant="outline" className="w-fit bg-background">
              <ShieldCheck className="mr-1 size-3" />
              Required for all endpoints
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-6 lg:grid-cols-3">
          {[
            { step: "01", title: "API key", value: "x-api-key: YOUR_API_KEY" },
            { step: "02", title: "Security token", value: "token: YOUR_IVALT_SECURITY_TOKEN" },
            { step: "03", title: "Content type", value: "Content-Type: application/json" },
          ].map((item) => (
            <div key={item.step} className="rounded-2xl border border-border/80 bg-background/70 p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{item.step}</div>
                <KeyRound className="size-5 text-muted-foreground" />
              </div>
              <p className="font-semibold tracking-[-0.01em]">{item.title}</p>
              <code className="mt-2 block break-all text-sm text-muted-foreground">{item.value}</code>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="flex flex-col gap-6" id="endpoints">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.025em]">Endpoints</h2>
            <p className="text-sm text-muted-foreground">The production flow is short: request, poll, then trust the terminal status.</p>
          </div>
          <Badge variant="secondary" className="w-fit">3 documented calls</Badge>
        </div>

        {endpoints.map((endpoint, index) => (
          <Card key={endpoint.path} className="overflow-hidden border-primary/10 bg-card shadow-sm shadow-foreground/5" id={endpoint.path.replace("/", "")}>
            <div className="border-b border-border/80 bg-muted/35 p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="bg-primary text-primary-foreground">{endpoint.method}</Badge>
                    <code className="rounded-full border border-border/80 bg-background px-3 py-1 font-mono text-sm">{endpoint.path}</code>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold tracking-[-0.02em]">{endpoint.name}</h3>
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{endpoint.description}</p>
                  </div>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <span className="text-sm font-semibold">0{index + 1}</span>
                </div>
              </div>
            </div>
            <CardContent className="flex flex-col gap-6 p-6">
              <div className="grid gap-6 xl:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">Request</h4>
                  <CodeBlock code={endpoint.code} language="bash" />
                </div>
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">Response</h4>
                  <CodeBlock code={endpoint.response} language="json" />
                </div>
              </div>
              <Separator />
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">Status codes</h4>
                <div className="flex flex-wrap gap-2">
                  {endpoint.statusCodes.map((sc) => (
                    <StatusBadge key={sc.code} code={sc.code} label={sc.label} type={sc.type} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border-primary/10 bg-card shadow-sm shadow-foreground/5" id="errors">
        <CardHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <Waypoints className="size-5" />
            </div>
            <div>
              <CardTitle className="text-2xl tracking-[-0.025em]">Response handling</CardTitle>
              <CardDescription>Map each status to a clear product state.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 p-6 md:grid-cols-2">
          {responseStates.map((state) => {
            const Icon = state.icon;
            return (
              <div key={state.code} className="rounded-2xl border border-border/80 bg-background/70 p-4">
                <div className="flex items-start gap-4">
                  <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-2xl", state.tone)}>
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="bg-card font-mono">{state.code}</Badge>
                      <span className="font-semibold">{state.title}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{state.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="pb-4 text-center text-xs text-muted-foreground">
        © 2025 iVALT Inc. All rights reserved.
      </div>
    </div>
  );
}
