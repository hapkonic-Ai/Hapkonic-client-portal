import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import * as THREE from 'three'
import { ArrowRight, Code2, Smartphone, Palette, Cloud, Brain, Lightbulb, ChevronDown, Star, Menu, X } from 'lucide-react'

// ── Utility: Smooth Counter ───────────────────────────────────────────────────

function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0; const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return { ref, count }
}

// ── Three.js Hero Scene ───────────────────────────────────────────────────────

function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const W = mount.clientWidth; const H = mount.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
    camera.position.z = 8

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // Particle field
    const count = 2000
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 30
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const pMat = new THREE.PointsMaterial({ color: 0x6366f1, size: 0.04, transparent: true, opacity: 0.6 })
    scene.add(new THREE.Points(pGeo, pMat))

    // Central icosahedron
    const geo = new THREE.IcosahedronGeometry(1.8, 1)
    const mat = new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.2, metalness: 0.8, wireframe: false })
    const mesh = new THREE.Mesh(geo, mat)
    scene.add(mesh)

    // Wireframe overlay
    const wMat = new THREE.MeshBasicMaterial({ color: 0x818cf8, wireframe: true, transparent: true, opacity: 0.15 })
    scene.add(new THREE.Mesh(geo, wMat))

    // Orbiting rings
    const ringGeo = new THREE.TorusGeometry(3, 0.02, 8, 80)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x4f46e5, transparent: true, opacity: 0.4 })
    const ring1 = new THREE.Mesh(ringGeo, ringMat)
    ring1.rotation.x = Math.PI / 4
    scene.add(ring1)
    const ring2 = new THREE.Mesh(ringGeo, ringMat.clone())
    ring2.rotation.x = Math.PI / 3
    ring2.rotation.y = Math.PI / 6
    scene.add(ring2)

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.3))
    const p1 = new THREE.PointLight(0x6366f1, 4, 30); p1.position.set(5, 5, 5); scene.add(p1)
    const p2 = new THREE.PointLight(0x8b5cf6, 3, 30); p2.position.set(-5, -3, 3); scene.add(p2)
    const p3 = new THREE.PointLight(0x06b6d4, 2, 20); p3.position.set(0, -5, -5); scene.add(p3)

    let mx = 0; let my = 0
    const onMouse = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2
      my = (e.clientY / window.innerHeight - 0.5) * -2
    }
    window.addEventListener('mousemove', onMouse)

    let rafId: number
    const clock = new THREE.Clock()
    function animate() {
      rafId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      mesh.rotation.x = t * 0.1 + my * 0.2
      mesh.rotation.y = t * 0.15 + mx * 0.2
      ring1.rotation.z = t * 0.05
      ring2.rotation.z = -t * 0.07
      camera.position.x += (mx * 0.5 - camera.position.x) * 0.03
      camera.position.y += (my * 0.5 - camera.position.y) * 0.03
      camera.lookAt(scene.position)
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const W2 = mount.clientWidth; const H2 = mount.clientHeight
      camera.aspect = W2 / H2; camera.updateProjectionMatrix(); renderer.setSize(W2, H2)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="absolute inset-0" />
}

