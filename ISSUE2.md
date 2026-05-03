# Issue Tracker 2 — Performance, Functionality & Reliability

> Deep scan focused on performance, touch/scroll interactions, browser compatibility, accessibility, error handling, and state management.

---

## Issue #S1 — Page Scroll Jumps and Shifts Unexpectedly on Mobile [FIXED — Round 1]

**Root Cause:**
Four issues combining to cause scroll jumping:

1. **CinematicStory horizontal scroll captures vertical swipe:** `snap-x snap-mandatory` aggressively captures diagonal finger gestures during vertical scroll, locking the view to the story section.
2. **FloatingController drag interferes with page scroll:** `drag` on a fixed element captures `pointerdown` near the button during scroll, briefly stopping page scroll.
3. **Resize handler triggers re-renders during scroll:** URL bar show/hide fires resize events which update `viewportHeight` state immediately, causing layout recalculation mid-scroll.
4. **`whileInView` animations with `y` offset cause layout shift:** Elements starting at `y: 15-30` offset change their layout position during animation, causing scroll position recalculation.

**Solution:**
1. Added `overscroll-x-contain` to CinematicStory scroll container — prevents horizontal scroll from capturing vertical momentum.
2. Added `dragConstraints={{ left: -200, right: 0, top: -400, bottom: 0 }}` to FloatingController — limits drag range and reduces scroll interference.
3. Changed resize handler from RAF throttle to 300ms debounce — skips updates during active scroll/URL-bar transitions.
4. Removed `y` offset from all `whileInView` animations (7 elements) — opacity-only entrance prevents any layout shift during scroll.

---

## Issue #S2 — Ghost Scroll Jumps Persist Due to Dynamic Section Heights and Re-renders [FIXED]

**Root Cause:**
Three remaining causes after S1 fixes:

1. **`viewportHeight` reactive state triggers re-renders during scroll:** Resize events from URL bar changes update `viewportHeight` state → `wishPages` recalculates → RSVPSection re-renders with different card count → section height changes → scroll jumps.
2. **BackgroundLayers light-sweep `w-[200%]` element extends beyond viewport:** The animated child translates from `-100%` to `100%` on a `200%` wide element. Some mobile browsers detect this as horizontal overflow even with `overflow-hidden` on parent, causing scroll position adjustments.
3. **`h-[100dvh]` sections resize dynamically during scroll:** `dvh` (dynamic viewport height) changes as the mobile URL bar shows/hides during scroll. Multiple stacked 100dvh sections compound the height change, causing cumulative scroll jumps.

**Solution:**
1. Changed `viewportHeight` from `useState` to `useRef` — read once on mount, never triggers re-renders. Wish pagination stays stable throughout the session. Removed resize event listener entirely.
2. Added `will-change-transform` to light-sweep container and `transform-gpu` to the animated child — ensures the browser isolates the oversized element in its own compositing layer, preventing overflow detection.
3. Changed all 4 full-height sections from `h-[100dvh]` to `h-[100svh]` — `svh` (small viewport height) uses the viewport with URL bar visible, so it never changes during scroll. No resize = no jump.

---

## PERFORMANCE ISSUES

---

## Issue #P1 — No Code Splitting (Entire App Loaded Eagerly) [FIXED]

**Root Cause:**
`App.tsx:5-18` — All 13 section and feature components are statically imported. The entire component tree is bundled into a single chunk. Components like `TwibbonCreator` (Canvas 2D, drag/pinch logic) and `RSVPModal` are loaded before the invitation is even opened.

**Impact:**
Users pay full parse + compile cost of all components before interacting with the opening screen. On slow 3G mobile connections, this delays Time to Interactive significantly.

**Solution:**
Use `React.lazy` + `Suspense` for everything rendered after `isOpen === true`. At minimum: `TwibbonSection`, `PhotoGallery`, `RSVPModal`, `PhotoZoomModal`, `DigitalEnvelope`, `Footer`. Keep `CinematicOpening` eager (critical path).

---

## Issue #P2 — Hero Image Missing `fetchpriority` and Dimensions [FIXED]

