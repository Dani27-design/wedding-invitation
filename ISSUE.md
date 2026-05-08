# Known Issues

> Ordered by urgency (most urgent first). Each issue includes root cause, impact, solution, and risk assessment.
>
> **Severity:** High (H) = blocks production launch or causes data loss/security breach. Medium (M) = degrades UX, accessibility, or reliability. Low (L) = minor improvement, nice-to-have.
>
> **Total: 38 issues** — 5 High, 14 Medium, 19 Low

---

## High Severity

---

### H1 — Firestore security rules too permissive

**Issue:** Current `firestore.rules` allows `read, write: if true` for ALL documents. Anyone can write, update, or delete any wedding document.

**Root Cause:** Task 1.10 (Deploy Firestore security rules) is still pending. The proper rules defined in `FIRESTORE_INTEGRATION.md` have not been deployed.

**Impact:** Any user or bot can overwrite or delete wedding data, wishes, story likes, or comments. Full data loss risk for all couples.

**Solution:** Deploy the security rules from `FIRESTORE_INTEGRATION.md` — owner-only write for weddings, public read, validated creates for wishes and comments, increment-only updates for story-likes.

**Risk:** High — actively exploitable in production. Must be fixed before public launch.

---

### H2 — XSS vulnerability in SSR HTML injection (api/ssr-meta.ts + Cloud Function) [FIXED]

**Issue:** Both `api/ssr-meta.ts` and `functions/src/index.ts` inject Firestore data (couple names, venue, city, date, image URLs, theme colors) directly into HTML without escaping. A malicious admin could set `groomNickname` to `<script>alert('xss')</script>` and it would be injected verbatim into the served HTML.

**Root Cause:** String interpolation and `.replace()` are used to inject values into HTML meta tags, title, body content, and inline styles without HTML entity escaping. The `slug` from the URL path is also injected into `og:url` meta tag without escaping.

**Impact:** Stored XSS — any admin can inject arbitrary JavaScript into the SSR output viewed by all visitors to that wedding page. Can steal cookies, redirect users, or deface the page. Affects both the Vercel API route (normal users) and the Cloud Function (crawlers).

**Solution:** Create an HTML escape utility and apply it to all interpolated values before injection:
```typescript
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```
Apply `escapeHtml()` to: `groom`, `bride`, `title`, `description`, `venueName`, `eventCity`, `dateDisplay`, `slug`. For `imageUrl` and `pageUrl`, validate URL format before injection. For theme color values, validate hex format (`/^#[0-9A-Fa-f]{6}$/`).

**Risk:** High — actively exploitable if any admin enters malicious data. Must be fixed before allowing untrusted users to create weddings.

---

### H3 — `firestore.indexes.json` missing `story-comments` composite index

**Issue:** The `firestore.indexes.json` only defines the `wishes` composite index (`weddingId ASC, createdAt DESC`). The `story-comments` composite index (`weddingId ASC, slideIndex ASC, createdAt DESC`) required by `useStoryComments` is missing.

**Root Cause:** The index file was created during Firebase init with only the wishes index. The story-comments index defined in `FIRESTORE_INTEGRATION.md` was never added to the file. Task 1.10 (deploy security rules + indexes) is still pending.

**Impact:** The `useStoryComments` query (`where('weddingId', '==', ...).where('slideIndex', '==', ...).orderBy('createdAt', 'desc')`) will **fail at runtime** with a Firestore error: "The query requires an index". Story comments will not load on any slide.

**Solution:** Add the composite index to `firestore.indexes.json`:
```json
{
  "collectionGroup": "story-comments",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "weddingId", "order": "ASCENDING" },
    { "fieldPath": "slideIndex", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```
Then deploy: `firebase deploy --only firestore:indexes`.

**Risk:** High — story comments are completely broken without this index. Must be fixed before production.

---

### H4 — No input validation on admin forms [FIXED]

