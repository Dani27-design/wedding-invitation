# Deep Scan — Issues Round 5 (Final Polish)

> Fifth pass. The codebase is in strong shape after 42 fixes. These are final polish items and cleanup of AI Studio remnants.
> Priority: Mobile-first, must not break desktop.

---

## PERFORMANCE

---

### Issue #53 — Audio File URL Contains Spaces (May Cause Issues on Some Servers) [FIXED]

**Problem:**
The music file path contains spaces which may cause 404 errors on some hosting servers or CDN configurations.

**Root Cause:**
`App.tsx:1303` references `"/musics/Adele - Make You Feel My Love.mp3"`. While Vite dev server handles this fine, some production hosting (especially with strict URL encoding) may not resolve paths with unencoded spaces correctly.

**Impact:**
Music may fail to load on production hosting, causing the auto-play on "Buka Undangan" to silently fail. The `isPlaying` state would revert to `false` via the `.catch()` handler, but the user gets no music — a key emotional element of the invitation.

**Solution:**
Rename the file to remove spaces (e.g., `adele-make-you-feel-my-love.mp3`) and update the `src` reference.

---

### Issue #54 — `@` Alias in Vite Config Points to Project Root (Not `src`) [FIXED]

**Problem:**
The `@` path alias resolves to the project root directory instead of `src/`.

**Root Cause:**
`vite.config.ts:11` sets `'@': path.resolve(__dirname, '.')` — this maps `@` to the project root. While this technically works, it's unconventional (most projects map `@` to `src/`) and the alias is never actually used in any import statement.

**Impact:**
No functional impact since no file uses `@/` imports. But if someone adds `import X from '@/components/Y'`, they'd get the project root instead of `src/` — a confusing deviation from convention.

**Solution:**
Either change to `'@': path.resolve(__dirname, 'src')` for convention, or remove the alias entirely since it's unused.

---

## FUNCTIONALITY

---

### Issue #55 — `metadata.json` Is an AI Studio Remnant [FIXED]

**Problem:**
The `metadata.json` file at the project root is an AI Studio artifact with no purpose in the wedding app.

**Root Cause:**
`metadata.json` contains `"name": "Remix: dani & marini - A Celestial Union"` and AI Studio-specific fields (`requestFramePermissions`, `majorCapabilities`). It was part of the AI Studio export and is not referenced by any code, config, or build process.

**Impact:**
No functional impact. It adds confusion for anyone browsing the project — it looks like a config file but does nothing. The AI Studio app URL referenced in `README.md` may also confuse contributors.

**Solution:**
Delete `metadata.json`.

---

### Issue #56 — `README.md` Still References AI Studio and Gemini API [FIXED]

**Problem:**
The README contains outdated AI Studio instructions including a link to view the app in AI Studio and steps to set a `GEMINI_API_KEY`.

**Root Cause:**
`README.md` was never updated after the AI Studio export. It references `.env.local` for `GEMINI_API_KEY` (which was removed in Issue #50) and links to an AI Studio URL.

**Impact:**
Anyone who reads the README gets incorrect setup instructions. Step 2 ("Set the GEMINI_API_KEY") is confusing since the key is no longer needed and `.env.example` no longer exists.

**Solution:**
Replace the README content with accurate instructions reflecting the current project (just `npm install` + `npm run dev`).

---

### Issue #57 — Vite Config Has AI Studio Comment and Unnecessary HMR Check [FIXED]

**Problem:**
The Vite config contains an AI Studio-specific comment and an HMR disable check that's irrelevant for the wedding app.

**Root Cause:**
`vite.config.ts:15-17` has a comment about AI Studio and a `DISABLE_HMR` env var check. This was part of the AI Studio runtime environment and has no meaning in the standalone project.

**Impact:**
No functional impact — `DISABLE_HMR` is never set, so `hmr` stays `true` (default behavior). But the comment and check are confusing dead code.

**Solution:**
Remove the `server` block entirely from vite.config.ts (HMR defaults to enabled).

---

### Issue #58 — RSVP Form Does Not Validate Message Length [FIXED]

**Problem:**
The RSVP form's message textarea has no `maxLength` constraint, allowing users to submit extremely long wishes.

**Root Cause:**
`App.tsx:2071-2074` — the RSVP textarea has `required` and `rows={3}` but no `maxLength`. The story comment input was fixed with `maxLength={100}` (Issue #48), but the RSVP form was not addressed since it was a different input.

**Impact:**
A very long wish message (1000+ characters) would overflow the compact wish card layout (`line-clamp-2` helps visually, but the full message is still stored). More importantly, the height-based pagination logic (30 chars/line estimate) would be inaccurate for extremely long messages.

**Solution:**
Add `maxLength={200}` to the RSVP message textarea — generous enough for a heartfelt wish, short enough to keep cards compact.

---

## SEO / META

---

### Issue #59 — `package.json` Version is "0.0.0" [FIXED]

**Problem:**
The package version is still the default placeholder.

**Root Cause:**
`package.json:4` has `"version": "0.0.0"` from the AI Studio template.

**Impact:**
No functional impact for a non-published package. But it shows up in build output and error logs. Setting a meaningful version (e.g., `"1.0.0"`) signals the project is production-ready.

**Solution:**
Change to `"version": "1.0.0"`.

---

## RESPONSIVE DESIGN

---

### Issue #60 — Hero Date Text Can Be Large on Small Phones [FIXED]

**Problem:**
The wedding date "Sabtu, 29 Agustus 2026" in the hero section uses `text-3xl` on mobile which can be tight on narrow screens.

**Root Cause:**
`App.tsx:1603` uses `font-display italic text-3xl md:text-5xl` for the date. On phones narrower than 360px, `text-3xl` (1.875rem / 30px) for a string this long may cause tight wrapping.

**Impact:**
On iPhone SE or similarly narrow phones, the date line may wrap awkwardly after "Agustus" with "2026" on a separate line, breaking the centered elegance.

**Solution:**
Change to `text-2xl sm:text-3xl md:text-5xl` — same pattern used for the couple names fix (Issue #24).
