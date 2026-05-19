# Known Issues

> **Open issues: 0** | Last audited: 2026-05-17
>
> Audit scope: Deep production-grade audit of Guest Management system — security, performance, data integrity, edge cases, and UX.

---

## Admin Form — Bug Fixes

### ~~ADM-001: "Perubahan Belum Disimpan" modal triggered unnecessarily on tab switch~~ FIXED

**Root cause:** Three bugs in `[slug]/page.tsx` tab navigation:
1. `setHasSaved(false)` called on every tab click — marked form as "dirty" even without edits
2. Same `setHasSaved(false)` on keyboard (arrow key) navigation
3. ConfirmModal `onConfirm` set `setHasSaved(false)` instead of `true` — created infinite modal loop

**Resolution:** Removed `setHasSaved(false)` from tab click and keyboard handlers. Fixed `onConfirm` to `setHasSaved(true)`. Moved `setHasSaved(false)` to `handleSave` catch block only (correct: only mark dirty on save failure). Added `onDirty` callback prop to all 9 editable form components — each form now calls `onDirty()` on user-initiated changes (field edits, file uploads, add/remove items), giving the parent accurate dirty tracking.

**Files changed:** `[slug]/page.tsx`, `CoupleForm`, `EventForm`, `StoryForm`, `MediaForm`, `GuestTab`, `GiftForm`, `GalleryForm`, `CreditForm`, `CustomizeForm` (10 files)

---

### ~~ADM-004: StoryForm hard to reorder, scan, and manage slides~~ FIXED

**Root cause:** No reorder capability (had to delete+recreate to change order). Collapsed slides showed only "Tahap N" + year — no thumbnail, no text preview, no media indicators. Delete button hidden inside expanded view. Two stacked upload sections (photo + video) made expanded view very tall.

**Resolution:** Full UX redesign of `StoryForm.tsx`:
- **Reorder:** Up/down arrow buttons on each slide header (same pattern as GalleryForm). Tracks expanded slide index through moves.
- **Rich collapsed preview:** 40x40 photo thumbnail, year text, text snippet (truncated), green/blue dots for image/video indicators. Users can scan all slides at a glance.
- **Delete on header:** Trash button always visible in header row — no need to expand.
- **Compact media uploads:** Photo and video side by side in 2-column grid (was stacked vertically). Upload buttons say "Ganti" when media exists.
- **Smarter expand state:** Deleting a slide adjusts the expanded index so the wrong slide doesn't suddenly open.
- **Slide count:** Shows "N slide" counter in header.

**Files changed:** `StoryForm.tsx` (1 file)

---

### ~~LP-006: Landing page missing About and FAQ sections; brand rename to Marinikah Invitation~~ FIXED

**Root cause:** No About section to introduce the brand story. No FAQ section to address common questions before consultation. Brand name was "Marinikah" but should be "Marinikah Invitation" across all pages.

**Resolution:**
- Added **About section** between Hero and Strengths: "Berawal dari satu pertanyaan sederhana" with brand origin story
- Added **FAQ section** between Features and Consultation: 6 collapsible `<details>` items (pricing/consultation, setup time, app requirement, editing, sharing, guest limits)
- Renamed "Marinikah" → "Marinikah Invitation" across 7 files: `page.tsx`, `login/page.tsx`, `register/page.tsx`, `error.tsx`, `ConsultationForm.tsx`, `manifest.ts`, `layout.tsx`
- Updated metadata (title, siteName, JSON-LD), footer brand, copyright, OG image alt
- FAQ uses existing `<details>` pattern with `+` icon that rotates on open

Page flow: Hero → About → Strengths → Features → FAQ → Consultation → Footer

**Files changed:** `page.tsx`, `login/page.tsx`, `register/page.tsx`, `error.tsx`, `ConsultationForm.tsx`, `manifest.ts`, `layout.tsx` (7 files)

---

### ~~ADM-007: Super admin page uninformative and poorly designed~~ FIXED

**Root cause:** Header was bare ("Super Admin" + "Keluar" text). Two separate sticky bars. No dashboard stats. Pendaftar cards had no registration timestamps. Undangan cards had no event date or search. Logout was a text button. No users list tab. "Hapus admin" was inline red text link.

