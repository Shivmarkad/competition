"use client";

import { useState, useEffect } from "react";
import { AdSenseBanner } from "./AdSenseBanner";
import { AdSenseInArticle } from "./AdSenseInArticle";

export type AdSlotType = "banner" | "in-article" | "auto";

export interface AdSlotProps {
  type?: AdSlotType;
  slot?: string;
  className?: string;
  style?: React.CSSProperties;
  fallback?: React.ReactNode;
}

export function AdSlot({
  type = "banner",
  slot,
  className = "",
  style,
  fallback,
}: AdSlotProps) {
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cookieConsent");
    setConsentGiven(stored === "accepted");
  }, []);

  if (!consentGiven) {
    return fallback ? (
      <div className={className} style={style}>{fallback}</div>
    ) : null;
  }

  switch (type) {
    case "banner":
      return <AdSenseBanner slot={slot} className={className} style={style} />;
    case "in-article":
      return <AdSenseInArticle slot={slot} className={className} style={style} />;
    case "auto":
      return null; // Auto ads handled by AdSenseAuto component
    default:
      return null;
  }
}