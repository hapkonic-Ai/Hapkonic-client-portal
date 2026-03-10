# Phase 05 — Landing Page with Scroll Animations & 3D

**Status:** Not Started
**Estimated Duration:** 5–7 days
**Started:** —
**Completed:** —

---

## Description

Build a jaw-dropping public landing page at `/` with Three.js 3D scenes, Framer Motion scroll animations, Lenis smooth scrolling, and interactive sections showcasing Hapkonic's services.

**Deliverable:** A portfolio-grade landing page that sells Hapkonic before login.

---

## Tasks

### Smooth Scrolling Foundation
- [ ] Install and configure Lenis smooth scroll library
- [ ] Integrate Lenis RAF loop with React (useEffect + cleanup)
- [ ] Set up IntersectionObserver utility hook for scroll-triggered animations

### Hero Section
- [ ] Full-viewport Three.js scene: interactive 3D object (rotating Hapkonic logo mesh or abstract geometry)
- [ ] Particle field background (BufferGeometry points) reacting to cursor position
- [ ] Magnetic text effect on headline (mouse proximity repulsion/attraction)
- [ ] Staggered letter reveal animation on headline with Framer Motion
- [ ] Subheadline fade-in with delay
- [ ] CTA button with liquid/blob hover animation (SVG filter or Framer Motion)
- [ ] Scroll-down indicator (animated chevron or line)

### Services Section
- [ ] Horizontal scroll-triggered card layout (6 service cards)
- [ ] Services: Web Dev, Mobile Apps, UI/UX Design, Cloud/DevOps, AI/ML, Consulting
- [ ] Each card: icon animation on viewport enter, brief description, "View Demo" CTA
- [ ] Parallax depth layers (background elements move slower than foreground)
- [ ] Cards use Framer Motion `whileInView` with stagger

### Live Demos Section
- [ ] Grid of demo showcase items (embedded iframes or component previews)
- [ ] Before/after image sliders (CSS clip-path draggable)
- [ ] Video walkthrough thumbnails with play-on-click overlay
- [ ] Smooth scale-up transition on scroll into view
- [ ] Lightbox for full-size demo viewing

### Testimonials Section
- [ ] Auto-rotating 3D carousel (Three.js CSS3DRenderer or pure CSS 3D transforms)
- [ ] Each card: client photo, quote text, company logo, star rating
- [ ] Draggable rotation with momentum physics (pointer events + inertia)
- [ ] Auto-rotate pauses on hover/drag
- [ ] Dots navigation indicator

### Stats / Numbers Section
- [ ] Animated counter on scroll enter (e.g., 50+ projects, 30+ clients, 3 years, 99.9% uptime)
- [ ] Subtle CSS grid background animation (moving dots or lines)
- [ ] Numbers use `requestAnimationFrame` for smooth counting

### Footer
- [ ] Multi-column layout: links, services, contact, social
- [ ] Staggered link reveal on scroll (Framer Motion + staggerChildren)
- [ ] Social icons with magnetic hover effect
- [ ] Newsletter subscribe input + submit (Resend integration)
- [ ] Copyright, privacy policy, terms links

### Navigation Bar
- [ ] Fixed topbar: logo left, links center, "Client Login" CTA right
- [ ] Background blur + border on scroll (transparent → frosted glass)
- [ ] Mobile: hamburger menu with slide-in drawer
- [ ] Active section indicator (updates as user scrolls)

### Performance
- [ ] All sections use `IntersectionObserver` (not scroll events) for animation triggers
- [ ] Three.js scene disposes on unmount (geometry, material, renderer)
- [ ] Lazy load sections below fold
- [ ] Compress and optimize all images (WebP)

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
