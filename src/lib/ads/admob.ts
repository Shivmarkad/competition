/**
 * AdMob Service for Capacitor Android App
 * Provides rewarded video and interstitial ad functionality
 */

import { Capacitor } from "@capacitor/core";

// Dynamic import for AdMob - only available on native platforms
let AdMob: any = null;
let AdMobRewardItem: any = null;

async function loadAdMob() {
  if (!AdMob) {
    try {
      const admobModule = await import("@capacitor-community/admob");
      AdMob = admobModule.AdMob;
      AdMobRewardItem = admobModule.AdMobRewardItem;
    } catch (error) {
      console.warn("AdMob: @capacitor-community/admob not installed, using mock implementation");
      AdMob = createMockAdMob();
    }
  }
  return AdMob;
}

function createMockAdMob() {
  return {
    initialize: async () => {},
    setAppId: async () => {},
    prepareRewardVideoAd: async () => {},
    showRewardVideoAd: async () => {},
    prepareInterstitial: async () => {},
    showInterstitial: async () => {},
    addListener: () => {},
    removeAllListeners: () => {},
  };
}

// AdMob Test IDs (replace with production IDs for release)
const TEST_IDS = {
  rewarded: "ca-app-pub-3940256099942544/5224354917", // Google test rewarded video
  interstitial: "ca-app-pub-3940256099942544/1033173712", // Google test interstitial
  appId: "ca-app-pub-3940256099942544~3347511713", // Google test app ID
};

const PRODUCTION_IDS = {
  rewarded: "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy", // Replace with your rewarded ad unit ID
  interstitial: "ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz", // Replace with your interstitial ad unit ID
  appId: "ca-app-pub-xxxxxxxxxxxxxxxx~wwwwwwwwww", // Replace with your AdMob App ID
};

const isNative = Capacitor.isNativePlatform();
// Use process.env for Next.js build-time check
const isProd = typeof process !== "undefined" && process.env.NODE_ENV === "production";
const useTestIds = !isProd || !isNative;

const ids = useTestIds ? TEST_IDS : PRODUCTION_IDS;

let rewardedAdLoaded = false;
let interstitialAdLoaded = false;
let rewardedAdListenerAdded = false;
let interstitialListenerAdded = false;

// Initialize AdMob
export async function initAdMob(): Promise<void> {
  if (!isNative) {
    console.log("AdMob: Not on native platform, skipping initialization");
    return;
  }

  try {
    const admob = await loadAdMob();
    await admob.initialize({
      testingDevices: useTestIds ? ["auto"] : [],
      initializeForTesting: useTestIds,
    });

    // Set App ID for Android
    if (Capacitor.getPlatform() === "android") {
      await admob.setAppId({ appId: ids.appId });
    }

    console.log("AdMob: Initialized successfully");
  } catch (error) {
    console.error("AdMob: Initialization failed:", error);
  }
}

// Rewarded Ad Functions
export async function loadRewardedAd(): Promise<boolean> {
  if (!isNative) return false;

  try {
    const admob = await loadAdMob();
    await admob.prepareRewardVideoAd({
      adId: ids.rewarded,
      isTesting: useTestIds,
      autoShow: false,
    });

    // Add listener if not already added
    if (!rewardedAdListenerAdded) {
      admob.addListener("onRewardVideoAdLoaded", () => {
        rewardedAdLoaded = true;
        console.log("AdMob: Rewarded ad loaded");
      });

      admob.addListener("onRewardVideoAdFailedToLoad", (error: any) => {
        rewardedAdLoaded = false;
        console.error("AdMob: Rewarded ad failed to load:", error);
      });

      admob.addListener("onRewardVideoAdClosed", () => {
        rewardedAdLoaded = false;
        console.log("AdMob: Rewarded ad closed");
      });

      admob.addListener("onRewardVideoAdRewarded", (reward: any) => {
        console.log("AdMob: User rewarded:", reward);
      });

      rewardedAdListenerAdded = true;
    }

    rewardedAdLoaded = true;
    return true;
  } catch (error) {
    console.error("AdMob: Failed to prepare rewarded ad:", error);
    rewardedAdLoaded = false;
    return false;
  }
}

