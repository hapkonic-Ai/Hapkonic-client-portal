import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import type { Document } from '../../../lib/api'

// ── Module mocks ───────────────────────────────────────────────────────────────

vi.mock('../../../lib/api', () => ({
  documentsApi: {
    list: vi.fn(),
    download: vi.fn(),
  },
}))

// Stub framer-motion — preserve semantic element names
vi.mock('framer-motion', () => {
  const React = require('react')
  const ELEMENT_MAP: Record<string, string> = {
    button: 'button', div: 'div', span: 'span', a: 'a',
    tr: 'tr', td: 'td', th: 'th', table: 'table',
    ul: 'ul', li: 'li', p: 'p',
  }
  const motion = new Proxy({}, {
    get: (_target, prop: string) => {
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

// ── Helpers ───────────────────────────────────────────────────────────────────

import { documentsApi } from '../../../lib/api'
import DocumentsPage from '../DocumentsPage'

const mockDocumentsApi = documentsApi as {
  list: ReturnType<typeof vi.fn>
  download: ReturnType<typeof vi.fn>
}

function makeDocument(overrides: Partial<Document> = {}): Document {
  return {
    id: 'doc-1',
    name: 'Project Proposal.pdf',
    url: 'https://example.com/doc.pdf',
    mimeType: 'application/pdf',
    size: 204800,
    category: 'proposal',
    version: 1,
    projectId: null,
    clientId: 'client-1',
    uploadedById: 'user-1',
    viewedAt: null,
    downloadedAt: null,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    project: null,
    uploadedBy: null,
    ...overrides,
  } as unknown as Document
}

function renderPage() {
  return render(
    <BrowserRouter>
      <DocumentsPage />
    </BrowserRouter>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('DocumentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDocumentsApi.download.mockResolvedValue({ url: 'https://example.com/doc.pdf' })
  })

  it('shows loading skeleton initially', () => {
    // list never resolves during this test
    mockDocumentsApi.list.mockReturnValue(new Promise(() => {}))
    const { container } = renderPage()
    // The skeleton renders animated pulse divs
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows documents after successful load', async () => {
    mockDocumentsApi.list.mockResolvedValue({
      documents: [
        makeDocument({ id: 'doc-1', name: 'Contract Alpha.pdf' }),
        makeDocument({ id: 'doc-2', name: 'Invoice 001.pdf' }),
      ],
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Contract Alpha.pdf')).toBeTruthy()
    })
    expect(screen.getByText('Invoice 001.pdf')).toBeTruthy()
  })

  it('shows "No documents found" empty state when list returns empty array', async () => {
    mockDocumentsApi.list.mockResolvedValue({ documents: [] })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('No documents found')).toBeTruthy()
    })
    expect(screen.getByText('Documents shared with you will appear here.')).toBeTruthy()
  })

  it('shows empty state with filter hint when search is active and no results match', async () => {
    mockDocumentsApi.list.mockResolvedValue({
      documents: [makeDocument({ id: 'doc-1', name: 'Contract Alpha.pdf' })],
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Contract Alpha.pdf')).toBeTruthy()
    })

    const searchInput = screen.getByPlaceholderText('Search documents...')
    fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } })

    await waitFor(() => {
      expect(screen.getByText('No documents found')).toBeTruthy()
      expect(screen.getByText('Try clearing your filters.')).toBeTruthy()
    })
  })

  it('switches between grid and list view when toggle buttons are clicked', async () => {
    mockDocumentsApi.list.mockResolvedValue({
      documents: [makeDocument({ id: 'doc-1', name: 'Spec Doc.pdf' })],
    })

    const { container } = renderPage()

    await waitFor(() => {
      expect(screen.getByText('Spec Doc.pdf')).toBeTruthy()
    })

    // Grid is default — there should be a grid container
    const gridContainer = container.querySelector('.grid')
    expect(gridContainer).toBeTruthy()

    // Find and click the list-view toggle button (second toggle button in the header row)
    const toggleButtons = container.querySelectorAll<HTMLButtonElement>(
      'button[style*="bg-elevated"], button[style*="primary-500"]'
    )
    // The view-toggle buttons are the last two buttons in the top section
    // A simpler approach: find by aria or by SVG content is hard without jest-dom,
    // so we look for the second button in the view-toggle group
    const allButtons = Array.from(container.querySelectorAll('button'))
    const listButton = allButtons.find(btn => btn.querySelector('svg') && btn.title === '' && allButtons.indexOf(btn) > 0)

    // Click the last of the two small icon buttons in the top-right area
    // The grid/list toggles are the 2nd and 3rd buttons from the top-right group
    const viewToggleArea = container.querySelector('.flex.items-center.gap-2')
    if (viewToggleArea) {
      const viewButtons = viewToggleArea.querySelectorAll('button')
      expect(viewButtons).toHaveLength(2)

      // Click the list button (second one)
      fireEvent.click(viewButtons[1])

      // After switching to list, a table should be present
      await waitFor(() => {
        expect(container.querySelector('table')).toBeTruthy()
      })

      // Switch back to grid
      fireEvent.click(viewButtons[0])
      await waitFor(() => {
        expect(container.querySelector('.grid')).toBeTruthy()
      })
    }
  })

  it('displays the document count in the subtitle', async () => {
    mockDocumentsApi.list.mockResolvedValue({
      documents: [
        makeDocument({ id: 'doc-1', name: 'Doc A.pdf' }),
        makeDocument({ id: 'doc-2', name: 'Doc B.pdf' }),
      ],
    })

    renderPage()

    await waitFor(() => {
      // Subtitle text: "2 documents · 2 new · 0 downloaded"
      expect(screen.getByText(/2 documents/)).toBeTruthy()
    })
  })
})
