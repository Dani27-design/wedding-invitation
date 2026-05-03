# Firestore Integration Strategy

> Scalable, admin-form-friendly database design for a multi-couple wedding invitation platform.

---

## Design Principles

1. **Flat fields** — every admin form field maps 1:1 to a Firestore field. No deep nesting like `couple.groom.socials[0].platform`.
2. **Root collections only** — no subcollections. All collections queryable without parent path.
3. **Derived, not typed** — display dates, meta tags, download filenames computed in the app, not entered by admin.
4. **Separated by writer** — admin-managed data in `weddings`, guest-generated data in `wishes`, `story-comments`, `story-likes`.
5. **Slug as document ID** — `weddings/dani-marini` — zero lookup overhead.
6. **Mobile-first admin form** — 8 simple pages, 3-8 fields each, like Google Forms.

---

## Collection Structure

```
firestore/
├── weddings/{slug}              ← admin form writes here (1 document per couple)
├── story-likes/{slug}           ← guest like counts per slide (tiny doc)
├── wishes/{autoId}              ← guest RSVP wishes
└── story-comments/{autoId}      ← guest story slide comments
```

```
storage/
└── weddings/{slug}/
    ├── groom.jpeg
    ├── bride.jpeg
    ├── hero.jpeg
    ├── opening.jpeg
    ├── twibbon-overlay.png
    ├── music.mp3
    ├── story/
    │   ├── 0.jpeg
    │   ├── 1.jpeg
    │   └── ...
    └── gallery/
        ├── 0.jpeg
        ├── 1.jpeg
        └── ...
```

---

## Document Models

### `weddings/{slug}` — All wedding config (~5KB)

Admin fills ONE form → writes to ONE document. Every field is flat or a simple array.

```typescript
interface WeddingDocument {
  // ─── System (auto-set, not in admin form) ──────────────
  ownerId: string;               // Firebase Auth UID
  status: 'draft' | 'published' | 'archived';
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // ─── Page 1: Couple ────────────────────────────────────
  groomNickname: string;         // "Dani"
  groomName: string;             // "M. Daniansyah Chusyaidin, S.Kom"
  groomParents: string;          // "Putra Bapak M. Safiudin Sukri & Ibu Indiarti"
  groomPhoto: string;            // Storage URL
  groomInstagram: string;        // "https://instagram.com/danichusyaidin"
  groomLinkedin: string;         // "https://id.linkedin.com/in/..."
  groomWhatsapp: string;         // "6285790428078" (number only, app prefixes wa.me/)

  brideNickname: string;         // "Marini"
  brideName: string;             // "Siti Nur Marini, A.Md.M"
  brideParents: string;          // "Putri Bapak Margono & Ibu (Almh) Sulami"
  bridePhoto: string;            // Storage URL
  brideInstagram: string;
  brideThreads: string;
  brideWhatsapp: string;

  defaultGuest: string;          // "Tamu Terkasih Kami"

  // ─── Page 2: Event ─────────────────────────────────────
  eventDate: string;             // "2026-08-29" (date only, app derives display formats)
  eventCity: string;             // "Surabaya"
  venueName: string;             // "Gedung Wanita Candra Kencana"
  venueAddress: string;          // Full address
  venueMapsUrl: string;          // Google Maps URL
  ceremonies: Ceremony[];        // [{ name, start, end }, ...]

  // ─── Page 3: Story ─────────────────────────────────────
  story: StorySlide[];           // [{ year, text, bgImage }, ...]

  // ─── Page 4: Gallery ───────────────────────────────────
  gallery: string[];             // ["https://storage.../g1.jpeg", ...] (URLs only, layout auto-computed)

  // ─── Page 5: Gift ──────────────────────────────────────
  giftAccounts: BankAccount[];   // [{ bank, account, owner }, ...]

  // ─── Page 6: Media ─────────────────────────────────────
  musicUrl: string;              // Storage URL
  twibbonOverlay: string;        // Storage URL
  heroImage: string;             // Storage URL
  openingImage: string;          // Storage URL

  // ─── Page 7: Socials (already in groom*/bride* fields above) ──

  // ─── Page 8: Customization (optional, has defaults) ────
  quranArabic: string;           // Full Arabic verse
  quranTranslation: string;      // Indonesian translation
  quranReference: string;        // "QS. Ar-Rum: 21"
  themeTemplate: string;         // "cinematic"
  themeGold: string;             // "#B48D3E"
  themeIvory: string;            // "#FDFCF8"

  // ─── Credits (optional) ────────────────────────────────
  credits: CreditPerson[];
}

interface Ceremony {
  name: string;                  // "Akad Nikah"
  start: string;                 // "09:00"
  end: string;                   // "10:00"
}

interface StorySlide {
  year: string;                  // "2016 — 2017"
  text: string;                  // Multi-line story text
  bgImage: string;               // Storage URL
}

interface BankAccount {
  bank: string;                  // "BCA"
  account: string;               // "1234567890"
  owner: string;                 // "M. Daniansyah Chusyaidin"
}

interface CreditPerson {
  name: string;                  // "M. Daniansyah C."
  role: string;                  // "developer"
  description: string;           // "Menulis setiap baris code..."
}
```

