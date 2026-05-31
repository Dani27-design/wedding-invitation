# Known Issues — Text Overflow

> Audit date: 2026-06-01
> Scope: Invitation page sections, Admin panel forms

---

## High

### ~~1. CoupleSection — Couple Names Overflow on Large Fonts~~ ✅ FIXED

**Problem:** `groomName` and `brideName` rendered at `text-2xl sm:text-3xl md:text-5xl` with no overflow protection.

**Root Cause:** `src/components/sections/CoupleSection.tsx` lines 109-110, 128-129 — no `break-words`, `truncate`, or `line-clamp`.

**Impact:** Names longer than ~25 chars at `md` breakpoint overflow the blob container. Example: "Muhammad Daniansyah Chusyaidin, S.Kom."

**Solution:** Add `break-words` to the `<h2>` elements.

---

### ~~2. CoupleSection — Parent Names Overflow with Wide Tracking~~ ✅ FIXED

**Problem:** `groomParents` and `brideParents` rendered with `tracking-widest` and no word-break.

**Root Cause:** `src/components/sections/CoupleSection.tsx` lines 112-113, 131-132 — `tracking-widest` makes long text wider, no overflow handling.

**Impact:** Long parent strings like "Putra Bapak Ahmad Wijaya & Ibu Siti Nurhaliza" wrap awkwardly or overflow on mobile (320px).

**Solution:** Add `break-words` to the parent `<p>` elements.

---

### ~~3. EventSection — Ceremony Name and Venue Name Overflow~~ ✅ FIXED

**Problem:** Ceremony names and venue names rendered in blob cards with no max-width or word-break.

**Root Cause:** `src/components/sections/EventSection.tsx` — ceremony name at `text-xl` (mobile line 77) / `text-2xl` (desktop line 140), venue name at `text-sm`/`text-lg` with no overflow protection.

**Impact:** Long ceremony names (e.g. "Resepsi Pernikahan Keluarga Besar") or venue names (e.g. "Aula Pernikahan Grand Citra Raya Mas Jaya Sejahtera") overflow the blob shape.

**Solution:** Add `break-words` to ceremony name and venue name elements. Add `max-w` constraint to venue address on desktop.

---

### ~~4. AmbientSocialLayer — Comment Bubbles Force Single Line~~ ✅ FIXED

**Problem:** Floating comment bubbles use `whitespace-nowrap`, forcing all text on one line regardless of length.

**Root Cause:** `src/components/ui/AmbientSocialLayer.tsx` line 124 — `whitespace-nowrap` on comment span that includes `name: text` content.

**Impact:** Comments like "Muhammad Irfan: Semoga pernikahan kalian lancar dan bahagia selamanya" create a bubble wider than the viewport.

**Solution:** Replace `whitespace-nowrap` with `max-w-[280px] truncate` to cap bubble width.

---

### ~~5. WishesForm (Admin) — Wish Message Text Unprotected~~ ✅ FIXED

**Problem:** Wish message text displayed without truncation or line-clamp.

**Root Cause:** `src/components/admin/WishesForm.tsx` line 134 — `<p>` with no overflow handling, messages can be 300+ chars.

**Impact:** Long wish messages expand the card width, pushing the delete button off screen.

**Solution:** Add `line-clamp-2` to the message `<p>` element.

---

### ~~6. StoryInteractionsForm (Admin) — Comment Text Unprotected~~ ✅ FIXED

**Problem:** Story comment text displayed without truncation or line-clamp.

**Root Cause:** `src/components/admin/StoryInteractionsForm.tsx` line 181 — `<p>` with no overflow handling, comments can be 500+ chars.

**Impact:** Long comments expand the card, pushing siblings off-screen.

**Solution:** Add `line-clamp-2` to the comment text `<p>` element.

---

### ~~7. GuestQRCard — Couple Name Overflow on Fixed-Width Card~~ ✅ FIXED

**Problem:** Couple name on QR card rendered at `text-2xl` (full) / `text-lg` (compact) with no truncation.

**Root Cause:** `src/components/admin/GuestQRCard.tsx` line 90 — no `truncate`, `line-clamp`, or `max-w` on couple name inside fixed-width card (`w-[300px]`/`w-[220px]`).

