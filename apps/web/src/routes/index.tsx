import { lazy } from 'react'

// ── Public ──
export const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
export const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
export const LandingPage = lazy(() => import('@/pages/LandingPage'))

// ── Client Portal ──
export const DashboardPage = lazy(() => import('@/pages/portal/DashboardPage'))
export const DocumentsPage = lazy(() => import('@/pages/portal/DocumentsPage'))
export const RoadmapPage = lazy(() => import('@/pages/portal/RoadmapPage'))
export const ProgressPage = lazy(() => import('@/pages/portal/ProgressPage'))
export const TimelinePage = lazy(() => import('@/pages/portal/TimelinePage'))
export const MeetingsPage = lazy(() => import('@/pages/portal/MeetingsPage'))
export const InvoicesPage = lazy(() => import('@/pages/portal/InvoicesPage'))
export const NotificationsPage = lazy(() => import('@/pages/portal/NotificationsPage'))
export const SettingsPage = lazy(() => import('@/pages/portal/SettingsPage'))

// ── Admin Portal ──
export const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
export const AdminClientsPage = lazy(() => import('@/pages/admin/AdminClientsPage'))
export const AdminProjectsPage = lazy(() => import('@/pages/admin/AdminProjectsPage'))
export const AdminDocumentsPage = lazy(() => import('@/pages/admin/AdminDocumentsPage'))
export const AdminInvoicesPage = lazy(() => import('@/pages/admin/AdminInvoicesPage'))
export const AdminMeetingsPage = lazy(() => import('@/pages/admin/AdminMeetingsPage'))
export const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'))
export const AdminCommentsPage = lazy(() => import('@/pages/admin/AdminCommentsPage'))
export const AdminActivityPage = lazy(() => import('@/pages/admin/AdminActivityPage'))
export const AdminAnalyticsPage = lazy(() => import('@/pages/admin/AdminAnalyticsPage'))

// ── Error Pages ──
export const NotFoundPage = lazy(() => import('@/pages/errors/NotFoundPage'))
export const ForbiddenPage = lazy(() => import('@/pages/errors/ForbiddenPage'))
