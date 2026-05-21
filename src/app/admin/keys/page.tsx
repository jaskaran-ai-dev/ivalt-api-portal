"use client";

import { useEffect, useState } from "react";
import { Key, ShieldCheck } from "lucide-react";
import AdminShell from "@/components/layout/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  keyName: string;
  awsKeyId: string;
  keyValue: string | null;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
  user: {
    id: string;
    phoneNumber: string;
    name: string | null;
    status: string;
  } | null;
}

export default function AdminKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/keys");
      const data = await res.json();
      setKeys(data.keys || []);
    } catch (error) {
      toast.error("Failed to fetch API keys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const filteredKeys = keys.filter((key) => {
    const matchesSearch = search === "" || 
      key.keyName.toLowerCase().includes(search.toLowerCase()) ||
      key.awsKeyId.toLowerCase().includes(search.toLowerCase()) ||
      (key.user?.name && key.user.name.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && key.isActive) ||
      (statusFilter === "inactive" && !key.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const activeCount = filteredKeys.filter(k => k.isActive).length;
  const inactiveCount = filteredKeys.filter(k => !k.isActive).length;

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-[-0.03em]">API Keys</h1>
          <p className="text-sm text-muted-foreground">
            Monitor all API keys across the system
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredKeys.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{activeCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">{inactiveCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recently Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredKeys.filter(k => k.lastUsedAt).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Showing {filteredKeys.length} keys across all users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <input
                type="text"
                placeholder="Search keys..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1 text-sm rounded-md ${statusFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter("active")}
                  className={`px-3 py-1 text-sm rounded-md ${statusFilter === "active" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  Active
                </button>
                <button
                  onClick={() => setStatusFilter("inactive")}
                  className={`px-3 py-1 text-sm rounded-md ${statusFilter === "inactive" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  Inactive
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredKeys.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Key className="size-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold">No API keys found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  No keys match the current filters.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key Name</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{key.keyName}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {key.awsKeyId.slice(0, 12)}…
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <ShieldCheck className="size-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {key.user?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {key.user?.phoneNumber}
                            </p>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs mt-1 ${
                                key.user?.status === "approved" 
                                  ? "bg-emerald-500/10 text-emerald-700"
                                  : key.user?.status === "rejected"
                                  ? "bg-red-500/10 text-red-700"
                                  : "bg-amber-500/10 text-amber-700"
                              }`}
                            >
                              {key.user?.status || "pending"}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={key.isActive ? "secondary" : "outline"}>
                          {key.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(key.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        {key.lastUsedAt ? (
                          <span className="text-sm">
                            {new Date(key.lastUsedAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}