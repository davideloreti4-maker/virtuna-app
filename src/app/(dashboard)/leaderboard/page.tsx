"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Trophy,
  Flame,
  Zap,
  BarChart3,
  TrendingUp,
  Crown,
  Medal,
  Award,
  Loader2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatarUrl: string | null;
  xp: number;
  level: number;
  streakDays: number;
  analysesCount: number;
  viralCount: number;
  badges: string[];
  isCurrentUser: boolean;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  currentUserRank: LeaderboardEntry | null;
  type: string;
}

type LeaderboardType = "xp" | "streak" | "analyses" | "viral";

const leaderboardTypes = [
  { type: "xp" as LeaderboardType, label: "XP Leaders", icon: Zap, color: "#7C3AED" },
  { type: "streak" as LeaderboardType, label: "Streak Kings", icon: Flame, color: "#F59E0B" },
  { type: "analyses" as LeaderboardType, label: "Most Active", icon: BarChart3, color: "#3B82F6" },
  { type: "viral" as LeaderboardType, label: "Viral Masters", icon: TrendingUp, color: "#22C55E" },
];

async function fetchLeaderboard(type: LeaderboardType): Promise<LeaderboardResponse> {
  const res = await fetch(`/api/leaderboard?type=${type}&limit=20`);
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5" style={{ color: "#FFD700" }} />;
    case 2:
      return <Medal className="w-5 h-5" style={{ color: "#C0C0C0" }} />;
    case 3:
      return <Award className="w-5 h-5" style={{ color: "#CD7F32" }} />;
    default:
      return <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: "14px" }}>#{rank}</span>;
  }
}

function getRankBackground(rank: number, isCurrentUser: boolean) {
  if (isCurrentUser) return "rgba(124, 58, 237, 0.15)";
  switch (rank) {
    case 1:
      return "linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)";
    case 2:
      return "linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(192, 192, 192, 0.05) 100%)";
    case 3:
      return "linear-gradient(135deg, rgba(205, 127, 50, 0.15) 0%, rgba(205, 127, 50, 0.05) 100%)";
    default:
      return "transparent";
  }
}

function getMetricValue(entry: LeaderboardEntry, type: LeaderboardType) {
  switch (type) {
    case "xp":
      return { value: entry.xp.toLocaleString(), label: "XP" };
    case "streak":
      return { value: entry.streakDays, label: "days" };
    case "analyses":
      return { value: entry.analysesCount, label: "analyses" };
    case "viral":
      return { value: entry.viralCount, label: "viral hits" };
  }
}

