# Deep Scan — Issues Round 4 (Final Hardening)

> Fourth pass focused on final cleanup, remaining polish, and production readiness.
> Priority: Mobile-first, must not break desktop.

---

## PERFORMANCE

---

### Issue #43 — `autoprefixer` Unused Dev Dependency [FIXED]

**Problem:**
`autoprefixer` is in `devDependencies` but never referenced in any config file.

**Root Cause:**
`package.json:23` includes `"autoprefixer": "^10.4.21"`. Tailwind CSS v4 with the `@tailwindcss/vite` plugin handles vendor prefixing internally — there's no PostCSS config file and no reference to autoprefixer anywhere.

**Impact:**
Adds unnecessary package to `node_modules` and slows `npm install`. No production impact since it's a devDependency, but it's dead weight.

**Solution:**
Remove `autoprefixer` from `devDependencies` in `package.json`.

---

### Issue #44 — Twibbon Canvas Draws on Mount Even When Section Not Visible [FIXED]

**Problem:**
The `TwibbonCreator` component draws a complex floral overlay canvas (100+ flowers, 65 gold dust particles, typography) immediately when the main content mounts — even though the twibbon section is far below the fold.

**Root Cause:**
`App.tsx:519-528` — the `useEffect` that calls `drawOverlay` runs on mount with no visibility check. The `drawOverlay` function performs hundreds of canvas operations (loops of 100 flowers x 3 clusters, 5 accent positions x 6 flowers, 40 petals, 65 dust particles).

**Impact:**
On mobile, this heavy canvas computation runs during the initial content mount (right after the opening transition), competing with hero section rendering and music playback start. Users don't see the twibbon section until they scroll significantly — the work is wasted at load time.

**Solution:**
Defer the canvas draw until the twibbon section is in or near the viewport. Use an IntersectionObserver or the existing `whileInView` pattern to trigger `drawOverlay` only when the section becomes visible.

---

### Issue #45 — `wishPages` Pagination Recalculates on Every Render [FIXED]

**Problem:**
The wish pagination logic runs as an IIFE on every render of the `App` component, even when wishes haven't changed.

**Root Cause:**
`App.tsx:1175-1202` — `wishPages` is computed via an immediately-invoked function expression `(() => { ... })()` inside the component body. Any state change in `App` (opening tools menu, toggling music, changing page, etc.) triggers a re-render, which re-runs the entire pagination calculation including the `forEach` loop over all 20 wishes.

**Impact:**
Minor on current data size (20 wishes), but the calculation involves math per wish (line count estimation, height accumulation, page splitting). If wishes grow (e.g., after connecting a backend), this becomes wasteful. More importantly, it's an easy optimization.

**Solution:**
Wrap with `useMemo(() => { ... }, [wishes])` so it only recalculates when the wishes array actually changes.

---

## FUNCTIONALITY

---

### Issue #46 — Music Placeholder Still Uses SoundHelix External URL [FIXED]

**Problem:**
The background music still loads from an external placeholder URL that has nothing to do with the wedding.

**Root Cause:**
`App.tsx:1277` uses `src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"` — a generic electronic music track from a third-party server.

**Impact:**
Critical for the actual wedding experience — guests will hear random electronic music instead of a meaningful wedding song. The external URL may also go down or be slow. This is the most noticeable remaining placeholder in the app.

**Solution:**
Replace with the actual wedding music file. Save it to `/public/music/` and reference locally. This needs the actual audio file from the couple.

---

### Issue #47 — RSVP Form Has No Success Feedback After Submission [FIXED]

**Problem:**
After submitting the RSVP form, the modal closes immediately with no visual confirmation that the wish was received.

**Root Cause:**
`App.tsx:1259-1262` — `handleRSVPSubmit` adds the wish, resets to page 1, closes the modal, and resets the form — all synchronously. The user sees the modal disappear but gets no "thank you" or confirmation toast.

**Impact:**
On mobile, guests may wonder if their submission went through. The wish appears in the feed, but if they're not looking at it (e.g., the page scrolled), they may not notice. This is a UX gap for an emotionally important action.

