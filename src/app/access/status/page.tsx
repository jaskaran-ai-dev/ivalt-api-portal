"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, ShieldCheck, Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccessStatusPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "loading">("loading");
  const [accessRequest, setAccessRequest] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/access/me");
        const data = await res.json();

        if (data.error) {
          toast.error(data.error);
          return;
        }

        setStatus(data.status);
        setAccessRequest(data.request);
      } catch (error) {
        toast.error("Failed to fetch status");
      }
    };

    fetchStatus();
  }, []);

  if (status === "loading") {
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
          </section>

          <section className="mx-auto flex w-full max-w-md flex-col gap-6">
            <Card className="border-primary/10 bg-card/95 shadow-xl shadow-foreground/10 backdrop-blur">
              <CardContent className="p-6 pt-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin size-6 text-primary" />
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    );
  }

  const isApproved = status === "approved";
  const isRejected = status === "rejected";
  const isPending = status === "pending";

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
              <Lock className="mr-1 size-3" />
              Access status
            </Badge>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground xl:text-5xl">
              {isApproved ? "Access granted!" : isRejected ? "Access denied" : "Waiting for approval"}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              {isApproved 
                ? "You have been granted API access. You can now manage your API keys in the dashboard."
                : isRejected
                ? "Your access request was not approved. Please contact support for more information."
                : "An admin will review your request. You'll receive an email notification when a decision is made."
              }
            </p>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-md flex-col gap-6">
          <Card className="border-primary/10 bg-card/95 shadow-xl shadow-foreground/10 backdrop-blur">
            <CardHeader className="p-6 pb-0">
              <div className={`mb-5 flex size-12 items-center justify-center rounded-3xl ${
                isApproved ? "bg-emerald-500/10 text-emerald-700" : 
                isRejected ? "bg-red-500/10 text-red-700" : 
                "bg-amber-500/10 text-amber-700"
              }`}>
                {isApproved ? <CheckCircle2 className="size-6" /> : 
                 isRejected ? <XCircle className="size-6" /> : 
                 <Clock className="size-6" />}
              </div>
              <CardTitle className="text-2xl tracking-[-0.025em]">
                {isApproved ? "Approved" : isRejected ? "Rejected" : "Pending Review"}
              </CardTitle>
              <CardDescription>
                {isApproved 
                  ? "Your access has been granted by the admin team"
                  : isRejected
                  ? "Your access request was denied"
                  : "Your request is being reviewed by an admin"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {isApproved && (
                <Button onClick={() => router.push("/dashboard")} className="w-full" size="lg">
                  Go to Dashboard
                </Button>
              )}
              {isPending && (
                <div className="text-center text-sm text-muted-foreground">
                  <p>Please check your email for updates.</p>
                  <p className="mt-2">You'll be redirected automatically when approved.</p>
                </div>
              )}
              {isRejected && (
                <Button variant="outline" onClick={() => router.push("/access/request")} className="w-full">
                  Submit New Request
                </Button>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}