**Root Cause:**
`CinematicOpening.tsx:25` and `HeroSection.tsx:12` — Both load the hero JPEG with no `fetchpriority="high"` attribute and no explicit `width`/`height`, causing CLS (Cumulative Layout Shift).

**Impact:**
Browser may deprioritize the LCP image fetch. Lack of dimensions causes layout shift during load.

**Solution:**
Add `fetchpriority="high"` to both hero `<img>` elements. Add explicit dimensions or `aspect-ratio` in CSS.

---

## Issue #P3 — Google Fonts Loaded as Render-Blocking Stylesheet [FIXED]

**Root Cause:**
`index.html:23` — `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?...">` is a synchronous stylesheet that blocks rendering. Three font families with multiple weights are requested.

**Impact:**
First Contentful Paint delayed by full round-trip to Google's font servers. On slow 3G: 500-1500ms added.

**Solution:**
Use `media="print" onload="this.media='all'"` pattern for non-blocking font loading. Trim unused weights (Montserrat 200, 300 appear unused).

---

## Issue #P4 — Dayland Font Should Be Self-Hosted [FIXED]

**Root Cause:**
`index.css:3-9` — Dayland font fetched from `fonts.cdnfonts.com` at runtime. No `size-adjust` or `ascent-override` to reduce CLS during font swap. External CDN introduces network dependency.

**Impact:**
If cdnfonts.com is slow/unreachable, hero names flash in fallback font causing visible CLS.

**Solution:**
Self-host `Dayland.woff` in `/public/fonts/` and update the `src:` URL. Add `size-adjust: 100%`.

---

## Issue #P5 — Resize Event Listener Not Throttled [FIXED]

**Root Cause:**
`App.tsx:34-38` — `window.addEventListener('resize', handleResize)` fires `setViewportHeight` on every resize event with no debounce. Each update triggers the `wishPages` useMemo recalculation.

**Impact:**
During window resize or mobile URL bar changes, entire wish pagination re-runs on every pixel of movement, causing cascading re-renders.

**Solution:**
Wrap `handleResize` with `requestAnimationFrame` throttle:
```ts
const handleResize = () => {
  if (rafId.current) return;
  rafId.current = requestAnimationFrame(() => {
    setViewportHeight(window.innerHeight);
    rafId.current = null;
  });
};
```

---

## Issue #P6 — `wishPages` Uses Stale Closure in Submit Handler [FIXED]

**Root Cause:**
`App.tsx:126` — `setWishes([newWish, ...wishes])` closes over stale `wishes` instead of using functional updater `setWishes(prev => [newWish, ...prev])`.

**Impact:**
Subtle stale-closure risk if handler is called in async context. Not a bug yet but fragile.

**Solution:**
Change to `setWishes(prev => [newWish, ...prev])`.

---

## Issue #P7 — setTimeout Calls Not Cleared on Unmount [FIXED]

**Root Cause:**
`App.tsx:112,130-133` — Two `setTimeout` calls (copiedIndex clear at 2s, modal close at 1.5s) store no ref and have no cleanup.

**Impact:**
Callbacks execute after unmount, wasting CPU. In concurrent React, this can cause issues.

**Solution:**
Store timeout IDs in `useRef` and call `clearTimeout` in `useEffect` cleanup.

---

## Issue #P8 — CountdownTimer Runs 13+ Concurrent Animations Per Second [FIXED]

**Root Cause:**
`CountdownTimer.tsx:4-29` — Each `TimeBox` has: `AnimatePresence` flip (exit+enter per tick), floating animation (`y: [0,-4,0]`), and `animate-pulse` blur. 4 boxes x 3 animations = 12+ concurrent tracks, triggered every second.

**Impact:**
Continuous JavaScript-driven animation overhead for the entire page lifetime. Drains battery on mobile.

**Solution:**
Remove per-TimeBox float animation (apply once to parent). Replace `AnimatePresence` digit flip with CSS `@keyframes`. Remove `animate-pulse` blurs.

---

## Issue #P9 — FloatingController Runs 4 Infinite Animations When Music Playing [FIXED]

