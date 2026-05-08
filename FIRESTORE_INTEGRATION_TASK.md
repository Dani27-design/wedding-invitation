# Firestore Integration — Task List

> Ordered by phase and dependency. Each task has a clear scope, input, output, and affected files.

---

## Phase 1: Wishes Only (Minimal Change)

> Goal: Replace in-memory seed wishes with real-time Firestore. Everything else stays hardcoded.

---

### Task 1.1 — Install Firebase SDK [DONE]

**Scope:** Add `firebase` package to the project.

**Action:**
```bash
npm install firebase
```

**Affected files:** `package.json`, `package-lock.json`

**Depends on:** Nothing

---

### Task 1.2 — Create Firebase config [DONE]

**Scope:** Initialize Firebase app and export Firestore instance.

**Action:** Create `src/lib/firebase.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

**Also create:** `.env.example` with placeholder keys (NOT `.env` with real keys).

**New files:** `src/lib/firebase.ts`, `.env.example`

**Depends on:** Task 1.1

---

### Task 1.3 — Create Firestore types [DONE]

**Scope:** Add all Firestore document interfaces.

**Action:** Create `src/types/firestore.ts` with all interfaces from `FIRESTORE_INTEGRATION.md`:
- `WeddingDocument`
- `StoryLikesDocument`
- `WishDocument`
- `StoryCommentDocument`
- `Ceremony`, `StorySlide`, `BankAccount`, `CreditPerson`

**New files:** `src/types/firestore.ts`

**Depends on:** Nothing

---

### Task 1.4 — Update `GuestWishes` type for Timestamp compatibility [DONE]

**Scope:** Make `createdAt` accept both `number` (current) and Firestore `Timestamp`.

**Action:** Update `src/types/index.ts`:
```typescript
import { Timestamp } from 'firebase/firestore';

export interface GuestWishes {
  id: string;
  name: string;
  message: string;
  attendance: 'yes' | 'no';
  createdAt: number | Timestamp;
}
```

**Affected files:** `src/types/index.ts`

**Depends on:** Task 1.1

---

### Task 1.5 — Update `formatDate` to handle Firestore Timestamp [DONE]

**Scope:** `formatDate` currently receives `number` (Unix ms). Make it handle `Timestamp` objects too.

**Action:** Update `src/utils/formatDate.ts`:
```typescript
import { Timestamp } from 'firebase/firestore';

export function formatDate(value: number | Timestamp): string {
  const date = value instanceof Timestamp ? value.toDate() : new Date(value);
  // ... existing formatting logic using date
}
```

**Affected files:** `src/utils/formatDate.ts`

**Depends on:** Task 1.4

---

### Task 1.6 — Create `useWishes` hook [DONE]

**Scope:** Real-time Firestore listener for wishes collection, replacing `SEED_WISHES`.

**Action:** Create `src/hooks/useWishes.ts`:
```typescript
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GuestWishes } from '../types';

const WISHES_LIMIT = 50;