**Issue:** Admin forms accept any input without validation — no max length, no URL format check, no image size/format restriction, no date range validation.

**Root Cause:** Task 4.3 focused on creating the form UI. Validation was not included in the scope.

**Impact:** Invalid data can be written to Firestore — malformed URLs in social links, past dates for events, excessively long text that breaks UI layouts, oversized images that slow page load.

**Solution:** Add validation per form:
- `CoupleForm`: max length on names (50 chars), required photo
- `EventForm`: future-only date, valid Google Maps URL pattern, required city/venue
- `StoryForm`: max 500 chars per slide text, required year
- `GalleryForm`: max file size (5MB), image-only MIME check
- `GiftForm`: numeric-only account field, required bank name
- `MediaForm`: max file size (10MB audio, 5MB images), valid MIME types
- `SocialForm`: URL pattern validation for Instagram/LinkedIn/Threads, phone number format for WhatsApp
- `CustomizeForm`: hex color format validation

**Risk:** Low — additive changes, no existing behavior modified.

---

### H5 — Admin form inputs have no id/htmlFor label association [FIXED]

**Issue:** All 8 admin form components use `<label>` elements visually but none are associated with their `<input>` via `htmlFor`/`id` attributes.

**Root Cause:** Forms were built with visual labels only (`<label className="...">Text</label>`) without the HTML association pattern (`<label htmlFor="field-id">` + `<input id="field-id">`).

**Impact:** Screen readers cannot connect labels to inputs. Violates WCAG 2.1 Level A (1.3.1 Info and Relationships). Admin panel is inaccessible to visually impaired users.

**Solution:** Add unique `id` to every `<input>`, `<select>`, and `<textarea>` in all 8 admin forms. Add matching `htmlFor` to each `<label>`.

**Risk:** Low — mechanical change, no logic changes. No visual impact.

---

## Medium Severity

---

### M1 — `prefers-reduced-motion` does not affect Framer Motion animations [FIXED]

**Issue:** The `index.css` `@media (prefers-reduced-motion: reduce)` rule sets `animation-duration: 0.01ms` and `transition-duration: 0.01ms`. This only affects CSS `animation` and `transition` properties. Framer Motion uses JavaScript-driven animations via `requestAnimationFrame` and inline `transform`/`opacity` styles — these are completely unaffected.

**Root Cause:** Framer Motion (motion/react) does not automatically respect `prefers-reduced-motion`. It requires explicit opt-in via the `useReducedMotion()` hook or the `<MotionConfig reducedMotion="user">` provider.

**Impact:** Users who have enabled "Reduce motion" in their OS accessibility settings still see all Framer Motion animations — floating petals, ambient social layer, pulsing hearts, rotating borders, scale transitions, slide-in text. This violates WCAG 2.1 Level AAA (2.3.3 Animation from Interactions) and can cause discomfort for users with vestibular disorders.

**Solution:** Wrap the app in `<MotionConfig reducedMotion="user">` in `main.tsx` or `Wedding.tsx`. This makes all Framer Motion animations respect the OS `prefers-reduced-motion` setting automatically.

**Risk:** Low — single wrapper component. All animations will be skipped when reduced motion is preferred, which changes the visual experience significantly but is the correct accessibility behavior.

---

### M2 — Content overflow on short devices (< 700px viewport height) [FIXED]

**Issue:** Sections using `h-screen-safe` (`100svh`) can overflow on short devices — landscape phones, Galaxy Fold outer screen (720px), or phones with large browser chrome.

**Root Cause:** `h-screen-safe` forces sections to exactly viewport height. Content-heavy sections (EventSection with countdown + ceremonies + venue + 2 buttons, CoupleSection with 2 photos + text) may not fit.

**Impact:** Content gets cut off, buttons become unreachable, ceremony cards may overflow and stack incorrectly. Affects landscape orientation and foldable devices.

