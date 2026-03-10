import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge, type BadgeVariant } from '../Badge'

describe('Badge', () => {
  it('renders with correct text', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeTruthy()
  })

  const variants: BadgeVariant[] = ['success', 'warning', 'error', 'info', 'neutral']
  variants.forEach(variant => {
    it(`renders variant="${variant}" without crashing`, () => {
      const { container } = render(<Badge variant={variant}>{variant}</Badge>)
      expect(container.firstChild).toBeTruthy()
    })
  })

  it('applies size="sm" class', () => {
    const { container } = render(<Badge size="sm">Small</Badge>)
    const span = container.firstChild as HTMLElement
    // sm uses text-[10px] and px-1.5
    expect(span.className).toContain('px-1.5')
  })

  it('applies size="md" class (default)', () => {
    const { container } = render(<Badge size="md">Medium</Badge>)
    const span = container.firstChild as HTMLElement
    // md uses px-2
    expect(span.className).toContain('px-2')
  })

  it('does not render dot indicator when dot prop is omitted', () => {
    const { container } = render(<Badge>No dot</Badge>)
    // Without dot prop there should be only one child element (the text node)
    const spans = container.querySelectorAll('span')
    // The outer span renders, inner dot span should not exist
    expect(spans).toHaveLength(1)
  })

  it('shows dot indicator when dot={true}', () => {
    const { container } = render(<Badge dot>With dot</Badge>)
    const spans = container.querySelectorAll('span')
    // Outer span + inner dot span
    expect(spans).toHaveLength(2)
    const dotSpan = spans[1] as HTMLElement
    expect(dotSpan.className).toContain('rounded-full')
  })

  it('merges className prop', () => {
    const { container } = render(<Badge className="custom-class">Test</Badge>)
    const span = container.firstChild as HTMLElement
    expect(span.className).toContain('custom-class')
  })

  it('forwards inline style via style prop', () => {
    const { container } = render(<Badge style={{ opacity: 0.5 }}>Styled</Badge>)
    const span = container.firstChild as HTMLElement
    expect(span.style.opacity).toBe('0.5')
  })
})
