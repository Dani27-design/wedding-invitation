# Next.js Migration — Task List

> Migration from React Vite SPA to Next.js App Router with SSR/ISR.
>
> **Goal:** Server-side rendering for all content, built-in image/font optimization, elimination of SSR workarounds, improved Core Web Vitals and SEO.

---

## Pre-Migration: Current Architecture Summary

### What exists now

```
src/
  main.tsx              → React entry point (StrictMode + MotionConfig + ErrorBoundary)
  App.tsx               → BrowserRouter with 2 routes (/:slug, /admin/:slug)
  pages/Wedding.tsx     → Wedding page (261 lines, client-side data fetching)
  pages/Admin.tsx       → Admin page (auth + 8 form tabs)
  components/           → 30 components (sections, features, ui, admin)
  hooks/                → 6 hooks (useWedding, useWishes, useStoryLikes, useStoryComments, useCountdown, useFocusTrap)
  context/              → WeddingContext (React context for wedding data)
  lib/                  → firebase.ts, storage.ts, wishes.ts
  constants/            → themeDefaults.ts
  types/                → firestore.ts, index.ts
  utils/                → 5 utility files

api/ssr-meta.ts         → Vercel serverless function (SSR meta tags + loading screen)
functions/src/index.ts  → Firebase Cloud Function (crawler-only minimal HTML)
vercel.json             → Rewrites + includeFiles config
index.html              → SPA entry with hardcoded loading screen
```

### What gets eliminated by Next.js

| Current workaround | Why it exists | Next.js replacement |
|---|---|---|
| `api/ssr-meta.ts` (120 lines) | SSR meta tags + loading screen for SPA | Built-in `generateMetadata()` |
| `functions/src/index.ts` (140 lines) | Crawler-only HTML with meta tags | Same server render for all visitors |
| `vercel.json` rewrites (17 lines) | Route SPA requests through API | File-system routing |
| `Wedding.tsx` meta `useEffect` (15 lines) | Client-side meta tag override | Server-side `generateMetadata()` |
| `Wedding.tsx` theme CSS `useEffect` (15 lines) | Client-side CSS variable override | Server-side inline `<style>` |
| `Wedding.tsx` font loading `useEffect` (20 lines) | Dynamic Google Fonts `<link>` injection | `next/font` self-hosting |
| `index.html` loading screen (25 lines) | Content placeholder before React loads | Server HTML is the content |
| `main.tsx` (16 lines) | React DOM entry point | Next.js handles this |
| `App.tsx` router (18 lines) | React Router with BrowserRouter | File-system routing |
| `useWedding.ts` hook (25 lines) | Client-side Firestore getDoc | Server component data fetch |
| `WeddingContext.tsx` (5 lines) | Prop drilling avoidance | Server component props |

**Total eliminated: ~300 lines of workaround code + 2 serverless functions**

---

## Phase 1: Project Setup

---

### Task 1.1 — Initialize Next.js project

**Scope:** Create a new Next.js project alongside the existing code, or convert in-place.

**Action:**
```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
```

Or convert manually:
- Install: `next`, `@next/font` (included in next), `firebase-admin` (for server-side)
- Remove: `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `react-router-dom`
- Keep: `react`, `react-dom`, `firebase`, `motion`, `lucide-react`, `tailwindcss`

**New files:** `next.config.ts`, `app/layout.tsx`, `app/globals.css`

**Deleted files:** `vite.config.ts`, `index.html`, `main.tsx`, `App.tsx`

**Depends on:** Nothing

---

### Task 1.2 — Configure Tailwind v4 for Next.js

**Scope:** Tailwind v4 with Next.js uses `@tailwindcss/postcss` instead of `@tailwindcss/vite`.

**Action:**
- Install: `@tailwindcss/postcss`
- Remove: `@tailwindcss/vite`
- Create `postcss.config.mjs`:
```js
export default { plugins: { '@tailwindcss/postcss': {} } };
```
- Move `src/index.css` to `app/globals.css`
- Keep all `@theme`, `@layer utilities`, and custom CSS unchanged

**Affected files:** `postcss.config.mjs`, `app/globals.css`

**Depends on:** Task 1.1

---

### Task 1.3 — Configure fonts with `next/font`

**Scope:** Replace Google Fonts `<link>` tags and local `@font-face` with `next/font` self-hosting.

**Action:** Create `app/fonts.ts`:
```typescript
import { Cormorant_Garamond, Montserrat, Playfair_Display } from 'next/font/google';
import localFont from 'next/font/local';

