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
- [Known Issues & Placeholders](#known-issues--placeholders)
- [Development Guide](#development-guide)

---

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type-check without emitting
npm run lint
```

The app runs at `http://localhost:3000`. Guest name personalization works via the `?to=` query param:

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
| Fonts        | Google Fonts + cdnfonts (Dayland)   | CDN      |

**Note:** `@google/genai` is in dependencies but not actively used in the app. It was inherited from the Google AI Studio origin.

---

## Project Structure

```
wedding-invitation/
├── index.html              # Entry HTML (title needs update)
├── package.json            # Dependencies & scripts
├── vite.config.ts          # Vite config (aliases, env, HMR)
├── tsconfig.json           # TypeScript config (ES2022, bundler)
├── metadata.json           # AI Studio metadata (origin info)
├── .env.example            # Environment variable template
├── DOCUMENTATION.md        # This file
│
├── public/                 # Static assets (served at /)
│   ├── bride_face_potrait.jpeg
│   ├── groom_face_potrait.jpeg
│   ├── bride_and_groom_full_body_potrait.jpeg
│   └── bride_and_groom_half_body_potrait.png
│
└── src/
    ├── main.tsx            # React entry point (StrictMode + createRoot)
    ├── App.tsx             # Entire application (~2300 lines)
    ├── index.css           # Tailwind v4 theme, custom utilities, keyframes
    └── types.ts            # TypeScript interfaces
```

### Vite Config Notes

```ts
// vite.config.ts
- Alias: "@" resolves to project root
- Env: GEMINI_API_KEY injected via process.env (not currently used)
- HMR: Can be disabled via DISABLE_HMR=true env var
- Dev server: port 3000, host 0.0.0.0
```

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
              │                                 │
              │  ┌─ BackgroundLayers (fixed)     │
              │  ├─ Audio element               │
              │  │                              │
              │  ├─ Cinematic Opening (z-1000)   │
              │  │  └─ LightGlow                │
              │  │  └─ FloatingPetals           │
              │  │  └─ ForegroundOrnaments      │
              │  │                              │
              │  └─ Main Content (when isOpen)   │
              │     ├─ Floating Controller      │
              │     ├─ Hero Section             │
              │     ├─ Couple Section           │
              │     ├─ CinematicStory           │
              │     │  ├─ AmbientSocialLayer    │
              │     │  └─ PetalEffect           │
              │     ├─ Event Section            │
              │     │  └─ CountdownTimer        │
              │     ├─ Twibbon Section          │
              │     │  └─ TwibbonCreator        │
              │     ├─ RSVP & Wishes Section    │
              │     ├─ RSVP Modal (z-200)       │
              │     ├─ Digital Envelope Section  │
              │     ├─ Photo Gallery Section    │
              │     ├─ Footer                   │
              │     └─ Photo Zoom Modal (z-2000)│
              └─────────────────────────────────┘
```

**Key architectural decisions:**
- **Single-file app** — all components live in `App.tsx`. No routing.
- **No backend** — wishes/RSVP are client-side state only. No persistence across sessions.
- **Cinematic gate** — the app renders a full-screen opening overlay. Main content is only mounted after user clicks "Buka Undangan".
- **Music auto-play** — triggered on "Buka Undangan" click to comply with browser autoplay policies.

---

## Design System

### Colors (defined in `src/index.css` via `@theme`)

| Token         | Hex       | Usage                                |
| ------------- | --------- | ------------------------------------ |
| `gold`        | `#B48D3E` | Accent, labels, borders, CTAs        |
| `ivory`       | `#FDFCF8` | Primary background                   |
| `paper`       | `#F5F2ED` | Secondary background (gallery, etc)  |
| `ink`         | `#1A1A1A` | Primary text, dark overlays          |
| `sepia`       | `#FAF7F2` | Warm tint background                 |
| `rose-pastel` | `#F8BBD0` | Accent (hearts, social, buttons)     |

### Fonts

| Token          | Family              | Usage                                |
| -------------- | ------------------- | ------------------------------------ |
| `font-serif`   | Cormorant Garamond  | Body text, headings, wish messages   |
| `font-sans`    | Montserrat           | Labels, tracking-heavy micro text    |
| `font-display` | Playfair Display     | Event date, decorative headings      |
| `font-cursive` | Great Vibes          | (Available, sparingly used)          |
| `font-signature`| Pinyon Script       | (Available, not currently used)      |
| `font-dayland` | Dayland              | Couple names — hero & opening        |

### Typography Patterns

```
Section Headers:   font-serif text-[15px] italic tracking-[0.4em] text-gold uppercase
Micro Labels:      font-sans text-[8-10px] tracking-[0.2-0.6em] uppercase text-gold font-black
Body Copy:         font-serif italic text-sm text-ink/60-90
Names (Hero):      font-dayland text-7xl md:text-[8rem]
```

### Visual Effects

| Effect              | Implementation                                           |
| ------------------- | -------------------------------------------------------- |
| Film Grain          | Fixed overlay with `animate-grain` keyframes + PNG texture |
| Floating Petals     | Motion-animated divs with randomized paths               |
| Light Sweep         | CSS gradient animation (`animate-light-sweep`)           |
| Organic Blobs       | Animated `border-radius` with Motion                     |
| Glassmorphism       | `backdrop-blur-md/xl/2xl` + `bg-white/5-60` + border    |
| Shadow Drift        | CSS keyframe animation on blurred background elements    |
| Slow Pan            | CSS keyframe for subtle background zoom                  |

### Custom CSS Utilities (index.css)

| Utility               | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| `.mask-arch`           | SVG arch-shaped mask for images           |
| `.mask-organic`        | Blob-shaped SVG mask                      |
| `.text-shadow-sm`      | Subtle text shadow                        |
| `.text-glow-gold`      | Gold glow text shadow                     |
| `.bg-noise`            | SVG noise texture background              |
| `.text-title-layered`  | Tight leading + tracking for titles       |
| `.no-scrollbar`        | Hide scrollbar (webkit + firefox)         |
| `.scroll-snap-container`| Horizontal scroll snap                   |
| `.perspective-1000`    | 3D perspective                            |
| `.backface-hidden`     | Hide backface for 3D transforms           |
| `.vertical-rl`         | Vertical right-to-left writing mode       |

---

## Component Reference

### `BackgroundLayers`
**Location:** `App.tsx:126-142` | **Position:** Fixed, z-0 to z-9999

Global ambient effects that persist across all sections:
- Film grain overlay (z-9999, very low opacity)
- Floral shadow blobs (mix-blend-multiply)
- Light sweep gradient animation

### `LightGlow`
**Location:** `App.tsx:56-70` | **Used in:** Opening, Hero

Animated gold radial glow that slowly moves and pulses. Uses `mix-blend-soft-light`.

### `FloatingPetals`
**Location:** `App.tsx:93-124` | **Used in:** Opening, Hero

8 animated petal elements that float down the screen with randomized paths, rotation, and skew.

### `ForegroundOrnaments`
**Location:** `App.tsx:72-91` | **Used in:** Opening, Hero

Two large blurred shapes that gently float to add depth.

### `CountdownTimer`
**Location:** `App.tsx:144-224`

Counts down to `2026-08-29T09:00:00`. Each time unit (`TimeBox`) has:
- Animated number swap (AnimatePresence)
- Gentle vertical float animation
- Gold aura pulse behind digits
- Labels in Indonesian: Hari, Jam, Menit, Detik

### `TwibbonCreator`
**Location:** `App.tsx:229-773`

Canvas-based photo frame tool with these internals:
- **Canvas size:** 1080x1920 (9:16 portrait)
- **Frame layout:** Arch-shaped photo window with floral border
- **Interaction:** Drag to pan, pinch to zoom (touch + mouse)
- **Overlay:** Procedurally drawn flowers (10 color themes, 6 shape types), arch frame, vines, gold dust
- **Text on frame:** "attendance the wedding of", "Dani & Marini", "surabaya 29 agustus 2026"
- **Export:** Downloads as `Memori-Dani-Marini.png`
- **Performance:** Uses refs for transform state (no re-renders during drag), `requestAnimationFrame`, `translate3d` for GPU acceleration

Key refs:
```
transformRef    — { x, y, zoom } for image position
containerRef    — preview container div
imgElementRef   — displayed image element
overlayCanvasRef — visible overlay canvas
exportCanvasRef — (declared but unused)
fileInputRef    — hidden file input
```

### `AmbientSocialLayer`
**Location:** `App.tsx:777-887`

Instagram-Live-style floating reactions:
- Auto-spawns hearts and comment bubbles every 4 seconds
- Accepts `triggerHeartTap` (number) to burst a heart on tap
- Accepts `triggerCommentTap` (object) to show instant comment
- Max 20 elements in state at once
- Comments from a pool of defaults + user-submitted ones

### `PetalEffect`
**Location:** `App.tsx:889-918`

15 tiny floating particles (simpler than `FloatingPetals`). Used inside `CinematicStory` slides.

### `CinematicStory`
**Location:** `App.tsx:920-1131`

Horizontal-scroll story section with 6 slides:

| Index | Year          | Background Image                         |
| ----- | ------------- | ---------------------------------------- |
| 0     | 2016 — 2017   | bride_face_potrait.jpeg                  |
| 1     | 2018 — 2022   | groom_face_potrait.jpeg                  |
| 2     | 2023          | bride_and_groom_half_body_potrait.png    |
| 3     | 2024 — 2025   | bride_and_groom_full_body_potrait.jpeg   |
| 4     | 2026          | ivory_texture.jpg **(MISSING)**          |
| 5     | Ikrar         | bride_and_groom_full_body_potrait.jpeg   |

Each slide has:
- Background image (grayscale, hover reveals color)
- Gradient overlays (dark)
- AmbientSocialLayer + PetalEffect
- Like button (heart + count, starts at random 120-170)
- Comment button (opens inline form with name + message)
- Year label + poetic Indonesian text
- Dot pagination indicator
- Scroll hint on first slide (desktop only)

**State:** `storyStats` — per-slide likes count and comments array.

### `App` (default export)
**Location:** `App.tsx:1133-2299`

Main orchestrator component. See [App State Management](#app-state-management) and [Section Map](#section-map).

---

## App State Management

All state lives in the `App` component via `useState`:

| State              | Type                    | Default                        | Purpose                        |
| ------------------ | ----------------------- | ------------------------------ | ------------------------------ |
| `isOpen`           | `boolean`               | `false`                        | Gate between opening & content |
| `wishes`           | `GuestWishes[]`         | 20 seed items                  | RSVP/wishes feed data          |
| `guestName`        | `string`                | `"Tamu Terkasih Kami"`         | From `?to=` URL param          |
| `isPlaying`        | `boolean`               | `false`                        | Music playback state           |
| `isRSVPModalOpen`  | `boolean`               | `false`                        | RSVP form modal visibility     |
| `isToolsOpen`      | `boolean`               | `false`                        | Floating tools menu visibility |
| `selectedPhoto`    | `string \| null`        | `null`                         | Gallery zoom modal image src   |
| `currentPage`      | `number`                | `1`                            | Wishes pagination              |
| `copiedIndex`      | `number \| null`        | `null`                         | Copy feedback for envelopes    |

**Refs:**
- `audioRef` — `<audio>` element for background music

**Derived state:**
- `wishPages` — dynamically paginated based on estimated card heights (available height: 630px)
- `currentWishes` — current page slice of wishes
- `totalPages` — total wish pages
- `scrollYProgress` / `smoothProgress` — scroll-linked values from Motion (declared but not visibly used in render)

---

## Section Map

Sections render in this order after `isOpen === true`:

| #  | Section            | HTML id             | z-index | Background |
| -- | ------------------ | ------------------- | ------- | ---------- |
| 0  | Floating Controller| —                   | 100     | —          |
| 1  | Hero               | —                   | 10      | ivory      |
| 2  | Couple             | `couple-section`    | —       | ivory      |
| 3  | Story              | `story-section`     | —       | ink (dark) |
| 4  | Event              | `event-section`*    | 10      | ivory      |
| 5  | Twibbon            | `twibbon-section`   | 10      | ivory      |
| 6  | RSVP & Wishes      | `rsvp-section`      | 10      | ivory/50   |
| 7  | RSVP Modal         | —                   | 200     | overlay    |
| 8  | Digital Envelope   | `gift-section`      | 10      | ivory      |
| 9  | Photo Gallery      | —                   | 10      | paper      |
| 10 | Footer             | —                   | 10      | ivory      |
| 11 | Photo Zoom Modal   | —                   | 2000    | overlay    |

*Note: The Event section doesn't have `id="event-section"` in the HTML but the floating controller links to it. This is a bug — the section needs the id attribute.

---

## Data & Content Reference

### TypeScript Interfaces (`src/types.ts`)

```ts
interface GuestWishes {
  id: string;
  name: string;
  message: string;
  attendance: 'yes' | 'no';
  count: number;        // Guest count (collected in form but not displayed)
  createdAt: number;    // Timestamp
}

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}
// Note: TimelineEvent is defined but NOT used. CinematicStory uses inline slide data.
```

### Wedding Details

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

### Digital Envelope Accounts

| Bank    | Account Number  | Account Name        | Status      |
| ------- | --------------- | ------------------- | ----------- |
| BCA     | 1234567890      | M. Daniansyah C.    | Placeholder |
| BRI     | 0987654321      | Siti Nur Marini     | Placeholder |
| Mandiri | 111222333444    | M. Daniansyah C.    | Placeholder |
| BSI     | 777888999000    | Siti Nur M.         | Placeholder |
| Gopay   | 08123456789     | Daniansyah          | Placeholder |
| DANA    | 08987654321     | Siti Nur             | Placeholder |

---

## Feature Details

### Guest Name Personalization
- Reads `?to=` query param on mount via `useEffect`
- Decoded with `decodeURIComponent()`
- Displayed in opening screen ("Turut Mengundang" section) and as RSVP form placeholder
- Defaults to "Tamu Terkasih Kami" if not provided

### Music System
- Uses `<audio>` element with `loop` attribute
- Source: SoundHelix placeholder MP3 (needs replacement)
- Auto-plays on "Buka Undangan" click (catches and handles autoplay rejection)
- Toggle via floating controller menu
- Visual feedback: pulsing aura, rotating ring, filled/unfilled heart icon

### RSVP & Wishes
- **Form fields:** Name (text), Attendance (radio: yes/no), Count (number, hidden default 1), Message (textarea)
- **Submit:** Prepends to `wishes` array, resets to page 1, closes modal
- **Pagination:** Dynamic height-based calculation (~30 chars/line, 17px/line, 52px base per card, 630px available height)
- **Display:** 2-column grid on desktop, 1-column on mobile. Shows name, attendance badge, date, quoted message.
- **No persistence** — all data lost on page refresh

### Twibbon Creator
- Fixed 9:16 aspect ratio (1080x1920)
- Arch-shaped photo window with procedurally drawn floral frame
- Supports drag (mouse + touch) and pinch-to-zoom
- Overlay includes: warm sand background, feathered arch mask, floral arrangements (6 flower types, 10 color themes), vine borders, atmospheric effects, typography, gold dust particles
- Download produces full-resolution PNG
- Click inside arch area to upload when no image loaded

### CinematicStory (Love Timeline)
- Horizontal scroll with `snap-x snap-mandatory`
- 6 chapters from first meeting (2016) to wedding vow (Ikrar)
- Each slide has independent like count and comments
- AmbientSocialLayer shows floating hearts/comments per slide
- Background images start grayscale, reveal color on hover (3s transition)

### Photo Gallery
- Horizontal scrollable grid (2 rows)
- Organic rounded corners (different per image)
- Hover: scale up, dark overlay with camera icon
- Click: opens full-screen zoom modal (z-2000)
- Uses 4 source images repeated in 12 grid slots

### Floating Controller
- Draggable (Motion `drag` prop)
- Fixed position: bottom-right
- Toggle reveals: Twibbon, Konfirmasi, Digital Gift, Info Acara links + Music control
- Each link scrolls to target section with `scrollIntoView({ behavior: 'smooth' })`
- Visual states: music playing (pulsing aura, spinning ring, filled heart) vs paused

---

## Known Issues & Placeholders

### Bugs
| Issue | Location | Details |
| ----- | -------- | ------- |
| Missing section id | Event section (~line 1694) | `id="event-section"` is missing — floating controller can't scroll to it |
| Missing asset | CinematicStory slide 4 | References `/ivory_texture.jpg` which doesn't exist in `/public` |
| Wrong page title | `index.html` | Title is "My Google AI Studio App" instead of wedding-related |
| Unused export canvas ref | TwibbonCreator (~line 238) | `exportCanvasRef` is declared but never used |
| Unused interface | `types.ts` | `TimelineEvent` is exported but never imported/used |
| Unused scroll values | App (~line 1198) | `scrollYProgress` and `smoothProgress` are computed but not used in render |

### Placeholders Requiring Real Data
| Item | Current Value | Location |
| ---- | ------------- | -------- |
| Bank accounts | Fake numbers (1234567890, etc) | Digital Envelope section |
| Google Maps link | `https://maps.app.goo.gl/YourMapLink` | Event section |
| Music audio | SoundHelix placeholder MP3 | `<audio>` element |
| Social media links | `#` | Footer |
| Instagram/Twitter/Facebook URLs | `#` | Footer |

### Missing Features (Potential)
- No data persistence (wishes, RSVP responses)
- No analytics or visitor tracking
- No WhatsApp share button
- No image lazy loading / optimization
- No SEO meta tags or Open Graph
- No offline support / PWA
- No loading states for images
- No accessibility features (aria labels, keyboard nav, reduced motion)
- Guest count field collected but never displayed

---

## Development Guide

### Adding a New Section

1. Create the section JSX inside the `{isOpen && <main>}` block in `App.tsx`
2. Follow the existing pattern:
```tsx
<section id="your-section" className="relative py-6 bg-ivory overflow-hidden">
  <div className="container mx-auto px-6 max-w-4xl relative z-10">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-10"
    >
      {/* Section header */}
      <div className="flex justify-center items-center gap-4 mb-3">
        <div className="h-px w-8 bg-gold/30" />
        <YourIcon className="w-5 h-5 text-gold/60" />
        <div className="h-px w-8 bg-gold/30" />
      </div>
      <p className="font-serif text-[15px] italic tracking-[0.4em] text-gold uppercase">
        Section Title
      </p>
    </motion.div>
    {/* Section content */}
  </div>
</section>
```
3. If the section should be reachable from the floating controller, add it to the tools array (~line 1414):
```tsx
{ id: 'your-section', label: 'Label', icon: YourIcon },
```

### Adding a New Component

Since everything is in `App.tsx`, add new components above the `App` default export. Follow these conventions:
- Use Motion for all entrance animations (`initial`, `whileInView`, `viewport: { once: true }`)
- Use the shared `transition`, `stagger`, and `fadeUp` animation presets
- Use Tailwind classes from the design system (gold, ivory, ink, etc.)
- Keep micro-text labels: `text-[8-10px] uppercase tracking-[0.2-0.6em] font-black`

### Animation Presets (available in App.tsx)

```tsx
// Smooth entrance (1.8s)
const transition = { duration: 1.8, ease: [0.16, 1, 0.3, 1] };

// Stagger children
const stagger = {
  animate: {
    transition: { staggerChildren: 0.1, delayChildren: 0.3 }
  }
};

// Fade up with blur
const fadeUp = {
  initial: { opacity: 0, y: 20, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition }
};
```

### Modifying the Twibbon Frame

The twibbon overlay is drawn procedurally in the `drawOverlay` function (~line 260). Key areas:
- **Frame geometry:** `FRAME_MARGIN`, `FRAME_TOP`, `FRAME_BOTTOM` constants
- **Arch path:** `archPath()` helper function
- **Flower rendering:** `drawArtisticFlower()` with 6 shape types and 10 color themes
- **Typography:** Lines 480-528 (canvas text drawing)
- **Export:** `handleDownload()` redraws overlay on a fresh canvas with the user image

### Connecting a Backend (Future)

The app currently has no backend. To add persistence:

1. **Wishes/RSVP** — Replace the `wishes` state with API calls:
   - `GET /api/wishes` on mount
   - `POST /api/wishes` in `handleRSVPSubmit`

2. **Guest list** — Could validate `?to=` param against a guest database

3. **Analytics** — Track invitation opens, RSVP responses, section views

4. **Suggested stack:** Supabase, Firebase, or a simple Express + SQLite backend

### Performance Considerations

- `BackgroundLayers` and ambient animations run continuously — test on low-end devices
- `TwibbonCreator` uses `requestAnimationFrame` and refs to avoid re-renders during drag
- `AmbientSocialLayer` caps elements at 20 to prevent memory growth
- Gallery images are the same 4 files repeated — no additional network cost
- Consider `loading="lazy"` on images below the fold
- Consider `prefers-reduced-motion` media query for accessibility

### Z-Index Map

```
9999  — Film grain overlay (BackgroundLayers)
2000  — Photo zoom modal
1000  — Cinematic opening overlay
 200  — RSVP modal
 100  — Floating controller
  60  — Story interaction buttons
  70  — Story comment input
  50  — Instant social elements
  30  — Story text content
  20  — Foreground ornaments / ambient social
  10  — Section content, floating petals
   5  — Light glow
   0  — Background layers
```
