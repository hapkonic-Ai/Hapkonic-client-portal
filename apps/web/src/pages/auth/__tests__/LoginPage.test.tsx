import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// ── Module mocks ───────────────────────────────────────────────────────────────

// Mock Three.js to avoid WebGL requirements in jsdom
vi.mock('three', () => {
  const noop = () => {}

  // A shared mutable position/rotation object factory
  const vec3 = () => ({ x: 0, y: 0, z: 0, set: noop })

  class MockBase {
    position = vec3()
    rotation = vec3()
    aspect = 1
    set() {}
    setSize() {}
    setPixelRatio() {}
    setClearColor() {}
    render() {}
    dispose() {}
    lookAt() {}
    updateProjectionMatrix() {}
    clone() { return new MockBase() }
    add() {}
  }

  class WebGLRenderer extends MockBase {
    domElement = document.createElement('canvas')
    setSize() {}
    setPixelRatio() {}
    setClearColor() {}
    render() {}
    dispose() {}
  }

  class Mesh extends MockBase {
    add() {}
  }

  class Scene extends MockBase {
    add() {}
  }

  class PerspectiveCamera extends MockBase {
    position = vec3()
  }

  class PointLight extends MockBase {
    position = vec3()
  }

  class Clock {
    getElapsedTime() { return 0 }
  }

  return {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    MeshBasicMaterial: class MockMat extends MockBase { clone() { return new MockMat() } },
    MeshStandardMaterial: MockBase,
    Mesh,
    IcosahedronGeometry: MockBase,
    OctahedronGeometry: MockBase,
    TorusGeometry: MockBase,
    TetrahedronGeometry: MockBase,
    AmbientLight: MockBase,
    PointLight,
    Clock,
  }
})

// Stub framer-motion — preserve semantic element names so buttons remain buttons
vi.mock('framer-motion', () => {
  const React = require('react')
  // Map motion.X to the underlying HTML element X (button -> button, div -> div, etc.)
  const ELEMENT_MAP: Record<string, string> = {
    button: 'button',
    div: 'div',
    span: 'span',
    a: 'a',
    p: 'p',
    ul: 'ul',
    li: 'li',
    tr: 'tr',
    td: 'td',
  }
  const motion = new Proxy({}, {
    get: (_: unknown, prop: string) => {
      const tag = ELEMENT_MAP[prop] ?? 'div'
      return React.forwardRef(
        ({ children, animate, initial, exit, transition, whileTap, whileHover, variants, ...rest }: React.PropsWithChildren<Record<string, unknown>>, ref: React.Ref<unknown>) =>
          React.createElement(tag, { ref, ...rest }, children)
      )
    },
  })
  return {
    motion,
    AnimatePresence: ({ children }: React.PropsWithChildren) => React.createElement(React.Fragment, null, children),
  }
})

// Mock the API
vi.mock('../../../lib/api', () => ({
  authApi: {
    login: vi.fn(),
  },
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
}))

// Mock AuthContext
const mockLogin = vi.fn()
const mockUseAuth = vi.fn()
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock react-router-dom navigate (keep BrowserRouter but override useNavigate)
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// ── Helpers ───────────────────────────────────────────────────────────────────

import { authApi } from '../../../lib/api'
import LoginPage from '../LoginPage'

const mockAuthApi = authApi as { login: ReturnType<typeof vi.fn> }

function renderLoginPage() {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: user is not authenticated
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      user: null,
    })
  })

  it('renders email and password fields', () => {
    renderLoginPage()
    expect(screen.getByPlaceholderText('you@company.com')).toBeTruthy()
    expect(screen.getByPlaceholderText('••••••••')).toBeTruthy()
  })

  it('renders the sign-in button', () => {
    renderLoginPage()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy()
  })

  it('calls authApi.login with email and password on form submit', async () => {
    mockAuthApi.login.mockResolvedValue({
      accessToken: 'test-token',
      user: {
        id: 'u1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'client',
        clientId: 'c1',
        forcePasswordReset: false,
      },
    })

    renderLoginPage()

    fireEvent.change(screen.getByPlaceholderText('you@company.com'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'mypassword' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockAuthApi.login).toHaveBeenCalledWith('test@example.com', 'mypassword')
    })
  })

  it('calls login context function with user and token on successful submit', async () => {
    const fakeUser = {
      id: 'u1',
      email: 'jane@company.com',
      name: 'Jane Doe',
      role: 'client',
      clientId: 'c1',
      forcePasswordReset: false,
    }
    mockAuthApi.login.mockResolvedValue({ accessToken: 'tok123', user: fakeUser })

    renderLoginPage()

    fireEvent.change(screen.getByPlaceholderText('you@company.com'), {
      target: { value: 'jane@company.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'secret' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'jane@company.com', role: 'client' }),
        'tok123'
      )
    })
  })

  it('shows error message when login fails', async () => {
    mockAuthApi.login.mockRejectedValue(new Error('Invalid credentials'))

    renderLoginPage()

    fireEvent.change(screen.getByPlaceholderText('you@company.com'), {
      target: { value: 'bad@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'wrongpass' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeTruthy()
    })
  })

  it('redirects client to /portal/dashboard when already authenticated', () => {
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: true,
      user: {
        id: 'u1',
        email: 'client@co.com',
        name: 'Client User',
        role: 'client',
        forcePasswordReset: false,
      },
    })

    renderLoginPage()

    expect(mockNavigate).toHaveBeenCalledWith('/portal/dashboard', { replace: true })
  })

  it('redirects admin to /admin/dashboard when already authenticated', () => {
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: true,
      user: {
        id: 'u2',
        email: 'admin@co.com',
        name: 'Admin User',
        role: 'admin',
        forcePasswordReset: false,
      },
    })

    renderLoginPage()

    expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard', { replace: true })
  })
})
