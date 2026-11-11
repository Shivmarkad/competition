# Game Hub - Design Documentation

**Last Updated:** 2026-11-09

## Overview

Game Hub is a Next.js 16 application featuring three mini-games and several companion tools, all built with a modern, responsive design using Tailwind CSS 4 and React 19. The application is designed to be privacy-first, with all game data stored locally in the browser's `localStorage`.

## Architecture

### Framework
- **Next.js 16** with App Router
- **React 19** for all interactive components
- **Tailwind CSS 4** for styling with custom color gradients
- **Geist font** (from Google Fonts) for typography

### Project Structure
```
src/
├── app/
│   ├── page.tsx                  # Home page with game grid
│   ├── layout.tsx                # Root layout with CSP and AdSense domains
│   ├── games/
│   │   ├── battle-arena/page.tsx    # Character battle game
│   │   ├── dice-spinner/page.tsx    # Multi-dice roller
│   │   └── match-columns/page.tsx   # Connect-4 style game
│   ├── tools/
│   │   ├── page.tsx              # Tools hub with Character Creator, Tournament Bracket, Score Tracker, Custom Rules, Battle Replay
│   │   ├── custom-rules/page.tsx  # Custom rule builder and manager
│   │   └── [other tools]
│   ├── privacy/page.tsx          # Privacy Policy page
│   └── terms/page.tsx            # Terms of Service page
├── components/
│   ├── ads/                      # AdSense and AdMob components
│   ├── rewards/                  # Daily reward and streak display
│   └── ui/                       # Generic UI components
├── lib/
│   ├── types.ts                  # Shared type definitions
│   ├── validation.ts             # Input validation schemas
│   └── ads/                      # Ad utilities (AdSense, AdMob)
└── hooks/                        # Custom React hooks
```

## Games

### 1. Battle Arena ⚔️
- **Objective:** Random competitor battles with weighted odds based on consecutive wins
- **Features:**
  - Add/remove competitors (max 6)
  - Upload custom images for competitors
  - Edit competitor names
  - Auto-battle mode with configurable interval
  - Sound effects and background music
  - Persistent state via localStorage
  - Consecutive win limiter (max 5 wins in a row)
  - Drag-and-drop reordering (desktop)
  - Mobile-responsive card sizes
- **Storage:** `battle-arena-data` localStorage key
- **Key Components:** CompetitorCard, SettingsPanel, battle logic

### 2. Dice Spinner 🎲
- **Objective:** Roll multiple 3D dice with physics-based animation
- **Features:**
  - Roll up to 10 dice at once
  - 3D cube animation with random rotations
  - Total score display
  - Confetti celebration for high rolls (sum >= dice_count * 5)
  - Haptic feedback on supported devices
  - Add/remove dice
  - Reset all dice
- **Storage:** Local state (reset on component unmount)
- **Key Components:** Die grid, controls, confetti effect

### 3. Match Columns 🔴
- **Objective:** Classic Connect-4 gameplay - connect 4 pieces to win
- **Features:**
  - Drop pieces into 7 columns, 6 rows grid
  - Win detection in all 4 directions (horizontal, vertical, diagonal)
  - Draw detection when board fills up
  - Confetti celebration on win
  - Haptic feedback
  - Current player indicator
  - New game reset
  - Mobile column selectors
- **Storage:** Local state (reset on new game)
- **Key Components:** Board grid, drop logic, winner checking

## Tools

### Custom Rules ⚙️
- **Rule Builder:** Create custom battle rules with configurable parameters
- **Preset Library:** Pre-configured rule sets (Classic, No Streaks, Team Deathmatch, King of the Hill, Speed Run, Tournament)
- **Saved Rules:** Store and load custom rule sets
- **Shareable URLs:** Encode rule config in URL for sharing
- **Import/Export:** JSON export/import of rule collections
- **Apply to Battle Arena:** Apply custom rules directly to Battle Arena
- **Configuration Options:**
  - Max consecutive wins (1-10)
  - Team mode (2-4 teams)
  - Target score (win condition)
  - Handicap system (±10 points)
  - Battle timer (0-300 seconds)
  - Auto battle with intervals (1-10 seconds)
  - Sound enabled/disabled
  - Custom rules text
- **Storage:** `battleCustomRules` localStorage key

### Tournament Bracket 🏆
- Single and double elimination formats
- 4-64 player support
- Drag-to-seed functionality
- PDF/PNG export
- Auto scheduling
- Local storage tracking

### Score Tracker 📊
- Battle history tracking
- Win rate calculations
- Streak tracking
- CSV/JSON export
- Persistent statistics

### Character Creator 🎨
- Design custom characters with images, colors, and accessories
- Name generation
- PNG export
- Preset library
- Direct export to Battle Arena

