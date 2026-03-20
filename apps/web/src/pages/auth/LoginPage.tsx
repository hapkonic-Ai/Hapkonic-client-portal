import { useRef, useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { authApi } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { cn } from '../../lib/utils'

// ── Three.js 3D Panel ─────────────────────────────────────────────────────────

function ThreePanel() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const W = mount.clientWidth; const H = mount.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const meshes: THREE.Mesh[] = []
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x818cf8, wireframe: true, transparent: true, opacity: 0.25 })
    const positions: [number, number, number][] = [[-2, 1.5, 0], [2, -1, -1], [0, -2, 0.5], [2.5, 2, -0.5]]
    const geoms = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.OctahedronGeometry(0.7, 0),
      new THREE.TorusGeometry(0.5, 0.2, 8, 24),
      new THREE.TetrahedronGeometry(0.6, 0),
    ]
    geoms.forEach((g, i) => {
      const mat = new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.3, metalness: 0.7 })
      const mesh = new THREE.Mesh(g, mat)
      const wire = new THREE.Mesh(g, wireMat.clone())
      const [px, py, pz] = positions[i]!; mesh.position.set(px, py, pz); wire.position.set(px, py, pz)
      scene.add(mesh, wire); meshes.push(mesh)
    })

    scene.add(new THREE.AmbientLight(0xffffff, 0.4))
    const p1 = new THREE.PointLight(0x6366f1, 3, 20); p1.position.set(3, 3, 3)
    const p2 = new THREE.PointLight(0x8b5cf6, 2, 20); p2.position.set(-3, -3, 2)
    scene.add(p1, p2)

    let mx = 0; let my = 0
    const onMouse = (e: MouseEvent) => { mx = (e.clientX / window.innerWidth - 0.5) * 2; my = (e.clientY / window.innerHeight - 0.5) * -2 }
    window.addEventListener('mousemove', onMouse)

    let rafId: number
    const clock = new THREE.Clock()
    function animate() {
      rafId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      meshes.forEach((m, i) => { m.rotation.x = t * 0.3 * (i % 2 === 0 ? 1 : -1); m.rotation.y = t * 0.2 * (i % 2 === 0 ? -1 : 1) })
      camera.position.x += (mx * 0.3 - camera.position.x) * 0.05
      camera.position.y += (my * 0.3 - camera.position.y) * 0.05
      camera.lookAt(scene.position)
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => { const W2 = mount.clientWidth; const H2 = mount.clientHeight; camera.aspect = W2 / H2; camera.updateProjectionMatrix(); renderer.setSize(W2, H2) }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('mousemove', onMouse); window.removeEventListener('resize', onResize); renderer.dispose(); if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement) }
  }, [])

  return <div ref={mountRef} className="absolute inset-0" />
}

// ── Login Page ─────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated && user) {
      const from = (location.state as { from?: string })?.from
      navigate(from ?? (user.role === 'client' ? '/portal/dashboard' : '/admin/dashboard'), { replace: true })
    }
  }, [isAuthenticated, user, navigate, location])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    try {
      const { accessToken, user: u } = await authApi.login(email, password)
      login({ id: u.id, email: u.email, name: u.name, role: u.role as 'admin' | 'manager' | 'client', clientId: u.clientId, avatar: u.avatar, forcePasswordReset: u.forcePasswordReset ?? false }, accessToken)
    } catch (err) { setError((err as Error).message) } finally { setLoading(false) }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Left 3D Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)' }}>
        <ThreePanel />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <img src="/hapkonic-logo-removebg-preview.png" alt="Hapkonic" className="w-9 h-9 object-contain" />
            <span className="text-xl font-bold text-white tracking-tight">Hapkonic</span>
          </div>
          {/* Centered logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src="/hapkonic-logo-removebg-preview.png"
              alt=""
              className="w-40 h-40 object-contain opacity-10"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              Your project,<br />beautifully managed.
            </h1>
            <p className="text-indigo-200 text-lg leading-relaxed max-w-sm">
              Real-time progress, documents, invoices, and meetings — all in one premium client portal.
            </p>
            <div className="flex items-center gap-5 mt-8">
              {['Track Progress', 'Manage Invoices', 'Schedule Meetings'].map(label => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span className="text-indigo-200 text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <img src="/hapkonic-logo-removebg-preview.png" alt="Hapkonic" className="w-8 h-8 object-contain" />
            <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Hapkonic</span>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Sign in to your client portal</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoComplete="email" autoFocus placeholder="you@company.com" />
            <Input label="Password" type={showPw ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)} required autoComplete="current-password" placeholder="••••••••"
              rightIcon={<button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>} />

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className={cn('px-4 py-3 rounded-xl text-sm')}
                style={{ background: 'rgb(239 68 68 / 0.1)', color: '#ef4444', border: '1px solid rgb(239 68 68 / 0.2)' }}>
                {error}
              </motion.div>
            )}

            <Button type="submit" className="w-full" loading={loading} leftIcon={<LogIn size={16} />} size="lg">
              Sign in
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/forgot-password" className="text-sm transition-colors" style={{ color: 'var(--primary-500)' }}>
              Forgot your password?
            </Link>
          </div>
          <p className="mt-8 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Access is by invitation only. Contact your project manager for credentials.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