export async function showRewardedAd(): Promise<boolean> {
  if (!isNative) {
    console.log("AdMob: Simulating rewarded ad on web (dev mode)");
    // Simulate rewarded ad for web development
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("AdMob: Simulated rewarded ad completed");
        resolve(true);
      }, 1500);
    });
  }

  if (!rewardedAdLoaded) {
    console.log("AdMob: Rewarded ad not loaded, attempting to load...");
    const loaded = await loadRewardedAd();
    if (!loaded) return false;
  }

  try {
    const admob = await loadAdMob();
    await admob.showRewardVideoAd();
    return true;
  } catch (error) {
    console.error("AdMob: Failed to show rewarded ad:", error);
    rewardedAdLoaded = false;
    return false;
  }
}

export function isRewardedAdReady(): boolean {
  return rewardedAdLoaded;
}

// Interstitial Ad Functions
export async function loadInterstitialAd(): Promise<boolean> {
  if (!isNative) return false;

  try {
    const admob = await loadAdMob();
    await admob.prepareInterstitial({
      adId: ids.interstitial,
      isTesting: useTestIds,
      autoShow: false,
    });

    if (!interstitialListenerAdded) {
      admob.addListener("onInterstitialAdLoaded", () => {
        interstitialAdLoaded = true;
        console.log("AdMob: Interstitial ad loaded");
      });

      admob.addListener("onInterstitialAdFailedToLoad", (error: any) => {
        interstitialAdLoaded = false;
        console.error("AdMob: Interstitial ad failed to load:", error);
      });

      admob.addListener("onInterstitialAdClosed", () => {
        interstitialAdLoaded = false;
        console.log("AdMob: Interstitial ad closed");
        // Preload next interstitial
        loadInterstitialAd();
      });

      interstitialListenerAdded = true;
    }

    interstitialAdLoaded = true;
    return true;
  } catch (error) {
    console.error("AdMob: Failed to prepare interstitial:", error);
    interstitialAdLoaded = false;
    return false;
  }
}

export async function showInterstitialAd(): Promise<boolean> {
  if (!isNative) {
    console.log("AdMob: Simulating interstitial ad on web (dev mode)");
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("AdMob: Simulated interstitial ad completed");
        resolve(true);
      }, 1000);
    });
  }

  if (!interstitialAdLoaded) {
    console.log("AdMob: Interstitial ad not loaded");
    return false;
  }

  try {
    const admob = await loadAdMob();
    await admob.showInterstitial();
    return true;
  } catch (error) {
    console.error("AdMob: Failed to show interstitial:", error);
    interstitialAdLoaded = false;
    return false;
  }
}

export function isInterstitialAdReady(): boolean {
  return interstitialAdLoaded;
}

// Show interstitial between games (with cooldown)
let lastInterstitialTime = 0;
const INTERSTITIAL_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes

export async function showInterstitialIfNeeded(): Promise<void> {
  const now = Date.now();
  if (now - lastInterstitialTime < INTERSTITIAL_COOLDOWN_MS) {
    return; // Respect cooldown
  }

  const shown = await showInterstitialAd();
  if (shown) {
    lastInterstitialTime = now;
  }
}

// Cleanup
export function cleanupAdMob(): void {
  if (!isNative) return;

  try {
    if (AdMob) {
      AdMob.removeAllListeners();
    }
    rewardedAdListenerAdded = false;
    interstitialListenerAdded = false;
    rewardedAdLoaded = false;
    interstitialAdLoaded = false;
    console.log("AdMob: Cleaned up");
  } catch (error) {
    console.error("AdMob: Cleanup failed:", error);
  }
}