// Type declarations for @capacitor-community/admob
declare module "@capacitor-community/admob" {
  import { PluginListenerHandle } from "@capacitor/core";

  export interface AdMobRewardItem {
    type: string;
    amount: number;
  }

  export interface AdMobAdOptions {
    adId: string;
    isTesting?: boolean;
    autoShow?: boolean;
  }

  export interface AdMobInitOptions {
    testingDevices?: string[];
    initializeForTesting?: boolean;
  }

  export interface SetAppIdOptions {
    appId: string;
  }

  export interface AdMobPlugin {
    initialize(options: AdMobInitOptions): Promise<void>;
    setAppId(options: SetAppIdOptions): Promise<void>;
    prepareRewardVideoAd(options: AdMobAdOptions): Promise<void>;
    showRewardVideoAd(): Promise<void>;
    prepareInterstitial(options: AdMobAdOptions): Promise<void>;
    showInterstitial(): Promise<void>;
    addListener(
      eventName: "onRewardVideoAdLoaded" | "onRewardVideoAdFailedToLoad" | "onRewardVideoAdClosed" | "onRewardVideoAdRewarded" | "onInterstitialAdLoaded" | "onInterstitialAdFailedToLoad" | "onInterstitialAdClosed",
      listenerFunc: (data?: any) => void
    ): Promise<PluginListenerHandle>;
    removeAllListeners(): Promise<void>;
  }

  export const AdMob: AdMobPlugin;
  export const AdMobRewardItem: any;
}