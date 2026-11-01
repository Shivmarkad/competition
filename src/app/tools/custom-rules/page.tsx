"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { validateRuleConfig, validateImportedRules, validateLocalStorageItem, DEFAULT_CONFIG } from "@/lib/validation";
import { CustomRule, RuleConfig } from "@/lib/types";

const DEFAULT_CONFIG_LOCAL: RuleConfig = DEFAULT_CONFIG;

const PRESET_RULES: CustomRule[] = [
  {
    id: "classic",
    name: "Classic Battle",
    description: "Standard rules - first to 5 wins, no consecutive win limit",
    config: { ...DEFAULT_CONFIG_LOCAL, maxConsecutiveWins: 999, targetScore: 5 },
    createdAt: 0,
  },
  {
    id: "no-streak",
    name: "No Streaks Allowed",
    description: "No player can win 3 times in a row - keeps games competitive",
    config: { ...DEFAULT_CONFIG_LOCAL, maxConsecutiveWins: 3 },
    createdAt: 0,
  },
  {
    id: "team-deathmatch",
    name: "Team Deathmatch",
    description: "2v2 or 3v3 team battles - teammates share score",
    config: { ...DEFAULT_CONFIG_LOCAL, teamMode: true, teams: 2, targetScore: 10 },
    createdAt: 0,
  },
  {
    id: "king-of-hill",
    name: "King of the Hill",
    description: "First to 15 points wins - but leader gets handicap",
    config: { ...DEFAULT_CONFIG_LOCAL, targetScore: 15, handicapMode: true },
    createdAt: 0,
  },
  {
    id: "speed-run",
    name: "Speed Run",
    description: "30 second timer per battle - fastest wins",
    config: { ...DEFAULT_CONFIG_LOCAL, battleTimer: 30, autoBattle: true, autoBattleInterval: 1000 },
    createdAt: 0,
  },
  {
    id: "tournament",
    name: "Tournament Mode",
    description: "Best of 7 series - auto-battle with 2s intervals",
    config: { ...DEFAULT_CONFIG_LOCAL, targetScore: 4, autoBattle: true, autoBattleInterval: 2000 },
    createdAt: 0,
  },
];

