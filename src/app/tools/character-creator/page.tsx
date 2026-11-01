"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { isAllowedImageType, loadImageSafely, sanitizeFilename, validateLocalStorageItem } from "@/lib/validation";

interface Character {
  id: string;
  name: string;
  image: string;
  colorTheme: number;
  accessories: string[];
  createdAt: number;
}

const COLOR_THEMES = [
  { name: "Indigo", border: "border-indigo-300 dark:border-indigo-700", bg: "bg-indigo-50 dark:bg-indigo-900", focus: "focus:ring-indigo-500", score: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-pink-500" },
  { name: "Pink", border: "border-pink-300 dark:border-pink-700", bg: "bg-pink-50 dark:bg-pink-900", focus: "focus:ring-pink-500", score: "text-pink-600 dark:text-pink-400", gradient: "from-pink-500 to-emerald-500" },
  { name: "Emerald", border: "border-emerald-300 dark:border-emerald-700", bg: "bg-emerald-50 dark:bg-emerald-900", focus: "focus:ring-emerald-500", score: "text-emerald-600 dark:text-emerald-400", gradient: "from-emerald-500 to-amber-500" },
  { name: "Amber", border: "border-amber-300 dark:border-amber-700", bg: "bg-amber-50 dark:bg-amber-900", focus: "focus:ring-amber-500", score: "text-amber-600 dark:text-amber-400", gradient: "from-amber-500 to-violet-500" },
  { name: "Violet", border: "border-violet-300 dark:border-violet-700", bg: "bg-violet-50 dark:bg-violet-900", focus: "focus:ring-violet-500", score: "text-violet-600 dark:text-violet-400", gradient: "from-violet-500 to-rose-500" },
  { name: "Rose", border: "border-rose-300 dark:border-rose-700", bg: "bg-rose-50 dark:bg-rose-900", focus: "focus:ring-rose-500", score: "text-rose-600 dark:text-rose-400", gradient: "from-rose-500 to-indigo-500" },
] as const;

const ACCESSORIES = [
  { id: "crown", emoji: "👑", name: "Crown", position: "top" },
  { id: "glasses", emoji: "🕶️", name: "Sunglasses", position: "face" },
  { id: "mask", emoji: "🎭", name: "Mask", position: "face" },
  { id: "hat", emoji: "🎩", name: "Top Hat", position: "top" },
  { id: "headphones", emoji: "🎧", name: "Headphones", position: "top" },
  { id: "cape", emoji: "🦸", name: "Cape", position: "body" },
  { id: "sword", emoji: "⚔️", name: "Sword", position: "hand" },
  { id: "shield", emoji: "🛡️", name: "Shield", position: "hand" },
  { id: "star", emoji: "⭐", name: "Star", position: "top" },
  { id: "heart", emoji: "❤️", name: "Heart", position: "body" },
] as const;

const NAME_PREFIXES = ["Mighty", "Swift", "Cosmic", "Neon", "Shadow", "Blaze", "Frost", "Thunder", "Void", "Star", "Iron", "Gold"];
const NAME_SUFFIXES = ["Striker", "Walker", "Hunter", "Master", "Champion", "Legend", "Hero", "Guardian", "Phantom", "Rider", "Slayer", "Warden"];

export default function CharacterCreator() {
  const [characters, setCharacters] = useState<Character[]>(() => {
    return validateLocalStorageItem<Character[]>("battleCharacters", (v): v is Character[] =>
      Array.isArray(v) && v.every(c =>
        typeof c === "object" && c !== null &&
        typeof (c as Record<string, unknown>).id === "string" &&
        typeof (c as Record<string, unknown>).name === "string" &&
        typeof (c as Record<string, unknown>).image === "string" &&
        typeof (c as Record<string, unknown>).colorTheme === "number" &&
        Array.isArray((c as Record<string, unknown>).accessories) &&
        typeof (c as Record<string, unknown>).createdAt === "number"
      ), []
    );
  });
  const [currentCharacter, setCurrentCharacter] = useState<Partial<Character>>({
    name: "",
    image: "",
    colorTheme: 0,
    accessories: [],
  });
  const [previewImage, setPreviewImage] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [exporting, setExporting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("battleCharacters", JSON.stringify(characters));
    } catch (error) {
      console.error("Failed to save characters:", error);
    }
  }, [characters]);

  // Generate preview with accessories
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 400;
    canvas.width = size;
    canvas.height = size;

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Draw background gradient
    const theme = COLOR_THEMES[currentCharacter.colorTheme || 0];
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    const colors = theme.gradient.split(" to ");
    gradient.addColorStop(0, colors[0].replace("from-", ""));
    gradient.addColorStop(1, colors[1].replace("to-", ""));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Draw image if exists
    if (previewImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Draw image centered
        const aspect = img.width / img.height;
        let drawWidth = size;
        let drawHeight = size;
        if (aspect > 1) {
          drawHeight = size / aspect;
        } else {
          drawWidth = size * aspect;
        }
        ctx.drawImage(img, (size - drawWidth) / 2, (size - drawHeight) / 2, drawWidth, drawHeight);
        drawAccessories(ctx, size);
      };
      img.src = previewImage;
    } else {
      drawAccessories(ctx, size);
    }

    function drawAccessories(ctx: CanvasRenderingContext2D, size: number) {
      const accessories = currentCharacter.accessories || [];
      accessories.forEach((accId) => {
        const acc = ACCESSORIES.find((a) => a.id === accId);
        if (!acc) return;

        ctx.font = "80px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        let x = size / 2;
        let y = size / 2;

        switch (acc.position) {
          case "top":
            y = size * 0.15;
            break;
          case "face":
            y = size * 0.35;
            break;
          case "body":
            y = size * 0.65;
            break;
          case "hand":
            x = size * 0.8;
            y = size * 0.6;
            break;
        }

        ctx.fillText(acc.emoji, x, y);
      });
    }
  }, [previewImage, currentCharacter.colorTheme, currentCharacter.accessories]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!isAllowedImageType(file)) {
        alert("Invalid file type. Please upload JPEG, PNG, WebP, or GIF images only.");
        event.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewImage(base64String);
        setCurrentCharacter((prev) => ({ ...prev, image: base64String }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleNameChange = useCallback((value: string) => {
    setCurrentCharacter((prev) => ({ ...prev, name: value }));
  }, []);

  const handleColorChange = useCallback((index: number) => {
    setCurrentCharacter((prev) => ({ ...prev, colorTheme: index }));
  }, []);

  const handleAccessoryToggle = useCallback((accessoryId: string) => {
    setCurrentCharacter((prev) => {
      const accessories = prev.accessories || [];
      if (accessories.includes(accessoryId)) {
        return { ...prev, accessories: accessories.filter((a) => a !== accessoryId) };
      } else {
        return { ...prev, accessories: [...accessories, accessoryId] };
      }
    });
  }, []);

  const generateRandomName = useCallback(() => {
    const prefix = NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)];
    const suffix = NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)];
    const name = `${prefix} ${suffix}`;
    setCurrentCharacter((prev) => ({ ...prev, name }));
  }, []);

  // Generate a simple placeholder image using canvas
  const generatePlaceholderImage = useCallback((seed: string, themeIndex: number): string => {
    if (typeof window === "undefined") return "";
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    const theme = COLOR_THEMES[themeIndex];
    const gradient = ctx.createLinearGradient(0, 0, 400, 400);
    const colors = theme.gradient.split(" to ");
    gradient.addColorStop(0, colors[0].replace("from-", ""));
    gradient.addColorStop(1, colors[1].replace("to-", ""));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 400);

    // Add some decorative elements based on seed
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    for (let i = 0; i < 10; i++) {
      const x = (seed.charCodeAt(i % seed.length) * 37 + i * 41) % 400;
      const y = (seed.charCodeAt((i + 5) % seed.length) * 43 + i * 29) % 400;
      const size = 10 + (seed.charCodeAt(i % seed.length) % 30);
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    return canvas.toDataURL("image/png");
  }, []);

  const generateRandomCharacter = useCallback(() => {
    const theme = Math.floor(Math.random() * COLOR_THEMES.length);
    const numAccessories = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...ACCESSORIES].sort(() => Math.random() - 0.5);
    const accessories = shuffled.slice(0, numAccessories).map((a) => a.id);
    const prefix = NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)];
    const suffix = NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)];
    const seed = `${prefix}-${suffix}-${Date.now()}`;

    const image = generatePlaceholderImage(seed, theme);

    setCurrentCharacter({
      name: `${prefix} ${suffix}`,
      image,
      colorTheme: theme,
      accessories,
    });
    setPreviewImage(image);
  }, [generatePlaceholderImage]);

  const saveCharacter = useCallback(() => {
    const name = currentCharacter.name?.trim() ?? "";
    if (!name || !previewImage) return;

    const newCharacter: Character = {
      id: Date.now().toString(),
      name,
      image: previewImage,
      colorTheme: currentCharacter.colorTheme || 0,
      accessories: currentCharacter.accessories || [],
      createdAt: Date.now(),
    };

    setCharacters((prev) => [newCharacter, ...prev]);

    // Reset form
    setCurrentCharacter({ name: "", image: "", colorTheme: 0, accessories: [] });
    setPreviewImage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [currentCharacter, previewImage]);

  const exportToBattleArena = useCallback((character: Character) => {
    // Save to Battle Arena's localStorage format
    const competitor = {
      name: character.name,
      image: character.image,
      score: 0,
      colorIndex: character.colorTheme,
    };

    try {
      const existing = localStorage.getItem("battleCompetitors");
      const competitors = existing ? JSON.parse(existing) : [];
      const updated = [...competitors, competitor].slice(0, 6); // Max 6
      localStorage.setItem("battleCompetitors", JSON.stringify(updated));
      localStorage.setItem("battleCustomNames", JSON.stringify(updated.map((c: any) => c.name)));
      alert(`"${character.name}" added to Battle Arena!`);
    } catch (error) {
      console.error("Failed to export to Battle Arena:", error);
    }
  }, []);

  const exportAsPNG = useCallback(async () => {
    if (!canvasRef.current) return;
    setExporting(true);

    try {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.download = `${currentCharacter.name || "character"}.png`;
      link.href = dataUrl;
      link.click();

      // Also save to Battle Arena
      if (currentCharacter.name && previewImage) {
        exportToBattleArena({
          id: Date.now().toString(),
          name: currentCharacter.name,
          image: previewImage,
          colorTheme: currentCharacter.colorTheme || 0,
          accessories: currentCharacter.accessories || [],
          createdAt: Date.now(),
        });
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  }, [currentCharacter, previewImage, exportToBattleArena]);

  const deleteCharacter = useCallback((id: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const loadCharacter = useCallback((character: Character) => {
    setCurrentCharacter({
      name: character.name,
      image: character.image,
      colorTheme: character.colorTheme,
      accessories: character.accessories,
    });
    setPreviewImage(character.image);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4 safe-top safe-bottom">
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
            🎨 Character Creator
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Design unique fighters for Battle Arena. Customize images, colors, accessories & export instantly.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Editor Panel */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in-up stagger-1">
            {/* Preview Canvas */}
            <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">Live Preview</h2>
              <div className="relative flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={400}
                  className="rounded-xl shadow-lg border-4 border-gray-200 dark:border-gray-700 max-w-full h-auto"
                  aria-label="Character preview"
                />
                {!previewImage && !currentCharacter.accessories?.length && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 pointer-events-none">
                    <span className="text-6xl mb-2">🎨</span>
                    <p className="text-center px-4">Upload an image or generate random</p>
                  </div>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl animate-fade-in-up stagger-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Character Image</h2>
              <div className="space-y-4">
                <label htmlFor="image-upload" className="cursor-pointer block">
                  <div className="relative aspect-square overflow-hidden rounded-xl border-4 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                        <span className="text-4xl mb-2">📷</span>
                        <p>Click to upload</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="text-white text-lg font-semibold px-6 py-3 bg-black/50 rounded-full backdrop-blur-sm">
                        Change Image
                      </span>
                    </div>
                  </div>
                </label>
                <input
                  ref={fileInputRef}
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageUpload}
                  aria-label="Upload character image"
                />
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary px-6 py-3 flex-1 min-h-[48px]"
                  >
                    📁 Upload Image
                  </button>
                  <button
                    onClick={generateRandomCharacter}
                    className="btn-secondary px-6 py-3 flex-1 min-h-[48px]"
                  >
                    🎲 Random Image
                  </button>
                </div>
              </div>
            </div>

            {/* Name & Color */}
            <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl animate-fade-in-up stagger-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Identity</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="character-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Character Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="character-name"
                      type="text"
                      value={currentCharacter.name || ""}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Enter character name..."
                      className="input flex-1 min-h-[48px] text-center text-xl font-bold"
                      maxLength={20}
                    />
                    <button
                      onClick={generateRandomName}
                      className="btn-secondary px-4 py-3 min-h-[48px] whitespace-nowrap"
                      aria-label="Generate random name"
                    >
                      🎲
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color Theme
                  </label>
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color theme">
                    {COLOR_THEMES.map((theme, index) => (
                      <button
                        key={index}
                        onClick={() => handleColorChange(index)}
                        className={`px-4 py-2 rounded-xl border-2 transition-all min-h-[48px] flex items-center gap-2 ${currentCharacter.colorTheme === index ? "ring-2 ring-offset-2" : ""} ${theme.border} ${theme.bg} ${theme.focus}`}
                        style={{ borderColor: theme.border.replace("border-", "").replace("dark:border-", "") }}
                        role="radio"
                        aria-checked={currentCharacter.colorTheme === index}
                      >
                        <span className="w-4 h-4 rounded-full" style={{ background: `linear-gradient(135deg, ${theme.gradient.replace("from-", "").replace(" to ", ", ")})` }} />
                        <span className="text-sm font-medium" style={{ color: theme.score.replace("text-", "").replace("dark:text-", "") }}>{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Accessories */}
            <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl animate-fade-in-up stagger-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Accessories</h2>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Accessories">
                {ACCESSORIES.map((acc) => {
                  const isSelected = currentCharacter.accessories?.includes(acc.id);
                  return (
                    <button
                      key={acc.id}
                      onClick={() => handleAccessoryToggle(acc.id)}
                      className={`px-4 py-2 rounded-xl border-2 transition-all min-h-[48px] flex items-center gap-2 ${isSelected ? "ring-2 ring-offset-2" : "hover:border-indigo-300 dark:hover:border-indigo-700"} ${isSelected ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"}`}
                      role="checkbox"
                      aria-checked={isSelected}
                    >
                      <span className="text-2xl">{acc.emoji}</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{acc.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl animate-fade-in-up stagger-5">
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={saveCharacter}
                  disabled={!currentCharacter.name?.trim() || !previewImage}
                  className="btn-primary px-8 py-3 min-h-[48px] text-lg"
                >
                  💾 Save Character
                </button>
                <button
                  onClick={exportAsPNG}
                  disabled={exporting || !currentCharacter.name?.trim() || !previewImage}
                  className="btn-secondary px-8 py-3 min-h-[48px] text-lg"
                >
                  {exporting ? "⏳ Exporting..." : "📥 Export PNG"}
                </button>
                <button
                  onClick={generateRandomCharacter}
                  className="btn-secondary px-8 py-3 min-h-[48px] text-lg"
                >
                  🎲 Random Character
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar - Saved Characters */}
          <div className="space-y-6 animate-fade-in-up stagger-2">
            {/* Quick Export to Battle Arena */}
            <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">⚔️ Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/games/battle-arena"
                  className="btn-primary w-full justify-center min-h-[48px]"
                >
                  Play Battle Arena
                </Link>
                <button
                  onClick={() => setShowPresets(!showPresets)}
                  className="btn-secondary w-full justify-center min-h-[48px]"
                >
                  {showPresets ? "Hide" : "Show"} Presets
                </button>
              </div>
            </div>

            {/* Preset Characters */}
            {showPresets && (
              <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl animate-fade-in-up">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Preset Characters</h2>
                <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))" }}>
                  {["warrior", "mage", "rogue", "archer", "knight", "ninja", "pirate", "wizard"].map((preset, i) => (
                    <button
                      key={preset}
                      onClick={() => {
                        const themes = [0, 2, 5, 3, 0, 5, 3, 1];
                        const accessories = [
                          ["crown", "sword"],
                          ["hat", "star"],
                          ["mask", "sword"],
                          ["glasses", "shield"],
                          ["crown", "shield"],
                          ["mask", "sword"],
                          ["hat", "sword"],
                          ["hat", "star"],
                        ];
                        const themeIndex = themes[i];
                        const seed = `preset-${preset}`;
                        const image = generatePlaceholderImage(seed, themeIndex);
                        setCurrentCharacter({
                          name: preset.charAt(0).toUpperCase() + preset.slice(1),
                          image,
                          colorTheme: themeIndex,
                          accessories: accessories[i],
                        });
                        setPreviewImage(image);
                      }}
                      className="aspect-square rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:border-indigo-500 transition-colors relative group"
                    >
                      <img
                        src={generatePlaceholderImage(`preset-${preset}`, [0, 2, 5, 3, 0, 5, 3, 1][i])}
                        alt={preset}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 text-center">
                        {preset.charAt(0).toUpperCase() + preset.slice(1)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Characters List */}
            <div className="glass-strong border border-white/20 rounded-2xl p-4 md:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Saved Characters ({characters.length})</h2>
                {characters.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm("Delete all saved characters?")) {
                        setCharacters([]);
                        localStorage.removeItem("battleCharacters");
                      }
                    }}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {characters.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <span className="text-4xl mb-2 block">🎨</span>
                  <p>No characters saved yet</p>
                  <p className="text-sm mt-1">Create your first fighter!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {characters.map((char) => (
                    <div
                      key={char.id}
                      className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl hover:bg-white/70 dark:hover:bg-gray-700/50 transition-colors group"
                    >
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ border: `3px solid ${COLOR_THEMES[char.colorTheme].border.replace("border-", "").replace("dark:border-", "")}` }}>
                        <img
                          src={char.image}
                          alt={char.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{char.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ background: `linear-gradient(135deg, ${COLOR_THEMES[char.colorTheme].gradient})` }} />
                          {COLOR_THEMES[char.colorTheme].name}
                          {char.accessories.length > 0 && ` · ${char.accessories.length} accessories`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => loadCharacter(char)}
                          className="p-2 rounded-lg bg-white/50 dark:bg-gray-700/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                          aria-label={`Edit ${char.name}`}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => exportToBattleArena(char)}
                          className="p-2 rounded-lg bg-white/50 dark:bg-gray-700/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                          aria-label={`Export ${char.name} to Battle Arena`}
                        >
                          ⚔️
                        </button>
                        <button
                          onClick={() => deleteCharacter(char.id)}
                          className="p-2 rounded-lg bg-white/50 dark:bg-gray-700/50 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                          aria-label={`Delete ${char.name}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
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
            <li className="flex items-start gap-2">• Upload an image or use "Random Image" for a placeholder</li>
            <li className="flex items-start gap-2">• Enter a custom name or click 🎲 for random names</li>
            <li className="flex items-start gap-2">• Choose a color theme (affects Battle Arena card color)</li>
            <li className="flex items-start gap-2">• Add accessories - they appear on the preview & export</li>
            <li className="flex items-start gap-2">• Click "Save Character" to store in your library</li>
            <li className="flex items-start gap-2">• "Export PNG" downloads image + adds to Battle Arena</li>
            <li className="flex items-start gap-2">• Use presets for quick starter characters</li>
            <li className="flex items-start gap-2">• Click ⚔️ on saved chars to send directly to Battle Arena</li>
          </ul>
        </div>
      </div>
    </div>
  );
}