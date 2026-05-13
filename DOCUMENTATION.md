# Dani & Marini — Wedding Invitation

> A premium, cinematic wedding invitation web app for **M. Daniansyah Chusyaidin, S.Kom** & **Siti Nur Marini, A.Md.M**

Wedding Date: **Saturday, 29 August 2026** — Surabaya, Indonesia

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

**Firestore seed (one-time):**
```bash
# Create .env with Firebase credentials (see .env.example)
node scripts/seed-firestore.mjs
```

Guest name personalization via `?to=` query parameter:
```
http://localhost:3000/dani-marini?to=Budi%20Santoso
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
| Routing      | React Router DOM                    | 7.x      |
| Backend      | Firebase (Firestore, Auth, Storage) | 12.x     |
| Hosting      | Vercel                              | —        |
| SSR (crawlers) | Firebase Cloud Function + Vercel API route | —  |
| Testing      | Vitest + React Testing Library      | 4.1.x    |
| Fonts        | Local TTF + Google Fonts fallback   | —        |

---

## Project Structure

```
wedding-invitation/
├── index.html                          # Loading screen + SEO meta + noscript fallback
├── package.json                        # Dependencies & scripts (v1.0.0)
├── vite.config.ts                      # Vite + Tailwind + Vitest config
├── tsconfig.json                       # TypeScript config (ES2022, bundler)
├── vercel.json                         # Vercel rewrites + includeFiles for SSR
├── firebase.json                       # Firebase Firestore/Functions/Storage/Auth config
├── firestore.rules                     # Firestore security rules
├── firestore.indexes.json              # Firestore composite indexes
├── storage.rules                       # Firebase Storage security rules
├── database.rules.json                 # Firebase Realtime Database rules
├── cors.json                           # CORS configuration
├── .firebaserc                         # Firebase project alias (wedding-invitation-ff7ad)
├── DOCUMENTATION.md                    # This file
├── FIRESTORE_INTEGRATION_TASK.md       # Firestore migration task tracker
├── ISSUE.md                            # Known issues tracker
├── NEXTJS_MIGRATION.md                 # Next.js migration plan
│
├── api/
│   └── ssr-meta.ts                    # Vercel serverless function (SSR meta + loading screen)
│
├── functions/
│   └── src/index.ts                   # Firebase Cloud Function (crawler-only HTML with meta)
│
├── scripts/
│   ├── seed-firestore.mjs             # Idempotent Firestore seed (wedding + wishes + story-likes)
│   ├── generate-overlay.mjs           # Twibbon overlay PNG generator
│   └── generate-overlay.html          # Twibbon overlay preview
│
├── public/                             # Static assets (served at /)
│   ├── googlee81fbf39310ed862.html    # Google Search Console verification
│   ├── fonts/
│   │   ├── Dayland.ttf                # Custom script font (couple names)
│   │   ├── CormorantGaramond-*.ttf    # Serif font (regular + italic)
│   │   └── PlayfairDisplay-*.ttf      # Display font (regular + italic)
│   ├── images/
│   │   ├── bride_and_groom_full_body_potrait.jpeg
│   │   └── twibbon-overlay.png        # Pre-rendered twibbon frame
│   ├── musics/
│   │   └── adele-make-you-feel-my-love.mp3
│   └── textures/
│       ├── p6.png                      # Film grain texture
│       └── stardust.png               # Floral shadow texture
│
└── src/
    ├── main.tsx                        # React entry point (StrictMode + MotionConfig + ErrorBoundary)
    ├── App.tsx                         # Router (BrowserRouter: /:slug, /admin/:slug)
    ├── index.css                       # Tailwind theme, animations, utilities
    │
    ├── pages/
    │   ├── Wedding.tsx                # Wedding page (411 lines — data fetching + state + sections)
    │   └── Admin.tsx                  # Admin panel (361 lines — auth + 10 form tabs + save)
    │
    ├── types/
    │   ├── index.ts                    # GuestWishes interface
    │   └── firestore.ts               # WeddingDocument, WeddingTheme, StorySlide, Ceremony, etc.
    │
    ├── context/
    │   └── WeddingContext.tsx           # React context for wedding data
    │
    ├── lib/
    │   ├── firebase.ts                 # Firebase app init (Firestore + Auth + Storage)
    │   ├── storage.ts                  # uploadFile() + deleteFile() — Firebase Storage
    │   └── wishes.ts                   # addWish() — write wish to Firestore
    │
    ├── constants/
    │   └── themeDefaults.ts            # Default theme values per template (cinematic, etc.)
    │
    ├── hooks/
    │   ├── useCountdown.ts             # Countdown timer hook
    │   ├── useFocusTrap.ts             # Focus trap hook for modals (RSVPModal, PhotoZoomModal)
    │   ├── useStoryComments.ts         # Real-time Firestore listener for story comments per slide
    │   ├── useStoryLikes.ts            # Read + increment story likes from Firestore
    │   ├── useWedding.ts               # One-time Firestore read for wedding document
    │   └── useWishes.ts                # Real-time Firestore listener for wishes
    │
    ├── utils/
    │   ├── animations.ts               # transition, stagger, fadeUp presets
    │   ├── formatDate.ts               # Indonesian locale date formatter (Timestamp-aware)
    │   ├── galleryLayout.ts            # Auto-assign span/shape CSS to gallery items by index
    │   ├── twibbonOverlay.ts           # Canvas drawing for twibbon frame (268 lines)
    │   └── weddingDerived.ts           # Derived display values from Firestore data
    │
    ├── components/
    │   ├── ui/                         # Reusable visual primitives
    │   │   ├── LightGlow.tsx           # Animated gold glow overlay
    │   │   ├── ForegroundOrnaments.tsx  # Floating ink/gold blur elements
    │   │   ├── FloatingPetals.tsx      # 8 animated falling petals
    │   │   ├── BackgroundLayers.tsx    # Film grain + shadows + light sweep
    │   │   ├── PetalEffect.tsx         # 15 subtle floating particles
    │   │   ├── CountdownTimer.tsx      # 4 time boxes (Hari/Jam/Menit/Detik)
    │   │   ├── PhotoZoomModal.tsx      # Full-screen image viewer with focus trap
    │   │   ├── LoadingScreen.tsx       # React loading screen component
    │   │   ├── ErrorBoundary.tsx       # Class component error boundary (generic defaults)
    │   │   └── AmbientSocialLayer.tsx  # Instagram-style floating hearts/comments (IntersectionObserver-gated)
    │   │
    │   ├── features/                   # Complex interactive components
    │   │   ├── TwibbonCreator.tsx      # Canvas photo frame with drag/pinch (425 lines)
    │   │   ├── RSVPModal.tsx           # RSVP form modal with focus trap + scroll support
    │   │   └── FloatingController.tsx  # Draggable nav + music toggle (viewport-bounded)
    │   │
    │   ├── sections/                   # Page sections (render order)
    │   │   ├── CinematicOpening.tsx    # Dark overlay with scroll/swipe/keyboard open triggers
    │   │   ├── HeroSection.tsx         # Full-bleed portrait with names
    │   │   ├── CoupleSection.tsx       # Overlapping blob portraits + parent info
    │   │   ├── CinematicStory.tsx      # Horizontal scroll love timeline (6 slides)
    │   │   ├── EventSection.tsx        # Countdown + ceremonies + venue + CTAs
    │   │   ├── TwibbonSection.tsx      # Wraps TwibbonCreator
    │   │   ├── RSVPSection.tsx         # Paginated wish feed + FAB
    │   │   ├── DigitalEnvelope.tsx     # Bank/e-wallet accounts with copy + focus ring
    │   │   ├── PhotoGallery.tsx        # Horizontal organic-shape gallery + focus ring
    │   │   └── Footer.tsx             # Credits + dynamic social links + copyright
    │   │
    │   └── admin/                      # Admin form components (10 tabs)
    │       ├── CoupleForm.tsx          # Names, parents, photos, social links
    │       ├── EventForm.tsx           # Date, city, venue, ceremonies
    │       ├── StoryForm.tsx           # Repeatable story slides with photos
    │       ├── MediaForm.tsx           # Music, hero image, opening image, twibbon overlay
    │       ├── GiftForm.tsx            # Repeatable bank/e-wallet accounts
    │       ├── GalleryForm.tsx         # Multi-photo upload with delete
    │       ├── CreditForm.tsx          # Credits (name, role, description, social links)
    │       ├── CustomizeForm.tsx       # Quran verse, template, colors, fonts
    │       ├── StoryInteractionsForm.tsx # Story likes/comments management
    │       └── WishesForm.tsx          # Wishes management
    │
    └── test/
        └── setup.ts                    # Vitest setup (jest-dom, mocks)
