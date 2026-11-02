"use client";

import { useEffect, useRef } from "react";

interface AdSenseInArticleProps {
  slot?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function AdSenseInArticle({
  slot = "0987654321",
  className = "",
  style,
}: AdSenseInArticleProps) {
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
        minHeight: "250px",
        margin: "2rem auto",
        maxWidth: "800px",
        ...style,
      }}
      data-ad-client="ca-pub-xxxxxxxxxxxxxxxx"
      data-ad-slot={slot}
      data-ad-format="fluid"
      data-ad-layout-key="-gw-3+1f-3d+2z"
    />
  );
}