// ── Nav ───────────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'Services', href: '#services' },
    { label: 'Work', href: '#demos' },
    { label: 'About', href: '#stats' },
    { label: 'Contact', href: '#footer' },
  ]

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(10, 10, 20, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl gradient-primary" />
          <span className="text-white font-bold text-lg">Hapkonic</span>
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.label} href={l.href}
              className="text-sm font-medium transition-colors"
              style={{ color: 'rgba(255,255,255,0.7)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')}
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all"
            style={{ background: 'rgba(99,102,241,0.9)', border: '1px solid rgba(99,102,241,0.5)' }}>
            Client Login <ArrowRight size={14} />
          </button>
          <button onClick={() => setMenuOpen(o => !o)} className="md:hidden text-white p-1">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="md:hidden px-6 pb-4 space-y-3"
          style={{ background: 'rgba(10,10,20,0.95)' }}>
          {links.map(l => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium py-2"
              style={{ color: 'rgba(255,255,255,0.8)' }}>{l.label}</a>
          ))}
          <button onClick={() => navigate('/login')}
            className="w-full py-2 rounded-xl text-sm font-medium text-white gradient-primary">
            Client Login
          </button>
        </motion.div>
      )}
    </header>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  const navigate = useNavigate()
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 0.3], [0, -80])
  const opacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])

  const words = ['Code', 'Meets', 'Craft.']

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #050511 0%, #0f0a1e 60%, #1a0a2e 100%)' }}>
      <HeroScene />
      <motion.div style={{ y, opacity }} className="relative z-10 text-center px-6 max-w-4xl">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-semibold tracking-[0.25em] uppercase mb-6"
          style={{ color: 'rgba(129,140,248,0.9)' }}>
          Premium Software Agency
        </motion.p>
        <h1 className="text-6xl md:text-8xl font-black leading-none mb-6">
          {words.map((word, wi) => (
            <span key={word} className="inline-block mr-4">
              {word.split('').map((char, ci) => (
                <motion.span key={ci} className={`inline-block ${word === 'Meets' ? '' : 'gradient-text'}`}
                  style={{ color: word === 'Meets' ? 'rgba(255,255,255,0.9)' : undefined }}
                  initial={{ opacity: 0, y: 40, rotateX: -45 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.4 + wi * 0.1 + ci * 0.04, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                  {char}
                </motion.span>
              ))}
            </span>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto"
          style={{ color: 'rgba(255,255,255,0.6)' }}>
          We design and build exceptional digital products — from web apps to mobile experiences — with precision and passion.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => navigate('/login')}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold gradient-primary transition-all hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0">
            Access Client Portal
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
          <a href="#services"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold transition-all"
            style={{ color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)' }}>
            Explore Services
          </a>
        </motion.div>
      </motion.div>
      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: 'rgba(255,255,255,0.3)' }}>
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <ChevronDown size={18} />
        </motion.div>
      </motion.div>
    </section>
  )
}

// ── Services ──────────────────────────────────────────────────────────────────

const SERVICES = [
  { icon: <Code2 size={28} />, title: 'Web Development', desc: 'Modern, performant web applications built with React, Next.js, and cutting-edge tooling.', color: '#6366f1' },
  { icon: <Smartphone size={28} />, title: 'Mobile Apps', desc: 'Cross-platform iOS and Android apps with React Native and Expo.', color: '#8b5cf6' },
  { icon: <Palette size={28} />, title: 'UI/UX Design', desc: 'Beautiful, intuitive interfaces designed with Figma and implemented pixel-perfect.', color: '#06b6d4' },
  { icon: <Cloud size={28} />, title: 'Cloud & DevOps', desc: 'Scalable infrastructure on AWS, GCP, or Azure with CI/CD pipelines.', color: '#10b981' },
  { icon: <Brain size={28} />, title: 'AI Integration', desc: 'LLM-powered features, embeddings, and intelligent automation baked into your product.', color: '#f59e0b' },
  { icon: <Lightbulb size={28} />, title: 'Tech Consulting', desc: 'Strategic guidance on architecture, team structure, and technology roadmap.', color: '#ef4444' },
]

function ServicesSection() {
  const ref = useRef(null)

  return (
    <section id="services" ref={ref} className="py-32 px-6" style={{ background: '#070712' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-20">
          <p className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: '#6366f1' }}>What we do</p>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            End-to-end<br /><span className="gradient-text">digital excellence</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
            From concept to deployment and beyond — we handle every layer of your digital product.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((svc, i) => (
            <motion.div key={svc.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="p-8 rounded-3xl group cursor-default"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                style={{ background: `${svc.color}22`, color: svc.color }}>
                {svc.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{svc.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{svc.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Stats ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: 50, suffix: '+', label: 'Projects Delivered' },
  { value: 30, suffix: '+', label: 'Happy Clients' },
  { value: 3, suffix: ' yrs', label: 'In Business' },
  { value: 99, suffix: '%', label: 'Client Satisfaction' },
]

function StatCard({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, count } = useCounter(value, 2500)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="text-5xl md:text-7xl font-black gradient-text mb-2">
        <span ref={ref}>{count}</span>{suffix}
      </div>
      <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</p>
    </motion.div>
  )
}

function StatsSection() {
  return (
    <section id="stats" className="py-32 px-6" style={{ background: 'linear-gradient(180deg, #070712 0%, #0f0a1e 100%)' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
            Numbers that<br /><span className="gradient-text">speak for themselves</span>
          </h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      </div>
    </section>
  )
}

// ── Testimonials ──────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  { name: 'Arjun Mehta', company: 'TechVentures', quote: 'Hapkonic delivered our SaaS platform in record time with exceptional quality. The client portal keeps us perfectly informed throughout.', rating: 5 },
  { name: 'Sneha Patel', company: 'RetailEdge', quote: 'The attention to detail in UI/UX design is unmatched. Our e-commerce conversion rate jumped 40% after the redesign.', rating: 5 },
  { name: 'Dr. Rajesh Kumar', company: 'HealthFirst', quote: 'Security, compliance, and clean code — they delivered all three. Our patient portal passed HIPAA audit on first try.', rating: 5 },
]

function TestimonialsSection() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setActive(a => (a + 1) % TESTIMONIALS.length), 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-32 px-6" style={{ background: '#0f0a1e' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
            Trusted by <span className="gradient-text">clients</span>
          </h2>
        </motion.div>
        <div className="relative overflow-hidden">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: i === active ? 1 : 0, x: i === active ? 0 : 60 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={`absolute inset-0 p-10 rounded-3xl ${i !== active ? 'pointer-events-none' : ''}`}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', position: i === active ? 'relative' : 'absolute' }}>
              <div className="flex gap-1 mb-6">
                {Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={16} className="text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-xl md:text-2xl text-white font-medium leading-relaxed mb-8">"{t.quote}"</p>
              <div>
                <p className="font-semibold text-white">{t.name}</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.company}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-8">
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              className="h-1.5 rounded-full transition-all"
              style={{ width: i === active ? 32 : 8, background: i === active ? '#6366f1' : 'rgba(255,255,255,0.2)' }} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  const navigate = useNavigate()

  return (
    <footer id="footer" className="pt-20 pb-10 px-6" style={{ background: '#050511', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl gradient-primary" />
              <span className="text-white font-bold text-lg">Hapkonic</span>
            </div>
            <p className="text-sm max-w-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Premium software agency building exceptional digital products for forward-thinking companies.
            </p>
          </div>
          <div>
            <p className="text-white font-semibold mb-4 text-sm tracking-wide">Services</p>
            {['Web Development', 'Mobile Apps', 'UI/UX Design', 'Cloud & DevOps', 'AI Integration'].map(s => (
              <p key={s} className="text-sm py-1.5 cursor-default" style={{ color: 'rgba(255,255,255,0.4)' }}>{s}</p>
            ))}
          </div>
          <div>
            <p className="text-white font-semibold mb-4 text-sm tracking-wide">Company</p>
            {['About', 'Portfolio', 'Careers', 'Blog'].map(l => (
              <p key={l} className="text-sm py-1.5 cursor-default" style={{ color: 'rgba(255,255,255,0.4)' }}>{l}</p>
            ))}
            <button onClick={() => navigate('/login')}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium gradient-text">
              Client Portal <ArrowRight size={14} />
            </button>
          </div>
        </div>
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            © 2025 Hapkonic Software. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service'].map(l => (
              <p key={l} className="text-xs cursor-default" style={{ color: 'rgba(255,255,255,0.3)' }}>{l}</p>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div style={{ background: '#050511' }}>
      <Navbar />
      <Hero />
      <ServicesSection />
      <StatsSection />
      <TestimonialsSection />
      <Footer />
    </div>
  )
}
