# Firestore Integration Strategy

> Scalable database design for a multi-couple wedding invitation platform.

---

## Design Principles

1. **Multi-tenant from day one** — every couple gets their own wedding document, identified by a unique `weddingId` (slug used in URL)
2. **Single read on load** — all wedding data fetched in ONE Firestore document read (not multiple subcollection queries)
3. **Wishes in subcollection** — guest wishes are the only write-heavy data, stored in a subcollection for real-time listeners and pagination
4. **Static assets in Firebase Storage** — images, music, twibbon overlay stored per-wedding in Storage, referenced by URL in Firestore
5. **No authentication required for guests** — public read, rate-limited write
6. **Admin authentication** — couple manages their wedding via Firebase Auth (future)

---

## Collection Structure

```
firestore/
├── weddings/{weddingId}                    ← 1 document per couple
│   ├── (all wedding data — single read)
│   └── wishes/{wishId}                     ← subcollection (real-time, paginated)
│       └── (guest wish data)
└── slugs/{slug}                            ← URL slug → weddingId lookup
    └── { weddingId: string }
```

```
storage/
└── weddings/{weddingId}/
    ├── images/
    │   ├── hero.jpeg
    │   ├── groom-portrait.jpeg
    │   ├── bride-portrait.jpeg
    │   ├── couple-half-body.png
    │   └── gallery/
    │       ├── 1.jpeg
    │       ├── 2.jpeg
    │       └── ...
    ├── music/
    │   └── background.mp3
    └── twibbon/
        └── overlay.png
```

---

## Document Models

### `weddings/{weddingId}`

