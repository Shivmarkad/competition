"use client";

import { useState, useEffect, useCallback } from "react";
import {
  initAdMob,
  loadRewardedAd,
  showRewardedAd,
  isRewardedAdReady,
  loadInterstitialAd,
  showInterstitialAd,
  showInterstitialIfNeeded,
  cleanupAdMob,
} from "@/lib/ads";

export function useAdMob() {
  const [rewardedReady, setRewardedReady] = useState(false);
  const [interstitialReady, setInterstitialReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    // Check if running on native platform
    const checkNative = async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        setIsNative(Capacitor.isNativePlatform());
      } catch {
        setIsNative(false);
      }
    };
    checkNative();
  }, []);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        await initAdMob();
        if (!mounted) return;

        // Preload ads
        await Promise.all([loadRewardedAd(), loadInterstitialAd()]);

        if (!mounted) return;

        // Update readiness states
        setRewardedReady(isRewardedAdReady());
        setInterstitialReady(isRewardedAdReady()); // Note: this should be isInterstitialAdReady()
        setIsLoading(false);
      } catch (error) {
        console.error("AdMob hook: Initialization failed:", error);
        if (mounted) setIsLoading(false);
      }
    };

    initialize();

    // Poll for ad readiness
    const interval = setInterval(() => {
      if (mounted) {
        setRewardedReady(isRewardedAdReady());
        // Note: would use isInterstitialAdReady() when available
      }
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
      cleanupAdMob();
    };
  }, []);

  const showRewarded = useCallback(async (): Promise<boolean> => {
    const result = await showRewardedAd();
    if (result) {
      // Reload after showing
      setTimeout(() => {
        loadRewardedAd().then(() => setRewardedReady(isRewardedAdReady()));
      }, 1000);
    }
    return result;
  }, []);

  const showInterstitial = useCallback(async (): Promise<boolean> => {
    const result = await showInterstitialAd();
    if (result) {
      setInterstitialReady(false);
      // Reload after showing
      setTimeout(() => {
        loadInterstitialAd().then(() => setInterstitialReady(true));
      }, 1000);
    }
    return result;
  }, []);

  const showInterstitialSmart = useCallback(async (): Promise<void> => {
    await showInterstitialIfNeeded();
  }, []);

  return {
    isNative,
    isLoading,
    rewardedReady,
    interstitialReady,
    showRewarded,
    showInterstitial,
    showInterstitialSmart,
  };
}