**Impact:** Combined couple names > ~20 chars at `text-2xl` overflow the card boundary. Affects both single QR modal and bulk print.

**Solution:** Add `truncate` or `line-clamp-1` with `max-w` to the couple name element.

---

## Medium

### ~~8. CinematicOpening — Desktop Guest Name Without Overflow Protection~~ ✅ FIXED

**Problem:** Guest name on desktop opening screen rendered at `text-3xl` with no word-break or max-width.

**Root Cause:** `src/components/sections/CinematicOpening.tsx` line 152 — desktop guest name has no overflow handling. Mobile version (line 326) correctly has `max-w-[85vw] break-words`.

**Impact:** Guest names > ~30 chars at `text-3xl` can overflow horizontally on desktop.

**Solution:** Add `break-words max-w-[60vw]` matching the mobile pattern.

---

### ~~9. DigitalEnvelope — Account Number Overflow in Small Cards~~ ✅ FIXED

**Problem:** Account numbers rendered at `text-lg`/`text-xl` in 2-column grid cards without word-break.

**Root Cause:** `src/components/sections/DigitalEnvelope.tsx` lines 48, 95 — no `break-all` or `truncate` on account number spans.

**Impact:** Long account numbers (15-20 digits) at `text-xl` can overflow the small card boundary on mobile.

**Solution:** Add `break-all` to account number spans.

---

### ~~10. CoupleForm (Admin) — Error Message with Long URLs~~ ✅ FIXED

**Problem:** Validation error messages include raw user-input URLs with no word-break.

**Root Cause:** `src/components/admin/CoupleForm.tsx` line 308 — error `<p>` with `text-center` but no `break-words`, displays messages like `URL "https://very-long-url..." tidak valid`.

**Impact:** Long URLs in error messages overflow the form width.

**Solution:** Add `break-words` to the error message `<p>`.

---

### ~~11. GuestListTab (Admin) — Phone Number Without Truncation~~ ✅ FIXED

**Problem:** Guest phone number displayed without truncation in the guest list.

**Root Cause:** `src/components/admin/GuestListTab.tsx` line 396 — `<p>` with no `truncate`, inside `min-w-0` flex container.

**Impact:** International phone numbers (15-20+ chars) can push adjacent action buttons off-screen.

**Solution:** Add `truncate` to the phone `<p>` element.

---

### ~~12. GuestImportModal (Admin) — Phone Column in Preview Table~~ ✅ FIXED

**Problem:** Phone column in import preview table has no width constraint or truncation.

**Root Cause:** `src/components/admin/GuestImportModal.tsx` line 197 — `<td>` with no `truncate` or `max-w`.

**Impact:** Long phone numbers expand the table beyond its container.

**Solution:** Add `truncate max-w-[100px]` to the phone `<td>`.

---

## Low

### ~~13. RSVPSection — Wish Message Long Words~~ ✅ FIXED

**Problem:** Wish messages have `line-clamp-2` but no `break-words` — long single words (URLs, compound words) could overflow.

**Root Cause:** `src/components/sections/RSVPSection.tsx` lines 121, 228 — `line-clamp-2` present but no word-break handling.

**Impact:** Rare — only if wish message contains a very long word without spaces.

**Solution:** Add `break-words` alongside `line-clamp-2`.

---

### ~~14. TestimonialSection — Message Long Words~~ ✅ FIXED

**Problem:** Testimonial messages have `line-clamp-4` but no `break-words`.

**Root Cause:** `src/components/ui/TestimonialSection.tsx` line 157 — `line-clamp-4` present but no word-break.

**Impact:** Rare — only if testimonial contains a very long word without spaces.

**Solution:** Add `break-words` alongside `line-clamp-4`.

---

### ~~15. Footer — Credit Name in Tight Grid~~ ✅ FIXED

**Problem:** Credit name at `text-lg` in 2-column grid with no word-break.

**Root Cause:** `src/components/sections/Footer.tsx` line 58 — `<h3>` with no overflow handling in `grid-cols-2` layout.

