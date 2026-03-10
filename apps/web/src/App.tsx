import { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { OfflineBanner } from './components/OfflineBanner'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/guards/ProtectedRoute'
import { PortalLayout } from '@/layouts/PortalLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import CommandPalette, { CommandPaletteProvider } from '@/components/CommandPalette'
import {
  LandingPage,
  LoginPage,
  ForgotPasswordPage,
  ChangePasswordPage,
  DashboardPage,
  DocumentsPage,
  RoadmapPage,
  ProgressPage,
  TimelinePage,
  MeetingsPage,
  InvoicesPage,
  NotificationsPage,
  SettingsPage,
  AdminDashboardPage,
  AdminClientsPage,
  AdminProjectsPage,
  AdminDocumentsPage,
  AdminInvoicesPage,
  AdminMeetingsPage,
  AdminUsersPage,
  AdminCommentsPage,
  AdminActivityPage,
  AdminAnalyticsPage,
  NotFoundPage,
  ForbiddenPage,
} from '@/routes'

import { useAuth } from '@/contexts/AuthContext'

function SuspenseFallback() {
  return <PageSkeleton />
}

function AppRoutes() {
  const { isInitializing } = useAuth()

  // Show full-screen skeleton while restoring session from cookie
  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl gradient-primary animate-pulse" />
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--primary-500)', borderTopColor: 'transparent' }} />
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />

      {/* ── Client Portal ── */}
      <Route path="/portal" element={<ProtectedRoute requiredRole="client"><PortalLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="roadmap" element={<RoadmapPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="meetings" element={<MeetingsPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* ── Admin Portal ── */}
      <Route path="/admin" element={<ProtectedRoute requiredRole={['admin', 'manager']}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="clients" element={<AdminClientsPage />} />
        <Route path="projects" element={<AdminProjectsPage />} />
        <Route path="documents" element={<AdminDocumentsPage />} />
        <Route path="invoices" element={<AdminInvoicesPage />} />
        <Route path="meetings" element={<AdminMeetingsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="comments" element={<AdminCommentsPage />} />
        <Route path="activity" element={<AdminActivityPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
      </Route>

      {/* ── Error Pages ── */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <>
      <OfflineBanner />
      <ThemeProvider>
      <AuthProvider>
        <CommandPaletteProvider>
          <Suspense fallback={<SuspenseFallback />}>
            <AppRoutes />
          </Suspense>
          <CommandPalette />
        </CommandPaletteProvider>
      </AuthProvider>
    </ThemeProvider>
    </>
  )
}