**Solution:** Change `h-screen-safe` to `min-h-screen-safe h-fit` on content-heavy sections (EventSection, CoupleSection). Keep `h-screen-safe` on immersive sections (HeroSection, CinematicStory) where fixed height is intentional.

**Risk:** Low — CSS-only change. May slightly alter scroll feel on tall devices where content is shorter than viewport.

---

### M3 — No focus trap on RSVPModal [FIXED]

**Issue:** `RSVPModal` has `role="dialog"`, `aria-modal="true"`, and Escape key handling, but no focus trap. Tab key can move focus to elements behind the modal overlay.

**Root Cause:** Focus trap was not implemented when the modal was built. The modal relies on the backdrop `onClick` for closing but doesn't constrain keyboard focus.

**Impact:** Keyboard users can tab to invisible elements behind the modal. Violates WCAG 2.1 Level A (2.4.3 Focus Order). Screen reader users may lose context.

**Solution:** Add a focus trap using a small utility (trap focus between first and last focusable element in the modal) or use a library like `focus-trap-react`. Auto-focus the first input on open.

**Risk:** Low — additive change. May require testing with screen readers to verify focus behavior.

---

### M4 — No focus trap on PhotoZoomModal [FIXED]

**Issue:** Same as M3 — `PhotoZoomModal` has `role="dialog"` and Escape handling but no focus trap.

**Root Cause:** Same as M3.

**Impact:** Same as M3 — keyboard focus can escape the modal.

**Solution:** Same as M3 — add focus trap. Auto-focus the close button on open.

**Risk:** Low — same as M3.

---

### M5 — `api/ssr-meta.ts` self-fetches `index.html` from own domain [FIXED]

**Issue:** The Vercel API route fetches `/index.html` from its own origin via HTTP (`fetch(${origin}/index.html)`). This adds an internal network hop.

**Root Cause:** Vercel serverless functions don't have direct filesystem access to the static build output. The self-fetch was chosen as the simplest approach.

**Impact:** Adds ~50-100ms latency per request. If Vercel CDN has issues, the API route may fail to fetch its own `index.html`. Also creates a dependency where the API route must not match the `/index.html` rewrite pattern (currently safe — the rewrite excludes file extensions).

**Solution:** Use Vercel's `includeFiles` option in `vercel.json` to bundle `dist/index.html` into the serverless function, then read via `fs.readFileSync`. Removes the network hop.

**Risk:** Medium — requires testing that `includeFiles` works correctly with Vite's build output path.

---

### M6 — Admin forms allow double-submit during save [FIXED]

**Issue:** User can click "Simpan" multiple times while a save is in progress, triggering duplicate `updateDoc` and `uploadFile` calls.

**Root Cause:** `Admin.tsx` has `isSaving` state but does not pass it to form components. Forms don't disable the submit button based on save status.

**Impact:** Duplicate Firestore writes (mostly harmless — last write wins). Duplicate file uploads waste storage and bandwidth. Confusing UX with multiple success/error messages.

**Solution:** Pass `isSaving` as prop to all forms. Disable submit button and show loading state when `isSaving` is true.

**Risk:** Low — prop addition + button disable. No logic change.

---

### M7 — Admin form unsaved edits lost on tab switch [FIXED]

**Issue:** When an admin switches between form tabs (e.g. from "Pasangan" to "Acara"), the current form unmounts and its `useState` state is lost. Any unsaved edits are discarded without warning.

**Root Cause:** Each form component manages its own state via `useState`, initialized from `data` (Firestore snapshot). The `switch` statement in `Admin.tsx` unmounts the current form and mounts the new one — React destroys all local state on unmount.

**Impact:** Admin accidentally loses work by clicking a different tab before saving. No "unsaved changes" warning or confirmation dialog.

**Solution:** Either:
1. Add a "discard changes?" confirmation dialog when switching tabs with unsaved edits (track dirty state per form)
2. Or lift form state up to `Admin.tsx` so it persists across tab switches
3. Or auto-save on tab switch

