// Gamification system for Virtuna - XP, levels, and streaks

// XP actions and their values
export const XP_ACTIONS = {
  analysis_complete: 10,
  streak_day: 10,
  first_viral_score: 50,     // Score >= 85 (first time)
  viral_score: 25,           // Score >= 85 (subsequent)
  share_result: 25,
  invite_friend: 100,
} as const;

// Level thresholds
const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 1000,
  7: 2500,
  10: 5000,
};

// Level titles
const LEVEL_TITLES: Record<number, string> = {
  1: "Newbie",
  2: "Learner",
  3: "Creator",
  4: "Analyzer",
  5: "Strategist",
  7: "Viral Master",
  10: "Virtuna Legend",
};

export function calculateLevel(xp: number): number {
  if (xp < 100) return 1;
  if (xp < 250) return 2;
  if (xp < 500) return 3;
  if (xp < 1000) return 4;
  if (xp < 2500) return 5;
  if (xp < 5000) return 7;
  return 10;
}

export function xpForNextLevel(currentLevel: number): number {
  const next = Object.entries(LEVEL_THRESHOLDS).find(
    ([lvl]) => Number(lvl) > currentLevel
  );
  return next ? Number(next[1]) : 10000;
}

export function xpForCurrentLevel(currentLevel: number): number {
  return LEVEL_THRESHOLDS[currentLevel] || 0;
}

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[level] || "Creator";
}

export function calculateLevelProgress(xp: number): {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  progress: number;
  title: string;
} {
  const level = calculateLevel(xp);
  const currentLevelXp = xpForCurrentLevel(level);
  const nextLevelXp = xpForNextLevel(level);
  const xpInLevel = xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const progress = Math.min((xpInLevel / xpNeeded) * 100, 100);

  return {
    level,
    currentXp: xpInLevel,
    nextLevelXp: xpNeeded,
    progress,
    title: getLevelTitle(level),
  };
}

// Streak system
export function getStreakReward(streakDays: number): {
  bonusAnalyses: number;
  xp: number;
  badge?: string;
} {
  if (streakDays >= 30) return { bonusAnalyses: 10, xp: 500, badge: "Month Master" };
  if (streakDays >= 14) return { bonusAnalyses: 5, xp: 200, badge: "Fortnight Warrior" };
  if (streakDays >= 7) return { bonusAnalyses: 3, xp: 100, badge: "Week Warrior" };
  if (streakDays >= 3) return { bonusAnalyses: 2, xp: 25, badge: "Hot Streak" };
  return { bonusAnalyses: 0, xp: 10 };
}

export function getNextStreakMilestone(currentStreak: number): {
  days: number;
  reward: string;
  daysRemaining: number;
} {
  if (currentStreak < 3) {
    return { days: 3, reward: "+2 bonus analyses", daysRemaining: 3 - currentStreak };
  }
  if (currentStreak < 7) {
    return { days: 7, reward: "+3 analyses + badge", daysRemaining: 7 - currentStreak };
  }
  if (currentStreak < 14) {
    return { days: 14, reward: "+5 analyses + badge", daysRemaining: 14 - currentStreak };
  }
  if (currentStreak < 30) {
    return { days: 30, reward: "+10 analyses + 50% off Pro", daysRemaining: 30 - currentStreak };
  }
  return { days: 30, reward: "Maximum streak reached!", daysRemaining: 0 };
}

export function isStreakActive(lastAnalysisDate: Date | string | null): boolean {
  if (!lastAnalysisDate) return false;

  const lastDate = new Date(lastAnalysisDate);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  lastDate.setHours(0, 0, 0, 0);

  // Streak is active if last analysis was today or yesterday
  return lastDate >= yesterday;
}

export function shouldIncrementStreak(lastAnalysisDate: Date | string | null): boolean {
  if (!lastAnalysisDate) return true; // First analysis starts a streak

  const lastDate = new Date(lastAnalysisDate);
  const now = new Date();

  // Reset to start of day for comparison
  lastDate.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // Should increment if last analysis wasn't today
  return lastDate < today;
}

export function getTimeUntilStreakExpires(lastAnalysisDate: Date | string | null): {
  hours: number;
  minutes: number;
  isExpiringSoon: boolean;
} {
  if (!lastAnalysisDate) return { hours: 0, minutes: 0, isExpiringSoon: false };

  const lastDate = new Date(lastAnalysisDate);
  lastDate.setHours(0, 0, 0, 0);

  // Streak expires at end of the day after last analysis
  const expiresAt = new Date(lastDate);
  expiresAt.setDate(expiresAt.getDate() + 2); // Day after tomorrow midnight

  const now = new Date();
  const msRemaining = expiresAt.getTime() - now.getTime();

  if (msRemaining <= 0) {
    return { hours: 0, minutes: 0, isExpiringSoon: false };
  }

  const hours = Math.floor(msRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));

  return {
    hours,
    minutes,
    isExpiringSoon: hours < 6,
  };
}

// Analysis quota helpers
export function getQuotaStatus(used: number, limit: number): {
  remaining: number;
  percentage: number;
  color: string;
  isLow: boolean;
  isCritical: boolean;
} {
  const remaining = Math.max(0, limit - used);
  const percentage = (remaining / limit) * 100;

  if (percentage >= 50) {
    return { remaining, percentage, color: "#22c55e", isLow: false, isCritical: false };
  }
  if (percentage >= 20) {
    return { remaining, percentage, color: "#F59E0B", isLow: true, isCritical: false };
  }
  return { remaining, percentage, color: "#EF4444", isLow: true, isCritical: percentage < 10 };
}

export function getQuotaResetDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

export function formatQuotaResetDays(resetDate: Date): string {
  const now = new Date();
  const msRemaining = resetDate.getTime() - now.getTime();
  const days = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

  if (days <= 0) return "Resets today";
  if (days === 1) return "Resets tomorrow";
  return `Resets in ${days} days`;
}