**Impact:** Long credit names (30+ chars) could overflow the grid cell on mobile.

**Solution:** Add `break-words` to the credit name `<h3>`.

---

### ~~16. CinematicStory — Story Text Long Words~~ ✅ FIXED

**Problem:** Story text has `line-clamp-3` and `whitespace-pre-line` but no `break-words`.

**Root Cause:** `src/components/sections/CinematicStory.tsx` line 271 — long single words could overflow the `max-w-md` container.

**Impact:** Rare — story text is admin-controlled, unlikely to have unbreakable long words.

**Solution:** Add `break-words` to the story text `<p>`.

---

### ~~17. Super Admin — Accept Modal User Info Overflow~~ ✅ FIXED

**Problem:** Display name and email shown without overflow protection in accept/assign modals.

**Root Cause:** `src/app/admin/page.tsx` lines 705, 898 — `{acceptingUser.displayName} ({acceptingUser.email})` and `{assignUserTarget.displayName} ({assignUserTarget.email})` in `<p>` with no `break-words` or `truncate`.

**Impact:** Long display names or emails (e.g. "muhammad.daniansyah.chusyaidin@university.ac.id") overflow the `max-w-sm` modal.

**Solution:** Add `break-words` to the user info `<p>` elements.

---

### ~~18. Super Admin — Admin Email Badges Overflow~~ ✅ FIXED

**Problem:** Admin email displayed in inline-flex badges without truncation or max-width.

**Root Cause:** `src/app/admin/page.tsx` line 582 — `<span className="inline-flex items-center gap-1 text-[9px] text-ink/80 bg-ink/5 px-2 py-0.5 rounded-full">{email}</span>` with no `truncate` or `max-w`.

**Impact:** Long email addresses expand the badge and push the wedding card layout off-screen.

**Solution:** Add `truncate max-w-[160px]` to the email `<span>`.

---

### ~~19. Super Admin — ConfirmDeleteModal Dynamic Messages~~ ✅ FIXED

**Problem:** Delete confirmation modals receive dynamic messages containing emails/slugs with no word-break.

**Root Cause:** `src/app/admin/page.tsx` lines 787, 799, 805 — messages like `Hapus pengguna ${email}?` passed to ConfirmDeleteModal. The modal's message `<p>` in `src/components/admin/ConfirmDeleteModal.tsx` has no `break-words`.

**Impact:** Very long emails or slugs in delete confirmation messages overflow the modal width.

**Solution:** Add `break-words` to the message `<p>` in ConfirmDeleteModal.

---

### ~~20. GuestTab (Admin) — Greeting Template Preview URL Overflow~~ ✅ FIXED

**Problem:** Greeting template preview renders with `whitespace-pre-line` but no word-break, causing long URLs to overflow.

**Root Cause:** `src/components/admin/GuestTab.tsx` line 97 — `<p className="text-xs text-ink/80 whitespace-pre-line leading-relaxed">{previewText}</p>` where `previewText` contains `https://.../{slug}?to=...` URL that can be very long.

**Impact:** The preview URL line extends beyond the card boundary.

**Solution:** Add `break-words` alongside `whitespace-pre-line`.

---

### ~~21. ConfirmDeleteModal — Message Text Without Word Break~~ ✅ FIXED

**Problem:** Modal message `<p>` element has no `break-words` — any dynamic content (emails, slugs, names) can overflow.

**Root Cause:** `src/components/admin/ConfirmDeleteModal.tsx` — the `message` prop is rendered in a `<p>` with `text-xs text-ink/80 leading-relaxed` but no word-break class. Used across the entire admin panel for delete confirmations.

**Impact:** Any modal with a long email, slug, or name in the message overflows the `max-w-xs` modal boundary.

**Solution:** Add `break-words` to the message `<p>` in ConfirmDeleteModal.

---

### ~~22. Admin Header — Slug Display Without Truncation~~ ✅ FIXED

**Problem:** Wedding slug displayed in admin header without truncation.

**Root Cause:** `src/app/admin/[slug]/page.tsx` line 454 — `<p className="text-[10px] text-ink/80 truncate">/{slug}</p>`. Has `truncate` BUT is inside a flex row with other elements (logo, copy button, status badge, logout) that compress the available width.

