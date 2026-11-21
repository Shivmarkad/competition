import { playSwapSound, playWinSound, startBackgroundMusic, stopBackgroundMusic, toggleBackgroundMusic, getMusicThemes, getCurrentMusicTheme, isBackgroundMusicPlaying } from '@/lib/sounds';

// Mock AudioContext - recreate for each test to avoid module caching issues
let mockOscillator: any;
let mockGainNode: any;
let mockAudioContext: any;

const createMockAudioContext = () => {
  mockOscillator = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: {
      setValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
      value: 0,
    },
    type: 'sine',
  };

  mockGainNode = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    gain: {
      setValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
      value: 0,
    },
  };

  return {
    createOscillator: jest.fn(() => mockOscillator),
    createGain: jest.fn(() => mockGainNode),
    createBuffer: jest.fn(() => ({
      getChannelData: jest.fn(() => new Float32Array(441)),
    })),
    createBufferSource: jest.fn(() => ({
      connect: jest.fn(),
      start: jest.fn(),
      buffer: null,
    })),
    destination: {},
    currentTime: 0,
    sampleRate: 44100,
    state: 'running',
    resume: jest.fn(() => Promise.resolve()),
  };
};

const originalAudioContext = (window as any).AudioContext;
const originalWebkitAudioContext = (window as any).webkitAudioContext;

// Helper to reset module state
const resetSoundsModule = async () => {
  // Re-import to get fresh module state
  const sounds = await import('@/lib/sounds');
  return sounds;
};