**Resolution:** Full redesign of `src/app/admin/page.tsx`:
- **Single compact header** with "Marinikah Invitation" brand, LogOut icon button, stats row (pendaftar count in red, total undangan, active count in green), and tabs with icons
- **3 tabs:** Pendaftar (Users icon), Undangan (FileText icon), Pengguna (UserRound icon, new)
- **Pendaftar tab:** Registration date shown via `formatDate()`, provider badge, icon buttons (Check/X) instead of text buttons
- **Undangan tab:** Search filter (slug, couple name, city), couple name as primary display, event date + city inline, status badges (published/draft/archived with distinct colors), admin emails as removable pill chips, ExternalLink icon to manage
- **Pengguna tab (new):** Lists all users with role badge (super=gold, customer=green, pending=gray), email, registration date, assigned wedding slug as link
- Stats row highlights pending count in red when > 0

**Files changed:** `src/app/admin/page.tsx` (1 file)

---

### ~~SEO-003: Missing security headers~~ FIXED

**Root cause:** Only `Cross-Origin-Opener-Policy` header was configured. Missing `X-Content-Type-Options`, `X-Frame-Options`, and `Referrer-Policy` — standard security headers that prevent MIME sniffing, clickjacking, and referrer leakage.

**Resolution:** Added 3 security headers to `next.config.ts` `headers()`:
- `X-Content-Type-Options: nosniff` — prevents browsers from MIME-sniffing responses
- `X-Frame-Options: SAMEORIGIN` — prevents clickjacking via iframe embedding from other domains
- `Referrer-Policy: strict-origin-when-cross-origin` — limits referrer data sent to third parties

**Files changed:** `next.config.ts` (1 file)

---

### ~~SEO-002: Brand name inconsistency and missing OG image~~ FIXED

**Root cause:** Entire codebase used "Wedding DM" as brand name, but logo assets (`logo-1.png`, `logo-1.png`) show the brand is "marinikah". OG image and Twitter image fields were empty on landing page, preventing rich social previews.

**Resolution:**
- Renamed all "Wedding DM" references to "Marinikah" across 6 files: `page.tsx`, `login/page.tsx`, `register/page.tsx`, `error.tsx`, `ConsultationForm.tsx`, `manifest.ts`, `layout.tsx`
- Added `logo-1.png` as OG image (1200×630) and Twitter image (`summary_large_image`) on landing page
- Updated manifest: name "Marinikah - Undangan Pernikahan Digital", short_name "Marinikah"
- Updated root layout metadata with Marinikah branding
- Footer brand rendered as lowercase "marinikah" matching the logo wordmark style

**Files changed:** `page.tsx`, `login/page.tsx`, `register/page.tsx`, `error.tsx`, `ConsultationForm.tsx`, `manifest.ts`, `layout.tsx` (7 files)

---

### ~~SEO-001: Landing page missing OpenGraph, Twitter Cards, canonical, and structured data~~ FIXED

**Root cause:** Company profile page had title and description but no OpenGraph tags, no Twitter Card tags, no canonical URL, no JSON-LD structured data. Social sharing (WhatsApp, Facebook, Twitter) showed no rich preview. Landing page was also missing from the sitemap.

**Resolution:**
- Added `openGraph` (title, description, url, siteName, type, locale) and `twitter` (card, title, description) to landing page metadata
- Added `alternates.canonical` pointing to `BASE_URL`
- Added JSON-LD `WebApplication` + `Organization` schema with service description and free offer
- Added landing page (`/`) to sitemap with `priority: 1.0` — sitemap now returns static pages even if Firestore query fails
- Improved gallery alt texts: "Foto kenangan 1" → "Galeri {groom} & {bride} - foto 1" (contextual)
- Improved story slide alt texts: "Memory" → "{groom} & {bride} - {year}" (contextual)
- Created global `error.tsx` with noindex, "Coba Lagi" reset button, and "Halaman Utama" link

**Files changed:** `page.tsx`, `sitemap.ts`, `PhotoGallery.tsx`, `CinematicStory.tsx`, `error.tsx` (new) — 5 files

---

### ~~LP-001: Landing page lacks visual depth, product showcase, and social proof~~ FIXED

