# Deep Scan — Issues Round 3 (Hardening)

> Third pass focused on hardening performance, polishing remaining gaps.
> Priority: Mobile-first, must not break desktop.

---

## PERFORMANCE

---

### Issue #30 — Unused CSS Utilities Increasing Stylesheet Size [FIXED]

**Problem:**
Multiple custom CSS utilities defined in `index.css` are never used in any component.

**Root Cause:**
The following classes are defined in `index.css` but never appear in `App.tsx`:
- `.mask-arch` (line 20)
- `.mask-organic` (line 26)
- `.text-shadow-sm` (line 32)
- `.text-glow-gold` (line 36)
- `.bg-noise` (line 40)
- `.text-title-layered` (line 44)
- `.perspective-1000` (line 105)
- `.backface-hidden` (line 109)
- `.vertical-rl` (line 113)
- `.animate-slow-pan` (line 88)

**Impact:**
10 unused CSS rules (including SVG data URIs) adding dead weight to the stylesheet. The `.mask-arch` and `.mask-organic` utilities contain large inline SVG data URIs that inflate the CSS size. On mobile, every byte matters for first paint.

**Solution:**
Remove all 10 unused CSS utilities and their associated keyframes (`slow-pan`) from `index.css`.

---

### Issue #31 — Unused Font Families Loaded (Inter, Great Vibes, Pinyon Script) [FIXED]

**Problem:**
Three font families are loaded from Google Fonts CDN but never used in the app.

**Root Cause:**
The Google Fonts URL in `index.html` loads `Inter`, `Great Vibes`, and `Pinyon Script`. However:
- `Inter` is not referenced anywhere — neither in `@theme` nor in any class.
- `Great Vibes` is defined as `--font-cursive` in `@theme` but `font-cursive` never appears in `App.tsx`.
- `Pinyon Script` is defined as `--font-signature` in `@theme` but `font-signature` never appears in `App.tsx`.

**Impact:**
Three extra font families = ~150-300KB of wasted font downloads on mobile. Google Fonts serves multiple weight/style variants for each. This directly slows down first meaningful paint.

**Solution:**
Remove `Inter`, `Great Vibes`, and `Pinyon Script` from the Google Fonts URL. Also remove `--font-cursive` and `--font-signature` from `@theme` in `index.css`.

---

### Issue #32 — PetalEffect Renders on All 6 Story Slides (Not Gated by activeSlide) [FIXED]

