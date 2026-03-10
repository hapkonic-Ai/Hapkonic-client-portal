import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button, type ButtonVariant } from '../Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeTruthy()
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Submit</Button>)
    fireEvent.click(screen.getByText('Submit'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('has disabled attribute when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    const btn = screen.getByRole('button', { name: 'Disabled' })
    expect(btn).toBeDisabled()
  })

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Disabled</Button>)
    fireEvent.click(screen.getByRole('button', { name: 'Disabled' }))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('shows loading spinner and is disabled when loading=true', () => {
    render(<Button loading>Save</Button>)
    const btn = screen.getByRole('button')
    // When loading, children text is still in DOM but spinner replaces leftIcon area
    expect(btn).toBeDisabled()
    // Loader2 renders as an svg inside the button
    expect(btn.querySelector('svg')).toBeTruthy()
  })

  it('does not call onClick when loading', () => {
    const handleClick = vi.fn()
    render(<Button loading onClick={handleClick}>Save</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  const variants: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'destructive']
  variants.forEach(variant => {
    it(`renders variant="${variant}" without crashing`, () => {
      render(<Button variant={variant}>{variant}</Button>)
      expect(screen.getByRole('button', { name: variant })).toBeTruthy()
    })
  })

  it('merges className prop', () => {
    const { container } = render(<Button className="my-custom">Label</Button>)
    const btn = container.querySelector('button')!
    expect(btn.className).toContain('my-custom')
  })

  it('renders leftIcon when not loading', () => {
    const Icon = () => <span data-testid="left-icon">L</span>
    render(<Button leftIcon={<Icon />}>With icon</Button>)
    expect(screen.getByTestId('left-icon')).toBeTruthy()
  })

  it('does not render leftIcon when loading', () => {
    const Icon = () => <span data-testid="left-icon">L</span>
    render(<Button loading leftIcon={<Icon />}>With icon</Button>)
    expect(screen.queryByTestId('left-icon')).toBeNull()
  })

  it('renders rightIcon when not loading', () => {
    const Icon = () => <span data-testid="right-icon">R</span>
    render(<Button rightIcon={<Icon />}>With right icon</Button>)
    expect(screen.getByTestId('right-icon')).toBeTruthy()
  })
})