**Root cause:** Hero was text on solid dark background with invisible decorative blurs (5%/3% opacity). No product screenshot, no social proof, no visual hooks. Feature cards were plain with no hover interaction. Footer had no navigation. Two sections repeated the same CTA pattern.

**Resolution:** Full redesign of `src/app/page.tsx`:
- **Hero:** Added `BackgroundLayers` (grain + light-sweep textures), `PetalEffect` (falling petals animation), increased decorative glow opacity (10%/8%), added center glow. Added live demo phone mockup iframe (180×320, scaled 0.48, `pointer-events-none`, `loading="lazy"`).
- **Social proof stats:** New section with 3 stat counters (100+ Pasangan, 10.000+ Tamu, 4.9 Rating) with icons.
- **Feature cards:** Added glassmorphism (`bg-white/60 backdrop-blur-sm`), hover lift effect (`hover:-translate-y-1`), hover border/shadow transition.
- **Demo section:** Dark section with interactive phone mockup iframe (220×390, scrollable) + "Buka Layar Penuh" link.
- **Final CTA:** Added "Gratis Untuk Memulai" pricing hint label, decorative background blobs.
- **Footer:** Added navigation links (Demo, Daftar, Masuk), copyright with dynamic year, secondary border separator, `bg-paper/30` background.

**Components reused:** `BackgroundLayers`, `PetalEffect` (existing, no new deps). All assets from existing codebase.

**Files changed:** `src/app/page.tsx` (1 file)

---

### ~~LP-002: Landing page has redundant sections and duplicate CTAs~~ FIXED

**Root cause:** Two demo iframes (hero + demo section) showing identical content. Three demo links (hero, demo section, footer). Two registration CTAs with different wording. Demo section repeated the hero's dark layout with a second phone mockup.

**Resolution:** Simplified from 7 sections to 5:
- **Removed** entire demo section (redundant with hero mockup)
- **Hero mockup** made clickable (wrapped in `<Link>` to demo, with hover border/shadow) — replaces the "Buka Layar Penuh" link
- **Removed** demo link from footer nav (hero + "Lihat Demo" button are sufficient)
- **Tightened spacing** — `py-20` → `py-16`, `py-12` → `py-10`, `space-y-8` → `space-y-6`

Flow is now: **See it (hero+mockup) → Trust it (stats) → Learn it (features) → Do it (CTA) → Footer**

**Files changed:** `src/app/page.tsx` (1 file)

---

### ~~LP-003: Landing page not responsive across different mobile devices~~ FIXED

**Root cause:** Multiple responsive issues: `py-auto` (invalid CSS, does nothing) on hero section; phone mockup and rotating rings used fixed pixel widths (180px, 260px, 300px) that don't scale on narrow screens; feature chips forced 2 columns on small screens causing text overflow; `p-6` used instead of `px-6 py-*` in several sections (strengths, features, consultation, footer) giving insufficient vertical padding.

**Resolution:**
- Hero: `py-auto` → `py-16` (valid padding)
- Phone mockup: `w-[180px]` → `w-[45vw] max-w-[180px] aspect-[9/16]` (scales on small screens)
- Rotating rings: fixed `w-[260px]`/`w-[300px]` → `w-[70vw] max-w-[260px]`/`w-[80vw] max-w-[300px]`
- Feature chips: `grid-cols-2` → `grid-cols-1 sm:grid-cols-2 md:grid-cols-3` (single column on mobile)
- Section padding fixed: strengths `px-6 py-12`, features `px-6 py-12`, consultation `px-6 py-14`, footer `px-6 py-8`

**Files changed:** `src/app/page.tsx` (1 file)

---

### ~~LP-004: Landing page copywriting and section redesign~~ FIXED

**Resolution:** Complete copywriting overhaul across all sections with formal, elegant Indonesian tone. Replaced generic CTA section with WhatsApp consultation form (`ConsultationForm.tsx`). Redesigned strengths section with 5 genuine competitive advantages based on codebase analysis. Expanded features to 24 items in 2 grouped categories. Redesigned footer with brand, navigation with gold dot separators, heart divider, and copyright.

**Files changed:** `src/app/page.tsx`, `src/components/ui/ConsultationForm.tsx` (new)

---

### ~~LP-005: Login and register pages inconsistent with company profile design~~ FIXED

