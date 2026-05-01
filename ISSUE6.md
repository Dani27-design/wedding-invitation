# Deep Scan — Issues Round 6 (Code Efficiency & Best Practices)

> Sixth pass. Focused on code efficiency, React best practices, latency micro-optimizations, and final hardening.
> The codebase is production-quality after 50 fixes. These are refinement-level items.
> Priority: Mobile-first, must not break desktop.

---

## PERFORMANCE

---

### Issue #61 — `TimeBox` Component Defined Inside `CountdownTimer` (Recreated Every Second) [FIXED]

**Problem:**
The `TimeBox` sub-component is defined inside the `CountdownTimer` function body, causing React to create a new component reference every render — which happens every second due to the interval.

**Root Cause:**
`App.tsx:171-198` — `TimeBox` is a function component declared inside `CountdownTimer`. Every time `setTimeLeft` triggers a re-render (every second), a new `TimeBox` function is created. React sees it as a different component type, potentially causing unnecessary unmount/remount cycles for the `AnimatePresence` children.

**Impact:**
On mobile, this means 4 `TimeBox` components are potentially re-created every second. While React's reconciler is smart enough to handle this for simple cases, the `AnimatePresence` wrapper with `mode="wait"` may trigger extra exit/enter animations on every tick if the component identity changes.

**Solution:**
Move `TimeBox` outside of `CountdownTimer` as a standalone component. Pass `value` and `label` as props — same interface, just declared at module scope.

---

### Issue #62 — `formatDate` Function Recreated on Every Render [FIXED]

**Problem:**
The `formatDate` helper is defined inside the `App` component body, creating a new function instance on every render.

**Root Cause:**
`App.tsx:1291-1297` — `formatDate` uses `Intl.DateTimeFormat` which also creates a new formatter instance on every call. This function is called for each wish card on the current page (up to ~10 per page).

**Impact:**
Minor — the function itself is lightweight. But `Intl.DateTimeFormat` construction has some overhead. Since `formatDate` has no dependency on component state, it can be a module-level constant with a cached formatter.

**Solution:**
Move `formatDate` outside the component and cache the `Intl.DateTimeFormat` instance:
```ts
const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const formatDate = (timestamp: number) => dateFormatter.format(timestamp);
```

---

### Issue #63 — `defaultComments` Array Recreated on Every AmbientSocialLayer Render [FIXED]

**Problem:**
The `defaultComments` array and `pool` spread are recreated on every render of `AmbientSocialLayer`.

**Root Cause:**
`App.tsx:787-794` — `defaultComments` is a static string array declared inside the component body. `pool` spreads it with `customComments` on every render. Since `AmbientSocialLayer` re-renders when its parent (the active slide) re-renders, these allocations happen frequently.

**Impact:**
Minor per-render cost. The 5-element default array and spread are cheap, but they're completely unnecessary to recreate since the defaults never change.

**Solution:**
Move `defaultComments` to module scope (above the component). The `pool` computation can stay inside since it depends on `customComments` prop.

---

### Issue #64 — Gallery Stagger Delay Creates Long Reveal Sequence (1.2s Total) [FIXED]

**Problem:**
The gallery images use `delay: i * 0.1` with 12 items, meaning the last image waits 1.2 seconds before starting its entrance animation.

**Root Cause:**
`App.tsx:2238` — each gallery item has `transition={{ duration: 0.8, delay: i * 0.1 }}`. With 12 items in a horizontal scroll grid, the rightmost images (which are off-screen) still wait for their stagger delay before animating — even though the user can't see them yet.

**Impact:**
On mobile, images at positions 8-12 don't start their fade-in until 0.8-1.2 seconds after the section enters view. Since they're off-screen (horizontal scroll), the delay is wasted — users only see the first 2-3 images initially. If they scroll right quickly, images may still be mid-animation.

**Solution:**
Cap the delay at a lower maximum, e.g. `delay: Math.min(i * 0.1, 0.3)` so all images start animating within 300ms. Off-screen images finish before the user scrolls to them.

---

## CODE QUALITY / BEST PRACTICES

---

### Issue #65 — `drawOverlay` Has `skipClear` Parameter That Is Never Used [FIXED]

**Problem:**
The `drawOverlay` function accepts a `skipClear` parameter that is never passed as `true` by any caller.

**Root Cause:**
`App.tsx:250` — `drawOverlay` signature is `(ctx, w, h, skipClear = false)`. It's called in the `IntersectionObserver` callback (line 539) with 3 args — `skipClear` always defaults to `false`.

