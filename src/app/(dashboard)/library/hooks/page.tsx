"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  MessageSquare,
  HelpCircle,
  Megaphone,
  BookOpen,
  Zap,
  Sparkles,
  MoreHorizontal,
  Trash2,
  Edit2,
  Copy,
  Check,
  Loader2,
  X,
  Tag,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { SavedHook } from "@/types/database";

const HOOK_TYPES = [
  { value: "question", label: "Question", icon: HelpCircle, color: "#3B82F6" },
  { value: "statement", label: "Statement", icon: Megaphone, color: "#22C55E" },
  { value: "story", label: "Story", icon: BookOpen, color: "#F59E0B" },
  { value: "shock", label: "Shock", icon: Zap, color: "#EF4444" },
  { value: "challenge", label: "Challenge", icon: Sparkles, color: "#A855F7" },
  { value: "other", label: "Other", icon: MessageSquare, color: "#6B7280" },
] as const;

interface HooksResponse {
  hooks: SavedHook[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

async function fetchHooks(params: {
  type?: string;
  search?: string;
  tag?: string;
}): Promise<HooksResponse> {
  const queryParams = new URLSearchParams();
  if (params.type) queryParams.set("type", params.type);
  if (params.search) queryParams.set("search", params.search);
  if (params.tag) queryParams.set("tag", params.tag);

  const res = await fetch(`/api/hooks?${queryParams}`);
  if (!res.ok) throw new Error("Failed to fetch hooks");
  return res.json();
}

async function createHook(data: {
  hookText: string;
  hookType: string;
  notes?: string;
  tags?: string[];
}) {
  const res = await fetch("/api/hooks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create hook");
  return res.json();
}

async function deleteHook(id: string) {
  const res = await fetch(`/api/hooks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete hook");
  return res.json();
}

export default function SavedHooksPage() {
  const [filterType, setFilterType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["hooks", filterType, searchQuery],
    queryFn: () => fetchHooks({ type: filterType || undefined, search: searchQuery || undefined }),
    staleTime: 30 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hooks"] });
    },
  });

  const copyHook = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getHookTypeConfig = (type: string) => {
    return HOOK_TYPES.find((t) => t.value === type) || HOOK_TYPES[5];
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div className="flex items-center gap-4">
          <Link
            href="/library"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MessageSquare className="w-6 h-6" style={{ color: "#fff" }} />
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>Saved Hooks</h1>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px" }}>
                Your collection of effective video openers
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)",
            border: "none",
            color: "#fff",
            fontWeight: 500,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          <Plus className="w-4 h-4" />
          Add Hook
        </button>
      </header>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: "200px", maxWidth: "400px" }}>
          <Search
            className="w-4 h-4"
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(255,255,255,0.4)",
            }}
          />
          <input
            type="text"
            placeholder="Search hooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 40px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterType("")}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: !filterType ? "1px solid #7C3AED" : "1px solid rgba(255,255,255,0.1)",
              background: !filterType ? "rgba(124, 58, 237, 0.2)" : "rgba(255,255,255,0.05)",
              color: !filterType ? "#7C3AED" : "rgba(255,255,255,0.6)",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            All
          </button>
          {HOOK_TYPES.map(({ value, label, color }) => (
            <button
              key={value}
              onClick={() => setFilterType(value)}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: filterType === value ? `1px solid ${color}` : "1px solid rgba(255,255,255,0.1)",
                background: filterType === value ? `${color}20` : "rgba(255,255,255,0.05)",
                color: filterType === value ? color : "rgba(255,255,255,0.6)",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {data && (
        <div className="flex gap-4 mb-6">
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>Total Hooks</span>
            <p style={{ color: "#fff", fontWeight: 600, fontSize: "18px" }}>{data.pagination.total}</p>
          </div>
        </div>
      )}

      {/* Hooks Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#7C3AED" }} />
        </div>
      ) : error ? (
        <GlassPanel style={{ padding: "40px", textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.5)" }}>Failed to load hooks. Please try again.</p>
        </GlassPanel>
      ) : data?.hooks.length === 0 ? (
        <GlassPanel style={{ padding: "60px", textAlign: "center" }}>
          <MessageSquare className="w-12 h-12 mx-auto mb-4" style={{ color: "rgba(255,255,255,0.2)" }} />
          <h3 style={{ color: "#fff", fontWeight: 600, fontSize: "18px", marginBottom: "8px" }}>No hooks saved yet</h3>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", marginBottom: "20px" }}>
            Start collecting effective video hooks to reference later
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)",
              border: "none",
              color: "#fff",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <Plus className="w-4 h-4" />
            Add Your First Hook
          </button>
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.hooks.map((hook) => {
            const typeConfig = getHookTypeConfig(hook.hook_type);
            const Icon = typeConfig.icon;

            return (
              <GlassPanel key={hook.id} style={{ padding: "16px", position: "relative" }}>
                {/* Type Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        background: `${typeConfig.color}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color: typeConfig.color }} />
                    </div>
                    <span style={{ color: typeConfig.color, fontSize: "12px", fontWeight: 500 }}>
                      {typeConfig.label}
                    </span>
                  </div>

                  {/* Menu */}
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === hook.id ? null : hook.id)}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "6px",
                        background: "rgba(255,255,255,0.05)",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4" style={{ color: "rgba(255,255,255,0.5)" }} />
                    </button>

                    {menuOpenId === hook.id && (
                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "100%",
                          marginTop: "4px",
                          background: "rgba(30,30,35,0.98)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          padding: "4px",
                          zIndex: 10,
                          minWidth: "120px",
                        }}
                      >
                        <button
                          onClick={() => {
                            copyHook(hook.hook_text, hook.id);
                            setMenuOpenId(null);
                          }}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            background: "transparent",
                            border: "none",
                            color: "rgba(255,255,255,0.7)",
                            fontSize: "13px",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                          className="hover:bg-white/10"
                        >
                          <Copy className="w-4 h-4" />
                          Copy
                        </button>
                        <button
                          onClick={() => {
                            deleteMutation.mutate(hook.id);
                            setMenuOpenId(null);
                          }}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            background: "transparent",
                            border: "none",
                            color: "#EF4444",
                            fontSize: "13px",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                          className="hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hook Text */}
                <p style={{ color: "#fff", fontSize: "14px", lineHeight: 1.6, marginBottom: "12px" }}>
                  &ldquo;{hook.hook_text}&rdquo;
                </p>

                {/* Tags */}
                {hook.tags && hook.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {hook.tags.map((tag, i) => (
                      <span
                        key={i}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          background: "rgba(255,255,255,0.05)",
                          color: "rgba(255,255,255,0.5)",
                          fontSize: "11px",
                        }}
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {hook.notes && (
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", fontStyle: "italic" }}>
                    {hook.notes}
                  </p>
                )}

                {/* Copy indicator */}
                {copiedId === hook.id && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      background: "rgba(34, 197, 94, 0.9)",
                      color: "#fff",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Check className="w-4 h-4" />
                    Copied!
                  </div>
                )}
              </GlassPanel>
            );
          })}
        </div>
      )}

      {/* Add Hook Modal */}
      {showAddModal && <AddHookModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

function AddHookModal({ onClose }: { onClose: () => void }) {
  const [hookText, setHookText] = useState("");
  const [hookType, setHookType] = useState<string>("other");
  const [notes, setNotes] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hookText.trim()) {
      setError("Hook text is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createHook({
        hookText: hookText.trim(),
        hookType,
        notes: notes.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["hooks"] });
      onClose();
    } catch {
      setError("Failed to save hook. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "rgba(25, 25, 30, 0.98)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ color: "#fff", fontWeight: 600, fontSize: "18px" }}>Add New Hook</h2>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.05)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X className="w-5 h-5" style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          {/* Hook Text */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: "13px", marginBottom: "8px" }}>
              Hook Text *
            </label>
            <textarea
              value={hookText}
              onChange={(e) => setHookText(e.target.value)}
              placeholder="e.g., POV: You just discovered the secret to..."
              rows={3}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.05)",
                border: error ? "1px solid #EF4444" : "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: "14px",
                resize: "none",
                outline: "none",
              }}
            />
          </div>

          {/* Hook Type */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: "13px", marginBottom: "8px" }}>
              Hook Type
            </label>
            <div className="flex flex-wrap gap-2">
              {HOOK_TYPES.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setHookType(value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: hookType === value ? `1px solid ${color}` : "1px solid rgba(255,255,255,0.1)",
                    background: hookType === value ? `${color}20` : "rgba(255,255,255,0.05)",
                    color: hookType === value ? color : "rgba(255,255,255,0.6)",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: "13px", marginBottom: "8px" }}>
              Tags (optional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={addTag}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.7)",
                  cursor: "pointer",
                }}
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: "rgba(124, 58, 237, 0.2)",
                      color: "#a855f7",
                      fontSize: "12px",
                    }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      <X className="w-3 h-3" style={{ color: "#a855f7" }} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: "13px", marginBottom: "8px" }}>
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why is this hook effective? Where did you find it?"
              rows={2}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: "14px",
                resize: "none",
                outline: "none",
              }}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm mb-4" style={{ color: "#EF4444" }}>
              <X className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.7)",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "10px",
                background: loading ? "rgba(124, 58, 237, 0.5)" : "linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)",
                border: "none",
                color: "#fff",
                fontWeight: 500,
                fontSize: "14px",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Hook"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
