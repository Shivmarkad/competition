# Monetization Strategy: Ads-First Approach

**Status:** Approved — Implementation Ready
**Target:** Passive side income ($100-1,200/mo by Month 12)
**Time Budget:** 2-5 hrs/week

---

## 🎯 Strategy Overview

**Approach A: Ads-First (AdSense Web + Rewarded Ads Android)**
- Web: Google AdSense (banner, in-article, native)
- Android: Google AdMob (rewarded video + interstitials)
- Growth: Organic/ASO + PWA install prompt + SEO content

---

## 📦 Implementation Phases

### Phase 1: Web Foundation (Week 1-2)
- [ ] Add `ads.txt` to `public/`
- [ ] Create Privacy Policy page (`/privacy`)
- [ ] Create Terms of Service page (`/terms`)
- [ ] Cookie Consent Banner component
- [ ] AdSense Auto-Ads + Manual Slot Components
- [ ] Submit AdSense application

### Phase 2: Android Ads (Week 2-3)
- [ ] Install `@capacitor-community/admob`
- [ ] Configure `capacitor.config.ts` for AdMob
- [ ] Add AdMob App ID to `android/app/src/main/AndroidManifest.xml`
- [ ] Rewarded Ad Service (`src/lib/ads/admob.ts`)
- [ ] Integration: Battle Arena (extra battle), Dice Spinner (extra dice)
- [ ] Interstitial Ad Service (between games, app resume)
- [ ] Test with Test IDs → Production IDs

### Phase 3: Growth & Retention (Week 3-4)
- [ ] PWA Install Prompt Component
- [ ] Daily Reward System (watch ad → bonus)
- [ ] Streak Tracking (localStorage)
- [ ] Share Battle Result → Image + Deep Link
- [ ] ASO: Play Store Listing Optimization
- [ ] SEO Content Pages (3-5 articles)

### Phase 4: Optimization (Ongoing)
- [ ] Ad Placement A/B Testing
- [ ] Revenue Dashboard (AdSense + AdMob APIs)
- [ ] Leaderboards (optional cloud sync)

---

## 🏗️ Code Structure

```
src/
├── app/
│   ├── privacy/page.tsx          # Privacy Policy (required for AdSense)
│   ├── terms/page.tsx            # Terms of Service
│   └── ads.txt                   # AdSense verification (in public/)
├── components/
│   ├── ads/
│   │   ├── AdSenseBanner.tsx     # Manual banner slot
│   │   ├── AdSenseInArticle.tsx  # In-content ad
│   │   ├── AdSenseAuto.tsx       # Auto-ads script
│   │   ├── CookieConsent.tsx     # GDPR/CCPA banner
│   │   └── AdSlot.tsx            # Unified ad slot wrapper
│   ├── ui/
│   │   └── InstallPrompt.tsx     # PWA install button
│   └── rewards/
│       ├── DailyReward.tsx       # Watch ad → bonus
│       └── StreakDisplay.tsx     # Streak counter
├── lib/
│   ├── ads/
│   │   ├── admob.ts              # AdMob service (rewarded, interstitial)
│   │   ├── adsense.ts            # AdSense utilities
│   │   └── index.ts              # Unified exports
│   ├── rewards/
│   │   ├── dailyReward.ts        # Daily reward logic
│   │   └── streak.ts             # Streak tracking
│   └── analytics/
│       └── revenue.ts            # Revenue tracking helpers
└── hooks/
    ├── useAdMob.ts               # AdMob React hooks
    ├── useDailyReward.ts         # Daily reward hook
    └── useStreak.ts              # Streak hook
```

---

## 💰 Revenue Targets

| Period | Web MAU | Android DAU | Monthly Revenue |
|--------|---------|-------------|-----------------|
| Month 1 | 500 | 50 | $5-15 |
| Month 3 | 2,000 | 300 | $30-80 |
| Month 6 | 5,000 | 1,000 | $100-300 |
| Month 12 | 15,000 | 3,000 | $400-1,200 |

*Assumptions: 2% web→Android conversion, 3 sessions/DAU, 1 rewarded ad/session*

---

## 🚫 Guardrails (Do Not Implement)

- ❌ Mediation platforms (AdMob + Unity + IronSource) — overkill <10k DAU
- ❌ Subscriptions before 1k MAU — conversion too low without trust
- ❌ Custom ad server / direct sales — not worth it <100k MAU
- ❌ Over-optimizing ad placement pre-traffic — ship → measure → iterate

---

## 🔑 Key Dependencies to Add

```json
{
  "dependencies": {
    "@capacitor-community/admob": "^6.0.0",
    "cookie-consent": "^1.0.0",
    "react-cookie-consent": "^9.0.0"
  },
  "devDependencies": {
    "@types/cookie-consent": "^1.0.0"
  }
}
```

---

## 📋 Next Session Focus

**Priority Order:**
1. Privacy Policy + Terms pages (unblocks AdSense)
2. `ads.txt` + Cookie Consent Banner
3. AdSense Auto-Ads Component
4. `@capacitor-community/admob` setup
5. Rewarded Ad Integration in Battle Arena & Dice Spinner

---

## 📝 Notes for Future Sessions

- **AdSense Approval:** Need ~10-20 quality pages + traffic. Current games + tools + privacy + terms + 3 SEO articles = sufficient.
- **AdMob Test IDs:** Use during development. Replace with production IDs only after Play Store internal testing.
- **Rewarded Ad Placement:** Natural breakpoints — "Watch ad for extra battle" (Battle Arena), "Watch ad for +1 dice" (Dice Spinner).
- **PWA → Android Funnel:** Install prompt on web → converts to Android user → higher ad revenue (rewarded > banner).
- **No Tracking Policy:** Maintain "no tracking" as competitive advantage. Ads are contextual, not behavioral.

---

*Last Updated: 2026-11-01*
*Next Review: After Phase 1 completion*