"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Smartphone, ShieldCheck, Loader2, ArrowRight, ChevronDown, FlaskConical, CheckCircle2, Fingerprint, Lock } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: "#09090b" }}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(19,72,220,0.15) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(43,127,255,0.1) 0%, transparent 70%)" }} />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-md mx-4">
        {/* Card glow effect */}
        <div className="absolute -inset-px rounded-2xl opacity-50" style={{ background: "linear-gradient(135deg, rgba(19,72,220,0.4) 0%, rgba(43,127,255,0.2) 50%, rgba(19,72,220,0.1) 100%)", filter: "blur(20px)" }} />
        
        <div className="relative rounded-2xl p-8 md:p-10" style={{ background: "linear-gradient(180deg, #18181b 0%, #09090b 100%)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1348dc 0%, #1e5aee 100%)", boxShadow: "0 0 30px rgba(19,72,220,0.3)" }}>
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-xl" style={{ fontFamily: "var(--font-plex-serif)", letterSpacing: "-0.02em" }}>iVALT</span>
              {DEMO_MODE && (
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: "rgba(142,197,255,0.15)", color: "#8ec5ff", letterSpacing: "0.05em" }}>
                  DEMO
                </span>
              )}
            </div>
          </div>

          {/* ── Step: Phone ──────────────────────────────────────────────── */}
          {step === "phone" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-white font-bold text-2xl mb-2" style={{ fontFamily: "var(--font-plex-serif)", letterSpacing: "-0.02em" }}>
                  Welcome back
                </h2>
                <p className="text-zinc-400 text-sm" style={{ fontFamily: "var(--font-writer)" }}>
                  {DEMO_MODE ? "Enter the demo portal to explore" : "Sign in with your iVALT registered phone"}
                </p>
              </div>

              {DEMO_MODE && (
                <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: "rgba(142,197,255,0.08)", border: "1px solid rgba(142,197,255,0.15)" }}>
                  <FlaskConical className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#8ec5ff" }} />
                  <div>
                    <p className="text-white text-sm font-medium">Demo Mode Active</p>
                    <p className="text-zinc-400 text-xs mt-1">No credentials needed — instant access with sample data</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Phone input */}
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2" style={{ fontFamily: "var(--font-writer)" }}>
                    Phone Number
                  </label>
                  <div className="flex rounded-xl overflow-hidden" style={{ backgroundColor: "#27272a", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {/* Country selector */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => !DEMO_MODE && setShowDropdown(!showDropdown)}
                        className="flex items-center gap-2 px-4 py-3.5 border-r transition-all"
                        style={{
                          borderColor: "rgba(255,255,255,0.08)",
                          cursor: DEMO_MODE ? "default" : "pointer",
                          opacity: DEMO_MODE ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => !DEMO_MODE && (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)")}
                        onMouseLeave={(e) => !DEMO_MODE && (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <span className="text-lg">{selectedCountry.flag}</span>
                        <span className="text-sm text-zinc-300 font-medium" style={{ fontFamily: "var(--font-writer)" }}>{selectedCountry.code}</span>
                        {!DEMO_MODE && <ChevronDown className="w-4 h-4 text-zinc-500" />}
                      </button>

                      {showDropdown && !DEMO_MODE && (
                        <div className="absolute top-full left-0 z-50 mt-2 overflow-auto rounded-xl" style={{ backgroundColor: "#27272a", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)", maxHeight: "280px", width: "280px" }}>
                          {COUNTRY_CODES.map((c, i) => (
                            <button
                              key={`${c.country}-${i}`}
                              type="button"
                              onClick={() => { setSelectedCountry(c); setShowDropdown(false); }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                              style={{ fontFamily: "var(--font-writer)" }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(19,72,220,0.2)")}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            >
                              <span className="text-base">{c.flag}</span>
                              <span className="text-sm flex-1 text-zinc-300">{c.name}</span>
                              <span className="text-xs text-zinc-500">{c.code}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => !DEMO_MODE && setPhoneNumber(e.target.value)}
                      placeholder={DEMO_MODE ? "9876543210" : "98765 43210"}
                      readOnly={DEMO_MODE}
                      className="flex-1 px-4 py-3.5 bg-transparent outline-none text-base text-white placeholder-zinc-500"
                      style={{ fontFamily: "var(--font-writer)", cursor: DEMO_MODE ? "default" : "text" }}
                      onKeyDown={(e) => e.key === "Enter" && handleSendAuth()}
                    />
                  </div>
                </div>

                {/* Info box */}
                <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {DEMO_MODE
                    ? <FlaskConical className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#8ec5ff" }} />
                    : <Fingerprint className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#8ec5ff" }} />
                  }
                  <p className="text-sm text-zinc-400" style={{ fontFamily: "var(--font-writer)", lineHeight: 1.5 }}>
                    {DEMO_MODE
                      ? "Demo login bypasses biometric — you'll be taken directly to the portal with sample API keys and data."
                      : "A biometric authentication request will be sent to your iVALT app. Approve with Face ID, fingerprint, or PIN."}
                  </p>
                </div>

                {/* Submit button */}
                <button
                  onClick={handleSendAuth}
                  disabled={isLoading || (!DEMO_MODE && !phoneNumber.trim())}
                  className="w-full flex items-center justify-center gap-2 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "#1348dc",
                    color: "#ffffff",
                    padding: "14px 24px",
                    fontFamily: "var(--font-writer)",
                    fontSize: "15px",
                    boxShadow: "0 0 20px rgba(19,72,220,0.3)",
                  }}
                  onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#1e5aee")}
                  onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#1348dc")}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : DEMO_MODE ? (
                    <>
                      <FlaskConical className="w-5 h-5" />
                      Enter Demo Portal
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── Step: Waiting ─────────────────────────────────────────────── */}
          {step === "waiting" && (
            <div className="text-center animate-fade-in">
              <div className="mb-8">
                {/* Animated phone icon */}
                <div className="relative w-28 h-28 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-2xl animate-pulse" style={{ background: "linear-gradient(135deg, rgba(19,72,220,0.4) 0%, rgba(43,127,255,0.2) 100%)", filter: "blur(20px)" }} />
                  <div className="relative w-full h-full rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1348dc 0%, #1e5aee 100%)" }}>
                    <Smartphone className="w-12 h-12 text-white" />
                  </div>
                </div>

                <h2 className="text-white font-bold text-2xl mb-3" style={{ fontFamily: "var(--font-plex-serif)" }}>
                  Check your phone
                </h2>
                <p className="text-zinc-400 text-sm mb-1" style={{ fontFamily: "var(--font-writer)" }}>
                  A notification was sent to
                </p>
                <p className="font-semibold text-lg" style={{ color: "#8ec5ff", fontFamily: "var(--font-writer)" }}>
                  {fullNumber}
                </p>
              </div>

              {/* Steps card */}
              <div className="p-5 mb-6 rounded-xl text-left" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-white text-sm font-medium mb-4" style={{ fontFamily: "var(--font-writer)" }}>How to approve:</p>
                <div className="space-y-3">
                  {[
                    { num: "01", text: "Open the iVALT app on your phone" },
                    { num: "02", text: "Tap the authentication notification" },
                    { num: "03", text: "Verify with Face ID, fingerprint, or PIN" },
                  ].map((item) => (
                    <div key={item.num} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: "rgba(19,72,220,0.3)", color: "#8ec5ff" }}>
                        {item.num}
                      </div>
                      <span className="text-zinc-400 text-sm" style={{ fontFamily: "var(--font-writer)" }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress indicator */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#8ec5ff" }} />
                <span className="text-zinc-400 text-sm" style={{ fontFamily: "var(--font-writer)" }}>
                  Waiting for approval...
                </span>
              </div>

              <button
                onClick={() => setStep("phone")}
                className="text-sm transition-colors"
                style={{ color: "#8ec5ff", fontFamily: "var(--font-writer)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#a8c5ff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#8ec5ff")}
              >
                Use a different number
              </button>

              <p className="text-zinc-600 text-xs mt-4" style={{ fontFamily: "var(--font-writer)" }}>
                Timeout in {Math.ceil((150 - pollCount) * 2)}s
              </p>
            </div>
          )}

          {/* ── Step: Success ─────────────────────────────────────────────── */}
          {step === "success" && (
            <div className="text-center animate-fade-in">
              <div className="relative w-28 h-28 mx-auto mb-6">
                <div className="absolute inset-0 rounded-2xl animate-ping opacity-20" style={{ backgroundColor: "#1348dc", filter: "blur(20px)" }} />
                <div className="relative w-full h-full rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", boxShadow: "0 0 30px rgba(16,185,129,0.3)" }}>
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </div>

              <h2 className="text-white font-bold text-2xl mb-2" style={{ fontFamily: "var(--font-plex-serif)" }}>
                {DEMO_MODE ? "Demo Access Granted!" : "Authenticated!"}
              </h2>
              <p className="text-zinc-400 text-sm" style={{ fontFamily: "var(--font-writer)" }}>
                Redirecting to your dashboard...
              </p>

              <div className="mt-6 flex justify-center">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: "#8ec5ff", animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-10 pt-6 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between text-xs text-zinc-500" style={{ fontFamily: "var(--font-writer)" }}>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                <span>End-to-end encrypted</span>
              </div>
              <span>© 2025 iVALT Inc.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
