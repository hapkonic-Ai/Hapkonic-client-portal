import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { authApi } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { pass: password.length >= 8 },
    { pass: /[A-Z]/.test(password) },
    { pass: /[a-z]/.test(password) },
    { pass: /\d/.test(password) },
    { pass: /[^a-zA-Z0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.pass).length
  const color = score <= 1 ? '#ef4444' : score <= 3 ? '#f59e0b' : '#10b981'
  const label = score <= 1 ? 'Weak' : score <= 3 ? 'Fair' : score === 4 ? 'Good' : 'Strong'
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">{Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex-1 h-1 rounded-full transition-colors" style={{ background: i < score ? color : 'var(--border)' }} />
      ))}</div>
      <p className="text-xs" style={{ color }}>{label}</p>
    </div>
  )
}

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const { user, updateUser, logout } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError(null)
    try {
      await authApi.changePassword(currentPassword, newPassword)
      updateUser({ forcePasswordReset: false })
      // Redirect based on role
      navigate(user?.role === 'client' ? '/portal/dashboard' : '/admin/dashboard', { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-xl gradient-primary" />
          <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Hapkonic</span>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
            <Lock size={20} style={{ color: 'var(--primary-500)' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Change your password</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {user?.forcePasswordReset
                ? 'You must set a new password before continuing.'
                : 'Update your account password.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type={showCurrent ? 'text' : 'password'}
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
            autoFocus
            placeholder="••••••••"
            rightIcon={
              <button type="button" onClick={() => setShowCurrent(v => !v)} tabIndex={-1}>
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <div>
            <Input
              label="New Password"
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              placeholder="••••••••"
              rightIcon={
                <button type="button" onClick={() => setShowNew(v => !v)} tabIndex={-1}>
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            {newPassword && <PasswordStrength password={newPassword} />}
          </div>
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
              {error}
            </motion.p>
          )}

          <Button type="submit" className="w-full" loading={loading} size="lg">
            Update Password
          </Button>
        </form>

        {!user?.forcePasswordReset && (
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate(-1)}
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
          </div>
        )}

        {user?.forcePasswordReset && (
          <div className="mt-4 text-center">
            <button
              onClick={() => logout()}
              className="text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              Sign out instead
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
