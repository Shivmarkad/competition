"use client";

import { useEffect } from "react";

export function AdSenseAuto() {
  useEffect(() => {
    // Only load AdSense if user has accepted cookies
    const consent = localStorage.getItem("cookieConsent");
    if (consent !== "accepted") return;

    // Load AdSense script
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxxxxxxxxxxxxx";
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);

    // Initialize adsbygoogle
    (window as any).adsbygoogle = (window as any).adsbygoogle || [];
    (window as any).adsbygoogle.push({});

    return () => {
      // Cleanup on unmount
      const existingScript = document.querySelector('script[src*="pagead2.googlesyndication.com"]');
      if (existingScript) existingScript.remove();
    };
  }, []);

  return null; // This component doesn't render anything visible
}