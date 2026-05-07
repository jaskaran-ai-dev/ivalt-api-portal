"use client";

import { useState } from "react";
import { Copy, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
};

interface CodeBlockProps {
  code: string;
  language?: string;
}

function CodeBlock({ code, language = "json" }: CodeBlockProps) {
  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: "#282c33", borderRadius: "2px" }}>
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: "rgba(220, 224, 229, 0.1)" }}>
        <span className="text-xs font-medium" style={{ color: "#8ec5ff", fontFamily: "var(--font-zed-mono)", letterSpacing: "0.05em" }}>
          {language}
        </span>
        <button
          onClick={() => copyToClipboard(code)}
          className="flex items-center gap-1.5 text-xs transition-colors hover:text-white"
          style={{ color: "rgba(220, 224, 229, 0.5)", fontFamily: "var(--font-writer)", letterSpacing: "-0.025em" }}
        >
          <Copy className="w-4 h-4" />
          Copy
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-xs" style={{ color: "#e5e7eb", fontFamily: "var(--font-zed-mono)", lineHeight: 1.7, letterSpacing: "0.05em" }}>
          {code}
        </code>
      </pre>
    </div>
  );
}

interface EndpointCardProps {
  method: "POST" | "GET";
  path: string;
  title: string;
  description: string;
  statusCodes: { code: number; label: string; description: string; color: string }[];
  requestBody?: Record<string, unknown>;
  requestHeaders: Record<string, string>;
  responseExample?: Record<string, unknown>;
  children?: React.ReactNode;
}