export const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'], weight: ['400', '700'], style: ['normal', 'italic'],
  variable: '--font-serif', display: 'swap',
});
export const montserrat = Montserrat({
  subsets: ['latin'], weight: ['400', '500', '700', '900'],
  variable: '--font-sans', display: 'swap',
});
export const playfairDisplay = Playfair_Display({
  subsets: ['latin'], weight: ['400', '700'], style: ['normal', 'italic'],
  variable: '--font-display', display: 'swap',
});
export const dayland = localFont({
  src: '../public/fonts/Dayland.ttf',
  variable: '--font-dayland', display: 'swap',
});
```

Apply in `app/layout.tsx`:
```tsx
<body className={`${cormorantGaramond.variable} ${montserrat.variable} ${playfairDisplay.variable} ${dayland.variable}`}>
```

**Eliminates:**
- Google Fonts `<link>` tags in `index.html`
- Dynamic font loading `useEffect` in `Wedding.tsx`
- Font preconnect/preload hints

**New files:** `app/fonts.ts`

**Depends on:** Task 1.1

---

### Task 1.4 — Configure Firebase Admin for server-side

**Scope:** Server components and `generateMetadata` need `firebase-admin` to read Firestore (client SDK doesn't work server-side).

**Action:**
- Install: `firebase-admin`
- Create `lib/firebase-admin.ts`:
```typescript
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({ credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  })});
}

export const adminDb = getFirestore();
```

**Environment variables:** Add `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` to `.env.local` and Vercel dashboard (from Firebase service account JSON).

**New files:** `lib/firebase-admin.ts`

**Depends on:** Task 1.1

---

### Task 1.5 — Update environment variables

**Scope:** Vite uses `VITE_` prefix for client-side env vars. Next.js uses `NEXT_PUBLIC_` prefix.

**Action:** Rename in `.env`, `.env.example`, and all references in `lib/firebase.ts`:
- `VITE_FIREBASE_API_KEY` → `NEXT_PUBLIC_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID` → `NEXT_PUBLIC_FIREBASE_APP_ID`

Update `lib/firebase.ts`:
```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // ... etc
};
```

Remove `import.meta.env` — Next.js uses `process.env`.

**Affected files:** `lib/firebase.ts`, `.env`, `.env.example`

**Depends on:** Task 1.1

---

### Task 1.6 — Configure testing for Next.js

**Scope:** Vitest still works with Next.js but needs updated config.

**Action:**
- Replace `vite.config.ts` test config with `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
});
```
- Keep `@vitejs/plugin-react` as devDependency (for Vitest only, not for Next.js build)
- All existing tests continue to work (component tests don't depend on routing framework)

**New files:** `vitest.config.ts`

**Depends on:** Task 1.1

---

## Phase 2: App Router Structure

---

### Task 2.1 — Create root layout (`app/layout.tsx`)

**Scope:** Replace `index.html` + `main.tsx` with Next.js root layout.

**Action:** Create `app/layout.tsx`:
```tsx
import { MotionConfig } from 'motion/react';
import { cormorantGaramond, montserrat, playfairDisplay, dayland } from './fonts';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${cormorantGaramond.variable} ${montserrat.variable} ${playfairDisplay.variable} ${dayland.variable}`}>
      <body>
        <MotionConfig reducedMotion="user">
          {children}
        </MotionConfig>
      </body>
    </html>
  );
}
```

**Replaces:** `index.html`, `main.tsx`, `App.tsx`

**New files:** `app/layout.tsx`

**Depends on:** Task 1.3

---

### Task 2.2 — Create wedding page route (`app/[slug]/page.tsx`)

**Scope:** Server component that fetches wedding data and renders the page. Replaces `pages/Wedding.tsx` + `useWedding` hook + `WeddingContext`.

**Action:** Create `app/[slug]/page.tsx`:
```tsx
import { adminDb } from '@/lib/firebase-admin';
import { WeddingDocument } from '@/types/firestore';
import { WeddingClient } from './wedding-client';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const doc = await adminDb.doc(`weddings/${params.slug}`).get();
  const wedding = doc.data() as WeddingDocument | undefined;
  if (!wedding) return { title: 'Not Found' };
  return {
    title: `Wedding ${wedding.groomNickname} & ${wedding.brideNickname}`,
    description: `Turut mengundang Anda...`,
    openGraph: { title: '...', description: '...', images: [wedding.heroImage] },
    twitter: { card: 'summary_large_image', title: '...', images: [wedding.heroImage] },
    alternates: { canonical: `/${params.slug}` },
  };
}

export default async function WeddingPage({ params }: { params: { slug: string } }) {
  const doc = await adminDb.doc(`weddings/${params.slug}`).get();
  const wedding = doc.data() as WeddingDocument | undefined;
  if (!wedding) return notFound();
  return <WeddingClient wedding={wedding} slug={params.slug} />;
}
```

