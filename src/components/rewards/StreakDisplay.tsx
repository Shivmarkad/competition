"use client";

import { useStreak } from "@/hooks";

interface StreakDisplayProps {
  compact?: boolean;
  showMilestone?: boolean;
}

export function StreakDisplay({ compact = false, showMilestone = true }: StreakDisplayProps) {
  const { display, milestone, formattedCurrent, formattedLongest, isActiveToday, markActive } = useStreak();

  // Mark active on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleMount = () => markActive();
  // Use useEffect in actual implementation

  if (display.current === 0 && !compact) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
        <span className="text-2xl">🔥</span>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Start your streak by playing today!</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full border border-amber-200 dark:border-amber-800">
        <span className="text-lg">🔥</span>
        <span className="font-bold text-amber-800 dark:text-amber-200 text-sm">
          {display.current} day{display.current !== 1 ? "s" : ""}
        </span>
        {isActiveToday && (
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
      <div className="text-center mb-4">
        <span className="text-4xl animate-float" style={{ animationDelay: '0s' }}>🔥</span>
        <h3 className="mt-2 text-xl font-bold text-amber-800 dark:text-amber-200">
          {display.current === 1 ? "1 Day Streak" : `${display.current} Day Streak`}
        </h3>
        {milestone && showMilestone && (
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300 font-medium animate-bounce-in">
            {milestone}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 text-center">
          <p className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Current</p>
          <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">{display.current}</p>
          <p className="text-xs text-amber-500 dark:text-amber-500">days</p>
        </div>
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 text-center">
          <p className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Longest</p>
          <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">{display.longest}</p>
          <p className="text-xs text-amber-500 dark:text-amber-500">days</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm">
        <span className={`flex items-center gap-1 px-3 py-1 rounded-full ${
          isActiveToday
            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isActiveToday ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
          {isActiveToday ? "Active today" : "Play to continue streak"}
        </span>
        {display.current >= display.longest && display.current > 0 && (
          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full text-xs font-medium">
            🏆 Personal Best!
          </span>
        )}
      </div>
    </div>
  );
}