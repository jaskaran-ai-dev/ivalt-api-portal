"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Key, Users, Clock, Activity, BarChart3 } from "lucide-react";
import AdminShell from "@/components/layout/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface UsageStats {
  summary?: {
    totalKeys: number;
    activeKeys: number;
    inactiveKeys: number;
    recentlyUsed: number;
    totalRequests: number;
  };
  usage?: Array<{
    id: string;
    keyName: string;
    isActive: boolean;
    usageCount: number;
    user: { name: string; phoneNumber: string } | null;
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/usage");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of API key usage and user statistics
          </p>
        </header>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">+12 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total API Keys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.summary?.totalKeys ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.summary?.activeKeys ?? 0} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats?.summary?.totalRequests ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recently Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.summary?.recentlyUsed ?? 0}</div>
              <p className="text-xs text-muted-foreground">Used in last 24h</p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Usage Table */}
        <Card>
          <CardHeader>
            <CardTitle>API Key Usage</CardTitle>
            <CardDescription>
              Real-time usage statistics from AWS API Gateway
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Key Name</th>
                    <th className="text-left py-3 px-2">User</th>
                    <th className="text-right py-3 px-2">Requests</th>
                    <th className="text-right py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.usage ?? []).slice(0, 10).map((key) => (
                    <tr key={key.id} className="border-b">
                      <td className="py-3 px-2 font-medium">{key.keyName}</td>
                      <td className="py-3 px-2">
                        {key.user ? (
                          <div>
                            <div>{key.user.name}</div>
                            <div className="text-xs text-muted-foreground">{key.user.phoneNumber}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unknown</span>
                        )}
                      </td>
                      <td className="text-right py-3 px-2">
                        {key.usageCount.toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-2">
                        <Badge variant={key.isActive ? "secondary" : "destructive"}>
                          {key.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}