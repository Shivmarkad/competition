import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// CSP for static export - inline script/style needed for Next.js hydration
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline/eval for hydration
  "style-src 'self' 'unsafe-inline'", // Tailwind CSS uses inline styles
  "img-src 'self' data: blob: https://picsum.photos", // Allow data URLs, blob URLs, and picsum for placeholders
  "font-src 'self' data: https://fonts.gstatic.com", // Google Fonts
  "connect-src 'self'", // No external API calls
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