### `story-likes/{slug}` — Tiny document for guest likes

```typescript
interface StoryLikesDocument {
  likes: number[];               // [142, 167, 128, 155, 139, 163] — one per slide
}
```

Updated via Firestore transaction: read → increment `likes[slideIndex]` → write. Separate from wedding doc to avoid write contention.

### `wishes/{autoId}` — Guest wishes

```typescript
interface WishDocument {
  weddingId: string;             // "dani-marini" (for querying)
  name: string;                  // "Ahmad & Keluarga"
  message: string;               // "Selamat menempuh hidup baru..."
  attendance: 'yes' | 'no';
  createdAt: Timestamp;          // Firestore server timestamp
}
```

### `story-comments/{autoId}` — Guest story comments

```typescript
interface StoryCommentDocument {
  weddingId: string;             // "dani-marini"
  slideIndex: number;            // 0-5
  name: string;                  // "Budi"
  text: string;                  // "Cantik banget!"
  createdAt: Timestamp;
}
```

---

## Derived Fields (Computed in App, NOT Stored)

These are computed client-side from the raw Firestore data. The admin never types them.

| Derived field | Computed from | Example |
|---|---|---|
| `dateDisplay` | `eventDate` via `Intl.DateTimeFormat('id-ID')` | "Sabtu, 29 Agustus 2026" |
| `dateShort` | `eventDate` via `Intl.DateTimeFormat('id-ID')` | "29 Agustus 2026" |
| `locationDisplay` | `eventCity` | "Surabaya . Indonesia" |
| `calendarTitle` | `groomNickname + brideNickname` | "Pernikahan Dani & Marini" |
| `calendarStart` | `eventDate + ceremonies[0].start` | "20260829T090000" |
| `calendarEnd` | `eventDate + ceremonies[last].end` | "20260829T130000" |
| `metaTitle` | `groomNickname + brideNickname + dateShort` | "Wedding Dani & Marini - 29 Agustus 2026" |
| `metaDescription` | `dateDisplay + eventCity` | "Turut mengundang Anda..." |
| `twibbonDownloadName` | `groomNickname + brideNickname` | "Memori-Dani-Marini.png" |
| `copyright` | `eventDate year` | "© 2026" |
| `whatsappUrl` | `groomWhatsapp` number | "https://wa.me/6285790428078" |
| `galleryLayout` | `gallery.length` + position index | Auto-assigned span/shape per item |

---

## Admin Form Pages (Mobile-First)

| Page | Fields | Firestore fields written |
|---|---|---|
| 1. Pasangan | 6 text + 2 upload | `groomNickname`, `groomName`, `groomParents`, `groomPhoto`, `brideNickname`, `brideName`, `brideParents`, `bridePhoto` |
| 2. Acara | 5 text + 1 date picker + repeatable ceremonies | `eventDate`, `eventCity`, `venueName`, `venueAddress`, `venueMapsUrl`, `ceremonies[]` |
| 3. Cerita | Repeatable: 1 text + 1 textarea + 1 upload per slide | `story[]` |
| 4. Galeri | Multi-photo upload | `gallery[]` |
| 5. Amplop | Repeatable: 3 text per account | `giftAccounts[]` |
| 6. Media | 2 upload + 2 select | `musicUrl`, `twibbonOverlay`, `heroImage`, `openingImage` |
| 7. Sosial | 6 URL fields | `groomInstagram`, `groomLinkedin`, `groomWhatsapp`, `brideInstagram`, `brideThreads`, `brideWhatsapp` |
| 8. Kustom | Dropdown/text (has defaults) | `quranArabic`, `quranTranslation`, `quranReference`, `themeTemplate`, `themeGold`, `themeIvory` |

Total: ~30 fields across 8 pages. Each page has 3-8 simple inputs.

---

## Data Flow

### Page Load (2 reads + 2 listeners)

```
1. Read:     weddings/dani-marini           → all config
2. Read:     story-likes/dani-marini        → like counts
3. Listener: wishes?weddingId=dani-marini   → real-time wish feed
4. Listener: story-comments?weddingId=dani-marini&slideIndex=X → per-slide comments
```

