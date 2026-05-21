"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, ShieldCheck, Smartphone, Lock } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const ADMIN_PHONE = "+919530654704";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      toast.error("Please enter your mobile number");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Admin authentication successful");
        router.push("/admin/dashboard");
      } else {
        toast.error(data.error || "Authentication failed");
        setIsLoading(false);
      }
    } catch {
      toast.error("Network error");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(97,31,105,0.13),transparent_32%),radial-gradient(circle_at_86%_18%,rgba(53,91,146,0.12),transparent_30%)]" />
      
      <main className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.08fr_0.82fr]">
        <section className="hidden flex-col gap-8 lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-[-0.03em]">iVALT</p>
              <p className="text-sm text-muted-foreground">Admin Portal</p>
            </div>
            <Badge variant="destructive" className="ml-2">Admin</Badge>
          </div>

          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-5 w-fit border-red-200 bg-red-50 text-red-700">
              <Lock className="mr-1 size-3" />
              Restricted Access
            </Badge>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground xl:text-5xl">
              Admin authentication required
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              This portal is restricted to authorized administrators only. Use your registered mobile number to access.
            </p>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-md flex-col gap-6">
          <Card className="border-red-200 bg-card/95 shadow-xl shadow-foreground/10 backdrop-blur">
            <CardHeader className="p-6 pb-0">
              <div className="mb-5 flex size-12 items-center justify-center rounded-3xl bg-red-500/10 text-red-700">
                <Smartphone className="size-6" />
              </div>
              <CardTitle className="text-2xl tracking-[-0.025em]">Admin Login</CardTitle>
              <CardDescription>
                Enter your registered mobile number for biometric authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">Mobile Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 95306 54704"
                    className="text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Admin number: <strong>+91 95306 54704</strong>
                  </p>
                </div>

                <Button type="submit" disabled={isLoading} size="lg" className="w-full shadow-sm shadow-red-200">
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : null}
                  {isLoading ? "Sending request..." : "Continue"}
                  {!isLoading && <ArrowRight className="ml-2 size-4" />}
                </Button>

                <p className="text-center text-xs leading-5 text-muted-foreground">
                  <Lock className="size-3 mr-1 inline" />
                  Secured by iVALT biometric authentication
                </p>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}