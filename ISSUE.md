# Issue Tracker — Open Issues

> Remaining issues from the original deep scan. All fixed/won't-fix issues have been resolved and removed.

---

## Issue #1 — No Data Persistence (Wishes Lost on Refresh)

**Root Cause:**
`App.tsx` stores wishes in `useState` initialized from `SEED_WISHES`. New submissions via `handleRSVPSubmit` prepend to this array, but the state is never persisted to any storage. On page refresh, all user-submitted wishes are lost and the seed data reloads.

**Impact:**
Every guest's wish disappears after the page is refreshed or reopened. The RSVP feature is effectively decorative — no real guest data is ever collected. This defeats the purpose of the RSVP & Wishes section for the actual wedding.

**Solution:**
Integrate a backend or serverless database (Firebase Firestore, Supabase, or a simple API) to persist wishes. Alternatively, use `localStorage` as a lightweight client-side fallback for demo purposes.

---

## Issue #4 — Bank Account Numbers Are Still Placeholders

**Root Cause:**
`constants/wedding.ts` contains placeholder account numbers: `1234567890`, `0987654321`, `111222333444`, `777888999000`, `08123456789`, `08987654321`. These were never replaced with real values.

**Impact:**
Guests who try to transfer money will send funds to non-existent accounts or someone else's accounts. This is the most critical content issue — it directly affects the couple's ability to receive gifts.

**Solution:**
Replace all 6 account numbers with the real bank account and e-wallet numbers for Dani and Marini.

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
Both `CinematicOpening.tsx` and `HeroSection.tsx` render `bride_and_groom_full_body_potrait.jpeg`. When the opening fades out to reveal the hero, the same photo appears — creating a jarring visual stutter rather than a cinematic transition.

**Impact:**
The transition from opening to hero feels like a glitch rather than a reveal. Users may think the page is stuck or loading incorrectly. The emotional impact of the cinematic opening is diminished.

**Solution:**
Use a different image for the hero section (e.g., `bride_and_groom_half_body_potrait.png` or a close-up) to create visual progression from the opening.
