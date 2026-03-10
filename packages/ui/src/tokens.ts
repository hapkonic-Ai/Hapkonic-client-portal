export const HAPKONIC_COLORS = {
  primary: {
    50:  '#f0f4ff',
    100: '#e0e9ff',
    200: '#c7d7fe',
    300: '#a5b8fd',
    400: '#818efa',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  accent: {
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
  },
  neutral: {
    0:   '#ffffff',
    50:  '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#080f1f',
  },
} as const

export const HAPKONIC_RADIUS = {
  xs:   '0.25rem',
  sm:   '0.375rem',
  md:   '0.5rem',
  lg:   '0.75rem',
  xl:   '1rem',
  '2xl':'1.5rem',
  full: '9999px',
} as const

export const HAPKONIC_MOTION = {
  duration: { fast: 150, normal: 250, slow: 400 },
  ease: {
    bounce: [0.34, 1.56, 0.64, 1] as const,
    smooth: [0.4, 0, 0.2, 1] as const,
    out:    [0, 0, 0.2, 1] as const,
  },
} as const
