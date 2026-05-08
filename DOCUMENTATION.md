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

**Firestore seed (one-time):**
```bash
# Create .env with Firebase credentials (see .env.example)
node scripts/seed-firestore.mjs
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
| Backend      | Firebase / Firestore                | 11.x     |
| Testing      | Vitest + React Testing Library      | 4.1.x    |
| Fonts        | Local TTF + Google Fonts fallback   | —        |

---

## Project Structure

```
wedding-invitation/
├── index.html                          # Entry HTML with SEO meta, OG tags, loading screen
├── package.json                        # Dependencies & scripts (v1.0.0)
├── vite.config.ts                      # Vite + Tailwind + Vitest config
├── tsconfig.json                       # TypeScript config (ES2022, bundler)
├── DOCUMENTATION.md                    # This file
├── README.md                           # Quick start guide
├── FIRESTORE_INTEGRATION_TASK.md       # Firestore migration task tracker
│
├── scripts/
│   ├── seed-firestore.mjs             # Idempotent Firestore seed (wedding + wishes + story-likes)
│   ├── generate-overlay.mjs           # Twibbon overlay PNG generator
│   └── generate-overlay.html          # Twibbon overlay preview
│
├── public/                             # Static assets (served at /)
│   ├── fonts/
│   │   ├── Dayland.ttf                # Custom display font
│   │   ├── CormorantGaramond-*.ttf    # Serif font (regular + italic)
│   │   └── PlayfairDisplay-*.ttf      # Display font (regular + italic)
│   ├── images/
│   │   ├── bride_face_potrait.jpeg
│   │   ├── groom_face_potrait.jpeg
│   │   ├── bride_and_groom_full_body_potrait.jpeg
│   │   ├── bride_and_groom_half_body_potrait.png
│   │   └── twibbon-overlay.png        # Pre-rendered twibbon frame
│   ├── musics/
│   │   └── adele-make-you-feel-my-love.mp3
│   └── textures/
│       ├── p6.png                      # Film grain texture
│       └── stardust.png               # Floral shadow texture
│
└── src/
    ├── main.tsx                        # React entry point (ErrorBoundary wraps App)
    ├── App.tsx                         # Main orchestrator (261 lines)
    ├── index.css                       # Tailwind theme, animations, utilities
    │
    ├── types/
    │   ├── index.ts                    # GuestWishes interface
    │   └── firestore.ts               # WeddingDocument, StorySlide, Ceremony, etc.
    │
    ├── context/
    │   └── WeddingContext.tsx           # React context for wedding data
    │
    ├── lib/
    │   ├── firebase.ts                 # Firebase app + Firestore init
    │   └── wishes.ts                   # addWish() — write wish to Firestore
    │
    ├── constants/
    │   └── themeDefaults.ts            # Default theme values per template (cinematic, etc.)
    │
    ├── hooks/
    │   ├── useCountdown.ts             # Countdown timer hook
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
    │   │   ├── PhotoZoomModal.tsx      # Full-screen image viewer
    │   │   ├── ErrorBoundary.tsx       # Class component error boundary with fallback
    │   │   └── AmbientSocialLayer.tsx  # Instagram-style floating hearts/comments
    │   │
    │   ├── features/                   # Complex interactive components
    │   │   ├── TwibbonCreator.tsx      # Canvas photo frame with drag/pinch (303 lines)
    │   │   ├── RSVPModal.tsx           # RSVP form modal with success state
    │   │   └── FloatingController.tsx  # Draggable nav + music toggle
    │   │
    │   └── sections/                   # Page sections (render order)
    │       ├── CinematicOpening.tsx    # Dark overlay with "Buka Undangan"
    │       ├── HeroSection.tsx         # Full-bleed portrait with names
    │       ├── CoupleSection.tsx       # Overlapping blob portraits + parent info
    │       ├── CinematicStory.tsx      # Horizontal scroll love timeline (6 slides)
    │       ├── EventSection.tsx        # Countdown + ceremonies + venue + CTAs
    │       ├── TwibbonSection.tsx      # Wraps TwibbonCreator
    │       ├── RSVPSection.tsx         # Paginated wish feed + FAB
    │       ├── DigitalEnvelope.tsx     # Bank/e-wallet accounts with copy
    │       ├── PhotoGallery.tsx        # Horizontal organic-shape gallery
    │       └── Footer.tsx             # Credits + social links + copyright
    │
    └── test/
        └── setup.ts                    # Vitest setup (jest-dom, mocks)