**Impact:**
Dead parameter. Adds confusion about when `skipClear` would be used. The original code had two callers (preview + export), but after Issue #11 fix, the export copies the canvas directly instead of re-calling `drawOverlay`.

**Solution:**
Remove the `skipClear` parameter and the `if (!skipClear)` guard — always clear the canvas at the start of `drawOverlay`.

---

### Issue #66 — `stagger` and `fadeUp` Animation Presets Are Module-Level but Tightly Coupled to Components [WON'T FIX]

**Problem:**
The `transition`, `stagger`, and `fadeUp` animation preset objects are defined at module scope but only used in the Couple section.

**Root Cause:**
`App.tsx:30-43` — these three constants are defined at the top of the file. `stagger` and `fadeUp` are only used in the Couple section's `motion.div` variants. `transition` is referenced by `fadeUp`. No other component uses them.

**Impact:**
No performance impact — module-level constants are fine. But naming them generically (`transition`, `stagger`, `fadeUp`) at the top of a 2300+ line file suggests they're used globally, when they're actually local to one section. The name `transition` also shadows the common concept of CSS transitions in the reader's mind.

**Solution:**
This is a code clarity issue, not a bug. Could be left as-is. If cleaning up, rename to be more specific (e.g., `coupleTransition`, `coupleStagger`, `coupleFadeUp`) or move them closer to where they're used. Low priority.

---

### Issue #67 — Opening Background Image Not Preloaded (First Thing User Sees) [FIXED]

**Problem:**
The cinematic opening background image loads via a normal `<img>` tag with no preload hint, yet it's the very first visual element users see.

**Root Cause:**
`App.tsx:1330-1333` renders the opening background as `<img src="/bride_and_groom_full_body_potrait.jpeg">`. There's no `<link rel="preload">` in `index.html` for this image. The browser discovers it only after React mounts the component.

**Impact:**
On slow mobile connections, users may see the dark opening overlay for 1-3 seconds before the background image loads. The cinematic opening relies on this image for its emotional impact. A preload hint would tell the browser to fetch it immediately during HTML parsing, before React even boots.

**Solution:**
Add `<link rel="preload" as="image" href="/bride_and_groom_full_body_potrait.jpeg">` to `index.html` `<head>`. This is the single most impactful image for perceived load time.

---

### Issue #68 — `// Build Update: 2026-04-29` Stale Comment on Line 1 [FIXED]

**Problem:**
The first line of `App.tsx` has a build date comment that is no longer accurate and serves no purpose.

**Root Cause:**
`App.tsx:1` — `// Build Update: 2026-04-29` was from the AI Studio export. It's not auto-updated and doesn't reflect the actual last modification date.

**Impact:**
No functional impact. Misleading for anyone reading the source — they may think the file hasn't been modified since April 29. Minor code noise.

**Solution:**
Remove the comment.

---

## SEO

---

### Issue #69 — No `<meta name="theme-color">` for Mobile Browser Chrome [FIXED]

**Problem:**
Mobile browsers (Chrome, Safari, Samsung Internet) show the default white/gray toolbar color instead of matching the wedding theme.

**Root Cause:**
`index.html` has no `<meta name="theme-color">` tag. Mobile browsers use this to tint the address bar and status bar.