**Impact:** On narrow mobile screens with many header elements, the slug text may still push the layout. Low risk since `truncate` is present.

**Solution:** Add `min-w-0` to the parent flex container if not already present.

---

### ~~23. CinematicOpening — Mobile Couple Nicknames Overflow with Decorative Font~~ ✅ FIXED

**Problem:** Couple nicknames on mobile opening screen use `font-dayland` at `text-5xl sm:text-7xl md:text-9xl` with no word-break or max-width.

**Root Cause:** `src/components/sections/CinematicOpening.tsx` lines 302, 308 — `<span className="block font-dayland text-5xl sm:text-7xl md:text-9xl text-ivory drop-shadow-2xl">` with no overflow handling. Decorative fonts are wider per character than standard fonts.

**Impact:** Nicknames > ~8 chars at `text-5xl` on 320px viewport overflow horizontally. Example: "Daniansyah" (10 chars) in Dayland font.

**Solution:** Add `break-words max-w-[95vw]` to the nickname `<span>` elements.

---

### ~~24. HeroSection — Mobile Couple Nicknames Overflow with Decorative Font~~ ✅ FIXED

**Problem:** Same as issue 23 but in HeroSection — nicknames at `text-5xl sm:text-7xl md:text-9xl` with no overflow protection.

**Root Cause:** `src/components/sections/HeroSection.tsx` lines 26, 32 — `font-dayland` spans with no `break-words` or `max-w`.

**Impact:** Long nicknames overflow the hero section on mobile.

**Solution:** Add `break-words max-w-[95vw] lg:max-w-full` to the nickname `<span>` elements.

---

### ~~25. HeroSection — eventCity with Extreme Letter Spacing~~ ✅ FIXED

**Problem:** City name displayed with `tracking-[0.6rem]` (9.6px letter-spacing) which multiplies text width significantly.

**Root Cause:** `src/components/sections/HeroSection.tsx` line 52 — `<p className="font-display italic text-xs tracking-[0.6rem] uppercase text-gold font-medium">{wedding?.eventCity} . Indonesia</p>`. "SURABAYA . INDONESIA" at 0.6rem tracking = ~320px wide, exactly viewport edge on small phones.

**Impact:** Cities with 10+ chars (e.g. "YOGYAKARTA . INDONESIA") overflow on 320px viewports.

**Solution:** Reduce tracking on mobile: `tracking-[0.3rem] sm:tracking-[0.6rem]`.

---

### ~~26. DigitalEnvelope — Bank Name with tracking-widest in Narrow Grid~~ ✅ FIXED

**Problem:** Bank name displayed with `tracking-widest` in a 2-column grid card (~140px per card on mobile).

**Root Cause:** `src/components/sections/DigitalEnvelope.tsx` lines 46, 94 — `<p className="text-[10px] uppercase tracking-widest text-gold/70 font-bold mb-1">{gift.bank}</p>`. "BANK CENTRAL ASIA" uppercase with widest tracking overflows the narrow card.

**Impact:** Bank names > ~10 chars with tracking overflow the card boundary.

**Solution:** Add `truncate` or reduce to `tracking-wide` on the bank name.

---

### ~~27. FloatingController — Music Label Overflow~~ ✅ FIXED

**Problem:** "Senyapkan Musik" (15 chars) with `tracking-[0.2em]` at `text-[8px]` overflows the floating button width.

**Root Cause:** `src/components/features/FloatingController.tsx` line 84 — `<span className="font-sans text-[8px] tracking-[0.2em] uppercase text-ink font-bold">{isPlaying ? 'Senyapkan Musik' : 'Putar Musik'}</span>` inside a small floating button (~70px wide).

**Impact:** "SENYAPKAN MUSIK" with tracking extends beyond the button boundary.

**Solution:** Add `truncate max-w-[70px]` or shorten to "Hentikan" / "Putar".

---

### ~~28. EventSection — Quran Arabic Text Overflow~~ ✅ FIXED