describe('sounds library', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAudioContext = createMockAudioContext();
    (window as any).AudioContext = jest.fn(() => mockAudioContext);
    (window as any).webkitAudioContext = jest.fn(() => mockAudioContext);
    jest.resetModules();
  });

  afterAll(() => {
    (window as any).AudioContext = originalAudioContext;
    (window as any).webkitAudioContext = originalWebkitAudioContext;
  });

  describe('getMusicThemes', () => {
    it('returns array of 7 music themes', async () => {
      const { getMusicThemes } = await resetSoundsModule();
      const themes = getMusicThemes();
      expect(themes).toHaveLength(7);
    });

    it('each theme has required properties', async () => {
      const { getMusicThemes } = await resetSoundsModule();
      const themes = getMusicThemes();
      themes.forEach(theme => {
        expect(theme).toHaveProperty('id');
        expect(theme).toHaveProperty('label');
        expect(theme).toHaveProperty('notes');
        expect(theme).toHaveProperty('intervalMs');
        expect(theme).toHaveProperty('gain');
        expect(Array.isArray(theme.notes)).toBe(true);
        expect(theme.notes.length).toBeGreaterThan(0);
      });
    });

    it('includes all expected theme IDs', async () => {
      const { getMusicThemes } = await resetSoundsModule();
      const themes = getMusicThemes();
      const ids = themes.map(t => t.id);
      expect(ids).toEqual(expect.arrayContaining([
        'ambient', 'calm', 'bright', 'upbeat', 'mystery', 'nature', 'electro'
      ]));
    });
  });

  describe('getCurrentMusicTheme', () => {
    it('returns null initially', async () => {
      const { getCurrentMusicTheme } = await resetSoundsModule();
      expect(getCurrentMusicTheme()).toBeNull();
    });
  });

  describe('isBackgroundMusicPlaying', () => {
    it('returns false initially', async () => {
      const { isBackgroundMusicPlaying } = await resetSoundsModule();
      expect(isBackgroundMusicPlaying()).toBe(false);
    });
  });

  describe('playSwapSound', () => {
    it('creates oscillator and gain nodes', async () => {
      const { playSwapSound } = await resetSoundsModule();
      playSwapSound();
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
    });

    it('does nothing when AudioContext unavailable', async () => {
      const { playSwapSound } = await resetSoundsModule();
      (window as any).AudioContext = undefined;
      (window as any).webkitAudioContext = undefined;
      expect(() => playSwapSound()).not.toThrow();
    });

    it('resumes suspended context', async () => {
      const { playSwapSound } = await resetSoundsModule();
      mockAudioContext.state = 'suspended';
      playSwapSound();
      expect(mockAudioContext.resume).toHaveBeenCalled();
    });
  });

  describe('playWinSound', () => {
    it('creates multiple oscillators for chord', async () => {
      const { playWinSound } = await resetSoundsModule();
      playWinSound();
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(4);
    });

    it('does nothing when AudioContext unavailable', async () => {
      const { playWinSound } = await resetSoundsModule();
      (window as any).AudioContext = undefined;
      (window as any).webkitAudioContext = undefined;
      expect(() => playWinSound()).not.toThrow();
    });

    it('resumes suspended context', async () => {
      const { playWinSound } = await resetSoundsModule();
      mockAudioContext.state = 'suspended';
      playWinSound();
      expect(mockAudioContext.resume).toHaveBeenCalled();
    });
  });

  describe('background music', () => {
    beforeEach(() => {
      mockAudioContext.state = 'running';
    });

    it('startBackgroundMusic returns true and sets playing state', async () => {
      const { startBackgroundMusic, isBackgroundMusicPlaying, getCurrentMusicTheme } = await resetSoundsModule();
      const result = startBackgroundMusic('ambient');
      expect(result).toBe(true);
      expect(isBackgroundMusicPlaying()).toBe(true);
      expect(getCurrentMusicTheme()).toBe('ambient');
    });

    it('startBackgroundMusic creates gain node', async () => {
      const { startBackgroundMusic } = await resetSoundsModule();
      startBackgroundMusic('ambient');
      expect(mockAudioContext.createGain).toHaveBeenCalled();
    });

    it('returns true if already playing (current behavior)', async () => {
      const { startBackgroundMusic, isBackgroundMusicPlaying } = await resetSoundsModule();
      startBackgroundMusic('ambient');
      const result = startBackgroundMusic('calm');
      // Current implementation returns bgmPlaying (true) when already playing
      expect(result).toBe(true);
    });

    it('stopBackgroundMusic stops playback', async () => {
      const { startBackgroundMusic, stopBackgroundMusic, isBackgroundMusicPlaying, getCurrentMusicTheme } = await resetSoundsModule();
      startBackgroundMusic('ambient');
      stopBackgroundMusic();
      expect(isBackgroundMusicPlaying()).toBe(false);
      expect(getCurrentMusicTheme()).toBeNull();
    });

    it('toggleBackgroundMusic toggles state', async () => {
      const { toggleBackgroundMusic, isBackgroundMusicPlaying } = await resetSoundsModule();
      expect(isBackgroundMusicPlaying()).toBe(false);
      const result1 = toggleBackgroundMusic();
      expect(result1).toBe(true);
      expect(isBackgroundMusicPlaying()).toBe(true);

      const result2 = toggleBackgroundMusic();
      expect(result2).toBe(false);
      expect(isBackgroundMusicPlaying()).toBe(false);
    });

    it('toggleBackgroundMusic resumes last theme', async () => {
      const { toggleBackgroundMusic, getCurrentMusicTheme } = await resetSoundsModule();
      toggleBackgroundMusic(); // starts ambient
      toggleBackgroundMusic(); // stops
      const result = toggleBackgroundMusic(); // resumes ambient
      expect(result).toBe(true);
      expect(getCurrentMusicTheme()).toBe('ambient');
    });

    it('startBackgroundMusic with invalid theme defaults to ambient', async () => {
      const { startBackgroundMusic, getCurrentMusicTheme } = await resetSoundsModule();
      startBackgroundMusic('invalid-theme');
      expect(getCurrentMusicTheme()).toBe('ambient');
    });

    it('does nothing when AudioContext unavailable', async () => {
      const { startBackgroundMusic, stopBackgroundMusic, toggleBackgroundMusic } = await resetSoundsModule();
      (window as any).AudioContext = undefined;
      (window as any).webkitAudioContext = undefined;
      expect(() => startBackgroundMusic('ambient')).not.toThrow();
      expect(() => stopBackgroundMusic()).not.toThrow();
      expect(() => toggleBackgroundMusic()).not.toThrow();
    });

    it('resumes suspended context on start', async () => {
      const { startBackgroundMusic } = await resetSoundsModule();
      mockAudioContext.state = 'suspended';
      startBackgroundMusic('ambient');
      expect(mockAudioContext.resume).toHaveBeenCalled();
    });
  });
});