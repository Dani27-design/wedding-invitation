# Deep Scan — Issues Round 2

> Comprehensive scan covering: Performance, Functionality, Responsive Design, SEO, and Accessibility.
> Priority: Mobile-first, must not break desktop.

---

## PERFORMANCE

---

### Issue #12 — No Image Lazy Loading [FIXED]

**Problem:**
All images load immediately on page mount, including below-the-fold images in the gallery, story, and couple sections.

**Root Cause:**
None of the `<img>` tags use `loading="lazy"` or `fetchpriority`. The gallery alone has 12 images, the story has 6 background images, and other sections add more — all fetched on initial load.

**Impact:**
On mobile with slow connections (common in Indonesia), the initial page load is significantly delayed. Users see the cinematic opening while ~20+ images download in the background. This wastes bandwidth for images users may never scroll to.

**Solution:**
Add `loading="lazy"` to all images below the fold (gallery, story, couple section, twibbon placeholder). Keep `loading="eager"` or `fetchpriority="high"` only on the opening background image and hero image, which are immediately visible.

---

### Issue #13 — External Texture Dependencies (Render-Blocking / Fragile) [FIXED]

**Problem:**
The film grain and floral shadow effects depend on images hosted on `transparenttextures.com` — an external third-party server.

**Root Cause:**
`App.tsx:129` loads `https://www.transparenttextures.com/patterns/p6.png` for the film grain overlay, and `App.tsx:133` loads `https://www.transparenttextures.com/patterns/stardust.png` for the floral shadow. These are fixed-position elements rendered on every page.

**Impact:**
If `transparenttextures.com` is slow or down, the film grain and floral effects silently fail — the page looks subtly different. On mobile, these external requests add latency to the initial render. It also means the app cannot work fully offline.

**Solution:**
Download both PNG textures and save them to `/public`. Reference them as local paths (`/patterns/p6.png`, `/patterns/stardust.png`). This eliminates the external dependency, improves load time, and enables offline use.

---

### Issue #14 — Six AmbientSocialLayer Instances Running Simultaneously [FIXED]

**Problem:**
The CinematicStory section creates 6 independent `AmbientSocialLayer` components (one per slide), each running its own `setInterval` every 4 seconds and maintaining its own element state.

**Root Cause:**
`App.tsx:987-991` — inside the `slides.map()`, every slide renders its own `<AmbientSocialLayer />`. Even slides that are off-screen (scrolled away) keep spawning hearts and comments, running animations, and growing their element arrays.

**Impact:**
On low-end mobile devices, 6 concurrent intervals + 6 sets of animated Motion elements (up to 20 each = 120 animated DOM nodes) cause unnecessary CPU and memory usage. Users viewing slide 1 don't benefit from animations on slides 2-5.

**Solution:**
Track the currently visible slide index and only render `AmbientSocialLayer` for the active slide. Use an `IntersectionObserver` or scroll position to determine visibility, and conditionally render the component.

---

### Issue #15 — Unused Lucide Icon Imports [FIXED]

**Problem:**
Multiple Lucide icons are imported but never used in any JSX or logic.

**Root Cause:**
`App.tsx:8-22` imports `Music`, `Copy`, `Send`, `ChevronDown`, `Download`, `Upload`, `Plus`, `Minus` — none of which appear in the rendered output or any function.

**Impact:**
These unused imports increase the JavaScript bundle size. While tree-shaking may remove some, not all bundler configurations guarantee this. The imports also add code noise.

**Solution:**
Remove the unused imports: `Music`, `Copy`, `Send`, `ChevronDown`, `Download`, `Upload`, `Plus`, `Minus`.

---

### Issue #16 — Unused Type Declaration `AspRatio` [FIXED]

**Problem:**
A type alias is declared but never used.

**Root Cause:**
`App.tsx:227` declares `type AspRatio = '4:5' | '9:16' | '16:9'` but it is never referenced in any variable, parameter, or function.

**Impact:**
Dead code. No functional impact, but adds confusion.

**Solution:**
Remove the unused type declaration.

---

### Issue #17 — Font Loading Blocks Render (Two External Font CDNs) [FIXED]

**Problem:**
Two CSS `@import` statements at the top of `index.css` block rendering until fonts are downloaded from two separate CDNs.

**Root Cause:**
`index.css:1-2` imports from `fonts.googleapis.com` (6 font families) and `fonts.cdnfonts.com` (Dayland). CSS `@import` is render-blocking — the browser cannot paint text until these complete.

**Impact:**
On mobile, users may see a blank screen or FOIT (Flash of Invisible Text) for 1-3 seconds while fonts download. This is the first thing that happens before the cinematic opening even appears. Two separate CDN round-trips compound the delay.

**Solution:**
Move font loading to `<link rel="preload">` or `<link rel="stylesheet">` tags in `index.html` with `font-display: swap` to allow fallback text rendering while fonts load. Consider self-hosting the Dayland font to reduce CDN dependencies.

