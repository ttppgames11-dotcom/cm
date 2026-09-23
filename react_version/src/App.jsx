import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ScopeProvider } from './context/ScopeContext';
import AppLayout from './components/layout/AppLayout';

// Core React Pages
import HomePage from './pages/home/HomePage';
import HistoryPage from './pages/history/HistoryPage';
import FortsMapPage from './pages/forts/FortsMapPage';
import MaharashtraNetworkPage from './pages/network/MaharashtraNetworkPage';
import DigitalMemberCardPage from './pages/member/DigitalMemberCardPage';
import RegisterWizardPage from './pages/member/RegisterWizardPage';
import LoginPage from './pages/member/LoginPage';
import MemberDashboardPage from './pages/member/MemberDashboardPage';
import BusinessSangamPage from './pages/sangam/BusinessSangamPage';
import ReferralsTrackerPage from './pages/sangam/ReferralsTrackerPage';
import CreateReferralPage from './pages/sangam/CreateReferralPage';
import AdminERPPage from './pages/admin/AdminERPPage';
import CEODashboardPage from './pages/admin/CEODashboardPage';
import GenericArticlePage from './pages/common/GenericArticlePage';

// Automatic Clean Redirects for any legacy .html URL
const legacyRedirects = [
  { from: '/index.html', to: '/' },
  { from: '/cm-home.html', to: '/' },
  { from: '/cm-history.html', to: '/history' },
  { from: '/cm-forts-map.html', to: '/forts' },
  { from: '/cm-heritage-map.html', to: '/forts' },
  { from: '/cm-heritage-trails.html', to: '/forts' },
  { from: '/cm-network.html', to: '/network' },
  { from: '/cm-card.html', to: '/card' },
  { from: '/cm-register.html', to: '/register' },
  { from: '/cm-onboarding.html', to: '/register' },
  { from: '/cm-login.html', to: '/login' },
  { from: '/cm-dashboard.html', to: '/dashboard' },
  { from: '/cm-profile.html', to: '/dashboard' },
  { from: '/cm-profile-edit.html', to: '/dashboard' },
  { from: '/cm-settings.html', to: '/dashboard' },
  { from: '/cm-business-sangam.html', to: '/sangam' },
  { from: '/cm-my-business-mandal.html', to: '/business/mandal' },
  { from: '/cm-chapter-detail.html', to: '/business/mandal' },
  { from: '/cm-business-membership-application.html', to: '/business/membership-application' },
  { from: '/cm-business-opportunities.html', to: '/business/opportunities' },
  { from: '/cm-one-to-one-meetings.html', to: '/business/meetings' },
  { from: '/cm-business-directory.html', to: '/business/directory' },
  { from: '/cm-referrals.html', to: '/referrals' },
  { from: '/cm-create-referral.html', to: '/create-referral' },
  { from: '/cm-referral-detail.html', to: '/referrals' },
  { from: '/cm-admin.html', to: '/admin' },
  { from: '/cm-ceo-dashboard.html', to: '/ceo' },
  { from: '/cm-shivaji-maharaj.html', to: '/history/shivaji-maharaj' },
  { from: '/cm-sambhaji-maharaj.html', to: '/history/sambhaji-maharaj' },
  { from: '/cm-rajmata-jijau.html', to: '/history/rajmata-jijau' },
  { from: '/cm-bajirao-peshwa.html', to: '/history/bajirao-peshwa' },
  { from: '/cm-rajaram-maharaj.html', to: '/history/rajaram-maharaj' },
  { from: '/cm-tarabai.html', to: '/history/tarabai' },
  { from: '/cm-shahu-maharaj.html', to: '/history/shahu-maharaj' },
  { from: '/cm-warriors.html', to: '/history/warriors' },
  { from: '/cm-mavale.html', to: '/history/warriors' },
  { from: '/cm-battles.html', to: '/history/battles' },
  { from: '/cm-maratha-navy.html', to: '/history/navy' },
  { from: '/cm-panhala-pavankhind.html', to: '/forts/panhala-pavankhind' },
  { from: '/cm-raigad-fort.html', to: '/forts/raigad' },
  { from: '/cm-pratapgad-fort.html', to: '/forts/pratapgad' },
  { from: '/cm-rajgad-fort.html', to: '/forts/rajgad' },
  { from: '/cm-shivneri-fort.html', to: '/forts/shivneri' },
  { from: '/cm-torna-fort.html', to: '/forts/torna' },
  { from: '/cm-about.html', to: '/about' },
  { from: '/cm-achievers.html', to: '/about' },
  { from: '/cm-community.html', to: '/community' },
  { from: '/cm-contact.html', to: '/contact' },
  { from: '/cm-events.html', to: '/events' },
  { from: '/cm-services.html', to: '/services' },
  { from: '/cm-donation.html', to: '/donation' },
  { from: '/cm-directory-people.html', to: '/directory' },
  { from: '/cm-governance.html', to: '/governance' },
  { from: '/cm-leaders.html', to: '/leaders' },
  { from: '/cm-culture.html', to: '/culture' },
  { from: '/cm-gallery.html', to: '/gallery' },
  { from: '/cm-symbols.html', to: '/symbols' },
  { from: '/cm-temples.html', to: '/temples' },
  { from: '/cm-jobs.html', to: '/jobs' },
  { from: '/cm-education.html', to: '/education' }
];