**Root Cause:**
`FloatingController.tsx:62-88` — Pulsing glow ring (`blur-xl`), rotating dashed ring, rotating gradient, pulsing heart — all infinite, for the entire music-playing session.

**Impact:**
4 concurrent infinite animations including a `blur-xl` filter re-compositing every 2 seconds.

**Solution:**
Remove `blur-xl` from pulse ring. Consolidate two rotate animations into one. Cap to 2 concurrent infinite animations.

---

## Issue #P10 — RSVPSection Background blur-[120px] Runs Indefinitely [FIXED]

**Root Cause:**
`RSVPSection.tsx:18-19` — Full-viewport `motion.div` with `blur-[120px]` animating `scale` and `opacity` every 15s, `repeat: Infinity`.

**Impact:**
`blur-[120px]` is one of the costliest GPU operations. Forces re-compositing of entire section every 15s.

**Solution:**
Replace with static `radial-gradient` or remove `scale` component (opacity-only transitions are cheap). At `opacity: 0.3` of `bg-gold/5`, the blur is visually imperceptible.

---

## Issue #P11 — Gallery/Story Images Missing `decoding="async"` [FIXED]

**Root Cause:**
`PhotoGallery.tsx:35`, `CinematicStory.tsx:52` — Images have `loading="lazy"` but lack `decoding="async"`.

**Impact:**
Main thread blocks during image decode as images enter viewport, causing scroll jank.

**Solution:**
Add `decoding="async"` to gallery and story images.

---

## Issue #P12 — TwibbonCreator Overlay Uses Expensive Procedural Drawing [FIXED]

**Root Cause:**
`TwibbonCreator.tsx:6-7,41-46` — Canvas created at 1080x1920 (~8MB GPU texture) for a preview rendered in a ~300px container.

**Impact:**
8MB+ GPU texture memory consumed for a preview that could be 540x960 for same visual quality.

**Solution:**
Render preview at lower resolution. Only create full 1080x1920 canvas at download time.

---

## Issue #P13 — Handler Functions Not Memoized in App.tsx [FIXED]

**Root Cause:**
`App.tsx:73-134` — `handleCopy`, `toggleMusic`, `handleOpen`, `handleRSVPSubmit` are plain functions with no `useCallback`. App re-renders frequently, passing new references to all children.

**Impact:**
Unnecessary prop changes can cause motion value recalculations in child components.

**Solution:**
Wrap all handlers in `useCallback` with appropriate dependencies.

---

## FUNCTIONALITY ISSUES

---

## Issue #F0 — TwibbonCreator Lags on Large Image Upload (100MB+) [FIXED]

**Root Cause:**
`TwibbonCreator.tsx:39` — `FileReader.readAsDataURL(file)` converts the entire file to a base64 string. A 100MB photo becomes ~133MB base64 stored in React state. Every render carries this string. The `<img src={dataUrl}>` must decode it every frame during drag/pinch — causing severe lag.

**Solution:**
1. Replaced `readAsDataURL` with `URL.createObjectURL(file)` — creates a ~50-byte blob URL pointing to the file in browser memory. Zero base64 encoding, zero extra memory for the URL. Browser streams the file efficiently.
2. Added client-side image resize — if image exceeds 2000px on longest side, it's scaled down via off-screen canvas before being used for preview. A 100MB 8000x12000 photo becomes a ~2000px JPEG blob (~few MB in GPU memory vs ~400MB uncompressed). Quality is preserved — the export canvas is only 1080x1920, so 2000px source exceeds it.
3. Added `URL.revokeObjectURL()` on image reset ("Ganti Foto"), on new upload (revoke previous), and on component unmount to prevent memory leaks.
4. Added `file.type.startsWith('image/')` validation — rejects non-image files programmatically (in addition to the existing `accept="image/*"` on the input).
5. Single file upload already enforced — `<input>` has no `multiple` attribute.
6. Small images (under 2000px) skip the resize and use the blob URL directly — no unnecessary processing.

---

## Issue #F1 — TwibbonCreator Passive Touch Event Prevents preventDefault [FIXED]