**Eliminates:**
- `useWedding` hook (server fetch replaces client fetch)
- `WeddingContext` (props from server, not context)
- `api/ssr-meta.ts` (Next.js SSR replaces the workaround)
- Meta tag `useEffect` in Wedding.tsx
- `vercel.json` rewrites

**New files:** `app/[slug]/page.tsx`, `app/[slug]/wedding-client.tsx`

**Depends on:** Task 1.4, Task 2.1

---

### Task 2.3 — Create wedding client component (`app/[slug]/wedding-client.tsx`)

**Scope:** Move current `Wedding.tsx` client-side logic (state, effects, handlers) into a client component. Receives `wedding` data as prop instead of fetching it.

**Action:** Create `app/[slug]/wedding-client.tsx`:
- Start with `'use client';`
- Copy all state, effects, handlers from current `Wedding.tsx`
- Remove: `useWedding` hook, `useParams`, meta `useEffect`, theme CSS `useEffect`, font loading `useEffect`
- Receive: `wedding: WeddingDocument` and `slug: string` as props
- Keep: `useWishes(slug)`, `isOpen`, `guestName`, audio, RSVP, pagination — all client-side interactivity

**Key difference:** Wedding data comes as a prop (from server), not from a hook (client fetch).

**Affected files:** Extracted from `src/pages/Wedding.tsx`

**Depends on:** Task 2.2

---

### Task 2.4 — Create admin page route (`app/admin/[slug]/page.tsx`)

**Scope:** Move admin page to Next.js app router.

**Action:** Create `app/admin/[slug]/page.tsx`:
```tsx
'use client';
// Current Admin.tsx content moves here as-is (fully client-side)
// Auth, forms, Firestore writes — all client-side
```

Admin page is fully client-side (auth, forms, writes). It just needs `'use client'` and the file-system route.

**New files:** `app/admin/[slug]/page.tsx`

**Depends on:** Task 2.1

---

### Task 2.5 — Apply theme CSS variables server-side

**Scope:** Replace client-side `useEffect` that sets CSS variables with server-side inline `<style>` tag.

**Action:** In `app/[slug]/page.tsx`, inject CSS variables as an inline `<style>`:
```tsx
export default async function WeddingPage({ params }) {
  // ... fetch wedding
  const { colors, fonts } = wedding.theme;
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --color-gold: ${colors.accent};
          --color-ivory: ${colors.background};
          --color-ink: ${colors.text};
          --color-paper: ${colors.surface};
          --color-sepia: ${colors.surface};
          --color-rose-pastel: ${colors.button};
        }
      `}} />
      <WeddingClient wedding={wedding} slug={params.slug} />
    </>
  );
}
```

Font variables are handled by `next/font` (Task 1.3).

**Eliminates:** Theme CSS `useEffect` in Wedding.tsx (15 lines)

**Depends on:** Task 2.2

---

### Task 2.6 — Replace `<img>` with `next/image`

**Scope:** Replace all 7 wedding page `<img>` elements with `next/image` for automatic optimization.

**Action:** For each image:
```tsx
// Before (current):
<img src={wedding?.heroImage ?? ''} sizes="100vw" className="w-full h-full object-cover" alt="..." />

