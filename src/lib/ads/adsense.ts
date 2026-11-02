/**
 * AdSense Utilities for Web
 * Helper functions for managing AdSense ads
 */

declare global {
  interface Window {
    adsbygoogle: any[];
    google_ad_client: string;
  }
}

/**
 * Check if user has accepted cookie consent
 */
export function hasAdConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("cookieConsent") === "accepted";
}

/**
 * Push an ad request to AdSense queue
 */
export function pushAdRequest(): void {
  if (typeof window === "undefined") return;
  if (!hasAdConsent()) return;

  try {
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
  } catch (error) {
    console.warn("AdSense: Failed to push ad request:", error);
  }
}

/**
 * Initialize AdSense script if not already loaded
 */
export function initAdSense(publisherId: string = "ca-pub-xxxxxxxxxxxxxxxx"): void {
  if (typeof window === "undefined") return;
  if (!hasAdConsent()) return;

  // Check if script already exists
  const existingScript = document.querySelector(
    `script[src*="pagead2.googlesyndication.com"][data-client="${publisherId}"]`
  );
  if (existingScript) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
  script.crossOrigin = "anonymous";
  script.dataset.client = publisherId;
  document.head.appendChild(script);

  window.adsbygoogle = window.adsbygoogle || [];
}

/**
 * Refresh all AdSense ads on the page
 */
export function refreshAds(): void {
  if (typeof window === "undefined") return;
  if (!hasAdConsent()) return;

  try {
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
  } catch (error) {
    console.warn("AdSense: Failed to refresh ads:", error);
  }
}

/**
 * Get AdSense publisher ID from environment or config
 */
export function getPublisherId(): string {
  // In production, this would come from env var (Next.js uses NEXT_PUBLIC_ prefix)
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID) {
    return process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
  }
  return "ca-pub-xxxxxxxxxxxxxxxx";
}

/**
 * Ad slot configurations for different placements
 */
export const AD_SLOTS = {
  // Header banner (below nav, above content)
  header: "1234567890",
  // In-article (between content sections)
  inArticle: "0987654321",
  // Sidebar (if applicable)
  sidebar: "1122334455",
  // Footer banner
  footer: "5566778899",
  // Battle Arena specific
  battleArena: "1112223334",
  // Dice Spinner specific
  diceSpinner: "4443332221",
  // Match Columns specific
  matchColumns: "5556667778",
  // Tools page specific
  tools: "8889990001",
} as const;

export type AdSlotKey = keyof typeof AD_SLOTS;