export function useWishes(weddingId: string) {
  const [wishes, setWishes] = useState<GuestWishes[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'wishes'),
      where('weddingId', '==', weddingId),
      orderBy('createdAt', 'desc'),
      limit(WISHES_LIMIT)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GuestWishes[];
      setWishes(data);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [weddingId]);

  return { wishes, isLoading };
}
```

**New files:** `src/hooks/useWishes.ts`

**Depends on:** Task 1.2, Task 1.4

---

### Task 1.7 — Create `addWish` function [DONE]

**Scope:** Function to write a new wish to Firestore.

**Action:** Create `src/lib/wishes.ts`:
```typescript
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export async function addWish(weddingId: string, data: { name: string; message: string; attendance: 'yes' | 'no' }) {
  return addDoc(collection(db, 'wishes'), {
    weddingId,
    name: data.name.trim(),
    message: data.message.trim(),
    attendance: data.attendance,
    createdAt: serverTimestamp(),
  });
}
```

**New files:** `src/lib/wishes.ts`

**Depends on:** Task 1.2

---

### Task 1.8 — Update `App.tsx` to use Firestore wishes [DONE]

**Scope:** Replace `useState(SEED_WISHES)` with `useWishes` hook. Replace `handleRSVPSubmit` to call `addWish`.

**Changes:**
- Remove import: `SEED_WISHES` from `./constants/wishes`
- Add import: `useWishes` from `./hooks/useWishes`, `addWish` from `./lib/wishes`
- Add constant: `const WEDDING_SLUG = 'dani-marini'` (temporary, kept until Task 5.1 replaces with URL param)
- Replace: `const [wishes, setWishes] = useState(SEED_WISHES)` → `const { wishes } = useWishes(WEDDING_SLUG)`
- Update `handleRSVPSubmit`: call `addWish(WEDDING_SLUG, { name, message, attendance })` instead of `setWishes(prev => ...)`
- Remove: `setWishes` related logic (functional updater no longer needed)
- Keep: `wishPages` pagination logic (works on any `GuestWishes[]`)

**Affected files:** `src/App.tsx`

**Depends on:** Task 1.6, Task 1.7

---

### Task 1.9 — Seed ALL initial Firestore documents [DONE]

**Scope:** One-time script to populate ALL Firestore collections with initial data. This is the single entry point for bootstrapping a new wedding.

**Action:** Create `scripts/seed-firestore.mjs` that creates:

**1. `weddings/dani-marini`** — Full wedding config document:
```javascript
{
  ownerId: '',  // set after Firebase Auth setup
  status: 'published',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),

  // Couple
  groomNickname: 'Dani',
  groomName: 'M. Daniansyah Chusyaidin, S.Kom',
  groomParents: 'Putra Bapak M. Safiudin Sukri & Ibu Indiarti',
  groomPhoto: '/images/groom_face_potrait.jpeg',  // local path until Storage migration
  groomInstagram: 'https://instagram.com/danichusyaidin',
  groomLinkedin: 'https://id.linkedin.com/in/daniansyahchusyaidin',
  groomWhatsapp: '6285790428078',

  brideNickname: 'Marini',
  brideName: 'Siti Nur Marini, A.Md.M',
  brideParents: 'Putri Bapak Margono & Ibu (Almh) Sulami',
  bridePhoto: '/images/bride_face_potrait.jpeg',
  brideInstagram: 'https://instagram.com/mariniw_',
  brideThreads: 'https://threads.com/@mariniw_',
  brideWhatsapp: '628883816403',

  defaultGuest: 'Tamu Terkasih Kami',

  // Event
  eventDate: '2026-08-29',
  eventCity: 'Surabaya',
  venueName: 'Gedung Wanita Candra Kencana',
  venueAddress: 'Jl. Kalibokor Selatan No.2, Baratajaya, Gubeng, Surabaya',
  venueMapsUrl: '<copy full URL from constants/wedding.ts line 8>',
  ceremonies: [
    { name: 'Akad Nikah', start: '09:00', end: '10:00' },
    { name: 'Resepsi', start: '10:00', end: '13:00' },
  ],

  // Story
  story: [
    // All 6 slides — copy from constants/wedding.ts lines 20-51
    // IMPORTANT: rename field `bg` → `bgImage` for each slide
    { year: '2016 — 2017', text: '<full text>', bgImage: '/images/bride_face_potrait.jpeg' },
    { year: '2018 — 2022', text: '<full text>', bgImage: '/images/groom_face_potrait.jpeg' },
    { year: '2023', text: '<full text>', bgImage: '/images/bride_and_groom_half_body_potrait.png' },
    { year: '2024 — 2025', text: '<full text>', bgImage: '/images/bride_and_groom_full_body_potrait.jpeg' },
    { year: '2026', text: '<full text>', bgImage: '/images/bride_and_groom_full_body_potrait.jpeg' },
    { year: 'Ikrar', text: '<full text>', bgImage: '/images/bride_and_groom_full_body_potrait.jpeg' },
  ],

  // Gallery (URLs only)
  // All 12 gallery URLs — copy src values from constants/wedding.ts lines 53-66
  gallery: [
    '/images/bride_face_potrait.jpeg',
    '/images/bride_and_groom_full_body_potrait.jpeg',
    '/images/groom_face_potrait.jpeg',
    '/images/bride_and_groom_half_body_potrait.png',
    '/images/bride_face_potrait.jpeg',
    '/images/groom_face_potrait.jpeg',
    '/images/bride_and_groom_half_body_potrait.png',
    '/images/bride_and_groom_full_body_potrait.jpeg',
    '/images/bride_face_potrait.jpeg',
    '/images/groom_face_potrait.jpeg',
    '/images/bride_and_groom_half_body_potrait.png',
    '/images/bride_and_groom_full_body_potrait.jpeg',
  ],

  // All 6 accounts — copy from constants/wedding.ts lines 11-18
  giftAccounts: [
    { bank: 'BCA', account: '1234567890', owner: 'M. Daniansyah Chusyaidin' },
    { bank: 'BRI', account: '0987654321', owner: 'Siti Nur Marini' },
    { bank: 'Jenius', account: '111222333444', owner: 'M. Daniansyah Chusyaidin' },
    { bank: 'BTN', account: '777888999000', owner: 'Siti Nur Marini' },
    { bank: 'Gopay', account: '08123456789', owner: 'M. Daniansyah Chusyaidin' },
    { bank: 'Seabank', account: '08987654321', owner: 'Siti Nur Marini' },
  ],

  // Media
  musicUrl: '/musics/adele-make-you-feel-my-love.mp3',
  twibbonOverlay: '/images/twibbon-overlay.png',
  heroImage: '/images/bride_and_groom_full_body_potrait.jpeg',
  openingImage: '/images/bride_and_groom_full_body_potrait.jpeg',

  // Quran
  // Copy Arabic and translation from EventSection.tsx lines 15-16
  quranArabic: '<full Arabic verse from EventSection.tsx line 15>',
  quranTranslation: '<full Indonesian translation from EventSection.tsx line 16>',
  quranReference: 'QS. Ar-Rum: 21',

  // Theme
  theme: {
    template: 'cinematic',
    colors: { accent: '#B48D3E', background: '#FDFCF8', text: '#1A1A1A', surface: '#F5F2ED', button: '#F8BBD0' },
    fonts: { heading: 'Cormorant Garamond', body: 'Montserrat', decorative: 'Playfair Display', script: 'Dayland' },
  },

  // Credits
  credits: [
    { name: 'M. Daniansyah C.', role: 'developer', description: 'Menulis setiap baris code...' },
    { name: 'Siti Nur Marini', role: 'designer', description: 'Memperindah setiap bagian...' },
  ],
}
```

**2. `story-likes/dani-marini`** — Initial like counts:
```javascript
{ likes: [142, 167, 128, 155, 139, 163] }
```

**3. `wishes` collection** — 20 seed wish documents:
```javascript
// For each SEED_WISHES entry:
{ weddingId: 'dani-marini', name, message, attendance, createdAt: serverTimestamp() }
```

**Run:** `node scripts/seed-firestore.mjs`

**New files:** `scripts/seed-firestore.mjs`

**Depends on:** Task 1.2

**Note:** This script is idempotent-safe — it checks if `weddings/dani-marini` already exists before writing. Run once per fresh Firestore instance.

---

### Task 1.10 — Deploy Firestore security rules

**Scope:** Create `firestore.rules` file with rules from `FIRESTORE_INTEGRATION.md`.

**Action:** Create `firestore.rules` with the security rules. Create `firestore.indexes.json` with composite indexes.

**New files:** `firestore.rules`, `firestore.indexes.json`

**Depends on:** Nothing

---

### Task 1.11 — Update and create tests for Firestore wishes [DONE]

**Scope:** Mock Firestore in tests. Update existing tests and create new tests for new files.

**Action:**
- Use `vi.mock('../lib/firebase')` in each test file that needs it (Vitest inline mock pattern)
- Update `src/App.test.tsx` — mock `useWishes` and `addWish`, remove `SEED_WISHES` references
- Update `src/components/sections/RSVPSection.test.tsx` — `createdAt` may be `Timestamp`
- Create `src/hooks/useWishes.test.ts` — test hook with mocked Firestore
- Create `src/lib/wishes.test.ts` — test `addWish` with mocked Firestore
- Update `src/utils/formatDate.test.ts` — add test cases for `Timestamp` input

**Affected files:** `src/App.test.tsx`, `src/components/sections/RSVPSection.test.tsx`, `src/utils/formatDate.test.ts`

**New files:** `src/hooks/useWishes.test.ts`, `src/lib/wishes.test.ts`

**Depends on:** Task 1.8

---

## Phase 2: Full Wedding Data

> Goal: All couple-specific content loaded from Firestore. Constants file eliminated.

---

### Task 2.1 — Create `useWedding` hook [DONE]

**Scope:** One-time Firestore read for the wedding document.

**Action:** Create `src/hooks/useWedding.ts`:
```typescript
export function useWedding(slug: string) {
  const [wedding, setWedding] = useState<WeddingDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // getDoc(doc(db, 'weddings', slug)) on mount
  return { wedding, isLoading };
}
```

**New files:** `src/hooks/useWedding.ts`

**Depends on:** Task 1.2, Task 1.3

---

### Task 2.2 — Create `WeddingContext` [DONE]

**Scope:** React context to provide wedding data to all sections without prop drilling.

**Action:** Create `src/context/WeddingContext.tsx`:
```typescript
export const WeddingContext = createContext<WeddingDocument | null>(null);
export const useWeddingContext = () => useContext(WeddingContext);
// WeddingProvider wraps <main> in App.tsx
```

**New files:** `src/context/WeddingContext.tsx`

**Depends on:** Task 2.1

---

### Task 2.3 — Create derived data utilities [DONE]

**Scope:** Functions to compute display values from raw Firestore data.

**Action:** Create `src/utils/weddingDerived.ts`:
```typescript
export function deriveDateDisplay(eventDate: string): string { ... }
export function deriveDateShort(eventDate: string): string { ... }
export function deriveCalendarUrl(wedding: WeddingDocument): string { ... }
export function deriveTwibbonFilename(groom: string, bride: string): string { ... }
export function deriveWhatsappUrl(number: string): string { ... }
export function deriveCopyright(eventDate: string): string { ... }
export function deriveMetaTitle(groom: string, bride: string, dateShort: string): string { ... }
```

**New files:** `src/utils/weddingDerived.ts`

**Depends on:** Task 1.3

---

### Task 2.4 — Create gallery layout utility [DONE]

**Scope:** Auto-assign `span` and `shape` CSS classes to gallery items by index.

**Action:** Create `src/utils/galleryLayout.ts`:
```typescript
const LAYOUT_PATTERNS = [
  { span: 'col-span-1 row-span-1', shape: 'rounded-[2rem_5rem_2rem_5rem]' },
  { span: 'col-span-2 row-span-2', shape: 'rounded-[4rem_2rem_6rem_3rem]' },
  // ... 12 patterns total (extracted from current GALLERY_ITEMS)
];