**Problem:**
While `AmbientSocialLayer` was gated to the active slide (Issue #14 fix), `PetalEffect` still renders on all 6 story slides simultaneously.

**Root Cause:**
`App.tsx:993` renders `<PetalEffect />` unconditionally inside each slide's `map()`. Each instance creates 15 Motion-animated elements with infinite transitions, totaling 90 animated DOM nodes across all slides.

**Impact:**
On mobile, 90 continuously animated elements on off-screen slides waste GPU and CPU cycles. Less severe than AmbientSocialLayer (no intervals), but still unnecessary work for slides the user isn't viewing.

**Solution:**
Gate `PetalEffect` with the same `idx === activeSlide` condition already used for `AmbientSocialLayer`.

---

### Issue #33 — Duplicate Ambient Components in Opening and Hero [WON'T FIX]

**Problem:**
`LightGlow`, `FloatingPetals`, and `ForegroundOrnaments` are rendered in both the Cinematic Opening and the Hero section simultaneously during the opening-to-content transition.

**Root Cause:**
- Opening (`App.tsx:1297-1299`): renders `LightGlow`, `FloatingPetals`, `ForegroundOrnaments`
- Hero (`App.tsx:1533-1535`): renders `LightGlow`, `FloatingPetals`, `ForegroundOrnaments`

During `AnimatePresence` exit (the 2-second blur transition from opening to main content), both sets are mounted and animating.

**Impact:**
During the transition moment, 2x `LightGlow` (2 large blur elements), 2x `FloatingPetals` (16 animated divs), and 2x `ForegroundOrnaments` (4 blurred elements) run simultaneously. This is the most animation-heavy moment on mobile — right when first impressions matter.

**Solution:**
Since the hero is the first thing visible after opening, and the opening fades out with blur, the hero's ambient components don't need to render during the opening phase. Delay mounting of hero ambient components until the opening exit animation completes, or accept the brief overlap since it's only ~2 seconds.

---

### Issue #34 — `@google/genai` Package Installed But Unused [FIXED]

**Problem:**
The `@google/genai` package (Gemini AI SDK) is in `dependencies` but never imported or used.

**Root Cause:**
`package.json` includes `"@google/genai": "^1.29.0"` — inherited from the Google AI Studio export. No import or reference exists in any source file.

**Impact:**
Increases `node_modules` size and `npm install` time. While not included in the production bundle (since it's never imported), it adds noise to the dependency list and may confuse future contributors. The `dotenv` package is also in dependencies for the same reason — only used by the Vite config for GEMINI_API_KEY which is unused.

**Solution:**
Remove `@google/genai` and `dotenv` from `package.json` dependencies. Remove the `GEMINI_API_KEY` define from `vite.config.ts`.

---

## FUNCTIONALITY

---

### Issue #35 — "Lihat Peta" Link Missing `rel="noopener noreferrer"` [FIXED]

**Problem:**
The Google Maps link opens in a new tab via `target="_blank"` but lacks `rel="noopener noreferrer"`.

**Root Cause:**
`App.tsx:1781` has `target="_blank"` on the `<motion.a>` tag but no `rel` attribute. The footer social links were fixed with `rel="noopener noreferrer"` in Issue #20, but this link was missed.

**Impact:**
Without `rel="noopener noreferrer"`, the opened page has access to `window.opener`, which is a minor security risk. Modern browsers mitigate this by default for `target="_blank"`, but it's still best practice to include it explicitly.

**Solution:**
Add `rel="noopener noreferrer"` to the "Lihat Peta" `<motion.a>` tag.

---

### Issue #36 — `navigator.clipboard.writeText` Has No Fallback [FIXED]

**Problem:**
The copy-to-clipboard function for bank account numbers will silently fail on some mobile browsers.

**Root Cause:**
`App.tsx:1231` calls `navigator.clipboard.writeText(text)` without a try-catch or fallback. The Clipboard API requires a secure context (HTTPS) and may not be available in all mobile browsers or in-app browsers (like Instagram's built-in browser).

**Impact:**
When a guest opens the invitation from WhatsApp or Instagram's in-app browser and tries to copy a bank account number, nothing happens — no error message, no feedback. The "Tersalin" success state still shows (since `setCopiedIndex` runs regardless), misleading the user into thinking it was copied.

**Solution:**
Wrap in try-catch with a fallback using the legacy `document.execCommand('copy')` pattern, or at minimum show a different message if the copy fails.

---

### Issue #37 — Twibbon Text Says "attendance the wedding of" in English [FIXED]

**Problem:**
The twibbon canvas overlay text is in English while all other UI text is in Indonesian.

**Root Cause:**
`App.tsx:475` draws `"attendance the wedding of"` on the twibbon canvas. This was likely from the original AI Studio export and not translated.

**Impact:**
Users who download the twibbon get a mixed-language image — the phrase "attendance the wedding of" above "Dani & Marini". This looks unprofessional and inconsistent with the Indonesian design.

**Solution:**
Replace with Indonesian text, e.g. `"menghadiri pernikahan"` or `"turut merayakan pernikahan"`.

---

## SEO

---

### Issue #38 — No Favicon [FIXED]

**Problem:**
The browser tab shows a generic favicon (or none) instead of a wedding-themed icon.

**Root Cause:**
`index.html` has no `<link rel="icon">` tag. No favicon files exist in `/public`.

**Impact:**
On mobile, when users save the page to their home screen or see it in their browser tabs, there's no identifiable icon. On desktop, the tab shows a blank or default browser icon. Hurts brand recognition when guests have multiple tabs open.

**Solution:**
Add a favicon — either a simple gold heart SVG inline favicon, or a custom icon. Add `<link rel="icon">` to `index.html`.

---

## RESPONSIVE DESIGN

---

### Issue #39 — Gallery Section Has No Scroll Indicator on Mobile [FIXED]

**Problem:**
The photo gallery is a horizontally scrollable grid but has no visual cue that more content exists off-screen to the right.

**Root Cause:**
`App.tsx:2154` creates an `overflow-x-auto` container with no scroll hint, fade edge, or indicator. The gallery grid extends far beyond the viewport width but looks like it might just be what's visible.

**Impact:**
On mobile, guests may only see the first 2-3 photos and not realize they can scroll right to see the full gallery of 12 images. This is a significant content discovery problem.

**Solution:**
Add a fade-out gradient on the right edge of the gallery container to hint at more content, or add a subtle scroll indicator similar to the story section swipe hint.

---

### Issue #40 — Opening Screen Guest Name Can Overflow on Long Names [FIXED]

**Problem:**
Very long guest names from the `?to=` parameter can overflow or look cramped on the opening screen.

**Root Cause:**
`App.tsx:1381-1383` renders the guest name in `font-display italic text-3xl md:text-4xl` with no text wrapping control or max-width constraint. For names like "Bapak & Ibu H. Muhammad Abdurrahman Wahid & Keluarga", this will overflow or wrap awkwardly on narrow phones.

**Impact:**
The cinematic opening is the first impression. An overflowing or poorly wrapped guest name breaks the elegant design. This is especially common in Indonesian culture where formal invitation names can be very long.

**Solution:**
Add `max-w-[90vw]` or `break-words` to constrain the name container, and consider reducing font size dynamically for names beyond a certain length (e.g., `text-2xl` for names > 30 characters).

---

### Issue #41 — Twibbon Section Click Target Too Small on Mobile [WON'T FIX]

**Problem:**
To upload a photo in the twibbon, users must click specifically inside the arch-shaped area. On mobile, this hit target is small and hard to tap precisely.

**Root Cause:**
`App.tsx:604-621` — `handleCanvasClick` calculates whether the tap landed inside the arch boundaries using canvas coordinate math. The arch opening is significantly smaller than the full frame container, and the math requires tapping within `FRAME_MARGIN + 40` inset on all sides.

**Impact:**
On mobile, users tap the twibbon frame expecting the file picker to open, but if they tap on the floral border area (outside the arch), nothing happens. There's no visual feedback that they missed the target, and no alternative upload button.

**Solution:**
Either expand the click target to the entire frame container when no image is loaded (remove the arch boundary check), or add an explicit "Upload Foto" button below the frame as a fallback tap target.

---

## ACCESSIBILITY

---

### Issue #42 — Form Inputs Missing `id` and `for` Label Association [FIXED]

**Problem:**
The RSVP form labels are not programmatically associated with their inputs.

**Root Cause:**
`App.tsx:1990-2021` — The form uses `<label>` elements above each input, but they use no `htmlFor` attribute and the inputs have no `id`. The labels are visual-only, not semantically linked.

**Impact:**
Screen reader users cannot jump from label to input. Tapping a label on mobile doesn't focus the associated input (which is the default browser behavior when labels are properly associated). This makes the form harder to use on mobile where tap targets matter.

**Solution:**
Add matching `id` to inputs and `htmlFor` to labels. Example: `<label htmlFor="rsvp-name">` + `<input id="rsvp-name">`.
