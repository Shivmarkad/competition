"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Link from "next/link";

interface BattleRecord {
  id: string;
  timestamp: number;
  winner: string;
  winnerIndex: number;
  allScores: { name: string; score: number; colorIndex: number }[];
  totalBattles: number;
  battleDuration: number;
}

interface PlayerStats {
  name: string;
  colorIndex: number;
  totalWins: number;
  totalBattles: number;
  winRate: number;
  currentStreak: number;
  maxStreak: number;
  avgScore: number;
  lastWin: number | null;
}

const CHART_COLORS = [
  "#6366f1", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6", "#f43f5e",
];

export default function ScoreTracker() {
  const [history, setHistory] = useState<BattleRecord[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("battleHistory");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"all" | "week" | "month" | "year">("all");
  const [isMobile, setIsMobile] = useState(false);
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);
  const streakCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Sync with Battle Arena's lastWinners
  useEffect(() => {
    const syncHistory = () => {
      try {
        const lastWinners = localStorage.getItem("battleLastWinners");
        const competitors = localStorage.getItem("battleCompetitors");
        const customNames = localStorage.getItem("battleCustomNames");

        if (lastWinners && competitors) {
          const winners = JSON.parse(lastWinners);
          const comps = JSON.parse(competitors);
          const names = customNames ? JSON.parse(customNames) : comps.map((c: any) => c.name);

          // Reconstruct history from lastWinners (simplified)
          const existing = localStorage.getItem("battleHistory");
          const existingHistory = existing ? JSON.parse(existing) : [];

          // Only add if we have new data
          if (winners.length > existingHistory.length) {
            const newRecords: BattleRecord[] = winners.slice(existingHistory.length).map((winnerIndex: number, i: number) => {
              const compsAtTime = comps; // Simplified - would need timestamp tracking for accuracy
              return {
                id: `battle-${Date.now()}-${i}`,
                timestamp: Date.now() - (winners.length - i) * 3600000, // Approximate
                winner: names[winnerIndex] || compsAtTime[winnerIndex]?.name || `Player ${winnerIndex + 1}`,
                winnerIndex,
                allScores: compsAtTime.map((c: any, idx: number) => ({
                  name: names[idx] || c.name,
                  score: c.score,
                  colorIndex: c.colorIndex,
                })),
                totalBattles: winners.length,
                battleDuration: 5000, // Approximate
              };
            });
            setHistory([...existingHistory, ...newRecords]);
          }
        }
      } catch (error) {
        console.error("Failed to sync history:", error);
      }
    };

    syncHistory();
    const interval = setInterval(syncHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("battleHistory", JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history:", error);
    }
  }, [history]);

  // Draw win rate chart
  useEffect(() => {
    if (!chartCanvasRef.current) return;
    const canvas = chartCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const filteredHistory = getFilteredHistory();
    const players = getAllPlayers();

    const width = canvas.width = canvas.offsetWidth * 2;
    const height = canvas.height = canvas.offsetHeight * 2;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--background").trim() || "#f8fafc";
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      // Y-axis labels
      ctx.fillStyle = "#64748b";
      ctx.font = "12px system-ui";
      ctx.textAlign = "right";
      ctx.fillText(`${100 - i * 20}%`, padding - 10, y + 4);
    }

    // X-axis labels (time)
    if (filteredHistory.length > 1) {
      ctx.fillStyle = "#64748b";
      ctx.font = "11px system-ui";
      ctx.textAlign = "center";
      for (let i = 0; i < filteredHistory.length; i += Math.max(1, Math.floor(filteredHistory.length / 8))) {
        const x = padding + (chartWidth / (filteredHistory.length - 1)) * i;
        const date = new Date(filteredHistory[i].timestamp);
        ctx.fillText(`${date.getMonth() + 1}/${date.getDate()}`, x, height - padding + 20);
      }
    }

    // Draw lines for each player
    players.forEach((player, playerIdx) => {
      const color = CHART_COLORS[player.colorIndex % CHART_COLORS.length];
      const winRates = calculateWinRates(filteredHistory, player.name);

      if (winRates.length < 2) return;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      winRates.forEach((rate, i) => {
        const x = padding + (chartWidth / (winRates.length - 1)) * i;
        const y = padding + chartHeight * (1 - rate / 100);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Draw points
      ctx.fillStyle = color;
      winRates.forEach((rate, i) => {
        const x = padding + (chartWidth / (winRates.length - 1)) * i;
        const y = padding + chartHeight * (1 - rate / 100);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // Legend
    ctx.font = "12px system-ui";
    ctx.textAlign = "left";
    players.forEach((player, i) => {
      const color = CHART_COLORS[player.colorIndex % CHART_COLORS.length];
      const x = width - 150;
      const y = padding + 20 + i * 20;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 12, 12);
      ctx.fillStyle = "#1e293b";
      ctx.fillText(player.name, x + 18, y + 9);
    });
  }, [history, timeRange]);

  // Draw streak chart
  useEffect(() => {
    if (!streakCanvasRef.current) return;
    const canvas = streakCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const filteredHistory = getFilteredHistory();
    const players = getAllPlayers();

    const width = canvas.width = canvas.offsetWidth * 2;
    const height = canvas.height = canvas.offsetHeight * 2;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--background").trim() || "#f8fafc";
    ctx.fillRect(0, 0, width, height);

    // Calculate streaks over time
    const streaks = calculateStreaksOverTime(filteredHistory, players);
    const maxStreak = Math.max(...streaks.flatMap(s => s.streaks), 1);

    // Grid
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      ctx.fillStyle = "#64748b";
      ctx.font = "12px system-ui";
      ctx.textAlign = "right";
      ctx.fillText(`${Math.round(maxStreak * (1 - i / 5))}`, padding - 10, y + 4);
    }

    // Draw streak bars
    players.forEach((player, playerIdx) => {
      const color = CHART_COLORS[player.colorIndex % CHART_COLORS.length];
      const playerStreaks = streaks.find(s => s.name === player.name);
      if (!playerStreaks) return;

      ctx.fillStyle = color + "80";
      playerStreaks.streaks.forEach((streak, i) => {
        const x = padding + (chartWidth / playerStreaks.streaks.length) * i + 2;
        const barHeight = (chartHeight / maxStreak) * streak;
        const y = height - padding - barHeight;
        const barWidth = Math.max(3, chartWidth / playerStreaks.streaks.length - 4);
        ctx.fillRect(x, y, barWidth, barHeight);
      });
    });

    // Legend
    ctx.font = "12px system-ui";
    ctx.textAlign = "left";
    players.forEach((player, i) => {
      const color = CHART_COLORS[player.colorIndex % CHART_COLORS.length];
      const x = width - 150;
      const y = padding + 20 + i * 20;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 12, 12);
      ctx.fillStyle = "#1e293b";
      ctx.fillText(player.name, x + 18, y + 9);
    });
  }, [history, timeRange]);

  const getFilteredHistory = useCallback(() => {
    const now = Date.now();
    const ranges = {
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
      all: Infinity,
    };
    const cutoff = now - (ranges[timeRange] || Infinity);
    return history.filter((h) => h.timestamp >= cutoff);
  }, [history, timeRange]);

  const getAllPlayers = useCallback(() => {
    const players = new Map<string, { name: string; colorIndex: number }>();
    history.forEach((record) => {
      record.allScores.forEach((p) => {
        if (!players.has(p.name)) {
          players.set(p.name, { name: p.name, colorIndex: p.colorIndex });
        }
      });
    });
    return Array.from(players.values());
  }, [history]);

  const calculateWinRates = useCallback((records: BattleRecord[], playerName: string) => {
    const rates: number[] = [];
    let wins = 0;
    let battles = 0;

    records.forEach((record) => {
      battles++;
      if (record.winner === playerName) wins++;
      rates.push(battles > 0 ? (wins / battles) * 100 : 0);
    });

    return rates;
  }, []);

  const calculateStreaksOverTime = useCallback((records: BattleRecord[], players: { name: string; colorIndex: number }[]) => {
    return players.map((player) => {
      const streaks: number[] = [];
      let currentStreak = 0;

      records.forEach((record) => {
        if (record.winner === player.name) {
          currentStreak++;
        } else {
          currentStreak = 0;
        }
        streaks.push(currentStreak);
      });

      return { name: player.name, streaks };
    });
  }, []);

  const getPlayerStats = useCallback((): PlayerStats[] => {
    const players = new Map<string, PlayerStats>();

    history.forEach((record) => {
      record.allScores.forEach((p) => {
        if (!players.has(p.name)) {
          players.set(p.name, {
            name: p.name,
            colorIndex: p.colorIndex,
            totalWins: 0,
            totalBattles: 0,
            winRate: 0,
            currentStreak: 0,
            maxStreak: 0,
            avgScore: 0,
            lastWin: null,
          });
        }
      });

      // Update winner stats
      const winner = players.get(record.winner);
      if (winner) {
        winner.totalWins++;
        winner.lastWin = record.timestamp;
      }

      // Update all participants
      record.allScores.forEach((p) => {
        const player = players.get(p.name);
        if (player) {
          player.totalBattles++;
        }
      });
    });

    // Calculate derived stats
    let currentStreak = 0;
    let maxStreak = 0;
    const recentHistory = [...history].reverse();

    players.forEach((player) => {
      player.winRate = player.totalBattles > 0 ? (player.totalWins / player.totalBattles) * 100 : 0;
      player.avgScore = history.length > 0
        ? history.reduce((sum, r) => sum + (r.allScores.find(s => s.name === player.name)?.score || 0), 0) / history.length
        : 0;

      // Calculate streaks
      currentStreak = 0;
      maxStreak = 0;
      recentHistory.forEach((record) => {
        if (record.winner === player.name) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      });
      player.currentStreak = currentStreak;
      player.maxStreak = maxStreak;
    });

    return Array.from(players.values()).sort((a, b) => b.totalWins - a.totalWins);
  }, [history]);

  const exportCSV = useCallback(() => {
    const headers = ["Date", "Winner", "Total Battles", ...getAllPlayers().map(p => `${p.name} Score`)];
    const rows = history.map((record) => {
      const date = new Date(record.timestamp).toLocaleDateString();
      const scores = getAllPlayers().map(p => record.allScores.find(s => s.name === p.name)?.score || 0);
      return [date, record.winner, record.totalBattles, ...scores];
    });

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `battle-history-${new Date().toISOString().split("T")[0]}.csv`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [history]);

  const exportJSON = useCallback(() => {
    const data = { history, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `battle-history-${new Date().toISOString().split("T")[0]}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [history]);

  const clearHistory = useCallback(() => {
    if (confirm("Delete all battle history? This cannot be undone.")) {
      setHistory([]);
      localStorage.removeItem("battleHistory");
    }
  }, []);

  const stats = getPlayerStats();
  const filteredHistory = getFilteredHistory();
  const totalBattles = history.length;
  const totalWins = history.filter(h => h.winner).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4 safe-top safe-bottom">
      <div className="container">
        {/* Back Button */}
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 mb-6 md:mb-8 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 min-h-[48px]"
        >
          ← Back to Tools
        </Link>

        {/* Header */}
        <header className="text-center mb-8 md:mb-12 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-match mb-3">
            📊 Score Tracker
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Track battle history, win rates, streaks & statistics. Export data for analysis.
          </p>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up stagger-1">
          <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl text-center">
            <div className="text-3xl md:text-4xl font-bold text-gradient-match">{totalBattles}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Battles</div>
          </div>
          <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl text-center">
            <div className="text-3xl md:text-4xl font-bold text-gradient-match">{stats.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active Players</div>
          </div>
          <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl text-center">
            <div className="text-3xl md:text-4xl font-bold text-gradient-match">
              {stats.length > 0 ? Math.max(...stats.map(s => s.maxStreak)) : 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Max Streak</div>
          </div>
          <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl text-center">
            <div className="text-3xl md:text-4xl font-bold text-gradient-match">
              {stats.length > 0 ? Math.round(stats.reduce((sum, s) => sum + s.winRate, 0) / stats.length) : 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Avg Win Rate</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Player Stats */}
          <div className="lg:col-span-1 space-y-6 animate-fade-in-up stagger-1">
            {/* Player Leaderboard */}
            <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Leaderboard</h2>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="input py-2 px-3 text-sm min-h-[40px]"
                >
                  <option value="all">All Time</option>
                  <option value="year">This Year</option>
                  <option value="month">This Month</option>
                  <option value="week">This Week</option>
                </select>
              </div>

              {stats.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <span className="text-4xl mb-2 block">📊</span>
                  <p>No battle data yet</p>
                  <p className="text-sm mt-1">Play Battle Arena to generate stats!</p>
                  <Link href="/games/battle-arena" className="btn-primary mt-3 inline-flex min-h-[44px]">
                    Play Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {stats.map((player, index) => (
                    <button
                      key={player.name}
                      onClick={() => setSelectedPlayer(selectedPlayer === player.name ? null : player.name)}
                      className={`w-full p-3 rounded-xl text-left transition-all ${
                        selectedPlayer === player.name
                          ? "bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-500"
                          : "bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, ${CHART_COLORS[player.colorIndex % CHART_COLORS.length]}, ${CHART_COLORS[(player.colorIndex + 1) % CHART_COLORS.length]})` }}>
                          #{index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{player.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>{player.totalWins}W / {player.totalBattles}B</span>
                            <span>·</span>
                            <span>{player.winRate.toFixed(1)}% WR</span>
                          </div>
                        </div>
                        {selectedPlayer === player.name && <span className="text-indigo-500">▼</span>}
                      </div>

                      {selectedPlayer === player.name && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2 animate-fade-in">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-white/50 dark:bg-gray-700/50 p-2 rounded-lg">
                              <div className="text-gray-500 dark:text-gray-400">Current Streak</div>
                              <div className="font-bold text-emerald-600 dark:text-emerald-400">{player.currentStreak} 🔥</div>
                            </div>
                            <div className="bg-white/50 dark:bg-gray-700/50 p-2 rounded-lg">
                              <div className="text-gray-500 dark:text-gray-400">Max Streak</div>
                              <div className="font-bold text-amber-600 dark:text-amber-400">{player.maxStreak} 🏆</div>
                            </div>
                            <div className="bg-white/50 dark:bg-gray-700/50 p-2 rounded-lg">
                              <div className="text-gray-500 dark:text-gray-400">Avg Score</div>
                              <div className="font-bold text-indigo-600 dark:text-indigo-400">{player.avgScore.toFixed(1)}</div>
                            </div>
                            <div className="bg-white/50 dark:bg-gray-700/50 p-2 rounded-lg">
                              <div className="text-gray-500 dark:text-gray-400">Last Win</div>
                              <div className="font-bold text-gray-900 dark:text-gray-100">
                                {player.lastWin ? new Date(player.lastWin).toLocaleDateString() : "Never"}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export & Actions */}
            <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl animate-fade-in-up stagger-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Export Data</h2>
              <div className="space-y-2">
                <button
                  onClick={exportCSV}
                  disabled={history.length === 0}
                  className="btn-secondary w-full justify-center min-h-[48px]"
                >
                  📊 Export CSV
                </button>
                <button
                  onClick={exportJSON}
                  disabled={history.length === 0}
                  className="btn-secondary w-full justify-center min-h-[48px]"
                >
                  📄 Export JSON
                </button>
                <button
                  onClick={clearHistory}
                  disabled={history.length === 0}
                  className="btn-secondary w-full justify-center min-h-[48px] text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  🗑️ Clear All History
                </button>
                <Link
                  href="/games/battle-arena"
                  className="btn-primary w-full justify-center min-h-[48px]"
                >
                  ⚔️ Play Battle Arena
                </Link>
              </div>
            </div>
          </div>

          {/* Right Panel - Charts */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in-up stagger-2">
            {/* Win Rate Chart */}
            <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Win Rate Over Time</h2>
              <div className="relative h-80 md:h-96" style={{ minHeight: "300px" }}>
                <canvas
                  ref={chartCanvasRef}
                  className="w-full h-full"
                  aria-label="Win rate chart over time"
                />
                {filteredHistory.length < 2 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <p className="text-center px-4">Play more battles to see win rate trends</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                Lines show cumulative win rate % for each player over time
              </p>
            </div>

            {/* Streak Chart */}
            <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Win Streaks Over Time</h2>
              <div className="relative h-64 md:h-80" style={{ minHeight: "250px" }}>
                <canvas
                  ref={streakCanvasRef}
                  className="w-full h-full"
                  aria-label="Win streak chart over time"
                />
                {filteredHistory.length < 2 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <p className="text-center px-4">Play more battles to see streak patterns</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                Bars show current win streak after each battle (taller = longer streak)
              </p>
            </div>

            {/* Battle History Table */}
            <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Battles</h2>
              {filteredHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <span className="text-4xl mb-2 block">⚔️</span>
                  <p>No battles in selected time range</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Date</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Winner</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Battle #</th>
                        {getAllPlayers().slice(0, 4).map((p) => (
                          <th key={p.name} className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">
                            {p.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...filteredHistory].reverse().slice(0, 20).map((record) => (
                        <tr key={record.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-3 px-2 text-gray-600 dark:text-gray-400">
                            {new Date(record.timestamp).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2 font-semibold text-gray-900 dark:text-gray-100">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                              style={{ background: CHART_COLORS[record.allScores[record.winnerIndex]?.colorIndex % CHART_COLORS.length] + "20", color: CHART_COLORS[record.allScores[record.winnerIndex]?.colorIndex % CHART_COLORS.length] }}>
                              👑 {record.winner}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-gray-500 dark:text-gray-400 font-mono">#{record.totalBattles}</td>
                          {getAllPlayers().slice(0, 4).map((p) => {
                            const score = record.allScores.find(s => s.name === p.name)?.score || 0;
                            const isWinner = record.winner === p.name;
                            return (
                              <td key={p.name} className="py-3 px-2">
                                <span className={`font-mono font-medium ${isWinner ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-gray-100"}`}>
                                  {score}{isWinner && " 👑"}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredHistory.length > 20 && (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
                      Showing latest 20 of {filteredHistory.length} battles
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 md:mt-12 p-6 rounded-2xl glass border border-white/20 animate-fade-in-up">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span>📖</span> How to Use
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm md:text-base grid grid-cols-1 md:grid-cols-2 gap-4">
            <li className="flex items-start gap-2">• Battle history syncs automatically from Battle Arena</li>
            <li className="flex items-start gap-2">• Win rate chart shows cumulative % over time per player</li>
            <li className="flex items-start gap-2">• Streak chart visualizes win streaks after each battle</li>
            <li className="flex items-start gap-2">• Click a player in leaderboard to see detailed stats</li>
            <li className="flex items-start gap-2">• Filter by time range: Week, Month, Year, All Time</li>
            <li className="flex items-start gap-2">• Export CSV for spreadsheet analysis</li>
            <li className="flex items-start gap-2">• Export JSON for full data backup</li>
            <li className="flex items-start gap-2">• Data persists in browser localStorage</li>
          </ul>
        </div>
      </div>
    </div>
  );
}