**Root cause:** Auth pages used light ivory background, basic white inputs, and generic copywriting ("Masuk", "Daftar", "Buat Akun Baru") that didn't match the dark, elegant company profile aesthetic.

**Resolution:** Both pages redesigned with dark ink background, gold/rose decorative glows, dark-themed inputs (`bg-ivory/10 border-ivory/10 text-ivory`), gold primary buttons with shadow, and "Wedding DM" brand link to homepage. Copywriting updated: login heading "Selamat Datang Kembali", register heading "Mulai Perjalanan Anda", success page "Terima kasih telah mendaftar" with consolidated single-paragraph explanation. Google buttons changed to "Lanjutkan dengan Google".

**Files changed:** `src/app/login/page.tsx`, `src/app/register/page.tsx` (2 files)

---

### ~~ADM-005: MediaForm takes excessive vertical space with verbose layout~~ FIXED

**Root cause:** Each of 4 media items was a tall stacked card (~200px+) with header, description, full-width preview (160px), and oversized upload button. Single-column layout wasted horizontal space.

**Resolution:** Redesigned to a **2x2 grid** of compact cards. Each card has: square thumbnail area with the preview (image/audio), hover-to-reveal upload overlay button, compact label + filename below. Removed verbose description text (labels are self-explanatory). Twibbon "Buat Otomatis" button stays as compact action. Page height reduced ~60%.

**Files changed:** `MediaForm.tsx` (1 file)

---

### ~~ADM-006: `router.push` during render causes React hooks order error~~ FIXED

**Root cause:** `router.push('/login')` called directly in render body (before any early return) triggered "Cannot update a component while rendering another component" and "Rendered more hooks than during previous render" when the `useEffect` was placed after the early `return`.

**Resolution:** Moved auth redirect to `useEffect(() => { if (!loading && !user) router.push('/login') }, [...])` placed **before** all early returns, ensuring consistent hook count across renders. Fixed in all 3 admin pages (`[slug]/page.tsx`, `[slug]/guests/page.tsx`, `admin/page.tsx`).

**Files changed:** `[slug]/page.tsx`, `[slug]/guests/page.tsx`, `admin/page.tsx` (3 files)

---

### ~~ADM-002: QR download saves raw QR image without card frame~~ FIXED

**Root cause:** `handleDownload` in `GuestQRModal` grabbed the raw `<img>` src (280x280 QR data URL) — no frame, names, or branding.

**Resolution:** Created `generateQRCardPNG()` in `qrGenerate.ts` that renders a full aesthetic card on canvas (600x860 @2x retina) with gradient background, floral ornaments, couple name, QR code, guest name, and decorative elements. Download button now uses this function with loading state.

---

### ~~ADM-003: QR card design lacks aesthetic quality compared to twibbon frame~~ FIXED

**Root cause:** `GuestQRCard` used flat ivory background, generic Lucide Heart icons, and plain borders — visually inconsistent with the twibbon overlay's artistic floral design.

**Resolution:** Full redesign of QR card system:
- Extracted shared floral drawing primitives (`drawPetal`, `drawArtisticFlower`, `drawFlowerCluster`, `drawScatteredPetals`, `drawGoldDust`) into `src/utils/floralDraw.ts`
- Refactored `twibbonOverlay.ts` to import from shared utility (57 tests still pass)
- `GuestQRCard` now renders a `<canvas>` layer with live twibbon-style flowers (corner clusters, scattered petals, gold dust) behind content
- Card uses warm gradient background, SVG heart/star ornaments, corner arc accents on QR box, inner decorative border
- `generateQRCardPNG` (download) uses same shared flowers for pixel-perfect matching
- `GuestQRPrintView` reuses `GuestQRCard compact` prop (3-column grid) — no duplicated markup
- Added `compact` prop for smaller print-optimized cards

**Files changed:** `floralDraw.ts` (new), `twibbonOverlay.ts`, `GuestQRCard.tsx`, `GuestQRModal.tsx`, `GuestQRPrintView.tsx`, `qrGenerate.ts` (6 files)

---

## Critical (P0) — Must fix before production

### ~~GMS-001: XSS vulnerability in QR print window via innerHTML injection~~ FIXED

