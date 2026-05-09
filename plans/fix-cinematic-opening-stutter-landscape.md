# Plan: Fix CinematicOpening Visual Stutter and Landscape Layout

## Objective
Fix two critical UX issues in the `CinematicOpening` component:
1. **Issue 1 (Visual Stutter):** Defer loader removal to ensure the component is painted before the fallback is destroyed.
2. **Issue 3 (Landscape Collision):** Refactor the flex layout to prevent content overlapping on short viewports (mobile landscape).

## Proposed Changes

### 1. `src/components/sections/CinematicOpening.tsx`
- **Visual Stutter Fix:**
    - Update `useEffect` to wrap `loader.remove()` in double `requestAnimationFrame` calls.
- **Landscape Layout Fix:**
    - Change the main content container from `justify-between` to `justify-center`.
    - Add responsive gaps (`gap-8 md:gap-12`) for better spacing control.
    - Remove fixed top padding (`pt-5`) on the name section.
    - Add `min-h-0` and `overflow-y-auto` (with `no-scrollbar`) to the container to handle extremely short screens gracefully.

## Verification Steps
### Manual Verification
1. **Visual Transition:** Refresh the page and verify that there is no dark flicker between the HTML loader and the Cinematic names.
2. **Landscape Viewport:** Using browser DevTools, switch to responsive mode and set height to ~350px. Verify that names and the button do not overlap and remain accessible.
3. **General Interaction:** Ensure scroll-down/swipe-up still triggers the opening correctly.

### Automated Tests
1. Run `npm run test src/components/sections/CinematicOpening.test.tsx` to ensure layout structure changes didn't break existing tests.