**Root Cause:**
`TwibbonCreator.tsx:181-183` — `onTouchStart`/`onTouchMove` are React synthetic events. React 17+ attaches touch listeners with `{ passive: true }` by default. `handleStart`/`handleMove` call `e.preventDefault()` which has no effect on passive listeners.

**Impact:**
On iOS, pinch-to-zoom on twibbon also zooms page viewport. Drag interactions compete with page scroll.

**Solution:**
Attach native event listeners directly on the container ref with `{ passive: false }` using `useEffect`. Remove React synthetic `onTouchStart`/`onTouchMove` from JSX.

---

## Issue #F2 — TwibbonCreator Pinch-to-Drag Transition Causes Image Jump

**Root Cause:**
`TwibbonCreator.tsx:73-85` — When transitioning from 2-finger pinch to 1-finger pan, `lastPos` is stale from the previous single-finger position. The drag delta calculation jumps.

**Impact:**
Image jumps erratically when user lifts one finger after pinch-zoom.

**Solution:**
Update `lastPos` at the end of the 2-touch branch so transition to single-finger pan is smooth.

---

## Issue #F3 — TwibbonCreator Download Scale Uses Same Factor for X and Y

**Root Cause:**
`TwibbonCreator.tsx:146` — Translation uses `CANVAS_W / previewEl.clientWidth` for both x and y axes.

**Impact:**
Downloaded image positioning may not match preview on screens where the container aspect ratio has rounding differences.

**Solution:**
Use separate scale factors: `scaleX = CANVAS_W / previewEl.clientWidth`, `scaleY = CANVAS_H / previewEl.clientHeight`.

---

## Issue #F4 — Clipboard Copy Race Condition with copiedIndex Timeout [FIXED]

**Root Cause:**
`App.tsx:93-113` — Rapid taps on different bank cards: first `setTimeout(setCopiedIndex(null), 2000)` clears the second card's highlight prematurely.

**Impact:**
"Copied" indicator on second tapped card disappears early.

**Solution:**
Use `useRef` to track timeout ID and `clearTimeout` before creating new one.

---

## Issue #F5 — RSVP Form Accepts Whitespace-Only Names

**Root Cause:**
`App.tsx:116-134` — HTML `required` prevents empty but allows `"   "` (spaces only). `formData.get('name')` stored without trimming.

**Impact:**
Wishes stored with blank names, rendering as empty slots in RSVPSection.

**Solution:**
Trim name and message before storing. Reject if empty after trim.

---

## Issue #F6 — wishPages Pagination Not Reset on Viewport Resize

**Root Cause:**
`App.tsx:34-65` — `wishPages` recalculates on `viewportHeight` change but `currentPage` is not clamped. If user is on page 3 and rotates device, new calculation may produce only 2 pages. `wishPages[2]` is `undefined`, showing blank list.

**Impact:**
Wish list appears empty after device rotation if current page exceeds new total.

**Solution:**
Add `useEffect` that clamps `currentPage` when `wishPages.length` changes:
```ts
useEffect(() => {
  setCurrentPage(p => Math.min(p, Math.max(1, wishPages.length)));
}, [wishPages.length]);
```

---

## Issue #F7 — toggleMusic Sets isPlaying Before Audio Promise Resolves

**Root Cause:**
`App.tsx:86-90` — `setIsPlaying(true)` called before `play()` resolves. If `play()` rejects, UI briefly shows playing state then snaps back.

**Impact:**
Brief UI flicker — pause icon flashes before switching back to play icon.

**Solution:**
Move `setIsPlaying(true)` into `.then()` callback.

---

## Issue #F8 — CinematicStory Mobile Swipe Hint Only Plays Once

**Root Cause:**
`CinematicStory.tsx:121` — Mobile hint animation uses `animate` with `opacity: [0, 0.8, 0.8, 0]` but no `repeat`. After 3s it fades out permanently.

**Impact:**
Users who miss the hint window have no indication the section is horizontally scrollable.

**Solution:**
Add `repeat: Infinity` with `repeatDelay: 5` to the mobile hint animation.

---

## Issue #F9 — FloatingController Drag Conflicts with Tap on Mobile

**Root Cause:**
`FloatingController.tsx:12-17` — `drag` enabled on same element containing the toggle button. Quick taps can register as micro-drags (1-2px), suppressing the click.