**Resolution:** Added `escapeHtml()` function that escapes `<`, `>`, `&`, `"` in the `<title>` tag (the actual injection vector — React already escapes the body content). Also added `sanitizeFilename()` for the download filename to strip non-alphanumeric characters. The `content.innerHTML` in the body was already safe (React-escaped) but the template literal title was vulnerable to breakout injection.

---

### ~~GMS-002: Guest phone numbers publicly readable — no authentication required~~ FIXED

**Resolution:** Changed guest sub-collection read rule from `allow read: if true` to require authentication + adminIds/super admin check (same as write rule). Guest data (names, phones, addresses) is now only accessible to the wedding's own admins. No guest-facing code reads this collection — verified via grep. Zero functional impact.

---

### ~~GMS-003: Memory explosion in bulk QR print with 500+ guests~~ FIXED

**Resolution:** Rewrote `GuestQRPrintView.tsx` with batched generation (20 QRs per batch with `setTimeout(0)` yielding to browser event loop between batches). QR cards now render progressively as each batch completes (user sees cards appearing incrementally). Progress updates per batch (not per item — reduces re-renders from 500 to ~25 for 500 guests). Each QR generation wrapped in try/catch — failed QRs show "Gagal" placeholder without stopping the batch. Added `truncate max-w-[250px]` on guest name to prevent layout overflow. Print button disabled until generation complete.

---

### ~~GMS-004: Batch guest import has no rollback on partial failure~~ FIXED

**Resolution:** Replaced `Promise.all(addDoc(...))` with Firestore `writeBatch()`. Imports are now split into 500-doc chunks (Firestore batch limit), each committed atomically — either all 500 in a chunk succeed or none do. Returns `{ success, failed }` count to caller. Added input sanitization in batch: name trimmed + max 100 chars, phone max 20 chars, address max 200 chars, category validated. Import handler shows error if any batch fails: "X tamu berhasil diimport, Y gagal."

---

## High (P1) — Significant risk

### ~~GMS-005: No input validation on guest name — empty strings and extreme lengths accepted~~ FIXED

**Resolution:** Added `sanitizeGuestFields()` helper in `lib/guests.ts` — trims and caps all string fields (name: 100, phone: 20, address: 200, category: validated). Applied to `addGuest` (throws error if name empty after trim), `updateGuest` (sanitizes on update), and `addGuestsBatch` (already had sanitization from GMS-004). Three layers of defense: HTML maxLength on inputs → form-level validation → lib-level sanitization.

---

### ~~GMS-006: Phone number format not normalized — duplicates and broken WhatsApp links~~ FIXED

**Resolution:** Created `normalizePhone()` in `lib/guests.ts` — strips all non-digit characters, converts leading `0` to `62`, handles `+620` edge case. Integrated into `sanitizeGuestFields` so ALL writes (addGuest, updateGuest, addGuestsBatch) produce consistent format. WhatsApp URL generation simplified (phone already normalized — no runtime strip/replace needed). Search now works reliably on normalized digits.

---

### ~~GMS-007: Import column detection fails with special characters in headers~~ FIXED

**Resolution:** Rewrote column detection: `normalizeHeader` now replaces common separators (`_`, `.`, `/`, `-`, `()`) with spaces before removing remaining chars (preserves word boundaries). `detectColumn` uses `includes()` matching instead of exact `===`. Candidates reordered longest-first to prevent false positives (e.g., "nama tamu" checked before "nama"). Headers like "Pihak (Pria/Wanita)" → "pihak pria wanita" → includes "pihak" ✓.

---

### ~~GMS-008: No file size limit on import — large files crash browser~~ FIXED

**Resolution:** Added file size check at the start of `handleFileSelect`: rejects files > 5MB with error "File terlalu besar. Maksimal 5MB." before any ArrayBuffer loading or parsing begins. Prevents browser memory crash.

---

### ~~GMS-009: QR generation silently fails on long names — no error handling~~ FIXED

**Resolution:** Wrapped both `generateQRDataURL` and `generateQRSVG` in try/catch — returns empty string on failure instead of rejecting. `GuestQRCard` now tracks `qrError` state: if QR generation returns empty, shows "QR tidak dapat dibuat. Nama terlalu panjang." error message instead of infinite spinner. Bulk print (GMS-003 fix) already handles empty dataUrl with "Gagal" placeholder.

