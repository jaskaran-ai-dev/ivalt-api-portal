"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, ExternalLink, ChevronRight, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
};

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  return (
    <div className="relative rounded-lg overflow-hidden border bg-zinc-950 text-zinc-100">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-xs text-zinc-500 ml-2">{language}</span>
        </div>
        <button
          onClick={() => copyToClipboard(code)}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-zinc-800"
        >
          <Copy className="w-3 h-3" />
          Copy
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">{code}</pre>
    </div>
  );
}

function StatusBadge({ code, label, type }: { code: string; label: string; type: "success" | "error" | "warning" | "info" }) {
  const colors = {
    success: "bg-green-500/10 text-green-600 border-green-500/20",
    error: "bg-red-500/10 text-red-600 border-red-500/20",
    warning: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-md border ${colors[type]}`}>
      <span className="font-mono text-sm font-semibold">{code}</span>
      <span className="text-sm">{label}</span>
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("introduction");

  const sections = [
    { id: "introduction", label: "Introduction" },
    { id: "authentication", label: "Authentication" },
    { id: "endpoints", label: "Endpoints" },
    { id: "errors", label: "Error Codes" },
  ];

  const endpoints = [
    {
      method: "POST",
      path: "/BiometricAuthRequest",
      name: "Initiate Authentication",
      description: "Triggers a biometric authentication push notification to the user's iVALT mobile app. This is always Step 1 of the auth flow.",
      requiresAuth: true,
      code: `curl -X POST https://api.ivalt.com/BiometricAuthRequest \\
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
        { code: "404", label: "User Not Found", type: "error" as const },
        { code: "403", label: "Invalid Token", type: "error" as const },
      ],
    },
    {
      method: "POST",
      path: "/BiometricResultRequest",
      name: "Poll Authentication Result",
      description: "Poll this endpoint every 2 seconds to check authentication status. Continue polling until you receive 200, 403, or 404.",
      requiresAuth: true,
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
        { code: "403", label: "Failed / Timeout", type: "error" as const },
        { code: "404", label: "Not Found", type: "error" as const },
      ],
    },
    {
      method: "POST",
      path: "/BiometricGeoFenceResult",
      name: "Geo-Fence Authentication",
      description: "Similar to BiometricResultRequest but includes geofence and time window verification for location-based restrictions.",
      requiresAuth: true,
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
        { code: "200", label: "Authenticated & Within Geofence", type: "success" as const },
        { code: "422", label: "Pending", type: "warning" as const },
        { code: "403", label: "Failed / Outside Geofence", type: "error" as const },
        { code: "404", label: "Not Found", type: "error" as const },
      ],
    },
  ];

  return (
    <div className="flex h-full">
      {/* Sidebar navigation */}
      <div className="w-64 border-r bg-white shrink-0 hidden lg:block">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">API Reference</h2>
          <p className="text-sm text-muted-foreground mt-1">iVALT Biometric Auth</p>
        </div>
        <nav className="p-4 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? "bg-blue-50 text-blue-700"
                  : "text-muted-foreground hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {section.label}
            </button>
          ))}
          <Separator className="my-4" />
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Endpoints</p>
            {endpoints.map((endpoint) => (
              <a
                key={endpoint.path}
                href={`#${endpoint.path}`}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-gray-100 hover:text-gray-900"
              >
                <Badge variant="outline" className="text-xs font-mono px-1.5 py-0.5">{endpoint.method}</Badge>
                <span className="truncate">{endpoint.name}</span>
              </a>
            ))}
          </div>
        </nav>
        <div className="p-4 border-t">
          <a
            href="https://documenter.getpostman.com/view/10533913/2sB2j4grRW"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            View in Postman
          </a>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-8 space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">iVALT API</h1>
                <p className="text-muted-foreground">Biometric Authentication API v1.0</p>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The iVALT API provides passwordless biometric authentication that ties identity directly to the human — not the device. Integrate our API to add secure, frictionless authentication to your applications.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="w-4 h-4" />
                <span>REST API</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="w-4 h-4" />
                <span>JSON Responses</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="w-4 h-4" />
                <span>Webhooks Supported</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Base URL */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold" id="introduction">Introduction</h2>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1">Base URL</p>
                  <code className="text-lg font-mono text-blue-600">https://api.ivalt.com</code>
                </div>
                <button
                  onClick={() => copyToClipboard("https://api.ivalt.com")}
                  className="p-2 rounded-lg hover:bg-gray-100 text-muted-foreground hover:text-gray-700"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </Card>
          </div>

          <Separator />

          {/* Authentication */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold" id="authentication">Authentication</h2>
            <p className="text-muted-foreground">
              The iVALT API uses API keys to authenticate requests. You can view and manage your API keys in the <Link href="/dashboard/keys" className="text-blue-600 hover:underline">Dashboard</Link>.
            </p>
            <Card className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-mono text-sm font-bold shrink-0">1</div>
                <div>
                  <p className="font-medium">Include your API key</p>
                  <code className="text-sm text-muted-foreground">x-api-key: YOUR_API_KEY</code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-mono text-sm font-bold shrink-0">2</div>
                <div>
                  <p className="font-medium">Include your security token</p>
                  <code className="text-sm text-muted-foreground">token: YOUR_IVALT_SECURITY_TOKEN</code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-mono text-sm font-bold shrink-0">3</div>
                <div>
                  <p className="font-medium">Set Content-Type header</p>
                  <code className="text-sm text-muted-foreground">Content-Type: application/json</code>
                </div>
              </div>
            </Card>
          </div>

          <Separator />

          {/* Endpoints */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold" id="endpoints">Endpoints</h2>
            
            {endpoints.map((endpoint) => (
              <Card key={endpoint.path} className="overflow-hidden" id={endpoint.path.replace("/", "")}>
                <div className="p-6 border-b bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="default" className="bg-blue-600">{endpoint.method}</Badge>
                    <code className="text-lg font-mono">{endpoint.path}</code>
                  </div>
                  <h3 className="text-lg font-semibold">{endpoint.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{endpoint.description}</p>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Request */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Request</h4>
                    <CodeBlock code={endpoint.code} language="bash" />
                  </div>

                  {/* Response */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Response</h4>
                    <CodeBlock code={endpoint.response} language="json" />
                  </div>

                  {/* Status Codes */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Status Codes</h4>
                    <div className="flex flex-wrap gap-2">
                      {endpoint.statusCodes.map((sc) => (
                        <StatusBadge key={sc.code} code={sc.code} label={sc.label} type={sc.type} />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Error Codes */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold" id="errors">Error Codes</h2>
            <div className="grid gap-3">
              <Card className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">200</Badge>
                    <span className="font-semibold">Authenticated</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">User successfully authenticated via biometrics. Stop polling.</p>
                </div>
              </Card>
              <Card className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">422</Badge>
                    <span className="font-semibold">Pending</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">User has not yet approved the authentication. Continue polling every 2 seconds.</p>
                </div>
              </Card>
              <Card className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">403</Badge>
                    <span className="font-semibold">Failed / Timeout</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Authentication failed, security token missing, or 5-minute window exceeded.</p>
                </div>
              </Card>
              <Card className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">404</Badge>
                    <span className="font-semibold">Not Found</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">The mobile number is not registered in the iVALT system.</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t text-center">
            <p className="text-sm text-muted-foreground">
              &copy; 2025 iVALT Inc. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
