"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Smartphone, ShieldCheck, Loader2, ArrowRight, ChevronDown, FlaskConical, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#f5f5f7" }}>
      <div className="w-full max-w-sm">
        
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#1d1d1f" }}>
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold" style={{ color: "#1d1d1f", letterSpacing: "-0.02em" }}>iVALT</span>
          {DEMO_MODE && (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: "#e8e8ed", color: "#1d1d1f" }}>DEMO</span>
          )}
        </div>

        {/* Card */}
        <Card size="sm">
          <CardContent className="p-5">
            
            {/* ── Step: Phone ──────────────────────────────────────────────── */}
            {step === "phone" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: "#1d1d1f", letterSpacing: "-0.01em" }}>
                    {DEMO_MODE ? "Demo Access" : "Sign in"}
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: "#707070" }}>
                    {DEMO_MODE ? "Instant access with sample data" : "Enter your phone number"}
                  </p>
                </div>

                {DEMO_MODE && (
                  <div className="flex items-center gap-2 text-xs p-2.5 rounded-lg" style={{ backgroundColor: "#f5f5f7" }}>
                    <FlaskConical className="w-4 h-4 shrink-0" style={{ color: "#707070" }} />
                    <span style={{ color: "#474747" }}>Demo mode — no credentials needed</span>
                  </div>
                )}

                {/* Phone input */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs">Phone Number</Label>
                  <div className="flex rounded-lg overflow-hidden" style={{ backgroundColor: "#f5f5f7", border: "1px solid #e8e8ed" }}>
                    <button
                      type="button"
                      onClick={() => !DEMO_MODE && setShowDropdown(!showDropdown)}
                      className="flex items-center gap-1 px-3 py-2 border-r transition-colors"
                      style={{ borderColor: "#e8e8ed", cursor: DEMO_MODE ? "default" : "pointer", opacity: DEMO_MODE ? 0.5 : 1 }}
                      onMouseEnter={(e) => !DEMO_MODE && (e.currentTarget.style.backgroundColor = "#e8e8ed")}
                      onMouseLeave={(e) => !DEMO_MODE && (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <span>{selectedCountry.flag}</span>
                      <span className="text-sm" style={{ color: "#1d1d1f" }}>{selectedCountry.code}</span>
                      {!DEMO_MODE && <ChevronDown className="w-3 h-3" style={{ color: "#707070" }} />}
                    </button>

                    {showDropdown && !DEMO_MODE && (
                      <div className="absolute top-full left-0 z-50 mt-1 rounded-lg overflow-auto" style={{ backgroundColor: "#ffffff", border: "1px solid #e8e8ed", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", maxHeight: "200px", width: "220px" }}>
                        {COUNTRY_CODES.map((c, i) => (
                          <button
                            key={`${c.country}-${i}`}
                            type="button"
                            onClick={() => { setSelectedCountry(c); setShowDropdown(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors"
                            style={{ fontFamily: "'Inter', system-ui" }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f7")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <span>{c.flag}</span>
                            <span className="flex-1" style={{ color: "#1d1d1f" }}>{c.name}</span>
                            <span className="text-xs" style={{ color: "#707070" }}>{c.code}</span>
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
                      className="flex-1 px-3 py-2 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                      style={{ color: "#1d1d1f", cursor: DEMO_MODE ? "default" : "text" }}
                      onKeyDown={(e) => e.key === "Enter" && handleSendAuth()}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSendAuth}
                  disabled={isLoading || (!DEMO_MODE && !phoneNumber.trim())}
                  className="w-full"
                  style={{ backgroundColor: "#0071e3" }}
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

                <p className="text-xs text-center" style={{ color: "#707070" }}>
                  {DEMO_MODE
                    ? "Demo login bypasses biometric authentication"
                    : "A notification will be sent to your iVALT app"}
                </p>
              </div>
            )}

            {/* ── Step: Waiting ─────────────────────────────────────────────── */}
            {step === "waiting" && (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center" style={{ backgroundColor: "#f5f5f7" }}>
                  <Smartphone className="w-7 h-7" style={{ color: "#0071e3" }} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold" style={{ color: "#1d1d1f" }}>Check your phone</h2>
                  <p className="text-xs mt-0.5" style={{ color: "#707070" }}>Sent to {fullNumber}</p>
                </div>

                <div className="text-xs text-left p-3 rounded-lg" style={{ backgroundColor: "#f5f5f7" }}>
                  <p className="font-medium mb-2" style={{ color: "#1d1d1f" }}>How to approve:</p>
                  <ol className="space-y-1 text-muted-foreground">
                    <li>1. Open iVALT app</li>
                    <li>2. Tap notification</li>
                    <li>3. Verify with Face ID / fingerprint</li>
                  </ol>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs" style={{ color: "#707070" }}>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Waiting... ({Math.ceil((150 - pollCount) * 2)}s)
                </div>

                <button
                  onClick={() => setStep("phone")}
                  className="text-xs"
                  style={{ color: "#0066cc" }}
                >
                  Use different number
                </button>
              </div>
            )}

            {/* ── Step: Success ─────────────────────────────────────────────── */}
            {step === "success" && (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center" style={{ backgroundColor: "#34c759" }}>
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold" style={{ color: "#1d1d1f" }}>
                    {DEMO_MODE ? "Demo Access Granted!" : "Authenticated!"}
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: "#707070" }}>Redirecting...</p>
                </div>

                <div className="flex items-center justify-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ backgroundColor: "#0071e3", animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 mt-6 text-xs" style={{ color: "#707070" }}>
          <Lock className="w-3 h-3" />
          <span>End-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
}
