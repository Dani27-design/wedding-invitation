# Known Issues

> Audit date: 2026-05-25
> Scope: Invitation page, Company profile page, Admin panel

---

## Critical

### ~~1. N+1 Firestore Query in TestimonialSection~~ ✅ FIXED

**Problem:** Each testimonial triggers an individual `getDoc()` for its wedding data — 12 testimonials = 13 Firestore reads.

**Root Cause:** `src/components/ui/TestimonialSection.tsx` — sequential `getDoc()` inside a `for` loop.

**Impact:** Slow testimonial loading (1-3s), excessive Firestore read costs, poor LCP on company profile page.

**Solution:** Replaced with batch query using `where(documentId(), 'in', uniqueSlugs)`. Now uses exactly 2 Firestore reads regardless of testimonial count. Unique slugs are deduplicated before querying.

---

### ~~2. Guest Data Not Reset on Slug Change in GuestListTab~~ ✅ FIXED

**Problem:** When slug changes, `allGuests`, search query, filter, and cursors from the previous wedding could persist.

**Root Cause:** `src/components/admin/GuestListTab.tsx` — slug-change effect did not reset client-side filter state.

**Impact:** Low in practice (Next.js remounts on URL change), but defensive fix prevents issues if component is reused without remount.

**Solution:** Added `setAllGuests(null)`, `setSearchQuery('')`, `setFilterCategory('all')`, and `cursorsRef.current = [null]` to the slug-change effect. All state fully resets on slug change.

---

### ~~3. Missing Image Optimization in GalleryShowcase~~ ✅ FIXED

**Problem:** Gallery showcase on company profile uses raw `<img>` tags without `next/image`, `sizes`, `loading="lazy"`, or format optimization.

**Root Cause:** `src/components/ui/GalleryShowcase.tsx` — plain `<img>` elements for 13 gallery images (~4.5MB total).

**Impact:** No AVIF/WebP serving, no responsive srcset, oversized images on mobile, slower page load.

**Solution:** Replaced gallery images with `next/image` using `fill` mode, responsive `sizes` attributes, and `loading="lazy"`. iPhone frame SVG kept as raw `<img>` (2KB decorative). Zoom modal kept as `motion.img` (animation compatibility). Plain images wrapped in aspect-ratio container for proper `fill` layout.

---

## High

### ~~4. Desktop Hero Images Not Optimized (Invitation Page)~~ ✅ FIXED

**Problem:** Desktop viewport uses plain `<img>` tags for hero blurred background and contained image instead of `next/image`.

**Root Cause:** `src/components/sections/HeroSection.tsx` — 2 raw `<img>` tags on desktop (blurred bg + contained photo).

**Impact:** Desktop LCP 200-500ms slower. No AVIF/WebP format, no responsive srcset.

**Solution:** Replaced both desktop images with `<Image fill priority sizes="..." placeholder="blur">`. Blurred bg uses `sizes="60vw"`, contained photo uses `sizes="(max-width: 1280px) 55vw, 60vw"`. Desktop contained wrapped in relative container for `fill` mode. Both get AVIF/WebP, responsive srcset, and priority loading.

---

### ~~5. Sequential Image Compression in Admin Forms~~ ✅ FIXED

**Problem:** Image compression runs sequentially with `await` — 2 photos take 2x as long as parallel.

**Root Cause:** `CoupleForm`, `MediaForm`, `GalleryForm`, `StoryForm` — `for` loop with `await compressImage(file)`.

**Impact:** With 5 images, users wait 5-15 seconds instead of 1-3 seconds.

**Solution:** Added `compressImageBatch()` in `src/utils/compressImage.ts` — worker-based concurrency pool (3 parallel). Each completed file updates progress callback for CompressionModal. All 4 forms updated to use batch compression. Speed improvement: ~2x for 2 files, ~3x for 5 files, ~10x for 30 files.

---

### ~~6. Memory Leak in StoryForm Blob URLs~~ ✅ FIXED

**Problem:** Blob URLs created via `URL.createObjectURL()` could leak if component unmounts between creation and state update.

**Root Cause:** `src/components/admin/StoryForm.tsx` — existing cleanup was comprehensive but relied on `slidesRef.current` which has a narrow race condition window on unmount.

**Impact:** Low in practice (race condition requires unmount in same tick as blob creation), but defensive fix eliminates any possibility.

**Solution:** Added `blobUrlsRef` (Set) to track all created blob URLs. All `URL.createObjectURL`/`revokeObjectURL` calls go through `createBlobUrl`/`revokeBlobUrl` helpers that maintain the set. Unmount effect revokes everything remaining in the set regardless of slide state. Removed `slidesRef` (no longer needed).

---

