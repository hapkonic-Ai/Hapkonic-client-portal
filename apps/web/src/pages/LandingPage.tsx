export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="text-center">
        <h1 className="text-5xl font-bold gradient-text mb-4">Hapkonic</h1>
        <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
          Where code meets craft.
        </p>
        <a href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white gradient-primary font-medium">
          Client Login →
        </a>
      </div>
    </div>
  )
}