// After (Next.js):
<Image src={wedding.heroImage} fill sizes="100vw" className="object-cover" alt="..." priority />
```

**Components to update:**
1. `CinematicOpening.tsx` — opening background (`priority`)
2. `HeroSection.tsx` — hero portrait (`priority`)
3. `CoupleSection.tsx` — groom/bride photos
4. `CinematicStory.tsx` — slide backgrounds
5. `PhotoGallery.tsx` — gallery items
6. `PhotoZoomModal.tsx` — zoomed photo

**Benefit:** Automatic WebP/AVIF conversion, srcset generation, lazy loading with blur placeholder.

**Note:** Firebase Storage URLs need `next.config.ts` image domain config:
```ts
images: { remotePatterns: [{ hostname: 'firebasestorage.googleapis.com' }] }
```

**Depends on:** Task 2.2

---

### Task 2.7 — Add JSON-LD to server component

**Scope:** Move JSON-LD from API route string injection to proper Next.js metadata.

**Action:** In `app/[slug]/page.tsx`:
```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: `Wedding ${wedding.groomNickname} & ${wedding.brideNickname}`,
  startDate: wedding.eventDate,
  location: { '@type': 'Place', name: wedding.venueName, address: { '@type': 'PostalAddress', addressLocality: wedding.eventCity } },
  image: wedding.heroImage,
}) }} />
```

**Eliminates:** JSON-LD injection in `api/ssr-meta.ts` and Cloud Function.

**Depends on:** Task 2.2

---

## Phase 3: Component Migration

---

### Task 3.1 — Add `'use client'` directives to interactive components

**Scope:** Next.js App Router requires `'use client'` on components that use hooks, state, or browser APIs.

**Action:** Add `'use client';` as the first line to:

**Must be client components (use hooks/state/browser APIs):**
- All section components that use `motion` from `motion/react` (Framer Motion requires client-side)
- `CinematicOpening.tsx`, `HeroSection.tsx`, `CoupleSection.tsx`, `CinematicStory.tsx`, `EventSection.tsx`, `PhotoGallery.tsx`, `RSVPSection.tsx`, `DigitalEnvelope.tsx`, `Footer.tsx`, `TwibbonSection.tsx`
- All feature components: `FloatingController.tsx`, `RSVPModal.tsx`, `TwibbonCreator.tsx`
- All UI components: `AmbientSocialLayer.tsx`, `BackgroundLayers.tsx`, `CountdownTimer.tsx`, `FloatingPetals.tsx`, `ForegroundOrnaments.tsx`, `LightGlow.tsx`, `PetalEffect.tsx`, `PhotoZoomModal.tsx`
- All admin forms (use `useState`)
- `ErrorBoundary.tsx` (class component)

**Can stay as server components:**
- `app/[slug]/page.tsx` (server data fetching)
- `app/layout.tsx` (no hooks)
- Type files, utils, constants

**Note:** Framer Motion `motion.*` elements require client-side rendering. Since almost every component uses `motion`, nearly all components need `'use client'`. This is normal for animation-heavy apps.

**Depends on:** Task 2.2

---

### Task 3.2 — Replace `useWeddingContext()` with props

**Scope:** Server component fetches wedding data and passes as props. Sections no longer need context.

**Action:** Two options:
1. **Keep context** — `WeddingClient` wraps children in `WeddingContext.Provider`. Sections continue to use `useWeddingContext()`. Minimal code change.
2. **Remove context** — Pass wedding data as props through `WeddingClient` to each section. More changes but cleaner.

**Recommended: Option 1** — Keep context for minimal migration effort. The `WeddingClient` component receives `wedding` as a prop from the server component and provides it via context.

**Depends on:** Task 2.3

---

### Task 3.3 — Update `useWishes` and `useStoryComments` for client-side only

**Scope:** These hooks use `onSnapshot` (real-time listeners) — they must stay client-side. No changes needed.

**Action:** No changes. These hooks are already client-side and will be used in client components.

**Depends on:** Task 3.1

---

### Task 3.4 — Update `useStoryLikes` for client-side only

**Scope:** Same as 3.3 — `getDoc` + `runTransaction` stay client-side.

**Action:** No changes.

**Depends on:** Task 3.1

---

## Phase 4: Cleanup

---

### Task 4.1 — Delete eliminated files

**Scope:** Remove all files replaced by Next.js built-in features.

**Action:** Delete:
- `src/main.tsx` — replaced by `app/layout.tsx`
- `src/App.tsx` — replaced by file-system routing
- `src/pages/Wedding.tsx` — replaced by `app/[slug]/page.tsx` + `wedding-client.tsx`
- `src/pages/Admin.tsx` — replaced by `app/admin/[slug]/page.tsx`
- `src/hooks/useWedding.ts` — replaced by server-side fetch
- `src/hooks/useWedding.test.ts` — hook no longer exists
- `api/ssr-meta.ts` — replaced by Next.js SSR
- `functions/src/index.ts` — Cloud Function no longer needed for SSR (keep if needed for other purposes)
- `vercel.json` — rewrites no longer needed (keep if needed for other config)
- `index.html` — replaced by `app/layout.tsx`
- `vite.config.ts` — replaced by `next.config.ts`

**Depends on:** All Phase 2-3 tasks complete

---

### Task 4.2 — Remove unused dependencies

**Scope:** Clean up `package.json`.

**Action:**
- Remove: `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `react-router-dom`, `@vercel/node`
- Add: `next`, `firebase-admin`, `@tailwindcss/postcss`
- Keep: `react`, `react-dom`, `firebase`, `motion`, `lucide-react`, `tailwindcss`, `vitest`, `@testing-library/*`

**Depends on:** Task 4.1

---

### Task 4.3 — Update test imports and mocks

**Scope:** Tests that import from deleted files need updating.

