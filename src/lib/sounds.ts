type Note = { freq: number; duration: number };

type MusicTheme = {
  id: string;
  label: string;
  notes: Note[];        // repeating arpeggio
  intervalMs: number;   // ms between notes
  gain: number;         // volume
};

const THEMES: MusicTheme[] = [
  {
    id: 'ambient',
    label: 'Ambient Arpeggio',
    notes: [
      { freq: 261.63, duration: 0.6 }, // C4
      { freq: 329.63, duration: 0.6 }, // E4
      { freq: 392.00, duration: 0.6 }, // G4
      { freq: 440.00, duration: 0.6 }, // A4
      { freq: 392.00, duration: 0.6 }, // G4
      { freq: 329.63, duration: 0.6 }, // E4
    ],
    intervalMs: 600,
    gain: 0.18,
  },
  {
    id: 'calm',
    label: 'Deep Calm',
    notes: [
      { freq: 130.81, duration: 0.8 }, // C3
      { freq: 174.61, duration: 0.8 }, // F3
      { freq: 196.00, duration: 0.8 }, // G3
      { freq: 220.00, duration: 0.8 }, // A3
      { freq: 196.00, duration: 0.8 }, // G3
      { freq: 174.61, duration: 0.8 }, // F3
    ],
    intervalMs: 900,
    gain: 0.14,
  },
  {
    id: 'bright',
    label: 'Bright Chimes',
    notes: [
      { freq: 523.25, duration: 0.4 }, // C5
      { freq: 659.25, duration: 0.4 }, // E5
      { freq: 783.99, duration: 0.4 }, // G5
      { freq: 880.00, duration: 0.4 }, // A5
      { freq: 783.99, duration: 0.4 }, // G5
      { freq: 659.25, duration: 0.4 }, // E5
    ],
    intervalMs: 450,
    gain: 0.12,
  },
  {
    id: 'upbeat',
    label: 'Upbeat Swing',
    notes: [
      { freq: 293.66, duration: 0.25 }, // D4
      { freq: 349.23, duration: 0.25 }, // F4
      { freq: 392.00, duration: 0.25 }, // G4
      { freq: 440.00, duration: 0.5 }, // A4
      { freq: 392.00, duration: 0.25 }, // G4
      { freq: 349.23, duration: 0.25 }, // F4
    ],
    intervalMs: 350,
    gain: 0.16,
  },
  {
    id: 'mystery',
    label: 'Mystery',
    notes: [
      { freq: 185.00, duration: 0.7 }, // F#3
      { freq: 220.00, duration: 0.7 }, // A3
      { freq: 233.08, duration: 0.7 }, // A#3
      { freq: 277.18, duration: 1.0 }, // C#4
      { freq: 233.08, duration: 0.7 }, // A#3
      { freq: 220.00, duration: 0.7 }, // A3
    ],
    intervalMs: 800,
    gain: 0.14,
  },
  {
    id: 'nature',
    label: 'Birdsong',
    notes: [
      { freq: 659.25, duration: 0.2 }, // E5
      { freq: 783.99, duration: 0.2 }, // G5
      { freq: 880.00, duration: 0.3 }, // A5
      { freq: 783.99, duration: 0.2 }, // G5
      { freq: 659.25, duration: 0.2 }, // E5
      { freq: 523.25, duration: 0.4 }, // C5
    ],
    intervalMs: 550,
    gain: 0.13,
  },
  {
    id: 'electro',
    label: 'Electro Pulse',
    notes: [
      { freq: 110.00, duration: 0.15 }, // A2
      { freq: 220.00, duration: 0.15 }, // A3
      { freq: 329.63, duration: 0.15 }, // E4
      { freq: 440.00, duration: 0.3 }, // A4
      { freq: 329.63, duration: 0.15 }, // E4
      { freq: 220.00, duration: 0.15 }, // A3
    ],
    intervalMs: 300,
    gain: 0.15,
  },
];

const THEME_BY_ID = new Map(THEMES.map(t => [t.id, t]));

let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  return audioCtx;
};

/** Play a short, pleasant "swap/pluck" sound when two bottles are swapped. */
export const playSwapSound = () => {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') void ctx.resume();

  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(660, now);
  osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);
  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.2);

  const click = ctx.createBufferSource();
  const clickBuf = ctx.createBuffer(1, ctx.sampleRate * 0.02, ctx.sampleRate);
  const data = clickBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  click.buffer = clickBuf;
  const clickGain = ctx.createGain();
  clickGain.gain.setValueAtTime(0.06, now);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
  click.connect(clickGain);
  clickGain.connect(ctx.destination);
  click.start(now);
};

/** Play a short celebratory sound when the puzzle is solved. */
export const playWinSound = () => {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') void ctx.resume();

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const t = now + i * 0.09;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  });
};

// ---------------------------------------------------------------------------
// Background music (all procedurally generated — copyright free)
// ---------------------------------------------------------------------------

let bgmGain: GainNode | null = null;
let bgmInterval: ReturnType<typeof setInterval> | null = null;
let bgmPlaying = false;
let currentThemeId: string | null = null;

const stopBGM = () => {
  if (bgmInterval) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
  if (bgmGain) {
    try { bgmGain.disconnect(); } catch { /* ignore */ }
    bgmGain = null;
  }
  bgmPlaying = false;
  currentThemeId = null;
};

/** List of available music themes (all procedurally generated, copyright free). */
export const getMusicThemes = (): MusicTheme[] => THEMES;

/** Get the id of the currently playing theme, or null if none. */
export const getCurrentMusicTheme = (): string | null => currentThemeId;

/**
 * Start background music with the given theme.
 * AudioContext starts suspended on mobile WebViews until a user gesture — we
 * resume it (fire-and-forget) and start playing immediately; oscillators begun
 * on a suspended context produce sound once it resumes.
 */
export const startBackgroundMusic = (themeId: string = 'ambient'): boolean => {
  const ctx = getCtx();
  if (!ctx || bgmPlaying) return bgmPlaying;

  const theme = THEME_BY_ID.get(themeId) || THEMES[0];

  if (ctx.state === 'suspended') {
    void ctx.resume();
  }

  stopBGM();

  bgmGain = ctx.createGain();
  bgmGain.gain.value = theme.gain;
  bgmGain.connect(ctx.destination);

  let noteIdx = 0;

  const playNote = () => {
    if (!bgmPlaying || !bgmGain || !ctx) return;
    const note = theme.notes[noteIdx];
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = note.freq;
    osc.connect(bgmGain);
    osc.start();
    osc.stop(ctx.currentTime + note.duration);
    noteIdx = (noteIdx + 1) % theme.notes.length;
  };

  playNote();
  bgmInterval = setInterval(playNote, theme.intervalMs);
  bgmPlaying = true;
  currentThemeId = theme.id;
  return true;
};

/** Stop background music. */
export const stopBackgroundMusic = () => {
  stopBGM();
};

/** Toggle background music on/off. Returns the new state. */
export const toggleBackgroundMusic = (): boolean => {
  if (bgmPlaying) {
    stopBackgroundMusic();
    return false;
  }
  return startBackgroundMusic(currentThemeId || 'ambient');
};

/** Whether background music is currently playing. */
export const isBackgroundMusicPlaying = (): boolean => bgmPlaying;
