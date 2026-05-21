"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  FlaskConical,
  Loader2,
  Lock,
  ShieldCheck,
  Smartphone,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const DEMO_PROFILES = [
  {
    id: "demo-user-approved",
    phoneNumber: "+919876543210",
    label: "Jaskaran (Approved)",
    description: "Access granted — goes straight to dashboard",
    status: "approved" as const,
  },
  {
    id: "demo-user-pending",
    phoneNumber: "+919876543211",
    label: "Rahul (Pending)",
    description: "Needs to submit use case form for API access",
    status: "pending" as const,
  },
  {
    id: "demo-user-rejected",
    phoneNumber: "+919876543212",
    label: "Vikesh (Rejected)",
    description: "Access denied — shows rejected status page",
    status: "rejected" as const,
  },
];

const COUNTRY_CODES = [
  { code: "+1", country: "US", flag: "🇺🇸", name: "United States" },
  { code: "+1", country: "CA", flag: "🇨🇦", name: "Canada" },
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "+33", country: "FR", flag: "🇫🇷", name: "France" },
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "+82", country: "KR", flag: "🇰🇷", name: "South Korea" },
  { code: "+86", country: "CN", flag: "🇨🇳", name: "China" },
  { code: "+55", country: "BR", flag: "🇧🇷", name: "Brazil" },
  { code: "+52", country: "MX", flag: "🇲🇽", name: "Mexico" },
  { code: "+971", country: "AE", flag: "🇦🇪", name: "UAE" },
  { code: "+65", country: "SG", flag: "🇸🇬", name: "Singapore" },
  { code: "+92", country: "PK", flag: "🇵🇰", name: "Pakistan" },
];

