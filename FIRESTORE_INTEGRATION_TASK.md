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

### Task 1.3 — Create Firestore types

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

### Task 1.4 — Update `GuestWishes` type for Timestamp compatibility

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

### Task 1.5 — Update `formatDate` to handle Firestore Timestamp

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

### Task 1.6 — Create `useWishes` hook

**Scope:** Real-time Firestore listener for wishes collection, replacing `SEED_WISHES`.

**Action:** Create `src/hooks/useWishes.ts`:
```typescript
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GuestWishes } from '../types';

export function useWishes(weddingId: string) {
  const [wishes, setWishes] = useState<GuestWishes[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'wishes'),
      where('weddingId', '==', weddingId),
      orderBy('createdAt', 'desc')
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

### Task 1.7 — Create `addWish` function

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

### Task 1.8 — Update `App.tsx` to use Firestore wishes

**Scope:** Replace `useState(SEED_WISHES)` with `useWishes` hook. Replace `handleRSVPSubmit` to call `addWish`.

**Changes:**
- Remove import: `SEED_WISHES` from `./constants/wishes`
- Add import: `useWishes` from `./hooks/useWishes`, `addWish` from `./lib/wishes`
- Add constant: `const WEDDING_SLUG = 'dani-marini'` (temporary, replaced in Phase 2)
- Replace: `const [wishes, setWishes] = useState(SEED_WISHES)` → `const { wishes } = useWishes(WEDDING_SLUG)`
- Update `handleRSVPSubmit`: call `addWish(WEDDING_SLUG, { name, message, attendance })` instead of `setWishes(prev => ...)`
- Remove: `setWishes` related logic (functional updater no longer needed)
- Keep: `wishPages` pagination logic (works on any `GuestWishes[]`)

**Affected files:** `src/App.tsx`

**Depends on:** Task 1.6, Task 1.7

---

### Task 1.9 — Seed ALL initial Firestore documents

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
  venueMapsUrl: '...',  // full Google Maps URL
  ceremonies: [
    { name: 'Akad Nikah', start: '09:00', end: '10:00' },
    { name: 'Resepsi', start: '10:00', end: '13:00' },
  ],

  // Story
  story: [
    { year: '2016 — 2017', text: 'Berawal dari chat...', bgImage: '/images/bride_face_potrait.jpeg' },
    { year: '2018 — 2022', text: 'Kita berjalan...', bgImage: '/images/groom_face_potrait.jpeg' },
    // ... all 6 slides from constants/wedding.ts
  ],

  // Gallery (URLs only)
  gallery: [
    '/images/bride_face_potrait.jpeg',
    '/images/bride_and_groom_full_body_potrait.jpeg',
    // ... all 12 items
  ],

  // Gift
  giftAccounts: [
    { bank: 'BCA', account: '1234567890', owner: 'M. Daniansyah Chusyaidin' },
    // ... all 6 accounts
  ],

  // Media
  musicUrl: '/musics/adele-make-you-feel-my-love.mp3',
  twibbonOverlay: '/images/twibbon-overlay.png',
  heroImage: '/images/bride_and_groom_full_body_potrait.jpeg',
  openingImage: '/images/bride_and_groom_full_body_potrait.jpeg',

  // Quran
  quranArabic: '...',  // full Ar-Rum 30:21
  quranTranslation: '...',
  quranReference: 'QS. Ar-Rum: 21',

  // Theme
  themeTemplate: 'cinematic',
  themeGold: '#B48D3E',
  themeIvory: '#FDFCF8',

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

### Task 1.11 — Update tests for Firestore wishes

**Scope:** Mock Firestore in tests. Update `App.test.tsx` and `RSVPSection.test.tsx` for new data flow.

**Action:**
- Create `src/__mocks__/firebase.ts` mock
- Update tests that reference `SEED_WISHES` to use mock data
- Update tests that check `handleRSVPSubmit` behavior

**Affected files:** `src/App.test.tsx`, `src/components/sections/RSVPSection.test.tsx`, test setup

**Depends on:** Task 1.8

---

## Phase 2: Full Wedding Data

> Goal: All couple-specific content loaded from Firestore. Constants file eliminated.

---

### Task 2.1 — Create `useWedding` hook

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

### Task 2.2 — Create `WeddingContext`

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

### Task 2.3 — Create derived data utilities

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

### Task 2.4 — Create gallery layout utility

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

### Task 2.5 — Update `App.tsx` for WeddingContext

**Scope:** Wrap main content in `WeddingProvider`. Remove hardcoded music path and default guest.

**Changes:**
- Add `useWedding(WEDDING_SLUG)` call
- Wrap `<main>` in `<WeddingContext.Provider value={wedding}>`
- Replace hardcoded `'Tamu Terkasih Kami'` with `wedding.defaultGuest`
- Replace hardcoded music `src` with `wedding.musicUrl`
- Add loading state while wedding data loads
- Remove: `WEDDING_SLUG` constant (moved to URL/routing in Phase 5)

**Affected files:** `src/App.tsx`

**Depends on:** Task 2.2

---

### Task 2.6 — Update `CinematicOpening.tsx`

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

### Task 2.7 — Update `HeroSection.tsx`

**Scope:** Replace hardcoded names, date, city, image.

**Changes:**
- Read from `useWeddingContext()`
- Replace: `"Dani"`, `"Marini"`, date display, location, image src
- Remove: import of `WEDDING_DATE_DISPLAY` from constants

**Affected files:** `src/components/sections/HeroSection.tsx`

**Depends on:** Task 2.2, Task 2.3

---

### Task 2.8 — Update `CoupleSection.tsx`

**Scope:** Replace all 8 hardcoded couple values.

**Changes:**
- Read from `useWeddingContext()`
- Replace: groom name, parents, photo, alt text
- Replace: bride name, parents, photo, alt text

**Affected files:** `src/components/sections/CoupleSection.tsx`

**Depends on:** Task 2.2

---

### Task 2.9 — Update `EventSection.tsx`

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

### Task 2.10 — Update `CinematicStory.tsx` (content only)

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

### Task 2.11 — Update `DigitalEnvelope.tsx`

**Scope:** Replace `BANK_ACCOUNTS` with context data.

**Changes:**
- Read from `useWeddingContext()`
- Replace: `BANK_ACCOUNTS` → `wedding.giftAccounts`
- Remove: import of `BANK_ACCOUNTS` from constants

**Affected files:** `src/components/sections/DigitalEnvelope.tsx`

**Depends on:** Task 2.2

---

### Task 2.12 — Update `PhotoGallery.tsx`

**Scope:** Replace `GALLERY_ITEMS` with context data + auto-layout.

**Changes:**
- Read from `useWeddingContext()`
- Replace: `GALLERY_ITEMS` → `wedding.gallery.map((src, i) => ({ src, ...getGalleryLayout(i) }))`
- Remove: import of `GALLERY_ITEMS` from constants

**Affected files:** `src/components/sections/PhotoGallery.tsx`

**Depends on:** Task 2.2, Task 2.4

---

### Task 2.13 — Update `TwibbonCreator.tsx`

**Scope:** Replace overlay URL and download filename.

**Changes:**
- Read from `useWeddingContext()`
- Replace: `OVERLAY_SRC` → `wedding.twibbonOverlay`
- Replace: `'Memori-Dani-Marini.png'` → `deriveTwibbonFilename(wedding.groomNickname, wedding.brideNickname)`

**Affected files:** `src/components/features/TwibbonCreator.tsx`

**Depends on:** Task 2.2, Task 2.3

---

### Task 2.14 — Update `Footer.tsx`

**Scope:** Replace all hardcoded names, bios, social links, copyright.

**Changes:**
- Read from `useWeddingContext()`
- Replace: credit names, descriptions from `wedding.credits[]`
- Replace: social URLs from `wedding.groom*`/`wedding.bride*` fields
- Replace: WhatsApp URLs with `deriveWhatsappUrl(wedding.groomWhatsapp)`
- Replace: copyright year with `deriveCopyright(wedding.eventDate)`

**Affected files:** `src/components/sections/Footer.tsx`

**Depends on:** Task 2.2, Task 2.3

---

### Task 2.15 — Update `ErrorBoundary.tsx`

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

### Task 2.16 — Delete constants files

**Scope:** Remove `constants/wedding.ts` and `constants/wishes.ts` — all data now from Firestore.

**Action:**
- Delete `src/constants/wedding.ts`
- Delete `src/constants/wishes.ts`
- Verify no remaining imports reference these files
- Delete or update `src/constants/wedding.test.ts` and `src/constants/wishes.test.ts`

**Affected files:** `src/constants/wedding.ts`, `src/constants/wishes.ts`, related tests

**Depends on:** All Task 2.x completed

---

### Task 2.17 — Update `index.html` meta tags (client-side)

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

### Task 2.18 — Update all section tests

**Scope:** Mock `WeddingContext` in all section test files.

**Action:**
- Create test helper: `renderWithWedding(component, weddingData)` that wraps in `WeddingContext.Provider`
- Update all section tests to use the helper
- Update snapshot tests if any
- Remove references to deleted constants

**Affected files:** All `*.test.tsx` files in `src/components/sections/`

**Depends on:** All Task 2.x completed

---

## Phase 3: Story Interactions

> Goal: Story likes and comments persisted in Firestore.

---

### Task 3.1 — Create `useStoryLikes` hook

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

### Task 3.2 — Create `useStoryComments` hook

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

### Task 3.3 — Update `CinematicStory.tsx` for Firestore interactions

**Scope:** Replace in-memory likes/comments with Firestore hooks.

**Changes:**
- Replace: `INITIAL_LIKES` → `useStoryLikes(slug).likes`
- Replace: `handleLike` state mutation → `incrementLike(slideIndex)`
- Replace: `storyStats[idx].comments` → `useStoryComments(slug, idx).comments`
- Replace: `handleAddComment` state mutation → `addComment({ name, text })`
- Remove: `storyStats` useState entirely
- Keep: `commentInput` local state (form input, not persisted until submit)

**Affected files:** `src/components/sections/CinematicStory.tsx`

**Depends on:** Task 3.1, Task 3.2, Task 2.10

---

### Task 3.4 — Update `AmbientSocialLayer` data source

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

### Task 3.6 — Update story tests

**Scope:** Mock Firestore hooks in `CinematicStory.test.tsx`.

**Action:**
- Mock `useStoryLikes` and `useStoryComments` hooks
- Update tests for like/comment behavior
- Remove `INITIAL_LIKES` references

**Affected files:** `src/components/sections/CinematicStory.test.tsx`

**Depends on:** Task 3.3

---

## Phase 4: Admin Form

> Goal: Mobile-first form for couples to manage their wedding data.

---

### Task 4.1 — Install Firebase Auth

**Scope:** Add authentication for admin access.

**Action:** Update `src/lib/firebase.ts` to export `getAuth(app)`.

**Affected files:** `src/lib/firebase.ts`

**Depends on:** Task 1.2

---

### Task 4.2 — Create admin route/page structure

**Scope:** Add routing (React Router or simple conditional) for admin pages.

**Action:**
- Install `react-router-dom` if using routes
- Create `src/pages/Admin.tsx` with 8 form steps
- Create `src/pages/Wedding.tsx` wrapping current `App` content
- Update entry point for routing

**New files:** `src/pages/Admin.tsx`, `src/pages/Wedding.tsx`, routing setup

**Depends on:** Task 4.1

---

### Task 4.3 — Create admin form components (8 pages)

**Scope:** Build mobile-first form pages.

**Action:** Create one component per form page:
1. `src/components/admin/CoupleForm.tsx` — 6 text + 2 upload
2. `src/components/admin/EventForm.tsx` — date picker + venue + ceremonies
3. `src/components/admin/StoryForm.tsx` — repeatable slides
4. `src/components/admin/GalleryForm.tsx` — multi-photo upload
5. `src/components/admin/GiftForm.tsx` — repeatable bank accounts
6. `src/components/admin/MediaForm.tsx` — file uploads + selectors
7. `src/components/admin/SocialForm.tsx` — URL fields
8. `src/components/admin/CustomizeForm.tsx` — Quran presets + theme

**New files:** 8 form components

**Depends on:** Task 4.2

---

### Task 4.4 — Create Firebase Storage upload utility

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

### Task 4.5 — Wire admin form to Firestore writes

**Scope:** Each form page saves its fields to `weddings/{slug}` on submit.

**Action:** Use `updateDoc(doc(db, 'weddings', slug), { ...pageFields })` per page.

**Affected files:** All admin form components

**Depends on:** Task 4.3, Task 4.4

---

## Phase 5: Multi-Couple & SSR

> Goal: Multiple weddings, slug-based routing, dynamic meta tags.

---

### Task 5.1 — Add slug-based routing

**Scope:** Load wedding by URL slug instead of hardcoded constant.

**Action:** Route `/:slug` → wedding page. Extract slug from URL params.

**Affected files:** Routing setup, `App.tsx`

**Depends on:** Phase 2 complete

---

### Task 5.2 — Dynamic meta tags via Cloud Functions

**Scope:** SSR for OG tags so social media crawlers get correct previews per couple.

**Action:** Create Cloud Function that serves `index.html` with populated meta tags based on slug.

**New files:** `functions/index.ts`, `firebase.json` hosting rewrites

**Depends on:** Task 5.1

---

### Task 5.3 — Dynamic loading screen

**Scope:** Replace hardcoded "Dani & Marini" in HTML loading screen.

**Action:** Cloud Function injects couple names into the HTML loading screen template.

**Affected files:** `index.html` (templated), `functions/index.ts`

**Depends on:** Task 5.2

---

## Summary

| Phase | Tasks | New files | Changed files | Deletable files |
|---|---|---|---|---|
| 1 | 11 | 5 (incl. seed script) | 4 | 0 |
| 2 | 18 | 4 | 14 | 2 (`constants/*.ts`) |
| 3 | 5 (Task 3.5 merged into 1.9) | 2 | 2 | 0 |
| 4 | 5 | 11 | 2 | 0 |
| 5 | 3 | 2 | 2 | 0 |
| **Total** | **42** | **24** | **24** | **2** |

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
```