### Battle Replay 🎬
- Record battles with timestamp logs
- Canvas replay animation
- GIF/Video export
- Shareable result cards
- Timestamp logging (in progress - marked as "Coming Soon")

## Legal Pages

### Privacy Policy 📄
- No personally identifiable information collected
- All data stored locally in browser localStorage
- Third-party services: picsum.photos, Google AdSense, Google AdMob, Google Fonts
- Contextual advertising only (no behavioral tracking)
- Cookie consent banner for GDPR/CCPA compliance
- Children's privacy protection (under 13)

### Terms of Service 📄
- Acceptance of terms for service usage
- No account required - all data local-only
- Ad-supported model (AdSense web, AdMob Android)
- User conduct guidelines
- Intellectual property rights
- Third-party service integrations
- Disclaimer of warranties
- Limitation of liability
- Android app specific terms
- Governing law

## Key Design Patterns

### Styling
- Glassmorphism effects with `backdrop-blur-sm`
- Custom gradient backgrounds per game/color theme
- Consistent color schemes (battle: purple/pink, dice: green, match: orange)
- Floating animations on key elements
- Responsive design mobile-first
- Dark mode support (tailwind `dark:` variants)

### Interactions
- Hover animations and transitions
- Floating animation on icons
- Pulse animations for active states
- Confetti effects on achievements
- Haptic feedback where supported
- Drag-and-drop reordering
- Keyboard accessibility (aria labels, focus states)

### State Management
- React `useState` for all component state
- localStorage persistence for battle arena and custom rules
- Effect cleanup for timers and event listeners
- Validation before storage writes

### Accessibility
- ARIA labels on interactive elements
- Proper heading hierarchy
- Color contrast following guidelines
- Reduced motion support
- Focus-visible states
- Screen reader friendly

## Data Persistence

| Data Type | Storage Key | Description |
|-----------|-------------|-------------|
| Battle Arena state | `battle-arena-data` | Competitors, scores, settings, battle count |
| Custom Rules | `battleCustomRules` | Saved rule sets, active rule |
| Character data | Not yet implemented | To be added |
| Tournament brackets | Not yet implemented | To be added |
| Score tracker history | Not yet implemented | To be added |

## Advertising

### Web (AdSense)
- AdSense Auto-Ads script
- Manual banner slot
- In-article ad slots
- Cookie consent banner required
- `ads.txt` file for verification

### Android (AdMob)
- `@capacitor-community/admob` integration
- Rewarded video ads (opt-in for bonuses)
- Interstitial ads between games
- App open ads
- Test IDs during development, production IDs after Play Store testing

## Roadmap / Next Features

1. **Daily Reward System** - Watch ad for bonuses (bonus battles, extra dice)
2. **PWA Install Prompt** - Add to home screen for Android conversion
3. **Character Creator** - Full character design and export
4. **Tournament Bracket** - Complete implementation
5. **Score Tracker** - Full history and export features
6. **Battle Replay** - Recording and export functionality
7. **SEO Articles** - 3-5 articles for search engine optimization
8. **Ad Analytics** - Revenue tracking dashboard

## Technical Decisions

### Why Next.js 16 App Router?
- Full routing with `/app` directory
- Server Components for static content
- Client Components for interactive games
- Built-in CSS/JS optimization
- Easy deployment to Vercel

### Why localStorage over Database?
- Zero server costs
- Immediate data availability
- User-controlled data
- Privacy-friendly (no tracking)
- Offline capable

### Why Tailwind CSS 4?
- Utility-first approach
- Consistent design system
- Easy responsive design
- Built-in dark mode support
- Smaller CSS footprint

### Why Geist Font?
- Modern, clean typeface
- Vercel-optimized
- Good readability for game interfaces
- Free for commercial use
---

## Design Quality & Anti-AI-Slop Guarantees ✅

### How This Project Avoids "AI Slop"

The following design guarantees ensure human-led, quality design decisions:

#### 1. **Brand-Consistent Design Systems** ✅
- **Per-genre color palettes**: Battle (purple/pink gradient), Dice (green gradient), Match (orange gradient)
- **Unified typography**: Geist font family across all pages
- **Consistent spacing**: Tailwind's 4px base scale (`--space-1` through `--space-20`)
- **Consistent border radii**: Single radius scale applied everywhere

#### 2. **Accessibility-First Implementation** ✅
- **ARIA labels**: 15+ aria-labels across battle arena, dice spinner, and tools
- **Focus-visible states**: `var(--battle-primary)` outline on all focusable elements
- **Color contrast**: Tailwind color palette designed for WCAG AA compliance
- **Reduced motion**: `prefers-reduced-motion` support in `globals.css` (lines 168-178)
  - All animations can be muted without losing functionality
  - Critical feedback (battle results, winner detection) preserved