**Risk:** Low for option 1 (add confirmation), Medium for option 2 (significant refactor).

---

### M8 — CinematicStory comment form inputs lack aria-label [FIXED]

**Issue:** The name input and textarea in the CinematicStory comment form have `placeholder` text but no `aria-label` attribute.

**Root Cause:** Inputs rely on `placeholder` for visual labeling. Placeholders disappear when user types, and are not announced by all screen readers as labels.

**Impact:** Screen reader users cannot identify what each field is for after typing begins. Violates WCAG 2.1 Level A (1.3.1).

**Solution:** Add `aria-label="Nama Anda"` to the name input and `aria-label="Tulis pesan"` to the textarea.

**Risk:** None — attribute addition only.

---

### M9 — AmbientSocialLayer timer runs when off-screen [FIXED]

**Issue:** `AmbientSocialLayer` runs a `setInterval` every 4 seconds that creates new floating elements, even when the story section is scrolled off-screen.

**Root Cause:** The interval starts on mount and only clears on unmount. No visibility check (e.g. IntersectionObserver) to pause when off-screen.

**Impact:** Unnecessary DOM updates and React re-renders every 4 seconds while the user is on other sections. The `.slice(-20)` cap prevents memory issues, but CPU cycles are wasted.

**Solution:** Use IntersectionObserver to detect when the story section is visible. Pause the interval when off-screen, resume when visible.

**Risk:** Low — behavioral change. May affect the "ambient" feel if elements aren't pre-populated when scrolling back to the story section.

---

### M10 — `setTimeout` without cleanup in Admin.tsx and TwibbonCreator.tsx [FIXED]

**Issue:** `Admin.tsx` line 101 (`setTimeout(() => setSaveMessage(''), 2000)`) and `TwibbonCreator.tsx` line 197 (`setTimeout(() => setShareError(false), 3000)`) create timers without storing the timer ID or clearing on unmount.

**Root Cause:** These `setTimeout` calls are fire-and-forget — no ref stores the timer ID, and no cleanup runs on unmount. Unlike `Wedding.tsx` which correctly uses `copyTimerRef` and `submitTimerRef` with cleanup.

**Impact:** If the component unmounts before the timer fires (e.g. user navigates away quickly), `setState` is called on an unmounted component. In React 18+ this no longer throws, but it's still wasted work and indicates a potential memory leak pattern.

**Solution:** Store timer IDs in refs and clear them on unmount, matching the pattern already used in `Wedding.tsx`.

**Risk:** None — ref addition + cleanup. Same pattern already exists elsewhere.

---

### M11 — `handleRSVPSubmit` has stale closure over `weddingSlug` [FIXED]

**Issue:** `handleRSVPSubmit` in `Wedding.tsx` is wrapped in `useCallback(async (...) => { ... addWish(weddingSlug, ...) }, [])` with an empty dependency array, but captures `weddingSlug` from the outer scope.

**Root Cause:** The dependency array `[]` was kept from when the value was a constant `WEDDING_SLUG`. After Task 5.1 changed it to `useParams`, it became a closure-captured variable that should be in the dependency array.

**Impact:** Minimal in practice — `weddingSlug` comes from `useParams` and doesn't change during the component's lifecycle (the URL stays the same). But it's incorrect per React's Rules of Hooks and could cause bugs if the routing changes.

**Solution:** Add `weddingSlug` to the dependency array: `}, [weddingSlug]);`.

**Risk:** None — dependency array fix.

---

### M12 — No `<link rel="canonical">` tag [FIXED]

**Issue:** `index.html` has no canonical URL tag. The `api/ssr-meta.ts` and Cloud Function also don't inject one.

**Root Cause:** Canonical tag was not included in the original HTML template or the SSR function.

**Impact:** Search engines may index duplicate URLs (with/without trailing slash, query params, etc.). Dilutes SEO ranking for the wedding page.