**Problem:** Quran Arabic text with RTL direction has no max-width constraint.

**Root Cause:** `src/components/sections/EventSection.tsx` lines 50, 110 — `<p className="font-serif text-sm leading-relaxed text-gold mb-1" dir="rtl">{wedding?.quranArabic}</p>`. Arabic text can be very long (full verse). Parent has `max-w-[300px]` on mobile but text itself has no `break-words`.

**Impact:** Very long Arabic verses without natural line breaks overflow the 300px container.

**Solution:** Add `break-words` to the Arabic text `<p>`.

---

### ~~29. EventSection — Quran Translation Overflow~~ ✅ FIXED

**Problem:** Quran translation text has no word-break protection.

**Root Cause:** `src/components/sections/EventSection.tsx` lines 51, 111 — `<p className="font-serif italic text-xs leading-relaxed text-ink/60 mt-1">"{wedding?.quranTranslation}"</p>`. Long translations (100+ chars) in parent `max-w-[300px]` on mobile.

**Impact:** Long single words in translation (e.g. compound Indonesian words) can overflow.

**Solution:** Add `break-words` to the translation `<p>`.

---

### ~~30. RSVPModal — Description Text at text-xl on Small Screens~~ ✅ FIXED

**Problem:** Modal description heading at `text-xl` without responsive sizing.

**Root Cause:** `src/components/features/RSVPModal.tsx` line 57 — `<h4 className="font-serif italic text-xl text-ink">` with long text "Setiap doa yang Anda titipkan akan kami simpan sebagai bagian dari perjalanan ini". On 320px screens with modal padding, this wraps excessively.

**Impact:** Text overflows or wraps awkwardly on very small viewports.

**Solution:** Use `text-lg sm:text-xl` for responsive sizing.

---

### ~~31. GuestListTab — Filter Buttons with Counts on Narrow Screens~~ ✅ FIXED

**Problem:** Filter buttons "Semua(500)", "Pria(250)", "Wanita(250)" with `tracking-wider` can overflow horizontally when all 3 are in a row.

**Root Cause:** `src/components/admin/GuestListTab.tsx` line 349 — three `whitespace-nowrap` buttons in a flex row with `gap-2`. Combined width at `text-[10px] tracking-wider` exceeds container on narrow admin panel (`max-w-lg`).

**Impact:** With 3-digit counts, buttons push past the container edge.

**Solution:** Add `overflow-x-auto` on the filter button row, or reduce tracking to `tracking-normal`.

---

### ~~32. SaveStatusModal — Upload Filename Overflow~~ ✅ FIXED

**Problem:** Upload filename displayed with `tracking-[0.2em]` in a narrow `max-w-xs` modal with no truncation.

**Root Cause:** `src/app/admin/[slug]/page.tsx` — `Mengunggah: ${uploadProgress.fileName}` at `text-[10px] uppercase tracking-[0.2em]` in 256px content area. Long filenames overflowed by 2-3×.

**Impact:** Filename text extended beyond the save status modal boundary.

**Solution:** Added `truncate` to the status text `<p>` element. Clips long filenames with ellipsis. Static status texts ("Harap tunggu sebentar", etc.) fit comfortably and are unaffected.

---

### ~~33. Login Page — Long Heading Without Responsive Sizing~~ ✅ FIXED

**Problem:** Login heading "Selamat Datang, Masuk dan Bagikan Kebahagiaan Momen Istimewa Kalian bersama Marinikah" at `text-xl` with no word-break.

**Root Cause:** `src/app/login/page.tsx` line 104 — `<h1 className="font-serif italic text-xl text-ink my-2">` with 80+ char heading and no `break-words` or responsive text sizing.

**Impact:** On 320px mobile screens, text wraps excessively and may overflow with serif italic rendering.

**Solution:** Add `break-words` and use `text-lg sm:text-xl`.

---

### ~~34. Register Page — Long Heading Without Responsive Sizing~~ ✅ FIXED

**Problem:** Same as issue 33 — register heading "Daftarkan diri dan Bagikan Kebahagiaan Momen Istimewa Kalian bersama Marinikah" at `text-xl`.