**Impact:**
On Android Chrome, the toolbar stays white/gray above the dark cinematic opening — a visual mismatch. With `theme-color` set to ink (#1A1A1A), the toolbar would blend seamlessly with the opening screen. On iOS Safari, it affects the status bar appearance.

**Solution:**
Add `<meta name="theme-color" content="#1A1A1A">` to `index.html` `<head>`. The ink color matches the cinematic opening background.

---

### Issue #72 — `App.tsx` Is a 2376-Line Monolith (No Component Splitting)

**Problem:**
The entire application — 10 components, all state logic, all sections, all modals — lives in a single `src/App.tsx` file at 2376 lines of code. This far exceeds the recommended 200-500 LOC per file for maintainable React code.

**Root Cause:**
The app was exported as a single-file output from Google AI Studio. All components (`LightGlow`, `ForegroundOrnaments`, `FloatingPetals`, `BackgroundLayers`, `CountdownTimer`, `TwibbonCreator`, `AmbientSocialLayer`, `PetalEffect`, `CinematicStory`, `App`) are defined sequentially in one file. No component splitting was ever done.

**Impact:**
- **Developer experience:** Navigating, reading, and understanding a 2376-line file is difficult. Finding a specific section requires scrolling through unrelated code.
- **Code review:** Changes to one component show a diff in the same file as everything else, making reviews harder.
- **Build efficiency:** Any change to any component invalidates the entire file's module cache during development.
- **Reusability:** Components like `CountdownTimer`, `FloatingPetals`, or `BackgroundLayers` could be reused in other projects but can't be imported individually.
- **Collaboration:** Two people cannot work on different sections without merge conflicts.

**Solution:**
Split into a component structure:
```
src/
  components/
    ambient/
      LightGlow.tsx
      ForegroundOrnaments.tsx
      FloatingPetals.tsx
      BackgroundLayers.tsx
      PetalEffect.tsx
      AmbientSocialLayer.tsx
    CountdownTimer.tsx
    TwibbonCreator.tsx
    CinematicStory.tsx
  App.tsx (main orchestrator, imports all components)
  main.tsx
  index.css
  types.ts
```

Each component file would contain its own component + its local helpers. Shared animation presets (`transition`, `stagger`, `fadeUp`) can go in a `utils/animations.ts` file. The `App.tsx` would become a clean orchestrator (~300-400 lines) that imports and composes the sections.

---

### Issue #73 — Zero Test Coverage (No Unit Tests or Component Tests)

**Problem:**
The project has no tests whatsoever — no test runner installed, no test files, no test scripts. There are no logical unit tests and no UI component tests.

**Root Cause:**
The project was exported from Google AI Studio which doesn't include a testing setup. No test framework (`vitest`, `jest`, `@testing-library/react`) is in `package.json`. No `test` script exists. No `__tests__/` or `*.test.tsx` files exist anywhere.

**Impact:**
- **Logical bugs:** Functions like `wishPages` pagination, `handleCopy` fallback, `CountdownTimer` calculation, `handleStoryScroll` index calculation, and `handleCanvasClick` boundary detection have zero verification. Regressions go undetected.
- **UI bugs:** Component rendering, conditional displays (`isOpen`, `isToolsOpen`, `isSubmitSuccess`, `activeSlide`), form submission flow, and modal open/close have no automated checks.
- **Refactoring risk:** Issue #72 (component splitting) cannot be done safely without tests to verify nothing breaks. Any future changes are risky without a safety net.
- **Confidence:** No way to verify the app works correctly after dependency updates or code changes.

**Solution:**
Set up Vitest (pairs naturally with Vite) + React Testing Library:

1. **Install:** `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
2. **Add test script:** `"test": "vitest"` in package.json
3. **Logical unit tests (priority):**
   - `wishPages` pagination — correct page splitting, edge cases (empty, one wish, overflow)
   - `CountdownTimer` calculation — future date, past date, edge midnight
   - `formatDate` — correct Indonesian locale output
   - `handleCopy` — clipboard API success and fallback path
   - `handleCanvasClick` — boundary detection math (inside/outside arch)
   - `handleStoryScroll` — correct slide index from scroll position
4. **UI component tests:**
   - Opening screen renders with guest name from URL param
   - "Buka Undangan" click transitions to main content
   - RSVP form submission adds wish to feed
   - RSVP success state shows "Terima Kasih"
   - Copy button shows "Tersalin" feedback
   - Floating controller opens/closes tools menu
   - Pagination next/prev updates displayed wishes
   - Photo zoom modal opens on gallery click and closes on X

---

### Issue #70 — `.gitignore` Excludes `.env.example` But File No Longer Exists [FIXED]

**Problem:**
The `.gitignore` has a rule `!.env.example` to un-ignore the env example file, but that file was deleted in Issue #50.

**Root Cause:**
`.gitignore:8` has `!.env.example` which was needed when `.env.example` existed alongside the `.env*` ignore pattern on line 7. Since the file was deleted, this rule is dead.

**Impact:**
No functional impact. Dead gitignore rule that references a non-existent file.

**Solution:**
Remove the `!.env.example` line from `.gitignore`.

---

### Issue #71 — `bride_and_groom_half_body_potrait.png` Is 403KB (4x Larger Than Other Images) [FIXED]

**Problem:**
One image is a PNG at 403KB while all others are JPEGs at 58-103KB. This one file accounts for nearly half of all image weight.

**Root Cause:**
`/public/bride_and_groom_half_body_potrait.png` is 413KB as a PNG file. It's used in the story section, gallery (3 times), and couple section. The other 3 images are JPEGs averaging 77KB.

**Impact:**
On mobile, this single file takes significantly longer to download than the others. It's referenced 6+ times across the app (story slides, gallery grid). Converting to JPEG with quality 85 would likely reduce it to ~80-120KB — a 3-4x reduction — with minimal visual difference.

**Solution:**
Convert to JPEG format. This requires the original image file to be re-exported. The file path references throughout the code would need to change from `.png` to `.jpeg`.