**Solution:** Add `<link rel="canonical" href="https://domain.com/:slug" />` to `index.html`. Inject the correct canonical URL in `api/ssr-meta.ts` and the Cloud Function.

**Risk:** None — additive HTML tag.

---

### M13 — credits field not editable in admin forms [FIXED]

**Issue:** `WeddingDocument` has a `credits: CreditPerson[]` field but no admin form allows editing it. Credits are only set via the seed script.

**Root Cause:** The 8 admin form pages were scoped based on the `FIRESTORE_INTEGRATION.md` admin form table, which doesn't include a credits editing page.

**Impact:** Couples cannot change credit names, roles, or descriptions via the admin panel. Must be done via Firestore console or re-seeding.

**Solution:** Add a credits section to an existing form page (e.g. CustomizeForm page 8) or create a 9th admin page. Each credit entry has: name, role (dropdown: developer/designer/other), description.

**Risk:** Low — additive UI component.

---

### M14 — Color contrast on low-opacity admin helper text [FIXED]

**Issue:** Admin forms use `text-ink/40` and `text-ink/30` for labels and helper text. At 40% opacity on `#FDFCF8` background, `#1A1A1A` text becomes ~`#BDBCBA` equivalent, which has a contrast ratio of ~1.7:1 — well below WCAG 2.1 AA minimum of 4.5:1.

**Root Cause:** Opacity-based text styling was used for visual subtlety without checking contrast ratios.

**Impact:** Low-contrast text is difficult to read for users with low vision. Fails WCAG 2.1 Level AA (1.4.3 Contrast Minimum).

**Solution:** Increase minimum opacity to `text-ink/60` for body text and `text-ink/50` for helper text. Or use a fixed color like `text-ink/70` that meets the 4.5:1 ratio.

**Risk:** None — visual-only change. Admin UI will look slightly less "subtle" but more readable.

---

## Low Severity

---

### L1 — No image optimization or srcset [PARTIAL]

**Issue:** All images load at full resolution regardless of device screen size. No `srcset`, `sizes`, or responsive image service is used.

**Root Cause:** Images are served as static files from `/images/` or Firebase Storage URLs. No image optimization pipeline exists.

**Impact:** Mobile users download unnecessarily large images (e.g. a 2MB hero photo on a 375px-wide screen). Increases page load time and data usage.

**Solution:** Two parts:
- **Part 1 (done):** Added `sizes` attribute to all 7 wedding page images — tells browsers the expected display size for layout and future `srcset` support.
- **Part 2 (deferred):** `srcset` with Firebase Resize Images extension requires solving the download URL token mismatch — resized images get different tokens, so URLs can't be derived from the original by suffix insertion. Needs either public URL approach or storing resized URLs in Firestore via event handler.

**Risk:** Low — requires image processing infrastructure setup.

---

### L2 — RSVPModal radio inputs use `hidden` instead of `sr-only` [FIXED]

**Issue:** The attendance radio inputs in `RSVPModal` use `className="hidden peer"` which applies `display:none`, removing them entirely from the accessibility tree.

**Root Cause:** The `hidden` class was used for visual hiding, but it also hides the element from screen readers. The `peer` selector pattern requires the input to be a sibling, so `sr-only` (which uses `position:absolute` + clipping) is the correct approach.

**Impact:** Screen readers cannot discover or interact with the attendance radio buttons. Users hear the visual label text ("Hadir" / "Berhalangan") but can't identify them as radio options or toggle between them. Violates WCAG 2.1 Level A (4.1.2 Name, Role, Value).

**Solution:** Replace `className="hidden peer"` with `className="sr-only peer"` on both radio inputs. Tailwind's `sr-only` keeps the element accessible but visually hidden.

**Risk:** None — class name change. Visual appearance unchanged (the `peer` selector still works with `sr-only`).

---

### L3 — RSVPModal has no scroll on short devices with soft keyboard [FIXED]

