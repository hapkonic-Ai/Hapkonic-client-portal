import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Shield, Palette, Check, Camera, Trash2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { authApi, usersApi } from '../../lib/api'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useNavigate } from 'react-router-dom'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-6">
      <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      {children}
    </Card>
  )
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarLoading(true); setAvatarError(null)
    try {
      const { user: updated } = await usersApi.uploadAvatar(file)
      updateUser({ avatar: updated.avatar ?? undefined })
    } catch (err) {
      setAvatarError((err as Error).message)
    } finally {
      setAvatarLoading(false)
      e.target.value = ''
    }
  }

  async function handleRemoveAvatar() {
    setAvatarLoading(true); setAvatarError(null)
    try {
      await usersApi.removeAvatar()
      updateUser({ avatar: undefined })
    } catch (err) {
      setAvatarError((err as Error).message)
    } finally {
      setAvatarLoading(false)
    }
  }

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  const [notifs, setNotifs] = useState({
    meetings: true,
    documents: true,
    invoices: true,
    progress: true,
    email: true,
  })

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return }
    if (newPw.length < 8) { setPwError('Password must be at least 8 characters'); return }
    setPwLoading(true); setPwError(null)
    try {
      await authApi.changePassword(currentPw, newPw)
      setPwSuccess(true)
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setTimeout(() => setPwSuccess(false), 3000)
    } catch (err) {
      setPwError((err as Error).message)
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Manage your account preferences</p>
      </div>

      {/* Profile */}
      <Section title="Profile">
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar with upload overlay */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold gradient-primary">
                  {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? <User size={20} />}
                </div>
              )}
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarLoading}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'var(--color-primary-500)', color: '#fff' }}
              title="Change photo"
            >
              <Camera size={12} />
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            <p className="text-xs capitalize mt-0.5" style={{ color: 'var(--text-secondary)' }}>{user?.role}</p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarLoading}
                className="text-xs px-2 py-1 rounded-lg transition-colors"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
              >
                {avatarLoading ? 'Uploading…' : 'Change photo'}
              </button>
              {user?.avatar && (
                <button
                  onClick={handleRemoveAvatar}
                  disabled={avatarLoading}
                  className="text-xs px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                  style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}
                >
                  <Trash2 size={10} /> Remove
                </button>
              )}
            </div>
            {avatarError && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{avatarError}</p>}
          </div>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          To update your name or email, please contact your account manager.
        </p>
      </Section>

      {/* Appearance */}
      <Section title="Appearance">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Theme</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Currently using {theme === 'dark' ? 'Dark' : 'Light'} mode
            </p>
          </div>
          <div className="flex gap-2">
            {(['light', 'dark'] as const).map(t => (
              <button
                key={t}
                onClick={() => { if (theme !== t) toggleTheme() }}
                className="px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all"
                style={{
                  background: theme === t ? 'var(--color-primary-500)' : 'var(--bg-secondary)',
                  color: theme === t ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${theme === t ? 'var(--color-primary-500)' : 'var(--border-default)'}`,
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notification Preferences">
        <div className="space-y-3">
          {Object.entries(notifs).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium capitalize" style={{ color: 'var(--text-primary)' }}>
                  {key === 'email' ? 'Email notifications' : `${key.charAt(0).toUpperCase() + key.slice(1)} alerts`}
                </p>
              </div>
              <button
                onClick={() => setNotifs(n => ({ ...n, [key]: !value }))}
                className="relative w-10 h-5 rounded-full transition-all"
                style={{ background: value ? 'var(--color-primary-500)' : 'var(--bg-elevated)' }}
              >
                <motion.div
                  animate={{ x: value ? 20 : 2 }}
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
                />
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
          Notification preferences are saved locally. Email notification settings require contacting your admin.
        </p>
      </Section>

      {/* Security */}
      <Section title="Security — Change Password">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPw}
            onChange={e => setCurrentPw(e.target.value)}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            required
          />
          {pwError && <p className="text-sm text-red-500">{pwError}</p>}
          {pwSuccess && (
            <p className="text-sm text-green-500 flex items-center gap-1.5">
              <Check size={14} /> Password updated successfully
            </p>
          )}
          <Button type="submit" loading={pwLoading} leftIcon={<Shield size={14} />}>
            Update Password
          </Button>
        </form>
      </Section>
    </div>
  )
}