export default function CustomRules() {
  const [savedRules, setSavedRules] = useState<CustomRule[]>(() => {
    return validateLocalStorageItem<CustomRule[]>("battleCustomRules", (v): v is CustomRule[] =>
      Array.isArray(v) && v.every(r =>
        typeof r === "object" && r !== null &&
        typeof (r as Record<string, unknown>).id === "string" &&
        typeof (r as Record<string, unknown>).name === "string" &&
        typeof (r as Record<string, unknown>).description === "string" &&
        typeof (r as Record<string, unknown>).createdAt === "number" &&
        validateRuleConfig((r as Record<string, unknown>).config)
      ), []
    );
  });
  const [currentRule, setCurrentRule] = useState<Partial<CustomRule>>({
    name: "",
    description: "",
    config: { ...DEFAULT_CONFIG_LOCAL },
  });
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<"builder" | "presets" | "saved">("builder");
  const [shareUrl, setShareUrl] = useState<string>("");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("battleCustomRules", JSON.stringify(savedRules));
    } catch (error) {
      console.error("Failed to save rules:", error);
    }
  }, [savedRules]);

  // Generate shareable URL
  useEffect(() => {
    if (currentRule.config) {
      const encoded = btoa(JSON.stringify(currentRule.config));
      setShareUrl(`${window.location.origin}/tools/custom-rules?rule=${encoded}`);
    }
  }, [currentRule.config]);

  // Load rule from URL - with validation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ruleParam = params.get("rule");
    if (ruleParam) {
      try {
        const config = JSON.parse(atob(ruleParam));
        const validated = validateRuleConfig(config);
        if (validated) {
          setCurrentRule((prev) => ({ ...prev, config: { ...prev.config, ...validated } }));
        } else {
          console.warn("Invalid rule config in URL, ignoring");
        }
      } catch (error) {
        console.error("Failed to load rule from URL:", error);
      }
    }
  }, []);

  const updateConfig = useCallback(<K extends keyof RuleConfig>(key: K, value: RuleConfig[K]) => {
    setCurrentRule((prev) => ({
      ...prev,
      config: { ...prev.config!, [key]: value },
    }));
  }, []);

  const updateHandicap = useCallback((playerName: string, score: number) => {
    setCurrentRule((prev) => ({
      ...prev,
      config: {
        ...prev.config!,
        handicapScores: { ...prev.config!.handicapScores, [playerName]: score },
      },
    }));
  }, []);

  const addCustomRule = useCallback((rule: string) => {
    setCurrentRule((prev) => ({
      ...prev,
      config: { ...prev.config!, customRules: [...prev.config!.customRules, rule] },
    }));
  }, []);

  const removeCustomRule = useCallback((index: number) => {
    setCurrentRule((prev) => ({
      ...prev,
      config: { ...prev.config!, customRules: prev.config!.customRules.filter((_, i) => i !== index) },
    }));
  }, []);

  const saveRule = useCallback(() => {
    const name = currentRule.name?.trim() ?? "";
    const description = currentRule.description?.trim() ?? "";
    if (!name || !description) {
      alert("Please enter a name and description");
      return;
    }

    const newRule: CustomRule = {
      id: Date.now().toString(),
      name,
      description,
      config: currentRule.config!,
      createdAt: Date.now(),
    };

    setSavedRules((prev) => [newRule, ...prev]);
    setCurrentRule({ name: "", description: "", config: { ...DEFAULT_CONFIG_LOCAL } });
  }, [currentRule]);

  const loadRule = useCallback((rule: CustomRule) => {
    setCurrentRule({
      name: rule.name,
      description: rule.description,
      config: { ...rule.config },
    });
    setActiveTab("builder");
  }, []);

  const deleteRule = useCallback((id: string) => {
    setSavedRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const applyToBattleArena = useCallback((rule: CustomRule) => {
    try {
      localStorage.setItem("battleCustomRules", JSON.stringify([rule, ...savedRules.filter(r => r.id !== rule.id)]));
      localStorage.setItem("battleActiveRule", JSON.stringify(rule.config));
      alert(`"${rule.name}" applied to Battle Arena!`);
    } catch (error) {
      console.error("Failed to apply rule:", error);
    }
  }, [savedRules]);

  const exportRules = useCallback(() => {
    const data = { rules: savedRules, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `battle-rules-${new Date().toISOString().split("T")[0]}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [savedRules]);

  const importRules = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        const validated = validateImportedRules(data);
        if (validated) {
          setSavedRules((prev) => [...validated.rules, ...prev]);
          alert(`Imported ${validated.rules.length} rule(s) successfully!`);
        } else {
          alert("Invalid rules file format");
        }
      } catch (error) {
        console.error("Import failed:", error);
        alert("Invalid rules file");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }, []);

  const copyShareUrl = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    alert("Share URL copied to clipboard!");
  }, [shareUrl]);

  const config = currentRule.config || DEFAULT_CONFIG;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4 safe-top safe-bottom">
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
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-battle mb-3">
            ⚙️ Custom Rules
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Create house rules, handicaps, team modes & more. Share with friends via URL.
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 animate-fade-in-up stagger-1" role="tablist">
          {[
            { id: "builder", label: "🛠️ Rule Builder" },
            { id: "presets", label: "⚡ Presets" },
            { id: "saved", label: "💾 Saved Rules" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`px-4 py-2 rounded-xl font-medium transition-all min-h-[44px] ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-lg"
                  : "bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Rule Builder / Presets / Saved */}
          <div className="lg:col-span-1 space-y-6 animate-fade-in-up stagger-2">
            {/* Rule Builder Tab */}
            {activeTab === "builder" && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Rule Info</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="rule-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rule Name
                      </label>
                      <input
                        id="rule-name"
                        type="text"
                        value={currentRule.name || ""}
                        onChange={(e) => setCurrentRule((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="My Custom Rules"
                        className="input min-h-[48px]"
                      />
                    </div>
                    <div>
                      <label htmlFor="rule-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        id="rule-desc"
                        value={currentRule.description || ""}
                        onChange={(e) => setCurrentRule((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your house rules..."
                        rows={3}
                        className="input min-h-[80px] resize-y"
                      />
                    </div>
                  </div>
                </div>

                {/* Win Conditions */}
                <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Win Conditions</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Consecutive Wins: <span className="font-mono text-indigo-600 dark:text-indigo-400">{config.maxConsecutiveWins}</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={config.maxConsecutiveWins}
                        onChange={(e) => updateConfig("maxConsecutiveWins", parseInt(e.target.value))}
                        className="styled w-full"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Prevents any player from winning more than this many times in a row</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Target Score (win condition): {config.targetScore ? <span className="font-mono text-indigo-600 dark:text-indigo-400">{config.targetScore}</span> : <span className="text-gray-400">None (infinite)</span>}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={config.targetScore || 0}
                        onChange={(e) => updateConfig("targetScore", parseInt(e.target.value) || null)}
                        className="styled w-full"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">First player/team to reach this score wins (0 = no limit)</p>
                    </div>
                  </div>
                </div>

                {/* Team Mode */}
                <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Team Mode</h2>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="checkbox"
                        checked={config.teamMode}
                        onChange={(e) => updateConfig("teamMode", e.target.checked)}
                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 styled"
                      />
                      <span className="font-medium text-gray-700 dark:text-gray-300">Enable Team Mode</span>
                    </label>

                    {config.teamMode && (
                      <div className="space-y-3 pl-2 md:pl-8 animate-fade-in">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Number of Teams: <span className="font-mono text-indigo-600 dark:text-indigo-400">{config.teams}</span>
                          </label>
                          <input
                            type="range"
                            min="2"
                            max="4"
                            value={config.teams}
                            onChange={(e) => updateConfig("teams", parseInt(e.target.value))}
                            className="styled w-full"
                          />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Players will be evenly distributed across teams. Teammates share combined score.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Handicap Mode */}
                <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Handicap System</h2>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="checkbox"
                        checked={config.handicapMode}
                        onChange={(e) => updateConfig("handicapMode", e.target.checked)}
                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 styled"
                      />
                      <span className="font-medium text-gray-700 dark:text-gray-300">Enable Handicaps</span>
                    </label>

                    {config.handicapMode && (
                      <div className="space-y-3 pl-2 md:pl-8 animate-fade-in">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Give starting score bonuses/penalties to specific players:</p>
                        <div className="space-y-2" id="handicap-inputs">
                          {Object.entries(config.handicapScores).map(([name, score]) => (
                            <div key={name} className="flex items-center gap-2">
                              <span className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">{name}</span>
                              <input
                                type="number"
                                value={score}
                                onChange={(e) => updateHandicap(name, parseInt(e.target.value) || 0)}
                                className="input w-24 text-center"
                                min="-10"
                                max="10"
                              />
                              <button
                                onClick={() => {
                                  setCurrentRule((prev) => {
                                    const newScores = { ...prev.config!.handicapScores };
                                    delete newScores[name];
                                    return { ...prev, config: { ...prev.config!, handicapScores: newScores } };
                                  });
                                }}
                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg min-h-[40px] min-w-[40px]"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const competitorNames: string[] = JSON.parse(localStorage.getItem("battleCustomNames") || "[]");
                              competitorNames.forEach((name: string) => {
                                if (!config.handicapScores[name]) {
                                  updateHandicap(name, 0);
                                }
                              });
                            }}
                            className="btn-secondary text-sm min-h-[40px]"
                          >
                            + Add Player Handicap
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Battle Timer & Auto Battle */}
                <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Timing & Automation</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Battle Timer (seconds): {config.battleTimer ? <span className="font-mono text-indigo-600 dark:text-indigo-400">{config.battleTimer}s</span> : <span className="text-gray-400">None</span>}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="300"
                        step="5"
                        value={config.battleTimer || 0}
                        onChange={(e) => updateConfig("battleTimer", parseInt(e.target.value) || null)}
                        className="styled w-full"
                      />
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="checkbox"
                        checked={config.autoBattle}
                        onChange={(e) => updateConfig("autoBattle", e.target.checked)}
                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 styled"
                      />
                      <span className="font-medium text-gray-700 dark:text-gray-300">Enable Auto Battle</span>
                    </label>

                    {config.autoBattle && (
                      <div className="pl-2 md:pl-8 animate-fade-in">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Interval: <span className="font-mono text-indigo-600 dark:text-indigo-400">{config.autoBattleInterval / 1000}s</span>
                        </label>
                        <select
                          value={config.autoBattleInterval}
                          onChange={(e) => updateConfig("autoBattleInterval", parseInt(e.target.value))}
                          className="input min-h-[44px]"
                        >
                          <option value={1000}>1 second</option>
                          <option value={2000}>2 seconds</option>
                          <option value={3000}>3 seconds</option>
                          <option value={5000}>5 seconds</option>
                          <option value={10000}>10 seconds</option>
                        </select>
                      </div>
                    )}

                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="checkbox"
                        checked={config.soundEnabled}
                        onChange={(e) => updateConfig("soundEnabled", e.target.checked)}
                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 styled"
                      />
                      <span className="font-medium text-gray-700 dark:text-gray-300">Sound Enabled</span>
                    </label>
                  </div>
                </div>

                {/* Custom Rules Text */}
                <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Custom Rules Text</h2>
                  <div className="space-y-2">
                    {config.customRules.map((rule, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={rule}
                          onChange={(e) => {
                            const newRules = [...config.customRules];
                            newRules[index] = e.target.value;
                            updateConfig("customRules", newRules);
                          }}
                          className="input flex-1"
                          placeholder="e.g., 'No healing items allowed'"
                        />
                        <button
                          onClick={() => removeCustomRule(index)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addCustomRule("")}
                      className="btn-secondary text-sm min-h-[40px]"
                    >
                      + Add Custom Rule
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Actions</h2>
                  <div className="space-y-2">
                    <button
                      onClick={saveRule}
                      className="btn-primary w-full justify-center min-h-[48px]"
                    >
                      💾 Save Rule Set
                    </button>
                    <button
                      onClick={copyShareUrl}
                      className="btn-secondary w-full justify-center min-h-[48px]"
                    >
                      🔗 Copy Share URL
                    </button>
                    <button
                      onClick={() => {
                        if (currentRule.name && currentRule.description && currentRule.config) {
                          applyToBattleArena({ ...currentRule, id: "temp", createdAt: Date.now() } as CustomRule);
                        }
                      }}
                      className="btn-secondary w-full justify-center min-h-[48px] text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    >
                      ⚔️ Apply to Battle Arena
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
            )}

            {/* Presets Tab */}
            {activeTab === "presets" && (
              <div className="space-y-4">
                {PRESET_RULES.map((preset) => (
                  <div
                    key={preset.id}
                    className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{preset.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{preset.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {preset.config.teamMode && <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">Team Mode</span>}
                          {preset.config.targetScore && <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">Target: {preset.config.targetScore}</span>}
                          {preset.config.maxConsecutiveWins < 999 && <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full">Max Streak: {preset.config.maxConsecutiveWins}</span>}
                          {preset.config.handicapMode && <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs rounded-full">Handicaps</span>}
                          {preset.config.battleTimer && <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">Timer: {preset.config.battleTimer}s</span>}
                          {preset.config.autoBattle && <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">Auto Battle</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => loadRule(preset)}
                        className="btn-primary min-h-[44px] whitespace-nowrap"
                      >
                        Use This
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Saved Rules Tab */}
            {activeTab === "saved" && (
              <div className="space-y-4">
                {savedRules.length === 0 ? (
                  <div className="glass-strong border border-white/20 rounded-2xl p-8 text-center">
                    <span className="text-4xl mb-2 block">💾</span>
                    <p className="text-gray-500 dark:text-gray-400">No saved rule sets yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create your first rule set in the Builder tab</p>
                  </div>
                ) : (
                  savedRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{rule.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{rule.description}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Created {new Date(rule.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => loadRule(rule)}
                            className="btn-secondary text-sm min-h-[40px]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => applyToBattleArena(rule)}
                            className="btn-secondary text-sm min-h-[40px] text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30"
                          >
                            Apply
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/tools/custom-rules?rule=${btoa(JSON.stringify(rule.config))}`);
                              alert("Share URL copied!");
                            }}
                            className="btn-secondary text-sm min-h-[40px]"
                          >
                            Share
                          </button>
                          <button
                            onClick={() => deleteRule(rule.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {savedRules.length > 0 && (
                  <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl">
                    <div className="flex gap-2">
                      <button
                        onClick={exportRules}
                        className="btn-secondary flex-1 justify-center min-h-[48px]"
                      >
                        📤 Export All Rules
                      </button>
                      <label className="btn-secondary flex-1 justify-center min-h-[48px] cursor-pointer">
                        📥 Import Rules
                        <input
                          type="file"
                          accept=".json"
                          onChange={importRules}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Share URL Display */}
            {activeTab === "builder" && shareUrl && (
              <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl animate-fade-in-up">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Shareable URL</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="input flex-1 bg-gray-100 dark:bg-gray-700 text-sm"
                  />
                  <button
                    onClick={copyShareUrl}
                    className="btn-secondary min-h-[48px] whitespace-nowrap"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Anyone with this link can load your exact rule configuration</p>
              </div>
            )}
          </div>

          {/* Right Panel - Preview / Current Config */}
          <div className="lg:col-span-2 animate-fade-in-up stagger-1">
            <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl h-full">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Rule Preview</h2>

              <div className="space-y-4">
                {/* Summary Card */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-pink-500/10 border border-indigo-500/20 dark:border-indigo-900/20">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{currentRule.name || "Untitled Rule Set"}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{currentRule.description || "No description yet"}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded-full text-xs font-medium">
                      {config.teamMode ? `Teams: ${config.teams}` : "Free-for-all"}
                    </span>
                    <span className="px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded-full text-xs font-medium">
                      {config.targetScore ? `Target: ${config.targetScore}` : "No target score"}
                    </span>
                    <span className="px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded-full text-xs font-medium">
                      Max Streak: {config.maxConsecutiveWins}
                    </span>
                    {config.handicapMode && <span className="px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded-full text-xs font-medium">Handicaps On</span>}
                    {config.battleTimer && <span className="px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded-full text-xs font-medium">Timer: {config.battleTimer}s</span>}
                    {config.autoBattle && <span className="px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded-full text-xs font-medium">Auto: {config.autoBattleInterval/1000}s</span>}
                  </div>
                </div>

                {/* Detailed Config */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Full Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-gray-500 dark:text-gray-400">Max Consecutive Wins:</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100 ml-2">{config.maxConsecutiveWins}</span>
                    </div>
                    <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-gray-500 dark:text-gray-400">Team Mode:</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100 ml-2">{config.teamMode ? `Yes (${config.teams} teams)` : "No"}</span>
                    </div>
                    <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-gray-500 dark:text-gray-400">Target Score:</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100 ml-2">{config.targetScore || "None"}</span>
                    </div>
                    <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-gray-500 dark:text-gray-400">Handicap Mode:</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100 ml-2">{config.handicapMode ? "Enabled" : "Disabled"}</span>
                    </div>
                    <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-gray-500 dark:text-gray-400">Battle Timer:</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100 ml-2">{config.battleTimer ? `${config.battleTimer}s` : "None"}</span>
                    </div>
                    <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-gray-500 dark:text-gray-400">Auto Battle:</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100 ml-2">{config.autoBattle ? `${config.autoBattleInterval/1000}s interval` : "Off"}</span>
                    </div>
                    <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-gray-500 dark:text-gray-400">Sound:</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100 ml-2">{config.soundEnabled ? "On" : "Off"}</span>
                    </div>
                    <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-gray-500 dark:text-gray-400">Custom Rules:</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100 ml-2">{config.customRules.length}</span>
                    </div>
                  </div>

                  {config.handicapScores && Object.keys(config.handicapScores).length > 0 && (
                    <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Handicap Scores:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Object.entries(config.handicapScores).map(([name, score]) => (
                          <span key={name} className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
                            {name}: {score > 0 ? "+" : ""}{score}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {config.customRules.length > 0 && (
                    <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Custom Rules:</span>
                      <ul className="list-disc list-inside mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {config.customRules.map((rule: string, i: number) => (
                          <li key={i}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* JSON View */}
                <details className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span>📋</span> View Raw JSON Config
                  </summary>
                  <pre className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs overflow-x-auto text-gray-900 dark:text-gray-100 max-h-64 overflow-y-auto">
                    {JSON.stringify(config, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 md:mt-12 p-6 rounded-2xl glass border border-white/20 animate-fade-in-up">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span>📖</span> How to Use
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm md:text-base grid grid-cols-1 md:grid-cols-2 gap-4">
            <li className="flex items-start gap-2">• Use the Rule Builder tab to create custom configurations</li>
            <li className="flex items-start gap-2">• Try Presets for common game modes (Team, Tournament, Speed Run)</li>
            <li className="flex items-start gap-2">• Set max consecutive wins to prevent steamrolling</li>
            <li className="flex items-start gap-2">• Enable Team Mode for 2v2 or 3v3 battles</li>
            <li className="flex items-start gap-2">• Add handicaps to balance skill differences</li>
            <li className="flex items-start gap-2">• Set target score for "first to X wins" victory condition</li>
            <li className="flex items-start gap-2">• Use Battle Timer for timed matches</li>
            <li className="flex items-start gap-2">• Enable Auto Battle for hands-free tournaments</li>
            <li className="flex items-start gap-2">• Save rule sets to your library for quick access</li>
            <li className="flex items-start gap-2">• Share rules via URL - works across devices!</li>
            <li className="flex items-start gap-2">• Click "Apply to Battle Arena" to use rules immediately</li>
            <li className="flex items-start gap-2">• Export/Import JSON to backup or share rule collections</li>
          </ul>
        </div>
      </div>
    </div>
  );
}