**Impact:**
Floating menu button intermittently unresponsive on mobile.

**Solution:**
Add `onPointerDown={(e) => e.stopPropagation()}` on inner button, or set minimum drag distance threshold.

---

## Issue #F10 — CinematicStory Dot Indicators Rendered Inside Each Slide (N x N DOM Nodes)

**Root Cause:**
`CinematicStory.tsx:109-113` — Dots rendered inside the slide loop. 6 slides x 6 dots = 36 dot elements. Each slide highlights its own dot using `i === idx`, not dynamic `activeSlide`.

**Impact:**
30 redundant DOM nodes. Dots don't reflect partial-scroll progress during slow drag.

**Solution:**
Move dot row outside the slide loop, render once at section level, use `activeSlide` as comparison value.

---

## BROWSER COMPATIBILITY ISSUES

---

## Issue #B1 — `dvh` Units Used Without Fallback [SEVERITY: CRITICAL]

**Root Cause:**
Multiple sections use `h-[100dvh]`. Not supported in Chrome < 108, Safari < 15.4, Firefox < 101.

**Impact:**
Sections collapse to 0 height on older mobile browsers — entire sections invisible.

**Solution:**
Add `vh` fallback:
```css
.h-screen-dynamic { height: 100vh; height: 100dvh; }
```

---

## Issue #B2 — Canvas `ctx.filter` Check Unreliable in Safari

**Root Cause:**
`twibbonOverlay.ts:30-37` — `typeof ctx.filter !== 'undefined'` is always `'string'` even in Safari where filter is a no-op. The blur cutout renders with hard edges instead of soft vignette.

**Impact:**
Twibbon overlay has sharp rectangular hole instead of soft arch reveal on Safari.

**Solution:**
Implement manual blur fallback using stacked semi-transparent fills, or detect Safari and skip the blur.

---

## Issue #B3 — `backdrop-blur` Degrades Silently on Older Browsers

**Root Cause:**
`RSVPModal.tsx:22`, `FloatingController.tsx:37`, `PhotoZoomModal.tsx:17` — `backdrop-filter: blur()` silently degrades to transparent on Chrome < 76 and Firefox < 103.

**Impact:**
Modal backgrounds appear fully transparent, making text unreadable.

**Solution:**
Ensure all critical overlays have sufficient opaque fallback background (e.g. `bg-ink/80`) alongside `backdrop-blur`.

---

## ACCESSIBILITY ISSUES

---

## Issue #A1 — RSVPModal Missing `role="dialog"` and Keyboard Trap [SEVERITY: HIGH]

**Root Cause:**
`RSVPModal.tsx:16` — No `role="dialog"`, no `aria-modal="true"`, no focus trap, no Escape key handler.

**Impact:**
Screen readers don't announce overlay as dialog. Tab cycles through content behind modal. Escape doesn't close.

**Solution:**
Add `role="dialog" aria-modal="true" aria-labelledby`. Add `onKeyDown` for Escape. Implement focus trap.

---

## Issue #A2 — PhotoZoomModal Missing `role="dialog"` and Keyboard Close

**Root Cause:**
`PhotoZoomModal.tsx:12-42` — Same as A1. No `role="dialog"`, no Escape handler.

**Impact:**
Same as A1 — degraded keyboard and screen reader experience.

**Solution:**
Add `role="dialog" aria-modal="true"` and Escape key handler.

---

## Issue #A3 — PhotoGallery Items Not Keyboard Accessible

**Root Cause:**
`PhotoGallery.tsx:24-41` — Gallery items are `<motion.div>` with `onClick` but no `role="button"`, no `tabIndex`, no `onKeyDown`.

**Impact:**
Keyboard users cannot open photo zoom modal.

**Solution:**
Add `role="button" tabIndex={0}` and `onKeyDown` handler for Enter/Space.

---

## Issue #A4 — DigitalEnvelope Copy Cards Not Keyboard Accessible

**Root Cause:**
`DigitalEnvelope.tsx:26-51` — Bank account cards use `onClick` on `<motion.div>` with no keyboard support.