---

## FUNCTIONALITY

---

### Issue #18 — Undefined CSS Classes `animate-soft-zoom` and `bubble-glow` [FIXED]

**Problem:**
Two CSS class names are used in the JSX but are never defined in `index.css` or anywhere else.

**Root Cause:**
- `App.tsx:1278` uses `animate-soft-zoom` on the opening background image
- `App.tsx:1900,1916` use `bubble-glow` on the pagination buttons

Neither class is defined in `index.css`, Tailwind's default utilities, or any other stylesheet.

**Impact:**
`animate-soft-zoom` — the opening background image is missing its intended zoom animation. The Motion `animate` prop on the parent partially covers this, but the CSS animation may have been intended for a different effect.
`bubble-glow` — the pagination buttons have no glow effect. Purely visual, no functional break.

**Solution:**
Either add the CSS keyframe definitions to `index.css` for both classes, or remove the class names from the elements if they are no longer needed.

---

### Issue #19 — CinematicStory Scroll Hint Says "Scroll to reveal" in English [FIXED]

**Problem:**
All UI text is in Indonesian (Bahasa Indonesia), but the story section scroll hint is in English.

**Root Cause:**
`App.tsx:1115` renders `"Scroll to reveal"` — this was likely left from the original AI Studio export and not translated.

**Impact:**
Inconsistent language experience for Indonesian guests. Minor but noticeable on desktop where the scroll hint is visible.

**Solution:**
Translate to Indonesian, e.g. `"Geser untuk melihat"` or `"Usap untuk lanjut"`.

---

### Issue #20 — Social Links in Footer Point to `#` [FIXED]

**Problem:**
All four social media links (2x Instagram, 1x Twitter, 1x Facebook) navigate to `#` — scrolling to the top of the page instead of opening a social profile.

**Root Cause:**
`App.tsx:2218-2219` (Dani) and `App.tsx:2233-2234` (Marini) use `href="#"` as placeholder values.

**Impact:**
On mobile, tapping a social icon scrolls the page to the top, which is disorienting. Users expect to open an external profile. This also registers as a navigation event in analytics.

**Solution:**
Replace with real social media URLs, or remove the social link buttons entirely until real URLs are available.

---

### Issue #21 — Photo Zoom Modal Close Button Uses Camera Icon Instead of X/Close [FIXED]

**Problem:**
The photo zoom modal's close button shows a Camera icon, which doesn't communicate "close" to users.

**Root Cause:**
`App.tsx:2277` uses `<Camera />` as the close button icon instead of `<X />` or a cross icon.

**Impact:**
On mobile, users may not realize the Camera icon means "close". They might tap the backdrop to close (which works), but the button itself is confusing. This is a UX clarity issue.

**Solution:**
Replace `<Camera />` with `<X />` in the close button, matching the pattern used in the RSVP modal close button.

---

## SEO

---

### Issue #22 — No Open Graph / Social Media Meta Tags [FIXED]

**Problem:**
When the invitation link is shared via WhatsApp, LINE, Telegram, Instagram, or Facebook, it shows no preview image, no description, and a plain title.

**Root Cause:**
`index.html` has no Open Graph (`og:`) or Twitter Card meta tags. Only `<title>` and `<meta name="viewport">` exist.

**Impact:**
This is critical for a wedding invitation — guests will receive the link via WhatsApp, which is the primary distribution channel. Without OG tags, the shared link looks generic and unprofessional. No preview image means lower click-through rates.

**Solution:**
Add to `index.html`:
- `og:title` — "Wedding Dani & Marini - 29 Agustus 2026"
- `og:description` — Indonesian invitation teaser text
- `og:image` — couple's photo (absolute URL to hosted image)
- `og:type` — "website"
- `og:url` — the invitation URL
- `twitter:card` — "summary_large_image"
- `meta name="description"` — same as og:description

---

### Issue #23 — HTML `lang` Attribute is `en` Instead of `id` [FIXED]

**Problem:**
The page declares itself as English but all content is in Indonesian.

**Root Cause:**
`index.html:2` has `<html lang="en">`. This was the default from the AI Studio export.

**Impact:**
Screen readers will attempt to read Indonesian text with English pronunciation rules. Search engines may index the page as English content. Browser translation features may incorrectly offer to translate an already-Indonesian page.

**Solution:**
Change `lang="en"` to `lang="id"` for Indonesian.

---

## RESPONSIVE DESIGN

---

### Issue #24 — Couple Name Text Overflows on Small Mobile Screens [FIXED]

**Problem:**
The full names "M. Daniansyah Chusyaidin, S.Kom" and "Siti Nur Marini, A.Md.M" can overflow or be very cramped on narrow screens (< 360px).