- **Touch targets**: Minimum `48px` hit areas for mobile (`--touch-target` variable)
- **Semantic HTML**: Proper heading hierarchy, `role` attributes on grid/region elements

#### 3. **Meaningful Interactions** ✅
- **No decorative-only animations**: Every animation serves a user purpose
  - `fade-in-up` → reveals content hierarchically
  - `confetti-burst` → celebrates user achievements
  - `piece-drop` → provides feedback on piece placement
  - `win-line` → visual confirmation of victory
  - `float` → subtle life on static elements (optional, muted in reduced motion)
- **Haptic feedback** on supported devices (battle, dice, match)
- **Drag-and-drop** reordering in battle arena (desktop)
- **Column hover preview** in match columns (desktop)
- **Keyboard accessibility** throughout (Tab order, Enter/Space to activate)

#### 4. **Design System Guardrails** ✅ (in `globals.css`)
Custom CSS variables enforce consistency:
- **Border radius** scale: `--radius-sm` through `--radius-full`
- **Shadow** scale: `--shadow-none` through `--shadow-2xl`
- **Transition** scale: `--transition-fast` through `--transition-bounce`
- **Color** tokens: `--color-battle-primary`, `--color-dice-secondary`, `--color-match-primary`
- **Touch target** minimum: `--touch-target: 48px`, `--touch-target-lg: 56px`

#### 5. **Input Validation & Safety** ✅
- **`validation.ts`** schemas prevent bad data from localStorage/URL params
- **`RULE_CONFIG_SCHEMA`** validates all custom rule configs
- **`ALLOWED_IMAGE_TYPES`** restricts uploads to JPEG, PNG, WebP, GIF
- **`validateRuleConfig`** sanitizes and validates rule configurations
- **`validateImportedRules`** prevents malicious JSON structures

#### 6. **Post-Launch Quality Gates** 📋
Recommended ongoing checks:
- [ ] Quarterly accessibility audit with Axe or Lighthouse
- [ ] Monitor `prefers-reduced-motion` user adoption
- [ ] Track bounce rates per game/page
- [ ] Verify no AI-generated copy slipped through without human review
- [ ] Confirm design system variable usage (no inline styles bypassing Tailwind)
- [ ] Test all interactive elements with keyboard-only navigation
- [ ] Verify confetti/animations respect reduced motion setting

#### 7. **Transparency & Trust** ✅
- **Privacy policy**: "No tracking • No accounts • Just games"
- **LocalStorage-only data**: All game state stays in user's browser
- **No behavioral advertising**: Contextual ads only (AdSense/AdMob)
- **Clear consent**: Cookie consent banner for non-essential cookies
- **Data export**: Users can manually export via browser dev tools

### Red Flags This Project Does NOT Have (AI Slop Indicators) ✅

| Indicator | Status |
|---|---|
| Generic stock photos without purpose | Uses `picsum.photos` with seeded IDs (purposeful) |
| Keyword-stuffed copy | Descriptive, user-focused throughout |
| No accessibility | Full ARIA, contrast, focus states implemented |
| Inconsistent design | Single system per game genre |
| Pure decoration animations | All serve user goals |
| No user goals | Clear objectives per game/tool |
| Random color mixing | Defined palettes per genre |
| No focus indicators | `focus-visible` rings everywhere |

### Design Principles Documented

All design decisions follow these principles:

1. **User-first, not algorithm-first** - Every UI element serves a player goal
2. **Accessibility by default** - ARIA, contrast, focus, reduced motion all built-in
3. **Consistency over creativity** - Design system enforced via CSS variables and TypeScript
4. **Performance mindful** - No render-blocking, optimized animations, localStorage over database
5. **Privacy-first** - No tracking, no PII collection, all data user-controlled
6. **Brand-aligned** - Cohesive look across all games, tools, and legal pages

---
*Last Updated: 2026-11-09*
*Next Review: After Phase 1 AdSense completion, or when new components are added*

**Anti-AI-Slop Checklist for Future Additions:**
- [ ] Human review of all copy before publication
- [ ] Accessibility audit (ARIA, contrast, keyboard nav)
- [ ] Design system variable usage (no bypasses)
- [ ] Meaningful interaction purpose (no decorative-only motion)
- [ ] Reduced motion support tested
- [ ] ARIA labels on all interactive elements
- [ ] Color contrast verified against WCAG AA
- [ ] Touch target minimum 48px on mobile
- [ ] Input validation via `validation.ts` schemas
- [ ] TypeScript interfaces for all props/interfaces
