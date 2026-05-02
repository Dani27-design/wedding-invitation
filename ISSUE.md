# Issue Tracker

> Deep scan of the wedding invitation project after 6 rounds of hardening.
> 30 source files, 2,008 LOC code, 29 test files, 15,324 LOC tests, 2,017 tests passing.

---

## Issue #1 — No Data Persistence (Wishes Lost on Refresh)

**Root Cause:**
`App.tsx` stores wishes in `useState` initialized from `SEED_WISHES`. New submissions via `handleRSVPSubmit` prepend to this array, but the state is never persisted to any storage. On page refresh, all user-submitted wishes are lost and the seed data reloads.

**Impact:**
Every guest's wish disappears after the page is refreshed or reopened. The RSVP feature is effectively decorative — no real guest data is ever collected. This defeats the purpose of the RSVP & Wishes section for the actual wedding.

**Solution:**
Integrate a backend or serverless database (Firebase Firestore, Supabase, or a simple API) to persist wishes. Alternatively, use `localStorage` as a lightweight client-side fallback for demo purposes.

---

## Issue #2 — Music File Is 3.2MB (Slows Initial Page Weight) [FIXED]

**Root Cause:**
`/public/musics/adele-make-you-feel-my-love.mp3` is 3.2MB. The `<audio>` element in `App.tsx` references it directly. While the browser doesn't block rendering for audio, it still starts downloading immediately on page load, consuming bandwidth before the user even clicks "Buka Undangan".

**Impact:**
On slow mobile connections (3G, common in Indonesia), 3.2MB can take 10-30 seconds to download. This competes with image and font downloads for the cinematic opening. The music may not be ready when the user clicks "Buka Undangan", causing a silent delay.

**Solution:**
Compress the MP3 to 128kbps (reduces to ~1-1.5MB) or use a more efficient codec (OGG/WebM). Add `preload="none"` to the audio element and only start loading when the user clicks "Buka Undangan".

---

## Issue #3 — `toggleMusic` Has Stale State Bug [FIXED]

**Root Cause:**
`App.tsx:74-80` — `toggleMusic` calls `audioRef.current.play()` without handling the returned promise. If `play()` is rejected (e.g., browser policy), `isPlaying` is set to `true` via `setIsPlaying(!isPlaying)` regardless. Unlike `handleOpen` which has `.catch()`, `toggleMusic` doesn't.

**Impact:**
If a user pauses music, navigates away, then returns and taps play, the browser may block autoplay. `isPlaying` becomes `true` but no audio plays — the UI shows playing state (pulsing aura, rotating ring) while the music is silent.

**Solution:**
Wrap `audioRef.current.play()` in `toggleMusic` with `.catch(() => setIsPlaying(false))` to match the pattern used in `handleOpen`.

---

## Issue #4 — Bank Account Numbers Are Still Placeholders

**Root Cause:**
`constants/wedding.ts` contains placeholder account numbers: `1234567890`, `0987654321`, `111222333444`, `777888999000`, `08123456789`, `08987654321`. These were never replaced with real values.

**Impact:**
Guests who try to transfer money will send funds to non-existent accounts or someone else's accounts. This is the most critical content issue — it directly affects the couple's ability to receive gifts.

**Solution:**
Replace all 6 account numbers with the real bank account and e-wallet numbers for Dani and Marini.

---

## Issue #5 — `handleStoryScroll` Fires on Every Scroll Pixel (No Throttle) [FIXED]

**Root Cause:**
`CinematicStory.tsx:18-22` — `handleStoryScroll` is attached to `onScroll` and calls `setActiveSlide` on every scroll event. On mobile, scroll events fire at 60fps during a swipe gesture, causing `Math.round(el.scrollLeft / el.clientWidth)` and `setActiveSlide` to run 60+ times per second.

**Impact:**
On low-end Android phones, this causes unnecessary React re-renders during scroll. While the `setActiveSlide` call is cheap when the value doesn't change (React bails out), the `Math.round` calculation and function call overhead on every pixel of scroll is wasteful.

**Solution:**
Throttle the scroll handler to fire at most once per 100ms, or use a `requestAnimationFrame` wrapper to batch updates.

---

## Issue #6 — `storyStats` Initial Likes Use `Math.random()` (Non-Deterministic) [FIXED]

**Root Cause:**
`CinematicStory.tsx:9-10` — `storyStats` initializes likes with `Math.floor(Math.random() * 50) + 120`. This means each page load shows different like counts (120-170 range), making the page appear inconsistent across visits.