```

**Code stats:** 55 source files, 5,000 total LOC (largest: 425 lines — TwibbonCreator)
**Test stats:** 38 test files, 17,575 total LOC, 2,173 tests

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        index.html                           │
│            <div id="loading-screen"> (fixed overlay)        │
│            <div id="root">                                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                     src/main.tsx
                     <StrictMode>
                       <MotionConfig reducedMotion="user">
                         <ErrorBoundary>
                           <App />  ← BrowserRouter
                             │
                ┌────────────┴──────────────────────────┐
                │    /:slug → Wedding page               │
                │    /admin/:slug → Admin panel           │
                └────────────┬──────────────────────────┘
                             │
              ┌──────────────┴──────────────────────────┐
              │       src/pages/Wedding.tsx              │
              │  (411 lines — client-side orchestrator)  │
              │                                         │
              │  ┌─ useWedding(slug) → Firestore        │
              │  ├─ useWishes(slug) → Firestore         │
              │  │                                      │
              │  ├─ Not found guard (wedding === null)   │
              │  │                                      │
              │  ├─ WeddingContext.Provider              │
              │  │  ┌─ BackgroundLayers (fixed)          │
              │  │  ├─ Audio element (wedding.musicUrl)  │
              │  │  │                                    │
              │  │  ├─ AnimatePresence                   │
              │  │  │  └─ CinematicOpening               │
              │  │  │     ├─ LightGlow                   │
              │  │  │     ├─ FloatingPetals              │
              │  │  │     └─ ForegroundOrnaments         │
              │  │  │                                    │
              │  │  └─ Main Content (when isOpen)        │
              │  │     ├─ FloatingController              │
              │  │     ├─ HeroSection                     │
              │  │     ├─ CoupleSection                   │
              │  │     ├─ CinematicStory                  │
              │  │     │  ├─ AmbientSocialLayer           │
              │  │     │  └─ PetalEffect                  │
              │  │     ├─ EventSection                    │
              │  │     │  └─ CountdownTimer               │
              │  │     ├─ TwibbonSection                  │
              │  │     │  └─ TwibbonCreator               │
              │  │     ├─ RSVPSection                     │
              │  │     ├─ RSVPModal                       │
              │  │     ├─ DigitalEnvelope                 │
              │  │     ├─ PhotoGallery                    │
              │  │     ├─ Footer                          │
              │  │     └─ PhotoZoomModal                  │
              │  └───────────────────────────────────────┘
              └──────────────────────────────────────────┘
```

