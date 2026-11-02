"use client";

import { useEffect, useRef } from "react";

interface AdSenseBannerProps {
  slot?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function AdSenseBanner({
  slot = "1234567890",
  className = "",
  style,
}: AdSenseBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (consent !== "accepted") return;

    if (loadedRef.current && adRef.current) {
      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      } catch (e) {
        console.warn("AdSense push failed:", e);
      }
      return;
    }

    const checkAdsLoaded = setInterval(() => {
      if ((window as any).adsbygoogle && adRef.current) {
        clearInterval(checkAdsLoaded);
        loadedRef.current = true;
        try {
          (window as any).adsbygoogle.push({});
        } catch (e) {
          console.warn("AdSense push failed:", e);
        }
      }
    }, 100);

    return () => clearInterval(checkAdsLoaded);
  }, [slot]);

  return (
    <div
      ref={adRef}
      className={`adsbygoogle ${className}`}
      style={{
        display: "block",
        minHeight: "90px",
        ...style,
      }}
      data-ad-client="ca-pub-xxxxxxxxxxxxxxxx"
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}