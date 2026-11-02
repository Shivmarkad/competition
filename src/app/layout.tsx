import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CookieConsent } from "@/components/ads/CookieConsent";
import { AdSenseAuto } from "@/components/ads/AdSenseAuto";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// CSP for static export - inline script/style needed for Next.js hydration
// Added Google AdSense domains for ads
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com", // Next.js + AdSense
  "style-src 'self' 'unsafe-inline'", // Tailwind CSS uses inline styles
  "img-src 'self' data: blob: https://picsum.photos https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net", // Allow ad images
  "font-src 'self' data: https://fonts.gstatic.com", // Google Fonts
  "connect-src 'self' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net", // AdSense connections
  "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com", // Ad iframes
  "frame-ancestors 'none'", // Prevent embedding
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export const metadata: Metadata = {
  title: "Game Hub - Battle Arena, Dice Spinner, Match Columns & Tools",
  description: "Three unique games plus character creator, tournament brackets, score tracker, and custom rules. Built with Next.js 16, React 19 & Tailwind CSS 4.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta httpEquiv="Content-Security-Policy" content={CSP} />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <CookieConsent />
        <AdSenseAuto />
      </body>
    </html>
  );
}