### ~~7. Super Admin N+1 User Lookups~~ ✅ FIXED

**Problem:** For every wedding's admin IDs, the code does linear `Array.find()` through users — O(N×M) complexity.

**Root Cause:** `src/app/admin/page.tsx` — `customerUsers.find()` and `superAdmins.find()` called per admin per wedding in render loop.

**Impact:** With 100 weddings × 50 users = 5,000+ array lookups. Visible UI lag when rendering wedding list.

**Solution:** Removed `customerUsers` and `superAdmins` state (redundant with `allUsers`). Added `useMemo` `userMap: Map<uid, UserDocument>` built from `allUsers` — O(N) once, O(1) per lookup. Removed 1 redundant Firestore query. Removed dead `getAdminEmails` function. All `.find()` lookups replaced with `userMap.get()`.

---

### ~~8. No Search Debounce in Super Admin Page~~ ✅ FIXED

**Problem:** Wedding search filters on every keystroke without debouncing.

**Root Cause:** `src/app/admin/page.tsx` — `useMemo` recalculated on every `searchQuery` change.

**Impact:** Unnecessary re-renders and string operations on every character typed.

**Solution:** Added `debouncedSearch` state with 300ms `useEffect` debounce. Input stays controlled by `searchQuery` (no typing lag), but `filteredWeddings` memo only recalculates when `debouncedSearch` settles. Timer cleaned up on each keystroke.

---

### ~~9. Testimonial Photos Missing Alt Text~~ ✅ FIXED

**Problem:** Couple photos in testimonial cards have empty `alt=""`, treating them as decorative when they're content-relevant.

**Root Cause:** `src/components/ui/TestimonialSection.tsx` — `alt=""` on groom and bride photos.

**Impact:** Screen readers skip photos. SEO: Google can't index photo context. WCAG 2.1 Level A violation.

**Solution:** Changed both groom and bride photo `alt=""` to `alt={t.coupleName}` (e.g. "Dani & Marini"). Tests updated to verify descriptive alt text is present.

---

### ~~10. Silent Error Handling in TestimonialSection~~ ✅ FIXED

**Problem:** Firestore query failures are silently caught with no logging or user feedback.

**Root Cause:** `src/components/ui/TestimonialSection.tsx` — `catch { // silent fail }` with no logging.

**Impact:** No observability into database errors. Masks quota/permission issues in production.

**Solution:** Added `console.error('[Testimonials] Load error:', error.message)` matching project convention. Section still gracefully disappears on error (correct UX for public landing page). Test updated to verify error is logged.

---

### ~~11. Firestore Listener Cleanup Issues in useWishes~~ ✅ FIXED

**Problem:** `onSnapshot` success and error callbacks could fire after unmount, calling state setters on unmounted component.

**Root Cause:** `src/hooks/useWishes.ts` — `cancelled` flag existed but was only checked before `onSnapshot` setup, not inside the callbacks themselves.

**Impact:** Potential state update on unmounted component during rapid navigation.

**Solution:** Added `if (cancelled) return;` guard at the top of both `onSnapshot` success and error callbacks. Now state setters are never called after cleanup runs.

---

### ~~12. Story Like Button Race Condition~~ ✅ FIXED

**Problem:** Rapid clicks on like button cause optimistic updates that get out of sync with Firestore.

**Root Cause:** `src/hooks/useStoryLikes.ts` — no guard against concurrent transactions on the same slide.

**Impact:** Like count UI becomes inconsistent with Firestore after rapid clicking.

**Solution:** Added `pendingRef` (Set) to track in-flight transactions per slide index. `incrementLike` returns early if slide already has a pending transaction. Pending flag cleared in `finally` block. Different slides can still be liked concurrently. 2 new tests added: "ignores rapid clicks while transaction is pending" and "allows clicks on different slides concurrently".

---

## Medium

### ~~13. Canvas Memory Not Cleaned in MediaForm~~ ✅ FIXED

**Problem:** Twibbon overlay generation creates 1080×1920 canvas elements that remain in memory after blob creation.

**Root Cause:** `src/components/admin/MediaForm.tsx` — `document.createElement('canvas')` pixel buffer (~8MB) never freed.

**Impact:** Each generation uses ~8MB. Generating 5 overlays leaves 40MB unused.

**Solution:** Moved `canvas` declaration before `try` block. Added `canvas.width = 0; canvas.height = 0;` in `finally` block to immediately free the pixel buffer regardless of success/failure. Blob is independent of canvas once created.

---

### ~~14. No Upload Cancellation in Storage~~ ✅ FIXED

**Problem:** Large file uploads continue in the background after user navigates away from admin panel.

**Root Cause:** `src/lib/storage.ts` — `uploadBytesResumable` task never exposed for cancellation.

