import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Mail, ShieldCheck, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { authApi } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

type Step = 'email' | 'otp' | 'password' | 'success'

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', pass: /[a-z]/.test(password) },
    { label: 'Number', pass: /\d/.test(password) },
    { label: 'Special character', pass: /[^a-zA-Z0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.pass).length
  const color = score <= 1 ? '#ef4444' : score <= 3 ? '#f59e0b' : '#10b981'
  const label = score <= 1 ? 'Weak' : score <= 3 ? 'Fair' : score === 4 ? 'Good' : 'Strong'

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full transition-colors"
            style={{ background: i < score ? color : 'var(--border)' }} />
        ))}
      </div>
      <p className="text-xs" style={{ color }}>{label}</p>
    </div>
  )
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    try { await authApi.forgotPassword(email); setStep('otp') }
    catch (err) { setError((err as Error).message) } finally { setLoading(false) }
  }

  function handleOtpChange(i: number, val: string) {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[i] = val; setOtp(next)
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
    if (!val && i > 0) otpRefs.current[i - 1]?.focus()
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    const code = otp.join('')
    if (code.length < 6) { setError('Please enter all 6 digits'); setLoading(false); return }
    try { await authApi.verifyOtp(email, code); setStep('password') }
    catch (err) { setError((err as Error).message) } finally { setLoading(false) }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError(null)
    try { await authApi.resetPassword(email, otp.join(''), newPassword); setStep('success') }
    catch (err) { setError((err as Error).message) } finally { setLoading(false) }
  }

  const pageVariants = {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  }

  return (
    <div className="flex h-screen items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-xl gradient-primary" />
          <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Hapkonic</span>
        </div>

        <AnimatePresence mode="wait">
          {step === 'email' && (
            <motion.div key="email" {...pageVariants} transition={{ duration: 0.25 }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                  <Mail size={20} style={{ color: 'var(--primary-500)' }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Reset password</h2>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>We'll send a 6-digit code to your email</p>
                </div>
              </div>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <Input label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required autoFocus placeholder="you@company.com" />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" loading={loading}>Send Reset Code</Button>
              </form>
              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm flex items-center justify-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <ArrowLeft size={14} /> Back to login
                </Link>
              </div>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div key="otp" {...pageVariants} transition={{ duration: 0.25 }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                  <ShieldCheck size={20} style={{ color: 'var(--primary-500)' }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Enter OTP</h2>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sent to {email}</p>
                </div>
              </div>
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="flex gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => { if (e.key === 'Backspace' && !digit && i > 0) otpRefs.current[i - 1]?.focus() }}
                      className="flex-1 h-14 text-center text-xl font-bold rounded-xl outline-none transition-all"
                      style={{
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        border: `2px solid ${digit ? 'var(--primary-500)' : 'var(--border)'}`,
                      }}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" loading={loading}>Verify Code</Button>
              </form>
              <button onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); setError(null) }}
                className="mt-4 text-sm w-full text-center flex items-center justify-center gap-1"
                style={{ color: 'var(--text-secondary)' }}>
                <ArrowLeft size={14} /> Change email
              </button>
            </motion.div>
          )}

          {step === 'password' && (
            <motion.div key="password" {...pageVariants} transition={{ duration: 0.25 }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                  <Lock size={20} style={{ color: 'var(--primary-500)' }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>New password</h2>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Choose a strong password</p>
                </div>
              </div>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <Input label="New Password" type={showPw ? 'text' : 'password'} value={newPassword}
                    onChange={e => setNewPassword(e.target.value)} required autoFocus placeholder="••••••••"
                    rightIcon={<button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>} />
                  {newPassword && <PasswordStrength password={newPassword} />}
                </div>
                <Input label="Confirm Password" type="password" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)} required placeholder="••••••••" />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" loading={loading}>Set New Password</Button>
              </form>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" {...pageVariants} transition={{ duration: 0.25 }} className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full" style={{ background: 'rgb(16 185 129 / 0.1)' }}>
                  <CheckCircle size={40} className="text-emerald-500" />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Password reset!</h2>
              <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
                Your password has been successfully updated. You can now sign in with your new password.
              </p>
              <Button className="w-full" onClick={() => navigate('/login')}>Back to Sign In</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