```

**Code stats:** 40 source files, 2,709 total LOC (largest: 303 lines — TwibbonCreator)
**Test stats:** 37 test files, 17,656 total LOC, 2,190 tests

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
                       <ErrorBoundary>
                         <App />
                           │
              ┌────────────┴──────────────────────────┐
              │         src/App.tsx                    │
              │    (261 lines — orchestrator)          │
              │                                       │
              │  ┌─ useWedding(slug) → Firestore      │
              │  ├─ useWishes(slug) → Firestore       │
              │  │                                    │
              │  ├─ WeddingContext.Provider            │
              │  │  ┌─ BackgroundLayers (fixed)        │
              │  │  ├─ Audio element (wedding.musicUrl)│
              │  │  │                                  │
              │  │  ├─ AnimatePresence                 │
              │  │  │  └─ CinematicOpening             │
              │  │  │     ├─ LightGlow                 │
              │  │  │     ├─ FloatingPetals            │
              │  │  │     └─ ForegroundOrnaments       │
              │  │  │                                  │
              │  │  └─ Main Content (when isOpen)      │
              │  │     ├─ FloatingController            │
              │  │     ├─ HeroSection                   │
              │  │     ├─ CoupleSection                 │
              │  │     ├─ CinematicStory                │
              │  │     │  ├─ AmbientSocialLayer         │
              │  │     │  └─ PetalEffect                │
              │  │     ├─ EventSection                  │
              │  │     │  └─ CountdownTimer             │
              │  │     │     └─ useCountdown hook       │
              │  │     ├─ TwibbonSection                │
              │  │     │  └─ TwibbonCreator             │
              │  │     ├─ RSVPSection                   │
              │  │     ├─ RSVPModal                     │
              │  │     ├─ DigitalEnvelope               │
              │  │     ├─ PhotoGallery                  │
              │  │     ├─ Footer                        │
              │  │     └─ PhotoZoomModal                │
              │  └─────────────────────────────────────┘
              └────────────────────────────────────────┘
```

**Key architectural decisions:**
- **Firestore-backed data** — all wedding content loaded from `weddings/{slug}` Firestore document; wishes are real-time via `onSnapshot`
- **WeddingContext** — React context provides `WeddingDocument` to all sections via `useWeddingContext()` hook
- **Derived display values** — `weddingDerived.ts` computes date display, calendar URL, twibbon filename, WhatsApp URLs, copyright from raw Firestore data
- **Component-split architecture** — 37 files, max 303 LOC each, organized by `ui/`, `features/`, `sections/`
- **No routing** — single page with sections revealed after "open invitation" interaction
- **Cinematic gate** — `AnimatePresence` manages opening-to-content transition
- **Music auto-play** — triggered on "Buka Undangan" click with fallback on autoplay rejection
- **Co-located tests** — every source file has a `.test.tsx` sibling
- **Code splitting** — sections lazy-loaded via `React.lazy` + `Suspense`

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
| `BackgroundLayers` | 8 | Film grain + floral shadows + light sweep (fixed) |
| `PetalEffect` | 25 | 15 subtle rose-pastel particles |
| `CountdownTimer` | 36 | 4 time boxes using `useCountdown` hook |
| `PhotoZoomModal` | 48 | Full-screen image viewer (z-2000) |
| `ErrorBoundary` | 49 | Class component error boundary with configurable fallback props |
| `AmbientSocialLayer` | 125 | Instagram-Live-style floating hearts/comments |

### Feature Components (`components/features/`)

| Component | Lines | Props | Description |
|-----------|-------|-------|-------------|
| `TwibbonCreator` | 303 | none (reads WeddingContext) | Canvas photo frame (1080x1920), drag/pinch, share/download PNG |
| `RSVPModal` | 114 | isOpen, isSubmitSuccess, guestName, onClose, onSubmit | Form modal with success state |
| `FloatingController` | 106 | isToolsOpen, setIsToolsOpen, isPlaying, toggleMusic | Draggable nav + music toggle |

### Section Components (`components/sections/`)

| Component | Lines | Section ID | Description |
|-----------|-------|------------|-------------|
| `CinematicOpening` | 108 | — | Dark overlay, guest name, "Buka Undangan" (reads context) |
| `HeroSection` | 66 | — | Full-bleed portrait, names, date (reads context) |
| `CoupleSection` | 127 | `couple-section` | Overlapping blob portraits, parent info (reads context) |
| `CinematicStory` | 134 | `story-section` | 6 horizontal-scroll slides with likes/comments (reads context) |
| `EventSection` | 70 | `event-section` | Countdown, ceremonies loop, venue, map/calendar CTAs (reads context) |
| `TwibbonSection` | 7 | `twibbon-section` | Wraps TwibbonCreator |
| `RSVPSection` | 94 | `rsvp-section` | Paginated wish feed + RSVP FAB |
| `DigitalEnvelope` | 61 | `gift-section` | Bank/e-wallet accounts with copy (reads context) |
| `PhotoGallery` | 61 | — | Horizontal organic-shape gallery with auto-layout (reads context) |
| `Footer` | 75 | — | Credits loop, social links, copyright (reads context) |

