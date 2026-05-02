# Dani & Marini — Wedding Invitation

> A premium, cinematic wedding invitation web app for **M. Daniansyah Chusyaidin, S.Kom** & **Siti Nur Marini, A.Md.M**

Wedding Date: **Saturday, 29 August 2026** — Surabaya, Indonesia
Hosting: `https://wedding-dani-marini.web.app`

---

## Table of Contents

- [Getting Started](#getting-started)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Design System](#design-system)
- [Component Reference](#component-reference)
- [App State Management](#app-state-management)
- [Section Map](#section-map)
- [Data & Content Reference](#data--content-reference)
- [Feature Details](#feature-details)
- [Testing](#testing)
- [Development Guide](#development-guide)

---

## Getting Started

```bash
npm install
npm run dev          # Dev server at http://localhost:3000
npm run build        # Production build
npm run preview      # Preview production build
npm run typecheck    # TypeScript type checking
npm run test         # Run all tests (vitest)
npm run loc:code     # LOC count for source files
npm run loc:test     # LOC count for test files
```

Guest name personalization via `?to=` query parameter:
```
http://localhost:3000/?to=Budi%20Santoso
```

---

## Tech Stack

| Layer        | Technology                          | Version  |
| ------------ | ----------------------------------- | -------- |
| Framework    | React + TypeScript                  | 19.x     |
| Build        | Vite                                | 6.x      |
| Styling      | Tailwind CSS (v4, `@theme` syntax)  | 4.1.x    |
| Animations   | Motion (framer-motion successor)    | 12.x     |
| Icons        | Lucide React                        | 0.546.x  |
| Testing      | Vitest + React Testing Library      | 4.1.x    |
| Fonts        | Google Fonts + cdnfonts (Dayland)   | CDN      |

---

## Project Structure

```
wedding-invitation/
├── index.html                          # Entry HTML with SEO meta, OG tags, font preloads
├── package.json                        # Dependencies & scripts (v1.0.0)
├── vite.config.ts                      # Vite + Tailwind + Vitest config
├── tsconfig.json                       # TypeScript config (ES2022, bundler)
├── DOCUMENTATION.md                    # This file
├── README.md                           # Quick start guide
│
├── public/                             # Static assets (served at /)
│   ├── bride_face_potrait.jpeg         # (58KB)
│   ├── groom_face_potrait.jpeg         # (103KB)
│   ├── bride_and_groom_full_body_potrait.jpeg  # (65KB)
│   ├── bride_and_groom_half_body_potrait.png   # (111KB, optimized)
│   ├── musics/
│   │   └── adele-make-you-feel-my-love.mp3     # (3.2MB)
│   └── textures/
│       ├── p6.png                      # Film grain texture
│       └── stardust.png               # Floral shadow texture
│
└── src/
    ├── main.tsx                        # React entry point
    ├── App.tsx                         # Main orchestrator (168 lines)
    ├── index.css                       # Tailwind theme, animations, utilities
    │
    ├── types/
    │   └── index.ts                    # GuestWishes interface
    │
    ├── constants/
    │   ├── wedding.ts                  # WEDDING_DATE, VENUE, BANK_ACCOUNTS, STORY_SLIDES, GALLERY_ITEMS
    │   └── wishes.ts                   # SEED_WISHES (20 sample wishes)
    │
    ├── utils/
    │   ├── animations.ts              # transition, stagger, fadeUp presets
    │   ├── formatDate.ts              # Indonesian locale date formatter
    │   └── twibbonOverlay.ts          # Canvas drawing for twibbon frame (253 lines)
    │
    ├── hooks/
    │   └── useCountdown.ts            # Countdown timer hook
    │
    ├── components/
    │   ├── ui/                        # Reusable visual primitives
    │   │   ├── LightGlow.tsx          # Animated gold glow overlay
    │   │   ├── ForegroundOrnaments.tsx # Floating ink/gold blur elements
    │   │   ├── FloatingPetals.tsx     # 8 animated falling petals
    │   │   ├── BackgroundLayers.tsx   # Film grain + shadows + light sweep
    │   │   ├── PetalEffect.tsx        # 15 subtle floating particles
    │   │   ├── CountdownTimer.tsx     # 4 time boxes (Hari/Jam/Menit/Detik)
    │   │   ├── PhotoZoomModal.tsx     # Full-screen image viewer
    │   │   └── AmbientSocialLayer.tsx # Instagram-style floating hearts/comments
    │   │
    │   ├── features/                  # Complex interactive components
    │   │   ├── TwibbonCreator.tsx     # Canvas photo frame with drag/pinch (250 lines)
    │   │   ├── RSVPModal.tsx          # RSVP form modal with success state
    │   │   └── FloatingController.tsx # Draggable nav + music toggle
    │   │
    │   └── sections/                  # Page sections (render order)
    │       ├── CinematicOpening.tsx   # Dark overlay with "Buka Undangan"
    │       ├── HeroSection.tsx        # Full-bleed portrait with names
    │       ├── CoupleSection.tsx      # Overlapping blob portraits + parent info
    │       ├── CinematicStory.tsx     # Horizontal scroll love timeline (6 slides)
    │       ├── EventSection.tsx       # Countdown + Akad/Resepsi + venue + CTAs
    │       ├── TwibbonSection.tsx     # Wraps TwibbonCreator
    │       ├── RSVPSection.tsx        # Paginated wish feed + FAB
    │       ├── DigitalEnvelope.tsx    # 6 bank/e-wallet accounts with copy
    │       ├── PhotoGallery.tsx       # Horizontal organic-shape gallery
    │       └── Footer.tsx            # Credits + social links
    │
    └── test/
        └── setup.ts                   # Vitest setup (jest-dom, mocks)
```

**Code stats:** 30 source files, 2,008 total LOC (largest: 253 lines)
**Test stats:** 29 test files, 15,324 total LOC, 2,017 tests

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        index.html                           │
│                     <div id="root">                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                     src/main.tsx
                     <StrictMode>
                       <App />
                           │
              ┌────────────┴────────────────────┐
              │         src/App.tsx              │
              │    (168 lines — orchestrator)    │
              │                                 │
              │  ┌─ BackgroundLayers (fixed)     │
              │  ├─ Audio element               │
              │  │                              │
              │  ├─ AnimatePresence             │
              │  │  └─ CinematicOpening         │
              │  │     ├─ LightGlow             │
              │  │     ├─ FloatingPetals        │
              │  │     └─ ForegroundOrnaments   │
              │  │                              │
              │  └─ Main Content (when isOpen)   │
              │     ├─ FloatingController       │
              │     ├─ HeroSection              │
              │     │  ├─ LightGlow             │
              │     │  ├─ FloatingPetals        │
              │     │  └─ ForegroundOrnaments   │
              │     ├─ CoupleSection            │
              │     ├─ CinematicStory           │
              │     │  ├─ AmbientSocialLayer    │
              │     │  └─ PetalEffect           │
              │     ├─ EventSection             │
              │     │  └─ CountdownTimer        │
              │     │     └─ useCountdown hook  │
              │     ├─ TwibbonSection           │
              │     │  └─ TwibbonCreator        │
              │     │     └─ twibbonOverlay     │
              │     ├─ RSVPSection              │
              │     ├─ RSVPModal                │
              │     ├─ DigitalEnvelope          │
              │     ├─ PhotoGallery             │
              │     ├─ Footer                   │
              │     └─ PhotoZoomModal           │
              └─────────────────────────────────┘
```

**Key architectural decisions:**
- **Component-split architecture** — 30 files, max 253 LOC each, organized by `ui/`, `features/`, `sections/`
- **No routing** — single page with sections revealed after "open invitation" interaction
- **No backend** — wishes/RSVP are client-side state only, no persistence
- **Cinematic gate** — `AnimatePresence` manages opening-to-content transition
- **Music auto-play** — triggered on "Buka Undangan" click with fallback on autoplay rejection
- **Co-located tests** — every source file has a `.test.tsx` sibling

---

## Design System

### Colors (defined in `src/index.css` via `@theme`)

| Token         | Hex       | Usage                                |
| ------------- | --------- | ------------------------------------ |
| `gold`        | `#B48D3E` | Accent, labels, borders, CTAs        |
| `ivory`       | `#FDFCF8` | Primary background                   |
| `paper`       | `#F5F2ED` | Secondary background (gallery)       |
| `ink`         | `#1A1A1A` | Primary text, dark overlays          |
| `sepia`       | `#FAF7F2` | Warm tint background                 |
| `rose-pastel` | `#F8BBD0` | Accent (hearts, social, buttons)     |

### Fonts

| Token          | Family              | Usage                                |
| -------------- | ------------------- | ------------------------------------ |
| `font-serif`   | Cormorant Garamond  | Body text, headings, wish messages   |
| `font-sans`    | Montserrat          | Labels, tracking-heavy micro text    |
| `font-display` | Playfair Display    | Event date, decorative headings      |
| `font-dayland` | Dayland             | Couple names — hero & opening        |

### CSS Animations (index.css)

| Class                | Duration | Effect                           |
| -------------------- | -------- | -------------------------------- |
| `animate-shadow-drift` | 25s    | Floating blur background         |
| `animate-light-sweep`  | 8s     | Gold gradient sweep              |
| `animate-grain`        | 0.8s   | Film grain texture movement      |
| `animate-soft-zoom`    | 20s    | Gentle scale pulse on images     |
| `bubble-glow`          | —      | Gold box-shadow on pagination    |

### CSS Utilities (index.css)

| Utility                  | Purpose                            |
| ------------------------ | ---------------------------------- |
| `.no-scrollbar`          | Hide scrollbar (webkit + firefox)  |
| `.scroll-snap-container` | Horizontal scroll snap             |

### Accessibility

- `@media (prefers-reduced-motion: reduce)` — disables all animations
- `aria-label` on all icon-only buttons
- `htmlFor`/`id` associations on form inputs
- `lang="id"` on HTML root
- `rel="noopener noreferrer"` on all external links

---

## Component Reference

### UI Components (`components/ui/`)

| Component | Lines | Description |
|-----------|-------|-------------|
| `LightGlow` | 17 | Animated gold radial glow, `mix-blend-soft-light` |
| `ForegroundOrnaments` | 16 | Two floating ink/gold blur shapes |
| `FloatingPetals` | 34 | 8 animated petals with `transform-gpu` |
| `BackgroundLayers` | 12 | Film grain + floral shadows + light sweep (fixed) |
| `PetalEffect` | 25 | 15 subtle rose-pastel particles |
| `CountdownTimer` | 49 | 4 time boxes using `useCountdown` hook |
| `PhotoZoomModal` | 43 | Full-screen image viewer (z-2000) |
| `AmbientSocialLayer` | 122 | Instagram-Live-style floating hearts/comments |

### Feature Components (`components/features/`)

| Component | Lines | Props | Description |
|-----------|-------|-------|-------------|
| `TwibbonCreator` | 250 | none | Canvas photo frame (1080x1920), drag/pinch, download PNG |
| `RSVPModal` | 116 | isOpen, isSubmitSuccess, guestName, onClose, onSubmit | Form modal with success state |
| `FloatingController` | 104 | isToolsOpen, setIsToolsOpen, isPlaying, toggleMusic | Draggable nav + music toggle |

### Section Components (`components/sections/`)

| Component | Lines | Section ID | Description |
|-----------|-------|------------|-------------|
| `CinematicOpening` | 74 | — | Dark overlay, guest name, "Buka Undangan" |
| `HeroSection` | 38 | — | Full-bleed portrait, names, date |
| `CoupleSection` | 66 | `couple-section` | Overlapping blob portraits, parent info |
| `CinematicStory` | 123 | `story-section` | 6 horizontal-scroll slides with likes/comments |
| `EventSection` | 62 | `event-section` | Countdown, schedule, venue, map/calendar CTAs |
| `TwibbonSection` | 9 | `twibbon-section` | Wraps TwibbonCreator |
| `RSVPSection` | 88 | `rsvp-section` | Paginated wish feed + RSVP FAB |
| `DigitalEnvelope` | 61 | `gift-section` | 6 bank/e-wallet accounts with copy |
| `PhotoGallery` | 56 | — | Horizontal organic-shape gallery with scroll fade |
| `Footer` | 57 | — | Credits, social links (Instagram, LinkedIn, Threads, WhatsApp) |

---

## App State Management

All state lives in `App.tsx` and is passed via props:

| State              | Type                    | Default                        | Purpose                        |
| ------------------ | ----------------------- | ------------------------------ | ------------------------------ |
| `isOpen`           | `boolean`               | `false`                        | Gate between opening & content |
| `wishes`           | `GuestWishes[]`         | `SEED_WISHES` (20 items)       | RSVP/wishes feed data          |
| `guestName`        | `string`                | `"Tamu Terkasih Kami"`         | From `?to=` URL param          |
| `isPlaying`        | `boolean`               | `false`                        | Music playback state           |
| `isRSVPModalOpen`  | `boolean`               | `false`                        | RSVP form modal visibility     |
| `isToolsOpen`      | `boolean`               | `false`                        | Floating tools menu visibility |
| `selectedPhoto`    | `string \| null`        | `null`                         | Gallery zoom modal image src   |
| `currentPage`      | `number`                | `1`                            | Wishes pagination              |
| `copiedIndex`      | `number \| null`        | `null`                         | Copy feedback for envelopes    |
| `isSubmitSuccess`  | `boolean`               | `false`                        | RSVP success state             |

**Derived state:**
- `wishPages` — `useMemo` paginated based on estimated card heights
- `currentWishes` — current page slice
- `totalPages` — total wish pages

---

## Section Map

Sections render in this order after `isOpen === true`:

| #  | Section            | HTML id             | Background |
| -- | ------------------ | ------------------- | ---------- |
| 0  | Floating Controller| —                   | —          |
| 1  | Hero               | —                   | ivory      |
| 2  | Couple             | `couple-section`    | ivory      |
| 3  | Story              | `story-section`     | ink (dark) |
| 4  | Event              | `event-section`     | ivory      |
| 5  | Twibbon            | `twibbon-section`   | ivory      |
| 6  | RSVP & Wishes      | `rsvp-section`      | ivory/50   |
| 7  | RSVP Modal         | —                   | overlay    |
| 8  | Digital Envelope   | `gift-section`      | ivory      |
| 9  | Photo Gallery      | —                   | paper      |
| 10 | Footer             | —                   | ivory      |
| 11 | Photo Zoom Modal   | —                   | overlay    |

**Z-Index Map:**
```
9999  — Film grain (BackgroundLayers)
2000  — Photo zoom modal
1000  — Cinematic opening
 200  — RSVP modal
 100  — Floating controller
  60  — Story interaction buttons
  70  — Story comment input
  30  — Countdown timer, story text
  20  — Ambient social, foreground ornaments
  10  — Floating petals, petal effect, section content
   5  — Light glow
   1  — Light sweep
   0  — Shadow drift
```

---

## Data & Content Reference

### TypeScript Interfaces (`src/types/index.ts`)

```ts
interface GuestWishes {
  id: string;
  name: string;
  message: string;
  attendance: 'yes' | 'no';
  createdAt: number;
}
```

### Wedding Details (`src/constants/wedding.ts`)

| Detail         | Value                                                                    |
| -------------- | ------------------------------------------------------------------------ |
| Groom          | M. Daniansyah Chusyaidin, S.Kom                                         |
| Bride          | Siti Nur Marini, A.Md.M                                                 |
| Groom Parents  | Bapak M. Safiudin Sukri & Ibu Indiarti                                  |
| Bride Parents  | Bapak Margono & Ibu (Almh) Sulami                                       |
| Date           | Saturday, 29 August 2026                                                 |
| Akad Nikah     | 09:00 — 10:00                                                           |
| Resepsi        | 10:00 — 13:00                                                           |
| Venue          | Gedung Wanita Candra Kencana, Jl. Kalibokor Selatan No.2, Surabaya      |

### Digital Envelope Accounts (`BANK_ACCOUNTS`)

| Bank    | Account Number  | Account Name        |
| ------- | --------------- | ------------------- |
| BCA     | 1234567890      | M. Daniansyah C.    |
| BRI     | 0987654321      | Siti Nur Marini     |
| Mandiri | 111222333444    | M. Daniansyah C.    |
| BSI     | 777888999000    | Siti Nur M.         |
| Gopay   | 08123456789     | Daniansyah          |
| DANA    | 08987654321     | Siti Nur             |

### Social Links (Footer)

**Dani:** [Instagram](https://instagram.com/danichusyaidin) · [LinkedIn](https://id.linkedin.com/in/daniansyahchusyaidin) · [WhatsApp](https://wa.me/6285790428078)

**Marini:** [Instagram](https://instagram.com/mariniw_) · [Threads](https://threads.com/@mariniw_) · [WhatsApp](https://wa.me/628883816403)

---

## Feature Details

### Guest Name Personalization
- Reads `?to=` query param on mount via `useEffect`
- Decoded with `decodeURIComponent()`
- Displayed in opening screen and as RSVP form placeholder
- Has `max-w-[85vw] break-words` for overflow protection
- Defaults to "Tamu Terkasih Kami" if not provided

### Music System
- Local audio file: `/musics/adele-make-you-feel-my-love.mp3`
- `<audio>` element with `loop` attribute
- Auto-plays on "Buka Undangan" click with `.catch()` fallback
- Toggle via floating controller menu
- Visual: pulsing aura, rotating ring, filled/unfilled heart icon

### RSVP & Wishes
- **Form:** Name (maxLength=50), Attendance (radio: Hadir/Absen), Message (maxLength=200)
- **Submit:** Prepends to wishes, shows "Terima Kasih" success for 1.5s, then closes modal
- **Pagination:** `useMemo` height-based calculation (~30 chars/line, 17px/line, 52px base, 630px available)
- **No persistence** — data lost on refresh

### Twibbon Creator
- Fixed 9:16 aspect ratio (1080x1920)
- Procedurally drawn floral overlay via `utils/twibbonOverlay.ts`
- Lazy canvas draw via `IntersectionObserver` (200px rootMargin)
- Drag (mouse + touch) and pinch-to-zoom
- Export reuses preview canvas (identical floral arrangement)
- Download as `Memori-Dani-Marini.png`

### CinematicStory
- 6 horizontal-scroll slides (2016-2026 + Ikrar)
- Slides from `constants/wedding.ts` → `STORY_SLIDES`
- Active slide detection via `onScroll` + `scrollContainerRef`
- `AmbientSocialLayer` + `PetalEffect` only render on active slide
- Like/comment buttons hidden when comment form is open
- Mobile swipe hint ("Geser") + desktop scroll hint

### Digital Envelope
- Copy-to-clipboard with `navigator.clipboard` + legacy `execCommand` fallback
- "Tersalin" success overlay with green checkmark
- Responsive: 1-col → 2-col (sm) → 3-col (lg)

### Photo Gallery
- 12 items from `constants/wedding.ts` → `GALLERY_ITEMS`
- Horizontal scroll with right-edge fade gradient
- Organic rounded shapes, `transform-gpu`, lazy loading
- Stagger delay capped at 300ms
- Click opens `PhotoZoomModal`

---

## Testing

**Framework:** Vitest 4.1.x + React Testing Library + jest-dom

**Setup:** `src/test/setup.ts` — mocks `IntersectionObserver`, `HTMLCanvasElement.getContext`, `HTMLMediaElement.play/pause`

**Test structure:** Co-located with source files (e.g., `App.tsx` → `App.test.tsx`)

**Stats:** 29 test files · 2,017 tests · 15,324 test LOC · 100% passing

| Category | Files | Tests |
|----------|-------|-------|
| types | 1 | ~100 |
| constants | 2 | ~200 |
| utils | 3 | ~170 |
| hooks | 1 | ~90 |
| components/ui | 8 | ~420 |
| components/features | 3 | ~230 |
| components/sections | 10 | ~710 |
| App | 1 | ~95 |

**Test coverage includes:**
- Rendering (no crash, correct structure, no duplicate elements)
- Visual integrity (pointer-events-none, overflow-hidden, lazy loading, fixed positioning, responsive classes, z-index)
- Animation safety (transform-gpu, blur, overflow containment, prefers-reduced-motion)
- Logical behavior (click handlers, form submission, pagination, copy feedback, timer ticks)
- Edge cases (empty states, past dates, long strings, unicode, HTML injection, special characters)
- Accessibility (aria-labels, label associations, noopener links)
- Re-render stability (no duplication, consistent DOM across re-renders)
- Snapshot tests for ambient components

**Run tests:**
```bash
npm run test         # Run all tests once
npx vitest           # Watch mode
npx vitest run src/components/sections/Footer.test.tsx  # Single file
```

---

## Development Guide

### Adding a New Section

1. Create `src/components/sections/YourSection.tsx` (max 500 LOC)
2. Create co-located `src/components/sections/YourSection.test.tsx` (min 300 LOC)
3. Import and add to `App.tsx` inside the `<main>` block
4. If navigable from floating controller, add to the tools array in `FloatingController.tsx`

### Adding a New UI Component

1. Create in `src/components/ui/` with props interface
2. Create co-located test file
3. Import where needed

### Modifying Constants

All static data lives in `src/constants/`:
- `wedding.ts` — dates, venue, bank accounts, story slides, gallery items
- `wishes.ts` — seed wish data

### Animation Presets (`src/utils/animations.ts`)

```ts
const transition = { duration: 1.8, ease: [0.16, 1, 0.3, 1] as const };
const stagger = { animate: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } };
const fadeUp = { initial: { opacity: 0, y: 20, filter: 'blur(10px)' }, animate: { ... } };
```

### Performance Considerations

- Opening background image is preloaded via `<link rel="preload">`
- `AmbientSocialLayer` and `PetalEffect` only render on the active story slide
- Twibbon canvas draws lazily via `IntersectionObserver`
- `wishPages` pagination uses `useMemo`
- `formatDate` uses a cached `Intl.DateTimeFormat` instance
- All below-fold images use `loading="lazy"`
- Font loading via `<link>` in HTML (not CSS `@import`)
- Local textures (no external CDN dependencies)
- `prefers-reduced-motion` respected

### File Size Limits

- **Source files:** max 500 LOC per file
- **Test files:** min 300 LOC, max 1500 LOC per file
- **Current largest source file:** `twibbonOverlay.ts` at 253 lines