export function getGalleryLayout(index: number) {
  return LAYOUT_PATTERNS[index % LAYOUT_PATTERNS.length];
}
```

**New files:** `src/utils/galleryLayout.ts`

**Depends on:** Nothing

---

### Task 2.5 — Update `App.tsx` for WeddingContext [DONE]

**Scope:** Wrap main content in `WeddingProvider`. Remove hardcoded music path and default guest.

**Changes:**
- Add `useWedding(WEDDING_SLUG)` call
- Wrap `<main>` in `<WeddingContext.Provider value={wedding}>`
- Replace hardcoded `'Tamu Terkasih Kami'` with `wedding.defaultGuest`
- Replace hardcoded music `src` with `wedding.musicUrl`
- Add loading state while wedding data loads
- Keep: `WEDDING_SLUG` constant (replaced by URL param in Task 5.1)

**Affected files:** `src/App.tsx`

**Depends on:** Task 2.2

---

### Task 2.6 — Update `CinematicOpening.tsx` [DONE]

**Scope:** Replace hardcoded names, city, date, image with context data.

**Changes:**
- Read from `useWeddingContext()`
- Replace: `"Dani"` → `wedding.groomNickname`
- Replace: `"Marini"` → `wedding.brideNickname`
- Replace: `"Surabaya"` → `wedding.eventCity`
- Replace: `WEDDING_DATE_SHORT` → `deriveDateShort(wedding.eventDate)`
- Replace: image src → `wedding.openingImage`
- Remove: import of `WEDDING_DATE_SHORT` from constants

**Affected files:** `src/components/sections/CinematicOpening.tsx`

**Depends on:** Task 2.2, Task 2.3

---

### Task 2.7 — Update `HeroSection.tsx` [DONE]

**Scope:** Replace hardcoded names, date, city, image.

**Changes:**
- Read from `useWeddingContext()`
- Replace: `"Dani"`, `"Marini"`, date display, location, image src
- Remove: import of `WEDDING_DATE_DISPLAY` from constants

**Affected files:** `src/components/sections/HeroSection.tsx`

**Depends on:** Task 2.2, Task 2.3

---

### Task 2.8 — Update `CoupleSection.tsx` [DONE]

**Scope:** Replace all 8 hardcoded couple values.

**Changes:**
- Read from `useWeddingContext()`
- Replace: groom name, parents, photo, alt text
- Replace: bride name, parents, photo, alt text

**Affected files:** `src/components/sections/CoupleSection.tsx`

**Depends on:** Task 2.2

---

### Task 2.9 — Update `EventSection.tsx` [DONE]

**Scope:** Replace date, ceremonies, venue, Quran verse, calendar link.

**Changes:**
- Read from `useWeddingContext()`
- Replace: all constant imports (`WEDDING_DATE`, `WEDDING_DATE_DISPLAY`, `VENUE`)
- Replace: hardcoded ceremony blocks with `wedding.ceremonies.map(...)` loop
- Replace: Quran verse fields
- Replace: Google Calendar URL with `deriveCalendarUrl(wedding)`
- Remove: all 3 imports from `constants/wedding`

**Affected files:** `src/components/sections/EventSection.tsx`

**Depends on:** Task 2.2, Task 2.3

---

### Task 2.10 — Update `CinematicStory.tsx` (content only) [DONE]

**Scope:** Replace `STORY_SLIDES` constant with context data. Likes/comments stay in Phase 3.

**Changes:**
- Read from `useWeddingContext()`
- Replace: `STORY_SLIDES` → `wedding.story`
- Replace: `slide.bg` → `slide.bgImage` (field name change)
- Keep: `INITIAL_LIKES` and in-memory comments (Phase 3)
- Remove: import of `STORY_SLIDES` from constants

**Affected files:** `src/components/sections/CinematicStory.tsx`

**Depends on:** Task 2.2

---

### Task 2.11 — Update `DigitalEnvelope.tsx` [DONE]

**Scope:** Replace `BANK_ACCOUNTS` with context data.

**Changes:**
- Read from `useWeddingContext()`
- Replace: `BANK_ACCOUNTS` → `wedding.giftAccounts`
- Remove: import of `BANK_ACCOUNTS` from constants

**Affected files:** `src/components/sections/DigitalEnvelope.tsx`

**Depends on:** Task 2.2

---

### Task 2.12 — Update `PhotoGallery.tsx` [DONE]

**Scope:** Replace `GALLERY_ITEMS` with context data + auto-layout.

**Changes:**
- Read from `useWeddingContext()`
- Replace: `GALLERY_ITEMS` → `wedding.gallery.map((src, i) => ({ src, ...getGalleryLayout(i) }))`
- Remove: import of `GALLERY_ITEMS` from constants

**Affected files:** `src/components/sections/PhotoGallery.tsx`

**Depends on:** Task 2.2, Task 2.4

---

### Task 2.13 — Update `TwibbonCreator.tsx` [DONE]

**Scope:** Replace overlay URL and download filename.

**Changes:**
- Read from `useWeddingContext()`
- Replace: `OVERLAY_SRC` → `wedding.twibbonOverlay`
- Replace: `'Memori-Dani-Marini.png'` → `deriveTwibbonFilename(wedding.groomNickname, wedding.brideNickname)` in **two places**: `new File(...)` constructor (Web Share API) and `link.download` (download fallback)

**Affected files:** `src/components/features/TwibbonCreator.tsx`

**Depends on:** Task 2.2, Task 2.3

---

### Task 2.14 — Update `Footer.tsx` [DONE]

**Scope:** Replace all hardcoded names, bios, social links, copyright, icons.

**Changes:**
- Read from `useWeddingContext()`
- Replace: credit names, descriptions from `wedding.credits[]`
- Replace: social URLs from `wedding.groom*`/`wedding.bride*` fields
- Replace: WhatsApp URLs with `deriveWhatsappUrl(wedding.groomWhatsapp)`
- Replace: copyright year with `deriveCopyright(wedding.eventDate)`
- Map credit icons from `role` field: `role === 'developer'` → `<Code>`, `role === 'designer'` → `<Palette>`, default → `<Heart>`

**Affected files:** `src/components/sections/Footer.tsx`

**Depends on:** Task 2.2, Task 2.3

---

### Task 2.15 — Update `ErrorBoundary.tsx` [DONE]

**Scope:** Replace hardcoded fallback text. Class component cannot use hooks — pass data as props.

**Changes:**
- Add props: `groomNickname`, `brideNickname`, `dateDisplay`, `venueName`, `eventCity`
- Update `App.tsx` to pass these props from wedding context
- Replace: `"Dani & Marini"` → `${groomNickname} & ${brideNickname}`
- Replace: date and venue from props
- Remove: import of `WEDDING_DATE_DISPLAY` from constants

**Affected files:** `src/components/ui/ErrorBoundary.tsx`, `src/main.tsx` or `src/App.tsx`

**Depends on:** Task 2.2

---

### Task 2.16 — Delete constants files [DONE]

**Scope:** Remove `constants/wedding.ts` and `constants/wishes.ts` — all data now from Firestore.

**Action:**
- Delete `src/constants/wedding.ts`
- Delete `src/constants/wishes.ts`
- Verify no remaining imports reference these files
- Delete or update `src/constants/wedding.test.ts` and `src/constants/wishes.test.ts`

**Affected files:** `src/constants/wedding.ts`, `src/constants/wishes.ts`, related tests

**Depends on:** All Task 2.x completed

---

### Task 2.17 — Update `index.html` meta tags (client-side) [DONE]

**Scope:** Dynamically set meta tags after wedding data loads.

**Action:** Add `useEffect` in `App.tsx` that updates `document.title` and meta tags:
```typescript
useEffect(() => {
  if (!wedding) return;
  document.title = deriveMetaTitle(wedding.groomNickname, wedding.brideNickname, ...);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', ...);
  // ... other meta tags
}, [wedding]);
```

**Affected files:** `src/App.tsx`

**Depends on:** Task 2.5

**Note:** Loading screen and noscript in `index.html` stay hardcoded for now (Phase 5 for SSR).

---

### Task 2.18 — Update all section tests + create tests for new files [DONE]

**Scope:** Mock `WeddingContext` in all section test files. Create co-located tests for all new Phase 2 files.

**Action:**
- Create test helper: `renderWithWedding(component, weddingData)` that wraps in `WeddingContext.Provider`
- Update all section tests to use the helper
- Update snapshot tests if any
- Remove references to deleted constants
- Create `src/hooks/useWedding.test.ts` — test hook with mocked Firestore
- Create `src/context/WeddingContext.test.tsx` — test provider and `useWeddingContext` hook
- Create `src/utils/weddingDerived.test.ts` — test all derive* functions
- Create `src/utils/galleryLayout.test.ts` — test layout pattern assignment

**Affected files:** All `*.test.tsx` files in `src/components/sections/`

**New files:** `src/hooks/useWedding.test.ts`, `src/context/WeddingContext.test.tsx`, `src/utils/weddingDerived.test.ts`, `src/utils/galleryLayout.test.ts`

**Depends on:** All Task 2.x completed

---

## Phase 3: Story Interactions

> Goal: Story likes and comments persisted in Firestore.

---

### Task 3.1 — Create `useStoryLikes` hook [DONE]

**Scope:** Read and increment story likes from Firestore.

**Action:** Create `src/hooks/useStoryLikes.ts`:
```typescript
export function useStoryLikes(slug: string) {
  // Read: getDoc(doc(db, 'story-likes', slug))
  // Increment: runTransaction to read + increment likes[slideIndex] + write
  return { likes, incrementLike };
}
```

**New files:** `src/hooks/useStoryLikes.ts`

**Depends on:** Task 1.2

---

### Task 3.2 — Create `useStoryComments` hook [DONE]

**Scope:** Real-time listener for story comments per slide.

**Action:** Create `src/hooks/useStoryComments.ts`:
```typescript
export function useStoryComments(weddingId: string, slideIndex: number) {
  // query: where('weddingId', ==).where('slideIndex', ==).orderBy('createdAt', 'desc').limit(50)
  // onSnapshot listener
  // addComment function: addDoc with serverTimestamp()
  return { comments, addComment };
}
```

**New files:** `src/hooks/useStoryComments.ts`

**Depends on:** Task 1.2

---

### Task 3.3 — Update `CinematicStory.tsx` for Firestore interactions [DONE]

**Scope:** Replace in-memory likes/comments with Firestore hooks.

**Changes:**
- Replace: `INITIAL_LIKES` → `useStoryLikes(slug).likes`
- Replace: `handleLike` state mutation → `incrementLike(slideIndex)`
- Call `useStoryComments(slug, activeSlide)` at the **component top level** (NOT inside `.map()` — hooks cannot be called in loops). Only load comments for the active slide.
- Replace: `handleAddComment` state mutation → `addComment({ name, text })`
- Remove: `storyStats` useState entirely
- Keep: `commentInput` local state (form input, not persisted until submit)

**IMPORTANT:** `useStoryComments` must be called with `activeSlide` as the second argument at the top of the component, not inside the slide loop. This respects React's Rules of Hooks.

**Affected files:** `src/components/sections/CinematicStory.tsx`

**Depends on:** Task 3.1, Task 3.2, Task 2.10

---

### Task 3.4 — Update `AmbientSocialLayer` data source [DONE]

**Scope:** Feed real-time Firestore comments to the ambient layer.

**Changes:**
- `customComments` prop already receives comments array from `CinematicStory`
- After Task 3.3, this prop will receive Firestore comments instead of in-memory ones
- No changes needed to `AmbientSocialLayer.tsx` itself — only its data source changes

**Affected files:** None (data flow change handled by Task 3.3)

**Depends on:** Task 3.3

---

### Task 3.5 — (Merged into Task 1.9 — Seed ALL initial Firestore documents)

---

### Task 3.6 — Update story tests [DONE]

**Scope:** Mock Firestore hooks in `CinematicStory.test.tsx`.

**Action:**
- Mock `useStoryLikes` and `useStoryComments` hooks
- Update tests for like/comment behavior
- Remove `INITIAL_LIKES` references

**Affected files:** `src/components/sections/CinematicStory.test.tsx`

**Depends on:** Task 3.3

---

## Phase 3.5: Theme System

> Goal: Replace flat theme fields with a flexible theme object that supports multiple templates, custom colors, and custom fonts. Each template has sensible defaults. The admin form (Phase 4) will let users pick a template and override individual values via color pickers and font dropdowns.

---

### Task 3.5.1 — Update `WeddingDocument` type for theme object [DONE]

**Scope:** Replace flat `themeTemplate`, `themeGold`, `themeIvory` fields with a nested `theme` object containing `template`, `colors`, and `fonts`.

**Action:** Update `src/types/firestore.ts`:

Remove:
```typescript
themeTemplate: string;
themeGold: string;
themeIvory: string;
```

Add:
```typescript
export interface ThemeColors {
  accent: string;      // CSS --color-gold     — admin label: "Warna Aksen"
  background: string;  // CSS --color-ivory    — admin label: "Warna Latar"
  text: string;        // CSS --color-ink      — admin label: "Warna Teks"
  surface: string;     // CSS --color-paper & --color-sepia — admin label: "Warna Permukaan"
  button: string;      // CSS --color-rose-pastel — admin label: "Warna Tombol"
}

