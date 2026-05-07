"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, Copy, Key, Loader2, LockKeyhole, Plus, ShieldCheck, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface ApiKey {
  id: string;
  keyName: string;
  keyValue: string | null;
  isActive: boolean;
  createdAt: string;
  awsKeyId: string;
}

const MAX_KEYS = 4;

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<{ id: string; value: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    const res = await fetch("/api/keys");
    const data = await res.json();
    setKeys(data.keys || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = async () => {
    if (!newKeyName.trim() || newKeyName.trim().length < 3) {
      toast.error("Key name must be at least 3 characters");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/keys/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyName: newKeyName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create key");
        return;
      }
      setNewlyCreatedKey({ id: data.key.id, value: data.key.keyValue });
      setNewKeyName("");
      setShowCreate(false);
      await fetchKeys();
      toast.success("API key created successfully");
    } catch {
      toast.error("Network error");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete key");
        return;
      }
      setKeys((k) => k.filter((key) => key.id !== id));
      if (newlyCreatedKey?.id === id) setNewlyCreatedKey(null);
      toast.success("API key deleted");
    } catch {
      toast.error("Network error");
    } finally {
      setDeletingId(null);
      setDeleteConfirm(null);
    }
  };

  const handleToggle = async (id: string, currentState: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/keys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentState }),
      });
      if (!res.ok) {
        toast.error("Failed to update key");
        return;
      }
      setKeys((ks) => ks.map((k) => (k.id === id ? { ...k, isActive: !currentState } : k)));
      toast.success(`Key ${!currentState ? "enabled" : "disabled"}`);
    } catch {
      toast.error("Network error");
    } finally {
      setTogglingId(null);
    }
  };

  const copyToClipboard = (text: string, label = "Copied!") => {
    navigator.clipboard.writeText(text);
    toast.success(label);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const activeCount = keys.filter((key) => key.isActive).length;
  const availableSlots = MAX_KEYS - keys.length;
  const usagePercent = Math.min(100, Math.round((keys.length / MAX_KEYS) * 100));

  if (loading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Card className="border-primary/10 bg-card shadow-sm shadow-foreground/5">
          <CardContent className="flex h-64 items-center justify-center p-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              Loading key vault…
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="relative overflow-hidden border-primary/10 bg-card shadow-sm shadow-foreground/5">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(97,31,105,0.16),transparent_58%)]" />
          <CardContent className="relative flex min-h-[310px] flex-col justify-between gap-10 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="border-primary/15 bg-primary/5 text-primary">
                  <LockKeyhole className="mr-1 size-3" />
                  Credential vault
                </Badge>
                <span className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">Keys are shown once</span>
              </div>
              <div className="max-w-3xl">
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl lg:text-4xl">
                  Keep every integration keyed and controlled.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Create environment-specific API keys, disable stale credentials, and keep production access inside the iVALT usage plan.
                </p>
              </div>
            </div>
            {keys.length < MAX_KEYS && !showCreate && (
              <Button onClick={() => setShowCreate(true)} size="lg" className="w-fit shadow-sm shadow-primary/20">
                <Plus data-icon="inline-start" />
                Create API key
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-card shadow-sm shadow-foreground/5">
          <CardHeader className="p-6 pb-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl tracking-[-0.02em]">Capacity</CardTitle>
                <CardDescription>Each account can keep up to {MAX_KEYS} API keys.</CardDescription>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Key className="size-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 p-6">
            <div>
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-5xl font-semibold tracking-[-0.04em]">{keys.length}/{MAX_KEYS}</p>
                  <p className="text-sm text-muted-foreground">key slots used</p>
                </div>
                <Badge variant={availableSlots > 0 ? "secondary" : "destructive"}>
                  {availableSlots > 0 ? `${availableSlots} open` : "Limit reached"}
                </Badge>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${usagePercent}%` }} />
              </div>
            </div>
            <Separator />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
              <div className="rounded-2xl border border-border/80 bg-background/70 p-4">
                <p className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">Active</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{activeCount}</p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-background/70 p-4">
                <p className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">Available</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{availableSlots}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {newlyCreatedKey && (
        <Card className="border-emerald-500/25 bg-emerald-500/5 shadow-sm shadow-emerald-950/5">
          <CardHeader className="p-5 pb-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-base tracking-[-0.01em]">Key created — copy it now</CardTitle>
                  <CardDescription>This value is only visible once. Store it before leaving this page.</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setNewlyCreatedKey(null)}>
                <X />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-card p-3">
              <code className="min-w-0 flex-1 break-all text-xs leading-6">{newlyCreatedKey.value}</code>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(newlyCreatedKey.value, "API key copied!")}>
                <Copy data-icon="inline-start" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showCreate && (
        <Card className="border-primary/10 bg-card shadow-sm shadow-foreground/5">
          <CardHeader className="p-6 pb-0">
            <CardTitle className="text-xl tracking-[-0.02em]">Create new API key</CardTitle>
            <CardDescription>Name the credential by environment or application so future rotation is obvious.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor="keyName">Key name</Label>
                <Input
                  id="keyName"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Production App, Staging SDK, Partner Sandbox"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={creating}>
                  {creating && <Loader2 data-icon="inline-start" className="animate-spin" />}
                  Create key
                </Button>
                <Button variant="outline" onClick={() => { setShowCreate(false); setNewKeyName(""); }}>
                  Cancel
                </Button>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Names must be at least 3 characters. The secret is shown once after creation.</p>
          </CardContent>
        </Card>
      )}

      {keys.length >= MAX_KEYS && (
        <Card className="border-amber-500/25 bg-amber-500/5 shadow-sm shadow-amber-950/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="size-5 shrink-0 text-amber-700" />
            <p className="text-sm">Maximum of {MAX_KEYS} API keys reached. Delete an existing key to create a new one.</p>
          </CardContent>
        </Card>
      )}

      <section className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
        <Card className="border-primary/10 bg-card shadow-sm shadow-foreground/5">
          <CardHeader className="p-6 pb-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle className="text-2xl tracking-[-0.025em]">API keys</CardTitle>
                <CardDescription>{keys.length === 0 ? "Create your first credential to start integrating." : "Rotate, disable, or delete environment credentials."}</CardDescription>
              </div>
              {keys.length < MAX_KEYS && !showCreate && (
                <Button onClick={() => setShowCreate(true)} variant="outline" className="w-fit bg-card">
                  <Plus data-icon="inline-start" />
                  New key
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {keys.length === 0 ? (
              <div className="flex flex-col items-center rounded-3xl border border-dashed border-primary/20 bg-primary/5 px-6 py-14 text-center">
                <div className="mb-5 flex size-14 items-center justify-center rounded-3xl bg-card text-primary shadow-sm shadow-foreground/5">
                  <Key className="size-7" />
                </div>
                <h3 className="text-xl font-semibold tracking-[-0.02em]">No API keys yet</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Create your first key to call iVALT biometric authentication endpoints from your backend.</p>
                <Button onClick={() => setShowCreate(true)} className="mt-6">
                  <Plus data-icon="inline-start" />
                  Create first key
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {keys.map((key) => (
                  <Card key={key.id} size="sm" className={cn("border-border/80 bg-background/70 shadow-none", !key.isActive && "opacity-70")}>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
                        <div className="flex min-w-0 flex-1 gap-4">
                          <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl", key.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                            <Key className="size-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold tracking-[-0.01em]">{key.keyName}</p>
                              <Badge variant={key.isActive ? "default" : "secondary"}>{key.isActive ? "Active" : "Disabled"}</Badge>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <code className="truncate text-xs text-muted-foreground">{key.keyValue || "••••••••••••••••••••••••"}</code>
                              {key.keyValue && (
                                <Button variant="ghost" size="icon" className="size-7" onClick={() => copyToClipboard(key.keyValue!, "Key prefix copied")}>
                                  <Copy />
                                </Button>
                              )}
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">Created {formatDate(key.createdAt)} · AWS ID: {key.awsKeyId.slice(0, 12)}…</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-border/80 pt-4 xl:border-t-0 xl:pt-0">
                          <div className="flex items-center gap-2 rounded-full border border-border/80 bg-card px-3 py-2">
                            <span className="text-xs font-medium text-muted-foreground">{togglingId === key.id ? "Updating" : key.isActive ? "Enabled" : "Disabled"}</span>
                            <Switch checked={key.isActive} onCheckedChange={() => handleToggle(key.id, key.isActive)} disabled={togglingId === key.id} />
                          </div>
                          {deleteConfirm === key.id ? (
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(key.id)} disabled={deletingId === key.id}>
                                {deletingId === key.id ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Trash2 data-icon="inline-start" />}
                                Delete
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                            </div>
                          ) : (
                            <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(key.id)}>
                              <Trash2 className="text-muted-foreground" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-card shadow-sm shadow-foreground/5">
          <CardHeader className="p-6 pb-0">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg tracking-[-0.01em]">Request headers</CardTitle>
                <CardDescription>Include both headers from your backend.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="rounded-2xl border border-border/80 bg-background/70 p-4 font-mono text-xs leading-6">
              <p className="mb-2 text-muted-foreground">// Include in request headers</p>
              <p>x-api-key: YOUR_API_KEY</p>
              <p>token: YOUR_IVALT_SECURITY_TOKEN</p>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Use one key per environment where possible. Disable credentials before deleting them when you need a reversible safety step.
            </p>
          </CardContent>
          <CardFooter className="p-6">
            <Button asChild variant="outline" className="w-full bg-card">
              <a href="/dashboard/docs#authentication">
                View auth docs
                <ArrowRight data-icon="inline-end" />
              </a>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
