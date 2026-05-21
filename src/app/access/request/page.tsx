"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Lock, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AccessRequestPage() {
  const router = useRouter();
  const [useCase, setUseCase] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!useCase.trim() || useCase.trim().length < 10) {
      toast.error("Please describe your use case in at least 10 characters");
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await fetch("/api/access/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useCase: useCase.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.existing) {
          router.push("/access/status");
          return;
        }
        throw new Error(data.error);
      }

      setSubmitted(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit request");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background px-4 py-8">
        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.08fr_0.82fr]">
          <section className="hidden flex-col gap-8 lg:flex">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-[-0.03em]">iVALT</p>
                <p className="text-sm text-muted-foreground">Developer Portal</p>
              </div>
            </div>
            <div className="max-w-2xl">
              <Badge variant="outline" className="mb-5 w-fit border-primary/15 bg-primary/5 text-primary">
                <Lock className="mr-1 size-3" />
                Secure access request
              </Badge>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground xl:text-5xl">
                Your request is under review
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                An admin will review your request and approve access. You'll receive an email notification when access is granted.
              </p>
            </div>
          </section>

          <section className="mx-auto flex w-full max-w-md flex-col gap-6">
            <Card className="border-primary/10 bg-card/95 shadow-xl shadow-foreground/10 backdrop-blur">
              <CardHeader className="p-6 pb-0">
                <div className="mb-5 flex size-12 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-700">
                  <CheckCircle2 className="size-6" />
                </div>
                <CardTitle className="text-2xl tracking-[-0.025em]">Request submitted</CardTitle>
                <CardDescription>
                  Your access request has been sent to the admin team. Please check your email for approval.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Button onClick={() => router.push("/access/status")} className="w-full" size="lg">
                  View Status
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    );
  }

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
          </div>

          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-5 w-fit border-primary/15 bg-primary/5 text-primary">
              <FileText className="mr-1 size-3" />
              Access request required
            </Badge>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground xl:text-5xl">
              Tell us about your integration
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Help us understand your use case. Our team reviews each request to ensure responsible API usage.
            </p>
          </div>

          <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              { label: "Admin review", text: "Manual approval by admin team" },
              { label: "Secure access", text: "Only approved users get API keys" },
              { label: "Email notification", text: "You'll be notified when approved" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border/80 bg-card/70 p-4 shadow-sm shadow-foreground/5 backdrop-blur">
                <p className="text-sm font-semibold tracking-[-0.01em]">{item.label}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-md flex-col gap-6">
          <Card className="border-primary/10 bg-card/95 shadow-xl shadow-foreground/10 backdrop-blur">
            <CardHeader className="p-6 pb-0">
              <div className="mb-5 flex size-12 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <FileText className="size-6" />
              </div>
              <CardTitle className="text-2xl tracking-[-0.025em]">Access Request</CardTitle>
              <CardDescription>
                Describe your use case to get API access
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="useCase">Use Case *</Label>
                  <Textarea
                    id="useCase"
                    value={useCase}
                    onChange={(e) => setUseCase(e.target.value)}
                    placeholder="e.g., Building a mobile app that uses iVALT biometric authentication for user login. Integration with AWS Lambda functions for backend processing."
                    rows={5}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Please be specific about how you plan to use the iVALT API
                  </p>
                </div>

                <Button type="submit" disabled={isLoading || !useCase.trim()} size="lg" className="w-full shadow-sm shadow-primary/20">
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Request
                      <ArrowRight className="ml-2 size-4" />
                    </>
                  )}
                </Button>

                <p className="text-center text-xs leading-5 text-muted-foreground">
                  <Lock className="size-3 mr-1 inline" />
                  Your request is securely reviewed by our admin team
                </p>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}