**Key architectural decisions:**
- **Slug-based routing** — `/:slug` for wedding pages, `/admin/:slug` for admin panel, via React Router DOM
- **Firestore-backed data** — all wedding content from `weddings/{slug}`; wishes and story comments are real-time via `onSnapshot`
- **WeddingContext** — React context provides `WeddingDocument` to all sections via `useWeddingContext()` hook
- **Not-found guard** — unregistered slugs show "Undangan Tidak Ditemukan" instead of empty content
- **SSR for meta tags** — Vercel API route (`api/ssr-meta.ts`) handles all `/:slug` requests, injects dynamic meta tags, theme colors, couple names into `index.html`. Crawlers get minimal HTML from Firebase Cloud Function.
- **Derived display values** — `weddingDerived.ts` computes date display, calendar URL, twibbon filename, WhatsApp URLs, copyright from raw Firestore data
- **Theme system** — CSS variables overridden at runtime from `wedding.theme`; Google Fonts dynamically loaded for non-default templates; defaults in `themeDefaults.ts`
- **Cinematic gate** — `AnimatePresence` manages opening-to-content transition; opening supports scroll, swipe, and keyboard triggers
- **Loading screen** — `index.html` has a standalone `<div id="loading-screen">` (outside `#root`) removed by `CinematicOpening` on mount
- **Music auto-play** — triggered on open with fallback on autoplay rejection
- **Focus traps** — RSVPModal and PhotoZoomModal use `useFocusTrap` hook
- **Reduced motion** — `<MotionConfig reducedMotion="user">` wraps entire app; CSS `@media (prefers-reduced-motion)` for CSS animations
- **Admin panel** — 10 form tabs (Pasangan, Acara, Cerita, Media, Amplop, Galeri, Kredit, Kustom, Interaksi, Ucapan) with auth gate, unsaved changes warning, status toggle, auto `ownerId` assignment
- **Code splitting** — sections lazy-loaded via `React.lazy` + `Suspense`
- **Co-located tests** — every source file has a `.test.tsx` sibling

---

## Design System