**Root Cause:** `src/app/register/page.tsx` line 137 — same pattern as login page.

**Impact:** Same overflow on 320px screens.

**Solution:** Add `break-words` and use `text-lg sm:text-xl`.

---

### ~~35. Login/Register — Error Messages Without Word Break~~ ✅ FIXED

**Problem:** Firebase auth error messages displayed without `break-words` — error strings from Firebase can contain long technical text.

**Root Cause:** `src/app/login/page.tsx` line 128, `src/app/register/page.tsx` line 153 — `<p className="text-sm text-red-500 text-center">{error}</p>` with no word-break.

**Impact:** Firebase error messages like "auth/too-many-requests" or custom long error strings overflow the form container.

**Solution:** Add `break-words` to the error `<p>` elements.

---

### ~~36. Landing Page — Feature Grid Titles Overflow in Narrow Columns~~ ✅ FIXED

**Problem:** Feature titles like "Musik latar yang menyatu dengan suasana" in `grid-cols-3` cells with no word-break.

**Root Cause:** `src/app/page.tsx` line 489-491 — `<span className="text-[10px] text-ink/70 leading-tight">{title}</span>` in grid cells ~100px wide on mobile. Titles are 30-40+ chars.

**Impact:** Long feature titles overflow their grid cell boundary on 320px viewport with `grid-cols-3`.

**Solution:** Add `break-words` to the title `<span>`.

---

### ~~37. Landing Page — Strength Section Titles Without Word Break~~ ✅ FIXED

**Problem:** Strength titles like "Galeri dengan layout aesthetic secara otomatis" at `text-md` without word-break.

**Root Cause:** `src/app/page.tsx` line 449 — `<p className="text-md font-serif font-semibold text-gold-contrast mb-0.5">{title}</p>` with no `break-words`. On mobile single-column layout this is usually fine, but on `lg:grid-cols-3` desktop the column width is constrained.

**Impact:** Very long titles may overflow the column on desktop 3-column grid.

**Solution:** Add `break-words` to the title `<p>`.

---

### ~~38. Landing Page — Copyright Text Without Word Break~~ ✅ FIXED

**Problem:** Footer copyright "© 2026 Marinikah Wedding Invitation" and "Build with Love by Marini & Dani" have no word-break.

**Root Cause:** `src/app/page.tsx` lines 697-700 — `<p className="text-[12px] text-ink/70">` and `<p className="text-[12px] text-ink/50 font-serif italic">` without `break-words`. While current text fits, if text is changed or translated, it could overflow.

**Impact:** Low — current text fits, but no safety net.

**Solution:** Add `break-words` as preventive measure.

---

### ~~39. CinematicOpening — eventCity with tracking-[0.4rem] on Both Layouts~~ ✅ FIXED

**Problem:** City name displayed with `tracking-[0.4rem]` (6.4px letter-spacing) on both desktop and mobile opening screens.

**Root Cause:** `src/components/sections/CinematicOpening.tsx` lines 113, 251 — `<span className="font-serif uppercase text-xs tracking-[0.4rem] text-gold">{wedding?.eventCity}</span>`. "YOGYAKARTA" (10 chars) × 6.4px extra = 64px additional width.

**Impact:** Long city names overflow the opening section on narrow viewports.

**Solution:** Reduce tracking on mobile: `tracking-[0.2rem] sm:tracking-[0.4rem]`.

---

### ~~40. CoupleSection — "PENGANTIN PRIA/WANITA" Labels with tracking-[0.5em]~~ ✅ FIXED

**Problem:** Section labels "PENGANTIN PRIA" and "PENGANTIN WANITA" with `tracking-[0.5em]` (8px per character) can reach 320px+ width, hitting viewport edge.

**Root Cause:** `src/components/sections/CoupleSection.tsx` lines 106, 125 — `<p className="text-xs uppercase tracking-[0.5em] text-gold-contrast mb-2 font-black">`. "PENGANTIN WANITA" = 16 chars × (12px font + 8px tracking) ≈ 320px — exactly the minimum viewport width.

**Impact:** On 320px screens, the label text touches or overflows the edge with no padding buffer.

