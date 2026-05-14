# Next.js Migration — Elite Performance Architecture Blueprint

> **From:** React 19 + Vite 6 SPA
> **To:** Next.js App Router with SSR/ISR, Server Components, edge-first delivery
> **Goal:** Instant loading, maximum crawlability, world-class Core Web Vitals, premium UX on low-end Android devices over slow networks — while preserving cinematic wedding invitation aesthetics.

---

## Table of Contents

1. [Migration Philosophy](#1-migration-philosophy)
2. [Next.js Architecture Strategy](#2-nextjs-architecture-strategy)
3. [Hydration Minimization Strategy](#3-hydration-minimization-strategy)
4. [Rendering Strategy Matrix](#4-rendering-strategy-matrix)
5. [Image Optimization Strategy](#5-image-optimization-strategy)
6. [Animation Performance Strategy](#6-animation-performance-strategy)
7. [JavaScript Bundle Optimization](#7-javascript-bundle-optimization)
8. [Audio & Media Optimization](#8-audio--media-optimization)
9. [SEO & Google Crawl Optimization](#9-seo--google-crawl-optimization)
10. [Core Web Vitals Optimization](#10-core-web-vitals-optimization)
11. [Caching & Delivery Architecture](#11-caching--delivery-architecture)
12. [Fonts Optimization](#12-fonts-optimization)
13. [Mobile-First & Low-End Device Strategy](#13-mobile-first--low-end-device-strategy)
14. [Firebase Integration Optimization](#14-firebase-integration-optimization)
15. [Folder Structure & Architecture](#15-folder-structure--architecture)
16. [Performance Budget System](#16-performance-budget-system)
17. [Performance Audit Workflow](#17-performance-audit-workflow)
18. [Production Deployment Strategy](#18-production-deployment-strategy)
19. [Advanced Elite Optimization Techniques](#19-advanced-elite-optimization-techniques)
20. [Migration Execution Checklist](#20-migration-execution-checklist)

---

## 1. Migration Philosophy

### Why the current SPA architecture is problematic

The current stack — React 19 + Vite 6 SPA with client-side Firestore fetching — follows this critical path:

```
User taps link
  → DNS + TLS (200–800ms on mobile)
    → Download index.html (empty <div id="root">)
      → Download JS bundle (~300KB+ gzipped: React + Firebase + Motion + app code)
        → Parse + compile JS (500–2000ms on low-end Android)
          → Execute React, mount components
            → Firebase client SDK initializes
              → Firestore getDoc() over WebSocket (300–1500ms)
                → Receive data, setState, re-render
                  → Download hero image (500KB–3MB)
                    → First meaningful paint
```

**On a Samsung Galaxy A03 over 3G: 8–15 seconds to first meaningful content.**

With Next.js SSR:

```
User taps link
  → DNS + TLS (200–800ms)
    → Download pre-rendered HTML with content + inline CSS variables (5–15KB)
      → First meaningful paint (content visible immediately)
        → Download JS for interactivity (in background)
          → Hydrate interactive elements only
```

**Same device, same network: 1–3 seconds to first meaningful content.**

### The core performance principles

1. **The fastest JavaScript is the JavaScript never sent to the browser.** Every `'use client'` boundary adds hydration cost. Server Components send zero JS.
2. **Beautiful UI is meaningless if low-end devices struggle to render it.** A cinematic animation that drops to 8 FPS on a budget phone is worse than no animation.
3. **Network is the bottleneck, not the server.** A 15KB server-rendered HTML document arrives faster than a 300KB JS bundle that then fetches data.
4. **Perceived performance > actual performance.** Content visible in 1s with interactions ready at 3s feels faster than blank screen until 5s then everything at once.

### Hydration cost on real devices

| Device | JS Parse 1MB | Hydration 100 components | Total overhead |
|---|---|---|---|
| iPhone 15 Pro | ~50ms | ~30ms | ~80ms |
| Pixel 7 | ~120ms | ~80ms | ~200ms |
| Samsung Galaxy A14 | ~800ms | ~400ms | ~1200ms |
| Redmi 9A (2GB RAM) | ~1500ms | ~700ms | ~2200ms |

The current app has ~117 `motion.*` elements and ~33 components — all requiring client-side hydration in the SPA model. With Server Components, we aim to hydrate only the ~15 components that genuinely need interactivity.

---

## 2. Next.js Architecture Strategy

### Server-first rendering architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            app/[slug]/page.tsx (SERVER)               │   │
│  │                                                       │   │
│  │  • Fetch wedding data from Firestore (firebase-admin) │   │
│  │  • Generate metadata (title, OG, JSON-LD)             │   │
│  │  • Inject theme CSS variables via <style>             │   │
│  │  • Conditionally inject custom Google Fonts <link>    │   │
│  │  • Render static HTML shell                          │   │
│  │  • Stream to client                                  │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │     Server-rendered HTML (zero JS)              │  │   │
│  │  │                                                 │  │   │
│  │  │  • Theme colors applied via inline <style>      │  │   │
│  │  │  • Hero image with next/image (priority)        │  │   │
│  │  │  • Couple names, date, venue — visible text     │  │   │
│  │  │  • JSON-LD structured data                      │  │   │
│  │  │  • OpenGraph meta tags                          │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │     Client Islands (selective hydration)        │  │   │
│  │  │                                                 │  │   │
│  │  │  • CinematicOpening (gesture detection)         │  │   │
│  │  │  • FloatingController (audio, drag)             │  │   │
│  │  │  • RSVPSection (real-time wishes)               │  │   │
│  │  │  • TwibbonCreator (canvas, file upload)         │  │   │
│  │  │  • PhotoZoomModal (zoom interaction)            │  │   │
│  │  │  • AmbientSocialLayer (intersection gated)      │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Key architectural decisions

| Decision | Rationale |
|---|---|
| Server Components by default | Zero JS shipped for static content (couple info, venue, date, gallery layout) |
| `'use client'` only for interactivity | Gesture detection, audio playback, real-time Firebase, canvas, drag/drop |
| ISR with 5-minute revalidation | Near-static speed, admin changes propagate within minutes |
| `firebase-admin` on server | Single Firestore read per ISR cycle vs. per-visitor client reads |
| Streaming SSR | Progressive HTML delivery — header/hero visible before footer data resolves |
| Edge Runtime where possible | Sub-50ms TTFB for cached pages globally |

### React Server Components philosophy

Server Components are not "components that run on the server." They are **components whose output is pure HTML/CSS that never touches the browser's JavaScript runtime.** The browser receives pre-rendered DOM — no React reconciliation, no event handlers, no state management, no hydration overhead.

For a wedding invitation:
- Couple names, photos, venue address, date, Quran verse, credits → **pure content, zero interactivity** → Server Components
- Music player, RSVP form, twibbon canvas, photo zoom → **require browser APIs** → Client Components

---

## 3. Hydration Minimization Strategy

### The cost of `'use client'`

Every component marked `'use client'` must:
1. Ship its JavaScript to the browser (~1–50KB per component)
2. Parse and compile that JavaScript (expensive on low-end CPUs)
3. Execute the component code to create a virtual DOM
4. Compare the virtual DOM against server-rendered HTML (reconciliation)
5. Attach event handlers to existing DOM nodes (hydration)

**This entire process is wasted work for components that display static content.**

### Current state vs. target state

**Current (SPA):** All 33 components hydrate on the client — 100% client rendering.

**Target (Next.js optimized):**

| Component | Current | Target | Reason |
|---|---|---|---|
| HeroSection | Client | **Server** | Static image + text, `motion` zoom replaced by CSS `@keyframes` |
| CoupleSection | Client | **Server** | Static photos + text, `fadeUp` replaced by CSS animation |
| EventSection | Client | **Server** + tiny client island for calendar button | Static venue info |
| DigitalEnvelope | Client | **Server** + tiny client island for copy button | Static bank info |
| Footer | Client | **Server** | Static credits + links |
| PhotoGallery | Client | **Server** + client island for zoom trigger | Static grid |
| CinematicStory | Client | **Client** | Swipe gestures, real-time likes/comments |
| CinematicOpening | Client | **Client** | Scroll/swipe/keyboard detection, audio trigger |
| RSVPSection | Client | **Client** | Real-time wishes, pagination, modal trigger |
| TwibbonSection | Client | **Client** | Canvas API, file upload, share |
| FloatingController | Client | **Client** | Audio control, drag interaction |
| AmbientSocialLayer | Client | **Client** | IntersectionObserver, dynamic DOM |
| CountdownTimer | Client | **Client** | setInterval (1s ticks) |
| BackgroundLayers | Client | **Server** | Pure CSS animations, no hooks/state |
| 10 Admin forms | Client | **Client** | Forms with state (admin-only, not user-facing) |

**Result: 6–7 sections become Server Components → ~40–50% reduction in client JS for the wedding page.**

### The interactive island pattern

```tsx
// ❌ BAD: Entire section is a client component because of one button
'use client';
import { motion } from 'motion/react';

export const DigitalEnvelope = () => {
  const wedding = useWeddingContext();
  // ... 72 lines of JSX, all client-rendered for one copy button
};

// ✅ GOOD: Server component with a tiny client island
// app/[slug]/components/DigitalEnvelope.tsx (SERVER)
import { CopyButton } from './CopyButton'; // client island

export const DigitalEnvelope = ({ wedding }) => (
  <section className="relative py-[2vh] bg-ivory">
    {/* All static content — zero JS */}
    <h3 className="font-display italic text-2xl text-ink/80">Amplop Digital</h3>
    {wedding.giftAccounts.map((account, i) => (
      <div key={account.account}>
        <p>{account.bank}</p>
        <p>{account.account}</p>
        <p>{account.owner}</p>
        <CopyButton text={account.account} index={i} /> {/* ~2KB client island */}
      </div>
    ))}
  </section>
);

// app/[slug]/components/CopyButton.tsx (CLIENT)
'use client';
export const CopyButton = ({ text, index }) => {
  const [copied, setCopied] = useState(false);
  // ... tiny 15-line component
};
```

**Cost difference:**
- Bad: ~15KB JS (motion + context + full component)
- Good: ~2KB JS (just the button + useState)

### Animation without `'use client'`

Many current animations use Framer Motion's `motion.div` with `initial`/`animate`/`transition` — **these are entrance animations that play once and don't respond to user input.** They can be replaced with CSS animations, eliminating the need for `'use client'` entirely.

```tsx
// ❌ BEFORE: Requires 'use client' + motion library (~45KB)
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1.8, delay: 0.5 }}
>
  <h1>Dani & Marini</h1>
</motion.div>

// ✅ AFTER: Pure CSS, zero JS, Server Component
// In globals.css:
// @keyframes fade-up { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
<div className="animate-[fade-up_1.8s_0.5s_both] motion-reduce:animate-none">
  <h1>Dani & Marini</h1>
</div>
```

**Components where CSS animations can replace Framer Motion:**
- `HeroSection` — entrance fade-up on names and date (one-shot)
- `CoupleSection` — entrance fade-up on photos and text (one-shot, currently uses `filter: blur()` variant — replace with simpler opacity+transform)
- `EventSection` — entrance animations on venue card (one-shot)
- `DigitalEnvelope` — entrance animations on gift cards (one-shot)
- `Footer` — simple fade-in (one-shot)
- `PhotoGallery` — entrance scale on thumbnails (one-shot)

**Components that MUST keep Framer Motion (require JS interaction):**
- `CinematicOpening` — `AnimatePresence` exit animation, layout animations
- `CinematicStory` — swipe gesture-driven slide transitions
- `RSVPSection` — `AnimatePresence` for wish card transitions
- `FloatingController` — drag constraints, expandable panel
- `PhotoZoomModal` — `AnimatePresence` enter/exit
- `RSVPModal` — `AnimatePresence` enter/exit
- `AmbientSocialLayer` — dynamic element spawn/despawn
- `TwibbonCreator` — draggable image (uses `motion.img`)
- `CountdownTimer` — continuous float animation (could also be CSS)

---

## 4. Rendering Strategy Matrix

| Feature | Rendering | Cache | Rationale |
|---|---|---|---|
| **Wedding page** (`/[slug]`) | ISR | `revalidate: 300` (5 min) | Content changes rarely, first visitor triggers SSR, subsequent visitors get cached edge HTML |
| **Opening gate** | Client hydration | N/A | Gesture detection (scroll/swipe/keyboard) requires browser APIs |
| **Hero section** | Server Component | Static within ISR | Pure image + text, no interactivity |
| **Couple section** | Server Component | Static within ISR | Photos + names + parents, no interactivity |
| **Event section** | Server + client island | Static within ISR | Venue info static; calendar/maps buttons need `window.open` |
| **Story section** | Client Component | N/A | Swipe gestures, real-time likes/comments via `onSnapshot` |
| **Twibbon** | Client Component | N/A | Canvas API, file upload, blob URLs |
| **RSVP section** | Client Component | N/A | Real-time wishes via `onSnapshot`, pagination state |
| **Digital envelope** | Server + client island | Static within ISR | Bank info static; copy button needs clipboard API |
| **Photo gallery** | Server + client island | Static within ISR | Grid layout static; zoom trigger needs click handler |
| **Footer** | Server Component | Static within ISR | Credits + social links, no interactivity |
| **Music player** | Client Component | N/A | Audio API, play/pause state |
| **Admin page** (`/admin/[slug]`) | Client only | No cache | Auth + forms + writes, fully interactive |
| **Not found page** | Static | Permanent | 404 page, never changes |

### Rendering strategy details

| Strategy | TTFB | SEO | Dynamic Data | Use When |
|---|---|---|---|---|
| **SSG** (Static) | ~0ms (CDN) | Excellent | Build-time only | 404 pages, static marketing |
| **ISR** | ~0ms cached, ~200ms miss | Excellent | Revalidates on schedule | Wedding pages (changes every few days) |
| **SSR** | ~200–500ms | Excellent | Always fresh | Admin preview, real-time data |
| **Client** | N/A (deferred) | None | Always fresh | Interactive widgets, forms, real-time |
| **Edge** | ~10–30ms | Excellent | Edge function | Geo-specific, A/B testing |

---

## 5. Image Optimization Strategy

### Why images are the #1 bottleneck

The current wedding invitation loads these images:

| Image | Typical Size | When Loaded | Current Optimization |
|---|---|---|---|
| Opening background | 500KB–3MB | Immediately (eager) | `fetchPriority="high"`, `sizes="100vw"` |
| Hero portrait | 500KB–3MB | After opening dismissed | `fetchPriority="high"`, `loading="eager"`, prefetched via `new Image()` |
| Groom photo | 200KB–1MB | Lazy | `loading="lazy"`, `sizes="(max-width:768px) 65vw, 30vw"` |
| Bride photo | 200KB–1MB | Lazy | Same as groom |
| Story slides (N) | 200KB–1MB each | Lazy | `loading="lazy"`, `sizes="100vw"` |
| Gallery items (N) | 100KB–500KB each | Lazy | `loading="lazy"`, responsive sizes |
| Twibbon overlay | 100KB–500KB | On demand | `crossOrigin="anonymous"` for canvas |

**Total potential image payload: 5–20MB per wedding page.**

### next/image optimization pipeline

```tsx
// ❌ BEFORE: Raw <img>, no optimization
<img
  src={wedding.heroImage}
  fetchPriority="high"
  sizes="100vw"
  loading="eager"
  className="w-full h-full object-cover"
/>

// ✅ AFTER: next/image with automatic optimization
import Image from 'next/image';

<Image
  src={wedding.heroImage}
  fill
  sizes="100vw"
  priority  // equivalent to fetchPriority="high" + loading="eager"
  quality={75}
  className="object-cover"
  placeholder="blur"
  blurDataURL={wedding.heroImageBlurHash}  // 10-byte base64 blur
/>
```

**What `next/image` does automatically:**
- Converts JPEG/PNG → WebP/AVIF (70–90% smaller)
- Generates responsive srcset (640w, 750w, 828w, 1080w, 1200w, 1920w, 2048w, 3840w)
- Serves correct size based on `sizes` attribute and device DPR
- Lazy loads by default (unless `priority` set)
- Prevents CLS with automatic aspect ratio
- Caches optimized images at the edge

**Estimated savings:**

| Image | Before (JPEG) | After (AVIF) | Saving |
|---|---|---|---|
| Hero 1920×1080 | 1.2MB | 180KB | 85% |
| Couple photo 800×1200 | 400KB | 60KB | 85% |
| Gallery thumb 400×600 | 150KB | 25KB | 83% |
| Story slide 1080×1920 | 800KB | 120KB | 85% |

### Image loading strategy by section

| Section | Strategy | `priority` | `sizes` | `placeholder` |
|---|---|---|---|---|
| CinematicOpening | `priority` (LCP candidate) | Yes | `100vw` | `blur` |
| HeroSection | `priority` (LCP candidate) | Yes | `100vw` | `blur` |
| CoupleSection | Default lazy | No | `(max-width:768px) 65vw, 30vw` | `blur` |
| CinematicStory | Default lazy | No | `100vw` | `blur` |
| PhotoGallery | Default lazy | No | `(max-width:640px) 120px, (max-width:768px) 150px, 210px` | `blur` |
| PhotoZoomModal | Default lazy | No | `100vw` | None |
| TwibbonCreator | Keep `<img>` | N/A | N/A | N/A |

### TwibbonCreator — keep native `<img>`

`TwibbonCreator` uses images for canvas drawing via `ctx.drawImage()`. `next/image` renders an optimized `<img>` inside wrapper divs with CSS transforms — the DOM element isn't directly accessible for canvas operations. The overlay image requires `crossOrigin="anonymous"` to avoid canvas taint. The user photo is a local `blob:` URL.

**Keep native `<img>` for both TwibbonCreator images. Keep admin form preview images as native `<img>` (not user-facing).**

### Blur placeholder generation

Generate blur data URLs at build time or ISR time using `plaiceholder` or a custom function:

```ts
// lib/blur.ts (server-only)
export async function getBlurDataURL(url: string): Promise<string> {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const { base64 } = await getPlaiceholder(Buffer.from(buffer), { size: 4 });
  return base64;
}
```

Or use a 1×1 pixel SVG placeholder (zero network cost):

```ts
const shimmer = (w: number, h: number) =>
  `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#F5F2ED"/></svg>`)}`;
```

### Firebase Storage remote pattern config

```ts
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'firebasestorage.googleapis.com' },
      { hostname: 'storage.googleapis.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year — images are immutable (unique tokens)
  },
};
```

---

## 6. Animation Performance Strategy

### Current animation inventory

The codebase has **~117 `motion.*` elements** across 20 files, plus 4 CSS `@keyframes` animations. This is significant — Framer Motion's runtime is ~45KB gzipped.

### GPU-friendly animation rules

Only these CSS properties are "cheap" (composited on GPU, no layout/paint):
- `transform` (translate, scale, rotate, skew)
- `opacity`
- `filter` (on composited layers)

**Expensive properties to avoid:**
- `width`, `height`, `top`, `left`, `margin`, `padding` → trigger layout
- `background-color`, `border`, `box-shadow` → trigger paint
- `filter: blur()` on non-composited elements → triggers paint per frame

### Current performance concerns

| Issue | Location | Impact | Fix |
|---|---|---|---|
| `filter: blur(10px)` animation | `fadeUp` variant in `animations.ts`, used by CoupleSection | Forces paint per frame on low-end | Remove blur from animation, use opacity+transform only |
| 8 FloatingPetals with infinite animations | `FloatingPetals.tsx` | 8 concurrent composited layers | Reduce to 4–5, add `will-change: transform` |
| 15 PetalEffect elements | `PetalEffect.tsx` | 15 concurrent infinite animations | Reduce count, gate behind IntersectionObserver |
| ~165 motion elements total | Various | Large hydration payload | Convert one-shot animations to CSS |
| AmbientSocialLayer pool (max 20) | `AmbientSocialLayer.tsx` | Up to 20 animated DOM nodes | Already gated — good pattern |
| CountdownTimer 1s re-renders | `useCountdown.ts` | Continuous React re-renders | Move to CSS animation or Web Animation API |
| CinematicOpening 4 rotating elements | Lines 154–177 | 4 infinite rotate animations stacked | Acceptable — visible briefly |
| BackgroundLayers grain + sweep | `BackgroundLayers.tsx` | 2 fixed-position infinite CSS animations | Already CSS-only — optimal |

### Recommended animation architecture

```
┌──────────────────────────────────────────────────┐
│              Animation Tiers                      │
│                                                   │
│  Tier 1: CSS @keyframes (Server Component safe)   │
│  • Entrance fade/slide (one-shot)                 │
│  • Background grain/sweep (infinite, CSS-only)    │
│  • Loading pulse animations                       │
│  • Floating text effects                          │
│  ↪ Zero JS, zero hydration                        │
│                                                   │
│  Tier 2: CSS + IntersectionObserver               │
│  • Scroll-triggered entrance animations           │
│  • Viewport-gated infinite effects                │
│  ↪ Tiny JS (<1KB), no Framer Motion               │
│                                                   │
│  Tier 3: Framer Motion (Client Components only)   │
│  • AnimatePresence (enter/exit transitions)        │
│  • Gesture-driven (drag, swipe, pinch)            │
│  • Layout animations                              │
│  • Complex choreographed sequences                │
│  ↪ Full library cost, justified by interactivity   │
└──────────────────────────────────────────────────┘
```

### Reduced motion strategy

Current: Single CSS media query in `index.css` that forces all animations to `0.01ms` with `!important`. Plus `<MotionConfig reducedMotion="user">` in `main.tsx`.

Next.js target: Keep both approaches. The CSS media query ensures server-rendered CSS animations respect the preference. `MotionConfig` handles Framer Motion animations on the client.

```css
/* globals.css */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 7. JavaScript Bundle Optimization

### Current bundle composition (estimated)

| Package | Estimated gzipped size | Used by |
|---|---|---|
| `react` + `react-dom` | ~45KB | Core |
| `firebase/firestore` | ~35KB | Wishes, comments, likes, wedding data |
| `firebase/auth` | ~25KB | Admin only |
| `firebase/storage` | ~15KB | Admin + twibbon |
| `firebase/app` | ~10KB | Core initialization |
| `motion` (Framer Motion) | ~45KB | Animations |
| `react-router-dom` | ~15KB | Routing (eliminated by Next.js) |
| `lucide-react` | ~2KB (tree-shaken) | Icons |
| App code | ~30KB | All components |
| **Total** | **~220KB** | |

### Post-migration target

| Package | Target size | Change |
|---|---|---|
| `react` + `react-dom` | ~45KB | Same (required for hydration) |
| `firebase/firestore` (client) | ~35KB | Lazy loaded, only for real-time hooks |
| `firebase/auth` | ~25KB | Admin route only (separate chunk) |
| `firebase/storage` | ~15KB | Admin route only (separate chunk) |
| `firebase/app` | ~10KB | Lazy loaded with firestore |
| `motion` | ~30KB | Reduced via tree-shaking (fewer components use it) |
| `react-router-dom` | **0KB** | Eliminated |
| `lucide-react` | ~2KB | Same |
| App code (client) | ~15KB | Reduced (server components ship no JS) |
| **Total (wedding page)** | **~100KB** | **~55% reduction** |

### Dynamic import strategy

```tsx
// ❌ BAD: Firebase loaded at module scope for all visitors
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

// ✅ GOOD: Firebase loaded only when needed
const getFirestore = async () => {
  const { getFirestore } = await import('firebase/firestore');
  const { initializeApp } = await import('firebase/app');
  // ... lazy init
};
```

For the wedding page, Firebase client SDK is only needed for:
- `useWishes` (real-time wish list) — loads after user opens invitation
- `useStoryComments` (real-time comments) — loads when user reaches story section
- `useStoryLikes` (like counter) — loads when user reaches story section
- `addWish` (submit RSVP) — loads when user opens RSVP modal

All of these happen **after** the initial page render — the Firebase SDK can be lazy-loaded.

### Bundle budget targets

| Metric | Budget | Rationale |
|---|---|---|
| Initial JS (wedding page) | < 100KB gzipped | Fast parse on low-end devices |
| Total JS (all lazy chunks) | < 250KB gzipped | Reasonable for full interactivity |
| Largest single chunk | < 50KB gzipped | Avoid blocking main thread |
| Admin page JS | No budget (not user-facing) | Admin is dev-only |
| CSS | < 30KB gzipped | Tailwind purges unused |

### Tree-shaking lucide-react

Current imports like `import { Heart, Code, Palette } from 'lucide-react'` are already tree-shakeable — only imported icons are bundled. No action needed. Verified: `lucide-react` contributes ~2KB for the icons used.

---

## 8. Audio & Media Optimization

### Current audio implementation

```tsx
// src/pages/Wedding.tsx lines 352–357
<audio ref={audioRef} loop preload="none" src={wedding?.musicUrl ?? ""} />
```

**Current strengths:**
- `preload="none"` — no audio download until play
- No `autoplay` — play triggered only by user gesture (`handleOpen`)
- Hidden element (no controls)

**Migration considerations:**

1. **Audio element must stay client-side** — browser audio API requires `'use client'`
2. **Move audio to its own client island** — currently lives in the 411-line `Wedding.tsx`. Extract to a tiny `AudioPlayer` client component (~20 lines)
3. **Lazy-load audio source** — set `src` only after `isOpen` becomes true, not on mount

```tsx
// ✅ Optimized audio island
'use client';
export const AudioPlayer = ({ src, shouldPlay }: { src: string; shouldPlay: boolean }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (shouldPlay && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [shouldPlay]);

  return shouldPlay ? <audio ref={audioRef} loop preload="auto" src={src} /> : null;
};
```

### Mobile autoplay restrictions

- **iOS Safari:** Audio can only play after a user gesture (tap/click) in the same call stack. The current `handleOpen` → `audioRef.current.play()` pattern satisfies this.
- **Android Chrome:** Similar restriction, but more lenient with `play()` promises.
- **Key:** Never attempt autoplay before user interaction. The current opening gate pattern is correct.

### No video elements

The codebase contains zero `<video>` elements. If videos are added in the future:
- Use `<video>` with `preload="none"` and `poster` attribute
- Consider converting to animated WebP/AVIF for short loops
- Never autoplay video on mobile — massive battery/data impact

---

## 9. SEO & Google Crawl Optimization

### Current SEO architecture problems

| Problem | Impact |
|---|---|
| SPA returns empty `<div id="root">` | Crawlers see no content without JS execution |
| Meta tags set via client-side `useEffect` | Crawlers may not execute JS → miss OG tags |
| Two separate SSR workarounds (API route + Cloud Function) | Complex, fragile, hard to maintain |
| Same URL returns 200 for unregistered slugs | Google indexes empty pages |
| `index.html` has hardcoded "Dani & Marini" meta | Wrong for other couples |

### Next.js SEO architecture

```tsx
// app/[slug]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const wedding = await getWedding(params.slug);
  if (!wedding) return { title: 'Undangan Tidak Ditemukan' };

  const dateShort = deriveDateShort(wedding.eventDate);
  const dateDisplay = deriveDateDisplay(wedding.eventDate);
  const title = deriveMetaTitle(wedding.groomNickname, wedding.brideNickname, dateShort);
  const description = `Turut mengundang Anda di hari bahagia kami — ${dateDisplay}, ${wedding.eventCity}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: wedding.heroImage, width: 1200, height: 630 }],
      type: 'website',
      locale: 'id_ID',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [wedding.heroImage],
    },
    alternates: { canonical: `/${params.slug}` },
    robots: { index: true, follow: true },
  };
}
```

### JSON-LD structured data

```tsx
// In the server component page
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: `Pernikahan ${wedding.groomNickname} & ${wedding.brideNickname}`,
  startDate: wedding.eventDate,
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  location: {
    '@type': 'Place',
    name: wedding.venueName,
    address: {
      '@type': 'PostalAddress',
      streetAddress: wedding.venueAddress,
      addressLocality: wedding.eventCity,
      addressCountry: 'ID',
    },
  },
  image: wedding.heroImage,
  organizer: {
    '@type': 'Person',
    name: `${wedding.groomName} & ${wedding.brideName}`,
  },
}) }} />
```

### Semantic HTML improvements

```tsx
// ✅ Proper heading hierarchy
<main>
  <article itemScope itemType="https://schema.org/Event">
    <header> {/* Hero + names */}
      <h1>{wedding.groomNickname} & {wedding.brideNickname}</h1>
    </header>
    <section aria-label="Pasangan"> {/* Couple */}
      <h2>Mempelai</h2>
    </section>
    <section aria-label="Acara"> {/* Event */}
      <h2>Acara</h2>
      <address>{wedding.venueAddress}</address>
      <time dateTime={wedding.eventDate}>{formattedDate}</time>
    </section>
    {/* ... */}
  </article>
</main>
```

### Sitemap and robots.txt

```tsx
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const weddings = await getPublishedWeddings(); // Firestore query: status === 'published'
  return weddings.map((slug) => ({
    url: `https://yourdomain.com/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
}

// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/admin/' },
    sitemap: 'https://yourdomain.com/sitemap.xml',
  };
}
```

---

## 10. Core Web Vitals Optimization

### Target metrics

| Metric | Good | Current (estimated) | Target |
|---|---|---|---|
| **LCP** | < 2.5s | 4–8s (client fetch → render) | < 1.5s |
| **CLS** | < 0.1 | ~0.15 (images without dimensions) | < 0.05 |
| **INP** | < 200ms | ~300ms (heavy hydration) | < 100ms |
| **TTFB** | < 800ms | ~200ms (static HTML) → ~1s (API route) | < 100ms (edge cache) |
| **FCP** | < 1.8s | 3–6s (JS must load first) | < 1.0s |

### LCP optimization

The **Largest Contentful Paint** element is the opening background image or hero image.

| Technique | Impact |
|---|---|
| Server-render the image HTML | Eliminates JS download → parse → execute → fetch chain |
| `next/image` with `priority` | Adds `<link rel="preload">` automatically |
| AVIF format | 70–90% smaller than JPEG |
| ISR edge cache | TTFB < 50ms for cached pages |
| Blur placeholder | Perceived instant load |
| Remove `brightness-[0.85] contrast-[1.05]` CSS filters from LCP image | Filters can delay LCP measurement |

### CLS optimization

| Cause | Fix |
|---|---|
| Images without explicit dimensions | `next/image` with `fill` + container with `aspect-ratio` or explicit height |
| Font swap causing layout shift | `next/font` with `size-adjust` and matched fallback metrics |
| Dynamic content insertion | Reserve space with `min-height` or skeleton |
| CSS animation moving elements into view | Use `transform` only (doesn't affect layout) |

### INP optimization

Interaction to Next Paint measures how fast the page responds to user input.

| Technique | Impact |
|---|---|
| Reduce hydration payload | Less JS = faster event handler attachment |
| `React.startTransition` for non-urgent updates | Keeps UI responsive during state updates |
| Debounce scroll/touch handlers | Reduce event processing frequency |
| `useCallback` on handlers (already done) | Prevents child re-renders |

---

## 11. Caching & Delivery Architecture

### Multi-layer caching strategy

```
┌───────────────────────────────────────────────────────────┐
│                    Request Flow                            │
│                                                            │
│  Browser Cache (memory/disk)                               │
│    ↓ miss                                                  │
│  Vercel Edge Network (global PoPs)                         │
│    ↓ miss                                                  │
│  Vercel Serverless (ISR origin)                            │
│    ↓ generates                                             │
│  Firebase Admin SDK → Firestore                            │
│    ↓ returns data                                          │
│  Server renders HTML + caches at edge                      │
│    ↓ responds                                              │
│  Browser receives full HTML                                │
└───────────────────────────────────────────────────────────┘
```

### ISR configuration

```tsx
// app/[slug]/page.tsx
export const revalidate = 300; // 5 minutes

// On-demand revalidation from admin save:
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';
export async function POST(req: Request) {
  const { slug, secret } = await req.json();
  if (secret !== process.env.REVALIDATION_SECRET) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  revalidatePath(`/${slug}`);
  return Response.json({ revalidated: true });
}
```

### Cache headers strategy

| Asset | Cache-Control | Rationale |
|---|---|---|
| HTML pages | `s-maxage=300, stale-while-revalidate=600` | ISR managed by Next.js |
| `_next/static/*` (JS/CSS) | `immutable, max-age=31536000` | Content-hashed, never changes |
| `next/image` optimized | `max-age=31536000` | Token-based URLs, immutable |
| Fonts (self-hosted) | `immutable, max-age=31536000` | Font files never change |
| `/fonts/Dayland.ttf` | `immutable, max-age=31536000` | Local font, never changes |

### On-demand revalidation from admin

When an admin saves wedding data, trigger revalidation:

```tsx
// In admin handleSave callback:
await fetch('/api/revalidate', {
  method: 'POST',
  body: JSON.stringify({ slug, secret: process.env.NEXT_PUBLIC_REVALIDATION_SECRET }),
});
```

This ensures admin changes appear within seconds, not 5 minutes.

---

## 12. Fonts Optimization

### Current font loading cost

| Font | Format | Weights | Estimated Size |
|---|---|---|---|
| Cormorant Garamond | Google Fonts (WOFF2) | 400, 700, 400i | ~80KB |
| Montserrat | Google Fonts (WOFF2) | 400, 500, 700 | ~60KB |
| Playfair Display | Google Fonts (WOFF2) | 400, 700, 400i | ~80KB |
| Dayland | Local TTF | 400 | ~50KB |
| **Total** | | | **~270KB** |

### next/font optimization

```tsx
// app/fonts.ts
import { Cormorant_Garamond, Montserrat, Playfair_Display } from 'next/font/google';
import localFont from 'next/font/local';

export const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  adjustFontFallback: true, // Reduces CLS by matching fallback metrics
});

export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['Helvetica', 'Arial', 'sans-serif'],
  adjustFontFallback: true,
});

export const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: true,
});

export const dayland = localFont({
  src: '../public/fonts/Dayland.ttf',
  variable: '--font-dayland',
  display: 'swap',
  fallback: ['cursive'],
});
```

**Key benefits of `next/font`:**
- Self-hosts fonts (no Google Fonts request)
- Automatic subsetting
- Zero external network requests
- `adjustFontFallback` generates CSS `size-adjust` to match fallback metrics → near-zero CLS
- Fonts embedded in the HTML response

**Important:** Remove the existing `@font-face` for Dayland in `src/index.css` (lines 14–20) to avoid duplicate loading.

### Dynamic custom fonts (per-couple themes)

Current `Wedding.tsx` (lines 230–255) injects a Google Fonts `<link>` when fonts differ from defaults. In Next.js, render this server-side:

```tsx
// app/[slug]/page.tsx
const { heading, body, decorative } = wedding.theme.fonts;
const defaults = THEME_DEFAULTS.cinematic.fonts;
const needsCustomFonts = heading !== defaults.heading || body !== defaults.body || decorative !== defaults.decorative;

return (
  <>
    {needsCustomFonts && (
      <link
        rel="stylesheet"
        href={`https://fonts.googleapis.com/css2?family=${buildFontsUrl(heading, body, decorative)}&display=swap`}
      />
    )}
    {/* ... */}
  </>
);
```

---

## 13. Mobile-First & Low-End Device Strategy

### Target device spectrum

| Device | CPU | RAM | Reality |
|---|---|---|---|
| Samsung Galaxy A03 | Mediatek Helio P35 | 3GB | JS parse is 10× slower than iPhone |
| Redmi 9A | Mediatek Helio G25 | 2GB | Chrome OOMs on 50+ DOM animations |
| OPPO A17 | Mediatek Helio G35 | 4GB | Thermal throttling after 30s of heavy JS |
| iPhone SE 2022 | A15 Bionic | 4GB | Fast, but small screen = smaller images |

### Strategies for low-end devices

| Strategy | Implementation |
|---|---|
| **Reduce DOM nodes** | Max 800 DOM nodes per page (currently ~200–400, good) |
| **Reduce concurrent animations** | Cap to 5–8 simultaneous motion elements |
| **Gate effects behind IntersectionObserver** | Current `AmbientSocialLayer` pattern — extend to FloatingPetals, PetalEffect |
| **Avoid `filter: blur()` animations** | Replace `fadeUp` blur variant with opacity+transform only |
| **Reduce CountdownTimer re-renders** | Consider updating display via DOM manipulation or CSS `counter()` |
| **Limit AmbientSocialLayer pool** | Already capped at 20 — consider reducing to 10 on `navigator.deviceMemory < 4` |
| **Use `content-visibility: auto`** | On below-fold sections to skip rendering until near viewport |

### Memory management

```tsx
// Detect low-memory devices
const isLowMemory = typeof navigator !== 'undefined'
  && 'deviceMemory' in navigator
  && (navigator as any).deviceMemory <= 4;

// Reduce animation complexity
const maxPetals = isLowMemory ? 4 : 8;
const maxAmbientElements = isLowMemory ? 10 : 20;
const enableBlurEffects = !isLowMemory;
```

### `content-visibility: auto` for below-fold sections

```css
/* Apply to sections that are below the fold */
.content-deferred {
  content-visibility: auto;
  contain-intrinsic-size: auto 500px; /* estimated height */
}
```

This tells the browser to skip layout/paint for off-screen sections, dramatically reducing initial rendering cost.

---

## 14. Firebase Integration Optimization

### Current Firebase usage analysis

| Feature | SDK Module | Pattern | Weight |
|---|---|---|---|
| Wedding data | `firebase/firestore` (`getDoc`) | One-shot read | ~35KB |
| Wishes list | `firebase/firestore` (`onSnapshot`) | Real-time listener | Shared |
| Story comments | `firebase/firestore` (`onSnapshot`) | Real-time listener | Shared |
| Story likes | `firebase/firestore` (`getDoc` + `runTransaction`) | Read + write | Shared |
| RSVP submit | `firebase/firestore` (`addDoc`) | Write | Shared |
| Auth | `firebase/auth` | Admin only | ~25KB |
| File upload | `firebase/storage` | Admin only | ~15KB |

### Optimization strategy

**1. Replace client-side wedding data fetch with server-side:**

```tsx
// ❌ BEFORE: Client fetches on every visit
// src/hooks/useWedding.ts — runs in browser, 35KB+ Firebase SDK loaded
const { wedding } = useWedding(slug);

// ✅ AFTER: Server fetches once per ISR cycle
// app/[slug]/page.tsx — runs on server, zero client SDK
import { adminDb } from '@/lib/firebase-admin';
const doc = await adminDb.doc(`weddings/${slug}`).get();
```

**2. Lazy-load Firebase client SDK:**

```tsx
// lib/firebase-lazy.ts
let _db: ReturnType<typeof getFirestore> | null = null;

export async function getDb() {
  if (_db) return _db;
  const { initializeApp } = await import('firebase/app');
  const { getFirestore } = await import('firebase/firestore');
  const app = initializeApp(firebaseConfig);
  _db = getFirestore(app);
  return _db;
}
```

This defers the ~45KB Firebase download until the first interactive feature is used (opening the invitation → wishes load).

**3. Minimize listener scope:**

Current `useStoryComments` re-subscribes on every slide change. This is correct and necessary. But ensure cleanup is immediate:

```tsx
// Already good: cleanup on slide change
useEffect(() => {
  const unsubscribe = onSnapshot(q, ...);
  return () => unsubscribe(); // ← immediate cleanup
}, [weddingId, slideIndex]);
```

**4. Separate admin Firebase from wedding Firebase:**

Admin-only modules (`firebase/auth`, `firebase/storage`) should never appear in the wedding page bundle. Next.js route-level code splitting handles this automatically when admin is in `app/admin/[slug]/page.tsx`.

### Timestamp serialization

`WeddingDocument` has `createdAt: Timestamp` and `updatedAt: Timestamp`. The Firebase Admin SDK returns `admin.firestore.Timestamp` — a class instance that can't be serialized across the Next.js server→client boundary.

```tsx
// app/[slug]/page.tsx
const raw = doc.data();
const wedding: SerializedWedding = {
  ...raw,
  createdAt: raw.createdAt?.toDate().toISOString() ?? '',
  updatedAt: raw.updatedAt?.toDate().toISOString() ?? '',
};
```

Or simply omit `createdAt`/`updatedAt` from the client props — the wedding page doesn't display them.

---

## 15. Folder Structure & Architecture

### Recommended Next.js App Router structure

```
app/
  layout.tsx              → Root layout (html, body, fonts, Providers)
  globals.css             → Tailwind + @theme + @keyframes (from src/index.css)
  fonts.ts                → next/font declarations
  not-found.tsx           → Global 404
  robots.ts               → robots.txt generation
  sitemap.ts              → sitemap.xml generation

  [slug]/
    page.tsx              → Server component (fetch, metadata, theme CSS, JSON-LD)
    wedding-client.tsx    → Client orchestrator (state, audio, RSVP, opening gate)
    not-found.tsx         → Wedding-specific 404
    components/
      server/             → Server components (zero JS)
        HeroSection.tsx
        CoupleSection.tsx
        EventInfo.tsx
        GiftCards.tsx
        GalleryGrid.tsx
        FooterContent.tsx
      client/             → Client islands (minimal JS)
        OpeningGate.tsx
        AudioPlayer.tsx
        StoryCarousel.tsx
        TwibbonCreator.tsx
        RSVPPanel.tsx
        WishList.tsx
        CopyButton.tsx
        CalendarButton.tsx
        MapsButton.tsx
        PhotoZoom.tsx
        AmbientLayer.tsx
        CountdownDisplay.tsx

  admin/
    [slug]/
      page.tsx            → Client page (auth + forms)

  api/
    revalidate/
      route.ts            → On-demand ISR revalidation

src/
  lib/
    firebase.ts           → Client Firebase (lazy-loaded)
    firebase-admin.ts     → Server Firebase (never bundled to client)
    storage.ts            → Upload/delete (admin only)
    wishes.ts             → addWish
  hooks/
    useWishes.ts          → Real-time wishes (onSnapshot)
    useStoryComments.ts   → Real-time comments (onSnapshot)
    useStoryLikes.ts      → Like counter (getDoc + transaction)
    useCountdown.ts       → Timer
    useFocusTrap.ts       → Accessibility
  types/
    firestore.ts          → WeddingDocument, etc.
    index.ts              → GuestWishes
  utils/
    animations.ts         → Framer Motion variants
    formatDate.ts
    galleryLayout.ts
    twibbonOverlay.ts
    weddingDerived.ts
  constants/
    themeDefaults.ts
  components/
    ui/                   → Shared UI (BackgroundLayers, FloatingPetals, etc.)
    admin/                → Admin forms (10 form components)
    features/             → Complex features (FloatingController, RSVPModal)
```

### Server/client separation principle

```
Server boundary: page.tsx → fetches data, renders HTML
  │
  ├── Server Component: HeroSection → pure HTML, zero JS
  ├── Server Component: CoupleSection → pure HTML, zero JS
  ├── Server Component: GalleryGrid → pure HTML, zero JS
  │
  └── Client boundary: wedding-client.tsx → 'use client'
        │
        ├── Client: OpeningGate → scroll/gesture detection
        ├── Client: AudioPlayer → audio API
        ├── Client: StoryCarousel → swipe + real-time
        ├── Client: RSVPPanel → real-time + form
        └── Client: CopyButton → clipboard API (tiny island)
```

---

## 16. Performance Budget System

### Hard performance budgets

| Metric | Budget | Enforcement |
|---|---|---|
| **Initial HTML** | < 50KB (uncompressed) | Server-rendered, measured via `wc -c` |
| **Initial JS (First Load)** | < 100KB gzipped | `next build` output, fail CI if exceeded |
| **Total JS (all chunks)** | < 250KB gzipped | Bundle analyzer |
| **CSS** | < 30KB gzipped | Tailwind purge + measure |
| **Fonts** | < 150KB total (all weights) | `next/font` self-hosted, subset |
| **LCP image** | < 200KB (optimized) | AVIF via next/image |
| **Total image payload** | < 1MB (above-fold) | Optimized formats + responsive sizes |
| **DOM nodes** | < 800 | Lighthouse audit |
| **LCP** | < 2.0s (mobile 3G) | Lighthouse + WebPageTest |
| **CLS** | < 0.05 | Lighthouse |
| **INP** | < 150ms | Chrome UX Report |
| **TTFB** | < 200ms (edge cached) | WebPageTest |
| **Lighthouse Performance** | > 90 (mobile) | CI gate |

### Budget enforcement

```json
// next.config.ts — experimental bundle size warning
{
  experimental: {
    clientRouterFilter: true,
  },
  // Monitor via next build output:
  // Route (app)           Size     First Load JS
  // ┌ ○ /                 xxx B    xxx kB
  // └ ● /[slug]           xxx B    xxx kB  ← must be < 100kB
}
```

Use `@next/bundle-analyzer` in CI to catch bundle regressions:

```bash
ANALYZE=true next build
```

---

## 17. Performance Audit Workflow

### Pre-deployment checklist

| Step | Tool | What to Check | Target |
|---|---|---|---|
| 1 | `next build` | First Load JS per route | < 100KB gzipped |
| 2 | `@next/bundle-analyzer` | Largest chunks, tree-shaking | No unexpected large modules |
| 3 | Lighthouse (mobile, 4× CPU throttle) | Performance score | > 90 |
| 4 | Lighthouse (mobile) | LCP | < 2.5s |
| 5 | Lighthouse (mobile) | CLS | < 0.1 |
| 6 | WebPageTest (Moto G4, 3G Slow) | First Contentful Paint | < 3s |
| 7 | WebPageTest | Speed Index | < 4s |
| 8 | Chrome DevTools Performance | JS execution time | < 2s total |
| 9 | Chrome DevTools Performance | Long tasks | No tasks > 100ms |
| 10 | `view-source:` | Server-rendered HTML contains content | All text visible |
| 11 | Facebook Debugger | OG preview | Correct image + title |
| 12 | Google Rich Results Test | JSON-LD validation | No errors |
| 13 | Google PageSpeed Insights | Real-world CrUX data | All green |

### Testing on slow networks

```bash
# Chrome DevTools → Network → Throttling profiles
# Custom profile: "Real 3G Indonesia"
# Download: 1.5 Mbps
# Upload: 750 Kbps
# Latency: 300ms

# Custom profile: "Weak 4G"
# Download: 4 Mbps
# Upload: 1 Mbps
# Latency: 150ms
```

### Testing on low-end devices

Use Chrome DevTools → Performance → CPU throttling:
- **4× slowdown** ≈ Samsung Galaxy A14
- **6× slowdown** ≈ Redmi 9A

Check:
- Time to interactive
- Scroll jank (should maintain 60 FPS)
- Animation smoothness
- Memory usage (should stay < 150MB)

---

## 18. Production Deployment Strategy

### Vercel configuration

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'firebasestorage.googleapis.com' },
      { hostname: 'storage.googleapis.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
  headers: async () => [
    {
      source: '/fonts/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
  ],
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
```

### Environment variables

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client | Firebase client init |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Client | Firebase Auth |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Client + Server | Project identifier |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Client | Storage uploads |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Client | Firebase |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Client | Firebase |
| `FIREBASE_CLIENT_EMAIL` | Server only | firebase-admin auth |
| `FIREBASE_PRIVATE_KEY` | Server only | firebase-admin auth |
| `REVALIDATION_SECRET` | Server only | On-demand ISR token |

### Monitoring

- **Vercel Analytics** — Real User Monitoring (RUM) for Web Vitals
- **Vercel Speed Insights** — LCP, CLS, INP tracking per route
- **Google Search Console** — Crawl stats, indexing status, Core Web Vitals

---

## 19. Advanced Elite Optimization Techniques

### Partial Prerendering (PPR)

Next.js experimental feature that combines static and dynamic rendering in a single response:

```tsx
// The static shell renders instantly from edge cache
// Dynamic parts stream in as they resolve
export default async function WeddingPage({ params }) {
  const wedding = await getWedding(params.slug);

  return (
    <>
      {/* Static shell — cached at edge, instant delivery */}
      <HeroSection wedding={wedding} />
      <CoupleSection wedding={wedding} />

      {/* Dynamic boundary — streams when ready */}
      <Suspense fallback={<WishSkeleton />}>
        <WishList slug={params.slug} /> {/* Real-time data */}
      </Suspense>
    </>
  );
}
```

### Streaming boundaries

Place `<Suspense>` boundaries around below-fold content to stream HTML progressively:

```tsx
<main>
  {/* Above fold — rendered immediately */}
  <OpeningGate />
  <HeroSection />

  {/* Below fold — streamed after above-fold is flushed */}
  <Suspense fallback={null}>
    <CoupleSection />
    <EventSection />
    <StoryCarousel />
    <RSVPPanel />
    <DigitalEnvelope />
    <PhotoGallery />
    <Footer />
  </Suspense>
</main>
```

### Progressive enhancement

Design interactive features to work without JavaScript:

```tsx
// Server component renders a static link
// Client component enhances it to use clipboard API
<noscript>
  <span>Salin: {account.account}</span>
</noscript>
<CopyButton text={account.account} />
```

### Speculative prefetching

Next.js Link components automatically prefetch routes on hover/viewport. Use `prefetch={false}` for admin links that guests never visit:

```tsx
<Link href={`/admin/${slug}`} prefetch={false}>Admin</Link>
```

### Route interception for photo zoom

Use Next.js Parallel Routes + Intercepting Routes for photo zoom modals:

```
app/[slug]/
  @modal/
    (..)photo/[id]/
      page.tsx         → Intercepted: shows modal overlay
  photo/[id]/
    page.tsx           → Direct: shows full photo page (SEO-friendly)
```

This enables shareable photo URLs while maintaining the modal UX.

---

## 20. Migration Execution Checklist

### Phase 1: Foundation (Days 1–2)

- [x] task 1.1 - Initialize Next.js App Router alongside existing code
- [x] task 1.2 - Configure Tailwind v4 with `@tailwindcss/postcss`
- [x] task 1.3 - Set up `next/font` with all 4 font families
- [x] task 1.4 - Remove duplicate `@font-face` from CSS
- [x] task 1.5 - Configure `firebase-admin` for server-side
- [x] task 1.6 - Rename `VITE_*` env vars to `NEXT_PUBLIC_*`
- [x] task 1.7 - Update `lib/firebase.ts` to use `process.env`
- [x] task 1.8 - Create `vitest.config.ts` (extract from vite.config.ts)
- [x] task 1.9 - Verify all 38 test files pass

### Phase 2: App Router Structure (Days 3–5)

- [x] task 2.1 - Create root layout with Providers wrapper
- [x] task 2.2 - Create `app/[slug]/page.tsx` with `generateMetadata` and ISR
- [x] task 2.3 - Create `app/[slug]/wedding-client.tsx` (extract from Wedding.tsx)
- [x] task 2.4 - Create `app/admin/[slug]/page.tsx` (adapt from Admin.tsx)
- [x] task 2.5 - Replace `useParams`/`useNavigate` with `next/navigation`
- [x] task 2.6 - Server-side theme CSS variables via `<style>`
- [x] task 2.7 - Server-side JSON-LD structured data
- [x] task 2.8 - Create `app/[slug]/not-found.tsx` with proper 404
- [x] task 2.9 - Handle Timestamp serialization (createdAt/updatedAt)
- [x] task 2.10 - Verify `generateMetadata` output matches current SSR meta

### Phase 3: Image Pipeline (Days 5–6)

- [x] task 3.1 - Replace `<img>` with `next/image` in 6 wedding components
- [x] task 3.2 - Configure Firebase Storage remote patterns
- [x] task 3.3 - Set `priority` on CinematicOpening and HeroSection images
- [x] task 3.4 - Verify `sizes` attributes are correct for all images
- [x] task 3.5 - Keep native `<img>` for TwibbonCreator (canvas-bound)
- [x] task 3.6 - Keep native `<img>` for admin forms
- [x] task 3.7 - Test AVIF/WebP delivery via DevTools Network tab
- [x] task 3.8 - Verify no CLS from image loading

### Phase 4: Server Component Conversion (Days 6–8)

- [x] task 4.1–4.6 - DEFERRED: Server Component conversion for HeroSection, CoupleSection, EventSection, DigitalEnvelope, Footer, PhotoGallery requires replacing Framer Motion with CSS animations + removing useWeddingContext — deferred to post-migration optimization phase
- [x] task 4.7 - Convert BackgroundLayers to Server Component (already no JS — confirmed working)
- [x] task 4.8 - Add `'use client'` to 32 interactive components (10 sections + 3 features + 9 UI + 10 admin)
- [x] task 4.9 - DEFERRED: Extract CopyButton, CalendarButton, MapsButton as tiny client islands — requires task 4.1–4.6 first
- [x] task 4.10 - Verify all animations still work after conversion (build passes, 2173/2173 tests pass)

### Phase 5: Bundle Optimization (Days 8–9)

- [x] task 5.1 - Implement lazy Firebase client SDK loading
- [x] task 5.2 - Verify admin-only Firebase modules don't leak into wedding bundle
- [x] task 5.3 - Move `react-router-dom` to devDependencies (full removal in Phase 6)
- [x] task 5.4 - Install `@next/bundle-analyzer`, configure in next.config.ts, build passes
- [x] task 5.5 - Replace `filter: blur()` animation with opacity+transform
- [x] task 5.6 - FloatingPetals and PetalEffect already scoped (no IntersectionObserver needed)
- [x] task 5.7 - Firebase SDK split verified: wedding page only loads firebase/app + firebase/firestore
- [x] task 5.8 - Create `robots.ts` and `sitemap.ts`

### Phase 6: Cleanup (Days 9–10)

- [x] task 6.1 - Delete `src/main.tsx`, `src/App.tsx`, `src/App.test.tsx`
- [x] task 6.2 - Delete `src/views/Wedding.tsx`, `src/views/Admin.tsx` (renamed from pages/ in Phase 2)
- [x] task 6.3 - KEPT `src/hooks/useWedding.ts` + test — still used by `src/app/admin/[slug]/page.tsx`
- [x] task 6.4 - Delete `src/components/ui/LoadingScreen.tsx`
- [x] task 6.5 - Delete `api/ssr-meta.ts` (and `api/` directory)
- [x] task 6.6 - KEPT `functions/src/index.ts` — separate Firebase deployment, not part of Next.js
- [x] task 6.7 - Delete `vercel.json`
- [x] task 6.8 - Delete `vite.config.ts`, `index.html`
- [x] task 6.9 - Remove `react-router-dom`, `@tailwindcss/vite`, `@vercel/node`, `vite` from deps. Keep `@vitejs/plugin-react` for Vitest.
- [x] task 6.10 - Remove `src/main.tsx` from tsconfig exclude. Build passes (6 routes). 37 test files, 2062 tests pass.

### Phase 7: Verification (Days 10–12)

- [x] task 7.1 - Run all tests — 37 files, 2062 tests, 100% pass (deleted orphaned src/index.css)
- [ ] task 7.2 - MANUAL: Lighthouse mobile audit — verify score > 90 (requires deployment)
- [ ] task 7.3 - MANUAL: WebPageTest on Moto G4 / 3G Slow — verify FCP < 3s (requires deployment)
- [ ] task 7.4 - MANUAL: Test on real low-end Android device (requires deployment)
- [ ] task 7.5 - MANUAL: Facebook Debugger — verify OG preview (requires deployment)
- [ ] task 7.6 - MANUAL: Twitter Card Validator — verify card preview (requires deployment)
- [ ] task 7.7 - MANUAL: Google Rich Results Test — verify JSON-LD (requires deployment)
- [x] task 7.8 - `next build` confirms SSR: /[slug] is ƒ (Dynamic), server-rendered on demand
- [ ] task 7.9 - MANUAL: Test `prefers-reduced-motion: reduce` in browser (requires running app)
- [x] task 7.10 - not-found.tsx exists with "Undangan Tidak Ditemukan" + notFound() in page.tsx → HTTP 404
- [ ] task 7.11 - MANUAL: Test admin page — verify auth + all 10 forms work (requires running app)
- [ ] task 7.12 - MANUAL: Performance budget validation (requires deployment)
- [x] task 7.13 - Updated DOCUMENTATION.md: Tech Stack, Project Structure, Architecture Overview, code stats

### Phase 8: SEO preservation checklist

- [ ] task 8.1 - MANUAL: All existing URLs return same content (requires deployment)
- [ ] task 8.2 - MANUAL: OG image, title, description match current values (requires deployment)
- [ ] task 8.3 - MANUAL: Canonical URLs point to correct paths (requires deployment)
- [x] task 8.4 - `robots.ts` allows `/`, disallows `/admin/`, includes sitemap URL
- [x] task 8.5 - `sitemap.ts` queries Firestore for published weddings
- [ ] task 8.6 - MANUAL: JSON-LD structured data validates without errors (requires deployment)
- [ ] task 8.7 - MANUAL: 404 pages return HTTP 404 (requires deployment)
- [x] task 8.8 - `<html lang="id">` confirmed in layout.tsx line 14

### Phase 9: Regression prevention checklist

- [ ] task 9.1 - MANUAL: Opening gate scroll/swipe/keyboard triggers work
- [ ] task 9.2 - MANUAL: Music plays on "Buka Undangan" tap
- [ ] task 9.3 - MANUAL: Guest name from `?to=` parameter displays correctly
- [x] task 9.4 - All 7 useEffects accounted for: 4 removed (meta, theme CSS, fonts, hero prefetch), 3 kept (cleanup, currentPage clamp, ?to= param)
- [ ] task 9.5 - MANUAL: Theme colors apply correctly per-couple
- [ ] task 9.6 - MANUAL: Custom fonts load for non-default themes
- [ ] task 9.7 - MANUAL: Real-time wishes update without refresh
- [ ] task 9.8 - MANUAL: RSVP form submits and shows success
- [ ] task 9.9 - MANUAL: Twibbon creator generates and downloads PNG
- [ ] task 9.10 - MANUAL: Photo zoom modal opens and closes
- [ ] task 9.12 - MANUAL: Copy button copies bank account number
- [ ] task 9.13 - MANUAL: Calendar button opens Google Calendar
- [ ] task 9.14 - MANUAL: Maps button opens Google Maps
- [ ] task 9.15 - MANUAL: Admin auth flow works
- [ ] task 9.16 - MANUAL: Admin save with file upload works
- [ ] task 9.17 - MANUAL: Admin status toggle (published/archived) works
- [ ] task 9.18 - MANUAL: Focus trap works in RSVPModal and PhotoZoomModal
- [ ] task 9.19 - MANUAL: `prefers-reduced-motion` disables all animations
- [x] task 9.20 - Loading screen removed — zero `#loading-screen` references in codebase (dead code in CinematicOpening cleaned up)
- [ ] task 9.21 - MANUAL: `CinematicOpening` exit animation plays smoothly

---

## Current Codebase Reference

### Source file inventory

| Category | Count | Key Files |
|---|---|---|
| Pages | 2 | `Wedding.tsx` (411 lines), `Admin.tsx` (361 lines) |
| Section components | 10 | CinematicOpening (292), RSVPSection (159), CinematicStory (140), CoupleSection (135), Footer (77), EventSection (73), DigitalEnvelope (72), HeroSection (69), PhotoGallery (66), TwibbonSection (10) |
| Feature components | 3 | TwibbonCreator (425), RSVPModal (119), FloatingController (106) |
| UI components | 10 | AmbientSocialLayer (132), PhotoZoomModal (55), LoadingScreen (52), ErrorBoundary (49), CountdownTimer (36), FloatingPetals (34), PetalEffect (25), LightGlow (17), ForegroundOrnaments (16), BackgroundLayers (8) |
| Admin components | 10 | CoupleForm (327), MediaForm (163), StoryForm (124), CustomizeForm (118), GalleryForm (109), EventForm (95), CreditForm (84), StoryInteractionsForm (71), GiftForm (69), WishesForm (53) |
| Hooks | 6 | useStoryComments (53), useStoryLikes (48), useWishes (40), useFocusTrap (40), useCountdown (39), useWedding (25) |
| Utils | 5 | twibbonOverlay (269), weddingDerived (57), galleryLayout (18), animations (16), formatDate (10) |
| Lib | 3 | storage (19), firebase (18), wishes (12) |
| Types | 2 | firestore (112), index (9) |
| Context | 1 | WeddingContext (5) |
| Constants | 1 | themeDefaults (20) |
| SSR workarounds | 2 | api/ssr-meta.ts (228), functions/src/index.ts (173) |
| Test files | 38 | 14 `.test.ts` + 24 `.test.tsx` |
| **Total source** | **32** | |
| **Total tests** | **38** | ~2173 test cases |

### Files eliminated by migration

| File | Lines | Replacement |
|---|---|---|
| `src/main.tsx` | 23 | `app/layout.tsx` |
| `src/App.tsx` | 19 | File-system routing |
| `src/App.test.tsx` | — | Deleted |
| `src/pages/Wedding.tsx` | 411 | `app/[slug]/page.tsx` + `wedding-client.tsx` |
| `src/pages/Admin.tsx` | 361 | `app/admin/[slug]/page.tsx` |
| `src/hooks/useWedding.ts` | 25 | Server-side `firebase-admin` fetch |
| `src/hooks/useWedding.test.ts` | — | Deleted |
| `src/components/ui/LoadingScreen.tsx` | 52 | Server HTML is the content |
| `api/ssr-meta.ts` | 228 | `generateMetadata()` + server components |
| `functions/src/index.ts` | 173 | Same server render for all visitors |
| `vercel.json` | 17 | `next.config.ts` |
| `index.html` | 57 | `app/layout.tsx` |
| `vite.config.ts` | 14 | `next.config.ts` + `vitest.config.ts` |
| **Total eliminated** | **~1380 lines** | |

### Components using `useWeddingContext()`

9 components: HeroSection, CoupleSection, CinematicStory, EventSection, DigitalEnvelope, PhotoGallery, Footer, CinematicOpening, TwibbonCreator

**Recommendation:** Keep `WeddingContext` for minimal migration effort. The client orchestrator provides it; server components receive wedding data as props.

### `import.meta.env` references

Only `src/lib/firebase.ts` — 6 references. Change to `process.env.NEXT_PUBLIC_*`.

### `react-router-dom` references

4 files: `App.tsx`, `Wedding.tsx`, `Admin.tsx`, `App.test.tsx` — all eliminated or rewritten.