### Colors (defined in `src/index.css` via `@theme`, overridable via Firestore `theme.colors`)

| Token         | Hex       | Theme field | Usage                                |
| ------------- | --------- | ----------- | ------------------------------------ |
| `gold`        | `#B48D3E` | `accent`    | Accent, labels, borders, CTAs        |
| `ivory`       | `#FDFCF8` | `background`| Primary background                   |
| `paper`       | `#F5F2ED` | `surface`   | Secondary background (gallery, event)|
| `ink`         | `#1A1A1A` | `text`      | Primary text, dark overlays          |
| `sepia`       | `#FAF7F2` | `surface`   | Warm tint background                 |
| `rose-pastel` | `#F8BBD0` | `button`    | Accent (hearts, social, buttons)     |

### Fonts (overridable via Firestore `theme.fonts`)

| Token          | Family              | Theme field   | Usage                                |
| -------------- | ------------------- | ------------- | ------------------------------------ |
| `font-serif`   | Cormorant Garamond  | `heading`     | Body text, headings, wish messages   |
| `font-sans`    | Montserrat          | `body`        | Labels, tracking-heavy micro text    |
| `font-display` | Playfair Display    | `decorative`  | Event date, decorative headings      |
| `font-dayland` | Dayland             | `script`      | Couple names — hero & opening        |

### CSS Animations (index.css)

| Class                | Duration | Effect                           |
| -------------------- | -------- | -------------------------------- |
| `animate-shadow-drift` | 25s    | Floating blur background         |
| `animate-light-sweep`  | 8s     | Gold gradient sweep              |
| `animate-grain`        | 4s     | Film grain texture movement      |
| `animate-soft-zoom`    | 20s    | Gentle scale pulse on images     |
| `bubble-glow`          | —      | Gold box-shadow (uses `color-mix()`) |

### CSS Utilities (index.css)

| Utility                  | Purpose                            |
| ------------------------ | ---------------------------------- |
| `.no-scrollbar`          | Hide scrollbar (webkit + firefox)  |
| `.scroll-snap-container` | Horizontal scroll snap             |
| `.h-screen-safe`         | `100svh` (small viewport height)   |
| `.min-h-screen-safe`     | `min-height: 100svh`              |

### Accessibility

- `<MotionConfig reducedMotion="user">` — Framer Motion respects OS reduced motion setting
- `@media (prefers-reduced-motion: reduce)` — disables CSS animations
- `aria-label` on all icon-only buttons and admin form inputs
- `htmlFor`/`id` associations on admin form labels
- Focus traps on RSVPModal and PhotoZoomModal via `useFocusTrap` hook
- `focus-visible:ring` on gallery items and digital envelope cards
- `sr-only` on RSVP radio inputs (accessible but visually hidden)
- `role="tablist"`/`role="tab"`/`role="tabpanel"` on admin navigation
- `lang="id"` on HTML root
- `rel="noopener noreferrer"` on all external links
- `window.open()` with `noopener,noreferrer`
- XSS protection via `escapeHtml()` in SSR output

---

## Component Reference

### UI Components (`components/ui/`)

| Component | Lines | Description |
|-----------|-------|-------------|
| `LightGlow` | 17 | Animated gold radial glow, `mix-blend-soft-light` |
| `ForegroundOrnaments` | 16 | Two floating ink/gold blur shapes |
| `FloatingPetals` | 34 | 8 animated petals with `transform-gpu` |
| `BackgroundLayers` | 8 | Film grain + floral shadows + light sweep (fixed) |
| `PetalEffect` | 25 | 15 subtle rose-pastel particles |
| `CountdownTimer` | 36 | 4 time boxes using `useCountdown` hook |
| `PhotoZoomModal` | 55 | Full-screen image viewer (z-2000) with focus trap |
| `LoadingScreen` | 52 | React-rendered loading screen component |
| `ErrorBoundary` | 49 | Class component error boundary (generic "Undangan Pernikahan" default) |
| `AmbientSocialLayer` | 132 | Instagram-style floating hearts/comments, IntersectionObserver-gated |

### Feature Components (`components/features/`)

| Component | Lines | Props | Description |
|-----------|-------|-------|-------------|
| `TwibbonCreator` | 425 | none (reads WeddingContext) | Canvas photo frame (1080x1920), drag/pinch, share/download PNG |
| `RSVPModal` | 119 | isOpen, isSubmitSuccess, guestName, onClose, onSubmit | Form modal with focus trap + `max-h-[90vh]` scroll |
| `FloatingController` | 106 | isToolsOpen, setIsToolsOpen, isPlaying, toggleMusic | Draggable nav + music toggle, viewport-bounded constraints |

