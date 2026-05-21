"use client";

import { useEffect, useState } from "react";
import { User, Key } from "lucide-react";
import AdminShell from "@/components/layout/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface User {
  id: string;
  phoneNumber: string;
  name: string | null;
  status: string;
  createdAt: string;
  approvedAt: string | null;
  apiKeyCount: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700">Approved</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-red-500/10 text-red-700">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const filteredUsers = statusFilter === "all" 
    ? users 
    : users.filter(u => u.status === statusFilter);

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.03em]">Users</h1>
            <p className="text-sm text-muted-foreground">
              Manage registered users and their access status
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 text-sm rounded-md ${statusFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("approved")}
              className={`px-3 py-1 text-sm rounded-md ${statusFilter === "approved" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1 text-sm rounded-md ${statusFilter === "pending" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter("rejected")}
              className={`px-3 py-1 text-sm rounded-md ${statusFilter === "rejected" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              Rejected
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {users.filter(u => u.status === "approved").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {users.filter(u => u.status === "pending").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">API Keys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.reduce((sum, u) => sum + u.apiKeyCount, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <User className="size-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold">No users found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  No users match the current filter.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>API Keys</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="size-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.name || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.phoneNumber}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Key className="size-4 text-muted-foreground" />
                          <span>{user.apiKeyCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
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