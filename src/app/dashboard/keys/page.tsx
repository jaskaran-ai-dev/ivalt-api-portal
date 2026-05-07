"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

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
      setKeys((ks) =>
        ks.map((k) => (k.id === id ? { ...k, isActive: !currentState } : k))
      );
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">API Keys</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {keys.length} of {MAX_KEYS} keys used
          </p>
        </div>
        {keys.length < MAX_KEYS && !showCreate && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" />
            New Key
          </Button>
        )}
      </div>

      {/* Newly created key */}
      {newlyCreatedKey && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <p className="text-sm font-medium">Key created — copy it now, you won&apos;t see it again</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setNewlyCreatedKey(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background border">
              <code className="flex-1 text-xs break-all font-mono">
                {newlyCreatedKey.value}
              </code>
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(newlyCreatedKey.value, "API key copied!")}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create new key form */}
      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Create New API Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Production App, Mobile SDK"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleCreate} disabled={creating}>
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create
                </Button>
                <Button variant="outline" onClick={() => { setShowCreate(false); setNewKeyName(""); }}>
                  Cancel
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Name must be at least 3 characters. The key value is shown only once after creation.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Keys limit warning */}
      {keys.length >= MAX_KEYS && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="py-3 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm">Maximum of {MAX_KEYS} API keys reached. Delete an existing key to create a new one.</p>
          </CardContent>
        </Card>
      )}

      {/* Keys list */}
      {keys.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Key className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold text-lg mb-2">No API keys yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Create your first API key to start integrating iVALT biometric auth
            </p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" />
              Create First Key
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <Card key={key.id} className={!key.isActive ? "opacity-75" : ""}>
              <CardContent className="py-4 px-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Key className={`w-5 h-5 ${key.isActive ? "text-primary" : "text-muted-foreground"}`} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{key.keyName}</p>
                      <Badge variant={key.isActive ? "default" : "secondary"}>
                        {key.isActive ? "Active" : "Disabled"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <code className="text-xs text-muted-foreground font-mono">
                        {key.keyValue || "••••••••••••••••••••••••"}
                      </code>
                      {key.keyValue && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(key.keyValue!, "Key prefix copied")}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Created {formatDate(key.createdAt)} · AWS ID: {key.awsKeyId.slice(0, 12)}…
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={key.isActive}
                        onCheckedChange={() => handleToggle(key.id, key.isActive)}
                        disabled={togglingId === key.id}
                      />
                      {deleteConfirm === key.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(key.id)}
                            disabled={deletingId === key.id}
                          >
                            {deletingId === key.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(key.id)}>
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Usage guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Using your API Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 rounded-lg bg-muted font-mono text-xs space-y-1">
            <p className="text-muted-foreground mb-2">// Include in request headers</p>
            <p>x-api-key: YOUR_API_KEY</p>
            <p>token: YOUR_IVALT_SECURITY_TOKEN</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Include your API key in the <code className="bg-muted px-1 rounded">x-api-key</code> header for all requests to the iVALT API.
            The <code className="bg-muted px-1 rounded">token</code> header is your iVALT security token from the admin panel.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