---

## App State Management

**Data flow:** Firestore → `useWedding` / `useWishes` hooks → `App.tsx` → `WeddingContext.Provider` + props. Story section uses `useStoryLikes` / `useStoryComments` hooks directly in `CinematicStory.tsx`.

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

### Firestore Collections

| Collection | Document ID | Purpose |
|------------|-------------|---------|
| `weddings` | `dani-marini` | All wedding content (30+ fields, includes nested `theme` object) |
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
  groomPhoto: string; groomInstagram: string; groomLinkedin: string; groomWhatsapp: string;
  brideNickname: string; brideName: string; brideParents: string;
  bridePhoto: string; brideInstagram: string; brideThreads: string; brideWhatsapp: string;
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

**Dani:** [Instagram](https://instagram.com/danichusyaidin) · [LinkedIn](https://id.linkedin.com/in/daniansyahchusyaidin) · [WhatsApp](https://wa.me/6285790428078)

**Marini:** [Instagram](https://instagram.com/mariniw_) · [Threads](https://threads.com/@mariniw_) · [WhatsApp](https://wa.me/628883816403)

---

## Feature Details

### Firestore Integration
- **Wedding data:** One-time read via `useWedding(slug)` → `getDoc` from `weddings/{slug}`
- **Wishes:** Real-time listener via `useWishes(slug)` → `onSnapshot` on `wishes` collection
- **Write wishes:** `addWish(weddingId, data)` → `addDoc` with `serverTimestamp()`
- **Story likes:** One-time read + increment via `useStoryLikes(slug)` → `getDoc` + `runTransaction` on `story-likes/{slug}`
- **Story comments:** Real-time listener per slide via `useStoryComments(weddingId, slideIndex)` → `onSnapshot` on `story-comments` collection, `addComment()` via `addDoc`
- **Context:** `WeddingContext.Provider` wraps entire app, sections read via `useWeddingContext()`
- **Theme system:** `App.tsx` reads `wedding.theme` and overrides CSS custom properties at runtime (`--color-gold`, `--font-serif`, etc.), dynamically loads Google Fonts via injected `<link>` tag. Defaults defined in `src/constants/themeDefaults.ts`.
- **Loading gate:** App shows blank ivory screen until wedding data loads
- **Meta tags:** `document.title` and OG/Twitter meta updated dynamically after wedding loads
- **Seed script:** `scripts/seed-firestore.mjs` creates wedding doc, story-likes, and 20 wishes (idempotent)

### Guest Name Personalization
- Reads `?to=` query param on mount via `useEffect`
- Decoded with `decodeURIComponent()`
- Displayed in opening screen and as RSVP form placeholder
- Has `max-w-[85vw] break-words` for overflow protection
- Defaults to `wedding.defaultGuest` from Firestore if no URL param

### Music System
- Audio URL from `wedding.musicUrl` (Firestore)
- `<audio>` element with `loop` attribute
- Auto-plays on "Buka Undangan" click with `.catch()` fallback
- Toggle via floating controller menu
- Visual: pulsing aura, rotating ring, filled/unfilled heart icon

### RSVP & Wishes
- **Form:** Name (maxLength=50), Attendance (radio: Hadir/Absen), Message (maxLength=200)
- **Submit:** Writes to Firestore via `addWish()`, shows "Terima Kasih" success for 1.5s, then closes modal
- **Real-time:** New wishes appear immediately via Firestore `onSnapshot` listener
- **Pagination:** `useMemo` height-based calculation (~30 chars/line, 18px/line, 58px base)
- **Limit:** 50 most recent wishes

### Twibbon Creator
- Fixed 9:16 aspect ratio (1080x1920)
- Pre-rendered overlay from `wedding.twibbonOverlay` (Firestore)
- Drag (mouse + touch) and pinch-to-zoom
- Share via Web Share API with `navigator.canShare` check
- Download fallback as `Memori-{groom}-{bride}.png` (derived from Firestore)

### CinematicStory
- 6 horizontal-scroll slides from `wedding.story` (Firestore)
- Field: `slide.bgImage` for background images
- Active slide detection via `onScroll` + `scrollContainerRef`
- `AmbientSocialLayer` + `PetalEffect` only render on active slide
- Like/comment buttons hidden when comment form is open
- Mobile swipe hint ("Geser") + desktop scroll hint

### Digital Envelope
- Accounts from `wedding.giftAccounts` (Firestore)
- Copy-to-clipboard with `navigator.clipboard` + legacy `execCommand` fallback
- "Tersalin" success overlay with green checkmark
- Responsive: 2-col → 3-col (lg)

### Photo Gallery
- URLs from `wedding.gallery` (Firestore), layout from `getGalleryLayout(index)`
- Horizontal scroll with right-edge fade gradient
- Organic rounded shapes, `transform-gpu`, lazy loading
- Stagger delay capped at 300ms
- Click opens `PhotoZoomModal`

---

## Testing

**Framework:** Vitest 4.1.x + React Testing Library + jest-dom

**Setup:** `src/test/setup.ts` — mocks `IntersectionObserver`, `HTMLCanvasElement.getContext`, `HTMLMediaElement.play/pause`

**Test structure:** Co-located with source files (e.g., `App.tsx` → `App.test.tsx`)

**Stats:** 34 test files · 2,029 tests · 16,081 test LOC · 100% passing

| Category | Files | Tests |
|----------|-------|-------|
| types | 1 | ~100 |
| context | 1 | ~14 |
| lib | 1 | ~40 |
| utils | 5 | ~280 |
| hooks | 3 | ~130 |
| components/ui | 9 | ~450 |
| components/features | 3 | ~230 |
| components/sections | 10 | ~690 |
| App | 1 | ~95 |

**Test patterns:**
- **Firestore mocks:** `vi.mock('firebase/firestore')` + `vi.mock('../lib/firebase')` for hook tests
- **Context mocks:** `vi.mock('../../context/WeddingContext')` in all section/feature tests
- **Rendering:** no crash, correct structure, no duplicate elements
- **Visual integrity:** pointer-events-none, overflow-hidden, lazy loading, responsive classes, z-index
- **Animation safety:** transform-gpu, blur, overflow containment, prefers-reduced-motion
- **Logical behavior:** click handlers, form submission, pagination, copy feedback, timer ticks
- **Edge cases:** empty states, past dates, long strings, unicode, HTML injection, special characters
- **Accessibility:** aria-labels, label associations, noopener links
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

1. Create `src/components/sections/YourSection.tsx` (max 500 LOC)
2. Read wedding data via `const wedding = useWeddingContext()`
3. Create co-located `src/components/sections/YourSection.test.tsx` (min 300 LOC)
4. Add `vi.mock('../../context/WeddingContext')` in the test file
5. Import and add to `App.tsx` inside the `<main>` block
6. If navigable from floating controller, add to the tools array in `FloatingController.tsx`

### Adding a New UI Component

1. Create in `src/components/ui/` with props interface
2. Create co-located test file
3. Import where needed

### Modifying Wedding Data

All wedding content is stored in Firestore (`weddings/dani-marini`). To update:
1. Edit `scripts/seed-firestore.mjs` with new data
2. Delete the existing Firestore document
3. Re-run `node scripts/seed-firestore.mjs`

Or edit directly in the Firebase Console.

### Animation Presets (`src/utils/animations.ts`)

```ts
const transition = { duration: 1.8, ease: [0.16, 1, 0.3, 1] as const };
const stagger = { animate: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } };
const fadeUp = { initial: { opacity: 0, y: 20, filter: 'blur(10px)' }, animate: { ... } };
```

### Performance Considerations

- Opening background image is preloaded via `<link rel="preload">`
- Sections lazy-loaded via `React.lazy` + `Suspense`
- `AmbientSocialLayer` and `PetalEffect` only render on the active story slide
- `wishPages` pagination uses `useMemo`
- `formatDate` uses a cached `Intl.DateTimeFormat` instance
- `weddingDerived.ts` formatters are module-level singletons
- All below-fold images use `loading="lazy"`
- Fonts loaded locally (TTF in `public/fonts/`) with Google Fonts fallback
- Local textures (no external CDN dependencies)
- `prefers-reduced-motion` respected
- Firestore: `useWedding` is one-time `getDoc`; `useWishes` is `onSnapshot` with `limit(50)`

### File Size Limits

- **Source files:** max 500 LOC per file
- **Test files:** min 300 LOC, max 1500 LOC per file
- **Current largest source file:** `TwibbonCreator.tsx` at 303 lines