export interface ThemeFonts {
  heading: string;     // CSS --font-serif     — admin label: "Font Judul"
  body: string;        // CSS --font-sans      — admin label: "Font Isi"
  decorative: string;  // CSS --font-display   — admin label: "Font Dekoratif"
  script: string;      // CSS --font-dayland   — admin label: "Font Tulisan Tangan"
}

export interface WeddingTheme {
  template: string;    // 'cinematic' | future templates
  colors: ThemeColors;
  fonts: ThemeFonts;
}
```

Update `WeddingDocument`:
```typescript
theme: WeddingTheme;   // replaces themeTemplate, themeGold, themeIvory
```

**Affected files:** `src/types/firestore.ts`

**Depends on:** Nothing

---

### Task 3.5.2 — Create theme defaults and constants [DONE]

**Scope:** Define default theme values for the "cinematic" template. Future templates will add entries here.

**Action:** Create `src/constants/themeDefaults.ts`:
```typescript
import { WeddingTheme } from '../types/firestore';

export const THEME_DEFAULTS: Record<string, WeddingTheme> = {
  cinematic: {
    template: 'cinematic',
    colors: {
      accent: '#B48D3E',
      background: '#FDFCF8',
      text: '#1A1A1A',
      surface: '#F5F2ED',
      button: '#F8BBD0',
    },
    fonts: {
      heading: 'Cormorant Garamond',
      body: 'Montserrat',
      decorative: 'Playfair Display',
      script: 'Dayland',
    },
  },
};
```

**New files:** `src/constants/themeDefaults.ts`

**Depends on:** Task 3.5.1

---

### Task 3.5.3 — Apply theme CSS variables at runtime [DONE]

**Scope:** Read `wedding.theme` from context and override CSS custom properties on `document.documentElement` so all Tailwind classes automatically use the Firestore values.

**Action:** Add a `useEffect` in `src/App.tsx`:
```typescript
useEffect(() => {
  if (!wedding?.theme) return;
  const root = document.documentElement;
  const { colors, fonts } = wedding.theme;
  root.style.setProperty('--color-gold', colors.accent);
  root.style.setProperty('--color-ivory', colors.background);
  root.style.setProperty('--color-ink', colors.text);
  root.style.setProperty('--color-paper', colors.surface);
  root.style.setProperty('--color-sepia', colors.surface);
  root.style.setProperty('--color-rose-pastel', colors.button);
  root.style.setProperty('--font-serif', fonts.heading);
  root.style.setProperty('--font-sans', fonts.body);
  root.style.setProperty('--font-display', fonts.decorative);
  root.style.setProperty('--font-dayland', fonts.script);
}, [wedding]);
```

The `@theme` block in `src/index.css` stays unchanged — it provides compile-time defaults.

**IMPORTANT:** Setting `--font-serif` to a font name only works if the font files are loaded. See Task 3.5.9 for dynamic font loading.

**Affected files:** `src/App.tsx`

**Depends on:** Task 3.5.1

---

### Task 3.5.4 — Fix hardcoded hex/rgba color values in components [DONE]

**Scope:** Multiple components use literal hex or rgba color values instead of CSS variables. Replace them so they respond to theme changes.

**Action:**

Gold-derived colors (`#B48D3E` / `rgba(180, 141, 62, ...)` / `rgba(212, 175, 55, ...)`):
- `src/components/sections/Footer.tsx` line 16 — `color: '#B48D3E'` → `var(--color-gold)`
- `src/components/features/RSVPModal.tsx` line 99 — `backgroundColor: '#a07a2e'` and `color: '#FDFCF8'` → use CSS variables or Tailwind classes
- `src/index.css` line 90 — `.bubble-glow` `box-shadow: rgba(180, 141, 62, 0.15)` → use CSS variable
- `src/components/sections/CinematicOpening.tsx` line 46 — `drop-shadow-[0_0_12px_rgba(180,141,62,0.6)]` → derive from CSS variable
- `src/components/sections/RSVPSection.tsx` line 18 — `rgba(180,141,62,0.03)` in radial gradient → derive from CSS variable
- `src/components/sections/RSVPSection.tsx` line 35 — `rgba(212,175,55,0.35)` in box-shadow → derive from CSS variable
- `src/components/sections/RSVPSection.tsx` lines 78, 84 — `rgba(212, 175, 55, 0.05)` in whileHover → derive from CSS variable