**Action:**
- `App.test.tsx` → rename to test the wedding client component directly
- Remove `vi.mock('react-router-dom')` — no more router
- Update `useWedding` mock → component now receives `wedding` as prop
- All section/feature/UI component tests — unchanged (they test components, not routing)

**Depends on:** Task 4.1

---

### Task 4.4 — Configure `next.config.ts`

**Scope:** Set up Next.js-specific configuration.

**Action:** Create `next.config.ts`:
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'firebasestorage.googleapis.com' },
      { hostname: 'storage.googleapis.com' },
    ],
  },
};

export default nextConfig;
```

**New files:** `next.config.ts`

**Depends on:** Task 1.1

---

### Task 4.5 — Enable ISR (Incremental Static Regeneration)

**Scope:** Cache wedding pages at the edge for near-static performance.

**Action:** In `app/[slug]/page.tsx`:
```typescript
export const revalidate = 300; // Revalidate every 5 minutes
```

First visitor triggers SSR → cached at edge → subsequent visitors get cached HTML (0ms server time) → background revalidation after 5 minutes.

**Benefit:** Static-site speed with dynamic content. Firestore reads reduced to 1 per 5 minutes per slug (instead of 1 per visitor).

**Depends on:** Task 2.2

---

## Phase 5: Verification

---

### Task 5.1 — Run all tests

**Scope:** Verify all 2182 tests still pass after migration.

**Depends on:** All Phase 1-4 tasks

---

### Task 5.2 — Verify SEO with real crawlers

**Scope:** Test with Facebook Debugger, Twitter Card Validator, Google Rich Results Test.

**Depends on:** Task 5.1

---

### Task 5.3 — Measure Core Web Vitals

**Scope:** Run Lighthouse on the deployed Next.js version. Compare LCP, FID, CLS against current Vite SPA.

**Depends on:** Task 5.1

---

### Task 5.4 — Update DOCUMENTATION.md

**Scope:** Update architecture docs to reflect Next.js structure.

**Depends on:** All tasks complete

---

## Summary

| Phase | Tasks | Effort | Key Changes |
|---|---|---|---|
| 1. Setup | 6 | Medium | Next.js init, fonts, Firebase Admin, env vars, testing |
| 2. App Router | 7 | High | Server components, metadata, image optimization, theme SSR |
| 3. Components | 4 | Low | Add `'use client'`, keep context |
| 4. Cleanup | 5 | Medium | Delete workarounds, update deps, update tests |
| 5. Verification | 4 | Low | Tests, SEO, performance, docs |
| **Total** | **26** | | |

## Files Changed Summary

| Category | Added | Modified | Deleted |
|---|---|---|---|
| App Router | 5 (`layout.tsx`, `page.tsx`, `wedding-client.tsx`, `admin/page.tsx`, `fonts.ts`) | 0 | 0 |
| Config | 3 (`next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`) | 2 (`.env`, `package.json`) | 3 (`vite.config.ts`, `index.html`, `vercel.json`) |
| Server-side | 1 (`lib/firebase-admin.ts`) | 0 | 2 (`api/ssr-meta.ts`, `functions/src/index.ts`) |
| Components | 0 | ~30 (add `'use client'`) | 0 |
| Eliminated | 0 | 0 | 5 (`main.tsx`, `App.tsx`, `Wedding.tsx`, `Admin.tsx`, `useWedding.ts`) |
| Images | 0 | 6 (`<img>` → `<Image>`) | 0 |
| **Total** | **9** | **~38** | **10** |

## Execution Order

```
Phase 1: Setup
  Task 1.1 (init Next.js)
    ↓
  Task 1.2 (Tailwind) + Task 1.4 (Firebase Admin) + Task 1.5 (env vars) + Task 1.6 (testing)
    ↓
  Task 1.3 (fonts)
    ↓
Phase 2: App Router
  Task 2.1 (root layout)
    ↓
  Task 2.2 (wedding page) + Task 2.4 (admin page) + Task 4.4 (next.config)
    ↓
  Task 2.3 (wedding client) + Task 2.5 (theme SSR) + Task 2.6 (images) + Task 2.7 (JSON-LD)
    ↓
Phase 3: Components
  Task 3.1 ('use client') + Task 3.2 (context/props)
    ↓
  Task 3.3 + Task 3.4 (hooks — no changes)
    ↓
Phase 4: Cleanup
  Task 4.1 (delete files) + Task 4.2 (deps) + Task 4.3 (tests) + Task 4.5 (ISR)
    ↓
Phase 5: Verification
  Task 5.1 (tests) → Task 5.2 (SEO) → Task 5.3 (performance) → Task 5.4 (docs)
```