**Issue:** `RSVPModal` is a fixed overlay with `flex items-center justify-center`. The form content (name input + radio buttons + textarea + submit button) has no scrollability. On short devices with the soft keyboard open, the form may overflow the visible area.

**Root Cause:** The modal uses a centered flex layout without `overflow-y-auto` or `max-h` constraint on the form container.

**Impact:** On devices < 500px viewport height (or when soft keyboard reduces available height), the submit button and textarea may be pushed below the visible area. Users can't scroll to reach them.

**Solution:** Add `overflow-y-auto max-h-[90vh]` to the modal content wrapper. Or add `overflow-y-auto` to the inner form container.

**Risk:** Low — CSS addition. May slightly change the visual centering on tall devices.

---

### L4 — `window.open()` in EventSection without `noopener` [FIXED]

**Issue:** The "Ke Kalender" button uses `window.open(deriveCalendarUrl(wedding))` without passing `noopener` as the third argument.

**Root Cause:** `window.open()` was called with only the URL argument. The `noopener` feature string was not included.

**Impact:** The opened Google Calendar tab can access `window.opener`, which is a minor security risk (the calendar page could theoretically redirect the wedding page). Also, `window.open()` may be blocked by popup blockers on some browsers since it's triggered by a `<button>` click (not an `<a>` tag).

**Solution:** Change to `window.open(url, '_blank', 'noopener,noreferrer')` or convert to an `<a target="_blank" rel="noopener noreferrer">` tag.

**Risk:** None — argument addition or element swap.

---

### L5 — Hero image alt text is generic [FIXED]

**Issue:** `HeroSection.tsx` uses `alt="Hero Portrait"` — a generic description that doesn't describe the image content.

**Root Cause:** The alt text was hardcoded before the Firestore integration. Not updated to use dynamic couple names.

**Impact:** Screen readers announce "Hero Portrait" instead of meaningful content. Minor SEO impact — search engines use alt text for image indexing.

**Solution:** Change to `alt={`${wedding?.groomNickname} & ${wedding?.brideNickname}`}`.

**Risk:** None — string change only.

---

### L6 — ErrorBoundary default props are couple-specific [FIXED]

**Issue:** `ErrorBoundary.tsx` has default prop values `groomNickname = 'Dani'`, `brideNickname = 'Marini'`, etc. For other couples, the error screen shows wrong names.

**Root Cause:** Defaults were set during Task 2.15 when ErrorBoundary was converted to accept props. The defaults are for the original dani-marini couple.

**Impact:** If an error occurs before wedding data loads (rare), the error screen shows "Dani & Marini" regardless of which couple's page it is.

**Solution:** Change defaults to generic values: `groomNickname = ''`, `brideNickname = ''`, `dateDisplay = ''`, `venueName = ''`, `eventCity = ''`. Show "Undangan Pernikahan" when names are empty.

**Risk:** None — default value change.

---

### L7 — Gallery items have no visible focus indicator [FIXED]

**Issue:** Gallery items have `tabIndex={0}` and `role="button"` with keyboard handler, but no visible focus ring or outline style.

**Root Cause:** The `cursor-zoom-in` class is visual-only. No `focus:ring` or `focus:outline` Tailwind class was added.

**Impact:** Keyboard users can tab to gallery items but cannot see which one is currently focused. Violates WCAG 2.1 Level AA (2.4.7 Focus Visible).

**Solution:** Add `focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2` to gallery item className.

**Risk:** None — CSS class addition.

---

### L8 — DigitalEnvelope cards have no visible focus indicator [FIXED]

**Issue:** Gift account cards in `DigitalEnvelope` have `tabIndex={0}`, `role="button"`, and keyboard handler, but no visible focus ring or outline style.

**Root Cause:** Same as L7 (gallery items) — interactive elements with `tabIndex` but no `focus-visible` style.