All couple-specific content in ONE document (~5KB, well within Firestore's 1MB limit). This is the single read on page load.

```typescript
interface WeddingDocument {
  // ─── Identity ───────────────────────────────────────────
  id: string;                    // auto-generated or custom
  slug: string;                  // URL slug: "dani-marini"
  status: 'draft' | 'published' | 'archived';
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // ─── Couple ─────────────────────────────────────────────
  couple: {
    groom: {
      name: string;              // "M. Daniansyah Chusyaidin, S.Kom"
      nickname: string;          // "Dani"
      parents: string;           // "Putra Bapak M. Safiudin Sukri & Ibu Indiarti"
      photo: string;             // Storage URL
      socials: SocialLink[];
    };
    bride: {
      name: string;              // "Siti Nur Marini, A.Md.M"
      nickname: string;          // "Marini"
      parents: string;           // "Putri Bapak Margono & Ibu (Almh) Sulami"
      photo: string;             // Storage URL
      socials: SocialLink[];
    };
  };

  // ─── Event ──────────────────────────────────────────────
  event: {
    date: string;                // ISO: "2026-08-29T09:00:00"
    dateDisplay: string;         // "Sabtu, 29 Agustus 2026"
    dateShort: string;           // "29 Agustus 2026"
    location: string;            // "Surabaya"
    ceremonies: Ceremony[];
    venue: {
      name: string;              // "Gedung Wanita Candra Kencana"
      address: string;           // Full address
      mapsUrl: string;           // Google Maps link
    };
  };

  // ─── Content ────────────────────────────────────────────
  content: {
    openingLabel: string;        // "Turut Mengundang"
    heroImage: string;           // Storage URL
    openingImage: string;        // Storage URL (can be same as hero)
    music: string;               // Storage URL
    twibbonOverlay: string;      // Storage URL
    twibbonDownloadName: string; // "Memori-Dani-Marini.png"
    quranVerse: {
      arabic: string;
      translation: string;
      reference: string;         // "QS. Ar-Rum: 21"
    };
    story: StorySlide[];
    gallery: GalleryItem[];
  };

  // ─── Gift ───────────────────────────────────────────────
  gift: {
    accounts: BankAccount[];
  };

  // ─── Customization ─────────────────────────────────────
  theme: {
    template: string;            // "cinematic" (future: multiple templates)
    primaryFont: string;         // "Dayland"
    colors: {
      gold: string;              // "#B48D3E"
      ivory: string;             // "#FDFCF8"
      paper: string;             // "#F5F2ED"
      ink: string;               // "#1A1A1A"
    };
  };

  // ─── SEO / Meta ────────────────────────────────────────
  meta: {
    title: string;               // "Wedding Dani & Marini - 29 Agustus 2026"
    description: string;         // OG description
    ogImage: string;             // Storage URL
    domain: string;              // "wedding-dani-marini.web.app"
  };

  // ─── Credits ───────────────────────────────────────────
  credits: CreditPerson[];

  // ─── Stats (denormalized for read efficiency) ──────────
  stats: {
    totalWishes: number;         // incremented via Cloud Function on wish create
    totalAttending: number;
    totalNotAttending: number;
  };
}
```

### Sub-types

```typescript
interface SocialLink {
  platform: 'instagram' | 'linkedin' | 'whatsapp' | 'threads' | 'tiktok' | 'twitter';
  url: string;
}

interface Ceremony {
  name: string;                  // "Akad Nikah"
  startTime: string;             // "09:00"
  endTime: string;               // "10:00"
}

interface StorySlide {
  year: string;                  // "2016 — 2017"
  text: string;                  // Multi-line story text
  bgImage: string;               // Storage URL
}

interface GalleryItem {
  src: string;                   // Storage URL
  span: string;                  // "col-span-1 row-span-1"
  shape: string;                 // "rounded-[2rem_5rem_2rem_5rem]"
}

interface BankAccount {
  bank: string;                  // "BCA"
  account: string;               // "1234567890"
  owner: string;                 // "M. Daniansyah Chusyaidin"
}

interface CreditPerson {
  name: string;                  // "M. Daniansyah C."
  role: string;                  // "developer" | "designer"
  description: string;           // "Menulis setiap baris code..."
  icon: string;                  // "code" | "palette"
  socials: SocialLink[];
}
```

### `weddings/{weddingId}/wishes/{wishId}`

```typescript
interface WishDocument {
  id: string;                    // auto-generated
  name: string;                  // "Ahmad & Keluarga"
  message: string;               // "Selamat menempuh hidup baru..."
  attendance: 'yes' | 'no';
  createdAt: Timestamp;          // Firestore server timestamp
}
```

### `slugs/{slug}`

```typescript
interface SlugDocument {
  weddingId: string;             // Reference to weddings/{weddingId}
}
```

---

## Data Flow

### Page Load (1 document read)

```
1. User opens: wedding-dani-marini.web.app/?to=Budi
2. App reads slug "dani-marini" from domain/URL
3. Firestore read: slugs/dani-marini → { weddingId: "abc123" }
4. Firestore read: weddings/abc123 → full WeddingDocument
5. App hydrates all sections from the single document
6. Firestore listener: weddings/abc123/wishes (real-time, ordered by createdAt desc)
```

**Total reads on load: 2 document reads + 1 real-time listener**

### Guest Submits Wish (1 write)

```
1. Guest fills RSVP form
2. Firestore write: weddings/abc123/wishes/{auto-id}
3. Cloud Function trigger (onCreate):
   - Increment stats.totalWishes
   - Increment stats.totalAttending or stats.totalNotAttending
4. Real-time listener pushes new wish to all connected guests
```

### Guest Copies Bank Account (0 reads/writes)

```
No Firestore interaction — clipboard copy is client-side only.
Bank account data already loaded in the WeddingDocument.
```

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Slug lookup — public read, admin write
    match /slugs/{slug} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Wedding document — public read, admin write
    match /weddings/{weddingId} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.uid == resource.data.ownerId;

      // Wishes — public read + create, no update/delete
      match /wishes/{wishId} {
        allow read: if true;
        allow create: if request.resource.data.keys().hasAll(['name', 'message', 'attendance'])
                     && request.resource.data.name is string
                     && request.resource.data.name.size() > 0
                     && request.resource.data.name.size() <= 100
                     && request.resource.data.message is string
                     && request.resource.data.message.size() > 0
                     && request.resource.data.message.size() <= 200
                     && request.resource.data.attendance in ['yes', 'no'];
        allow update, delete: if request.auth != null;
      }
    }
  }
}
```

---

## Firestore Indexes

```
// Required composite index for wishes pagination
Collection: weddings/{weddingId}/wishes
Fields: createdAt DESC
```

No other composite indexes needed — the wedding document is a single read.

---

## TypeScript Types for App Integration

These types will live in `src/types/firestore.ts`:

```typescript
import { Timestamp } from 'firebase/firestore';

// ─── Firestore Document Types ─────────────────────────────

export interface WeddingDocument {
  id: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  couple: CoupleData;
  event: EventData;
  content: ContentData;
  gift: GiftData;
  theme: ThemeData;
  meta: MetaData;
  credits: CreditPerson[];
  stats: WeddingStats;
}

export interface CoupleData {
  groom: PersonData;
  bride: PersonData;
}

export interface PersonData {
  name: string;
  nickname: string;
  parents: string;
  photo: string;
  socials: SocialLink[];
}

export interface SocialLink {
  platform: 'instagram' | 'linkedin' | 'whatsapp' | 'threads' | 'tiktok' | 'twitter';
  url: string;
}

export interface EventData {
  date: string;
  dateDisplay: string;
  dateShort: string;
  location: string;
  ceremonies: Ceremony[];
  venue: VenueData;
}