### Guest Interactions

| Action | Operation | Collection |
|---|---|---|
| Submit wish | `addDoc(wishes, { weddingId, name, message, attendance })` | `wishes` |
| Like a slide | Transaction: read `story-likes` → increment `likes[i]` → write | `story-likes` |
| Comment on slide | `addDoc(story-comments, { weddingId, slideIndex, name, text })` | `story-comments` |
| Copy bank account | Client-side clipboard — no Firestore | — |

### Admin Updates

| Action | Operation |
|---|---|
| Save form page | `updateDoc(weddings/slug, { ...pageFields })` |
| Upload media | Firebase Storage upload → get URL → save to wedding doc |
| Publish | `updateDoc(weddings/slug, { status: 'published' })` |

---

## Queries

### Guest-facing app

```typescript
// Load wedding config
doc('weddings', slug)

// Load story likes
doc('story-likes', slug)

// Real-time wishes (paginated)
collection('wishes')
  .where('weddingId', '==', slug)
  .orderBy('createdAt', 'desc')
  .limit(20)

// Story comments (per slide, on-demand)
collection('story-comments')
  .where('weddingId', '==', slug)
  .where('slideIndex', '==', activeSlide)
  .orderBy('createdAt', 'desc')
  .limit(50)
```

### Admin dashboard (future)

```typescript
// All weddings for this owner
collection('weddings')
  .where('ownerId', '==', authUid)

// All wishes for a wedding
collection('wishes')
  .where('weddingId', '==', slug)

// Total wishes across ALL weddings (platform analytics)
collection('wishes')
  .orderBy('createdAt', 'desc')

// All comments for a wedding
collection('story-comments')
  .where('weddingId', '==', slug)
```

---

## Firestore Indexes

```
// wishes — guest view
Collection: wishes
Fields: weddingId ASC, createdAt DESC

// story-comments — per slide view
Collection: story-comments
Fields: weddingId ASC, slideIndex ASC, createdAt DESC
```

---

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Wedding config — public read, owner write
    match /weddings/{slug} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null
                           && request.auth.uid == resource.data.ownerId;
    }

    // Story likes — public read + update (increment only)
    match /story-likes/{slug} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if true
                   && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['likes']);
    }

    // Wishes — public read + create, owner update/delete
    match /wishes/{wishId} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasAll(['weddingId', 'name', 'message', 'attendance'])
                   && request.resource.data.name is string
                   && request.resource.data.name.size() > 0
                   && request.resource.data.name.size() <= 100
                   && request.resource.data.message is string
                   && request.resource.data.message.size() > 0
                   && request.resource.data.message.size() <= 200
                   && request.resource.data.attendance in ['yes', 'no'];
      allow update, delete: if request.auth != null;
    }

    // Story comments — public read + create, owner update/delete
    match /story-comments/{commentId} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasAll(['weddingId', 'slideIndex', 'name', 'text'])
                   && request.resource.data.name is string
                   && request.resource.data.name.size() > 0
                   && request.resource.data.name.size() <= 30
                   && request.resource.data.text is string
                   && request.resource.data.text.size() > 0
                   && request.resource.data.text.size() <= 100
                   && request.resource.data.slideIndex is int;
      allow update, delete: if request.auth != null;
    }
  }
}
```

---

## Estimated Costs (Free Tier)

| Operation | Per Wedding/Day | Free Tier Limit |
|---|---|---|
| Wedding doc reads | ~500 | 50,000/day |
| Story-likes reads | ~500 | (same pool) |
| Wish reads (listener) | ~500 | (same pool) |
| Wish writes | ~20 | 20,000/day |
| Story-likes writes | ~50 | (same pool) |
| Comment writes | ~10 | (same pool) |
| Storage | ~50MB | 5GB |

Well within free tier for 1-10 weddings.

---

## Migration Path

### Phase 1: Wishes Only (Minimal Change)
- Install `firebase` SDK
- Create `src/lib/firebase.ts`
- Create `src/hooks/useWishes.ts` — real-time listener
- Replace `useState(SEED_WISHES)` with Firestore listener
- Keep all other data in `constants/wedding.ts`
- **1 file changed, 2 files added**

### Phase 2: Full Wedding Data
- Create `src/hooks/useWedding.ts` — loads wedding doc
- Create `src/context/WeddingContext.tsx` — provides data to all sections
- Replace hardcoded constants with context values
- All sections read from context
- **All section files updated**

### Phase 3: Story Interactions
- Create `src/hooks/useStoryLikes.ts`
- Create `src/hooks/useStoryComments.ts`
- Replace in-memory story state with Firestore
- **CinematicStory.tsx updated**

### Phase 4: Admin Form
- Create mobile-first admin pages (8 form steps)
- Firebase Auth for couple login
- Firebase Storage upload integration
- **New admin route/pages added**

### Phase 5: Multi-Couple
- Slug-based routing
- Dynamic meta tags (Cloud Functions for SSR)
- Platform analytics dashboard

---

## TypeScript Types (for `src/types/firestore.ts`)

```typescript
import { Timestamp } from 'firebase/firestore';