**Impact:**
Guests may notice different like counts each time they visit. The randomness serves no functional purpose — the likes are fake seed data anyway. It also makes testing harder (snapshot tests can't reliably test the exact count).

**Solution:**
Use fixed seed values (e.g., `[142, 167, 128, 155, 139, 163]`) instead of random. This provides realistic-looking numbers while being deterministic.

---

## Issue #7 — No WhatsApp Share Button for the Invitation

**Root Cause:**
There is no WhatsApp share button anywhere in the app. The primary distribution channel for Indonesian wedding invitations is WhatsApp, but guests who receive the link have no easy way to reshare it with family members.

**Impact:**
Reduced invitation reach. In Indonesian culture, family members often forward invitations to extended family. Without a share button, they'd have to manually copy the URL, which many won't do.

**Solution:**
Add a "Bagikan" (Share) button in the footer or floating controller that opens `https://wa.me/?text=` with a pre-filled message containing the invitation URL and guest name.

---

## Issue #8 — Hero and Opening Use Same Image (No Visual Progression)

**Root Cause:**
Both `CinematicOpening.tsx:23` and `HeroSection.tsx:10` render `bride_and_groom_full_body_potrait.jpeg`. When the opening fades out to reveal the hero, the same photo appears — creating a jarring visual stutter rather than a cinematic transition.

**Impact:**
The transition from opening to hero feels like a glitch rather than a reveal. Users may think the page is stuck or loading incorrectly. The emotional impact of the cinematic opening is diminished.

**Solution:**
Use a different image for the hero section (e.g., `bride_and_groom_half_body_potrait.png` or a close-up) to create visual progression from the opening.

---

## Issue #9 — `GuestWishes` Import in `RSVPModal` Is Unused [FIXED]

**Root Cause:**
`RSVPModal.tsx:4` imports `GuestWishes` from `../../types` but never uses it. The modal handles form submission via the `onSubmit` prop — the wish object creation happens in `App.tsx`, not in the modal.

**Impact:**
Dead import. No functional impact, but adds confusion and is flagged by strict linting rules. Increases bundle size marginally.

**Solution:**
Remove the unused `import { GuestWishes } from '../../types'` line from `RSVPModal.tsx`.

---

## Issue #10 — `TwibbonCreator` `useEffect` Missing `drawOverlay` Dependency [WON'T FIX]

**Root Cause:**
`TwibbonCreator.tsx:34-58` — the `useEffect` that sets up the `IntersectionObserver` has an empty dependency array `[]`, but it references `drawOverlay` from the outer scope (imported from utils). While `drawOverlay` is a stable module-level function and won't change, React's rules of hooks recommend including all referenced values.

**Impact:**
No runtime bug since `drawOverlay` is a stable import. However, it violates React's exhaustive-deps rule and would produce a lint warning with `eslint-plugin-react-hooks`.

**Solution:**
Add `drawOverlay` to the dependency array, or add an eslint-disable comment with explanation.

---

## Issue #11 — No Error Boundary Wrapping the App [FIXED]

**Root Cause:**
`main.tsx` renders `<App />` inside `<StrictMode>` but with no `ErrorBoundary` wrapper. If any component throws during rendering (e.g., an image fails to load in a way that causes a JSX error, or a corrupted URL param causes `decodeURIComponent` to throw), the entire app crashes to a white screen.

**Impact:**
On production, any uncaught rendering error results in a blank page for the guest. There's no fallback UI, no error message, and no way for the guest to recover without refreshing.

**Solution:**
Wrap `<App />` with a React Error Boundary that shows a graceful fallback (e.g., the couple names with a "Silakan refresh halaman" message).

---

## Issue #12 — Event Date Hardcoded in Multiple Places [FIXED]

**Root Cause:**
The wedding date "Sabtu, 29 Agustus 2026" is hardcoded as a display string in `EventSection.tsx:16`, `HeroSection.tsx:32`, `CinematicOpening.tsx:33`, and the twibbon overlay text. The `WEDDING_DATE` constant in `constants/wedding.ts` is only used for the countdown timer target, not for display strings.

**Impact:**
If the wedding date changes, a developer must find and update 4+ locations. Missing one creates an inconsistency (e.g., countdown shows the new date but the hero still shows the old one).

**Solution:**
Derive all display date strings from `WEDDING_DATE` using `Intl.DateTimeFormat` with Indonesian locale, or add a `WEDDING_DATE_DISPLAY` constant to `constants/wedding.ts` that all sections reference.

---

## Issue #13 — `sepia` Color Defined But Barely Used [WON'T FIX]

**Root Cause:**
`index.css` defines `--color-sepia: #FAF7F2` in the `@theme` block. Scanning all source files, `bg-sepia` only appears once in `CoupleSection.tsx` (bride frame background) and `sepia/20` once in `PhotoGallery.tsx` (decorative blur). The color is very close to `ivory` (#FDFCF8) — only 4 hex digits different.

**Impact:**
Adds an extra color token that's nearly indistinguishable from `ivory`. Creates decision fatigue — developers must choose between two almost-identical colors. Could be consolidated without visual difference.

**Solution:**
Either remove `sepia` and replace its 2 usages with `ivory`, or document clearly when to use sepia vs ivory in the design system.

---

## Issue #14 — No `<noscript>` Fallback [FIXED]

**Root Cause:**
`index.html` has no `<noscript>` tag. The entire app is React SPA — without JavaScript, the page renders a blank `<div id="root">`.

**Impact:**
While rare for wedding invitation guests, some privacy-focused browsers or corporate firewalls block JavaScript. These users see a completely blank page with no indication of what the page is or how to view it.

**Solution:**
Add `<noscript>` to `index.html` with basic wedding info: couple names, date, venue, and a message asking to enable JavaScript.

---

## Issue #15 — `handleCopy` Fallback Uses Deprecated `document.execCommand` [FIXED]

**Root Cause:**
`App.tsx:86-93` — the clipboard fallback creates a textarea and calls `document.execCommand('copy')`. This API has been deprecated by all major browsers and may be removed in future versions.

**Impact:**
Currently functional, but the fallback path has no future guarantee. If browsers remove `execCommand`, the fallback silently fails while still showing "Tersalin" success feedback.

**Solution:**
While there's no better fallback for in-app browsers, add a secondary check: if both `navigator.clipboard` and `execCommand` fail, show a "Salin gagal" error message instead of "Tersalin".

---

## Issue #16 — No Loading/Skeleton State for Sections Below the Fold [WON'T FIX]

---

## Issue #17 — Blank Page on 3G While JS Bundle Loads [FIXED]

**Root Cause:**
`<div id="root">` in `index.html` was empty. On 3G networks (~400kbps), the JS bundle (403KB) takes ~8-10 seconds to download. During this time users see a completely blank page.

**Impact:**
Guests on slow mobile connections (common in Indonesia) see a white screen for up to 10 seconds with no indication the page is loading. Many will think the link is broken and leave.

**Solution:**
Added pure HTML/CSS loading screen inside `<div id="root">` — shows "Dani & Marini" with pulsing gold accent line and "Memuat undangan" text. Uses CSS @keyframes animation (no JS needed). Automatically replaced when React mounts via `createRoot().render()`.

---

## RESPONSIVE DESIGN ISSUES

---

## Issue #18 — CoupleSection Uses `min-h-screen` Causing Excessive Whitespace on Tall Devices [FIXED]

**Root Cause:**
`CoupleSection.tsx:6` uses `min-h-screen` which forces the section to fill at least 100vh. On tall devices (iPad Pro 1366px, desktop 1080px+), the portrait area is only `h-[400px] md:h-[500px]` and the text info is compact — leaving massive empty space above and below.

**Impact:**
On iPad and desktop, the couple section has huge gaps of empty ivory background above and below the content. On Samsung Fold unfolded (768x1024), it looks especially sparse. Users scroll through empty space thinking content is missing.

**Solution:**
Replace `min-h-screen` with `min-h-[80vh] md:min-h-screen` or remove the min-height entirely and let the content determine the section height naturally with adequate `py-12 md:py-20` padding.

---

## Issue #19 — CinematicStory `pb-48 pt-20` Creates Content Overflow on Short Phones [FIXED]

**Root Cause:**
`CinematicStory.tsx:99` uses `pb-48 pt-20` (192px bottom + 80px top = 272px of fixed padding) on the text content container. The section is `h-screen`. On iPhone 6 (667px) and Samsung Flip cover (512px), 272px of padding plus the dot indicators (bottom-12), interaction buttons (bottom-32), and the text content itself exceeds 100vh.

**Impact:**
On short phones (iPhone 6/SE at 667px, Samsung Flip at 512px), the story text is pushed upward and compressed between the padding and the interaction buttons. The "Ikrar" slide with its long text gets severely cropped. Users can't read the full poem without the text overflowing beyond the visible area.

**Solution:**
Use responsive padding: `pb-32 sm:pb-40 md:pb-48 pt-12 sm:pt-16 md:pt-20` to reduce spacing on smaller screens while maintaining the cinematic feel on larger devices.

---

## Issue #20 — CinematicOpening Names `text-7xl` Too Large on Narrow Devices [FIXED]

**Root Cause:**
`CinematicOpening.tsx:52` uses `text-7xl` (4.5rem/72px) on mobile for "Dani & Marini". On Samsung Fold folded (280px width) and Samsung Flip cover (260px), 72px text for a 15-character string overflows or wraps awkwardly. The Dayland cursive font is also wider per-character than standard fonts.

**Impact:**
On Samsung Fold (folded) and very narrow devices, "Dani & Marini" wraps to 2-3 lines, breaking the elegant single-line presentation. The ampersand may end up alone on a line.

**Solution:**
Add a smaller breakpoint: `text-5xl sm:text-7xl md:text-9xl`. This uses 3rem on very narrow screens (< 640px), which fits 280px comfortably.

---

## Issue #21 — HeroSection Names `text-7xl` Same Issue as Opening [FIXED]

**Root Cause:**
`HeroSection.tsx:21` uses `text-7xl md:text-[8rem]` for the Dani/Marini names. Same issue — `text-7xl` (72px) is too large for devices narrower than 360px.

**Impact:**
On Samsung Fold folded (280px) and very small phones, "Dani" and "Marini" text blocks may overflow the horizontal padding (px-6 = 48px total), causing horizontal scroll or text clipping.

**Solution:**
Change to `text-5xl sm:text-7xl md:text-[8rem]` to add a smaller base size.

---

## Issue #22 — Footer Names `text-5xl` Has No Small-Screen Breakpoint [FIXED]

**Root Cause:**
`Footer.tsx:22` uses `text-5xl md:text-6xl` for "Dani & Marini". `text-5xl` is 3rem (48px) which is acceptable on most phones but tight on Samsung Fold folded (280px) with `px-6` padding.

**Impact:**
On Samsung Fold folded and similarly narrow devices (~280px), "Dani & Marini" at 48px in Dayland font may overflow or wrap inelegantly.

**Solution:**
Change to `text-4xl sm:text-5xl md:text-6xl`.

---

## Issue #23 — EventSection Date `text-3xl` Has No Small-Screen Breakpoint [FIXED]

**Root Cause:**
`EventSection.tsx:16` uses `text-3xl md:text-4xl` for the date string "Sabtu, 29 Agustus 2026". On devices < 360px, `text-3xl` (1.875rem/30px) for a 22-character string in serif italic may wrap awkwardly after "Agustus".

**Impact:**
On iPhone SE (320px) and Samsung Fold (280px), the date wraps mid-word or after "Agustus" with "2026" alone on the next line.

**Solution:**
Change to `text-2xl sm:text-3xl md:text-4xl` matching the pattern used in HeroSection.

---

## Issue #24 — EventSection Akad/Resepsi `gap-10` Too Wide on Narrow Phones [FIXED]

**Root Cause:**
`EventSection.tsx:20` uses `gap-10 md:gap-16` between Akad and Resepsi blocks. `gap-10` is 2.5rem (40px). On a 320px screen with `px-6` (48px total padding), the two columns + gap + vertical divider compete for 272px of width.

**Impact:**
On iPhone SE and narrow phones, "Akad Nikah" and "Resepsi" text gets compressed, and the mono time strings may overflow their containers. The layout feels cramped.

**Solution:**
Change to `gap-6 sm:gap-10 md:gap-16` to give more room on narrow screens.

---

## Issue #25 — TwibbonCreator Frame `w-[82%] max-w-[320px]` Wastes Space on Tablets/Desktop [FIXED]

**Root Cause:**
`TwibbonCreator.tsx:173` constrains the twibbon frame to `w-[82%] max-w-[320px]`. On iPad (768px) and desktop (1440px), the 320px frame looks tiny — a small rectangle in a vast ivory section.

**Impact:**
On tablets and desktop, the twibbon section feels underdeveloped and out of proportion. The 9:16 frame at 320px max is designed for mobile but doesn't scale up for larger viewports.

**Solution:**
Add responsive max-width: `max-w-[320px] md:max-w-[380px] lg:max-w-[420px]` to let the frame breathe on larger screens.

---

## Issue #26 — PhotoGallery Fixed Row Heights Don't Adapt to Very Short/Tall Screens [WON'T FIX]

---

## Issue #27 — CoupleSection Exceeds 100vh on Short/Normal Phones [FIXED]

**Root Cause:**
On mobile single-column, CoupleSection content = portraits `h-[400px]` + `pt-6` (24px) + text ~200px + `gap-8` (32px) + `py-6` (48px) = ~704px. On Samsung Flip (512px) this overflows by 192px. On iPhone 6 (667px) overflows by 37px. The `min-h-screen` class also forces a minimum of 100vh, preventing content from being shorter.

**Impact:**
Users on short and normal phones must scroll within this section to see both portraits and both couple names/parents. The portrait area at fixed `h-[400px]` takes 60-78% of the viewport on short phones, leaving minimal space for the text info.

**Solution:**
1. Remove `min-h-screen` — let content determine height naturally
2. Add `max-h-[100dvh]` to cap section at viewport height
3. Portrait area: replace fixed `h-[400px]` with viewport-relative `h-[40vh] sm:h-[50vh] md:h-[500px]`
4. Reduce `gap-8` to `gap-4` on mobile: `gap-4 md:gap-8`
5. At 667px: 40vh=267px, total ~571px. At 512px: 40vh=205px, total ~509px. Both fit.

---

## Issue #28 — TwibbonSection Exceeds 100vh on All Phones Under 812px [FIXED]

**Root Cause:**
TwibbonCreator frame at `aspect-[9/16]` with `max-w-[320px]` produces a ~546px tall frame (on 375px screen). Plus header (~50px), mb-6 (24px), button area (~80px), py-4 (32px), section py-6 (48px) = ~792px total. On iPhone 6 this overflows by 125px. On Samsung Flip by 280px.

**Impact:**
On Samsung Flip (512px) the twibbon frame alone exceeds the viewport. On iPhone 6 (667px) the complete section overflows by 125px. Users must scroll within the section to reach the download button.

**Solution:**
1. Add `max-h-[100dvh]` to section
2. Frame: add `max-h-[50vh]` to limit frame height on short screens — width auto-adjusts from aspect ratio
3. Reduce mb-6 to mb-3, mt-8 to mt-4 on mobile
4. At 667px: 50vh=334px frame, total ~568px. At 512px: 50vh=256px frame, total ~470px. Both fit.

---

## Issue #29 — DigitalEnvelope Exceeds 100vh on Mobile (6 Cards in Single Column) [FIXED]

**Root Cause:**
On mobile `grid-cols-1`, 6 bank cards × ~100px each + gaps (12px × 5) + header with description (~138px) + section py-6 (48px) + mb-10 (40px) = ~886px total. Overflows on ALL phones: Samsung Flip +374px, iPhone 6 +219px, iPhone 12 Mini +74px.

**Impact:**
On all phones under 900px, the envelope section overflows the viewport. Users scroll through a long vertical list of 6 cards which feels like a different page entirely.

**Solution:**
1. Switch to `grid-cols-2` on all screen sizes (remove `grid-cols-1` base). 3 rows × ~100px + gaps = ~324px for cards.
2. Reduce `mb-10` to `mb-4` on the header div.
3. Total: 48 + 98 + 324 + 16 = ~486px. Fits all viewports including Samsung Flip.

---

## Issue #30 — RSVPSection Exceeds 100vh on All Phones (Pagination Height Not Viewport-Aware) [FIXED]

**Root Cause:**
`App.tsx:34` sets `availableHeight = 630` for wish pagination, meaning the wishes grid can be up to 630px tall. Plus header (~50px) + mb-10 (40px) + pagination (~50px + mt-6 + py-6 = 98px) + section py-6 (48px) = ~866px total. This overflows on Samsung Flip by 354px, iPhone 6 by 199px, and even iPhone 12 Mini by 54px.

**Impact:**
On virtually all mobile devices, the RSVP section exceeds 100vh. The paginated wishes area alone (630px) is nearly the entire viewport height on most phones, leaving no room for the header and pagination controls.

**Solution:**
1. Reduce `availableHeight` from 630 to 400 in `App.tsx` — this still shows 5-6 wishes per page
2. Reduce `mb-10` to `mb-4` on header
3. Reduce pagination `py-6 mt-6` to `py-3 mt-3`
4. Add `max-h-[100dvh]` to section
5. New total: 48 + 74 + 400 + 68 = ~590px. Fits all viewports except Samsung Flip (needs overflow-y-auto fallback).

---

## Issue #31 — PhotoGallery Exceeds 100vh on Short Phones [FIXED]

**Root Cause:**
`PhotoGallery.tsx:27` uses fixed `grid-rows-[200px_200px]` (400px for 2 rows) + gap-4 (16px) + header ~20px + mb-10 (40px) + closing text ~40px + mt-10 (40px) + py-6 (48px) + pb-4 (16px) = ~620px. On Samsung Flip (512px) this overflows by 108px.

**Impact:**
On Samsung Flip and very short phones, the gallery grid extends below the viewport. The closing quote text is completely hidden without scrolling.

**Solution:**
1. Reduce row heights on small screens: `grid-rows-[150px_150px] sm:grid-rows-[200px_200px] md:grid-rows-[280px_280px]`
2. Reduce `mb-10` to `mb-4` and `mt-10` to `mt-4` on mobile: `mb-4 md:mb-10` and `mt-4 md:mt-10`
3. New total: 48 + 36 + 316 + 56 = ~456px. Fits all viewports.

---

## Issue #32 — Footer Exceeds 100vh on Short Phones (Two Stacked Person Cards) [FIXED]

**Root Cause:**
Footer has two person cards (Dani/Marini) in `grid-cols-1 md:grid-cols-2`. Each card is ~200px tall (icon 48px + name + description + social links + padding). Two stacked cards = ~412px + header (~80px + mb-5) + copyright (~30px + pt-1 + mb-8) + py-6 (48px) = ~638px. On Samsung Flip (512px) this overflows by 126px.

**Impact:**
On Samsung Flip, the footer content extends beyond the viewport. The copyright section is hidden without scrolling.

**Solution:**
1. Use `grid-cols-2` on all screen sizes for person cards: `grid-cols-2` instead of `grid-cols-1 md:grid-cols-2`
2. Make card content more compact on mobile: reduce icon size, reduce description text size
3. Reduce `mb-5` to `mb-3`, `mb-8` to `mb-4`
4. Two side-by-side cards: ~200px height + 48 + 83 + 46 = ~377px. Fits all viewports.

---

## Issue #33 — HeroSection Uses `min-h-[100vh]` Which Exceeds Visible Area on Mobile [FIXED]

**Root Cause:**
`HeroSection.tsx:8` uses `min-h-[100vh]` which on mobile browsers includes the URL bar area (~50-80px). The actual visible viewport is shorter than `100vh` — on iPhone 6 visible area is ~585px vs 667px `100vh`. The bottom content (date + "Surabaya . Indonesia") gets pushed below the visible fold. Fixed padding `pb-6 pt-6` doesn't scale with viewport height.

**Impact:**
On all mobile devices with browser chrome, the hero's bottom content (wedding date and location) is partially or fully hidden below the visible area. Users must scroll down slightly to see the date, breaking the "full-screen hero" illusion. The fixed `pb-6` (24px) is too small relative to the viewport on tall devices and adequate on short devices, but the `100vh` issue supersedes this.

**Solution:**
1. Replace `min-h-[100vh]` with `h-[100dvh]` — `dvh` (dynamic viewport height) accounts for browser chrome, ensuring the section fills exactly the visible area
2. Use viewport-relative padding: `pt-[3vh] md:pt-6` and `pb-[3vh] md:pb-6` for proportional spacing
3. Reduce `space-y-6` to `space-y-4 md:space-y-6` on bottom content for tighter mobile layout

---

## Issue #34 — CinematicOpening Flickers/Glitches Black Overlay on Desktop [FIXED]

**Root Cause:**
Three issues combine to produce a flickering black overlay effect on desktop that is barely visible on mobile:

1. **Grain texture above opening:** `BackgroundLayers.tsx` renders a grain texture at `z-[9999]`, but CinematicOpening is at `z-[1000]`. The grain sits ON TOP of the opening. The `animate-grain` CSS animation uses `steps(10)` (discrete jumps), creating visible flickering over the dark opening background. On desktop's larger pixel area, this is much more noticeable.

2. **Competing scale animations:** `CinematicOpening.tsx` applies both Motion `scale: [1, 1.05, 1]` on the container AND CSS `animate-soft-zoom` (scale 1→1.08→1) on the image. Two scale animations fighting each other cause GPU compositing stutter on desktop.

3. **4-second opacity fade reveals black background:** The background container animates `opacity` from 1 to 0.4 over 4 seconds. The parent `bg-ink` (#1A1A1A) bleeds through increasingly during this transition, creating a "black flash" effect.

**Impact:**
On desktop, the opening screen appears to have a flickering/glitchy black overlay. The combination of grain texture stepping, competing animations, and opacity fade creates an unprofessional stutter effect that undermines the cinematic feel.

**Solution:**
1. Lower grain `z-[9999]` to `z-[999]` — below the opening's `z-[1000]`, so grain only affects main content sections
2. Remove `animate-soft-zoom` CSS class from opening image — Motion's `scale` animation is sufficient
3. Set `initial={{ opacity: 0.4 }}` instead of animating opacity — eliminates the 4-second black bleed-through

---

## Issue #35 — HeroSection Flickers/Glitches Black Overlay on Desktop [FIXED]

**Root Cause:**
Three issues combine to create a flickering/stutter effect on the hero section on desktop:

1. **Grain texture at z-999 overlays the hero:** After Issue #34's fix lowered grain from z-9999 to z-999, it's still above `main` (z-10). The `steps(10)` CSS animation creates discrete position jumps that are visible as flicker on desktop's large pixel area over the hero's dark image.

2. **Scale animation on parent recomposites all heavy children:** `HeroSection.tsx:10` wraps the image, gradient, LightGlow (`blur-[180px]` + `mix-blend-soft-light`), 8 FloatingPetals, and 2 ForegroundOrnaments inside a single `motion.div` with `scale: [1, 1.03, 1]`. Every scale frame triggers a full GPU recomposite of all these layers. On desktop (1920×1080+) this causes frame drops.

3. **Opening exit creates 2-second dark flash:** When user clicks "Buka Undangan", `isOpen` becomes true — the hero mounts instantly while the opening plays a 2-second exit animation (`opacity: 0, blur: 30px`) with `bg-ink` bleeding through. The hero image pops in abruptly, contrasting with the dark exit.

**Impact:**
Desktop users see a dark flash during the opening→hero transition, followed by subtle grain flicker and occasional stutter from the heavy compositing load.

**Solution:**
1. Move LightGlow, FloatingPetals, ForegroundOrnaments outside the scale container — they become siblings, so the lightweight image-only scale no longer triggers recomposite of blur/blend elements. Added `transform-gpu` for proper GPU layer promotion.
2. Lower grain z-index from `z-[999]` to `z-[15]` and change grain animation from `0.8s steps(10)` to `4s linear` — eliminates visible discrete jumps while keeping the subtle texture effect.
3. Hero background container uses a plain `<div>` (no fade-in) — the image is fully visible from mount, hidden behind the opening at z-1000. The opening's fade-out creates a natural dark-to-image crossfade. Ambient components (LightGlow, FloatingPetals, ForegroundOrnaments) are delayed by 2 seconds to avoid GPU overload during transition.

---

## Issue #36 ��� Hero Black Overlay Persists During Opening→Hero Transition on Desktop [FIXED]

**Root Cause:**
Two remaining issues after Issue #35 fixes:

1. **`filter: blur(30px)` in opening exit animation:** The CinematicOpening root has `bg-ink` (#1A1A1A, near-black). During the 2-second exit, `filter: blur(30px)` causes the dark background to **diffuse/spread outward** through the blur filter. Combined with fading opacity, this creates a murky dark haze overlaying the entire viewport. On desktop with 4x the pixel area of mobile, this dark haze is very prominent — appearing as a "black overlay" over the hero.

2. **50+ concurrent animations during transition overload desktop GPU:** When the user clicks "Buka Undangan", `isOpen` is set to true immediately. The hero mounts with all its ambient components (LightGlow with blur-180px + mix-blend, 8 FloatingPetals with 5 properties each, 2 ForegroundOrnaments with blur-60px/80px) while the opening is still playing its exit. The GPU must composite 50+ animations simultaneously across a large viewport, causing frame drops that appear as flicker.

**Impact:**
Desktop users see a dark haze/overlay during the 2-second opening→hero transition, plus stuttery frame drops from GPU overload during the transition period.

**Solution:**
1. Remove `filter: 'blur(30px)'` from CinematicOpening exit animation — keep only `opacity: 0, scale: 1.05` for a clean fade-out that doesn't spread the dark `bg-ink` background across the viewport.
2. Delay hero ambient components (LightGlow, FloatingPetals, ForegroundOrnaments) by 2 seconds — they fade in with `initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}` after the opening exit completes, reducing simultaneous GPU work from 50+ animations to ~5 during the transition.

---

## Issue #37 — Hero Desktop Flicker Persists Due to Excessive GPU Load (58 Animation Tracks + 5 Blurs + 2 Blend Modes) [FIXED]

**Root Cause:**
A full GPU audit revealed the hero section and BackgroundLayers run **58 concurrent animation tracks, 5 animated blur filters, and 2 blend modes** simultaneously on desktop. The most expensive operations:

| Element | Cost | Detail |
|---|---|---|
| LightGlow | blur-180px + mix-blend-soft-light + 5 animated props | Heaviest single element |
| BackgroundLayers shadow drift | 2 × blur-80px/100px + mix-blend-multiply + animated | 2nd heaviest |
| ForegroundOrnaments | 2 × blur-60px/80px + animated y/rotate | 3rd heaviest |
| FloatingPetals | 8 × 5 animated props = 40 tracks | Most animation tracks |

On desktop at 1920×1080 (4× mobile pixel count), the GPU cannot composite all these layers without frame drops. The drops appear as visible flicker/stutter.

Mobile is smooth because it has ~4× fewer pixels and simpler compositing requirements for the same effects.

**Impact:**
Persistent flicker/stutter on hero section on desktop despite previous fixes (#34, #35, #36). The root cause was not a specific animation conflict but rather the cumulative GPU cost of all effects running simultaneously.

**Solution:**
1. **Remove LightGlow, FloatingPetals, ForegroundOrnaments from HeroSection** — These effects shine on the dark CinematicOpening background but are barely visible on the bright hero image. The gradient overlay (`bg-gradient-to-b from-transparent via-ivory/20 to-ivory`) provides sufficient visual depth.
2. **Remove shadow drift layer from BackgroundLayers** — Eliminated 2 large animated blur elements (blur-80px + blur-100px) with `mix-blend-multiply`. Kept the grain texture and light sweep which are lightweight.
3. **CinematicOpening retains all effects** — LightGlow, FloatingPetals, ForegroundOrnaments remain in the opening where they have maximum visual impact on the dark cinematic background with no transition GPU contention.

Result: Hero GPU load reduced from **58 tracks + 5 blurs + 2 blends** to **3 tracks + 0 blurs + 0 blends**.

---

## Issue #38 — Opening and Hero Photo Position Mismatch Causes Visual Jump on Transition [FIXED]

**Root Cause:**
Both CinematicOpening and HeroSection use the same image (`bride_and_groom_full_body_potrait.jpeg`) but with different `object-position` values:

| Property | CinematicOpening | HeroSection |
|---|---|---|
| object-position | `center` (default) | `object-top` |

On desktop (wide viewport), `object-cover` crops the image vertically. With `center`, the crop is even top/bottom. With `object-top`, the image anchors to the top edge. When the opening fades out to reveal the hero, the same photo **visibly jumps position** from center-anchored to top-anchored.

On mobile (tall viewport), minimal cropping occurs so the difference is barely noticeable.

**Impact:**
On desktop, the opening→hero transition shows the photo shifting downward as it switches from center to top positioning, breaking the seamless cinematic reveal.

**Solution:**
Remove `object-top` from HeroSection so both use the default `object-cover` (center positioning). Center keeps the subjects visible across all viewport ratios — desktop (wide crop) and mobile (tall crop) — without cutting the top or bottom awkwardly. Both now use identical `object-cover` with no `object-position` override, ensuring a seamless transition.

---

## Issue #39 — Inconsistent Section Padding, Height Constraints, Gaps, and Redundant Wrappers [FIXED]

**Root Cause:**
Four systemic inconsistencies across all sections:

1. **Padding:** Sections used a mix of `py-4`, `py-6`, `py-4 md:py-6`, `py-4 md:py-20`, `pt-[3vh] pb-[3vh]` — no uniform pattern. Different sections had different padding on the same device.
2. **Height:** Some used `max-h-[100dvh]` (capped but could be shorter), some `h-[100dvh]` (exact), some `h-screen` (100vh, doesn't account for mobile browser chrome). No consistency.
3. **Gaps:** Internal margins used a mix of `mb-4`, `mb-6`, `mb-8`, `mb-10`, `mb-3 md:mb-5`, `mb-4 md:mb-10` — no proportional system. Gaps didn't scale with viewport.
4. **Redundant wrappers:** TwibbonSection had an unnecessary inner `<div>` just wrapping `<TwibbonCreator />`. TwibbonCreator had its own `py-2 md:py-4` duplicating the section padding. CoupleSection grid had `pt-4 md:pt-6` redundant with section padding. HeroSection had separate `pt-[3vh]` redundant with section padding.

**Impact:**
Sections looked inconsistent across viewports — some had tight padding on mobile and loose on desktop, others the opposite. The visual rhythm between sections was uneven. On large monitors, the mismatch was most noticeable.

**Solution:**

1. **Uniform padding `py-[5vh]`** on all sections (except CinematicOpening overlay and CinematicStory full-bleed). This scales proportionally: ~33px on 667px phone, ~50px on 1024px tablet, ~54px on 1080p desktop.

2. **Exact `h-[100dvh]`** on all sections. Every section is exactly one viewport height using `dvh` (accounts for mobile browser chrome). No more `max-h` or `h-screen`.

3. **Standardized gap system using vh units:**
   - Header to content: `mb-[3vh]`
   - Between content blocks: `mb-[2vh]`
   - Between small elements: `mb-[1vh]`
   - Grid gaps: `gap-[2vh]` / `gap-[1vh]`
   All gaps now scale proportionally with viewport height.

4. **Removed redundant wrappers:**
   - TwibbonSection: removed inner `<div>` wrapper, moved `flex flex-col items-center` to section
   - TwibbonCreator: removed `py-2 md:py-4` (section handles padding)
   - CoupleSection: merged container + grid into single div (removed one nesting level), removed redundant `pt-4 md:pt-6`
   - HeroSection: removed `pt-[3vh]` from inner div (section handles padding)

---

## Issue #40 — CoupleSection Redundant Container Wrapper + Small Photos + Tight Gaps on Mobile [FIXED]

**Root Cause:**
Four issues in CoupleSection mobile layout:

1. **Redundant nesting:** `container` div and `grid` div served overlapping purposes — container provided centering/padding/max-width, grid provided columns. They could be merged into one element.
2. **Photo area too small:** `h-[40vh]` made portraits tiny on mobile — at 667px viewport, 40vh = 267px, with each overlapping photo at 65% = ~174px. Too small to see faces clearly.
3. **Grid gap too tight:** `gap-[2vh]` between photos and text was only ~13px on mobile — no breathing room.
4. **Text gap too tight:** `gap-[1vh]` between couple info blocks was only ~7px — names almost touching.

**Impact:**
On mobile, the couple section looked cramped with tiny portraits and text jammed against photos. The redundant wrapper added unnecessary DOM depth.

**Solution:**
1. Merged `container` and `grid` into single `<div className="container mx-auto px-6 max-w-5xl grid md:grid-cols-2 gap-[3vh] items-center relative">` — one less nesting level.
2. Photo area increased from `h-[40vh]` to `h-[50vh]` — at 667px: 50vh = 334px, each photo ~217px. Much more visible.
3. Grid gap increased from `gap-[2vh]` to `gap-[3vh]` — ~20px on mobile, better separation.
4. Text gap increased from `gap-[1vh]` to `gap-[1.5vh]` — ~10px on mobile, comfortable spacing.

---

## Issue #41 — CoupleSection Empty Space Above Photos and Below Text on Mobile [FIXED]

**Root Cause:**
The section used `flex items-center` to vertically center the grid content. With fixed `h-[50vh]` photos + text (~78vh total content) inside 90vh available space (100dvh - 2×5vh padding), ~12vh of dead space was distributed equally above and below by `items-center` — creating visible empty gaps on both ends.

On taller viewports the gap was even worse: desktop 1080px had ~200px of wasted space.

**Impact:**
Visible empty gaps above the photo area and below the couple text, making the layout feel loose and unfinished, especially on taller devices.

**Solution:**
1. Removed `flex items-center` from section — no more equal-distribution of empty space
2. Grid container now has `h-full` — fills entire available height within the section padding
3. On mobile: `grid-rows-[1fr_auto]` — photos take ALL remaining space (`1fr`), text takes only its natural height (`auto`). No empty gaps.
4. On desktop: `md:grid-rows-none md:grid-cols-2` — existing 2-column layout preserved
5. Photo area: replaced fixed `h-[50vh]` with `h-full min-h-0` — dynamically fills whatever space the text doesn't need

---

## Issue #42 — EventSection Redundant Wrapper + Empty Space Below Buttons on Mobile [FIXED]

**Root Cause:**
Two issues:

1. **Redundant nesting:** The `container` div and inner `flex flex-col` div served overlapping purposes. Container provided centering/max-width/padding, flex-col provided vertical layout. Could be merged into one element.
2. **Empty space below buttons:** Content (~450px) inside `h-[100dvh]` section left ~120px of dead space below the "Lihat Peta" / "Ke Kalender" buttons on mobile. The `flex-col` didn't fill the section height and content wasn't vertically centered.

**Impact:**
Visible empty gap below the action buttons on mobile, making the section look bottom-heavy. Unnecessary DOM nesting.

**Solution:**
1. Merged `container` and `flex flex-col` into single `<div className="container mx-auto px-6 max-w-lg relative z-10 h-full flex flex-col items-center text-center justify-center">` — one less nesting level.
2. Added `h-full` so the container fills the section, and `justify-center` to vertically center all content — eliminating the bottom gap.

---

## Issue #43 — EventSection Empty Space Above Countdown and Below Buttons [FIXED]

**Root Cause:**
Content (~350px) was centered via `justify-center` inside ~600px available space on mobile, leaving ~125px gaps above and below. The manual `mb-[3vh]`/`mb-[2vh]` margins between blocks created fixed spacing while the remaining space sat unused at both ends.

**Impact:**
Visible empty gaps above "Menuju Hari Bahagia" and below "Lihat Peta"/"Ke Kalender" buttons, making the section feel sparse on mobile.

**Solution:**
1. Changed `justify-center` to `justify-evenly` — content blocks are now distributed proportionally across the full available height, filling the section edge-to-edge.
2. Removed all manual `mb-[3vh]`/`mb-[2vh]` margins from content blocks — `justify-evenly` handles all spacing automatically, adapting to any viewport height.

---

## Issue #44 — EventSection Redesign: Akad/Resepsi Cards + bg-paper + Compact Mobile Layout [FIXED]

**Root Cause:**
The EventSection had Akad Nikah and Resepsi side-by-side in a thin horizontal row (~80px), leaving excessive empty space on mobile. The `bg-ivory` background blended with adjacent sections, lacking visual distinction.

**Impact:**
The section felt sparse on mobile with most of the 100dvh viewport being empty space around compact content. Akad/Resepsi info was small and easy to miss.

**Solution:**
1. **Background:** Changed `bg-ivory` to `bg-paper` for visual distinction from adjacent sections.
2. **Akad/Resepsi as styled cards:** Each event is now a `bg-white/40 border border-gold/10 rounded-2xl` card with `py-4 px-6`. On mobile: stacked vertically (`flex-col`) filling ~200px. On desktop: side by side (`md:flex-row`) with vertical divider (`hidden md:block w-px h-8`).
3. **Grouped countdown + date:** Countdown timer and date are now in a single header block, reducing the number of evenly-distributed items for better proportions.
4. **Kept `justify-evenly`:** 4 content blocks (header, cards, venue, buttons) now distribute evenly — the taller card stack fills the middle space naturally.
