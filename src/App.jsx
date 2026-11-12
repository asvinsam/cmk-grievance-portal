import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/ProtectedRoute.jsx';
import { PublicLayout } from './components/layout/PublicLayout.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';

// Public pages
import HomePage from './pages/public/HomePage.jsx';
import AboutPage from './pages/public/AboutPage.jsx';
import HowItWorksPage from './pages/public/HowItWorksPage.jsx';
import DepartmentsPage from './pages/public/DepartmentsPage.jsx';
import TrackPage from './pages/public/TrackPage.jsx';
import ContactPage from './pages/public/ContactPage.jsx';
import FAQPage from './pages/public/FAQPage.jsx';

// Auth pages
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';

// Citizen pages
import CitizenDashboard from './pages/citizen/CitizenDashboard.jsx';
import SubmitGrievancePage from './pages/citizen/SubmitGrievancePage.jsx';
import CitizenGrievancesPage from './pages/citizen/CitizenGrievancesPage.jsx';
import GrievanceDetailPage from './pages/citizen/GrievanceDetailPage.jsx';
import NotificationsPage from './pages/citizen/NotificationsPage.jsx';

// CMO pages
import CMODashboard from './pages/cmo/CMODashboard.jsx';
import CMOGrievancesPage from './pages/cmo/CMOGrievancesPage.jsx';
import CMOGrievanceDetailPage from './pages/cmo/CMOGrievanceDetailPage.jsx';
import CMOStatsPage from './pages/cmo/CMOStatsPage.jsx';

// Officer pages
import OfficerDashboard from './pages/officer/OfficerDashboard.jsx';
import OfficerGrievancesPage from './pages/officer/OfficerGrievancesPage.jsx';
import OfficerGrievanceDetailPage from './pages/officer/OfficerGrievanceDetailPage.jsx';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/how-it-works" element={<PublicLayout><HowItWorksPage /></PublicLayout>} />
        <Route path="/departments" element={<PublicLayout><DepartmentsPage /></PublicLayout>} />
        <Route path="/track" element={<PublicLayout><TrackPage /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/faq" element={<PublicLayout><FAQPage /></PublicLayout>} />

        {/* Auth routes */}
        <Route path="/login" element={<PublicOnlyRoute><PublicLayout><LoginPage /></PublicLayout></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><PublicLayout><RegisterPage /></PublicLayout></PublicOnlyRoute>} />

        {/* Citizen routes */}
        <Route path="/citizen/dashboard" element={
          <ProtectedRoute roles={['CITIZEN']}>
            <DashboardLayout><CitizenDashboard /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/citizen/submit" element={
          <ProtectedRoute roles={['CITIZEN']}>
            <DashboardLayout><SubmitGrievancePage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/citizen/grievances" element={
          <ProtectedRoute roles={['CITIZEN']}>
            <DashboardLayout><CitizenGrievancesPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/citizen/grievances/:id" element={
          <ProtectedRoute roles={['CITIZEN']}>
            <DashboardLayout><GrievanceDetailPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/citizen/notifications" element={
          <ProtectedRoute roles={['CITIZEN']}>
            <DashboardLayout><NotificationsPage /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* CMO routes */}
        <Route path="/cmo/dashboard" element={
          <ProtectedRoute roles={['CMO_ADMIN']}>
            <DashboardLayout><CMODashboard /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/cmo/grievances" element={
          <ProtectedRoute roles={['CMO_ADMIN']}>
            <DashboardLayout><CMOGrievancesPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/cmo/grievances/:id" element={
          <ProtectedRoute roles={['CMO_ADMIN']}>
            <DashboardLayout><CMOGrievanceDetailPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/cmo/stats" element={
          <ProtectedRoute roles={['CMO_ADMIN']}>
            <DashboardLayout><CMOStatsPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/cmo/notifications" element={
          <ProtectedRoute roles={['CMO_ADMIN']}>
            <DashboardLayout><NotificationsPage /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Officer routes */}
        <Route path="/officer/dashboard" element={
          <ProtectedRoute roles={['DEPT_OFFICER']}>
            <DashboardLayout><OfficerDashboard /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/officer/grievances" element={
          <ProtectedRoute roles={['DEPT_OFFICER']}>
            <DashboardLayout><OfficerGrievancesPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/officer/grievances/:id" element={
          <ProtectedRoute roles={['DEPT_OFFICER']}>
            <DashboardLayout><OfficerGrievanceDetailPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/officer/notifications" element={
          <ProtectedRoute roles={['DEPT_OFFICER']}>
            <DashboardLayout><NotificationsPage /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