**Root Cause:**
`App.tsx:1657,1669` — the names use `font-serif text-3xl` with `tracking-tighter`. On screens narrower than 360px (older Android phones, SE-sized iPhones), the long names with academic titles don't have enough horizontal space.

**Impact:**
On small mobile screens, the text may wrap awkwardly across 3+ lines, breaking the elegant layout. The `tracking-tighter` helps but isn't enough for 30+ character names at `text-3xl`.

**Solution:**
Add a smaller font size breakpoint for very small screens, e.g. `text-2xl sm:text-3xl md:text-5xl`, or allow the names to scale with `clamp()`.

---

### Issue #25 — Digital Envelope Grid Layout Breaks on Small Mobile [FIXED]

**Problem:**
The 2-column grid of 6 payment cards can be too tight on narrow mobile screens, with account numbers getting truncated.

**Root Cause:**
`App.tsx:2056` uses `grid-cols-2 lg:grid-cols-3`. On a 320px-wide phone with px-6 (24px each side), each card gets only ~136px width. Long account numbers like "111222333444" in `font-serif text-lg` overflow or feel cramped.

**Impact:**
On small phones, account numbers may be hard to read and the cards feel cluttered. The "Salin" copy button and account holder name compete for space.

**Solution:**
Switch to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` so single-column layout is used on the smallest screens, or reduce the font size of account numbers on mobile.

---

### Issue #26 — RSVP Modal Not Safe on Short Mobile Viewports (Landscape / Notched Phones) [FIXED]

**Problem:**
The RSVP modal can overflow the viewport on landscape mobile or phones with large notches/navigation bars.

**Root Cause:**
`App.tsx:1946` — the modal uses `rounded-[2.5rem]` with `p-6` padding, and the form has `space-y-6` between fields. The total height (header + 3 form fields + button + padding + border-radius) can exceed the available viewport height on landscape phones or phones with large system UI.

**Impact:**
On landscape mobile or short viewports, the submit button may be cut off below the visible area with no way to scroll to it. The `py-6` outer container padding helps but doesn't guarantee the modal is fully visible.

**Solution:**
Add `max-h-[90vh] overflow-y-auto` to the modal content container so it becomes scrollable when it exceeds the viewport height.

---

### Issue #27 — Story Section Has No Swipe Indicator on Mobile [FIXED]

**Problem:**
The CinematicStory section relies on horizontal scrolling but has no visual cue for mobile users to swipe left.

**Root Cause:**
The scroll hint at `App.tsx:1108-1117` only shows on desktop (`invisible md:visible`) and says "Scroll to reveal". On mobile, there's only the dot pagination at the bottom, which shows position but doesn't suggest swiping.

**Impact:**
Mobile users may not realize the story section is swipeable. They might think it's a single static slide and scroll past it vertically. This means they miss 5 out of 6 story chapters — a significant content loss for a key emotional section.

**Solution:**
Add a mobile-visible swipe hint on the first slide, such as a brief animated arrow or text like "Geser" that fades after a few seconds or after the first swipe.

---

## ACCESSIBILITY

---

### Issue #28 — No `aria-label` on Any Interactive Button [FIXED]

**Problem:**
None of the icon-only buttons (floating controller, like, comment, pagination, copy, music toggle, gallery zoom close) have accessible labels.

**Root Cause:**
All icon buttons use only visual icons (Lucide components) with no `aria-label`, `aria-labelledby`, or screen-reader-only text. The floating controller heart button, story like/comment buttons, pagination arrows, and zoom close button are all unlabeled.

**Impact:**
Screen reader users cannot understand what any button does. They hear "button" with no description. While this wedding invitation is primarily visual, accessibility is a legal and ethical consideration, and some guests may use assistive technology.

**Solution:**
Add `aria-label` to all icon-only buttons. Examples: `aria-label="Buka menu"`, `aria-label="Suka"`, `aria-label="Komentar"`, `aria-label="Halaman sebelumnya"`, `aria-label="Tutup"`, `aria-label="Salin nomor rekening"`.

---

### Issue #29 — No `prefers-reduced-motion` Support [FIXED]

**Problem:**
The app has 30+ continuously running animations with no way to disable them.

**Root Cause:**
No `@media (prefers-reduced-motion: reduce)` query in CSS, and no check for reduced motion preference in the Motion components. The film grain, floating petals, blob morphing, light sweep, shadow drift, ambient social elements, countdown bounce, and rotating rings all run continuously.

**Impact:**
Users with vestibular disorders or motion sensitivity may experience nausea or discomfort. On mobile, this also contributes to battery drain. Some users enable reduced-motion at the OS level expecting apps to respect it.

**Solution:**
Add a CSS media query to disable/reduce keyframe animations:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
And pass `{ reducedMotion: "user" }` to Motion's `LazyMotion` or check `window.matchMedia('(prefers-reduced-motion: reduce)')` to conditionally disable Motion animations.