### Section Components (`components/sections/`)

| Component | Lines | Section ID | Description |
|-----------|-------|------------|-------------|
| `CinematicOpening` | 292 | — | Dark overlay with scroll/swipe/keyboard open, removes loading screen |
| `HeroSection` | 69 | — | Full-bleed portrait, names, date, dynamic alt text |
| `CoupleSection` | 135 | `couple-section` | Overlapping blob portraits (`h-[50vh]`), parent info |
| `CinematicStory` | 140 | `story-section` | Horizontal-scroll slides with likes/comments, empty state guard |
| `EventSection` | 73 | `event-section` | Countdown, ceremonies, venue, map/calendar CTAs, gap-based layout |
| `TwibbonSection` | 10 | `twibbon-section` | Wraps TwibbonCreator |
| `RSVPSection` | 159 | `rsvp-section` | Paginated wish feed + RSVP FAB |
| `DigitalEnvelope` | 72 | `gift-section` | Bank/e-wallet with copy, focus ring, empty state guard |
| `PhotoGallery` | 66 | — | Horizontal organic-shape gallery, focus ring, empty state guard, `sizes` attr |
| `Footer` | 77 | — | Credits loop, social links from `groomSocialLinks`/`brideSocialLinks`, copyright |

### Admin Components (`components/admin/`)

| Component | Lines | Tab | Description |
|-----------|-------|-----|-------------|
| `CoupleForm` | 327 | Pasangan | Names, parents, photos, social links (repeatable) |
| `EventForm` | 95 | Acara | Date, city, venue, ceremonies (repeatable) |
| `StoryForm` | 124 | Cerita | Story slides with year, text, photo (repeatable) |
| `MediaForm` | 163 | Media | Music, hero, opening, twibbon (with auto-generate) |
| `GiftForm` | 69 | Amplop | Bank accounts (repeatable) |
| `GalleryForm` | 109 | Galeri | Multi-photo upload with delete + orphan cleanup |
| `CreditForm` | 84 | Kredit | Credits with name, role, description |
| `CustomizeForm` | 118 | Kustom | Quran verse, template dropdown, color pickers, font dropdowns |
| `StoryInteractionsForm` | 71 | Interaksi | Story likes/comments management |
| `WishesForm` | 53 | Ucapan | Wishes management |

---

## App State Management

**Data flow:** Firestore → `useWedding` / `useWishes` hooks → `Wedding.tsx` → `WeddingContext.Provider` + props. Story section uses `useStoryLikes` / `useStoryComments` hooks directly in `CinematicStory.tsx`.

| State              | Type                    | Source                          | Purpose                        |
| ------------------ | ----------------------- | ------------------------------- | ------------------------------ |
| `wedding`          | `WeddingDocument\|null` | `useWedding(slug)` (Firestore)  | All wedding content            |
| `wishes`           | `GuestWishes[]`         | `useWishes(slug)` (Firestore)   | Real-time RSVP/wishes feed     |
| `isOpen`           | `boolean`               | `useState(false)`               | Gate between opening & content |
| `guestName`        | `string`                | URL `?to=` or `wedding.defaultGuest` | Guest name display       |
| `isPlaying`        | `boolean`               | `useState(false)`               | Music playback state           |
| `isRSVPModalOpen`  | `boolean`               | `useState(false)`               | RSVP form modal visibility     |
| `isToolsOpen`      | `boolean`               | `useState(false)`               | Floating tools menu visibility |
| `selectedPhoto`    | `string \| null`        | `useState(null)`                | Gallery zoom modal image src   |
| `currentPage`      | `number`                | `useState(1)`                   | Wishes pagination              |
| `copiedIndex`      | `number \| null`        | `useState(null)`                | Copy feedback for envelopes    |
| `isSubmitSuccess`  | `boolean`               | `useState(false)`               | RSVP success state             |

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
| 4  | Event              | `event-section`     | paper      |
| 5  | Twibbon            | `twibbon-section`   | ivory      |
| 6  | RSVP & Wishes      | `rsvp-section`      | paper      |
| 7  | RSVP Modal         | —                   | overlay    |
| 8  | Digital Envelope   | `gift-section`      | ivory      |
| 9  | Photo Gallery      | —                   | paper      |
| 10 | Footer             | —                   | ivory      |
| 11 | Photo Zoom Modal   | —                   | overlay    |

