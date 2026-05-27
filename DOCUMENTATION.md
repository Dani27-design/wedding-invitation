# Marinikah — Wedding Invitation Platform

> A premium digital wedding invitation platform with admin panel for managing content.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Design System](#design-system)
- [Component Reference](#component-reference)
- [Admin Panel](#admin-panel)
- [Data Model](#data-model)
- [App State Management](#app-state-management)
- [Section Map](#section-map)
- [Feature Details](#feature-details)
- [Testing](#testing)
- [Development Guide](#development-guide)

---

## Getting Started

```bash
npm install
npm run dev          # Next.js dev server at http://localhost:3000
npm run build        # Next.js production build
npm run start        # Start production server
npm run typecheck    # TypeScript type checking
npm run test         # Run all tests (vitest)
```

**Firestore seed (one-time):**
```bash
node scripts/seed-firestore.mjs
```

**Guest name personalization via `?to=` query parameter:**
```
http://localhost:3000/dani-marini?to=Budi%20Santoso
```

---

## Tech Stack

| Layer        | Technology                              | Version  |
| ------------ | --------------------------------------- | -------- |
| Framework    | Next.js App Router + React + TypeScript | 16.x / 19.x |
| Rendering    | SSR + ISR (5-min revalidation)          | —        |
| Styling      | Tailwind CSS (v4, `@theme` syntax)      | 4.x      |
| Animations   | Motion (framer-motion)                  | 12.x     |
| Icons        | Lucide React                            | 0.546.x  |
| Backend      | Firebase (Firestore, Auth, Storage)     | 12.x     |
| Server Data  | Firebase Admin SDK                      | 13.x     |
| Images       | next/image (AVIF/WebP, auto srcset)     | —        |
| Fonts        | next/font (self-hosted, zero CLS)       | —        |
| SEO          | generateMetadata + JSON-LD + robots.ts + sitemap.ts | — |
| Testing      | Vitest + React Testing Library          | 4.x      |

---

## Project Structure

```
wedding-invitation/
├── next.config.ts
├── postcss.config.mjs
├── vitest.config.ts
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── DOCUMENTATION.md
│
├── functions/
│   └── src/index.ts                   # Firebase Cloud Function
│
├── scripts/
│   ├── seed-firestore.mjs             # Firestore seed script
│   ├── generate-overlay.mjs           # Twibbon overlay generator
│   └── generate-overlay.html          # Twibbon overlay preview
│
├── public/
│   ├── fonts/                         # Dayland, Cormorant Garamond, Playfair Display
│   ├── images/                        # Couple photos, admin landing images, logo, iPhone frame
│   ├── musics/                        # Background music
│   └── textures/                      # Film grain, stardust
│
└── src/
    ├── app/
    │   ├── layout.tsx                 # Root layout (fonts, providers)
    │   ├── page.tsx                   # Company profile landing page
    │   ├── providers.tsx              # MotionConfig + ErrorBoundary
    │   ├── fonts.ts                   # next/font declarations
    │   ├── globals.css                # Tailwind theme, animations, utilities
    │   ├── robots.ts                  # robots.txt generation
    │   ├── sitemap.ts                 # sitemap.xml from Firestore
    │   ├── login/page.tsx             # Auth login
    │   ├── register/page.tsx          # Auth register
    │   ├── [slug]/
    │   │   ├── page.tsx               # Wedding page (SSR + ISR + metadata + JSON-LD)
    │   │   ├── wedding-client.tsx     # Client orchestrator (state + sections + audio)
    │   │   └── not-found.tsx          # 404 page
    │   └── admin/
    │       ├── page.tsx               # Super admin dashboard
    │       └── [slug]/
    │           ├── page.tsx           # Admin panel (14 tabs)
    │           └── guests/page.tsx    # Standalone guest list page
    │
    ├── components/
    │   ├── ui/                        # Reusable UI primitives (13 files)
    │   ├── features/                  # Complex interactive components (3 files)
    │   ├── sections/                  # Wedding page sections (10 files)
    │   └── admin/                     # Admin forms & modals (19 files)
    │
    ├── hooks/                         # Custom hooks (useCountdown, useWedding, useWishes, etc.)
    ├── lib/                           # Firebase config, storage, guests, wishes, revalidation
    ├── types/                         # TypeScript interfaces (firestore.ts, index.ts)
    ├── constants/                     # Theme defaults, credit icons, base URL
    ├── utils/                         # Animations, formatting, gallery layout, compression, QR
    ├── context/                       # WeddingContext provider
    └── test/setup.ts                  # Vitest setup (mocks)
```

**Code stats:** 100 source files · 42 test files · 2,119 tests

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                Next.js App Router (src/app/)                  │
│                                                               │
│  layout.tsx → <html lang="id"> + Providers                    │
│    ├─ MotionConfig reducedMotion="user"                       │
│    └─ ErrorBoundary                                           │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  /[slug]/page.tsx (SERVER)                             │   │
│  │  • ISR revalidate=300 (5 min)                          │   │
│  │  • generateMetadata (title, OG, Twitter, canonical)    │   │
│  │  • Firebase Admin SDK → Firestore getDoc               │   │
│  │  • Inline <style> for theme CSS variables              │   │
│  │  • JSON-LD structured data (schema.org/Event)          │   │
│  └──────────────────────┬────────────────────────────────┘   │
│                          │                                     │
│  ┌──────────────────────┴────────────────────────────────┐   │
│  │  wedding-client.tsx (CLIENT)                           │   │
│  │  ├─ useWishes(slug) → Firestore real-time              │   │
│  │  ├─ useSearchParams → ?to= guest name                  │   │
│  │  └─ WeddingContext.Provider                            │   │
│  │     ├─ CinematicOpening → HeroSection → CoupleSection  │   │
│  │     ├─ CinematicStory → EventSection → TwibbonSection  │   │
│  │     ├─ RSVPSection → DigitalEnvelope → PhotoGallery    │   │
│  │     └─ Footer + FloatingController + Modals            │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  /admin/[slug]/page.tsx (CLIENT — auth + 14 tabs)             │
│  /admin/page.tsx (CLIENT — super admin dashboard)             │
│  / (SERVER — company profile landing page)                    │
└──────────────────────────────────────────────────────────────┘
```

**Key architectural decisions:**
- **Next.js App Router** — file-system routing with SSR + ISR for wedding pages
- **Firebase SDK split** — `firebase.ts` (Firestore only), `firebase-auth.ts` and `firebase-storage.ts` lazy-loaded for admin
- **WeddingContext** — React context provides wedding data to all invitation sections
- **Theme system** — CSS variables injected server-side, custom Google Fonts loaded dynamically, XSS protected
- **ISR** — on-demand revalidation via server action after admin saves
- **Image optimization** — `next/image` with AVIF/WebP, priority for LCP images
- **Font optimization** — `next/font` self-hosts fonts, zero CLS
- **Sections lazy-loaded** via `React.lazy` + `Suspense`
- **Co-located tests** — `*.test.tsx` siblings for each component

---

## Design System

### Colors (defined in `globals.css` via `@theme`, overridable via Firestore `theme.colors`)

| Token         | Hex       | Theme field | Usage                                |
| ------------- | --------- | ----------- | ------------------------------------ |
| `gold`        | `#B48D3E` | `accent`    | Accent, labels, borders, CTAs        |
| `ivory`       | `#FDFCF8` | `background`| Primary background                   |
| `paper`       | `#F5F2ED` | `surface`   | Secondary background                 |
| `ink`         | `#1A1A1A` | `text`      | Primary text, dark overlays          |
| `sepia`       | `#FAF7F2` | `surface`   | Warm tint background                 |
| `rose-pastel` | `#F8BBD0` | `button`    | Accent (hearts, social, buttons)     |

### Fonts (overridable via Firestore `theme.fonts`)

| Token          | Family              | Theme field   | Usage                                |
| -------------- | ------------------- | ------------- | ------------------------------------ |
| `font-serif`   | Cormorant Garamond  | `heading`     | Body text, headings (invitation only)|
| `font-sans`    | Montserrat          | `body`        | Labels, micro text                   |
| `font-display` | Playfair Display    | `decorative`  | Event date, decorative headings      |
| `font-dayland` | Dayland             | `script`      | Couple names — hero & opening        |

### CSS Utilities (globals.css)

| Utility                  | Purpose                            |
| ------------------------ | ---------------------------------- |
| `.no-scrollbar`          | Hide scrollbar (webkit + firefox)  |
| `.scroll-snap-container` | Horizontal scroll snap             |
| `.h-screen-safe`         | `100svh` (small viewport height)   |
| `.min-h-screen-safe`     | `min-height: 100svh`              |

### Accessibility
- `<MotionConfig reducedMotion="user">` + `@media (prefers-reduced-motion)`
- `aria-label` on all icon-only buttons
- `htmlFor`/`id` on form labels
- Focus traps on modals via `useFocusTrap`
- `role="tablist"`/`role="tab"`/`role="tabpanel"` on admin navigation
- `lang="id"` on HTML root
- `rel="noopener noreferrer"` on all external links

---

## Component Reference

### UI Components (`components/ui/`)

| Component | Description |
|-----------|-------------|
| `CountdownTimer` | 4 time boxes (Hari/Jam/Menit/Detik) |
| `PhotoZoomModal` | Full-screen image viewer with focus trap |
| `ErrorBoundary` | Class component error boundary |
| `AmbientSocialLayer` | Instagram-style floating hearts/comments |
| `LightGlow` | Animated gold glow overlay |
| `FloatingPetals` | 8 animated falling petals |
| `BackgroundLayers` | Film grain + shadows + light sweep |
| `PetalEffect` | 15 subtle floating particles |
| `ForegroundOrnaments` | Floating blur shapes |
| `SectionErrorBoundary` | Section-level error handler |
| `ConsultationForm` | WhatsApp consultation form (landing page) |
| `GalleryShowcase` | Gallery display with phone frame (landing page) |
| `TestimonialSection` | Testimonial cards with overlapping couple photos |

### Feature Components (`components/features/`)

| Component | Description |
|-----------|-------------|
| `TwibbonCreator` | Canvas photo frame (1080x1920), drag/pinch, share/download |
| `RSVPModal` | RSVP form modal with focus trap |
| `FloatingController` | Draggable nav + music toggle |

### Section Components (`components/sections/`)

| Component | Section ID | Description |
|-----------|------------|-------------|
| `CinematicOpening` | — | Dark overlay with scroll/swipe/keyboard open |
| `HeroSection` | — | Full-bleed portrait with names |
| `CoupleSection` | `couple-section` | Overlapping blob portraits + parent info |
| `CinematicStory` | `story-section` | Horizontal scroll love timeline |
| `EventSection` | `event-section` | Countdown + ceremonies + venue |
| `TwibbonSection` | `twibbon-section` | Wraps TwibbonCreator |
| `RSVPSection` | `rsvp-section` | Paginated wish feed + FAB |
| `DigitalEnvelope` | `gift-section` | Bank/e-wallet accounts with copy |
| `PhotoGallery` | — | Horizontal organic-shape gallery |
| `Footer` | — | Credits + social links + copyright |

---

## Admin Panel

### Tab Order (14 tabs)

| # | Tab | Component | Type | Description |
|---|-----|-----------|------|-------------|
| 0 | Pasangan | `CoupleForm` | Form | Couple info, photos, social links |
| 1 | Acara | `EventForm` | Form | Date, venue, ceremonies |
| 2 | Media | `MediaForm` | Form | Music, hero/opening images, twibbon, quotes |
| 3 | Cerita | `StoryForm` | Form | Story slides (year, text, photo, video) |
| 4 | Galeri | `GalleryForm` | Form | Photo gallery with reorder |
| 5 | Hadiah | `GiftForm` | Form | Bank/e-wallet accounts |
| 6 | Kredit | `CreditForm` | Form | Vendor credits |
| 7 | Tema | `CustomizeForm` | Form | Color palette, fonts, live preview |
| 8 | Pesan | `GuestTab` | Form | Greeting template, default guest name |
| 9 | Preview | (inline) | View | Phone frame iframe preview |
| 10 | Tamu | `GuestListTab` | Management | Guest CRUD, search, filter, import/export, QR, WhatsApp |
| 11 | Interaksi | `StoryInteractionsForm` | Monitor | Story likes/comments |
| 12 | Ucapan | `WishesForm` | Monitor | Wishes/RSVP management |
| 13 | Testimoni | `TestimonialForm` | Monitor | Couple testimonial |

**`totalEditable = 9`** — tabs 0-8 have save button + progress bar + auto-advance on save.

### Admin UI Standard (Google Form style)

- **Card layout:** `bg-white rounded-2xl border border-gold/10 shadow-sm` with `border-l-4 border-gold` header
- **Header text:** `font-base text-[13px] text-ink` (description only, no title label)
- **Field labels:** `text-[11px] text-ink/80 font-medium block mb-1.5`
- **Input class:** `w-full px-3 py-2.5 border border-gold/20 rounded-xl text-sm bg-white focus:outline-none focus:border-gold/50 transition-colors`
- **Typography:** `font-base` only (no `font-serif` in admin), minimum `text-ink/70`
- **Progress bar:** color-coded (red→orange→yellow→green), shows "X dari Y"
- **Save button:** "Simpan & Lanjutkan", auto-advances to next tab on success

### Admin Features
- **Auth:** Firebase Auth with role-based access (`super` admin + `adminIds`)
- **Save flow:** Form → compress images → upload to Storage → update Firestore → cleanup old files → revalidate ISR → auto-advance tab
- **Unsaved changes:** Warning modal on tab switch
- **Save status modal:** Animated saving/success/error states
- **Scroll to top:** Smooth scroll on tab change
- **Guest management:** Search, filter (Semua/Pria/Wanita with counts), pagination with page size selector (5-100), import CSV/Excel with template download, export XLSX, QR code generation, bulk print, WhatsApp integration

### Admin Support Components

| Component | Description |
|-----------|-------------|
| `GuestListTab` | Full guest management (reused in admin tab + standalone page) |
| `GuestImportModal` | CSV/Excel import with template download |
| `GuestQRCard` | Individual QR code card with floral design |
| `GuestQRModal` | Single guest QR code modal |
| `GuestQRPrintView` | Bulk QR print (3×4 grid per A4 page) |
| `ConfirmDeleteModal` | Reusable confirmation dialog |
| `CompressionModal` | Image compression progress dialog |

---

## Data Model

### Firestore Collections

| Collection | Document ID | Purpose |
|------------|-------------|---------|
| `users` | Firebase Auth UID | User accounts (role: pending/customer/super) |
| `weddings` | slug (e.g. `dani-marini`) | All wedding content |
| `weddings/{slug}/guests` | auto-generated | Guest sub-collection |
| `wishes` | auto-generated | Guest wishes/RSVP |
| `story-likes` | slug | Story slide like counts |
| `story-comments` | auto-generated | Guest comments on story slides |
| `testimonials` | auto-generated | Couple testimonials |

### TypeScript Interfaces

```typescript
interface UserDocument {
  uid: string; email: string; displayName: string;
  role: 'pending' | 'customer' | 'super';
  provider: 'email' | 'google';
  assignedWeddingSlug: string | null;
  createdAt: Timestamp;
}

interface WeddingDocument {
  adminIds: string[]; status: 'draft' | 'published' | 'archived';
  groomNickname: string; groomName: string; groomParents: string;
  groomPhoto: string; groomSocialLinks: { label: string; url: string }[];
  brideNickname: string; brideName: string; brideParents: string;
  bridePhoto: string; brideSocialLinks: { label: string; url: string }[];
  defaultGuest: string; greetingTemplate: string;
  eventDate: string; eventCity: string;
  venueName: string; venueAddress: string; venueMapsUrl: string;
  ceremonies: Ceremony[];
  story: StorySlide[]; gallery: string[]; giftAccounts: BankAccount[];
  musicUrl: string; twibbonOverlay: string; heroImage: string; openingImage: string;
  quranArabic: string; quranTranslation: string; quranReference: string;
  theme: WeddingTheme; credits: CreditPerson[];
  createdAt: Timestamp; updatedAt: Timestamp;
}

interface Guest {
  id: string; name: string; phone: string; address: string;
  category: 'pria' | 'wanita';
  attendance: boolean; attendanceAt: Timestamp | null;
  createdAt: Timestamp;
}

interface TestimonialDocument {
  weddingSlug: string; rating: number; message: string; createdAt: Timestamp;
}
```

### Firestore Security Rules
- `users` — self-read + super admin CRUD
- `weddings` — public read, admin update (content fields only), super admin full access
- `guests` — admin + super admin read/write
- `wishes` — public read/create (validated), admin delete
- `story-likes` — public read/update, super admin create/delete
- `story-comments` — public read/create (validated), admin delete
- `testimonials` — public read, authenticated create (validated), super admin delete

---

## App State Management

**Data flow:** Firestore → hooks → WeddingContext.Provider → section components

| State              | Type                    | Source                          | Purpose                        |
| ------------------ | ----------------------- | ------------------------------- | ------------------------------ |
| `wedding`          | `WeddingDocument\|null` | `useWedding(slug)`              | All wedding content            |
| `wishes`           | `GuestWishes[]`         | `useWishes(slug)` (real-time)   | RSVP/wishes feed               |
| `isOpen`           | `boolean`               | `useState(false)`               | Opening → content gate         |
| `guestName`        | `string`                | URL `?to=` or `defaultGuest`    | Guest name display             |
| `isPlaying`        | `boolean`               | `useState(false)`               | Music playback state           |

---

## Section Map

Sections render after `isOpen === true`:

| #  | Section            | HTML id             | Background |
| -- | ------------------ | ------------------- | ---------- |
| 0  | Floating Controller| —                   | —          |
| 1  | Hero               | —                   | ivory      |
| 2  | Couple             | `couple-section`    | ivory      |
| 3  | Story              | `story-section`     | ink (dark) |
| 4  | Event              | `event-section`     | paper      |
| 5  | Twibbon            | `twibbon-section`   | ivory      |
| 6  | RSVP & Wishes      | `rsvp-section`      | paper      |
| 7  | Digital Envelope   | `gift-section`      | ivory      |
| 8  | Photo Gallery      | —                   | paper      |
| 9  | Footer             | —                   | ivory      |

---

## Feature Details

### Guest Name Personalization
- `?to=` query param → displayed in opening screen and RSVP form
- Defaults to `wedding.defaultGuest` from Firestore
- Overflow protection: `max-w-[85vw] break-words`

### Music System
- Audio URL from `wedding.musicUrl` (Firestore)
- Auto-plays on open with fallback
- Toggle via floating controller

### RSVP & Wishes
- Form: Name, Attendance (Hadir/Berhalangan), Message
- Writes to Firestore via `addWish()`, shows success 1.5s
- Real-time updates via `onSnapshot`
- Pagination with height-based calculation

### Twibbon Creator
- 9:16 aspect ratio (1080×1920), drag/pinch to position photo
- Pre-rendered overlay from `wedding.twibbonOverlay`
- Share via Web Share API, download fallback

### Theme System
- CSS variables injected server-side from `wedding.theme`
- 10 color presets (Classic Gold, Rose, Sage, Dusty Blue, Lavender, Peach, Mauve, Mint, Champagne, Blush)
- 14 font options for heading, body, decorative, script
- Live preview in admin panel

### Company Profile (Landing Page)
- Hero with phone mockup iframe showing live invitation
- Feature showcase, gallery, testimonials from Firestore
- FAQ accordion, consultation form (WhatsApp redirect)
- SEO optimized with JSON-LD, Open Graph, Twitter cards

---

## Testing

**Framework:** Vitest 4.1.x + React Testing Library + jest-dom

**Setup:** `src/test/setup.ts` — mocks `IntersectionObserver`, `HTMLCanvasElement.getContext`, `HTMLMediaElement.play/pause`

**Stats:** 42 test files · 2,119 tests

**Test patterns:**
- **Firestore mocks:** `vi.mock('firebase/firestore')` + `vi.mock('../lib/firebase')`
- **Context mocks:** `vi.mock('../../context/WeddingContext')` in section tests
- **Rendering:** no crash, correct structure
- **Visual integrity:** responsive classes, z-index, lazy loading
- **Behavior:** click handlers, form submission, pagination
- **Edge cases:** empty states, past dates, long strings, unicode
- **Accessibility:** aria-labels, label associations, focus-visible, tablist

```bash
npm run test                    # Run all tests
npx vitest run path/to/file     # Single file
```

---

## Development Guide

### Adding a New Wedding Page Section
1. Create `src/components/sections/YourSection.tsx`
2. Read data via `useWeddingContext()`
3. Create co-located test file with `vi.mock('../../context/WeddingContext')`
4. Add to `wedding-client.tsx` inside `<main>`
5. Add to `FloatingController.tsx` tools array if navigable

### Adding a New Admin Form Tab
1. Create `src/components/admin/YourForm.tsx` with props: `data, onSave, isSaving, onDirty, step?, totalSteps?`
2. Follow card-based UI standard (see Admin UI Standard section)
3. Add to `TABS` array in `admin/[slug]/page.tsx`
4. Add to `renderForm()` switch and `tabComplete` array
5. Update `totalEditable` if the tab is an editable form
6. Pass `step={currentStep} totalSteps={totalEditable}` for progress bar

### URL Structure

| Path | Purpose |
|------|---------|
| `/:slug` | Guest-facing wedding invitation |
| `/:slug?to=Name` | Personalized invitation |
| `/admin/:slug` | Admin panel (14 tabs) |
| `/admin/:slug/guests` | Standalone guest list |
| `/admin` | Super admin dashboard |