export default function App() {
  return (
    <AuthProvider>
      <ScopeProvider>
        <Routes>
          {/* Automatic Clean Redirects from legacy .html to clean React routes */}
          {legacyRedirects.map((r, i) => (
            <Route key={i} path={r.from} element={<Navigate to={r.to} replace />} />
          ))}

          {/* All Application Pages Wrapped Inside AppLayout */}
          <Route element={<AppLayout />}>
            {/* 100% Modern Clean React Routes (No HTML Format) */}
            <Route path="/" element={<HomePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/history/:slug" element={<GenericArticlePage />} />
            <Route path="/forts" element={<FortsMapPage />} />
            <Route path="/forts/:slug" element={<GenericArticlePage />} />
            <Route path="/network" element={<MaharashtraNetworkPage />} />
            <Route path="/card" element={<DigitalMemberCardPage />} />
            <Route path="/register" element={<RegisterWizardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<MemberDashboardPage />} />
            <Route path="/sangam" element={<BusinessSangamPage />} />
            <Route path="/referrals" element={<ReferralsTrackerPage />} />
            <Route path="/create-referral" element={<CreateReferralPage />} />
            <Route path="/referrals/create" element={<CreateReferralPage />} />
            <Route path="/admin" element={<AdminERPPage />} />
            <Route path="/ceo" element={<CEODashboardPage />} />
            <Route path="/ceo-dashboard" element={<CEODashboardPage />} />

            {/* Content, Organization & Social Pages */}
            <Route path="/about" element={<GenericArticlePage />} />
            <Route path="/contact" element={<GenericArticlePage />} />
            <Route path="/community" element={<GenericArticlePage />} />
            <Route path="/events" element={<GenericArticlePage />} />
            <Route path="/services" element={<GenericArticlePage />} />
            <Route path="/directory" element={<GenericArticlePage />} />
            <Route path="/donation" element={<GenericArticlePage />} />
            <Route path="/gallery" element={<GenericArticlePage />} />
            <Route path="/culture" element={<GenericArticlePage />} />
            <Route path="/governance" element={<GenericArticlePage />} />
            <Route path="/leaders" element={<GenericArticlePage />} />
            <Route path="/temples" element={<GenericArticlePage />} />
            <Route path="/symbols" element={<GenericArticlePage />} />
            <Route path="/jobs" element={<GenericArticlePage />} />
            <Route path="/education" element={<GenericArticlePage />} />

            {/* Business Sangam Subroutes */}
            <Route path="/business/directory" element={<GenericArticlePage />} />
            <Route path="/business/meetings" element={<GenericArticlePage />} />
            <Route path="/business/opportunities" element={<GenericArticlePage />} />
            <Route path="/business/mandal" element={<BusinessSangamPage />} />
            <Route path="/business/list" element={<GenericArticlePage />} />
            <Route path="/business/membership-application" element={<BusinessSangamPage />} />

            {/* Generic Article Route */}
            <Route path="/article/:slug" element={<GenericArticlePage />} />

            {/* Catch-all */}
            <Route path="*" element={<GenericArticlePage />} />
          </Route>
        </Routes>
      </ScopeProvider>
    </AuthProvider>
  );
}