**Solution:** Reduce tracking on mobile: `tracking-[0.3em] sm:tracking-[0.5em]`.

---

### ~~41. CinematicOpening — "Turut Mengundang" with tracking-[0.3rem]~~ ✅ FIXED

**Problem:** "TURUT MENGUNDANG" text with `tracking-[0.3rem]` on both mobile and desktop opening screens.

**Root Cause:** `src/components/sections/CinematicOpening.tsx` lines 149, 323 — `<p className="font-sans text-xs tracking-[0.3rem] uppercase text-gold/70 font-medium">Turut Mengundang</p>`. 16 chars × 4.8px extra = 77px additional width.

**Impact:** On narrow screens with side padding, the text may overflow.

**Solution:** Reduce tracking on mobile: `tracking-[0.15rem] sm:tracking-[0.3rem]`.

---

### ~~42. CinematicOpening — Desktop Guest Name No Overflow Protection~~ ✅ FIXED

**Problem:** Desktop guest name at `text-3xl` with no `max-w` or `break-words` — distinct from mobile which is protected.

**Root Cause:** `src/components/sections/CinematicOpening.tsx` line 152 — `<p className="font-display italic text-3xl text-ivory font-light">{guestName}</p>`. Mobile version (line 326) has `max-w-[85vw] break-words` but desktop has NOTHING.

**Impact:** Guest names > 30 chars overflow horizontally on desktop opening screen.

**Solution:** Add `max-w-[60vw] break-words` to the desktop guest name `<p>`.

---

### ~~43. TwibbonCreator — Section Heading and Instruction Text~~ ✅ FIXED

**Problem:** Twibbon section heading and instruction text without `break-words`.

**Root Cause:** `src/components/features/TwibbonCreator.tsx` — heading text and instruction paragraphs in the twibbon creator panel rendered without word-break handling.

**Impact:** On narrow screens, long instruction text could overflow the container.

**Solution:** Add `break-words` to heading and instruction text elements.

---

### ~~44. Admin Status Info Modal — Long Explanation Text~~ ✅ FIXED

**Problem:** Status info modal contains long explanatory paragraphs at `text-xs` with `leading-relaxed` but no `break-words`.

**Root Cause:** `src/app/admin/[slug]/page.tsx` lines 659, 667 — long sentences like "Undangan Anda sudah dipublikasikan dan dapat diakses oleh semua tamu melalui tautan yang telah dibagikan..." in `max-w-xs` modal.

**Impact:** Compound Indonesian words without natural break points could overflow the narrow modal.

**Solution:** Add `break-words` to the explanation `<p>` elements.

---

### ~~45. CinematicOpening — Desktop Couple Nicknames at text-8xl / text-9xl~~ ✅ FIXED

**Problem:** Desktop couple nicknames use `font-dayland text-8xl xl:text-9xl` (96px / 128px) — even moderately long nicknames can be hundreds of pixels wide.

**Root Cause:** `src/components/sections/CinematicOpening.tsx` lines 129, 135 — `<span className="block font-dayland text-8xl xl:text-9xl text-ivory drop-shadow-2xl">{wedding?.groomNickname}</span>`. At 128px font size, "Daniansyah" (10 chars) in decorative font could be 700-800px. Desktop left column is ~50% of viewport.

**Impact:** Nicknames > ~7-8 chars at `text-9xl` overflow the desktop left column. Decorative Dayland font has wider character metrics than standard fonts.

**Solution:** Add `break-words max-w-full` and consider `text-6xl xl:text-8xl` to reduce maximum size.

---

### ~~46. TwibbonCreator — "TWIBBON PERNIKAHAN KAMI" Heading with tracking-[0.4em]~~ ✅ FIXED

**Problem:** Section heading "TWIBBON PERNIKAHAN KAMI" (22 chars) with `tracking-[0.4em]` at `text-xs` = ~405px total width — overflows 320px mobile viewport.

**Root Cause:** `src/components/features/TwibbonCreator.tsx` line 322 — `<p className="text-xs uppercase tracking-[0.4em] text-gold font-black mb-2">Twibbon Pernikahan Kami</p>`. 22 chars × (12px + 6.4px) ≈ 405px.

