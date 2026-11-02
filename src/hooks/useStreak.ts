"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getStreakState,
  updateStreak,
  getStreakDisplay,
  formatStreak,
  getStreakMilestone,
  StreakState,
} from "@/lib/rewards";

export function useStreak() {
  const [state, setState] = useState<StreakState>({
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: "",
    lastUpdated: 0,
  });
  const [display, setDisplay] = useState({
    current: 0,
    longest: 0,
    isActiveToday: false,
  });

  const refresh = useCallback(() => {
    const newState = getStreakState();
    setState(newState);
    setDisplay(getStreakDisplay());
  }, []);

  useEffect(() => {
    refresh();

    // Check for streak updates periodically
    const interval = setInterval(() => {
      refresh();
    }, 60 * 60 * 1000); // Every hour

    return () => clearInterval(interval);
  }, [refresh]);

  const markActive = useCallback(() => {
    const newState = updateStreak();
    setState(newState);
    setDisplay(getStreakDisplay());
  }, []);

  const milestone = getStreakMilestone(display.current);

  return {
    state,
    display,
    milestone,
    formattedCurrent: formatStreak(display.current),
    formattedLongest: formatStreak(display.longest),
    isActiveToday: display.isActiveToday,
    markActive,
    refresh,
  };
}