# Known Issues

> **Open issues: 0** | Last re-audited: 2026-05-17 (post-fix verification)
>
> All 46 issues from three audit rounds (wedding page, admin technical, UX operational) have been resolved. Re-audit confirms fixes are genuine and working. No new issues found at actionable severity.

---

## Audit Verification Summary

**Re-audit rating: 8.7/10 overall**

| Area | Rating | Status |
|------|--------|--------|
| Admin page (tabs, progress, modals) | 8.5/10 | All fixes verified working |
| Login page (pending messaging, password reset) | 9/10 | Excellent |
| Register page (timeline, guidance) | 8.5/10 | Clear and helpful |
| Couple form (social links layout) | 9.5/10 | Stacked + placeholders excellent |
| Story form (collapsible slides) | 9/10 | Reduces cognitive load |
| Customize form (color preview) | 9.5/10 | Live swatch works perfectly |
| Media form (descriptions) | 9/10 | Purpose of each field clear |
| Gallery form (reorder) | 7.5/10 | Functional, minor polish opportunity |
| Event form (default guest) | 9/10 | Non-technical placeholder |

---

## Polish Notes (non-blocking, cosmetic)

These are minor refinements that could further improve the experience but are NOT production blockers:

1. **Gallery reorder buttons are at minimum tap size (28px)** — could increase to 32px for easier mobile use
2. **Gallery helper text is subtle** (`text-[9px] text-ink/30`) — could be slightly larger/darker for discoverability
3. **Register password requirements** only shown in placeholder — could also show as helper text below input
4. **Admin preview link** is icon-only (ExternalLink) — a text label "Preview" might be clearer for first-time users

---

## Production Readiness Verdict

The platform is **production-ready** for real paying customers:

- Non-technical wedding couples can operate the admin panel comfortably
- Progress indicators prevent confusion about completion status
- Confirmation modals prevent destructive accidents
- Upload progress provides reassurance during large file uploads
- Pending approval flow provides clear timeline and expectations
- Color preview gives instant visual feedback
- Collapsible story slides reduce mobile scroll fatigue
- Platform-specific social link placeholders guide correct data entry
- Status toggle is safely guarded with contextual explanation
- Auto-dismiss success modal eliminates unnecessary clicks

### What's working well:
- Visual design consistently premium (gold/ivory/serif aesthetic)
- Indonesian language natural and consistent throughout
- ARIA accessibility on tabs and forms
- Mobile scroll indicator on tab bar
- beforeunload protection for unsaved changes
- Resumable upload with progress feedback
- Per-wedding storage authorization (Firestore cross-reference)
- ISR revalidation after admin saves
- Filtered Firestore queries for super admin scalability
