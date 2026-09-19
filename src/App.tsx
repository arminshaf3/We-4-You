import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { SubscriptionsPage } from './pages/public/SubscriptionsPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { RegistrationConfirmationPage } from './pages/public/RegistrationConfirmationPage';
import { ContactPage } from './pages/public/ContactPage';
import { FoundBandPage } from './pages/public/FoundBandPage';
import { FaqPage } from './pages/public/FaqPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { TermsPage } from './pages/public/TermsPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { OverviewDashboard } from './pages/admin/OverviewDashboard';
import { RegistrationsListPage } from './pages/admin/RegistrationsListPage';
import { RegistrationDetailPage } from './pages/admin/RegistrationDetailPage';
import { ChildrenListPage } from './pages/admin/ChildrenListPage';
import { ChildDetailPage } from './pages/admin/ChildDetailPage';
import { BandsListPage } from './pages/admin/BandsListPage';
import { VendorsListPage } from './pages/admin/VendorsListPage';
import { VendorDetailPage } from './pages/admin/VendorDetailPage';
import { PlansConfigPage } from './pages/admin/PlansConfigPage';
import { SubscriptionsListPage } from './pages/admin/SubscriptionsListPage';
import { PaymentsListPage } from './pages/admin/PaymentsListPage';
import { CommissionsListPage } from './pages/admin/CommissionsListPage';
import { PayoutsListPage } from './pages/admin/PayoutsListPage';
import { IncidentsListPage } from './pages/admin/IncidentsListPage';
import { IncidentDetailPage } from './pages/admin/IncidentDetailPage';
import { EnquiriesListPage } from './pages/admin/EnquiriesListPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { ActivityHistoryPage } from './pages/admin/ActivityHistoryPage';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Website Routes with Shared PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/registration/confirmation" element={<RegistrationConfirmationPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/found-band" element={<FoundBandPage />} />
            <Route path="/band/:publicCode" element={<FoundBandPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin Login Route (standalone) */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Administrator Demonstration Dashboard Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<OverviewDashboard />} />
            <Route path="registrations" element={<RegistrationsListPage />} />
            <Route path="registrations/:id" element={<RegistrationDetailPage />} />
            <Route path="children" element={<ChildrenListPage />} />
            <Route path="children/:id" element={<ChildDetailPage />} />
            <Route path="bands" element={<BandsListPage />} />
            <Route path="vendors" element={<VendorsListPage />} />
            <Route path="vendors/:id" element={<VendorDetailPage />} />
            <Route path="plans" element={<PlansConfigPage />} />
            <Route path="subscriptions" element={<SubscriptionsListPage />} />
            <Route path="payments" element={<PaymentsListPage />} />
            <Route path="commissions" element={<CommissionsListPage />} />
            <Route path="payouts" element={<PayoutsListPage />} />
            <Route path="incidents" element={<IncidentsListPage />} />
            <Route path="incidents/:id" element={<IncidentDetailPage />} />
            <Route path="enquiries" element={<EnquiriesListPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="activity" element={<ActivityHistoryPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};
export default App;
