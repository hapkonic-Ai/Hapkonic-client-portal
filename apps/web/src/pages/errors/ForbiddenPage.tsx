import { Link } from 'react-router-dom'
export default function ForbiddenPage() {
  return (
    <div className="flex flex-col h-screen items-center justify-center gap-4" style={{ background: 'var(--bg-base)' }}>
      <h1 className="text-7xl font-bold" style={{ color: 'var(--color-error-500)' }}>403</h1>
      <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Access forbidden</p>
      <Link to="/" className="px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium">Go Home</Link>
    </div>
  )
}
