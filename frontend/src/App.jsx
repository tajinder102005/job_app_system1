import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Pages
import LandingPage from './pages/landing/LandingPage';
import AuthPage from './pages/auth/AuthPage';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import MyApplicationsPage from './pages/candidate/MyApplicationsPage';
import SavedJobsPage from './pages/candidate/SavedJobsPage';

import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import MyJobsPage from './pages/recruiter/MyJobsPage';
import ApplicationsPage from './pages/recruiter/ApplicationsPage';
import InterviewsPage from './pages/recruiter/InterviewsPage';
import AgenticHiringPage from './pages/recruiter/AgenticHiringPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import CompanyVerificationPage from './pages/admin/CompanyVerificationPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';

// Shared Pages
import JobsPage from './pages/shared/JobsPage';
import CompaniesPage from './pages/shared/CompaniesPage';
import ReviewsPage from './pages/shared/ReviewsPage';
import ProfilePage from './pages/shared/ProfilePage';

function DashboardRouter() {
  const { role, ROLES } = useAuth();
  if (role === ROLES.ADMIN) {
    return <AdminDashboard />;
  }
  if (role === ROLES.RECRUITER) {
    return <RecruiterDashboard />;
  }
  return <CandidateDashboard />;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Authentication Form */}
              <Route path="/auth" element={<AuthPage />} />

              {/* Protected Workspace Layout */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  {/* Dynamic Role Dashboard */}
                  <Route path="/dashboard" element={<DashboardRouter />} />

                  {/* Shared Explorer Pages */}
                  <Route path="/jobs" element={<JobsPage />} />
                  <Route path="/companies" element={<CompaniesPage />} />
                  <Route path="/reviews" element={<ReviewsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />

                  {/* Candidate Workflows */}
                  <Route element={<RoleRoute allowed={['CANDIDATE']} />}>
                    <Route path="/my-applications" element={<MyApplicationsPage />} />
                    <Route path="/saved-jobs" element={<SavedJobsPage />} />
                  </Route>

                  {/* Recruiter Workflows */}
                  <Route element={<RoleRoute allowed={['RECRUITER']} />}>
                    <Route path="/my-jobs" element={<MyJobsPage />} />
                    <Route path="/applications" element={<ApplicationsPage />} />
                    <Route path="/interviews" element={<InterviewsPage />} />
                  </Route>

                  {/* AI Agentic Hiring Workflow (Recruiter & Admin) */}
                  <Route element={<RoleRoute allowed={['RECRUITER', 'ADMIN']} />}>
                    <Route path="/agentic-hiring" element={<AgenticHiringPage />} />
                  </Route>

                  {/* Admin Workflows */}
                  <Route element={<RoleRoute allowed={['ADMIN']} />}>
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/company-verification" element={<CompanyVerificationPage />} />
                    <Route path="/audit-logs" element={<AuditLogsPage />} />
                  </Route>
                </Route>
              </Route>

              {/* Fallback to Landing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}