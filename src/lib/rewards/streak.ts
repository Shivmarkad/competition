/**
 * Streak Tracking System
 * Tracks consecutive days of app usage
 */

const STREAK_KEY = "gameHub_streak";

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD format
  lastUpdated: number;
}

export function getStreakState(): StreakState {
  if (typeof window === "undefined") {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: "", lastUpdated: 0 };
  }

  try {
    const stored = localStorage.getItem(STREAK_KEY);
    if (stored) {
      return JSON.parse(stored) as StreakState;
    }
  } catch (error) {
    console.error("Streak: Failed to parse state:", error);
  }

  return { currentStreak: 0, longestStreak: 0, lastActiveDate: "", lastUpdated: 0 };
}

export function updateStreak(): StreakState {
  const state = getStreakState();
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  let newStreak = state.currentStreak;

  if (state.lastActiveDate === today) {
    // Already updated today
    return state;
  } else if (state.lastActiveDate === yesterday) {
    // Consecutive day
    newStreak = state.currentStreak + 1;
  } else {
    // Streak broken or first time
    newStreak = 1;
  }

  const newState: StreakState = {
    currentStreak: newStreak,
    longestStreak: Math.max(state.longestStreak, newStreak),
    lastActiveDate: today,
    lastUpdated: Date.now(),
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(STREAK_KEY, JSON.stringify(newState));
  }

  return newState;
}

export function getStreakDisplay(): { current: number; longest: number; isActiveToday: boolean } {
  const state = getStreakState();
  const today = new Date().toISOString().split("T")[0];
  return {
    current: state.currentStreak,
    longest: state.longestStreak,
    isActiveToday: state.lastActiveDate === today,
  };
}

export function formatStreak(streak: number): string {
  if (streak === 0) return "No streak yet";
  if (streak === 1) return "1 day streak";
  return `${streak} day streak`;
}

export function getStreakMilestone(streak: number): string | null {
  const milestones: Record<number, string> = {
    1: "First day! 🎉",
    3: "3 days - Getting started!",
    7: "1 week streak! 🔥",
    14: "2 weeks - Consistency!",
    30: "1 month streak! 🏆",
    60: "2 months - Dedicated!",
    100: "100 days! 💯",
    365: "1 year! 🎊",
  };
  return milestones[streak] || null;
}