**Impact:** Keyboard users can tab to gift cards but cannot see which one is focused. Same WCAG violation as L7 (2.4.7 Focus Visible).

**Solution:** Add `focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2` to the card's className.

**Risk:** None — CSS class addition.

---

### L9 — Gallery renders empty section when no photos [FIXED]

**Issue:** If `wedding.gallery` is empty, `PhotoGallery` renders the section header ("Jejak Cerita Kami") with an empty grid and no feedback.

**Root Cause:** No empty state check in the component.

**Impact:** Users see a section with a title and description but no content. Confusing UX.

**Solution:** Add an early return or "Belum ada foto" message when `galleryItems.length === 0`.

**Risk:** None — conditional rendering.

---

### L10 — Story section renders empty when no slides [FIXED]

**Issue:** If `wedding.story` is empty, `CinematicStory` renders an empty horizontal scroll container with no dot indicators.

**Root Cause:** No empty state check. `slides.map()` on an empty array produces nothing.

**Impact:** Users see a blank dark section. The scroll hint ("Geser") does not appear (it's only shown on `idx === 0`).

**Solution:** Add an early return or placeholder message when `slides.length === 0`.

**Risk:** None — conditional rendering.

---

### L11 — DigitalEnvelope renders empty when no gift accounts [FIXED]

**Issue:** If `wedding.giftAccounts` is empty, `DigitalEnvelope` renders the section header ("Tanda Kasih") with an empty grid and no feedback.

**Root Cause:** No empty state check in the component. Same pattern as L9 (gallery) and L10 (story).

**Impact:** Users see a section with title and description but no content. Confusing UX.

**Solution:** Add an early return or "Belum ada rekening" message when `giftAccounts.length === 0`.

**Risk:** None — conditional rendering.

---

### L12 — Admin tab navigation lacks ARIA tablist pattern [FIXED]

**Issue:** Admin step tabs use `<button>` elements but don't use the `role="tablist"`, `role="tab"`, `aria-selected`, `role="tabpanel"` ARIA pattern.

**Root Cause:** Tabs were built as simple buttons with `onClick` state changes. ARIA tab pattern was not implemented.

**Impact:** Screen readers don't announce the tabs as a tabbed interface. Users don't know the current tab or total tab count.

**Solution:** Add `role="tablist"` to the nav container, `role="tab"` + `aria-selected` to each button, and `role="tabpanel"` to the main content area.

**Risk:** None — attribute additions only.

---

### L13 — Google Fonts loaded twice for cinematic template [FIXED]

**Issue:** For the default cinematic template, Google Fonts are loaded from both the hardcoded `<link>` tags in `index.html` and the dynamic `useEffect` in `Wedding.tsx`.

**Root Cause:** The `index.html` `<link>` tags were kept for fast initial load. The dynamic `useEffect` (Task 3.5.9) always injects a `<link>` regardless of whether the fonts match the defaults.

**Impact:** Minimal — browsers deduplicate identical font requests. But two `<link>` elements exist in the DOM unnecessarily.

**Solution:** In the dynamic font loading `useEffect`, compare `wedding.theme.fonts` against `THEME_DEFAULTS.cinematic.fonts`. Skip injection if all fonts match the defaults (already loaded by `index.html`).

**Risk:** None — conditional skip logic.

---

### L14 — `status` and `ownerId` not managed in admin [FIXED]

**Issue:** `WeddingDocument.status` is always `'published'` and `ownerId` is always empty string. Neither field is editable or automatically set.

**Root Cause:** `ownerId` is designed for Phase 4 auth ownership (set after Firebase Auth setup). The seed script sets it to empty. `status` was designed for draft/published/archived workflow but not implemented in the admin UI.

**Impact:** No access control — any authenticated user can edit any wedding (until `ownerId` is set and rules enforced). No ability to unpublish or archive a wedding.

**Solution:** Set `ownerId` to the authenticated user's UID on first save or wedding creation. Add a status toggle (published/archived) in the admin header.

**Risk:** Low — requires auth flow to be tested. Depends on H1 (proper security rules) being deployed first.

---

### L15 — No structured data (JSON-LD) for wedding events [FIXED]

**Issue:** No schema.org structured data markup for the wedding event.

**Root Cause:** Not included in original scope. JSON-LD would need to be injected via SSR (Cloud Function or API route).

**Impact:** Missing Google rich results for event details (date, location, venue). Minor SEO impact — wedding invitations are typically shared via direct links, not search.

**Solution:** Add `<script type="application/ld+json">` with `Event` or `SocialEvent` schema in the SSR function output, containing event date, venue, and couple names.

**Risk:** None — additive script tag in SSR output.

---

### L16 — `vercel.json` rewrite pattern doesn't exclude root-level static files [FIXED]

**Issue:** The `vercel.json` rewrite pattern `/((?!api|assets|images|fonts|musics|textures|src|index\\.html).*)` correctly excludes known directories but doesn't exclude root-level files like `robots.txt`, `sitemap.xml`, `favicon.ico`, or Vite's `vite.svg`. These paths match the pattern and get routed to `/api/ssr-meta`.

**Root Cause:** The negative lookahead pattern lists specific directory prefixes but doesn't account for files at the root level that don't match any prefix.

**Impact:** Requests for `robots.txt`, `sitemap.xml`, etc. would hit the API route, which would try to look up a Firestore document named `robots.txt` (not found), and serve the unmodified `index.html`. Search engine crawlers requesting `robots.txt` would get HTML instead of the expected text file.

**Solution:** Add common root files to the exclusion pattern: `/((?!api|assets|images|fonts|musics|textures|src|index\\.html|robots\\.txt|sitemap\\.xml|favicon\\.ico|.*\\..{2,4}$).*)`. The `.*\\..{2,4}$` pattern excludes any path with a file extension.

**Risk:** Low — regex pattern update. Must be tested to avoid accidentally excluding valid slugs that contain dots.

---

### L17 — FloatingController drag constraints are hardcoded [FIXED]

**Issue:** `FloatingController` has hardcoded drag constraints `{ left: -200, right: 0, top: -400, bottom: 0 }`. On very small devices (width < 250px), dragging left by 200px would move the controller off-screen.

**Root Cause:** Drag constraints use fixed pixel values instead of viewport-relative values or a ref-based constraint.

**Impact:** On very narrow devices, the floating controller can be dragged off-screen and become unreachable. The user would need to reload the page.

**Solution:** Use a `dragConstraints` ref attached to the viewport container, or calculate constraints dynamically based on `window.innerWidth`/`window.innerHeight`.

**Risk:** Low — requires changing the drag constraint from fixed values to dynamic calculation.

---

### L18 — `useWedding` has no refetch mechanism [ACCEPTED]

**Issue:** `useWedding` fetches the wedding document once on mount via `getDoc`. If data changes while the page is open, it remains stale.

**Root Cause:** One-time read was chosen for simplicity (wedding data rarely changes during a guest's visit).

**Impact:** If an admin updates the wedding while a guest has the page open, the guest sees old data until page refresh. Acceptable for wedding invitations — guests typically visit once.

**Solution:** No action needed for v1. If real-time updates are desired, switch to `onSnapshot` listener (like `useWishes`).

**Risk:** N/A — accepted behavior.

---

### L19 — No offline support [ACCEPTED]

**Issue:** No service worker or offline caching. The app requires an internet connection to load.

**Root Cause:** Not included in scope. Wedding invitations are typically viewed online via shared links.

**Impact:** If a guest loses connectivity after opening the invitation, the app cannot reload. No cached version available.

**Solution:** Add a service worker via Vite PWA plugin to cache the app shell and critical assets. Optional — low priority for a wedding invitation.

**Risk:** Low — service worker setup requires careful cache invalidation strategy.
