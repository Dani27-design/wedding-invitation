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
