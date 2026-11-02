/**
 * Daily Reward System
 * Users can watch a rewarded ad once per day for a bonus
 */

const DAILY_REWARD_KEY = "gameHub_dailyReward";
const DAILY_REWARD_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface DailyRewardState {
  lastClaimed: number;
  streak: number;
  claimedToday: boolean;
}

export function getDailyRewardState(): DailyRewardState {
  if (typeof window === "undefined") {
    return { lastClaimed: 0, streak: 0, claimedToday: false };
  }

  try {
    const stored = localStorage.getItem(DAILY_REWARD_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as DailyRewardState;
      // Check if it's a new day
      const now = Date.now();
      const isNewDay = now - parsed.lastClaimed >= DAILY_REWARD_COOLDOWN_MS;
      return {
        ...parsed,
        claimedToday: !isNewDay && parsed.claimedToday,
      };
    }
  } catch (error) {
    console.error("DailyReward: Failed to parse state:", error);
  }

  return { lastClaimed: 0, streak: 0, claimedToday: false };
}

export function canClaimDailyReward(): boolean {
  const state = getDailyRewardState();
  return !state.claimedToday;
}

export function claimDailyReward(): DailyRewardState {
  const state = getDailyRewardState();
  const now = Date.now();
  const isNewDay = now - state.lastClaimed >= DAILY_REWARD_COOLDOWN_MS;

  const newState: DailyRewardState = {
    lastClaimed: now,
    streak: isNewDay ? state.streak + 1 : state.streak,
    claimedToday: true,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(DAILY_REWARD_KEY, JSON.stringify(newState));
  }

  return newState;
}

export function getTimeUntilNextReward(): number {
  const state = getDailyRewardState();
  if (!state.claimedToday) return 0;

  const elapsed = Date.now() - state.lastClaimed;
  return Math.max(0, DAILY_REWARD_COOLDOWN_MS - elapsed);
}

export function formatTimeRemaining(ms: number): string {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Reward amounts based on streak
 */
export function getDailyRewardAmount(streak: number): { coins: number; bonus: string } {
  // Base reward + streak bonus
  const baseCoins = 10;
  const streakBonus = Math.min(streak * 2, 50); // Cap at 50 bonus
  const total = baseCoins + streakBonus;

  let bonus = "";
  if (streak >= 7) bonus = "Weekly streak! ";
  if (streak >= 30) bonus = "Monthly streak! ";

  return { coins: total, bonus };
}