**Implementation notes:**
- For Tailwind arbitrary classes (e.g. `bg-[radial-gradient(...)]`, `shadow-[...]`, `drop-shadow-[...]`): use `color-mix(in srgb, var(--color-gold) N%, transparent)` or convert to Tailwind opacity modifiers like `bg-gold/5` where possible
- For Framer Motion inline styles (`whileHover={{ backgroundColor: 'rgba(...)' }}`): either use `color-mix(in srgb, var(--color-gold) N%, transparent)` or replace with Tailwind `hover:bg-gold/5` class (removing the color from `whileHover` and keeping only `scale`)
- For CSS `box-shadow` in `index.css`: use `color-mix()` or define `--color-gold-rgb` for `rgba(var(--color-gold-rgb), opacity)` pattern
- `color-mix()` has 95%+ global browser support (baseline 2023) — safe for this project

**Note:** Twibbon-specific colors (`#F2EEE9`, `#8E8A85` in `TwibbonCreator.tsx`) are not theme colors — they are part of the twibbon frame design and should stay hardcoded.

**Affected files:** `src/components/features/RSVPModal.tsx`, `src/components/sections/Footer.tsx`, `src/index.css`, `src/components/sections/CinematicOpening.tsx`, `src/components/sections/RSVPSection.tsx`

