"use client";

import { useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
};

function CodeBlock({ code, language = "json" }: { code: string; language?: string }) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-muted">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="text-xs font-medium text-muted-foreground">{language}</span>
        <button
          onClick={() => copyToClipboard(code)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Copy className="w-3 h-3" />
          Copy
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs font-mono">{code}</pre>
    </div>
  );
}

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const statusCodes = [
    { code: "200", label: "Authenticated", desc: "User successfully authenticated via biometrics.", variant: "default" as const },
    { code: "404", label: "User Not Found", desc: "The mobile number is not registered in the iVALT system.", variant: "destructive" as const },
    { code: "422", label: "Pending", desc: "User has not yet approved the authentication. Continue polling every 2 seconds.", variant: "secondary" as const },
    { code: "403", label: "Failed / Timeout", desc: "Authentication failed (biometric rejected), security token missing, or 5-minute window exceeded.", variant: "destructive" as const },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">API Documentation</h2>
          <p className="text-sm text-muted-foreground mt-1">iVALT Biometric Authentication API Reference</p>
        </div>
        <a
          href="https://documenter.getpostman.com/view/10533913/2sB2j4grRW"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ExternalLink className="w-4 h-4" />
          Postman Docs
        </a>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Base URL */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Base URL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted font-mono text-sm">
                <code className="flex-1">https://api.ivalt.com</code>
                <button onClick={() => copyToClipboard("https://api.ivalt.com")} className="text-muted-foreground hover:text-foreground">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Auth flow steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Authentication Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { step: "1", title: "BiometricAuthRequest", desc: "Call this endpoint to send a push notification to the user's iVALT mobile app, initiating the biometric authentication process." },
                  { step: "2", title: "Poll BiometricResultRequest", desc: "Poll this endpoint every 2 seconds to check authentication status. Continue polling until you receive a definitive response." },
                  { step: "3", title: "Handle Response", desc: "Status 200 = authenticated. Status 422 = still pending (keep polling). Status 403 = failed/timeout. Status 404 = user not found." },
                ].map((s, i) => (
                  <div key={s.step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                      {s.step}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="font-semibold text-sm mb-1">{s.title}</p>
                      <p className="text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                    {i < 2 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status codes reference */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Code Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {statusCodes.map((sc) => (
                  <div key={sc.code} className="flex items-start gap-4 p-3 rounded-lg bg-muted">
                    <Badge variant={sc.variant} className="shrink-0 font-mono">{sc.code}</Badge>
                    <div>
                      <p className="text-sm font-semibold">{sc.label}</p>
                      <p className="text-xs text-muted-foreground">{sc.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Endpoints tab */}
        <TabsContent value="endpoints" className="mt-4">
          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="auth-request" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">POST</Badge>
                  <span className="font-mono text-sm">/BiometricAuthRequest</span>
                  <span className="text-sm text-muted-foreground">Initiate Auth</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  Triggers a biometric authentication push notification to the user&apos;s iVALT mobile application. This is always Step 1 of the auth flow.
                </p>

                <div>
                  <h4 className="text-xs font-semibold uppercase mb-2 text-muted-foreground">Request Headers</h4>
                  <div className="space-y-2">
                    {[
                      { key: "Content-Type", value: "application/json" },
                      { key: "token", value: "YOUR_IVALT_SECURITY_TOKEN" },
                      { key: "x-api-key", value: "YOUR_API_KEY" },
                    ].map((h) => (
                      <div key={h.key} className="flex items-center gap-3 text-sm">
                        <code className="px-2 py-1 text-xs rounded bg-muted">{h.key}</code>
                        <span className="text-muted-foreground">{h.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase mb-2 text-muted-foreground">Request Body</h4>
                  <CodeBlock code={JSON.stringify({ mobile_number: "+919876543210" }, null, 2)} />
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase mb-2 text-muted-foreground">Response Status Codes</h4>
                  <div className="space-y-2">
                    {[
                      { code: "200", label: "Success", desc: "Notification sent to user's iVALT app" },
                      { code: "404", label: "User Not Found", desc: "No iVALT account associated with this phone number" },
                      { code: "403", label: "Forbidden", desc: "Invalid or missing security token" },
                    ].map((sc) => (
                      <div key={sc.code} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                        <Badge variant="outline" className="shrink-0 font-mono">{sc.code}</Badge>
                        <div>
                          <p className="text-xs font-semibold">{sc.label}</p>
                          <p className="text-xs text-muted-foreground">{sc.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase mb-2 text-muted-foreground">Response Example (200)</h4>
                  <CodeBlock code={JSON.stringify({ success: true, message: "Authentication request sent" }, null, 2)} />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="result-request" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">POST</Badge>
                  <span className="font-mono text-sm">/BiometricResultRequest</span>
                  <span className="text-sm text-muted-foreground">Poll Auth Result</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  Polls for the result of a biometric authentication request. Call every 2 seconds after BiometricAuthRequest. Continue until you receive 200, 403, or 404.
                </p>

                <div>
                  <h4 className="text-xs font-semibold uppercase mb-2 text-muted-foreground">Request Headers</h4>
                  <div className="space-y-2">
                    {[
                      { key: "Content-Type", value: "application/json" },
                      { key: "token", value: "YOUR_IVALT_SECURITY_TOKEN" },
                      { key: "x-api-key", value: "YOUR_API_KEY" },
                    ].map((h) => (
                      <div key={h.key} className="flex items-center gap-3 text-sm">
                        <code className="px-2 py-1 text-xs rounded bg-muted">{h.key}</code>
                        <span className="text-muted-foreground">{h.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase mb-2 text-muted-foreground">Request Body</h4>
                  <CodeBlock code={JSON.stringify({ mobile_number: "+919876543210" }, null, 2)} />
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase mb-2 text-muted-foreground">Response Status Codes</h4>
                  <div className="space-y-2">
                    {[
                      { code: "200", label: "Authenticated", desc: "User successfully verified via biometrics. Stop polling." },
                      { code: "422", label: "Pending", desc: "Authentication in progress. Continue polling every 2 seconds." },
                      { code: "403", label: "Failed / Timeout", desc: "Biometric rejected, missing token, or 5-minute window exceeded." },
                      { code: "404", label: "Not Found", desc: "User not registered with iVALT." },
                    ].map((sc) => (
                      <div key={sc.code} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                        <Badge variant="outline" className="shrink-0 font-mono">{sc.code}</Badge>
                        <div>
                          <p className="text-xs font-semibold">{sc.label}</p>
                          <p className="text-xs text-muted-foreground">{sc.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase mb-2 text-muted-foreground">Response Example (200)</h4>
                  <CodeBlock code={JSON.stringify({ authenticated: true, user: { mobile_number: "+919876543210", verified_at: "2025-05-07T10:30:00Z" } }, null, 2)} />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="geofence-request" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">POST</Badge>
                  <span className="font-mono text-sm">/BiometricGeoFenceResult</span>
                  <span className="text-sm text-muted-foreground">Geo-Fence Auth Result</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  Similar to BiometricResultRequest but includes geofence and time window verification. Use this instead of BiometricResultRequest when location-based restrictions are required.
                </p>

                <div>
                  <h4 className="text-xs font-semibold uppercase mb-2 text-muted-foreground">Request Headers</h4>
                  <div className="space-y-2">
                    {[
                      { key: "Content-Type", value: "application/json" },
                      { key: "token", value: "YOUR_IVALT_SECURITY_TOKEN" },
                      { key: "x-api-key", value: "YOUR_API_KEY" },
                    ].map((h) => (
                      <div key={h.key} className="flex items-center gap-3 text-sm">
                        <code className="px-2 py-1 text-xs rounded bg-muted">{h.key}</code>
                        <span className="text-muted-foreground">{h.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase mb-2 text-muted-foreground">Request Body</h4>
                  <CodeBlock code={JSON.stringify({
                    mobile_number: "+919876543210",
                    latitude: 30.7333,
                    longitude: 76.7794,
                    radius_meters: 500,
                  }, null, 2)} />
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase mb-2 text-muted-foreground">Response Status Codes</h4>
                  <div className="space-y-2">
                    {[
                      { code: "200", label: "Authenticated & Within Geofence", desc: "User verified and located within the specified area." },
                      { code: "422", label: "Pending", desc: "Authentication in progress or location check ongoing." },
                      { code: "403", label: "Failed", desc: "Auth failed, outside geofence, or time window expired." },
                      { code: "404", label: "Not Found", desc: "User not registered with iVALT." },
                    ].map((sc) => (
                      <div key={sc.code} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                        <Badge variant="outline" className="shrink-0 font-mono">{sc.code}</Badge>
                        <div>
                          <p className="text-xs font-semibold">{sc.label}</p>
                          <p className="text-xs text-muted-foreground">{sc.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  );
}
