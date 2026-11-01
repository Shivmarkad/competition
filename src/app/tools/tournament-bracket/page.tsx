"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Link from "next/link";

type Player = { id: string; name: string; seed?: number };
type Match = { id: string; round: number; position: number; player1?: Player; player2?: Player; winner?: Player; score1?: number; score2?: number; completed: boolean };
type Tournament = { id: string; name: string; type: "single" | "double"; players: Player[]; matches: Match[]; createdAt: number; currentRound: number };

const PRESET_NAMES = [
  ["Alice", "Bob", "Charlie", "Diana"],
  ["Team Alpha", "Team Beta", "Team Gamma", "Team Delta", "Team Epsilon", "Team Zeta", "Team Eta", "Team Theta"],
  ["Player 1", "Player 2", "Player 3", "Player 4", "Player 5", "Player 6", "Player 7", "Player 8", "Player 9", "Player 10", "Player 11", "Player 12", "Player 13", "Player 14", "Player 15", "Player 16"],
];

export default function TournamentBracket() {
  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("battleTournaments");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });
  const [currentTournament, setCurrentTournament] = useState<Partial<Tournament>>({
    name: "",
    type: "single",
    players: [],
  });
  const [matches, setMatches] = useState<Match[]>([]);
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);
  const [dragOverMatch, setDragOverMatch] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showSaved, setShowSaved] = useState(true);
  const bracketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("battleTournaments", JSON.stringify(tournaments));
    } catch (error) {
      console.error("Failed to save tournaments:", error);
    }
  }, [tournaments]);

  // Generate bracket matches
  const generateBracket = useCallback((players: Player[], type: "single" | "double") => {
    const numPlayers = players.length;
    if (numPlayers < 2) return [];

    // Find next power of 2
    let bracketSize = 1;
    while (bracketSize < numPlayers) bracketSize *= 2;

    const totalRounds = Math.log2(bracketSize);
    const newMatches: Match[] = [];
    let matchId = 0;

    // First round - pair players
    const firstRoundMatches = bracketSize / 2;
    for (let i = 0; i < firstRoundMatches; i++) {
      const p1 = players[i * 2];
      const p2 = players[i * 2 + 1];
      newMatches.push({
        id: `m${matchId++}`,
        round: 1,
        position: i,
        player1: p1,
        player2: p2,
        completed: false,
      });
    }

    // Subsequent rounds
    for (let round = 2; round <= totalRounds; round++) {
      const matchesInRound = bracketSize / Math.pow(2, round);
      for (let i = 0; i < matchesInRound; i++) {
        newMatches.push({
          id: `m${matchId++}`,
          round,
          position: i,
          completed: false,
        });
      }
    }

    // Double elimination - add loser bracket (simplified)
    if (type === "double") {
      // Add loser bracket matches (simplified - just second chance)
      const loserBracketStart = matchId;
      for (let round = 1; round <= totalRounds; round++) {
        const matchesInRound = Math.max(1, bracketSize / Math.pow(2, round + 1));
        for (let i = 0; i < matchesInRound; i++) {
          newMatches.push({
            id: `m${matchId++}`,
            round: round + totalRounds,
            position: i,
            completed: false,
          });
        }
      }
      // Grand finals
      newMatches.push({
        id: `m${matchId++}`,
        round: totalRounds * 2 + 1,
        position: 0,
        completed: false,
      });
    }

    return newMatches;
  }, []);

  const handleCreateTournament = useCallback(() => {
    const name = currentTournament.name?.trim() ?? "";
    const players = currentTournament.players ?? [];
    if (!name || players.length < 2) return;

    const playersWithSeeds = players.map((p, i) => ({ ...p, seed: i + 1 }));
    const newMatches = generateBracket(playersWithSeeds, currentTournament.type!);

    const tournament: Tournament = {
      id: Date.now().toString(),
      name,
      type: currentTournament.type!,
      players: playersWithSeeds,
      matches: newMatches,
      createdAt: Date.now(),
      currentRound: 1,
    };

    setTournaments((prev) => [tournament, ...prev]);
    setMatches(newMatches);
    setCurrentTournament({ name: "", type: "single", players: [] });
  }, [currentTournament, generateBracket]);

  const handleAddPlayer = useCallback((name?: string) => {
    const players = currentTournament.players ?? [];
    const playerName = name || `Player ${players.length + 1}`;
    if (players.length >= 64) return;

    setCurrentTournament((prev) => ({
      ...prev,
      players: [...(prev.players ?? []), { id: Date.now().toString(), name: playerName }],
    }));
  }, []);

  const handleRemovePlayer = useCallback((id: string) => {
    setCurrentTournament((prev) => ({
      ...prev,
      players: (prev.players ?? []).filter((p) => p.id !== id),
    }));
  }, []);

  const handlePlayerNameChange = useCallback((id: string, name: string) => {
    setCurrentTournament((prev) => ({
      ...prev,
      players: (prev.players ?? []).map((p) => (p.id === id ? { ...p, name } : p)),
    }));
  }, []);

  const loadPreset = useCallback((presetIndex: number) => {
    const preset = PRESET_NAMES[presetIndex];
    const players = preset.map((name, i) => ({ id: `${Date.now()}-${i}`, name }));
    setCurrentTournament((prev) => ({ ...prev, players }));
  }, []);

  const handleDragStart = useCallback((player: Player) => {
    setDraggedPlayer(player);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, matchId: string) => {
    e.preventDefault();
    setDragOverMatch(matchId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverMatch(null);
  }, []);

  const handleDrop = useCallback((matchId: string) => {
    if (!draggedPlayer) return;

    setMatches((prev) =>
      prev.map((match) => {
        if (match.id !== matchId) return match;
        if (match.player1 && match.player2) return match; // Full

        const hasPlayer = match.player1?.id === draggedPlayer.id || match.player2?.id === draggedPlayer.id;
        if (hasPlayer) return match; // Already in this match

        return {
          ...match,
          player1: match.player1 ? match.player1 : draggedPlayer,
          player2: match.player2 ? match.player2 : draggedPlayer,
        };
      })
    );
    setDraggedPlayer(null);
    setDragOverMatch(null);
  }, [draggedPlayer]);

  const handleMatchWinner = useCallback((matchId: string, winner: Player) => {
    setMatches((prev) => {
      const matchIndex = prev.findIndex((m) => m.id === matchId);
      if (matchIndex === -1) return prev;

      const match = prev[matchIndex];
      const updatedMatch = { ...match, winner, completed: true };

      // Advance winner to next round
      const nextRound = match.round + 1;
      const nextPosition = Math.floor(match.position / 2);
      const nextMatch = prev.find((m) => m.round === nextRound && m.position === nextPosition);

      let newMatches = prev.map((m) => (m.id === matchId ? updatedMatch : m));

      if (nextMatch) {
        const isPlayer1 = match.position % 2 === 0;
        newMatches = newMatches.map((m) =>
          m.id === nextMatch.id
            ? { ...m, [isPlayer1 ? "player1" : "player2"]: winner }
            : m
        );
      }

      return newMatches;
    });
  }, []);

  const handleScoreChange = useCallback((matchId: string, playerNum: 1 | 2, score: number) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? { ...m, [playerNum === 1 ? "score1" : "score2"]: score }
          : m
      )
    );
  }, []);

  const exportAsImage = useCallback(async () => {
    if (!bracketRef.current) return;

    // Simple canvas export
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = 2;
    const element = bracketRef.current;
    const rect = element.getBoundingClientRect();

    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    ctx.scale(scale, scale);

    // This is a simplified export - in production you'd use html2canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.font = "24px Arial";
    ctx.fillText(currentTournament.name || "Tournament Bracket", 20, 40);

    const link = document.createElement("a");
    link.download = `${currentTournament.name || "bracket"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [currentTournament.name]);

  const exportAsJSON = useCallback(() => {
    const data = {
      tournament: currentTournament,
      matches,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${currentTournament.name || "bracket"}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [currentTournament, matches]);

  const loadTournament = useCallback((tournament: Tournament) => {
    setCurrentTournament({
      name: tournament.name,
      type: tournament.type,
      players: tournament.players,
    });
    setMatches(tournament.matches);
  }, []);

  const deleteTournament = useCallback((id: string) => {
    setTournaments((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const rounds = useMemo(() => {
    if (matches.length === 0) return [];
    const maxRound = Math.max(...matches.map((m) => m.round));
    return Array.from({ length: maxRound }, (_, i) => i + 1);
  }, [matches]);

  const roundMatches = useMemo(() => {
    return rounds.map((round) =>
      matches.filter((m) => m.round === round).sort((a, b) => a.position - b.position)
    );
  }, [matches, rounds]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4 safe-top safe-bottom">
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
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-dice mb-3">
            🏆 Tournament Bracket
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Create single & double elimination brackets. Drag players, track scores, export results.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Tournament Setup */}
          <div className="lg:col-span-1 space-y-6 animate-fade-in-up">
            {/* New Tournament Form */}
            <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">New Tournament</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="tournament-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tournament Name
                  </label>
                  <input
                    id="tournament-name"
                    type="text"
                    value={currentTournament.name || ""}
                    onChange={(e) => setCurrentTournament((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Summer Championship"
                    className="input min-h-[48px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bracket Type
                  </label>
                  <div className="flex gap-3">
                    <label className="flex-1 flex items-center gap-2 p-3 rounded-xl border-2 transition-colors cursor-pointer bg-white dark:bg-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700">
                      <input
                        type="radio"
                        name="bracket-type"
                        value="single"
                        checked={currentTournament.type === "single"}
                        onChange={() => setCurrentTournament((prev) => ({ ...prev, type: "single" }))}
                        className="styled"
                      />
                      <span className="font-medium">Single Elimination</span>
                    </label>
                    <label className="flex-1 flex items-center gap-2 p-3 rounded-xl border-2 transition-colors cursor-pointer bg-white dark:bg-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700">
                      <input
                        type="radio"
                        name="bracket-type"
                        value="double"
                        checked={currentTournament.type === "double"}
                        onChange={() => setCurrentTournament((prev) => ({ ...prev, type: "double" }))}
                        className="styled"
                      />
                      <span className="font-medium">Double Elimination</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Players ({currentTournament.players?.length || 0})
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {currentTournament.players?.map((player, index) => (
                      <div key={player.id} className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <span className="w-6 text-center text-sm font-medium text-gray-500 dark:text-gray-400">{index + 1}</span>
                        <input
                          type="text"
                          value={player.name}
                          onChange={(e) => handlePlayerNameChange(player.id, e.target.value)}
                          className="input flex-1 min-h-[40px] text-sm py-2"
                          placeholder={`Player ${index + 1}`}
                        />
                        <button
                          onClick={() => handleRemovePlayer(player.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center"
                          aria-label={`Remove ${player.name}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleAddPlayer()}
                      disabled={currentTournament.players!.length >= 64}
                      className="btn-secondary flex-1 min-h-[44px]"
                    >
                      + Add Player
                    </button>
                    <button
                      onClick={() => handleAddPlayer(`Player ${currentTournament.players!.length + 1}`)}
                      disabled={currentTournament.players!.length >= 64}
                      className="btn-secondary min-h-[44px]"
                    >
                      Quick Add
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {PRESET_NAMES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => loadPreset(i)}
                      className="btn-secondary py-2 text-sm min-h-[40px]"
                    >
                      Preset {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleCreateTournament}
                  disabled={!currentTournament.name?.trim() || currentTournament.players!.length < 2}
                  className="btn-primary w-full justify-center min-h-[48px] text-lg mt-2"
                >
                  🏁 Create Bracket
                </button>
              </div>
            </div>

            {/* Export Options */}
            {matches.length > 0 && (
              <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl animate-fade-in-up stagger-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Export & Share</h2>
                <div className="space-y-2">
                  <button
                    onClick={exportAsImage}
                    className="btn-secondary w-full justify-center min-h-[48px]"
                  >
                    📥 Export as PNG
                  </button>
                  <button
                    onClick={exportAsJSON}
                    className="btn-secondary w-full justify-center min-h-[48px]"
                  >
                    📄 Export as JSON
                  </button>
                  <Link
                    href="/games/battle-arena"
                    className="btn-primary w-full justify-center min-h-[48px]"
                  >
                    ⚔️ Play Battle Arena
                  </Link>
                </div>
              </div>
            )}

            {/* Saved Tournaments */}
            <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl animate-fade-in-up stagger-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Saved Tournaments ({tournaments.length})</h2>
                <button
                  onClick={() => setShowSaved(!showSaved)}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {showSaved ? "Hide" : "Show"}
                </button>
              </div>

              {showSaved && tournaments.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {tournaments.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl hover:bg-white/70 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{t.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <span>{t.type === "single" ? "🏆" : "🔄"} {t.type} elimination</span>
                            <span>·</span>
                            <span>{t.players.length} players</span>
                            <span>·</span>
                            <span>{t.matches.length} matches</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => loadTournament(t)}
                            className="p-2 rounded-lg bg-white/50 dark:bg-gray-700/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                            aria-label={`Load ${t.name}`}
                          >
                            📂
                          </button>
                          <button
                            onClick={() => deleteTournament(t.id)}
                            className="p-2 rounded-lg bg-white/50 dark:bg-gray-700/50 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                            aria-label={`Delete ${t.name}`}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showSaved && tournaments.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <span className="text-4xl mb-2 block">🏆</span>
                  <p>No tournaments saved yet</p>
                  <p className="text-sm mt-1">Create your first bracket!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Bracket Visualization */}
          <div className="lg:col-span-3 animate-fade-in-up stagger-1" ref={bracketRef}>
            {matches.length === 0 ? (
              <div className="glass-strong border border-white/20 rounded-2xl p-8 md:p-12 shadow-xl text-center">
                <span className="text-6xl mb-4 block">🏆</span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">No Tournament Yet</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Create a tournament using the panel on the left. Add players, choose bracket type, and click "Create Bracket".
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {PRESET_NAMES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => loadPreset(i)}
                      className="btn-secondary px-6 py-3 min-h-[48px]"
                    >
                      Try Preset {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl overflow-x-auto">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{currentTournament.name}</h2>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">
                      {currentTournament.type === "single" ? "Single Elimination" : "Double Elimination"}
                    </span>
                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
                      {currentTournament.players?.length} Players
                    </span>
                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium">
                      {matches.filter((m) => m.completed).length}/{matches.length} Complete
                    </span>
                  </div>
                </div>

                {/* Bracket Visualization */}
                <div className="relative" style={{ minWidth: Math.max(800, rounds.length * 280) }}>
                  {/* Round Labels */}
                  <div className="flex gap-4 mb-4" style={{ minWidth: Math.max(800, rounds.length * 280) }}>
                    {rounds.map((round, i) => (
                      <div key={round} className="flex-1 text-center" style={{ minWidth: 260 }}>
                        <div className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                          Round {round}
                          {round === 1 && " (First Round)"}
                          {round === rounds.length && rounds.length > 1 && " (Finals)"}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Matches */}
                  <div className="flex gap-4" style={{ minWidth: Math.max(800, rounds.length * 280) }}>
                    {roundMatches.map((roundMatchList, roundIndex) => (
                      <div key={roundIndex} className="flex flex-col gap-4" style={{ minWidth: 260 }}>
                        {roundMatchList.map((match) => (
                          <div
                            key={match.id}
                            className={`relative p-4 rounded-xl transition-all ${
                              match.completed
                                ? "bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-300"
                                : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"
                            } ${dragOverMatch === match.id ? "ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/30" : ""}`}
                            onDragOver={(e) => handleDragOver(e, match.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={() => handleDrop(match.id)}
                          >
                            {/* Match Header */}
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Match #{match.position + 1}
                              </span>
                              {match.completed && (
                                <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">
                                  Complete
                                </span>
                              )}
                            </div>

                            {/* Player 1 */}
                            <div className="mb-2">
                              {match.player1 ? (
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                  <span className="w-6 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {match.player1.seed}
                                  </span>
                                  <input
                                    type="text"
                                    value={match.player1.name}
                                    readOnly
                                    className="input flex-1 bg-transparent border-0 p-0 text-sm font-medium text-gray-900 dark:text-gray-100"
                                  />
                                  {match.winner?.id === match.player1.id && (
                                    <span className="text-lg animate-bounce">👑</span>
                                  )}
                                  {!match.completed && match.player2 && (
                                    <button
                                      onClick={() => handleMatchWinner(match.id, match.player1!)}
                                      className="p-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                                      aria-label={`${match.player1.name} wins`}
                                    >
                                      ✓
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div
                                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 text-center text-gray-400 dark:text-gray-500"
                                  draggable={!!draggedPlayer}
                                  onDragStart={() => {}}
                                >
                                  {draggedPlayer && dragOverMatch === match.id ? (
                                    <span className="text-green-500">Drop here</span>
                                  ) : (
                                    "Empty slot"
                                  )}
                                </div>
                              )}
                            </div>

                            {/* VS / Score */}
                            {match.player1 && match.player2 && (
                              <div className="flex items-center justify-center gap-2 my-2">
                                {!match.completed && (
                                  <>
                                    <input
                                      type="number"
                                      value={match.score1 || 0}
                                      onChange={(e) => handleScoreChange(match.id, 1, parseInt(e.target.value) || 0)}
                                      className="w-16 text-center input text-sm py-1"
                                      min={0}
                                      max={99}
                                      aria-label="Player 1 score"
                                    />
                                    <span className="text-gray-400 font-bold">-</span>
                                    <input
                                      type="number"
                                      value={match.score2 || 0}
                                      onChange={(e) => handleScoreChange(match.id, 2, parseInt(e.target.value) || 0)}
                                      className="w-16 text-center input text-sm py-1"
                                      min={0}
                                      max={99}
                                      aria-label="Player 2 score"
                                    />
                                  </>
                                )}
                                {match.completed && !match.winner && (
                                  <span className="text-gray-400 text-sm">Pending</span>
                                )}
                              </div>
                            )}

                            {/* Player 2 */}
                            <div className="mt-2">
                              {match.player2 ? (
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                  <span className="w-6 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {match.player2.seed}
                                  </span>
                                  <input
                                    type="text"
                                    value={match.player2.name}
                                    readOnly
                                    className="input flex-1 bg-transparent border-0 p-0 text-sm font-medium text-gray-900 dark:text-gray-100"
                                  />
                                  {match.winner?.id === match.player2.id && (
                                    <span className="text-lg animate-bounce">👑</span>
                                  )}
                                  {!match.completed && match.player1 && (
                                    <button
                                      onClick={() => handleMatchWinner(match.id, match.player2!)}
                                      className="p-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                                      aria-label={`${match.player2.name} wins`}
                                    >
                                      ✓
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div
                                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 text-center text-gray-400 dark:text-gray-500"
                                  draggable={!!draggedPlayer}
                                  onDragStart={() => {}}
                                >
                                  {draggedPlayer && dragOverMatch === match.id ? (
                                    <span className="text-green-500">Drop here</span>
                                  ) : (
                                    "Empty slot"
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Connector line to next round */}
                            {roundIndex < rounds.length - 1 && !isMobile && (
                              <div className="absolute right-[-24px] top-1/2 w-[24px] h-0.5 bg-gray-300 dark:bg-gray-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Connection lines between rounds (SVG) */}
                  {!isMobile && rounds.length > 1 && (
                    <svg
                      className="absolute top-0 left-0 w-full h-full pointer-events-none"
                      style={{ width: Math.max(800, rounds.length * 280), height: roundMatches[0]?.length ? roundMatches[0].length * 140 : 400 }}
                      preserveAspectRatio="none"
                    >
                      {roundMatches.slice(0, -1).flatMap((roundMatchList, roundIndex) =>
                        roundMatchList.map((match, matchIndex) => {
                          if (roundIndex + 1 >= roundMatches.length) return null;
                          const nextRoundMatches = roundMatches[roundIndex + 1];
                          const nextMatch = nextRoundMatches[Math.floor(matchIndex / 2)];
                          if (!nextMatch) return null;

                          const x1 = roundIndex * 280 + 260;
                          const y1 = matchIndex * 140 + 100;
                          const x2 = (roundIndex + 1) * 280 + 20;
                          const y2 = nextMatch.position * 140 + 100;

                          return (
                            <path
                              key={`${match.id}-connector`}
                              d={`M ${x1} ${y1} Q ${x1 + 20} ${y1} ${x1 + 20} ${y2} Q ${x2 - 20} ${y2} ${x2} ${y2}`}
                              stroke="#cbd5e1"
                              strokeWidth={2}
                              fill="none"
                              className="dark:stroke-gray-600"
                            />
                          );
                        })
                      )}
                    </svg>
                  )}
                </div>
              </div>
            )}

            {/* Mobile bracket - simplified list view */}
            {isMobile && matches.length > 0 && (
              <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl mt-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Mobile View - Match List</h3>
                <div className="space-y-3">
                  {roundMatches.flat().map((match) => (
                    <div key={match.id} className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">Round {match.round} - Match {match.position + 1}</span>
                        {match.completed && <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">Complete</span>}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="flex-1 truncate">{match.player1?.name || "TBD"}</span>
                        {match.score1 !== undefined && match.score2 !== undefined && (
                          <span className="font-mono text-gray-600 dark:text-gray-400">{match.score1} - {match.score2}</span>
                        )}
                        <span className="flex-1 truncate text-right">{match.player2?.name || "TBD"}</span>
                        {match.winner && <span className="text-green-500 ml-2">👑 {match.winner.name}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 md:mt-12 p-6 rounded-2xl glass border border-white/20 animate-fade-in-up">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span>📖</span> How to Use
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm md:text-base grid grid-cols-1 md:grid-cols-2 gap-4">
            <li className="flex items-start gap-2">• Enter tournament name and choose Single or Double elimination</li>
            <li className="flex items-start gap-2">• Add players (2-64) or use presets for quick setup</li>
            <li className="flex items-start gap-2">• Click "Create Bracket" to generate the tournament tree</li>
            <li className="flex items-start gap-2">• Click ✓ next to a player to declare them the winner</li>
            <li className="flex items-start gap-2">• Enter scores for each match (optional)</li>
            <li className="flex items-start gap-2">• Winners automatically advance to the next round</li>
            <li className="flex items-start gap-2">• Drag players from sidebar to fill empty slots manually</li>
            <li className="flex items-start gap-2">• Export as PNG image or JSON for sharing</li>
            <li className="flex items-start gap-2">• Tournaments save automatically to localStorage</li>
          </ul>
        </div>
      </div>
    </div>
  );
}