**Depends on:** Task 3.5.3

---

### Task 3.5.5 — Update seed script for theme object [DONE]

**Scope:** Update `scripts/seed-firestore.mjs` to use the new `theme` structure.

**Migration note:** If Firestore already has a `weddings/dani-marini` document with old flat fields (`themeTemplate`, `themeGold`, `themeIvory`), it needs manual migration — either delete and re-seed, or run a one-time Firestore update to move the flat fields into the `theme` object and delete the old fields. The app won't crash on old data (Task 3.5.3 has `if (!wedding?.theme) return;` fallback to CSS defaults), but themes won't apply until the document is migrated. The seed script is idempotent — it skips if the document already exists, so re-seeding requires deleting the existing document first.

**Action:** Replace:
```javascript
themeTemplate: 'cinematic',
themeGold: '#B48D3E',
themeIvory: '#FDFCF8',
```

With:
```javascript
theme: {
  template: 'cinematic',
  colors: {
    accent: '#B48D3E',
    background: '#FDFCF8',
    text: '#1A1A1A',
    surface: '#F5F2ED',
    button: '#F8BBD0',
  },
  fonts: {
    heading: 'Cormorant Garamond',
    body: 'Montserrat',
    decorative: 'Playfair Display',
    script: 'Dayland',
  },
},
```

**Affected files:** `scripts/seed-firestore.mjs`

**Depends on:** Task 3.5.1

---

### Task 3.5.6 — Update tests for theme object [DONE]

**Scope:** Update all test files that mock `WeddingDocument` to include the new `theme` field. Add tests for the CSS variable override and dynamic font loading `useEffect`s. Update tests for all hardcoded hex fixes.

**Action:**
- Add `theme` object to mock wedding data in:
  - `src/App.test.tsx` — inline mock in `vi.mock('./hooks/useWedding')` (no `theme` field currently — needed for CSS override and font loading `useEffect`s)
  - `src/context/WeddingContext.test.tsx` — `MOCK_WEDDING` uses `as WeddingDocument` cast (line 15)
  - `src/utils/weddingDerived.test.ts` — uses `as WeddingDocument` cast (line 29)
- Add tests in `src/App.test.tsx` for:
  - CSS variable override behavior (Task 3.5.3)
  - Dynamic Google Fonts loading (Task 3.5.9)
- Update `src/components/features/RSVPModal.test.tsx` for the hardcoded hex fix
- Update `src/components/sections/Footer.test.tsx` for the hardcoded hex fix
- Update `src/components/sections/CinematicOpening.test.tsx` for drop-shadow fix
- Update `src/components/sections/RSVPSection.test.tsx` for rgba fixes
- Create `src/constants/themeDefaults.test.ts` — test default values exist and have correct shape

**Affected files:** `src/App.test.tsx`, `src/context/WeddingContext.test.tsx`, `src/utils/weddingDerived.test.ts`, `src/components/features/RSVPModal.test.tsx`, `src/components/sections/Footer.test.tsx`, `src/components/sections/CinematicOpening.test.tsx`, `src/components/sections/RSVPSection.test.tsx`

**New files:** `src/constants/themeDefaults.test.ts`

**Depends on:** Task 3.5.4, Task 3.5.5, Task 3.5.9

---

### Task 3.5.7 — Update documentation [DONE]

**Scope:** Update Firestore schema docs to reflect the new theme structure. Also catch up documentation for Phase 3 additions that were not documented.

**Action:**
- Update `FIRESTORE_INTEGRATION.md`:
  - Replace `themeTemplate`/`themeGold`/`themeIvory` with `theme` object in schema section
  - Update admin form table (page 8 "Kustom") to reference `theme.template`, `theme.colors.*`, `theme.fonts.*`
  - Update `WeddingDocument` TypeScript block
- Update `DOCUMENTATION.md`:
  - Update Firestore fields table — replace old theme fields with `theme` object
  - Add `story-comments` collection to the Firestore collections table (currently missing)
  - Add `useStoryLikes.ts` and `useStoryComments.ts` to the hooks directory listing (currently missing)
- Update `FIRESTORE_INTEGRATION_TASK.md` Task 1.9 description — the inline seed data example still shows old flat `themeTemplate`/`themeGold`/`themeIvory` fields; update to match the new `theme` object structure

**Affected files:** `FIRESTORE_INTEGRATION.md`, `DOCUMENTATION.md`, `FIRESTORE_INTEGRATION_TASK.md`

**Depends on:** Task 3.5.6

---

### Task 3.5.8 — Update `drawOverlay` to accept dynamic data [DONE]

**Scope:** `src/utils/twibbonOverlay.ts` has hardcoded couple-specific data drawn on the canvas: `'Dani'`, `'Marini'`, `'Surabaya 29 Agustus 2026'`, `'Turut Menyertai Hari Bahagia'`, and hardcoded font names `'Playfair Display'`, `'Dayland'`. This function is currently **dead code** (only imported by its own test file, not used by any component), but it should be updated to accept parameters so it can be used dynamically in the future.

**Action:** Update `drawOverlay` signature:
```typescript
interface OverlayData {
  groomNickname: string;
  brideNickname: string;
  locationDate: string;     // e.g. "Surabaya 29 Agustus 2026"
  tagline?: string;         // e.g. "Turut Menyertai Hari Bahagia"
  fonts?: {
    decorative: string;     // for tagline + location (default: 'Playfair Display')
    script: string;         // for names (default: 'Dayland')
  };
}

export function drawOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, data: OverlayData) {
  // Replace hardcoded strings with data.groomNickname, data.brideNickname, etc.
  // Use data.fonts?.decorative ?? 'Playfair Display' for font fallback
}
```