export interface WeddingDocument {
  ownerId: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: Timestamp;
  updatedAt: Timestamp;

  groomNickname: string;
  groomName: string;
  groomParents: string;
  groomPhoto: string;
  groomInstagram: string;
  groomLinkedin: string;
  groomWhatsapp: string;

  brideNickname: string;
  brideName: string;
  brideParents: string;
  bridePhoto: string;
  brideInstagram: string;
  brideThreads: string;
  brideWhatsapp: string;

  defaultGuest: string;

  eventDate: string;
  eventCity: string;
  venueName: string;
  venueAddress: string;
  venueMapsUrl: string;
  ceremonies: Ceremony[];

  story: StorySlide[];
  gallery: string[];
  giftAccounts: BankAccount[];

  musicUrl: string;
  twibbonOverlay: string;
  heroImage: string;
  openingImage: string;

  quranArabic: string;
  quranTranslation: string;
  quranReference: string;
  themeTemplate: string;
  themeGold: string;
  themeIvory: string;

  credits: CreditPerson[];
}

export interface StoryLikesDocument {
  likes: number[];
}

export interface WishDocument {
  weddingId: string;
  name: string;
  message: string;
  attendance: 'yes' | 'no';
  createdAt: Timestamp;
}

export interface StoryCommentDocument {
  weddingId: string;
  slideIndex: number;
  name: string;
  text: string;
  createdAt: Timestamp;
}

export interface Ceremony {
  name: string;
  start: string;
  end: string;
}

export interface StorySlide {
  year: string;
  text: string;
  bgImage: string;
}

export interface BankAccount {
  bank: string;
  account: string;
  owner: string;
}

export interface CreditPerson {
  name: string;
  role: string;
  description: string;
}
```

---

## Hardcoded Content → Firestore Field Mapping

| File | Hardcoded content | Firestore field |
|---|---|---|
| `CinematicOpening.tsx` | "Dani", "Marini" | `groomNickname`, `brideNickname` |
| `CinematicOpening.tsx` | "Turut Mengundang" | Derived or default |
| `CinematicOpening.tsx` | "Surabaya", date | `eventCity`, derived from `eventDate` |
| `CinematicOpening.tsx` | Opening image | `openingImage` |
| `HeroSection.tsx` | Hero image | `heroImage` |
| `CoupleSection.tsx` | Names, parents, photos | `groom*`, `bride*` fields |
| `CinematicStory.tsx` | STORY_SLIDES, INITIAL_LIKES | `story[]`, `story-likes.likes[]` |
| `CinematicStory.tsx` | Comments (in-memory) | `story-comments` collection |
| `EventSection.tsx` | Date, ceremonies, venue, verse | `eventDate`, `ceremonies[]`, `venue*`, `quran*` |
| `EventSection.tsx` | Google Calendar inline data | Derived from `eventDate` + `ceremonies` + nicknames |
| `TwibbonCreator.tsx` | Overlay, download name | `twibbonOverlay`, derived from nicknames |
| `RSVPSection.tsx` | Wishes | `wishes` collection |
| `DigitalEnvelope.tsx` | BANK_ACCOUNTS | `giftAccounts[]` |
| `PhotoGallery.tsx` | GALLERY_ITEMS | `gallery[]` (URLs only, layout auto-computed) |
| `Footer.tsx` | Names, bios, socials | `credits[]`, `groom*`/`bride*` social fields |
| `ErrorBoundary.tsx` | "Dani & Marini", venue | Derived from nicknames + `venueName` |
| `App.tsx` | Music, default guest | `musicUrl`, `defaultGuest` |
| `AmbientSocialLayer.tsx` | Default comment pool | Hardcoded defaults + live `story-comments` |
| `index.html` | OG tags, loading screen, noscript | `meta*` fields (requires SSR for dynamic) |
| `constants/wedding.ts` | All constants | Replaced entirely by Firestore |
| `constants/wishes.ts` | Seed wishes | Replaced by `wishes` collection |
