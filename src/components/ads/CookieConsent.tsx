"use client";

import { useState, useEffect } from "react";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [consentGiven, setConsentGiven] = useState<"accepted" | "rejected" | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("cookieConsent");
    if (stored === "accepted" || stored === "rejected") {
      setConsentGiven(stored);
    } else {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setConsentGiven("accepted");
    setShowBanner(false);
    // Initialize AdSense after consent
    if (typeof window !== "undefined" && (window as any).adsbygoogle) {
      (window as any).adsbygoogle.push({});
    }
  };

  const handleReject = () => {
    localStorage.setItem("cookieConsent", "rejected");
    setConsentGiven("rejected");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-xl animate-slide-up"
      role="dialog"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-desc"
    >
      <div className="container max-w-5xl mx-auto px-4 py-4 md:py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <svg
              className="w-6 h-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <div>
              <h3 id="cookie-title" className="font-semibold text-gray-900 dark:text-gray-100">
                We value your privacy
              </h3>
              <p id="cookie-desc" className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                We use cookies to enhance your experience and display non-personalized ads via Google AdSense.
                <a href="/privacy" className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-700 ml-1">
                  Learn more
                </a>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleReject}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors min-h-[44px]"
            >
              Reject
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors min-h-[44px]"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}