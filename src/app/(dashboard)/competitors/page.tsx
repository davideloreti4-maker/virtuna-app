"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  Video,
  Trash2,
  RefreshCw,
  X,
  ExternalLink,
  Loader2,
  User,
  BarChart3,
  Percent,
} from "lucide-react";
import type { Competitor } from "@/types/competitor";

// API functions
async function fetchCompetitors(): Promise<{ competitors: Competitor[] }> {
  const res = await fetch("/api/competitors");
  if (!res.ok) throw new Error("Failed to fetch competitors");
  return res.json();
}

async function addCompetitor(data: {
  username: string;
  platform: string;
  niche?: string;
  notes?: string;
}): Promise<{ competitor: Competitor }> {
  const res = await fetch("/api/competitors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to add competitor");
  }
  return res.json();
}

async function deleteCompetitor(id: string): Promise<void> {
  const res = await fetch(`/api/competitors/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete competitor");
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function CompetitorCard({
  competitor,
  onDelete,
}: {
  competitor: Competitor;
  onDelete: () => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="glass-panel p-4 hover:bg-white/5 transition-colors">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center flex-shrink-0">
          {competitor.avatar_url ? (
            <img
              src={competitor.avatar_url}
              alt={competitor.username}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-7 h-7 text-white" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold">@{competitor.username}</h3>
            <a
              href={`https://tiktok.com/@${competitor.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-muted)] hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          {competitor.niche && (
            <p className="text-sm text-[var(--text-tertiary)]">{competitor.niche}</p>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-3 mt-3">
            <div>
              <div className="flex items-center gap-1 text-[var(--text-muted)] text-xs">
                <Users className="w-3 h-3" />
                Followers
              </div>
              <div className="text-white font-semibold">
                {formatNumber(competitor.follower_count)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-[var(--text-muted)] text-xs">
                <Eye className="w-3 h-3" />
                Avg Views
              </div>
              <div className="text-white font-semibold">
                {formatNumber(competitor.avg_views)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-[var(--text-muted)] text-xs">
                <Heart className="w-3 h-3" />
                Avg Likes
              </div>
              <div className="text-white font-semibold">
                {formatNumber(competitor.avg_likes)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-[var(--text-muted)] text-xs">
                <Percent className="w-3 h-3" />
                Engagement
              </div>
              <div className="text-[var(--color-success)] font-semibold">
                {competitor.avg_engagement_rate}%
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">
            {competitor.video_count} videos
          </span>
          {showConfirm ? (
            <div className="flex items-center gap-1">
              <button
                onClick={onDelete}
                className="px-2 py-1 bg-[var(--color-danger)]/20 text-[var(--color-danger)] rounded text-xs"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-2 py-1 bg-white/10 text-white rounded text-xs"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="text-[var(--text-muted)] hover:text-[var(--color-danger)] transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Notes */}
      {competitor.notes && (
        <p className="mt-3 text-sm text-[var(--text-tertiary)] border-t border-white/10 pt-3">
          {competitor.notes}
        </p>
      )}
    </div>
  );
}

function AddCompetitorModal({
  onClose,
  onSubmit,
  isLoading,
  error,
}: {
  onClose: () => void;
  onSubmit: (data: { username: string; platform: string; niche?: string; notes?: string }) => void;
  isLoading: boolean;
  error: string | null;
}) {
  const [username, setUsername] = useState("");
  const [platform, setPlatform] = useState("tiktok");
  const [niche, setNiche] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    onSubmit({
      username: username.trim(),
      platform,
      niche: niche.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel-strong p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Add Competitor</h3>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                @
              </span>
              <input
                type="text"
                className="input w-full pl-8"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace("@", ""))}
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">
              Platform
            </label>
            <select
              className="input w-full bg-[var(--glass-bg)]"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">
              Niche (optional)
            </label>
            <input
              type="text"
              className="input w-full"
              placeholder="e.g., Fitness, Tech, Comedy"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">
              Notes (optional)
            </label>
            <textarea
              className="input w-full h-20 resize-none"
              placeholder="Why are you tracking this competitor?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-[var(--color-danger)] text-sm p-2 bg-[var(--color-danger)]/10 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!username.trim() || isLoading}
              className="btn btn-primary flex-1"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CompetitorsPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["competitors"],
    queryFn: fetchCompetitors,
  });

  const addMutation = useMutation({
    mutationFn: addCompetitor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitors"] });
      setShowAddModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCompetitor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitors"] });
    },
  });

  const filteredCompetitors = data?.competitors.filter((c) =>
    c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.niche?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Calculate aggregate stats
  const avgFollowers = filteredCompetitors.length > 0
    ? Math.round(filteredCompetitors.reduce((sum, c) => sum + c.follower_count, 0) / filteredCompetitors.length)
    : 0;
  const avgEngagement = filteredCompetitors.length > 0
    ? (filteredCompetitors.reduce((sum, c) => sum + c.avg_engagement_rate, 0) / filteredCompetitors.length).toFixed(2)
    : "0";
  const totalVideos = filteredCompetitors.reduce((sum, c) => sum + c.video_count, 0);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)",
              }}
            >
              <Users className="w-5 h-5 text-white" />
            </div>
            Competitor Tracking
          </h1>
          <p className="text-[var(--text-tertiary)] text-sm mt-2">
            Monitor and analyze competitor accounts
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Add Competitor
        </button>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-white">{filteredCompetitors.length}</div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Tracked</div>
        </div>
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-white">{formatNumber(avgFollowers)}</div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Avg Followers</div>
        </div>
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-[var(--color-success)]">{avgEngagement}%</div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Avg Engagement</div>
        </div>
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-white">{formatNumber(totalVideos)}</div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Total Videos</div>
        </div>
      </div>

      {/* Search */}
      <div className="glass-panel p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
          <input
            type="text"
            className="input pl-10 w-full"
            placeholder="Search competitors by username or niche..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Competitor List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="glass-panel p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin mb-4" />
            <p className="text-[var(--text-secondary)]">Loading competitors...</p>
          </div>
        ) : error ? (
          <div className="glass-panel p-12 text-center">
            <p className="text-[var(--color-danger)]">Failed to load competitors</p>
          </div>
        ) : filteredCompetitors.length === 0 ? (
          <div className="glass-panel p-12 text-center">
            <Users className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
            <p className="text-[var(--text-secondary)]">
              {searchQuery ? "No competitors found" : "No competitors tracked yet"}
            </p>
            <p className="text-[var(--text-muted)] text-sm mt-2">
              {searchQuery
                ? "Try a different search term"
                : "Add competitors to start monitoring their performance"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary mt-4"
              >
                <Plus className="w-4 h-4" />
                Add Your First Competitor
              </button>
            )}
          </div>
        ) : (
          filteredCompetitors.map((competitor) => (
            <CompetitorCard
              key={competitor.id}
              competitor={competitor}
              onDelete={() => deleteMutation.mutate(competitor.id)}
            />
          ))
        )}
      </div>

      {/* Info Card */}
      {filteredCompetitors.length > 0 && (
        <div className="glass-panel p-6">
          <h3 className="text-white font-semibold mb-3">Competitor Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-[var(--accent-primary)]" />
              </div>
              <div>
                <p className="text-white font-medium">Top Performer</p>
                <p className="text-[var(--text-muted)]">
                  @{filteredCompetitors[0]?.username} with{" "}
                  {formatNumber(filteredCompetitors[0]?.follower_count || 0)} followers
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-success)]/20 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-4 h-4 text-[var(--color-success)]" />
              </div>
              <div>
                <p className="text-white font-medium">Best Engagement</p>
                <p className="text-[var(--text-muted)]">
                  @{[...filteredCompetitors].sort((a, b) => b.avg_engagement_rate - a.avg_engagement_rate)[0]?.username}{" "}
                  at {[...filteredCompetitors].sort((a, b) => b.avg_engagement_rate - a.avg_engagement_rate)[0]?.avg_engagement_rate}%
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-secondary)]/20 flex items-center justify-center flex-shrink-0">
                <Video className="w-4 h-4 text-[var(--accent-secondary)]" />
              </div>
              <div>
                <p className="text-white font-medium">Most Active</p>
                <p className="text-[var(--text-muted)]">
                  @{[...filteredCompetitors].sort((a, b) => b.video_count - a.video_count)[0]?.username} with{" "}
                  {[...filteredCompetitors].sort((a, b) => b.video_count - a.video_count)[0]?.video_count} videos
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddCompetitorModal
          onClose={() => {
            setShowAddModal(false);
            addMutation.reset();
          }}
          onSubmit={(data) => addMutation.mutate(data)}
          isLoading={addMutation.isPending}
          error={addMutation.error?.message || null}
        />
      )}
    </div>
  );
}
