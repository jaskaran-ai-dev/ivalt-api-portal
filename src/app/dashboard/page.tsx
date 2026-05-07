import { getSession } from "@/lib/session";
import { DEMO_MODE, DEMO_API_KEYS, getDemoKeys } from "@/lib/demo";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";
import { Key, BookOpen, ShieldCheck, ArrowRight, Activity } from "lucide-react";

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
    <div className="max-w-5xl mx-auto animate-fade-in-up">
      {/* Demo mode banner */}
      {DEMO_MODE && (
        <div
          className="flex items-center gap-3 px-5 py-3 mb-6 text-sm font-medium"
          style={{
            background: "rgba(19,72,220,0.06)",
            border: "1px solid #bedbff",
            color: "#1348dc",
            fontFamily: "'Inter', sans-serif",
            letterSpacing: "-0.025em",
            borderRadius: "2px",
          }}
        >
          <span className="text-base">🎭</span>
          <span>
            <strong>Demo Mode</strong> — No real credentials needed. All data is simulated.
            Set <code className="bg-white/60 px-1" style={{ borderRadius: "2px", fontSize: "11px" }}>NEXT_PUBLIC_DEMO_MODE=false</code> to use live services.
          </span>
        </div>
      )}

      {/* Welcome banner */}
      <div
        className="relative overflow-hidden p-8 mb-8"
        style={{
          background: "linear-gradient(104deg, #282c33 9.56%, #1348dc 102.66%)",
          borderRadius: "2px",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(20vw at 10% 70%, rgba(43, 127, 255, 0.15), transparent),
              radial-gradient(20vw at 90% 30%, rgba(142, 197, 255, 0.1), transparent)
            `,
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-white/50" />
            <span className="text-white/50 text-sm" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.025em" }}>
              iVALT Developer Portal {DEMO_MODE && "· Demo Mode"}
            </span>
          </div>
          <h2
            className="text-white font-bold text-3xl mb-2"
            style={{ fontFamily: "'IBM Plex Serif', serif", letterSpacing: "-0.52px" }}
          >
            Welcome back!
          </h2>
          <p className="text-white/65 text-sm" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.025em" }}>
            Manage your API keys and integrate biometric authentication into your applications.
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Total API Keys",
            value: `${keyCount} / ${MAX_KEYS}`,
            icon: Key,
            color: "#1348dc",
            bg: "rgba(19, 72, 220, 0.08)",
            border: "rgba(19, 72, 220, 0.15)",
          },
          {
            label: "Active Keys",
            value: String(activeCount),
            icon: Activity,
            color: "#2b7fff",
            bg: "rgba(43, 127, 255, 0.08)",
            border: "rgba(43, 127, 255, 0.15)",
          },
          {
            label: "Available Slots",
            value: String(MAX_KEYS - keyCount),
            icon: ShieldCheck,
            color: "#464b57",
            bg: "rgba(70, 75, 87, 0.08)",
            border: "rgba(70, 75, 87, 0.15)",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-5 border hover:shadow-hover"
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "2px",
                borderColor: stat.border,
                boxShadow: "rgba(111, 123, 144, 0.05) 0px -2px 0px 0px inset",
                transition: "box-shadow 0.15s ease, border-color 0.15s ease",
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 flex items-center justify-center"
                  style={{ backgroundColor: stat.bg, borderRadius: "2px", border: "1px solid", borderColor: stat.border }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
              </div>
              <p
                className="text-3xl font-bold mb-1"
                style={{ fontFamily: "var(--font-plex-serif)", color: "#3a3d43", letterSpacing: "-0.52px" }}
              >
                {stat.value}
              </p>
              <p className="text-sm" style={{ color: "#5d636f", fontFamily: "var(--font-writer)", letterSpacing: "-0.025em" }}>
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div
          className="p-6 border hover:shadow-hover hover:border-midnight-blue"
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "2px",
            borderColor: "rgba(19, 72, 220, 0.15)",
            boxShadow: "rgba(111, 123, 144, 0.05) 0px -2px 0px 0px inset",
            transition: "box-shadow 0.15s ease, border-color 0.15s ease",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: "rgba(19, 72, 220, 0.08)", borderRadius: "2px", border: "1px solid rgba(19, 72, 220, 0.15)" }}>
              <Key className="w-6 h-6" style={{ color: "#1348dc" }} />
            </div>
            <h3 className="font-semibold text-base" style={{ fontFamily: "var(--font-plex-serif)", color: "#3a3d43", letterSpacing: "-0.02em" }}>
              API Keys
            </h3>
          </div>
          <p className="text-sm mb-5" style={{ color: "#5d636f", fontFamily: "var(--font-writer)", lineHeight: 1.6, letterSpacing: "-0.025em" }}>
            Generate and manage your API keys for integrating iVALT biometric authentication. Up to {MAX_KEYS} keys allowed.
          </p>
          {keyCount < MAX_KEYS ? (
            <Link
              href="/dashboard/keys"
              className="inline-flex items-center gap-2 font-semibold text-sm hover:bg-sky-blue"
              style={{
                backgroundColor: "#1348dc",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "2px",
                fontFamily: "var(--font-writer)",
                textDecoration: "none",
                letterSpacing: "-0.025em",
                boxShadow: "rgb(5, 55, 148) 0px -2px 0px 0px inset",
                transition: "background-color 0.15s ease",
              }}
            >
              Manage Keys <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <span
              className="inline-flex items-center text-xs font-medium px-3 py-1.5"
              style={{ backgroundColor: "rgba(19, 72, 220, 0.08)", color: "#1348dc", borderRadius: "2px", border: "1px solid rgba(19, 72, 220, 0.15)" }}
            >
              Max keys reached
            </span>
          )}
        </div>

        <div
          className="p-6 border hover:shadow-hover hover:border-sky-blue"
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "2px",
            borderColor: "rgba(43, 127, 255, 0.15)",
            boxShadow: "rgba(111, 123, 144, 0.05) 0px -2px 0px 0px inset",
            transition: "box-shadow 0.15s ease, border-color 0.15s ease",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: "rgba(43, 127, 255, 0.08)", borderRadius: "2px", border: "1px solid rgba(43, 127, 255, 0.15)" }}>
              <BookOpen className="w-6 h-6" style={{ color: "#2b7fff" }} />
            </div>
            <h3 className="font-semibold text-base" style={{ fontFamily: "var(--font-plex-serif)", color: "#3a3d43", letterSpacing: "-0.02em" }}>
              API Documentation
            </h3>
          </div>
          <p className="text-sm mb-5" style={{ color: "#5d636f", fontFamily: "var(--font-writer)", lineHeight: 1.6, letterSpacing: "-0.025em" }}>
            Explore the complete iVALT Biometric Auth API reference with code samples and integration guides.
          </p>
          <Link
            href="/dashboard/docs"
            className="inline-flex items-center gap-2 font-semibold text-sm hover:bg-midnight-blue"
            style={{
              backgroundColor: "#2b7fff",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "2px",
              fontFamily: "var(--font-writer)",
              textDecoration: "none",
              letterSpacing: "-0.025em",
              boxShadow: "rgb(5, 55, 148) 0px -2px 0px 0px inset",
              transition: "background-color 0.15s ease",
            }}
          >
            View Docs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Auth flow overview */}
      <div
        className="p-6 border hover:shadow-hover hover:border-midnight-blue-light"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "2px",
          borderColor: "rgba(204, 207, 211, 0.5)",
          boxShadow: "rgba(111, 123, 144, 0.05) 0px -2px 0px 0px inset",
          transition: "box-shadow 0.15s ease, border-color 0.15s ease",
        }}
      >
        <h3 className="font-semibold text-base mb-5" style={{ fontFamily: "var(--font-plex-serif)", color: "#3a3d43", letterSpacing: "-0.02em" }}>
          Authentication Flow
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: "01",
              title: "BiometricAuthRequest",
              desc: "Call this API to trigger a push notification to the user's iVALT app, initiating biometric authentication.",
              color: "#1348dc",
              bg: "rgba(19, 72, 220, 0.08)",
              border: "rgba(19, 72, 220, 0.15)",
            },
            {
              step: "02",
              title: "Poll BiometricResultRequest",
              desc: "Poll every 2 seconds. Status 422 = pending, 200 = authenticated, 403 = failed/timeout, 404 = not found.",
              color: "#2b7fff",
              bg: "rgba(43, 127, 255, 0.08)",
              border: "rgba(43, 127, 255, 0.15)",
            },
            {
              step: "03",
              title: "Authenticated",
              desc: "On status 200, the user is verified. Create your session and proceed with the authenticated user.",
              color: "#464b57",
              bg: "rgba(70, 75, 87, 0.08)",
              border: "rgba(70, 75, 87, 0.15)",
            },
          ].map((step) => (
            <div key={step.step} className="flex gap-3">
              <div
                className="w-8 h-8 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                style={{ backgroundColor: step.bg, color: step.color, fontFamily: "var(--font-zed-mono)", borderRadius: "2px", border: "1px solid", borderColor: step.border, letterSpacing: "0.05em" }}
              >
                {step.step}
              </div>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: "#3a3d43", fontFamily: "var(--font-writer)", letterSpacing: "-0.025em" }}>
                  {step.title}
                </p>
                <p className="text-xs" style={{ color: "#5d636f", fontFamily: "var(--font-writer)", lineHeight: 1.6, letterSpacing: "-0.025em" }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