**Z-Index Map (explicit `z-[N]` classes):**
```
10000 — Cinematic opening
9999  — Loading screen (index.html, removed on mount)
2000  — Photo zoom modal
 200  — RSVP modal
 100  — Floating controller
  70  — Story comment input
  60  — Story interaction buttons
  30  — Story text content
  20  — Ambient social layer
  15  — Film grain (BackgroundLayers)
  10  — Section content z-10
   1  — Light sweep (BackgroundLayers)
```

---

## Data & Content Reference

### Firestore Collections

| Collection | Document ID | Purpose |
|------------|-------------|---------|
| `weddings` | `dani-marini` | All wedding content (30+ fields, nested `theme` object, `groomSocialLinks`/`brideSocialLinks` arrays) |
| `wishes` | auto-generated | Guest wishes/RSVP (real-time listener) |
| `story-likes` | `dani-marini` | Story slide like counts |
| `story-comments` | auto-generated | Guest story slide comments (real-time listener per slide) |

### TypeScript Interfaces

**`src/types/index.ts`** — Guest wishes (used by UI components):
```ts
interface GuestWishes {
  id: string;
  name: string;
  message: string;
  attendance: 'yes' | 'no';
  createdAt: number | Timestamp;
}
```

**`src/types/firestore.ts`** — Full Firestore document types:
```ts
interface WeddingDocument {
  ownerId: string;
  status: 'draft' | 'published' | 'archived';
  groomNickname: string; groomName: string; groomParents: string;
  groomPhoto: string;
  groomSocialLinks: { label: string; url: string }[];
  brideNickname: string; brideName: string; brideParents: string;
  bridePhoto: string;
  brideSocialLinks: { label: string; url: string }[];
  defaultGuest: string;
  eventDate: string; eventCity: string;
  venueName: string; venueAddress: string; venueMapsUrl: string;
  ceremonies: Ceremony[];
  story: StorySlide[];
  gallery: string[];
  giftAccounts: BankAccount[];
  musicUrl: string; twibbonOverlay: string; heroImage: string; openingImage: string;
  quranArabic: string; quranTranslation: string; quranReference: string;
  theme: WeddingTheme; // { template, colors: ThemeColors, fonts: ThemeFonts }
  credits: CreditPerson[];
  createdAt: Timestamp; updatedAt: Timestamp;
}
```

### Derived Values (`src/utils/weddingDerived.ts`)

| Function | Input | Output |
|----------|-------|--------|
| `deriveDateDisplay(eventDate)` | `'2026-08-29'` | `'Sabtu, 29 Agustus 2026'` |
| `deriveDateShort(eventDate)` | `'2026-08-29'` | `'29 Agustus 2026'` |
| `deriveCalendarUrl(wedding)` | `WeddingDocument` | Google Calendar URL |
| `deriveTwibbonFilename(groom, bride)` | nicknames | `'Memori-Dani-Marini.png'` |
| `deriveWhatsappUrl(number)` | phone number | `'https://wa.me/...'` |
| `deriveCopyright(eventDate)` | `'2026-08-29'` | `'© 2026. Kami membangunnya bersama...'` |
| `deriveMetaTitle(groom, bride, date)` | names + date | `'Wedding Dani & Marini - ...'` |

### Gallery Layout (`src/utils/galleryLayout.ts`)

12 layout patterns cycling via `getGalleryLayout(index)` returning `{ span, shape }` — auto-assigns CSS grid classes to gallery URL arrays from Firestore.

### Social Links (Footer — from Firestore)

Social links are stored as `{ label: string, url: string }[]` arrays on `groomSocialLinks` and `brideSocialLinks` fields. The Footer dynamically renders icons based on the `label` field (Instagram, LinkedIn, WhatsApp, Threads, Tiktok, Twitter). WhatsApp URLs are converted via `deriveWhatsappUrl()`.

---

## Feature Details