export default function LeaderboardPage() {
  const [activeType, setActiveType] = useState<LeaderboardType>("xp");

  const { data, isLoading, error } = useQuery({
    queryKey: ["leaderboard", activeType],
    queryFn: () => fetchLeaderboard(activeType),
    staleTime: 60 * 1000, // 1 minute
  });

  const activeTypeConfig = leaderboardTypes.find((t) => t.type === activeType)!;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-[14px] flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #F59E0B 100%)" }}
          >
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="page-title">Leaderboard</h1>
            <p className="text-[var(--text-tertiary)] text-xs sm:text-sm mt-1">
              See how you rank against other creators
            </p>
          </div>
        </div>
      </header>

      {/* Type Tabs */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {leaderboardTypes.map(({ type, label, icon: Icon, color }) => {
          const isActive = activeType === type;
          return (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                borderRadius: "12px",
                border: isActive ? `1px solid ${color}` : "1px solid rgba(255,255,255,0.1)",
                background: isActive ? `${color}20` : "rgba(255,255,255,0.05)",
                color: isActive ? color : "rgba(255,255,255,0.6)",
                cursor: "pointer",
                transition: "all 150ms ease",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px" }} className="max-lg:grid-cols-1">
        {/* Main Leaderboard */}
        <GlassPanel variant="strong" style={{ padding: "0", overflow: "hidden" }}>
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr 120px 100px",
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Rank
            </span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Creator
            </span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Level
            </span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>
              {activeTypeConfig.label.split(" ")[0]}
            </span>
          </div>

          {/* Leaderboard Rows */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#7C3AED" }} />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p style={{ color: "rgba(255,255,255,0.5)" }}>Failed to load leaderboard</p>
            </div>
          ) : data?.leaderboard.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Trophy className="w-12 h-12 mb-4" style={{ color: "rgba(255,255,255,0.2)" }} />
              <p style={{ color: "rgba(255,255,255,0.5)" }}>No rankings yet</p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>
                Be the first to climb the leaderboard!
              </p>
            </div>
          ) : (
            <div>
              {data?.leaderboard.map((entry) => {
                const metric = getMetricValue(entry, activeType);
                return (
                  <div
                    key={entry.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "60px 1fr 120px 100px",
                      padding: "16px 20px",
                      alignItems: "center",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      background: getRankBackground(entry.rank, entry.isCurrentUser),
                      transition: "background 150ms ease",
                    }}
                    className="hover:bg-white/5"
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center" style={{ width: "40px" }}>
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Creator */}
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          background: entry.avatarUrl
                            ? `url(${entry.avatarUrl}) center/cover`
                            : "linear-gradient(135deg, #7C3AED, #F59E0B)",
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <p style={{ color: entry.isCurrentUser ? "#7C3AED" : "#fff", fontWeight: 500, fontSize: "14px" }}>
                          {entry.name}
                          {entry.isCurrentUser && (
                            <span style={{ marginLeft: "8px", fontSize: "11px", color: "#7C3AED", opacity: 0.7 }}>
                              (You)
                            </span>
                          )}
                        </p>
                        {entry.badges.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {entry.badges.slice(0, 3).map((badge, i) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: "10px",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  background: "rgba(124, 58, 237, 0.2)",
                                  color: "#a855f7",
                                }}
                              >
                                {badge}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Level */}
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "8px",
                          background: "linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#fff",
                        }}
                      >
                        {entry.level}
                      </div>
                      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>Level</span>
                    </div>

                    {/* Metric Value */}
                    <div style={{ textAlign: "right" }}>
                      <span style={{ color: activeTypeConfig.color, fontWeight: 600, fontSize: "16px" }}>
                        {metric.value}
                      </span>
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", marginLeft: "4px" }}>
                        {metric.label}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Current User Rank (if not in top) */}
              {data?.currentUserRank && (
                <>
                  <div
                    style={{
                      padding: "8px 20px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      textAlign: "center",
                      color: "rgba(255,255,255,0.3)",
                      fontSize: "12px",
                    }}
                  >
                    ...
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "60px 1fr 120px 100px",
                      padding: "16px 20px",
                      alignItems: "center",
                      background: "rgba(124, 58, 237, 0.15)",
                      borderTop: "1px solid rgba(124, 58, 237, 0.3)",
                    }}
                  >
                    <div className="flex items-center justify-center" style={{ width: "40px" }}>
                      <span style={{ color: "#7C3AED", fontWeight: 600, fontSize: "14px" }}>
                        #{data.currentUserRank.rank}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          background: data.currentUserRank.avatarUrl
                            ? `url(${data.currentUserRank.avatarUrl}) center/cover`
                            : "linear-gradient(135deg, #7C3AED, #F59E0B)",
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <p style={{ color: "#7C3AED", fontWeight: 500, fontSize: "14px" }}>
                          {data.currentUserRank.name}
                          <span style={{ marginLeft: "8px", fontSize: "11px", color: "#7C3AED", opacity: 0.7 }}>
                            (You)
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "8px",
                          background: "linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#fff",
                        }}
                      >
                        {data.currentUserRank.level}
                      </div>
                      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>Level</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ color: activeTypeConfig.color, fontWeight: 600, fontSize: "16px" }}>
                        {getMetricValue(data.currentUserRank, activeType).value}
                      </span>
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", marginLeft: "4px" }}>
                        {getMetricValue(data.currentUserRank, activeType).label}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </GlassPanel>

        {/* Sidebar Stats */}
        <div className="flex flex-col gap-4">
          {/* Your Stats */}
          <GlassPanel style={{ padding: "20px" }}>
            <h3 style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
              Your Stats
            </h3>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "rgba(255,255,255,0.3)" }} />
              </div>
            ) : error ? (
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textAlign: "center" }}>
                Unable to load stats. Try refreshing.
              </p>
            ) : data?.leaderboard.find((e) => e.isCurrentUser) || data?.currentUserRank ? (
              (() => {
                const userEntry = data?.leaderboard.find((e) => e.isCurrentUser) || data?.currentUserRank!;
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>Your Rank</span>
                      <div className="flex items-center gap-2">
                        <span style={{ color: "#7C3AED", fontWeight: 600, fontSize: "18px" }}>#{userEntry.rank}</span>
                        {userEntry.rank <= 10 && (
                          <ChevronUp className="w-4 h-4" style={{ color: "#22C55E" }} />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>Total XP</span>
                      <span style={{ color: "#fff", fontWeight: 500 }}>{userEntry.xp.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>Current Streak</span>
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4" style={{ color: "#F59E0B" }} />
                        <span style={{ color: "#fff", fontWeight: 500 }}>{userEntry.streakDays} days</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>Viral Hits</span>
                      <span style={{ color: "#fff", fontWeight: 500 }}>{userEntry.viralCount}</span>
                    </div>
                  </div>
                );
              })()
            ) : (
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textAlign: "center" }}>
                Analyze your first video to see stats
              </p>
            )}
          </GlassPanel>

          {/* How to Climb */}
          <GlassPanel style={{ padding: "20px" }}>
            <h3 style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
              How to Climb
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(124, 58, 237, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Zap className="w-4 h-4" style={{ color: "#7C3AED" }} />
                </div>
                <div>
                  <p style={{ color: "#fff", fontSize: "13px", fontWeight: 500 }}>Analyze Videos</p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>+10 XP per analysis</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(245, 158, 11, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Flame className="w-4 h-4" style={{ color: "#F59E0B" }} />
                </div>
                <div>
                  <p style={{ color: "#fff", fontSize: "13px", fontWeight: 500 }}>Build Streaks</p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>Analyze daily for bonus XP</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(34, 197, 94, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <TrendingUp className="w-4 h-4" style={{ color: "#22C55E" }} />
                </div>
                <div>
                  <p style={{ color: "#fff", fontSize: "13px", fontWeight: 500 }}>Score Viral Hits</p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>+25 XP for scores 85+</p>
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* Top 3 Podium */}
          {data?.leaderboard && data.leaderboard.length >= 3 && (
            <GlassPanel style={{ padding: "20px" }}>
              <h3 style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
                Top 3 Podium
              </h3>
              <div className="flex items-end justify-center gap-4 py-4">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: data.leaderboard[1]?.avatarUrl
                        ? `url(${data.leaderboard[1].avatarUrl}) center/cover`
                        : "linear-gradient(135deg, #C0C0C0, #A0A0A0)",
                      border: "2px solid #C0C0C0",
                    }}
                  />
                  <div
                    style={{
                      width: "50px",
                      height: "60px",
                      background: "linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)",
                      borderRadius: "8px 8px 0 0",
                      marginTop: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "20px",
                      color: "#fff",
                    }}
                  >
                    2
                  </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center">
                  <Crown className="w-6 h-6 mb-1" style={{ color: "#FFD700" }} />
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "14px",
                      background: data.leaderboard[0]?.avatarUrl
                        ? `url(${data.leaderboard[0].avatarUrl}) center/cover`
                        : "linear-gradient(135deg, #FFD700, #FFA500)",
                      border: "2px solid #FFD700",
                    }}
                  />
                  <div
                    style={{
                      width: "58px",
                      height: "80px",
                      background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                      borderRadius: "8px 8px 0 0",
                      marginTop: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "24px",
                      color: "#fff",
                    }}
                  >
                    1
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: data.leaderboard[2]?.avatarUrl
                        ? `url(${data.leaderboard[2].avatarUrl}) center/cover`
                        : "linear-gradient(135deg, #CD7F32, #8B4513)",
                      border: "2px solid #CD7F32",
                    }}
                  />
                  <div
                    style={{
                      width: "46px",
                      height: "45px",
                      background: "linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)",
                      borderRadius: "8px 8px 0 0",
                      marginTop: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "18px",
                      color: "#fff",
                    }}
                  >
                    3
                  </div>
                </div>
              </div>
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  );
}
