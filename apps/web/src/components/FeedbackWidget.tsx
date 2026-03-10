import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Check } from 'lucide-react'
import { Button } from './ui/Button'

const EMOJIS = ['😕', '😐', '🙂', '😊', '🤩']

export function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState<number | null>(null)
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit() {
    if (rating === null) return
    // In production this would POST to /api/v1/feedback
    console.log('Feedback:', { rating, text })
    setSubmitted(true)
    setTimeout(() => {
      setOpen(false)
      setSubmitted(false)
      setRating(null)
      setText('')
    }, 2000)
  }

  return (
    <>
      {/* Trigger button — bottom right */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: 2 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 flex items-center gap-2 px-3 py-2 rounded-full shadow-lg text-sm font-medium text-white"
            style={{ background: 'var(--color-primary-500)' }}
          >
            <MessageSquare size={15} />
            <span className="hidden lg:inline">Feedback</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Widget panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 w-72 rounded-2xl shadow-2xl p-5"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Share your feedback</p>
              <button onClick={() => setOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                  <Check size={20} className="text-green-500" />
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Thanks for your feedback!</p>
              </div>
            ) : (
              <>
                <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>How's your experience?</p>
                <div className="flex justify-between mb-4">
                  {EMOJIS.map((emoji, i) => (
                    <button
                      key={i}
                      onClick={() => setRating(i)}
                      className="text-2xl rounded-xl p-1.5 transition-transform hover:scale-125"
                      style={{
                        background: rating === i ? 'var(--color-primary-500)20' : 'transparent',
                        transform: rating === i ? 'scale(1.2)' : undefined,
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Tell us more... (optional)"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl text-xs resize-none mb-3"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
                />
                <Button
                  size="sm"
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={rating === null}
                  leftIcon={<Send size={13} />}
                >
                  Send feedback
                </Button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
