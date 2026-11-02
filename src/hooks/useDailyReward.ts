"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getDailyRewardState,
  canClaimDailyReward,
  claimDailyReward,
  getTimeUntilNextReward,
  formatTimeRemaining,
  getDailyRewardAmount,
  DailyRewardState,
} from "@/lib/rewards";

export function useDailyReward() {
  const [state, setState] = useState<DailyRewardState>({
    lastClaimed: 0,
    streak: 0,
    claimedToday: false,
  });
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);

  const refresh = useCallback(() => {
    const newState = getDailyRewardState();
    setState(newState);
    setTimeRemaining(getTimeUntilNextReward());
  }, []);

  useEffect(() => {
    refresh();

    // Update time remaining every minute
    const interval = setInterval(() => {
      setTimeRemaining(getTimeUntilNextReward());
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [refresh]);

  const claim = useCallback(async (): Promise<DailyRewardState | null> => {
    if (!canClaimDailyReward() || isClaiming) return null;

    setIsClaiming(true);
    try {
      // In a real app, you'd show a rewarded ad here first
      // const adShown = await showRewardedAd();
      // if (!adShown) return null;

      const newState = claimDailyReward();
      setState(newState);
      setTimeRemaining(getTimeUntilNextReward());
      return newState;
    } finally {
      setIsClaiming(false);
    }
  }, [isClaiming]);

  const reward = state.claimedToday
    ? getDailyRewardAmount(state.streak)
    : getDailyRewardAmount(state.streak + 1);

  return {
    state,
    timeRemaining,
    timeRemainingFormatted: formatTimeRemaining(timeRemaining),
    canClaim: canClaimDailyReward() && !isClaiming,
    isClaiming,
    claim,
    reward,
    refresh,
  };
}