**Impact:** Heading overflows on all mobile viewports below ~420px.

**Solution:** Reduce tracking on mobile: `tracking-[0.2em] sm:tracking-[0.4em]`, or shorten to "Twibbon Kami".

---

### ~~47. RSVPModal — "BERHALANGAN" Radio Label with tracking-widest in Narrow Modal~~ ✅ FIXED

**Problem:** Attendance radio button "BERHALANGAN" (11 chars) with `uppercase tracking-widest font-black` in `flex-1` columns inside modal.

**Root Cause:** `src/components/features/RSVPModal.tsx` line 88 — `<div className="...uppercase text-xs font-black tracking-widest...">Berhalangan</div>` in `flex-1` with sibling "Hadir". On 320px screens with modal padding, each flex-1 ≈ 130px but "BERHALANGAN" with tracking needs ~145px.

**Impact:** "BERHALANGAN" text clips or overflows its radio button box on small screens.

**Solution:** Reduce to `tracking-wider` or `tracking-wide` on the radio label divs.

---

### ~~48. RSVPSection — Wish Card Date/Time Text~~ ✅ FIXED

**Problem:** Wish creation date displayed using `formatDate` which outputs Indonesian locale strings — no truncation on the date text.

**Root Cause:** `src/components/sections/RSVPSection.tsx` — date text like "Minggu, 29 Agustus 2026 14:35" rendered in tight wish card layout alongside name and attendance badge. Combined width of name (max-w-[130px]) + badge ("Berhalangan") + date can overflow the card row.

**Impact:** On narrow screens with long attendance text + date, the flex row overflows.

**Solution:** Add `truncate` or `shrink-0` with max-width to the date text.

---

### ~~49. EventSection — Desktop Quran Arabic at text-base Without break-words~~ ✅ FIXED

**Problem:** Quran Arabic text on desktop rendered at `text-base` (larger than mobile `text-sm`) with no word-break, inside `max-w-md` column.

**Root Cause:** `src/components/sections/EventSection.tsx` line 110 — `<p className="font-serif text-base leading-relaxed text-gold mb-1" dir="rtl">{wedding?.quranArabic}</p>`. RTL Arabic text at `text-base` (16px) in `max-w-md` (448px) — very long verses will wrap but individual Arabic words with diacritics can be extremely wide.

**Impact:** Arabic words with full diacritics (harakat) can be wider than the container at text-base.

**Solution:** Add `break-words overflow-hidden` to the Arabic text element.

---

### ~~50. DigitalEnvelope — Description Text at max-w-[300px] on Small Screens~~ ✅ FIXED

**Problem:** Long description text "Kehadiran dan Doa Anda adalah hadiah terindah bagi kami..." in `max-w-[300px]` with `mx-auto` on 320px screen leaves only 10px margin each side — no padding buffer.

**Root Cause:** `src/components/sections/DigitalEnvelope.tsx` line 29 — `<p className="font-serif italic text-sm leading-relaxed text-ink/70 max-w-[300px] mx-auto mb-[3vh]">`. Parent has `px-6` (24px each side) giving 272px content area, but `max-w-[300px]` exceeds this.

**Impact:** The text overflows the padded container by 28px on 320px screens.

**Solution:** Change to `max-w-full sm:max-w-[300px]` to respect parent padding on small screens.

---

### ~~51. EventForm (Admin) — Date + Time 3-Column Row Overflow on Mobile~~ ✅ FIXED

**Problem:** Ceremony date, start time, and end time inputs in a 3-column `flex` row — native date input is wider than time inputs, pushing "Selesai" off-screen.

**Root Cause:** `src/components/admin/EventForm.tsx` — three `flex-1` columns where `<input type="date">` minimum intrinsic width (~150-170px) exceeded available space (~146px per column).

**Impact:** "Selesai" label and input cropped on mobile viewports.

**Solution:** Split into two rows — date input on its own full-width row, start/end time inputs on a second row with `flex gap-2`. Date gets full width (no more intrinsic width squeeze), time inputs share a row equally (~220px each).

---
