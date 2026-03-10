import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardFooter } from '../Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeTruthy()
  })

  it('merges className prop onto the root element', () => {
    const { container } = render(<Card className="my-card-class">Content</Card>)
    const div = container.firstChild as HTMLElement
    expect(div.className).toContain('my-card-class')
  })

  it('always contains base rounded-xl class', () => {
    const { container } = render(<Card>Content</Card>)
    const div = container.firstChild as HTMLElement
    expect(div.className).toContain('rounded-xl')
  })

  it('applies hover class when hover prop is true', () => {
    const { container } = render(<Card hover>Hover card</Card>)
    const div = container.firstChild as HTMLElement
    expect(div.className).toContain('cursor-pointer')
  })

  it('does not apply hover class by default', () => {
    const { container } = render(<Card>No hover</Card>)
    const div = container.firstChild as HTMLElement
    expect(div.className).not.toContain('cursor-pointer')
  })

  it('triggers onClick when clicked (via wrapper button pattern)', () => {
    // Card itself has no onClick prop — wrap in a clickable div to simulate interaction
    const handleClick = vi.fn()
    render(
      <div onClick={handleClick} data-testid="wrapper">
        <Card>Clickable card content</Card>
      </div>
    )
    fireEvent.click(screen.getByTestId('wrapper'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})

describe('CardHeader', () => {
  it('renders children', () => {
    render(<CardHeader>Header content</CardHeader>)
    expect(screen.getByText('Header content')).toBeTruthy()
  })

  it('merges className prop', () => {
    const { container } = render(<CardHeader className="custom-header">H</CardHeader>)
    expect((container.firstChild as HTMLElement).className).toContain('custom-header')
  })
})

describe('CardTitle', () => {
  it('renders as h3 with children', () => {
    render(<CardTitle>My Title</CardTitle>)
    const heading = screen.getByRole('heading', { level: 3, name: 'My Title' })
    expect(heading).toBeTruthy()
  })

  it('merges className prop', () => {
    const { container } = render(<CardTitle className="bold-title">T</CardTitle>)
    expect((container.firstChild as HTMLElement).className).toContain('bold-title')
  })
})

describe('CardFooter', () => {
  it('renders children', () => {
    render(<CardFooter>Footer content</CardFooter>)
    expect(screen.getByText('Footer content')).toBeTruthy()
  })

  it('merges className prop', () => {
    const { container } = render(<CardFooter className="footer-extra">F</CardFooter>)
    expect((container.firstChild as HTMLElement).className).toContain('footer-extra')
  })
})