type Step = "phone" | "waiting" | "success";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[2]);
  const [phoneNumber, setPhoneNumber] = useState(DEMO_MODE ? "9876543210" : "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  const fullNumber = `${selectedCountry.code}${phoneNumber.replace(/\D/g, "")}`;

  const startPolling = useCallback(() => {
    let attempts = 0;
    const maxAttempts = 150;
    const interval = setInterval(async () => {
      attempts++;
      setPollCount(attempts);
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: fullNumber }),
        });
        const data = await res.json();

        if (data.status === "authenticated") {
          clearInterval(interval);
          setStep("success");
          const accessStatus = data.accessStatus || "pending";
          const redirectPath =
            accessStatus === "approved" ? "/dashboard" : "/access/request";
          setTimeout(() => router.push(redirectPath), 1500);
        } else if (data.status === "failed" || data.status === "not_found") {
          clearInterval(interval);
          toast.error("Authentication failed. Please try again.");
          setStep("phone");
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          toast.error("Authentication timed out. Please try again.");
          setStep("phone");
        }
      } catch {
        // Keep polling on transient errors.
      }
    }, 2000);
  }, [fullNumber, router]);

  const handleDemoLogin = useCallback(
    async (phone: string) => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: phone }),
        });
        const data = await res.json();
        if (data.status === "authenticated") {
          setStep("success");
          const accessStatus = data.accessStatus || "pending";
          const redirectPath =
            accessStatus === "approved"
              ? "/dashboard"
              : accessStatus === "rejected"
                ? "/access/status"
                : "/access/request";
          setTimeout(() => router.push(redirectPath), 800);
        } else {
          setIsLoading(false);
          router.push("/dashboard");
        }
      } catch {
        setIsLoading(false);
        toast.error("Demo login failed");
      }
    },
    [router],
  );

  const handleSendAuth = useCallback(async () => {
    if (DEMO_MODE) {
      await handleDemoLogin(fullNumber);
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error("Please enter your mobile number");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: fullNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to send authentication request");
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      setStep("waiting");
      startPolling();
    } catch {
      toast.error("Network error. Please try again.");
      setIsLoading(false);
    }
  }, [fullNumber, handleDemoLogin, phoneNumber, startPolling]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(97,31,105,0.13),transparent_32%),radial-gradient(circle_at_86%_18%,rgba(53,91,146,0.12),transparent_30%),linear-gradient(135deg,rgba(97,31,105,0.06),transparent_42%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(97,31,105,0.05),transparent)]" />

      <main className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.08fr_0.82fr]">
        <section className="hidden flex-col gap-8 lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-[-0.03em]">iVALT</p>
              <p className="text-sm text-muted-foreground">Developer Portal</p>
            </div>
            {DEMO_MODE && (
              <Badge variant="secondary" className="ml-2">
                Demo
              </Badge>
            )}
          </div>

          <div className="max-w-2xl">
            <Badge
              variant="outline"
              className="mb-5 w-fit border-primary/15 bg-primary/5 text-primary"
            >
              <Lock className="mr-1 size-3" />
              Passwordless biometric access
            </Badge>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground xl:text-5xl ">
              Sign in with a verified human signal.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Access API keys and integration docs through the same biometric
              trust layer your customers will use in production.
            </p>
          </div>

          <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              { label: "No passwords", text: "Mobile biometric approval" },
              { label: "2s polling", text: "Explicit pending state" },
              { label: "API-ready", text: "Keys and docs after sign-in" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-border/80 bg-card/70 p-4 shadow-sm shadow-black/5 dark:shadow-white/5 backdrop-blur"
              >
                <p className="text-sm font-semibold tracking-[-0.01em]">
                  {item.label}
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-md flex-col gap-6">
          <div className="flex items-center justify-center gap-3 lg:hidden">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <ShieldCheck className="size-6" />
            </div>
            <span className="text-2xl font-semibold tracking-[-0.03em]">
              iVALT
            </span>
            {DEMO_MODE && <Badge variant="secondary">Demo</Badge>}
          </div>

          <Card className="border-primary/10 bg-card/95 shadow-xl shadow-black/10 dark:shadow-white/10 backdrop-blur">
            <CardHeader className="p-6 pb-0">
              <div className="mb-5 flex size-12 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                {step === "waiting" ? (
                  <Smartphone className="size-6" />
                ) : step === "success" ? (
                  <CheckCircle2 className="size-6" />
                ) : (
                  <ShieldCheck className="size-6" />
                )}
              </div>
              <CardTitle className="text-2xl tracking-[-0.025em]">
                {step === "waiting"
                  ? "Approve on your phone"
                  : step === "success"
                    ? DEMO_MODE
                      ? "Demo access granted"
                      : "Authenticated"
                    : DEMO_MODE
                      ? "Demo access"
                      : "Sign in"}
              </CardTitle>
              <CardDescription>
                {step === "waiting"
                  ? `Request sent to ${fullNumber}`
                  : step === "success"
                    ? "Redirecting to your developer portal"
                    : DEMO_MODE
                      ? "Explore the portal with safe demo data."
                      : "Enter your mobile number to receive an iVALT approval request."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {step === "phone" && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <div className="relative flex overflow-visible rounded-2xl border border-input bg-background shadow-sm shadow-black/5 dark:shadow-white/5 focus-within:ring-2 focus-within:ring-ring/30">
                      <button
                        type="button"
                        onClick={() =>
                          !DEMO_MODE && setShowDropdown(!showDropdown)
                        }
                        className="flex items-center gap-2 rounded-l-2xl border-r border-input px-3 py-3 text-sm transition-colors hover:bg-muted disabled:cursor-default disabled:opacity-60"
                        disabled={DEMO_MODE}
                      >
                        <span>{selectedCountry.flag}</span>
                        <span className="font-medium">
                          {selectedCountry.code}
                        </span>
                        {!DEMO_MODE && (
                          <ChevronDown className="size-3.5 text-muted-foreground" />
                        )}
                      </button>

                      {showDropdown && !DEMO_MODE && (
                        <div className="absolute left-0 top-full mt-2 max-h-64 w-64 overflow-auto rounded-2xl border border-border bg-popover p-1 shadow-xl shadow-black/10 dark:shadow-white/10">
                          {COUNTRY_CODES.map((c, i) => (
                            <button
                              key={`${c.country}-${i}`}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(c);
                                setShowDropdown(false);
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
                            >
                              <span>{c.flag}</span>
                              <span className="flex-1">{c.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {c.code}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      <input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) =>
                          !DEMO_MODE && setPhoneNumber(e.target.value)
                        }
                        placeholder={DEMO_MODE ? "9876543210" : "98765 43210"}
                        readOnly={DEMO_MODE}
                        className="min-w-0 flex-1 rounded-r-2xl bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground/65"
                        onKeyDown={(e) => e.key === "Enter" && handleSendAuth()}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSendAuth}
                    disabled={isLoading || (!DEMO_MODE && !phoneNumber.trim())}
                    size="lg"
                    className="w-full shadow-sm shadow-primary/20"
                  >
                    {isLoading ? (
                      <Loader2
                        data-icon="inline-start"
                        className="animate-spin"
                      />
                    ) : DEMO_MODE ? (
                      <FlaskConical data-icon="inline-start" />
                    ) : null}
                    {DEMO_MODE ? "Enter portal" : "Continue"}
                    {!DEMO_MODE && !isLoading && (
                      <ArrowRight data-icon="inline-end" />
                    )}
                  </Button>

                  <p className="text-center text-xs leading-5 text-muted-foreground">
                    {DEMO_MODE
                      ? "Demo login bypasses biometric authentication."
                      : "A notification will be sent to your registered iVALT app."}
                  </p>

                  {DEMO_MODE && (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-border/60" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-card px-2 text-muted-foreground">
                            or choose a profile
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {DEMO_PROFILES.map((profile) => (
                          <button
                            key={profile.id}
                            type="button"
                            onClick={() => handleDemoLogin(profile.phoneNumber)}
                            disabled={isLoading}
                            className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-background/50 px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-muted/50 active:scale-[0.98] disabled:opacity-60"
                          >
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              {profile.status === "approved" ? (
                                <CheckCircle2 className="size-4" />
                              ) : profile.status === "rejected" ? (
                                <XCircle className="size-4" />
                              ) : (
                                <Clock className="size-4" />
                              )}
                            </div>
                            <span className="flex-1 font-medium">
                              {profile.label}
                            </span>
                            <Badge
                              variant={
                                profile.status === "approved"
                                  ? ("default" as const)
                                  : profile.status === "rejected"
                                    ? ("destructive" as const)
                                    : ("secondary" as const)
                              }
                              className="text-[10px] px-1.5 py-0"
                            >
                              {profile.status}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {step === "waiting" && (
                <div className="flex flex-col gap-5 py-2 text-center">
                  <div className="mx-auto flex size-20 items-center justify-center rounded-[2rem] bg-primary/10 text-primary">
                    <Smartphone className="size-10" />
                  </div>
                  <div className="rounded-2xl border border-border/80 bg-background/70 p-4 text-left">
                    <p className="mb-3 text-sm font-semibold">
                      Approval checklist
                    </p>
                    <ol className="flex flex-col gap-2 text-sm text-muted-foreground">
                      <li>1. Open the iVALT app.</li>
                      <li>2. Tap the authentication notification.</li>
                      <li>3. Verify with Face ID or fingerprint.</li>
                    </ol>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Waiting\u2026 {Math.ceil((150 - pollCount) * 2)}s remaining
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep("phone")}
                  >
                    Use different number
                  </Button>
                </div>
              )}

              {step === "success" && (
                <div className="flex flex-col items-center gap-5 py-4 text-center">
                  <div className="flex size-20 items-center justify-center rounded-[2rem] bg-emerald-500/10 text-emerald-700">
                    <CheckCircle2 className="size-10" />
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="size-2 rounded-full bg-primary animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3" />
            <span>End-to-end encrypted biometric approval</span>
          </div>
        </section>
      </main>
    </div>
  );
}