**Affected files:** `src/utils/twibbonOverlay.ts`, `src/utils/twibbonOverlay.test.ts`

**Depends on:** Task 3.5.1

---

### Task 3.5.9 — Dynamic Google Fonts loading at runtime [DONE]

**Scope:** Google Fonts are currently hardcoded in `index.html` (`Cormorant Garamond`, `Playfair Display`, `Montserrat`). The `Dayland` font is loaded via `@font-face` in `index.css` from `/fonts/Dayland.ttf`. If the admin picks different fonts via the theme system, the browser won't have the font files — setting `--font-serif` to `'Lora'` has no effect without loading Lora's CSS.

**Action:** Add a `useEffect` in `src/App.tsx` (alongside Task 3.5.3's CSS override) that dynamically injects a Google Fonts `<link>` tag:

```typescript
useEffect(() => {
  if (!wedding?.theme?.fonts) return;
  const { heading, body, decorative } = wedding.theme.fonts;
  // script font (Dayland) is a local bundled font — not from Google Fonts
  const families = [heading, body, decorative]
    .filter(Boolean)
    .map(f => f.replace(/ /g, '+'))
    .join('&family=');
  if (!families) return;
  const id = 'dynamic-google-fonts';
  let link = document.getElementById(id) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  link.href = `https://fonts.googleapis.com/css2?family=${families}:ital,wght@0,400;0,500;0,700;0,900;1,400&display=swap`;
}, [wedding]);
```

**Note on font weights:** The URL must include all weights used in the app (`font-normal`=400, `font-medium`=500, `font-bold`=700, `font-black`=900, plus italic 400). Using a broad weight range ensures any Google Font works regardless of which weights it supports — the API returns only available weights.

The hardcoded `<link>` tags in `index.html` stay as-is — they serve as the default font loading for the cinematic template (fast initial load). The dynamic `<link>` only fires if fonts differ from the defaults. In Phase 5, SSR can inject the correct fonts directly into `index.html`.

**Note:** The script font (`Dayland`) is bundled locally in `/fonts/Dayland.ttf`. If future templates want to swap the script font, that font must also be bundled or loaded from Google Fonts. For now, `Dayland` stays as the only script font option.

**Affected files:** `src/App.tsx`

**Depends on:** Task 3.5.3

---

## Phase 4: Admin Form

> Goal: Mobile-first form for couples to manage their wedding data.

---

### Task 4.1 — Install Firebase Auth [DONE]

**Scope:** Add authentication for admin access.

**Action:** Update `src/lib/firebase.ts` to export `getAuth(app)`.

**Affected files:** `src/lib/firebase.ts`

**Depends on:** Task 1.2

---

### Task 4.2 — Create admin route/page structure [DONE]

**Scope:** Add routing (React Router or simple conditional) for admin pages.

**Action:**
- Install `react-router-dom` if using routes
- Create `src/pages/Admin.tsx` with 8 form steps
- Create `src/pages/Wedding.tsx` wrapping current `App` content
- Update entry point for routing

**New files:** `src/pages/Admin.tsx`, `src/pages/Wedding.tsx`, routing setup

**Depends on:** Task 4.1

---

### Task 4.3 — Create admin form components (8 pages) [DONE]

**Scope:** Build mobile-first form pages.

**Action:** Create one component per form page:
1. `src/components/admin/CoupleForm.tsx` — 6 text + 2 upload
2. `src/components/admin/EventForm.tsx` — date picker + venue + ceremonies
3. `src/components/admin/StoryForm.tsx` — repeatable slides
4. `src/components/admin/GalleryForm.tsx` — multi-photo upload
5. `src/components/admin/GiftForm.tsx` — repeatable bank accounts
6. `src/components/admin/MediaForm.tsx` — file uploads + selectors + twibbon overlay (upload custom PNG **or** auto-generate default overlay)
7. `src/components/admin/SocialForm.tsx` — URL fields
8. `src/components/admin/CustomizeForm.tsx` — Quran presets + template dropdown (pre-fills defaults from `THEME_DEFAULTS`) + 5 color pickers (Warna Aksen, Warna Latar, Warna Teks, Warna Permukaan, Warna Tombol) + 4 font dropdowns (Font Judul, Font Isi, Font Dekoratif, Font Tulisan Tangan)

**New files:** 8 form components

**Depends on:** Task 4.2, Task 3.5.2 (CustomizeForm imports `THEME_DEFAULTS`)

**Twibbon overlay generation flow (MediaForm — Option A: client-side):**

When the admin does NOT upload a custom twibbon overlay PNG, `MediaForm` auto-generates one using `drawOverlay()`:

```
1. Admin opens MediaForm → twibbon overlay section
2. Two options:
   a. "Upload" — upload custom PNG → uploadFile() → saves URL to wedding.twibbonOverlay
   b. "Buat Otomatis" — generate default overlay:
      → Show loading spinner
      → Create offscreen canvas (1080×1920)
      → Call drawOverlay(ctx, 1080, 1920, { groomNickname, brideNickname, locationDate, fonts })
      → canvas.toBlob() → uploadFile() to Firebase Storage
      → Save download URL to wedding.twibbonOverlay
      → Show preview of generated overlay
3. Result: wedding.twibbonOverlay always has a URL — either uploaded or generated
4. TwibbonCreator.tsx uses the URL as-is (no runtime canvas rendering needed)
```

This ensures the overlay is generated once and stored as a static PNG — no client-side canvas rendering for wedding guests. Requires Task 3.5.8 (`drawOverlay` parameterized) and Task 4.4 (`uploadFile` utility).

---

### Task 4.4 — Create Firebase Storage upload utility [DONE]

**Scope:** Upload images/music to Firebase Storage and return download URLs.

**Action:** Create `src/lib/storage.ts`:
```typescript
export async function uploadFile(path: string, file: File): Promise<string> {
  const ref = storageRef(storage, path);
  await uploadBytes(ref, file);
  return getDownloadURL(ref);
}
```

**New files:** `src/lib/storage.ts`

**Depends on:** Task 1.2

---

### Task 4.5 — Wire admin form to Firestore writes [DONE]

**Scope:** Each form page saves its fields to `weddings/{slug}` on submit.

**Action:** Use `updateDoc(doc(db, 'weddings', slug), { ...pageFields })` per page.

**Affected files:** All admin form components

**Depends on:** Task 4.3, Task 4.4

---

## Phase 5: Multi-Couple & SSR

> Goal: Multiple weddings, slug-based routing, dynamic meta tags.

---

### Task 5.1 — Add slug-based routing [DONE]

**Scope:** Load wedding by URL slug instead of hardcoded constant.

**Action:** Route `/:slug` → wedding page. Extract slug from URL params. Replace `WEDDING_SLUG` constant in `App.tsx` — used in 4 places: `useWedding(WEDDING_SLUG)`, `useWishes(WEDDING_SLUG)`, `addWish(WEDDING_SLUG, ...)`, `<CinematicStory weddingSlug={WEDDING_SLUG} />`.

**Affected files:** Routing setup, `src/App.tsx`

**Depends on:** Phase 3.5 complete

---

### Task 5.2 — Dynamic meta tags via Cloud Functions [DONE]

**Scope:** SSR for OG tags so social media crawlers get correct previews per couple.

**Action:** Firebase Cloud Function (`ssrMeta`) reads Firestore and generates minimal HTML with correct meta tags. Vercel API route (`api/ssr-meta.ts`) proxies crawler requests to the function. Vercel rewrites in `vercel.json` route crawlers (detected via user-agent header) to the API route; normal users get the SPA.

**New files:** `functions/src/index.ts` (rewritten), `api/ssr-meta.ts`, `vercel.json`

**Setup required:** Set `SSR_META_URL` environment variable in Vercel dashboard pointing to the deployed Cloud Function URL (e.g. `https://asia-southeast2-wedding-invitation-ff7ad.cloudfunctions.net/ssrMeta`).