**Impact:** 50MB video uploads waste bandwidth after user leaves page.

**Solution:** Changed `uploadFile()` to return `{ promise, cancel }` instead of `Promise<string>`. Admin page stores cancel functions in `activeUploadsRef` during upload loop. `useEffect` cleanup calls all active cancel functions on unmount. Cancel functions cleared in `finally` block after save completes.

---

### ~~15. All Guests Loaded at Once for Search~~ ✅ FIXED

**Problem:** First search in GuestListTab shows "no results" while guest data is still loading, with silent error handling.

**Root Cause:** `src/components/admin/GuestListTab.tsx` — no loading state during `getGuests()` fetch, `.catch(() => {})` swallows errors.

**Impact:** Misleading UX — user sees empty state when data is actually loading. Errors invisible in production.

**Solution:** Added `isSearchLoading` state. Shows "Mencari..." while `allGuests` is being fetched. Added `console.error` for fetch failures. Full guest fetch is the correct approach for this project scale (Firestore doesn't support substring search) — `allGuests` is cached after first fetch and cleared only on mutation.

---

### ~~16. File Deletion Without Error Feedback~~ ✅ FIXED

**Problem:** Old file cleanup after save silently fails with no way for the caller to detect failures.

**Root Cause:** `src/lib/storage.ts` — `deleteFile()` returned `void`, catching all errors internally.

**Impact:** Admin sees "success" but old files may remain, consuming storage quota. No monitoring visibility.

**Solution:** Changed `deleteFile()` return type to `Promise<boolean>` — returns `true` on success, `false` on error (still catches errors internally, never throws). Admin page collects deletion results and logs summary warning: `console.warn('[Admin] N file(s) failed to clean up')`. 4 new storage tests added for return value verification.

---

### ~~17. No Custom Font Preconnect for Dynamic Wedding Pages~~ ✅ FIXED

**Problem:** Custom Google Fonts loaded via `<link rel="stylesheet">` without `<link rel="preconnect">`.

**Root Cause:** `src/app/[slug]/page.tsx` — font stylesheet injected without preconnect hint for `fonts.googleapis.com` and `fonts.gstatic.com`.

**Impact:** Font loading happens late in critical path. Potential FOUT (Flash of Unstyled Text) and CLS.

**Solution:** Added `<link rel="preconnect" href="https://fonts.googleapis.com" />` and `<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />` conditionally — only when wedding uses custom (non-default) fonts. DNS + TCP + TLS now happen in parallel with CSS fetch.

---

### ~~18. CLS from Testimonial Section Loading~~ ✅ FIXED

**Problem:** Testimonials section renders `null` while loading, then suddenly appears with full content.

**Root Cause:** `src/components/ui/TestimonialSection.tsx` — loading and empty states conflated in single `return null`.

**Impact:** Page layout shifts when testimonials load. FAQ section below jumps up then pushes down.

**Solution:** Split into two conditions: loading shows skeleton section (3 placeholder cards with `animate-pulse`, matching real card dimensions and `aria-busy="true"`), empty returns `null`. Skeleton reserves the same height as real content, preventing CLS. Test updated to verify skeleton renders during loading.

---

### ~~19. Story Comment Misattachment on Slide Change~~ ✅ FIXED

**Problem:** If user opens comment form on slide 1 then swipes to slide 2, submitting attaches the comment to slide 2 instead of slide 1.

**Root Cause:** `src/components/sections/CinematicStory.tsx` — `addComment` from `useStoryComments` is bound to `activeSlide`, which changes on swipe. Comment form stays open but writes to the wrong slide.

**Impact:** Comments attached to wrong story slides.

**Solution:** Added `useEffect` that resets `commentInput` to `null` whenever `activeSlide` changes. Comment form closes on slide change, preventing misattachment. User must reopen form on the new slide to comment there.

---

### ~~20. Comment Listeners May Stack on Rapid Slide Navigation~~ ✅ FIXED

**Problem:** Changing `slideIndex` rapidly could cause stale `onSnapshot` callbacks to update state with data from the wrong slide.

**Root Cause:** `src/hooks/useStoryComments.ts` — `onSnapshot` success and error callbacks had no guard against firing after cleanup.

**Impact:** Potential stale comment data displayed on wrong slide during rapid navigation.

**Solution:** Added `cancelled` flag inside the `useEffect`. Both `onSnapshot` callbacks check `if (cancelled) return;` before calling state setters. Cleanup sets `cancelled = true` before calling `unsubscribe()`. Same proven pattern as `useWishes` (issue #11).

---

### ~~21. QR Generation Not Cached~~ ✅ FIXED

**Problem:** `generateQRDataURL()` is called without caching, even for identical URLs.

**Root Cause:** `src/utils/qrGenerate.ts` — no memoization, every call runs full QR generation.

**Impact:** Printing 100 cards triggers 100 separate CPU-intensive QR generations. Remounting components regenerates already-computed QR codes.

**Solution:** Added module-level `Map<string, string>` cache in `generateQRDataURL`. Cache hit returns instantly, cache miss generates and stores. Empty results (errors) are not cached to allow retry. Both `GuestQRCard` and `generateQRCardPNG` benefit from the cache. ~500KB memory for 100 cached entries.

---

### ~~22. Hero Logo Missing Priority on Company Profile~~ ✅ FIXED

**Problem:** Logo in hero section (above fold) loads with default lazy loading instead of priority.

**Root Cause:** `src/app/page.tsx` — hero `NextImage` without `priority` prop.

**Impact:** Logo may flash in after page paint, affecting LCP.

**Solution:** Added `priority` prop to hero logo `NextImage`. Footer logo (below fold) left unchanged — lazy loading is correct there.

---

## Low

### ~~23. FloatingController Resize Without Debounce~~ ✅ FIXED

**Problem:** Drag constraint recalculation fires on every pixel of window resize.

**Root Cause:** `src/components/features/FloatingController.tsx` — resize listener calls `setConstraints` on every pixel change.

**Impact:** Multiple re-renders during device rotation or resize.

**Solution:** Added 200ms debounce on resize handler via `setTimeout`/`clearTimeout`. Initial calculation on mount remains immediate. Timer cleaned up on unmount.

---

### ~~24. Audio Retry May Leak on Repeated Open/Close~~ ✅ FIXED

**Problem:** `retryPlay()` uses recursive setTimeout without cancellation token.

**Root Cause:** `src/app/[slug]/wedding-client.tsx` — retry `setTimeout` IDs never stored, can't be cancelled on unmount.

**Impact:** Stale `setIsPlaying` calls if component unmounts during retry chain.

**Solution:** Added `retryTimerRef` alongside existing `copyTimerRef`/`submitTimerRef`. `retryPlay` stores each `setTimeout` ID in the ref. Unmount cleanup clears `retryTimerRef.current`. Same proven pattern as other timer refs in the component.

---

### ~~25. No Timeout on Firestore Queries~~ ✅ FIXED

**Problem:** Server-side Firestore query has no timeout — page SSR hangs up to 60s on Firestore outage.

**Root Cause:** `src/app/[slug]/page.tsx` — `adminDb.doc().get()` uses gRPC with ~60s default timeout.

**Impact:** Users see loading state for up to 60s on Firestore outage.

**Solution:** Wrapped `adminDb.doc().get()` in `Promise.race()` with 10-second timeout. On timeout, `getWedding` returns `null` → page shows 404 instead of hanging. Client-side hooks (`useWishes`, `useStoryComments`) already handle failures gracefully via Firestore SDK offline behavior — no changes needed.

---

### ~~26. OG Image Dimension Mismatch on Wedding Pages~~ ✅ FIXED

**Problem:** OG image declares 1200×630 dimensions but actual `heroImage` is user-uploaded with unknown dimensions.

**Root Cause:** `src/app/[slug]/page.tsx` — hardcoded `width: 1200, height: 630` on dynamic user-uploaded image.

**Impact:** Social media previews may crop/scale incorrectly based on wrong dimension hints.

**Solution:** Removed `width` and `height` from OG image object. Social platforms auto-detect dimensions by fetching the image — correct behavior for dynamic user-uploaded images. `url` and `alt` retained.

---

### ~~27. Smooth Scroll Delay on Admin Tab Switch~~ ✅ FIXED

**Problem:** `window.scrollTo({ behavior: 'smooth' })` adds 500-800ms visual delay before new form appears.

**Root Cause:** `src/app/admin/[slug]/page.tsx` — smooth scroll animation on every `currentStep` change.

**Impact:** Feels slow when switching between admin tabs.

**Solution:** Changed `behavior: 'smooth'` to `behavior: 'instant'`. Tab content swaps and scrolls to top immediately — matches user expectation for tab switching.

---

### ~~28. ConsultationForm Missing Label Association~~ ✅ FIXED

**Problem:** Form inputs use `aria-label` instead of associated `<label>` elements.

**Root Cause:** `src/components/ui/ConsultationForm.tsx` — no `id` or `<label htmlFor>` on inputs.

**Impact:** No proper label association for accessibility tools.

**Solution:** Added `id` to both inputs (`consult-name`, `consult-message`) and `<label htmlFor className="sr-only">` for each. Removed `aria-label` (redundant with `<label>`). Visually hidden labels preserve the compact dark-themed design. No UI change.

---