export interface Ceremony {
  name: string;
  startTime: string;
  endTime: string;
}

export interface VenueData {
  name: string;
  address: string;
  mapsUrl: string;
}

export interface ContentData {
  openingLabel: string;
  heroImage: string;
  openingImage: string;
  music: string;
  twibbonOverlay: string;
  twibbonDownloadName: string;
  quranVerse: QuranVerse;
  story: StorySlide[];
  gallery: GalleryItem[];
}

export interface QuranVerse {
  arabic: string;
  translation: string;
  reference: string;
}

export interface StorySlide {
  year: string;
  text: string;
  bgImage: string;
}

export interface GalleryItem {
  src: string;
  span: string;
  shape: string;
}

export interface GiftData {
  accounts: BankAccount[];
}

export interface BankAccount {
  bank: string;
  account: string;
  owner: string;
}

export interface ThemeData {
  template: string;
  primaryFont: string;
  colors: {
    gold: string;
    ivory: string;
    paper: string;
    ink: string;
  };
}

export interface MetaData {
  title: string;
  description: string;
  ogImage: string;
  domain: string;
}

export interface CreditPerson {
  name: string;
  role: string;
  description: string;
  icon: string;
  socials: SocialLink[];
}

export interface WeddingStats {
  totalWishes: number;
  totalAttending: number;
  totalNotAttending: number;
}

export interface WishDocument {
  id: string;
  name: string;
  message: string;
  attendance: 'yes' | 'no';
  createdAt: Timestamp;
}
```

---

## Migration Path (Current → Firestore)

### Phase 1: Add Firestore for Wishes Only
- Install `firebase` SDK
- Create `src/lib/firebase.ts` with config
- Create `src/hooks/useWishes.ts` — real-time listener on wishes subcollection
- Replace `useState(SEED_WISHES)` in App.tsx with `useWishes(weddingId)`
- Keep all other data in `constants/wedding.ts` (unchanged)
- **Impact: 1 file changed (App.tsx), 2 files added**

### Phase 2: Move Wedding Data to Firestore
- Create `src/hooks/useWedding.ts` — loads WeddingDocument on mount
- Create `src/context/WeddingContext.tsx` — provides wedding data to all sections
- Replace `constants/wedding.ts` references with context values
- Update all sections to read from context instead of constants
- **Impact: All section files updated, constants file removed**

### Phase 3: Multi-Couple Support
- Add slug-based routing (React Router or URL param)
- Load wedding by slug: `slugs/{slug}` → `weddings/{weddingId}`
- Dynamic meta tags via SSR or Cloud Functions
- Admin dashboard for couple to manage their wedding
- **Impact: Routing added, admin UI added**

---

## Estimated Firestore Costs (Free Tier)

| Operation | Per Wedding/Day | Monthly (1 wedding) | Free Tier Limit |
|---|---|---|---|
| Wedding doc reads | ~500 (page views) | ~15,000 | 50,000/day |
| Wish reads (listener) | ~500 | ~15,000 | 50,000/day |
| Wish writes | ~20 (new wishes) | ~600 | 20,000/day |
| Storage | ~50MB (images+music) | ~50MB | 5GB |

**Well within free tier for a single wedding.** Multi-couple scales linearly — 10 weddings = 10x reads, still within free tier if spread across time.

---

## Hardcoded Content That Must Become Dynamic

| Current Location | Content | Firestore Field |
|---|---|---|
| `constants/wedding.ts` | WEDDING_DATE, VENUE, BANK_ACCOUNTS, STORY_SLIDES, GALLERY_ITEMS | `event.*`, `gift.accounts`, `content.story`, `content.gallery` |
| `CinematicOpening.tsx` | "Dani", "Marini", hero image | `couple.groom.nickname`, `couple.bride.nickname`, `content.openingImage` |
| `HeroSection.tsx` | Hero image | `content.heroImage` |
| `CoupleSection.tsx` | Names, parents, photos | `couple.groom.*`, `couple.bride.*` |
| `EventSection.tsx` | Date, ceremonies, venue, Quran verse | `event.*`, `content.quranVerse` |
| `TwibbonCreator.tsx` | Overlay image, download filename | `content.twibbonOverlay`, `content.twibbonDownloadName` |
| `DigitalEnvelope.tsx` | Bank accounts | `gift.accounts` |
| `Footer.tsx` | Names, socials, descriptions | `credits[]` |
| `ErrorBoundary.tsx` | "Dani & Marini", venue | `couple.*.nickname`, `event.venue.name` |
| `App.tsx` | Music file | `content.music` |
| `index.html` | OG tags, preload image | `meta.*` (requires SSR/Cloud Function for dynamic meta) |
