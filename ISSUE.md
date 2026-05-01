# Known Issues & Bugs

> Reference document for all identified issues in the wedding invitation project.
> Priority: Mobile-first, but must not break desktop.

---

## Issue #1 — Floating Controller "Info Acara" Link Broken [FIXED]

**Problem:**
Tapping "Info Acara" from the floating controller does nothing. The page doesn't scroll to the Event section.

**Root Cause:**
The floating controller calls `document.getElementById('event-section')` at `App.tsx:1418`, but the Event section element at `App.tsx:1694` does not have `id="event-section"` on it.

**Impact:**
On mobile, users rely heavily on the floating controller for navigation. This link is completely non-functional — tapping it closes the menu but nothing happens. Users cannot quick-jump to the event details (time, venue, map).

**Solution:**
Add `id="event-section"` to the Event section element.

---

## Issue #2 — Missing Image Asset (ivory_texture.jpg) [FIXED]

**Problem:**
CinematicStory slide 5 (year "2026") shows a broken/missing image background.

**Root Cause:**
`App.tsx:945` references `/ivory_texture.jpg` as the background image, but this file does not exist in the `/public` directory. Available assets are only: `bride_face_potrait.jpeg`, `groom_face_potrait.jpeg`, `bride_and_groom_full_body_potrait.jpeg`, `bride_and_groom_half_body_potrait.png`.

**Impact:**
On mobile the story slide shows a dark screen with no background image. On desktop the grayscale-to-color hover transition also has nothing to reveal. It breaks the visual flow of the love story timeline.

**Solution:**
Either add the missing `ivory_texture.jpg` to `/public`, or replace the reference with an existing image.

---

## Issue #3 — RSVP Form Reads Nonexistent `count` Field [FIXED]

**Problem:**
The RSVP submit handler tries to read a `count` field that doesn't exist in the form.

**Root Cause:**
`App.tsx:1239` calls `formData.get('count')` but the RSVP form (lines 1978-2021) has no `<input name="count">`. The value always falls back to `1` via `Number(formData.get('count')) || 1`. Additionally, the `count` property on `GuestWishes` is never displayed anywhere in the UI.

**Impact:**
No visible error, but it's dead code that adds confusion. The `GuestWishes` interface requires a `count` field that serves no purpose. If someone later tries to add a guest count feature, they'd find a broken connection between the type, the handler, and the missing form field.

**Solution:**
Either remove `count` from the `GuestWishes` interface and the submit handler, or add the actual guest count input to the RSVP form and display it in the wish cards.

---

## Issue #4 — Wrong Page Title [FIXED]

**Problem:**
The browser tab shows "My Google AI Studio App" instead of anything wedding-related.

**Root Cause:**
`index.html:5` still has the default title from the Google AI Studio export. It was never updated.

**Impact:**
When guests open the invitation on mobile, the tab/recent-apps preview shows a generic title. Shared links (WhatsApp, social media) may also pick up this title as the page name. Hurts personalization and professionalism.

**Solution:**
Change the title to something like "Dani & Marini — Wedding Invitation" and add a meta description for better link previews.

---

## Issue #5 — Placeholder Google Maps Link [FIXED]

**Problem:**
The "Lihat Peta" (View Map) button opens a non-functional URL.

**Root Cause:**
`App.tsx:1773` links to `https://maps.app.goo.gl/YourMapLink` which is a placeholder string, not an actual Google Maps short link.

**Impact:**
On mobile, tapping the map button opens a browser tab to a dead URL. This is a critical UX failure — guests need directions to the venue. Mobile guests are the most likely to need this feature.

**Solution:**
Generate a real Google Maps short link for "Gedung Wanita Candra Kencana, Jl. Kalibokor Selatan No.2, Baratajaya, Gubeng, Surabaya" and replace the placeholder.

---

## Issue #6 — Unused `exportCanvasRef` [FIXED]

**Problem:**
A canvas ref is declared but never attached to any element or used in any logic.

**Root Cause:**
`App.tsx:238` declares `const exportCanvasRef = useRef<HTMLCanvasElement>(null)` inside `TwibbonCreator`. It was likely intended for the export/download flow but `handleDownload` creates its own canvas via `document.createElement('canvas')` instead.