### Firestore Integration
- **Wedding data:** One-time read via `useWedding(slug)` → `getDoc` from `weddings/{slug}`
- **Wishes:** Real-time listener via `useWishes(slug)` → `onSnapshot` on `wishes` collection
- **Write wishes:** `addWish(weddingId, data)` → `addDoc` with `serverTimestamp()`
- **Story likes:** One-time read + increment via `useStoryLikes(slug)` → `getDoc` + `runTransaction` on `story-likes/{slug}`
- **Story comments:** Real-time listener per slide via `useStoryComments(weddingId, slideIndex)` → `onSnapshot` on `story-comments` collection, `addComment()` via `addDoc`
- **Context:** `WeddingContext.Provider` wraps entire app, sections read via `useWeddingContext()`
- **Theme system:** `Wedding.tsx` reads `wedding.theme` and overrides CSS custom properties at runtime (`--color-gold`, `--font-serif`, etc.), dynamically loads Google Fonts via injected `<link>` tag (skipped for cinematic defaults). Defaults defined in `src/constants/themeDefaults.ts`.
- **Not-found guard:** Unregistered slugs show "Undangan Tidak Ditemukan" page
- **Loading gate:** HTML loading screen (outside `#root`) removed by `CinematicOpening` on mount
- **Meta tags:** `document.title` and OG/Twitter meta updated dynamically after wedding loads; canonical URL injected
- **SSR:** Vercel API route (`api/ssr-meta.ts`) injects dynamic meta, loading screen names/colors, canonical URL, JSON-LD. XSS-protected via `escapeHtml()` + `validateHex()`. Firebase Cloud Function provides minimal HTML for crawlers.
- **Seed script:** `scripts/seed-firestore.mjs` creates wedding doc, story-likes, and 20 wishes (idempotent)

### Admin Panel
- **Auth:** Firebase Auth (email/password) with `onAuthStateChanged` listener
- **10 tabs:** Pasangan, Acara, Cerita, Media, Amplop, Galeri, Kredit, Kustom, Interaksi, Ucapan
- **Save flow:** `handleSave(fields, files?, urlsToDelete?)` → upload files to Storage → delete orphaned files → `updateDoc` with `serverTimestamp()`
- **Status toggle:** Published/Archived badge in header
- **Owner assignment:** `ownerId` auto-set to `user.uid` on first save
- **Unsaved changes warning:** `window.confirm` on tab switch when `!hasSaved`
- **Double-submit prevention:** `isSaving` prop disables all submit buttons
- **Save status modal:** Animated modal showing saving/success/error state
- **Validation:** `maxLength`, `type="url"`, `type="tel"`, file size limits, `required` on all form inputs
- **Accessibility:** `aria-label` on all inputs, `role="tablist"` on navigation

### Guest Name Personalization
- Reads `?to=` query param on mount via `useEffect`
- Decoded with `decodeURIComponent()`
- Displayed in opening screen and as RSVP form placeholder
- Has `max-w-[85vw] break-words` for overflow protection
- Defaults to `wedding.defaultGuest` from Firestore if no URL param

### Music System
- Audio URL from `wedding.musicUrl` (Firestore)
- `<audio>` element with `loop` attribute, `preload="none"`
- Auto-plays on open with `.catch()` fallback
- Toggle via floating controller menu
- Visual: pulsing aura, rotating ring, filled/unfilled heart icon

### RSVP & Wishes
- **Form:** Name (maxLength=50), Attendance (radio: Hadir/Berhalangan, `sr-only` for accessibility), Message (maxLength=200)
- **Submit:** Writes to Firestore via `addWish()`, shows success for 1.5s, then closes modal
- **Real-time:** New wishes appear immediately via Firestore `onSnapshot` listener
- **Pagination:** `useMemo` height-based calculation
- **Limit:** 50 most recent wishes

### Twibbon Creator
- Fixed 9:16 aspect ratio (1080x1920)
- Pre-rendered overlay from `wedding.twibbonOverlay` (Firestore) with cache-busting
- Drag (mouse + touch) and pinch-to-zoom with `crossOrigin="anonymous"`
- Share via Web Share API with `navigator.canShare` check
- Download fallback as `Memori-{groom}-{bride}.png`

### CinematicStory
- Slides from `wedding.story` (Firestore), empty state returns `null`
- Field: `slide.bgImage` for background images
- Active slide detection via `onScroll` + `scrollContainerRef`
- `AmbientSocialLayer` (IntersectionObserver-gated) + `PetalEffect` only on active slide
- Like/comment buttons hidden when comment form is open
- Comment form inputs have `aria-label`

### Digital Envelope
- Accounts from `wedding.giftAccounts` (Firestore), empty state returns `null`
- Copy-to-clipboard with `navigator.clipboard` + legacy `execCommand` fallback
- Copy/check icon toggle with `focus-visible:ring` keyboard indicator