function EndpointCard({
  method,
  path,
  title,
  description,
  statusCodes,
  requestBody,
  requestHeaders,
  responseExample,
  children,
}: EndpointCardProps) {
  const [expanded, setExpanded] = useState(false);

  const methodColors: Record<string, { bg: string; text: string }> = {
    POST: { bg: "#f9f0ff", text: "#611f69" },
    GET: { bg: "#f0f7ff", text: "#1264a3" },
  };
  const mc = methodColors[method];

  return (
    <div
      className="border overflow-hidden mb-4"
      style={{ borderColor: "rgba(204, 207, 211, 0.5)", backgroundColor: "#ffffff", borderRadius: "2px", boxShadow: "rgba(111, 123, 144, 0.05) 0px -2px 0px 0px inset" }}
    >
      <button
        className="w-full flex items-center gap-4 p-5 text-left"
        style={{ transition: "background-color 0.15s ease" }}
        onClick={() => setExpanded(!expanded)}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.5)"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
      >
        <span
          className="text-xs font-bold px-2.5 py-1 rounded shrink-0"
          style={{ backgroundColor: mc.bg, color: mc.text, fontFamily: "var(--font-writer)", letterSpacing: "0.05em", borderRadius: "2px" }}
        >
          {method}
        </span>
        <code
          className="text-sm flex-1 min-w-0 truncate"
          style={{ color: "#3a3d43", fontFamily: "var(--font-zed-mono)", letterSpacing: "0.05em" }}
        >
          {path}
        </code>
        <span className="text-sm font-medium shrink-0" style={{ color: "#5d636f", fontFamily: "var(--font-writer)", letterSpacing: "-0.025em" }}>
          {title}
        </span>
        {expanded ? (
          <ChevronDown className="w-5 h-5 shrink-0" style={{ color: "#5d636f" }} />
        ) : (
          <ChevronRight className="w-5 h-5 shrink-0" style={{ color: "#5d636f" }} />
        )}
      </button>

      {expanded && (
        <div className="border-t px-5 pb-5 pt-4 space-y-5" style={{ borderColor: "rgba(204, 207, 211, 0.5)" }}>
          <p className="text-sm" style={{ color: "#5d636f", fontFamily: "var(--font-writer)", lineHeight: 1.6, letterSpacing: "-0.025em" }}>
            {description}
          </p>

          {children}

          {/* Headers */}
          <div>
            <h4 className="text-xs font-bold uppercase mb-3" style={{ color: "#3a3d43", fontFamily: "var(--font-writer)", letterSpacing: "0.05em" }}>
              Request Headers
            </h4>
            <div className="space-y-2">
              {Object.entries(requestHeaders).map(([k, v]) => (
                <div key={k} className="flex items-center gap-3 text-sm">
                  <code
                    className="px-2 py-1 text-xs"
                    style={{ backgroundColor: "rgba(19, 72, 220, 0.08)", color: "#1348dc", fontFamily: "var(--font-zed-mono)", letterSpacing: "0.05em", borderRadius: "2px" }}
                  >
                    {k}
                  </code>
                  <span style={{ color: "#5d636f", fontFamily: "var(--font-writer)", letterSpacing: "-0.025em" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Request body */}
          {requestBody && (
            <div>
              <h4 className="text-xs font-bold uppercase mb-3" style={{ color: "#3a3d43", fontFamily: "var(--font-writer)", letterSpacing: "0.05em" }}>
                Request Body
              </h4>
              <CodeBlock code={JSON.stringify(requestBody, null, 2)} language="json" />
            </div>
          )}

          {/* Status codes */}
          <div>
            <h4 className="text-xs font-bold uppercase mb-3" style={{ color: "#3a3d43", fontFamily: "var(--font-writer)", letterSpacing: "0.05em" }}>
              Response Status Codes
            </h4>
            <div className="space-y-2">
              {statusCodes.map((sc) => (
                <div
                  key={sc.code}
                  className="flex items-start gap-3 p-3"
                  style={{ backgroundColor: "rgba(19, 72, 220, 0.04)", borderRadius: "2px", border: "1px solid rgba(19, 72, 220, 0.08)" }}
                >
                  <span
                    className="text-xs font-bold px-2 py-1 rounded shrink-0"
                    style={{ backgroundColor: sc.color, color: "#fff", fontFamily: "var(--font-writer)", letterSpacing: "0.05em", borderRadius: "2px" }}
                  >
                    {sc.code}
                  </span>
                  <div>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: "#3a3d43", fontFamily: "var(--font-writer)", letterSpacing: "-0.025em" }}>
                      {sc.label}
                    </p>
                    <p className="text-xs" style={{ color: "#5d636f", fontFamily: "var(--font-writer)", letterSpacing: "-0.025em" }}>
                      {sc.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Response example */}
          {responseExample && (
            <div>
              <h4 className="text-xs font-bold uppercase mb-3" style={{ color: "#3a3d43", fontFamily: "var(--font-writer)", letterSpacing: "0.05em" }}>
                Response Example (200)
              </h4>
              <CodeBlock code={JSON.stringify(responseExample, null, 2)} language="json" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "endpoints">("overview");

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "endpoints", label: "Endpoints" },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2
              className="font-semibold text-2xl mb-1"
              style={{ fontFamily: "var(--font-plex-serif)", color: "#3a3d43", letterSpacing: "-0.52px" }}
            >
              API Documentation
            </h2>
            <p className="text-sm" style={{ color: "#5d636f", fontFamily: "var(--font-writer)", letterSpacing: "-0.025em" }}>
              iVALT Biometric Authentication API Reference
            </p>
          </div>
          <a
            href="https://documenter.getpostman.com/view/10533913/2sB2j4grRW"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium shrink-0 hover:shadow-hover"
            style={{
              color: "#2b7fff",
              fontFamily: "var(--font-writer)",
              letterSpacing: "-0.025em",
              border: "1px solid rgba(43, 127, 255, 0.3)",
              padding: "10px 20px",
              borderRadius: "2px",
              transition: "box-shadow 0.15s ease, border-color 0.15s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "#2b7fff"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(43, 127, 255, 0.3)"}
          >
            <ExternalLink className="w-4 h-4" />
            Postman Docs
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1" style={{ backgroundColor: "rgba(19, 72, 220, 0.06)", width: "fit-content", borderRadius: "2px" }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-4 py-2 text-sm font-medium rounded transition-all"
              style={{
                backgroundColor: activeTab === tab.key ? "#1348dc" : "transparent",
                color: activeTab === tab.key ? "#ffffff" : "#1348dc",
                fontFamily: "var(--font-writer)",
                letterSpacing: "-0.025em",
                borderRadius: "2px",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Base URL */}
          <div
            className="p-5 border hover:shadow-hover"
            style={{ backgroundColor: "#ffffff", borderRadius: "2px", borderColor: "rgba(204, 207, 211, 0.5)", boxShadow: "rgba(111, 123, 144, 0.05) 0px -2px 0px 0px inset", transition: "box-shadow 0.15s ease" }}
          >
            <h3 className="font-semibold text-base mb-4" style={{ fontFamily: "var(--font-plex-serif)", color: "#3a3d43", letterSpacing: "-0.02em" }}>
              Base URL
            </h3>
            <div
              className="flex items-center gap-3 p-3"
              style={{ backgroundColor: "#282c33", borderRadius: "2px" }}
            >
              <code className="text-sm flex-1" style={{ color: "#8ec5ff", fontFamily: "var(--font-zed-mono)", letterSpacing: "0.05em" }}>
                https://api.ivalt.com
              </code>
              <button onClick={() => copyToClipboard("https://api.ivalt.com")} className="text-white/40 hover:text-white">
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Auth flow steps */}
          <div
            className="p-5 border hover:shadow-hover"
            style={{ backgroundColor: "#ffffff", borderRadius: "2px", borderColor: "rgba(204, 207, 211, 0.5)", boxShadow: "rgba(111, 123, 144, 0.05) 0px -2px 0px 0px inset", transition: "box-shadow 0.15s ease" }}
          >
            <h3 className="font-semibold text-base mb-6" style={{ fontFamily: "var(--font-plex-serif)", color: "#3a3d43", letterSpacing: "-0.02em" }}>
              Authentication Flow
            </h3>
            <div className="space-y-6">
              {[
                {
                  step: "1",
                  title: "BiometricAuthRequest",
                  desc: "Call this endpoint to send a push notification to the user's iVALT mobile app, initiating the biometric authentication process.",
                  color: "#1348dc",
                  bg: "rgba(19, 72, 220, 0.08)",
                  border: "rgba(19, 72, 220, 0.15)",
                },
                {
                  step: "2",
                  title: "Poll BiometricResultRequest",
                  desc: "Poll this endpoint every 2 seconds to check authentication status. Continue polling until you receive a definitive response.",
                  color: "#2b7fff",
                  bg: "rgba(43, 127, 255, 0.08)",
                  border: "rgba(43, 127, 255, 0.15)",
                },
                {
                  step: "3",
                  title: "Handle Response",
                  desc: "Status 200 = authenticated. Status 422 = still pending (keep polling). Status 403 = failed/timeout. Status 404 = user not found.",
                  color: "#2d6a4f",
                  bg: "rgba(45, 106, 79, 0.08)",
                  border: "rgba(45, 106, 79, 0.15)",
                },
              ].map((s) => (
                <div key={s.step} className="flex gap-4">
                  <div
                    className="w-8 h-8 flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ backgroundColor: s.color, fontFamily: "var(--font-writer)", borderRadius: "2px", border: "1px solid", borderColor: s.border, letterSpacing: "0.05em" }}
                  >
                    {s.step}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-semibold text-sm mb-1" style={{ color: "#3a3d43", fontFamily: "var(--font-writer)", letterSpacing: "-0.025em" }}>
                      {s.title}
                    </p>
                    <p className="text-sm" style={{ color: "#5d636f", fontFamily: "var(--font-writer)", lineHeight: 1.6, letterSpacing: "-0.025em" }}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status codes reference */}
          <div
            className="p-5 border hover:shadow-hover"
            style={{ backgroundColor: "#ffffff", borderRadius: "2px", borderColor: "rgba(204, 207, 211, 0.5)", boxShadow: "rgba(111, 123, 144, 0.05) 0px -2px 0px 0px inset", transition: "box-shadow 0.15s ease" }}
          >
            <h3 className="font-semibold text-base mb-4" style={{ fontFamily: "var(--font-plex-serif)", color: "#3a3d43", letterSpacing: "-0.02em" }}>
              Status Code Reference
            </h3>
            <div className="space-y-3">
              {[
                { code: "200", label: "Authenticated", desc: "User successfully authenticated via biometrics.", bg: "rgba(45, 106, 79, 0.08)", text: "#2d6a4f", border: "rgba(45, 106, 79, 0.15)" },
                { code: "404", label: "User Not Found", desc: "The mobile number is not registered in the iVALT system.", bg: "rgba(197, 48, 48, 0.08)", text: "#c53030", border: "rgba(197, 48, 48, 0.15)" },
                { code: "422", label: "Pending", desc: "User has not yet approved the authentication. Continue polling every 2 seconds.", bg: "rgba(192, 86, 33, 0.08)", text: "#c05621", border: "rgba(192, 86, 33, 0.15)" },
                { code: "403", label: "Failed / Timeout", desc: "Authentication failed (biometric rejected), security token missing, or 5-minute window exceeded.", bg: "rgba(197, 48, 48, 0.08)", text: "#c53030", border: "rgba(197, 48, 48, 0.15)" },
              ].map((sc) => (
                <div
                  key={sc.code}
                  className="flex items-start gap-4 p-3"
                  style={{ backgroundColor: sc.bg, borderRadius: "2px", border: "1px solid", borderColor: sc.border }}
                >
                  <span
                    className="text-sm font-bold shrink-0"
                    style={{ color: sc.text, fontFamily: "var(--font-writer)", letterSpacing: "-0.025em", minWidth: "40px" }}
                  >
                    {sc.code}
                  </span>
                  <div>
                    <p className="text-sm font-semibold mb-0.5" style={{ color: sc.text, fontFamily: "var(--font-writer)", letterSpacing: "-0.025em" }}>
                      {sc.label}
                    </p>
                    <p className="text-xs" style={{ color: "#5d636f", fontFamily: "var(--font-writer)", letterSpacing: "-0.025em" }}>
                      {sc.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Endpoints tab */}
      {activeTab === "endpoints" && (
        <div>
          <EndpointCard
            method="POST"
            path="/BiometricAuthRequest"
            title="Initiate Auth"
            description="Triggers a biometric authentication push notification to the user's iVALT mobile application. This is always Step 1 of the auth flow."
            requestHeaders={{
              "Content-Type": "application/json",
              "token": "YOUR_IVALT_SECURITY_TOKEN",
              "x-api-key": "YOUR_API_KEY",
            }}
            requestBody={{ mobile_number: "+919876543210" }}
            statusCodes={[
              { code: 200, label: "Success", description: "Notification sent to user's iVALT app", color: "#2d6a4f" },
              { code: 404, label: "User Not Found", description: "No iVALT account associated with this phone number", color: "#c53030" },
              { code: 403, label: "Forbidden", description: "Invalid or missing security token", color: "#c53030" },
            ]}
            responseExample={{ success: true, message: "Authentication request sent" }}
          />

          <EndpointCard
            method="POST"
            path="/BiometricResultRequest"
            title="Poll Auth Result"
            description="Polls for the result of a biometric authentication request. Call every 2 seconds after BiometricAuthRequest. Continue until you receive 200, 403, or 404."
            requestHeaders={{
              "Content-Type": "application/json",
              "token": "YOUR_IVALT_SECURITY_TOKEN",
              "x-api-key": "YOUR_API_KEY",
            }}
            requestBody={{ mobile_number: "+919876543210" }}
            statusCodes={[
              { code: 200, label: "Authenticated", description: "User successfully verified via biometrics. Stop polling.", color: "#2d6a4f" },
              { code: 422, label: "Pending", description: "Authentication in progress. Continue polling every 2 seconds.", color: "#c05621" },
              { code: 403, label: "Failed / Timeout", description: "Biometric rejected, missing token, or 5-minute window exceeded.", color: "#c53030" },
              { code: 404, label: "Not Found", description: "User not registered with iVALT.", color: "#c53030" },
            ]}
            responseExample={{ authenticated: true, user: { mobile_number: "+919876543210", verified_at: "2025-05-07T10:30:00Z" } }}
          />

          <EndpointCard
            method="POST"
            path="/BiometricGeoFenceResult"
            title="Geo-Fence Auth Result"
            description="Similar to BiometricResultRequest but includes geofence and time window verification. Use this instead of BiometricResultRequest when location-based restrictions are required."
            requestHeaders={{
              "Content-Type": "application/json",
              "token": "YOUR_IVALT_SECURITY_TOKEN",
              "x-api-key": "YOUR_API_KEY",
            }}
            requestBody={{
              mobile_number: "+919876543210",
              latitude: 30.7333,
              longitude: 76.7794,
              radius_meters: 500,
            }}
            statusCodes={[
              { code: 200, label: "Authenticated & Within Geofence", description: "User verified and located within the specified area.", color: "#2d6a4f" },
              { code: 422, label: "Pending", description: "Authentication in progress or location check ongoing.", color: "#c05621" },
              { code: 403, label: "Failed", description: "Auth failed, outside geofence, or time window expired.", color: "#c53030" },
              { code: 404, label: "Not Found", description: "User not registered with iVALT.", color: "#c53030" },
            ]}
          />
        </div>
      )}
    </div>
  );
}
