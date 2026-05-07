"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Smartphone, ShieldCheck, Loader2, ArrowRight, ChevronDown, FlaskConical, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const COUNTRY_CODES = [
  { code: "+1",   country: "US", flag: "🇺🇸", name: "United States" },
  { code: "+1",   country: "CA", flag: "🇨🇦", name: "Canada" },
  { code: "+91",  country: "IN", flag: "🇮🇳", name: "India" },
  { code: "+44",  country: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+49",  country: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "+33",  country: "FR", flag: "🇫🇷", name: "France" },
  { code: "+61",  country: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "+81",  country: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "+82",  country: "KR", flag: "🇰🇷", name: "South Korea" },
  { code: "+86",  country: "CN", flag: "🇨🇳", name: "China" },
  { code: "+55",  country: "BR", flag: "🇧🇷", name: "Brazil" },
  { code: "+52",  country: "MX", flag: "🇲🇽", name: "Mexico" },
  { code: "+971", country: "AE", flag: "🇦🇪", name: "UAE" },
  { code: "+65",  country: "SG", flag: "🇸🇬", name: "Singapore" },
  { code: "+92",  country: "PK", flag: "🇵🇰", name: "Pakistan" },
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

  const handleDemoLogin = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: "+919876543210" }),
    });
    const data = await res.json();
    if (data.status === "authenticated") {
      setStep("success");
      setTimeout(() => router.push("/dashboard"), 800);
    } else {
      setIsLoading(false);
      router.push("/dashboard");
    }
  }, [router]);

  const handleSendAuth = useCallback(async () => {
    if (DEMO_MODE) {
      await handleDemoLogin();
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
  }, [phoneNumber, fullNumber, handleDemoLogin]);

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
          setTimeout(() => router.push("/dashboard"), 1500);
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
        // Keep polling on transient errors
      }
    }, 2000);
  }, [fullNumber, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-sm space-y-6">
        
        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-semibold">iVALT</span>
          {DEMO_MODE && <Badge variant="secondary">DEMO</Badge>}
        </div>

        {/* Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">
              {DEMO_MODE ? "Demo Access" : "Sign in"}
            </CardTitle>
            <CardDescription>
              {DEMO_MODE ? "Explore with instant demo access" : "Enter your phone number to continue"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* ── Step: Phone ──────────────────────────────────────────────── */}
            {step === "phone" && (
              <div className="space-y-4">
                {DEMO_MODE && (
                  <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-muted">
                    <FlaskConical className="w-4 h-4 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">Demo mode — no credentials needed</span>
                  </div>
                )}

                {/* Phone input */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                  <div className="flex rounded-lg overflow-hidden border bg-background">
                    <button
                      type="button"
                      onClick={() => !DEMO_MODE && setShowDropdown(!showDropdown)}
                      className="flex items-center gap-1 px-3 py-2.5 border-r transition-colors hover:bg-muted"
                      style={{ cursor: DEMO_MODE ? "default" : "pointer", opacity: DEMO_MODE ? 0.5 : 1 }}
                    >
                      <span>{selectedCountry.flag}</span>
                      <span className="text-sm font-medium">{selectedCountry.code}</span>
                      {!DEMO_MODE && <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                    </button>

                    {showDropdown && !DEMO_MODE && (
                      <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border bg-background shadow-lg overflow-auto max-h-[200px] w-[220px]">
                        {COUNTRY_CODES.map((c, i) => (
                          <button
                            key={`${c.country}-${i}`}
                            type="button"
                            onClick={() => { setSelectedCountry(c); setShowDropdown(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-muted transition-colors"
                          >
                            <span>{c.flag}</span>
                            <span className="flex-1">{c.name}</span>
                            <span className="text-xs text-muted-foreground">{c.code}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => !DEMO_MODE && setPhoneNumber(e.target.value)}
                      placeholder={DEMO_MODE ? "9876543210" : "98765 43210"}
                      readOnly={DEMO_MODE}
                      className="flex-1 px-3 py-2.5 bg-transparent outline-none text-sm"
                      style={{ cursor: DEMO_MODE ? "default" : "text" }}
                      onKeyDown={(e) => e.key === "Enter" && handleSendAuth()}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSendAuth}
                  disabled={isLoading || (!DEMO_MODE && !phoneNumber.trim())}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : DEMO_MODE ? (
                    <>
                      <FlaskConical className="w-4 h-4" />
                      Enter Portal
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  {DEMO_MODE
                    ? "Demo login bypasses biometric authentication"
                    : "A notification will be sent to your iVALT app"}
                </p>
              </div>
            )}

            {/* ── Step: Waiting ─────────────────────────────────────────────── */}
            {step === "waiting" && (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-muted-foreground" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">Check your phone</h2>
                  <p className="text-sm text-muted-foreground mt-1">Sent to {fullNumber}</p>
                </div>

                <div className="text-sm text-left p-3 rounded-lg bg-muted">
                  <p className="font-medium mb-2">How to approve:</p>
                  <ol className="text-muted-foreground space-y-1 text-xs">
                    <li>1. Open iVALT app</li>
                    <li>2. Tap notification</li>
                    <li>3. Verify with Face ID / fingerprint</li>
                  </ol>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Waiting... ({Math.ceil((150 - pollCount) * 2)}s)
                </div>

                <Button variant="ghost" size="sm" onClick={() => setStep("phone")}>
                  Use different number
                </Button>
              </div>
            )}

            {/* ── Step: Success ─────────────────────────────────────────────── */}
            {step === "success" && (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-green-500 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    {DEMO_MODE ? "Demo Access Granted!" : "Authenticated!"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Redirecting...</p>
                </div>

                <div className="flex items-center justify-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" />
          <span>End-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
}
