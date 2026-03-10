import { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/guards/ProtectedRoute'
import { PortalLayout } from '@/layouts/PortalLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import {
  LandingPage,
  LoginPage,
  ForgotPasswordPage,
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

function SuspenseFallback() {
  return <PageSkeleton />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={<SuspenseFallback />}>
          <Routes>
            {/* ── Public ── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* ── Client Portal ── */}
            <Route
              path="/portal"
              element={
                <ProtectedRoute requiredRole="client">
                  <PortalLayout />
                </ProtectedRoute>
              }
            >
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
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole={['admin', 'manager']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
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
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  )
}