**Solution:**
Either show a brief success toast/notification after submission, or add a short delay before closing the modal with a "Terima kasih" message.

---

### Issue #48 — Story Comment Input Has No XSS Sanitization [FIXED]

**Problem:**
User-submitted comments in the CinematicStory section are rendered directly without sanitization.

**Root Cause:**
`App.tsx:963` stores the comment text as-is from user input. `App.tsx:859-861` renders it inside a `<span>` via `{el.text}`. While React's JSX rendering escapes HTML by default (preventing `<script>` injection), the comment text is also passed through string concatenation at `App.tsx:800` (`${triggerCommentTap.name}: ${triggerCommentTap.text}`).

**Impact:**
Low risk due to React's built-in escaping. However, very long comments or names with special characters could cause visual overflow in the floating comment bubbles. The `whitespace-nowrap` class on comments (line 859) means a 500-character message would extend far off-screen.

**Solution:**
Add a `maxLength` attribute to the comment name and text inputs to prevent excessively long submissions. This is a simple UI-level constraint.

---

## SEO / META

---

### Issue #49 — `package.json` Name is "react-example" [FIXED]

**Problem:**
The package name is a generic placeholder from the AI Studio template.

**Root Cause:**
`package.json:2` has `"name": "react-example"`. This was never updated from the export.

**Impact:**
No functional impact on the app itself, but it shows up in build logs, error reports, and any tooling that reads package.json. Unprofessional for a personal project.

**Solution:**
Change to `"name": "wedding-dani-marini"` to match the hosting domain.

---

### Issue #50 — `.env.example` References Unused Gemini API Key [FIXED]

**Problem:**
The `.env.example` file still documents the `GEMINI_API_KEY` and `APP_URL` variables which are no longer used.

**Root Cause:**
`.env.example` was part of the AI Studio export. After removing `@google/genai` and the Vite define (Issue #34), these env vars serve no purpose.

**Impact:**
Confuses developers who clone the project — they may think they need a Gemini API key to run the app.

**Solution:**
Either delete `.env.example` entirely (no env vars are needed), or empty it with a comment indicating no configuration is required.

---

## RESPONSIVE DESIGN

---

### Issue #51 — Story Comment Input Overlaps Interaction Buttons on Small Phones [FIXED]

**Problem:**
When opening the comment input on a story slide, the form can overlap with the like/comment buttons on phones with small viewports.

**Root Cause:**
`App.tsx:1031` positions the comment input at `bottom-48` with `z-[70]`, while the interaction buttons are at `bottom-32` with `z-[60]`. On phones shorter than ~667px (iPhone SE, older Androids), the 48-unit bottom offset for the form and the 32-unit offset for the buttons leaves minimal gap — the form's `p-5` padding can visually collide with the button area.

**Impact:**
On small phones, the comment form may partially cover the like/comment buttons, making it confusing to interact with. The "Batal" button might sit directly over the heart button.

**Solution:**
Increase the comment input's bottom offset on small screens (e.g., `bottom-52 sm:bottom-48`) or hide the interaction buttons when the comment form is open.

---

### Issue #52 — Wish Card Name Truncated Too Aggressively at `max-w-[90px]` [FIXED]

**Problem:**
Guest names in wish cards are truncated at 90px, which cuts off names as short as "Ahmad & Keluarga" on mobile.

**Root Cause:**
`App.tsx:1907` applies `truncate max-w-[90px]` to the name paragraph. With `text-[8px] tracking-tight uppercase`, 90px only fits about 12-15 characters before truncating. Many Indonesian names exceed this.

**Impact:**
Names like "Dedi Kurniawan", "Fajar Ramadhan", and "Ahmad & Keluarga" get truncated with ellipsis. Guests may not be able to identify who sent a wish, which defeats the purpose of the name display.

**Solution:**
Increase to `max-w-[130px] sm:max-w-[160px]` to show more of the name while still preventing overflow on very long names.