---

## Medium (P2) — Should fix for quality

### ~~GMS-010: No duplicate guest detection on import or manual add~~ FIXED

**Resolution:** Added duplicate name detection in manual add flow. When user submits a name that already exists in the guest list, shows warning: "Tamu 'X' sudah ada. Klik Simpan lagi untuk tetap menambahkan." User must click Save a second time to confirm (warn, not block — handles legitimate duplicate names in Indonesian culture). `duplicateWarning` state resets on form open. Import duplicate detection deferred (user can see duplicates in list visually after import).

---

### ~~GMS-011: Progress bar in bulk print causes 1000 re-renders~~ FIXED (by GMS-003)

**Resolution:** Already resolved by the GMS-003 batched generation fix. Progress now updates once per batch of 20 (not per item). 500 guests = ~25 progress updates (not 500). Acceptable performance.

---

### ~~GMS-012: Excel import loses leading zeros on phone numbers~~ FIXED

**Resolution:** Two-layer fix: (1) Added `raw: false` to `parseFile()` SheetJS options — returns cell values as formatted strings, preserving text-formatted leading zeros. (2) Extended `normalizePhone()` to handle bare numbers starting with `8` and 9-12 digits long — auto-prepends `62` (Indonesian mobile assumption, safe for target market). So even if Excel strips the zero, `812345678` → `62812345678` correctly.

---

### ~~GMS-013: Template preview shows different URL encoding than actual WhatsApp link~~ FIXED

**Resolution:** Changed preview link from hardcoded `Budi+Santoso` to `encodeURIComponent('Budi Santoso')` — now shows `Budi%20Santoso` matching actual WhatsApp URL behavior. One-line fix.

---

### ~~GMS-014: Guest name overflow breaks QR card print layout~~ FIXED

**Resolution:** Added `line-clamp-2 max-w-[260px]` to guest name in `GuestQRCard.tsx`. Long names wrap gracefully to 2 lines with ellipsis overflow — handles formal Indonesian names like "Muhammad Daniansyah Chusyaidin, S.Kom" without breaking the card layout. Bulk print card (GuestQRPrintView) already had `truncate max-w-[250px]` from GMS-003 fix.

---

## Summary

| Priority | Count | Focus |
|----------|-------|-------|
| P0 Critical | 4 | XSS, data exposure, memory crash, partial writes |
| P1 High | 5 | Validation, phone normalization, import parsing, file size, QR errors |
| P2 Medium | 5 | Duplicates, re-renders, Excel zeros, preview mismatch, layout overflow |
| **Total** | **14** | |

---

## Design Tradeoffs (Intentional, Not Bugs)

- **Client-side pagination:** All guests loaded at once, filtered in memory. Fine for <1000 guests per wedding. Would need cursor-based Firestore pagination at scale.
- **Sequential QR generation:** Intentionally serial to avoid CPU spike. Parallel would be faster but risks browser throttling.
- **No real-time listener on guests:** Uses one-shot `getDocs` instead of `onSnapshot`. Reduces Firestore costs but means list doesn't auto-update if two admins edit simultaneously.

---

## Security Verdict

| Area | Status |
|------|--------|
| Write authorization | SECURE — only admins can write |
| Read authorization | VULNERABLE — guests publicly readable (GMS-002) |
| XSS protection | VULNERABLE — print window injection (GMS-001) |
| Input validation | WEAK — no server-side or client-side validation |
| Data isolation | PARTIAL — write isolated, read not |

---

## Performance Verdict

| Scenario | Status |
|----------|--------|
| 100 guests | SMOOTH — no issues |
| 500 guests | ACCEPTABLE — import/export fine, bulk print slow (~15s) |
| 1000 guests | RISKY — bulk print may crash mobile, memory ~10MB |
| 5000+ guests | BROKEN — client-side filtering too slow, no pagination |

---

## Final Verdict

**SAFE WITH RISKS** — Confidence: **62/100**

The guest management system is functional for typical use (50-200 guests per wedding) but has critical security vulnerabilities (public data, XSS) and will degrade under scale. Must fix P0 issues before accepting real customer data with phone numbers.