### Photo Gallery
- URLs from `wedding.gallery` (Firestore), empty state returns `null`
- Layout from `getGalleryLayout(index)`, `sizes` attribute on all images
- `focus-visible:ring` keyboard indicator, `role="button"` + `tabIndex={0}`

---

## Testing

**Framework:** Vitest 4.1.x + React Testing Library + jest-dom

**Setup:** `src/test/setup.ts` — mocks `IntersectionObserver` (auto-triggers `isIntersecting: true`), `HTMLCanvasElement.getContext`, `HTMLMediaElement.play/pause`

**Test structure:** Co-located with source files (e.g., `Wedding.tsx` → `App.test.tsx`)

**Stats:** 38 test files · 2,173 tests · 17,575 test LOC

**Test patterns:**
- **Firestore mocks:** `vi.mock('firebase/firestore')` + `vi.mock('../lib/firebase')` for hook tests
- **Context mocks:** `vi.mock('../../context/WeddingContext')` in all section/feature tests
- **Router mock:** `vi.mock('react-router-dom')` with `useParams: () => ({ slug: 'dani-marini' })`
- **Rendering:** no crash, correct structure, no duplicate elements
- **Visual integrity:** pointer-events-none, overflow-hidden, lazy loading, responsive classes, z-index
- **Animation safety:** transform-gpu, blur, overflow containment
- **Logical behavior:** click handlers, form submission, pagination, copy feedback, timer ticks
- **Edge cases:** empty states, past dates, long strings, unicode, special characters
- **Accessibility:** aria-labels, label associations, sr-only, focus-visible, noopener links, tablist
- **Re-render stability:** no duplication, consistent DOM across re-renders

**Run tests:**
```bash
npm run test         # Run all tests once
npx vitest           # Watch mode
npx vitest run src/components/sections/Footer.test.tsx  # Single file
```

---

## Development Guide

### Adding a New Section

1. Create `src/components/sections/YourSection.tsx`
2. Read wedding data via `const wedding = useWeddingContext()`
3. Create co-located test file
4. Add `vi.mock('../../context/WeddingContext')` in the test file
5. Import and add to `Wedding.tsx` inside the `<main>` block
6. If navigable from floating controller, add to the tools array in `FloatingController.tsx`

### Adding a New Admin Form Tab

1. Create `src/components/admin/YourForm.tsx` with `{ data, onSave, isSaving }` props
2. Add to `STEPS` array and `renderForm()` switch in `Admin.tsx`
3. Include validation (`maxLength`, `aria-label`, `disabled={isSaving}`)

### Modifying Wedding Data

All wedding content is stored in Firestore. To update:
1. Use the admin panel at `/admin/{slug}`
2. Or edit `scripts/seed-firestore.mjs` and re-seed
3. Or edit directly in the Firebase Console

### Animation Presets (`src/utils/animations.ts`)

```ts
const transition = { duration: 1.8, ease: [0.16, 1, 0.3, 1] as const };
const stagger = { animate: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } };
const fadeUp = { initial: { opacity: 0, y: 20, filter: 'blur(10px)' }, animate: { ... } };
```

### Performance Considerations

- Opening background image preloaded via `<link rel="preload">`
- Dayland font preloaded via `<link rel="preload" as="font">`
- Hero image prefetched via `new Image()` in `useEffect`
- Sections lazy-loaded via `React.lazy` + `Suspense`
- `AmbientSocialLayer` timer paused when off-screen (IntersectionObserver)
- `wishPages` pagination uses `useMemo`
- `formatDate` uses a cached `Intl.DateTimeFormat` instance
- `weddingDerived.ts` formatters are module-level singletons
- All below-fold images use `loading="lazy"` with `sizes` attribute
- Fonts loaded locally (TTF in `public/fonts/`) with Google Fonts async fallback
- Dynamic Google Fonts loading skipped for cinematic template defaults
- `prefers-reduced-motion` respected (MotionConfig + CSS)
- `color-mix()` for theme-responsive shadows/glows (95%+ browser support)
- Firestore: `useWedding` is one-time `getDoc`; `useWishes` is `onSnapshot` with `limit(50)`
- Timer refs cleaned up on unmount (Wedding, Admin, TwibbonCreator)
- SSR: `index.html` cached in serverless function memory; Firestore data fetched per request

### URL Structure

| Path | Route | Purpose |
|------|-------|---------|
| `/:slug` | Wedding page | Guest-facing invitation |
| `/admin/:slug` | Admin panel | Couple's content management |
| `/api/ssr-meta?slug=X` | Vercel API | SSR meta tags + loading screen |
