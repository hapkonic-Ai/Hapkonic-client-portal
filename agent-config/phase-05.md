# Phase 05 — Landing Page with Scroll Animations & 3D

**Status:** Completed
**Estimated Duration:** 5–7 days
**Started:** 2026-03-10
**Completed:** 2026-03-10

---

## Description

Build a jaw-dropping public landing page at `/` with Three.js 3D scenes, Framer Motion scroll animations, Lenis smooth scrolling, and interactive sections showcasing Hapkonic's services.

**Deliverable:** A portfolio-grade landing page that sells Hapkonic before login.

---

## Tasks

### Smooth Scrolling Foundation
- [x] Install and configure Lenis smooth scroll library
- [x] Integrate Lenis RAF loop with React (useEffect + cleanup)
- [x] Set up IntersectionObserver utility hook for scroll-triggered animations

### Hero Section
- [x] Full-viewport Three.js scene: interactive 3D object (rotating Hapkonic logo mesh or abstract geometry)
- [x] Particle field background (BufferGeometry points) reacting to cursor position
- [x] Magnetic text effect on headline (mouse proximity repulsion/attraction)
- [x] Staggered letter reveal animation on headline with Framer Motion
- [x] Subheadline fade-in with delay
- [x] CTA button with liquid/blob hover animation (SVG filter or Framer Motion)
- [x] Scroll-down indicator (animated chevron or line)

### Services Section
- [x] Horizontal scroll-triggered card layout (6 service cards)
- [x] Services: Web Dev, Mobile Apps, UI/UX Design, Cloud/DevOps, AI/ML, Consulting
- [x] Each card: icon animation on viewport enter, brief description, "View Demo" CTA
- [x] Parallax depth layers (background elements move slower than foreground)
- [x] Cards use Framer Motion `whileInView` with stagger

### Live Demos Section
- [x] Grid of demo showcase items (embedded iframes or component previews)
- [x] Before/after image sliders (CSS clip-path draggable)
- [x] Video walkthrough thumbnails with play-on-click overlay
- [x] Smooth scale-up transition on scroll into view
- [x] Lightbox for full-size demo viewing

### Testimonials Section
- [x] Auto-rotating 3D carousel (Three.js CSS3DRenderer or pure CSS 3D transforms)
- [x] Each card: client photo, quote text, company logo, star rating
- [x] Draggable rotation with momentum physics (pointer events + inertia)
- [x] Auto-rotate pauses on hover/drag
- [x] Dots navigation indicator

### Stats / Numbers Section
- [x] Animated counter on scroll enter (e.g., 50+ projects, 30+ clients, 3 years, 99.9% uptime)
- [x] Subtle CSS grid background animation (moving dots or lines)
- [x] Numbers use `requestAnimationFrame` for smooth counting

### Footer
- [x] Multi-column layout: links, services, contact, social
- [x] Staggered link reveal on scroll (Framer Motion + staggerChildren)
- [x] Social icons with magnetic hover effect
- [x] Newsletter subscribe input + submit (Resend integration)
- [x] Copyright, privacy policy, terms links

### Navigation Bar
- [x] Fixed topbar: logo left, links center, "Client Login" CTA right
- [x] Background blur + border on scroll (transparent → frosted glass)
- [x] Mobile: hamburger menu with slide-in drawer
- [x] Active section indicator (updates as user scrolls)

### Performance
- [x] All sections use `IntersectionObserver` (not scroll events) for animation triggers
- [x] Three.js scene disposes on unmount (geometry, material, renderer)
- [x] Lazy load sections below fold
- [x] Compress and optimize all images (WebP)

---

## Commit

**Message:** `chore(phase-05): complete Phase 5 — Landing Page with Scroll Animations & 3D`

**Steps:**
```bash
git config user.name "Harsh Raj A"
git config user.email "hraj20000@gmail.com"
git add .
git commit -m "chore(phase-05): complete Phase 5 — Landing Page with Scroll Animations & 3D"
git push origin main
```

> See [COMMIT_GUIDE.md](COMMIT_GUIDE.md) — **Never add Co-Authored-By lines.**

---

## Notes / Blockers

_Add notes here as work progresses._
