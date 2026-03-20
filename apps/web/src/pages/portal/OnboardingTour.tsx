import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, Zap } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../contexts/AuthContext'

const STEPS = [
  {
    title: 'Welcome to Hapkonic Portal',
    body: 'Your dedicated project hub — transparent, real-time, and always up to date. Let us show you around.',
    highlight: null,
  },
  {
    title: 'Document Vault',
    body: 'All your contracts, proposals, and deliverables live here. Preview PDFs inline, download with one click.',
    highlight: '/portal/documents',
  },
  {
    title: 'Project Roadmap',
    body: 'See your milestones laid out on a Gantt chart. Track what\'s done, in progress, or coming up next.',
    highlight: '/portal/roadmap',
  },
  {
    title: 'Progress Updates',
    body: 'Your team posts regular updates with percentages by design, development, testing, and deployment.',
    highlight: '/portal/progress',
  },
  {
    title: 'Meetings',
    body: 'All scheduled calls appear here with agenda, Google Meet links, and post-meeting summaries.',
    highlight: '/portal/meetings',
  },
  {
    title: 'Invoices',
    body: 'View all invoices, download PDFs, and track payment status in one place.',
    highlight: '/portal/invoices',
  },
  {
    title: "You're all set!",
    body: 'Explore at your own pace. Use ⌘K to quickly jump anywhere. Your team is excited to work with you.',
    highlight: null,
  },
]

const STORAGE_KEY = 'hapkonic_tour_completed'

export function OnboardingTour() {
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    // Only show portal tour for client users
    if (!user || user.role === 'admin' || user.role === 'manager') return
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done) {
      // Small delay to let the page settle
      const t = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(t)
    }
  }, [user])

  function complete() {
    localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
  }

  function next() {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else complete()
  }

  function prev() {
    if (step > 0) setStep(s => s - 1)
  }

  const current = STEPS[step]
  if (!current) return null
  const isLast = step === STEPS.length - 1

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200]"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
            onClick={complete}
          />

          {/* Tour card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[201] w-full max-w-sm rounded-3xl p-6 shadow-2xl"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl gradient-primary flex items-center justify-center">
                  <Zap size={14} className="text-white" />
                </div>
                <span className="text-xs font-semibold" style={{ color: 'var(--color-primary-500)' }}>
                  Step {step + 1} of {STEPS.length}
                </span>
              </div>
              <button
                onClick={complete}
                className="p-1 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 rounded-full mb-5 overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
              <motion.div
                className="h-full rounded-full gradient-primary"
                animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Content */}
            <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {current.title}
            </h3>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
              {current.body}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={complete}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"
                style={{ color: 'var(--text-muted)' }}
              >
                Skip tour
              </button>
              <div className="flex gap-2">
                {step > 0 && (
                  <Button variant="ghost" size="sm" onClick={prev} leftIcon={<ChevronLeft size={14} />}>
                    Back
                  </Button>
                )}
                <Button size="sm" onClick={next} rightIcon={isLast ? undefined : <ChevronRight size={14} />}>
                  {isLast ? 'Get started' : 'Next'}
                </Button>
              </div>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-1.5 mt-4">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className="rounded-full transition-all"
                  style={{
                    width: i === step ? 16 : 6,
                    height: 6,
                    background: i === step ? 'var(--color-primary-500)' : 'var(--bg-elevated)',
                  }}
                />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
