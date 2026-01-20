"use client";

import { Flame, Trophy, Star, TrendingUp } from "lucide-react";
import {
  calculateLevelProgress,
  getNextStreakMilestone,
  isStreakActive,
  getTimeUntilStreakExpires,
} from "@/lib/gamification";

interface LevelProgressProps {
  xp: number;
  streakDays: number;
  lastAnalysisDate: string | null;
  compact?: boolean;
}

export function LevelProgress({
  xp,
  streakDays,
  lastAnalysisDate,
  compact = false,
}: LevelProgressProps) {
  const progress = calculateLevelProgress(xp);
  const nextMilestone = getNextStreakMilestone(streakDays);
  const streakActive = isStreakActive(lastAnalysisDate);
  const timeUntilExpires = getTimeUntilStreakExpires(lastAnalysisDate);

  if (compact) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "8px 12px",
          background: "rgba(255,255,255,0.04)",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Level Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 10px",
            background: "rgba(124, 58, 237, 0.15)",
            borderRadius: "8px",
            border: "1px solid rgba(124, 58, 237, 0.3)",
          }}
        >
          <Star style={{ width: "14px", height: "14px", color: "#7C3AED" }} />
          <span style={{ color: "#7C3AED", fontSize: "12px", fontWeight: 600 }}>
            Lv.{progress.level}
          </span>
        </div>

        {/* Streak */}
        {streakActive && streakDays > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              background: "rgba(255, 87, 87, 0.15)",
              borderRadius: "8px",
              border: "1px solid rgba(255, 87, 87, 0.3)",
            }}
          >
            <Flame style={{ width: "14px", height: "14px", color: "#FF5757" }} />
            <span style={{ color: "#FF5757", fontSize: "12px", fontWeight: 600 }}>
              {streakDays}
            </span>
          </div>
        )}

        {/* XP */}
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>
          {xp} XP
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        background: "rgba(18, 18, 24, 0.85)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "16px",
        backdropFilter: "blur(32px)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #7C3AED 0%, #FF5757 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trophy style={{ width: "20px", height: "20px", color: "#fff" }} />
          </div>
          <div>
            <span
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#fff",
                display: "block",
              }}
            >
              Level {progress.level}
            </span>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
              {progress.title}
            </span>
          </div>
        </div>

        {/* Streak Badge */}
        {streakActive && streakDays > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              background: "rgba(255, 87, 87, 0.15)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 87, 87, 0.3)",
            }}
          >
            <Flame style={{ width: "18px", height: "18px", color: "#FF5757" }} />
            <div>
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#FF5757",
                  display: "block",
                }}
              >
                {streakDays} day{streakDays !== 1 ? "s" : ""}
              </span>
              {timeUntilExpires.isExpiringSoon && (
                <span style={{ fontSize: "10px", color: "rgba(255, 87, 87, 0.7)" }}>
                  {timeUntilExpires.hours}h {timeUntilExpires.minutes}m left
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* XP Progress Bar */}
      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
            {progress.currentXp} / {progress.nextLevelXp} XP
          </span>
          <span style={{ fontSize: "12px", color: "#7C3AED" }}>
            {Math.round(progress.progress)}%
          </span>
        </div>
        <div
          style={{
            height: "8px",
            background: "rgba(255,255,255,0.08)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress.progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #7C3AED, #8B5CF6)",
              borderRadius: "4px",
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </div>

      {/* Next Milestone */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px",
          background: "rgba(255,255,255,0.04)",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <TrendingUp
          style={{ width: "16px", height: "16px", color: "rgba(255,255,255,0.4)" }}
        />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
            {streakDays < nextMilestone.days ? (
              <>
                {nextMilestone.daysRemaining} day{nextMilestone.daysRemaining !== 1 ? "s" : ""} to{" "}
                <span style={{ color: "#22c55e" }}>{nextMilestone.reward}</span>
              </>
            ) : (
              <span style={{ color: "#22c55e" }}>Keep your streak going!</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