**Impact:**
Keyboard users cannot copy bank account numbers.

**Solution:**
Add `role="button" tabIndex={0}` and `onKeyDown` handler. Add `aria-label`.

---

## Issue #A5 — CinematicOpening SVG Missing `aria-hidden`

**Root Cause:**
`CinematicOpening.tsx:65-97` — The envelope SVG has no `aria-hidden="true"`. Screen readers may announce SVG path data.

**Impact:**
Confusing screen reader output on the open button.

**Solution:**
Add `aria-hidden="true"` to the `<motion.svg>`.

---

## Issue #A6 — RSVP Modal Attendance Group Missing fieldset/legend

**Root Cause:**
`RSVPModal.tsx:72-88` — Radio group has no `<fieldset>/<legend>` wrapping. Group label is decorative text only.

**Impact:**
Screen readers cannot announce group context for Hadir/Berhalangan radios.

**Solution:**
Wrap in `<fieldset>` with `<legend>`.

---

## ERROR HANDLING ISSUES

---

## Issue #E1 — URL decodeURIComponent Throws on Malformed Params [SEVERITY: CRITICAL]

**Root Cause:**
`App.tsx:70` — `decodeURIComponent(to)` throws `URIError` on malformed percent sequences (e.g. `?to=%GG`). No try/catch.

**Impact:**
Entire app crashes with blank screen for any guest link with malformed `to` parameter.

**Solution:**
```ts
try {
  if (to) setGuestName(decodeURIComponent(to).slice(0, 100));
} catch { /* leave default */ }
```

---

## Issue #E2 — No `onError` Fallback on Any Image Element

**Root Cause:**
All `<img>` elements across all sections have no `onError` handler.

**Impact:**
Broken images if assets are missing from hosting — no graceful degradation.

**Solution:**
Add `onError` handlers on critical images to hide or show placeholder.

---

## Issue #E3 — TwibbonCreator Download Failure is Silent

**Root Cause:**
`TwibbonCreator.tsx:124-158` — `handleDownload` has no error handling. `canvas.toDataURL()` can throw on tainted canvas.

**Impact:**
Download fails silently if CORS headers are missing.

**Solution:**
Wrap in try/catch and show user-facing error message.

---

## Issue #E4 — useCountdown Does Not Handle Invalid Date Strings

**Root Cause:**
`useCountdown.ts:14` — `new Date(targetDate).getTime()` returns `NaN` for invalid dates. UI displays "NaN" in countdown boxes.

**Impact:**
"NaN" displayed if date constant is ever changed to invalid value.

**Solution:**
Guard with `if (isNaN(target)) return;`.

---

## Issue #E5 — Guest Name URL Param Has No Length Limit

**Root Cause:**
`App.tsx:70` — No length cap on decoded `guestName`. Extremely long params break the opening screen layout.

**Impact:**
Layout break on intentionally long URL parameters.

**Solution:**
Truncate: `decodeURIComponent(to).slice(0, 100)`.

---

## Issue #E6 — AmbientSocialLayer Pool Uses Stale Closure in setInterval

**Root Cause:**
`AmbientSocialLayer.tsx:64-79` — `pool` captured in setInterval closure is stale. New comments don't appear in ambient stream until next length change.

**Impact:**
Newly-submitted comments missed in the ambient floating display.

**Solution:**
Use `useRef` to track pool so interval callback reads latest version.

---

## PRIORITY MATRIX

| Priority | Issues |
|---|---|
| **Critical** | E1 (crash on malformed URL), B1 (dvh fallback) |
| **High** | P1 (code splitting), F1 (touch passive), A1 (modal accessibility), P8 (countdown animations) |
| **Medium** | P5 (resize throttle), P10 (blur animation), F2 (pinch transition), F4 (copy race), F6 (pagination reset), F7 (music toggle), F9 (drag conflict), B2 (canvas filter), E2 (image error), E3 (download error), A3-A4 (keyboard access) |
| **Low** | P6 (stale closure), P7 (timeout cleanup), P11 (decoding), P13 (memoization), F5 (whitespace names), F8 (swipe hint), E4-E6 (edge cases) |
