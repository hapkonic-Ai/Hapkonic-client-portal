import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface Step {
  icon: string
  title: string
  description: string
}

const PORTAL_STEPS: Step[] = [
  {
    icon: '👋',
    title: 'Welcome to Your Client Portal',
    description: "This is your personal workspace. Everything Hapkonic shares with you — documents, updates, invoices — lives right here.",
  },
  {
    icon: '📁',
    title: 'Documents',
    description: "Access all files the Hapkonic team uploads for you — contracts, design assets, reports, and more. Filter by category or project.",
  },
  {
    icon: '🗓️',
    title: 'Meetings',
    description: "View your upcoming scheduled calls, join Google Meet sessions with one click, and read post-meeting summaries.",
  },
  {
    icon: '🧾',
    title: 'Invoices',
    description: "Track all your invoices, their due dates and payment status. Download PDF copies whenever you need them.",
  },
  {
    icon: '📈',
    title: 'Progress',
    description: "See real-time progress updates posted by your project team, with a breakdown by design, development, testing, and deployment.",
  },
]

const ADMIN_STEPS: Step[] = [
  {
    icon: '🛡️',
    title: 'Welcome to Admin Panel',
    description: "This is your control centre. Manage clients, projects, documents, meetings, and invoices — all from one place.",
  },
  {
    icon: '🏢',
    title: 'Clients',
    description: "Add and manage client accounts. Each client gets their own portal login, documents, projects, and invoices.",
  },
  {
    icon: '🚀',
    title: 'Projects & Milestones',
    description: "Create projects, add milestones, track status, and post progress updates that clients can see in real time.",
  },
  {
    icon: '📂',
    title: 'Documents',
    description: "Upload files per project — contracts, design assets, reports. Clients can browse and download them from their portal.",
  },
  {
    icon: '📅',
    title: 'Meetings & Invoices',
    description: "Schedule meetings (with Google Meet links) and issue invoices. Clients get notified and can view everything in their portal.",
  },
]

const STORAGE_KEY = (role: string) => `hapkonic_walkthrough_${role}_seen`

export function WalkthroughModal() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  const isAdmin = user?.role === 'admin' || user?.role === 'manager'
  const steps = isAdmin ? ADMIN_STEPS : PORTAL_STEPS
  const storageKey = user ? STORAGE_KEY(user.role) : null

  useEffect(() => {
    if (!storageKey) return
    const seen = localStorage.getItem(storageKey)
    if (!seen) setOpen(true)
  }, [storageKey])

  function finish() {
    if (storageKey) localStorage.setItem(storageKey, '1')
    setOpen(false)
  }

  function skip() {
    finish()
  }

  if (!open) return null

  const current = steps[step]
  if (!current) return null
  const isLast = step === steps.length - 1

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="relative w-full max-w-sm rounded-2xl border overflow-hidden"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
          >
            {/* Close */}
            <button
              onClick={skip}
              className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors hover:bg-white/10 z-10"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>

            {/* Step content */}
            <div className="px-8 pt-10 pb-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="text-center"
                >
                  <div className="text-5xl mb-5">{current.icon}</div>
                  <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                    {current.title}
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {current.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-1.5 pb-4">
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ width: i === step ? 20 : 6, background: i === step ? 'var(--color-primary-500)' : 'var(--border-default)' }}
                  className="h-1.5 rounded-full"
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between px-6 pb-6">
              <button
                onClick={skip}
                className="text-sm px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                Skip tour
              </button>
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors"
                    style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
                  >
                    <ArrowLeft size={13} />
                    Back
                  </button>
                )}
                <button
                  onClick={isLast ? finish : () => setStep(s => s + 1)}
                  className="flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-lg font-medium transition-all"
                  style={{ background: 'var(--color-primary-500)', color: '#fff' }}
                >
                  {isLast ? (
                    <>
                      <Check size={13} />
                      Got it!
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
