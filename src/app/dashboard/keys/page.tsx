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
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#1348dc" }} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h2
            className="font-bold text-2xl mb-1"
            style={{ fontFamily: "'IBM Plex Serif', serif", color: "#3a3d43", letterSpacing: "-0.52px" }}
          >
            API Keys
          </h2>
          <p className="text-sm" style={{ color: "#5d636f", fontFamily: "'Inter', sans-serif", letterSpacing: "-0.025em" }}>
            {keys.length} of {MAX_KEYS} keys used
          </p>
        </div>
        {keys.length < MAX_KEYS && !showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 font-semibold text-sm shrink-0"
            style={{
              backgroundColor: "#1348dc",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "2px",
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "-0.025em",
              boxShadow: "rgb(5, 55, 148) 0px -2px 0px 0px inset",
            }}
          >
            <Plus className="w-5 h-5" />
            New Key
          </button>
        )}
      </div>

      {/* Newly created key — show full value once */}
      {newlyCreatedKey && (
        <div
          className="mb-6 p-5 border relative"
          style={{
            backgroundColor: "#f4f4f2",
            borderColor: "#a1c181",
            borderRadius: "2px",
          }}
        >
          <button
            className="absolute top-4 right-4"
            style={{ color: "#b2b5bb" }}
            onClick={() => setNewlyCreatedKey(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#a1c181" }} />
            <p className="text-sm font-semibold" style={{ color: "#3a3d43", fontFamily: "'Inter', sans-serif" }}>
              Key created — copy it now, you won't see it again
            </p>
          </div>
          <div
            className="flex items-center gap-3 p-3 border"
            style={{ backgroundColor: "#fff", borderColor: "#cccfd3", borderRadius: "2px" }}
          >
            <code
              className="flex-1 text-xs break-all"
              style={{ color: "#3a3d43", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.05em" }}
            >
              {newlyCreatedKey.value}
            </code>
            <button
              onClick={() => copyToClipboard(newlyCreatedKey.value, "API key copied!")}
              className="shrink-0 p-2 transition-colors"
              style={{ borderRadius: "2px" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f4f4f2")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Copy className="w-5 h-5" style={{ color: "#1348dc" }} />
            </button>
          </div>
        </div>
      )}

      {/* Create new key form */}
      {showCreate && (
        <div
          className="mb-6 p-5 border"
          style={{
            backgroundColor: "#fff",
            borderRadius: "2px",
            borderColor: "#cccfd3",
            boxShadow: "rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.1) 0px 1px 2px -1px",
          }}
        >
          <h3
            className="font-semibold text-base mb-4"
            style={{ fontFamily: "'IBM Plex Serif', serif", color: "#3a3d43", letterSpacing: "-0.02em" }}
          >
            Create New API Key
          </h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Production App, Mobile SDK"
                className="w-full px-4 py-3 border text-sm outline-none"
                style={{
                  borderColor: "#cccfd3",
                  borderRadius: "2px",
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: "-0.025em",
                  color: "#3a3d43",
                  backgroundColor: "#f4f4f2",
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 font-semibold text-sm shrink-0"
              style={{
                backgroundColor: "#1348dc",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "2px",
                fontFamily: "'Inter', sans-serif",
                boxShadow: "rgb(5, 55, 148) 0px -2px 0px 0px inset",
              }}
            >
              {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create"}
            </button>
            <button
              onClick={() => { setShowCreate(false); setNewKeyName(""); }}
              className="p-3 border text-sm"
              style={{ borderColor: "#cccfd3", color: "#5d636f", borderRadius: "2px" }}
            >
              Cancel
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: "#5d636f", fontFamily: "'Inter', sans-serif", letterSpacing: "-0.025em" }}>
            Name must be at least 3 characters. The key value is shown only once after creation.
          </p>
        </div>
      )}

      {/* Keys limit warning */}
      {keys.length >= MAX_KEYS && (
        <div
          className="mb-6 flex items-center gap-3 p-4 border"
          style={{ backgroundColor: "#fff", borderColor: "#dec184", borderRadius: "2px" }}
        >
          <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: "#dec184" }} />
          <p className="text-sm" style={{ color: "#464b57", fontFamily: "'Inter', sans-serif", letterSpacing: "-0.025em" }}>
            Maximum of {MAX_KEYS} API keys reached. Delete an existing key to create a new one.
          </p>
        </div>
      )}

      {/* Keys list */}
      {keys.length === 0 ? (
        <div
          className="text-center py-16 border border-dashed"
          style={{ borderColor: "#cccfd3", borderRadius: "2px" }}
        >
          <Key className="w-10 h-10 mx-auto mb-4" style={{ color: "#b2b5bb" }} />
          <h3
            className="font-semibold text-base mb-2"
            style={{ fontFamily: "'IBM Plex Serif', serif", color: "#3a3d43" }}
          >
            No API keys yet
          </h3>
          <p className="text-sm mb-6" style={{ color: "#5d636f", fontFamily: "'Inter', sans-serif", letterSpacing: "-0.025em" }}>
            Create your first API key to start integrating iVALT biometric auth
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 font-semibold text-sm"
            style={{
              backgroundColor: "#1348dc",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "2px",
              fontFamily: "'Inter', sans-serif",
              boxShadow: "rgb(5, 55, 148) 0px -2px 0px 0px inset",
            }}
          >
            <Plus className="w-5 h-5" />
            Create First Key
          </button>
        </div>
      ) : (
        <div className="space-y-2 stagger-children">
          {keys.map((key) => (
            <div
              key={key.id}
              className="animate-fade-in-up p-5 border"
              style={{
                backgroundColor: "#fff",
                borderRadius: "2px",
                borderColor: key.isActive ? "#cccfd3" : "#d07277",
                boxShadow: "rgba(111, 123, 144, 0.05) 0px -2px 0px 0px inset",
                opacity: key.isActive ? 1 : 0.75,
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 flex items-center justify-center shrink-0"
                  style={{ backgroundColor: key.isActive ? "#bedbff" : "#f4f4f2", borderRadius: "2px" }}
                >
                  <Key
                    className="w-6 h-6"
                    style={{ color: key.isActive ? "#1348dc" : "#b2b5bb" }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p
                      className="font-semibold text-sm"
                      style={{ fontFamily: "'Inter', sans-serif", color: "#3a3d43", letterSpacing: "-0.025em" }}
                    >
                      {key.keyName}
                    </p>
                    <span
                      className="text-xs px-2 py-0.5 font-medium"
                      style={{
                        backgroundColor: key.isActive ? "#bedbff" : "#f4f4f2",
                        color: key.isActive ? "#1348dc" : "#b2b5bb",
                        fontFamily: "'Inter', sans-serif",
                        borderRadius: "2px",
                      }}
                    >
                      {key.isActive ? "Active" : "Disabled"}
                    </span>
                  </div>

                  {/* Masked key */}
                  <div className="flex items-center gap-2 mb-2">
                    <code
                      className="text-xs"
                      style={{ color: "#5d636f", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.05em" }}
                    >
                      {key.keyValue || "••••••••••••••••••••••••"}
                    </code>
                    {key.keyValue && (
                      <button
                        onClick={() => copyToClipboard(key.keyValue!, "Key prefix copied")}
                        className="p-1 transition-colors"
                        style={{ borderRadius: "2px" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f4f4f2")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <Copy className="w-4 h-4" style={{ color: "#5d636f" }} />
                      </button>
                    )}
                  </div>

                  <p className="text-xs" style={{ color: "#b2b5bb", fontFamily: "'Inter', sans-serif", letterSpacing: "-0.025em" }}>
                    Created {formatDate(key.createdAt)} · AWS ID: {key.awsKeyId.slice(0, 12)}…
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(key.id, key.isActive)}
                    disabled={togglingId === key.id}
                    title={key.isActive ? "Disable key" : "Enable key"}
                    className="p-2 transition-colors"
                    style={{ borderRadius: "2px" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f4f4f2")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    {togglingId === key.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#5d636f" }} />
                    ) : key.isActive ? (
                      <ToggleRight className="w-6 h-6" style={{ color: "#1348dc" }} />
                    ) : (
                      <ToggleLeft className="w-6 h-6" style={{ color: "#b2b5bb" }} />
                    )}
                  </button>

                  {/* Delete */}
                  {deleteConfirm === key.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(key.id)}
                        disabled={deletingId === key.id}
                        className="px-3 py-1.5 text-xs font-medium"
                        style={{ backgroundColor: "#d07277", color: "#fff", fontFamily: "'Inter', sans-serif", borderRadius: "2px" }}
                      >
                        {deletingId === key.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 text-xs font-medium border"
                        style={{ borderColor: "#cccfd3", color: "#5d636f", fontFamily: "'Inter', sans-serif", borderRadius: "2px" }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(key.id)}
                      className="p-2 transition-colors"
                      style={{ borderRadius: "2px" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f4f4f2")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <Trash2 className="w-5 h-5" style={{ color: "#b2b5bb" }} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Usage guide */}
      <div
        className="mt-8 p-6 border"
        style={{
          backgroundColor: "#fff",
          borderRadius: "2px",
          borderColor: "#cccfd3",
          boxShadow: "rgba(111, 123, 144, 0.05) 0px -2px 0px 0px inset",
        }}
      >
        <h3
          className="font-semibold text-sm mb-4"
          style={{ fontFamily: "'IBM Plex Serif', serif", color: "#3a3d43", letterSpacing: "-0.02em" }}
        >
          Using your API Key
        </h3>
        <div
          className="p-4 mb-3"
          style={{ backgroundColor: "#282c33", borderRadius: "2px" }}
        >
          <p className="text-xs mb-1" style={{ color: "#8ec5ff", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.05em" }}>
            # Include in request headers
          </p>
          <code className="text-xs block" style={{ color: "#e5e7eb", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.05em", lineHeight: 1.7 }}>
            x-api-key: YOUR_API_KEY
            <br />
            token: YOUR_IVALT_SECURITY_TOKEN
          </code>
        </div>
        <p className="text-xs" style={{ color: "#5d636f", fontFamily: "'Inter', sans-serif", letterSpacing: "-0.025em" }}>
          Include your API key in the <code style={{ fontFamily: "'IBM Plex Mono', monospace" }}>x-api-key</code> header for all requests to the iVALT API.
          The <code style={{ fontFamily: "'IBM Plex Mono', monospace" }}>token</code> header is your iVALT security token from the admin panel.
        </p>
      </div>
    </div>
  );
}