**Impact:**
No functional impact. Dead code that adds confusion when reading the TwibbonCreator component.

**Solution:**
Remove the unused ref declaration.

---

## Issue #7 — Unused `TimelineEvent` Interface [FIXED]

**Problem:**
An exported TypeScript interface exists that nothing imports or uses.

**Root Cause:**
`types.ts:11-14` exports `TimelineEvent` with `year`, `title`, `description` fields. The `CinematicStory` component uses inline slide objects with a different shape (`year`, `text`, `bg`) instead of this interface.

**Impact:**
No functional impact. Misleading for developers — suggests there's a timeline data structure that should be used but isn't.

**Solution:**
Either remove `TimelineEvent` from `types.ts`, or refactor `CinematicStory` to use it (would require updating the interface fields to match the actual slide data shape).

---

## Issue #8 — Unused Scroll Progress Computation [FIXED]

**Problem:**
Scroll-linked values are computed every frame but never used in the render output.

**Root Cause:**
`App.tsx:1198-1199` creates `scrollYProgress` via `useScroll()` and `smoothProgress` via `useSpring()`. Neither variable is referenced anywhere in the JSX. These were likely planned for a scroll-driven animation that was never implemented.

**Impact:**
Performance waste — `useScroll()` attaches a scroll listener that fires on every scroll event, and `useSpring()` runs spring physics calculations continuously. On low-end mobile devices, this unnecessary computation during scroll can contribute to jank.

**Solution:**
Remove both lines and the unused imports (`useScroll`, `useTransform`, `useSpring` from `motion/react`).

---

## Issue #9 — CountdownTimer Stale Closure on `targetDate` [FIXED]

**Problem:**
If the `targetDate` prop were to change, the countdown timer would continue counting toward the original date.

**Root Cause:**
`App.tsx:177` — the `useEffect` that sets up the interval has an empty dependency array `[]` but closes over the `targetDate` prop. React's rules of hooks require all referenced values to be in the dependency array.

**Impact:**
Currently low impact since `targetDate` is hardcoded as `"2026-08-29T09:00:00"` and never changes. However, it violates React best practices and would become a real bug if the component were ever reused with dynamic dates.

**Solution:**
Add `targetDate` to the dependency array: `}, [targetDate]);`

---

## Issue #10 — Unstable `useEffect` Dependency in AmbientSocialLayer [FIXED]

**Problem:**
The ambient social element spawning interval is torn down and recreated more often than necessary.

**Root Cause:**
`App.tsx:844` uses `JSON.stringify(pool)` as a `useEffect` dependency. Every time a new comment is added to any story slide, `pool` gets a new entry, `JSON.stringify(pool)` produces a new string, React sees it as a changed dependency, and tears down + recreates the `setInterval`. Even without new comments, if the parent re-renders and passes a new `customComments` array reference (same content), the stringify output is the same but the comparison still runs.

**Impact:**
Each story slide has its own `AmbientSocialLayer`. When a user adds a comment, all 6 slides' intervals get reset. On mobile, this means a brief pause in the ambient animation across all slides, which is a subtle but unnecessary visual glitch. The `JSON.stringify` on every render is also wasteful.

**Solution:**
Use a stable dependency like `pool.length` or memoize the pool array. The interval only needs to restart when the pool actually gains new entries.

---

## Issue #11 — Twibbon Preview vs Export Mismatch [FIXED]

**Problem:**
The downloaded twibbon PNG has a different floral arrangement than what the user sees in the preview.

**Root Cause:**
The `drawOverlay` function (`App.tsx:259`) uses `Math.random()` extensively for flower placement, sizes, types, and colors (~100+ random calls). It runs once for the preview canvas on mount, then runs again during `handleDownload` to draw the export canvas. Since `Math.random()` is non-deterministic, both calls produce completely different flower arrangements.

**Impact:**
On mobile, the user carefully positions their photo within the arch frame based on how the preview looks. When they download, the floral frame is different — flowers may overlap their face differently or the visual balance changes. This is a trust/quality issue for a personal wedding tool.

**Solution:**
Use a seeded pseudo-random number generator (PRNG) instead of `Math.random()`. Store a fixed seed on component mount, and use the same seed for both preview and export draws. This ensures both renders produce identical floral arrangements.
