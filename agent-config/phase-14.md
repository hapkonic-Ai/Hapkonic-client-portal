# Phase 14 — Mobile Responsiveness & PWA

**Status:** Not Started
**Estimated Duration:** 4–5 days
**Started:** —
**Completed:** —

---

## Description

Redesign every page to be mobile-first, replace sidebar with bottom tab nav on mobile, add touch gestures, implement PWA offline support with service worker caching, and target Lighthouse > 90 across all categories.

**Deliverable:** Fully responsive, installable PWA that works beautifully on every screen size.

---

## Tasks

### Mobile-First Responsive Redesign
- [ ] Audit every page for responsiveness (use browser DevTools mobile emulation)
- [ ] Dashboard: stack cards vertically, reduce padding
- [ ] Documents: switch to single-column list on mobile, full-screen viewer
- [ ] Meetings: calendar grid → vertical list on mobile
- [ ] Progress tracker: radial ring scales down, breakdown cards stack
- [ ] Milestone timeline: single-column vertical stack (remove left-right alternation)
- [ ] Gantt chart: horizontal scroll with pinch-to-zoom gesture
- [ ] Admin portal: tables become card stacks on mobile, side drawer becomes bottom sheet
- [ ] Login page: hide 3D panel, full-screen form

### Bottom Tab Navigation (Mobile)
- [ ] Replace sidebar with fixed bottom tab bar on screens < 768px
- [ ] Tabs: Dashboard, Documents, Roadmap, Progress, More (overflow menu)
- [ ] Active tab indicator with smooth transition
- [ ] Safe area insets support (iOS notch/home indicator)

### Touch Optimizations
- [ ] All tap targets minimum 44×44px
- [ ] Swipe gestures: swipe left/right to navigate between sections
- [ ] Pull-to-refresh on dashboard, documents, notifications lists
- [ ] Long-press context menus (alternative to right-click hover menus)
- [ ] Disable hover-only interactions (replace with tap)

### Service Worker & Offline Caching
- [ ] Register `service-worker.js` in app entry point
- [ ] Cache-first strategy for static assets (CSS, JS bundles, fonts, icons)
- [ ] Network-first strategy for API requests (fall back to cached response)
- [ ] Cache last-viewed: dashboard data, documents list, upcoming meetings
- [ ] Offline fallback page: shows cached data with "You're offline" banner
- [ ] Background sync: queue failed API requests and retry when online

### PWA Manifest & Install
- [ ] Create `manifest.json`: name, short_name, icons (192×192, 512×512), theme_color, background_color, display: standalone
- [ ] Hapkonic branded icons in all required sizes
- [ ] Splash screen configuration (iOS + Android)
- [ ] "Add to Home Screen" prompt trigger (beforeinstallprompt event)
- [ ] Custom install banner/modal with Hapkonic branding

### Performance Targets
- [ ] Lazy-load all routes with `React.lazy` + `Suspense` + skeleton fallbacks
- [ ] Optimize all images: convert to WebP, use `srcset` for responsive sizes
- [ ] Skeleton loading states for every data-fetching component
- [ ] Code splitting: vendor chunks, route chunks
- [ ] Run Lighthouse audit — target: Performance > 90, Accessibility > 90, Best Practices > 90, SEO > 90
- [ ] Fix all Lighthouse findings

---

## Commit

**Message:** `chore(phase-14): complete Phase 14 — Mobile Responsiveness & PWA`

**Steps:**
```bash
git config user.name "Harsh Raj A"
git config user.email "hraj20000@gmail.com"
git add .
git commit -m "chore(phase-14): complete Phase 14 — Mobile Responsiveness & PWA"
git push origin main
```

> See [COMMIT_GUIDE.md](COMMIT_GUIDE.md) — **Never add Co-Authored-By lines.**

---

## Notes / Blockers

_Add notes here as work progresses._
