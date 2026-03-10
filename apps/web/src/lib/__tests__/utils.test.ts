import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cn, formatCurrency, formatDate, formatRelativeTime, truncate, getInitials } from '../utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional falsy values', () => {
    expect(cn('foo', false && 'bar', undefined, null, 'baz')).toBe('foo baz')
  })

  it('handles tailwind conflict resolution (later class wins)', () => {
    // tailwind-merge should deduplicate conflicting utilities
    const result = cn('px-2', 'px-4')
    expect(result).toBe('px-4')
  })

  it('returns empty string for no args', () => {
    expect(cn()).toBe('')
  })
})

describe('formatCurrency', () => {
  it('formats amount in INR by default', () => {
    const result = formatCurrency(1000)
    // en-IN with INR — expect the rupee symbol and the number
    expect(result).toContain('1,000')
    expect(result).toMatch(/₹|INR/)
  })

  it('formats amount in USD when specified', () => {
    const result = formatCurrency(500, 'USD')
    expect(result).toContain('500')
    expect(result).toMatch(/\$|USD/)
  })

  it('formats zero correctly', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
  })
})

describe('formatDate', () => {
  it('formats a Date object', () => {
    // Use a fixed date: 1 Jan 2024
    const date = new Date('2024-01-01T00:00:00Z')
    const result = formatDate(date)
    expect(result).toContain('2024')
    expect(result).toContain('Jan')
  })

  it('formats a date string', () => {
    const result = formatDate('2023-06-15')
    expect(result).toContain('2023')
    expect(result).toContain('Jun')
    expect(result).toContain('15')
  })

  it('accepts custom Intl options', () => {
    const result = formatDate('2024-03-10', { month: 'long' })
    expect(result).toContain('March')
  })
})

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "just now" for times less than 60 seconds ago', () => {
    const now = new Date('2024-06-01T12:00:00Z')
    vi.setSystemTime(now)
    const thirtySecsAgo = new Date('2024-06-01T11:59:35Z')
    expect(formatRelativeTime(thirtySecsAgo)).toBe('just now')
  })

  it('returns minutes ago for times less than 60 minutes ago', () => {
    const now = new Date('2024-06-01T12:00:00Z')
    vi.setSystemTime(now)
    const fiveMinsAgo = new Date('2024-06-01T11:55:00Z')
    expect(formatRelativeTime(fiveMinsAgo)).toBe('5m ago')
  })

  it('returns hours ago for times less than 24 hours ago', () => {
    const now = new Date('2024-06-01T12:00:00Z')
    vi.setSystemTime(now)
    const threeHoursAgo = new Date('2024-06-01T09:00:00Z')
    expect(formatRelativeTime(threeHoursAgo)).toBe('3h ago')
  })

  it('returns days ago for times less than 7 days ago', () => {
    const now = new Date('2024-06-01T12:00:00Z')
    vi.setSystemTime(now)
    const twoDaysAgo = new Date('2024-05-30T12:00:00Z')
    expect(formatRelativeTime(twoDaysAgo)).toBe('2d ago')
  })

  it('returns formatted date for times 7 or more days ago', () => {
    const now = new Date('2024-06-15T12:00:00Z')
    vi.setSystemTime(now)
    const tenDaysAgo = new Date('2024-06-05T12:00:00Z')
    const result = formatRelativeTime(tenDaysAgo)
    // Falls back to formatDate, should contain year and Jun
    expect(result).toContain('2024')
    expect(result).toContain('Jun')
  })

  it('accepts a date string', () => {
    const now = new Date('2024-06-01T12:00:00Z')
    vi.setSystemTime(now)
    expect(formatRelativeTime('2024-06-01T11:59:30Z')).toBe('just now')
  })
})

describe('truncate', () => {
  it('returns the original string when it is shorter than maxLen', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('returns the original string when it equals maxLen', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })

  it('truncates and appends ellipsis when string exceeds maxLen', () => {
    const result = truncate('Hello world', 5)
    expect(result).toContain('…')
    expect(result.length).toBeLessThan('Hello world'.length)
  })

  it('trims trailing whitespace before appending ellipsis', () => {
    const result = truncate('Hello ', 5)
    expect(result).toBe('Hello…')
  })
})

describe('getInitials', () => {
  it('returns initials for a two-word name', () => {
    expect(getInitials('John Doe')).toBe('JD')
  })

  it('returns initials for a single-word name', () => {
    expect(getInitials('Alice')).toBe('A')
  })

  it('returns at most 2 characters for a multi-word name', () => {
    const result = getInitials('John Michael Doe')
    expect(result).toHaveLength(2)
    expect(result).toBe('JM')
  })

  it('returns uppercase initials', () => {
    expect(getInitials('jane doe')).toBe('JD')
  })
})