**Depends on:** Task 5.1

---

### Task 5.3 — Dynamic loading screen [DONE]

**Scope:** Replace hardcoded "Dani & Marini" and hardcoded theme colors in HTML loading screen and noscript fallback.

**Action:** Cloud Function injects couple names and theme colors into the HTML loading screen template:
- Replace `Dani & Marini` → `${groomNickname} & ${brideNickname}`
- Replace `#FDFCF8` (ivory) → `wedding.theme.colors.background`
- Replace `#B48D3E` (gold) → `wedding.theme.colors.accent`
- Replace `#1A1A1A` (ink) → `wedding.theme.colors.text`
- Replace hardcoded Google Fonts URL → URL built from `wedding.theme.fonts`
- Replace `theme-color` meta → `wedding.theme.colors.text`
- Replace favicon SVG fill → `wedding.theme.colors.accent`
- Also update noscript block with same dynamic values

**Affected files:** `index.html` (templated), `functions/index.ts`

**Depends on:** Task 5.2

---

## Summary

| Phase | Tasks | New files | Changed files | Deletable files |
|---|---|---|---|---|
| 1 | 11 | 8 (`firebase.ts`, `.env.example`, `firestore.ts`, `useWishes.ts`, `wishes.ts`, `useWishes.test.ts`, `wishes.test.ts`, `seed-firestore.mjs`, `firestore.rules`, `firestore.indexes.json`) | 4 (`types/index.ts`, `formatDate.ts`, `App.tsx`, `formatDate.test.ts`) | 0 |
| 2 | 18 | 8 (`useWedding.ts`, `WeddingContext.tsx`, `weddingDerived.ts`, `galleryLayout.ts`, `useWedding.test.ts`, `WeddingContext.test.tsx`, `weddingDerived.test.ts`, `galleryLayout.test.ts`) | 14 (all sections + `App.tsx` + `ErrorBoundary.tsx`) | 2 (`constants/*.ts` + their tests) |
| 3 | 5 (3.1–3.4, 3.6; Task 3.5 merged into 1.9) | 4 (`useStoryLikes.ts`, `useStoryComments.ts`, `useStoryLikes.test.ts`, `useStoryComments.test.ts`) | 2 (`CinematicStory.tsx`, `CinematicStory.test.tsx`) | 0 |
| 3.5 | 9 | 2 (`themeDefaults.ts`, `themeDefaults.test.ts`) | 10 (`firestore.ts`, `App.tsx`, `RSVPModal.tsx`, `Footer.tsx`, `index.css`, `CinematicOpening.tsx`, `RSVPSection.tsx`, `twibbonOverlay.ts`, `seed-firestore.mjs`, docs) | 0 |
| 4 | 5 | 11 (admin pages + `storage.ts`) | 2 (`firebase.ts`, routing) | 0 |
| 5 | 3 | 2 (`functions/index.ts`, `firebase.json`) | 2 (`index.html`, `App.tsx`) | 0 |
| **Total** | **51** | **33** | **34** | **2** |

---

## Execution Order (Critical Path)

```
Task 1.1 (install firebase)
  ↓
Task 1.2 (firebase config)  →  Task 1.3 (types)
  ↓                              ↓
Task 1.4 (update GuestWishes type)
  ↓
Task 1.5 (formatDate) + Task 1.6 (useWishes) + Task 1.7 (addWish)
  ↓
Task 1.8 (update App.tsx)
  ↓
Task 1.9 (seed ALL docs: wedding + wishes + story-likes) + Task 1.10 (security rules) + Task 1.11 (tests)
  ↓
═══ Phase 1 Complete ═══
  ↓
Task 2.1 (useWedding) + Task 2.3 (derived utils) + Task 2.4 (gallery layout)
  ↓
Task 2.2 (WeddingContext)
  ↓
Task 2.5-2.15 (update all sections — parallelizable)
  ↓
Task 2.16 (delete constants) + Task 2.17 (meta tags) + Task 2.18 (tests)
  ↓
═══ Phase 2 Complete ═══
  ↓
Task 3.1-3.6 (story interactions — parallelizable)
  ↓
═══ Phase 3 Complete ═══
  ↓
Task 3.5.1 (update WeddingDocument type for theme)
  ↓
Task 3.5.2 (theme defaults) + Task 3.5.3 (runtime CSS override) + Task 3.5.5 (seed script) + Task 3.5.8 (drawOverlay params)
  ↓
Task 3.5.4 (fix hardcoded hex/rgba values — 5 files) + Task 3.5.9 (dynamic Google Fonts loading)
  ↓
Task 3.5.6 (tests) + Task 3.5.7 (docs)
  ↓
═══ Phase 3.5 Complete ═══
  ↓
Task 4.1 (Firebase Auth) + Task 4.4 (Storage upload utility)
  ↓
Task 4.2 (admin route/page structure)
  ↓
Task 4.3 (8 admin form components)
  ↓
Task 4.5 (wire forms to Firestore writes)
  ↓
═══ Phase 4 Complete ═══
  ↓
Task 5.1 (slug-based routing — replace WEDDING_SLUG)
  ↓
Task 5.2 (SSR meta tags via Cloud Functions)
  ↓
Task 5.3 (dynamic loading screen)
  ↓
═══ Phase 5 Complete ═══
```
