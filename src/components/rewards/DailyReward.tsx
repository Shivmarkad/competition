"use client";

import { useDailyReward } from "@/hooks";
import { showRewardedAd } from "@/lib/ads";

export function DailyReward() {
  const { state, canClaim, isClaiming, claim, reward, timeRemainingFormatted } = useDailyReward();

  const handleClaim = async () => {
    // Show rewarded ad first
    const adShown = await showRewardedAd();
    if (!adShown) {
      alert("Failed to load ad. Please try again.");
      return;
    }

    // Then claim reward
    const newState = await claim();
    if (newState) {
      alert(`Daily reward claimed! You earned ${reward.coins} coins! (Streak: ${newState.streak} days)`);
    }
  };

  if (state.claimedToday) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <h4 className="font-semibold text-green-800 dark:text-green-200">Daily Reward Claimed!</h4>
              <p className="text-sm text-green-600 dark:text-green-400">
                Next reward in {timeRemainingFormatted}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-green-800 dark:text-green-200 text-lg">
              +{reward.coins} coins
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              {reward.bonus}Streak: {state.streak} days
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center animate-pulse-soft">
            <span className="text-2xl">🎁</span>
          </div>
          <div>
            <h4 className="font-semibold text-amber-800 dark:text-amber-200">Daily Reward Available!</h4>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Watch a short video to claim your reward
            </p>
          </div>
        </div>
        <button
          onClick={handleClaim}
          disabled={isClaiming}
          className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 min-h-[44px] whitespace-nowrap"
        >
          {isClaiming ? "Loading..." : `Claim +${reward.coins} Coins`}
        </button>
      </div>
      <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800 flex items-center justify-between text-sm">
        <span className="text-amber-700 dark:text-amber-300">
          Streak: {state.streak} days {reward.bonus && `(${reward.bonus.trim()})`}
        </span>
        <span className="text-amber-600 dark:text-amber-400 font-mono">+{reward.coins} coins</span>
      </div>
    </div>
  );
}