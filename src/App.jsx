import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ScopeProvider } from './context/ScopeContext';
import { SiteContentProvider } from './context/SiteContentContext';
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
import UserProfilePage from './pages/member/UserProfilePage';

// Business Sangam & Directory
import BusinessSangamPage from './pages/sangam/BusinessSangamPage';
import ReferralsTrackerPage from './pages/sangam/ReferralsTrackerPage';
import CreateReferralPage from './pages/sangam/CreateReferralPage';
import MeetingsPortalPage from './pages/sangam/MeetingsPortalPage';
import BusinessDirectoryPage from './pages/business/BusinessDirectoryPage';

// Community, Events, Donations, Jobs
import CommunityFeedPage from './pages/community/CommunityFeedPage';
import EventsCalendarPage from './pages/events/EventsCalendarPage';
import MarathaCalendarPage from './pages/calendar/MarathaCalendarPage';
import DonationsPage from './pages/donation/DonationsPage';
import PeopleDirectoryPage from './pages/directory/PeopleDirectoryPage';
import JobsPortalPage from './pages/jobs/JobsPortalPage';

// Culture, Governance, Admin
import PhotoGalleryPage from './pages/culture/PhotoGalleryPage';
import GovernancePage from './pages/governance/GovernancePage';
import AdminERPPage from './pages/admin/AdminERPPage';
import CEODashboardPage from './pages/admin/CEODashboardPage';
import CEOPage from './pages/admin/CEOPage';
import DistrictAdminCRM from './pages/admin/DistrictAdminCRM';
import ChapterPresidentCRM from './pages/admin/ChapterPresidentCRM';
import SevaHelpdeskCRM from './pages/admin/SevaHelpdeskCRM';
import FinanceLedgerCRM from './pages/admin/FinanceLedgerCRM';
import CRMRoleHubPage from './pages/admin/CRMRoleHubPage';
import CRMLoginPage from './pages/admin/CRMLoginPage';
import CRMProtectedRoute from './components/auth/CRMProtectedRoute';
import MemberProtectedRoute from './components/auth/MemberProtectedRoute';
import SiteContentEditorPage from './pages/admin/SiteContentEditorPage';
import SuperAdminDashboardPage from './pages/admin/SuperAdminDashboardPage';
import SuperAdminPage from './pages/admin/SuperAdminPage';
import AdminShell from './pages/admin/AdminShell';
import ConnectMarathaAIAgentPage from './pages/ai/ConnectMarathaAIAgentPage';
import GenericArticlePage from './pages/common/GenericArticlePage';

// Specialized Converted Feature Pages
import SearchPage from './pages/common/SearchPage';
import DnyankoshPage from './pages/history/DnyankoshPage';
import GranthalayaPage from './pages/history/GranthalayaPage';
import ShivcharitraKathanHubPage from './pages/history/ShivcharitraKathanHubPage';
import BalidanMaasPage from './pages/history/BalidanMaasPage';
import BattlesPage from './pages/history/BattlesPage';
import WarriorsPage from './pages/history/WarriorsPage';
import MarathaNavyPage from './pages/history/MarathaNavyPage';
import HistoricalDatesPage from './pages/history/HistoricalDatesPage';
import SwarajyaAdminPage from './pages/history/SwarajyaAdminPage';
import MarathaQuizPage from './pages/history/MarathaQuizPage';
import HeritageTrailsPage from './pages/forts/HeritageTrailsPage';
import CommunitySafetyPage from './pages/community/CommunitySafetyPage';
import MovementsPage from './pages/community/MovementsPage';
import NewsAnnouncementsPage from './pages/community/NewsAnnouncementsPage';
import NotificationsPage from './pages/member/NotificationsPage';
import MessagesPage from './pages/member/MessagesPage';
import ServiceBookingPage from './pages/jobs/ServiceBookingPage';
import BlueprintVisionPage from './pages/governance/BlueprintVisionPage';
import AboutPage from './pages/governance/AboutPage';
import AchieversPage from './pages/governance/AchieversPage';
import WhyJoinPage from './pages/governance/WhyJoinPage';
import VisionMissionPage from './pages/governance/VisionMissionPage';
import MorePortalsPage from './pages/common/MorePortalsPage';
import SymbolsPage from './pages/culture/SymbolsPage';
import TemplesPage from './pages/culture/TemplesPage';
import RoleEligibilityMatrixPage from './pages/governance/RoleEligibilityMatrixPage';

// Newly Added Community, Culture, Business & Governance Ecosystem Pages
import DoctorsDirectoryPage from './pages/directory/DoctorsDirectoryPage';
import ArtistsDirectoryPage from './pages/culture/ArtistsDirectoryPage';
import MarathaBankPage from './pages/business/MarathaBankPage';
import BuildersDirectoryPage from './pages/business/BuildersDirectoryPage';
import GovernmentOfficersPage from './pages/governance/GovernmentOfficersPage';
import BooksLiteraturePage from './pages/culture/BooksLiteraturePage';
import MarathiMoviesPage from './pages/culture/MarathiMoviesPage';
import MarathaDairyPage from './pages/business/MarathaDairyPage';
import MotivationalSpeakersPage from './pages/culture/MotivationalSpeakersPage';
import MarathaOrganizationsPage from './pages/community/MarathaOrganizationsPage';
import ManufacturersPage from './pages/business/ManufacturersPage';
import MarathaNewsMediaPage from './pages/community/MarathaNewsMediaPage';
import WomenEmpowermentPage from './pages/community/WomenEmpowermentPage';
import PoliticalLeadersPartiesPage from './pages/governance/PoliticalLeadersPartiesPage';
import SocialWorkersPage from './pages/community/SocialWorkersPage';
import BloodHelpPortalPage from './pages/community/BloodHelpPortalPage';
import MatrimonyPortalPage from './pages/community/MatrimonyPortalPage';

// Maharashtra Culture & Heritage Knowledge Graph (8 Major Pillars)
import MaharashtraCultureHubPage from './pages/culture/MaharashtraCultureHubPage';
import MarathiDialectsArchivePage from './pages/culture/MarathiDialectsArchivePage';
import MaharashtraFoodCulturePage from './pages/culture/MaharashtraFoodCulturePage';
import GramdevatJatraPage from './pages/culture/GramdevatJatraPage';
import InteractiveHeritageMapPage from './pages/culture/InteractiveHeritageMapPage';
import KnowledgeGraphExplorerPage from './pages/history/KnowledgeGraphExplorerPage';
import CommunityOralHistoryPage from './pages/community/CommunityOralHistoryPage';
import ShivkalFestivalsPage from './pages/culture/ShivkalFestivalsPage';
import ConnectMarathaUniversePage from './pages/universe/ConnectMarathaUniversePage';
import MaharashtraDataPlatformPage from './pages/platform/MaharashtraDataPlatformPage';


// Complete 100% Mapping for Every Legacy .html File (All 81 Files Covered)
const legacyRedirects = [
  { from: '/index.html', to: '/' },
  { from: '/cm-home.html', to: '/' },
  { from: '/cm-about.html', to: '/about' },
  { from: '/cm-achievers.html', to: '/achievers' },
  { from: '/cm-admin.html', to: '/admin' },
  { from: '/cm-article-detail.html', to: '/history/shivaji-maharaj' },
  { from: '/cm-bajirao-peshwa.html', to: '/history/bajirao-peshwa' },
  { from: '/cm-balidan-maas.html', to: '/history/balidan-maas' },
  { from: '/cm-battles.html', to: '/history/battles' },
  { from: '/cm-blueprint.html', to: '/blueprint' },
  { from: '/cm-business-directory.html', to: '/business/directory' },
  { from: '/cm-business-membership-application.html', to: '/business/membership-application' },
  { from: '/cm-business-opportunities.html', to: '/business/directory' },
  { from: '/cm-business-profile.html', to: '/business/directory' },
  { from: '/cm-business-sangam.html', to: '/sangam' },
  { from: '/cm-campaign-detail.html', to: '/donation' },
  { from: '/cm-card.html', to: '/card' },
  { from: '/cm-ceo-dashboard.html', to: '/ceo' },
  { from: '/cm-chapter-detail.html', to: '/sangam' },
  { from: '/cm-community-safety.html', to: '/community/safety' },
  { from: '/cm-community.html', to: '/community' },
  { from: '/cm-contact.html', to: '/contact' },
  { from: '/cm-create-referral.html', to: '/create-referral' },
  { from: '/cm-culture.html', to: '/culture' },
  { from: '/cm-dashboard.html', to: '/dashboard' },
  { from: '/cm-directory-people.html', to: '/directory' },
  { from: '/cm-dnyankosh.html', to: '/dnyankosh' },
  { from: '/cm-donation.html', to: '/donation' },
  { from: '/cm-education.html', to: '/jobs' },
  { from: '/cm-events.html', to: '/events' },
  { from: '/cm-forts-map.html', to: '/forts' },
  { from: '/cm-gallery.html', to: '/gallery' },
  { from: '/cm-governance.html', to: '/governance' },
  { from: '/cm-granthalaya.html', to: '/granthalaya' },
  { from: '/cm-group-detail.html', to: '/community' },
  { from: '/cm-groups.html', to: '/community' },
  { from: '/cm-heritage-map.html', to: '/forts' },
  { from: '/cm-heritage-trails.html', to: '/forts/trails' },
  { from: '/cm-historical-dates.html', to: '/history/dates' },
  { from: '/cm-history.html', to: '/history' },
  { from: '/cm-jobs.html', to: '/jobs' },
  { from: '/cm-leaders.html', to: '/governance' },
  { from: '/cm-list-business.html', to: '/business/directory' },
  { from: '/cm-login.html', to: '/login' },
  { from: '/cm-maratha-navy.html', to: '/history/navy' },
  { from: '/cm-mavale.html', to: '/history/warriors' },
  { from: '/cm-membership.html', to: '/register' },
  { from: '/cm-messages.html', to: '/messages' },
  { from: '/cm-more.html', to: '/more' },
  { from: '/cm-movements.html', to: '/history/movements' },
  { from: '/cm-my-business-mandal.html', to: '/business/mandal' },
  { from: '/cm-network.html', to: '/network' },
  { from: '/cm-news.html', to: '/news' },
  { from: '/cm-notifications.html', to: '/notifications' },
  { from: '/cm-onboarding.html', to: '/register' },
  { from: '/cm-one-to-one-meetings.html', to: '/sangam' },
  { from: '/cm-panhala-pavankhind.html', to: '/forts/panhala-pavankhind' },
  { from: '/cm-pratapgad-fort.html', to: '/forts/pratapgad' },
  { from: '/cm-professionals.html', to: '/directory' },
  { from: '/cm-profile-edit.html', to: '/profile' },
  { from: '/cm-profile.html', to: '/profile' },
  { from: '/cm-raigad-fort.html', to: '/forts/raigad' },
  { from: '/cm-rajaram-maharaj.html', to: '/history/rajaram-maharaj' },
  { from: '/cm-rajgad-fort.html', to: '/forts/rajgad' },
  { from: '/cm-rajmata-jijau.html', to: '/history/rajmata-jijau' },
  { from: '/cm-referral-detail.html', to: '/referrals' },
  { from: '/cm-referrals.html', to: '/referrals' },
  { from: '/cm-register.html', to: '/register' },
  { from: '/cm-sambhaji-maharaj.html', to: '/history/sambhaji-maharaj' },
  { from: '/cm-search.html', to: '/search' },
  { from: '/cm-service-booking.html', to: '/services/booking' },
  { from: '/cm-services.html', to: '/jobs' },
  { from: '/cm-settings.html', to: '/profile' },
  { from: '/cm-shahu-maharaj.html', to: '/history/shahu-maharaj' },
  { from: '/cm-shivaji-maharaj.html', to: '/history/shivaji-maharaj' },
  { from: '/cm-shivneri-fort.html', to: '/forts/shivneri' },
  { from: '/cm-swarajya-administration.html', to: '/history/swarajya-administration' },
  { from: '/cm-symbols.html', to: '/culture/symbols' },
  { from: '/cm-tarabai.html', to: '/history/tarabai' },
  { from: '/cm-temples.html', to: '/culture/temples' },
  {from: '/cm-torna-fort.html', to: '/forts/torna' },
  { from: '/cm-warriors.html', to: '/history/warriors' },
  { from: '/cm-doctors.html', to: '/doctors' },
  { from: '/cm-artists.html', to: '/artists' },
  { from: '/cm-bank.html', to: '/bank' },
  { from: '/cm-builders.html', to: '/builders' },
  { from: '/cm-officers.html', to: '/officers' },
  { from: '/cm-books.html', to: '/books' },
  { from: '/cm-movies.html', to: '/movies' },
  { from: '/cm-dairy.html', to: '/dairy' },
  { from: '/cm-speakers.html', to: '/speakers' },
  { from: '/cm-organizations.html', to: '/organizations' },
  { from: '/cm-manufacturers.html', to: '/manufacturers' },
  { from: '/cm-maratha-news.html', to: '/maratha-news' },
  { from: '/cm-women.html', to: '/women' },
  { from: '/cm-political-leaders.html', to: '/political' },
  { from: '/cm-politicalleader.html', to: '/political' },
  { from: '/cm-social-workers.html', to: '/social-workers' },
  { from: '/cm-blood.html', to: '/blood' },
  { from: '/cm-matrimony.html', to: '/matrimony' },
  { from: '/cm-quiz.html', to: '/quiz' }
];

import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  return (
    <ToastProvider>
      <LanguageProvider>
        <AuthProvider>
          <ScopeProvider>
            <SiteContentProvider>
              <Routes>
          {/* Automatic Clean Redirects from legacy .html to clean React routes */}
          {legacyRedirects.map((r, i) => (
            <Route key={i} path={r.from} element={<Navigate to={r.to} replace />} />
          ))}

          {/* Admin Shell Console */}
          <Route path="/admin/*" element={<AdminShell />} />

          {/* All Application Pages Wrapped Inside AppLayout */}
          <Route element={<AppLayout />}>
            {/* 100% Modern Clean React Routes */}
            <Route path="/" element={<HomePage />} />
            
            {/* SuperAdmin Supreme Console */}
            <Route path="/superadmin" element={<CRMProtectedRoute allowedRoles={['superadmin', 'admin']}><SuperAdminPage /></CRMProtectedRoute>} />
            <Route path="/crm/superadmin" element={<CRMProtectedRoute allowedRoles={['superadmin', 'admin']}><SuperAdminPage /></CRMProtectedRoute>} />
            
            {/* History & Heritage */}
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/quiz" element={<MarathaQuizPage />} />
            <Route path="/history/quiz" element={<MarathaQuizPage />} />
            <Route path="/maratha-quiz" element={<MarathaQuizPage />} />
            <Route path="/quiz-portal" element={<MarathaQuizPage />} />
            <Route path="/history/battles" element={<BattlesPage />} />
            <Route path="/battles" element={<BattlesPage />} />
            <Route path="/history/warriors" element={<WarriorsPage />} />
            <Route path="/history/mavale" element={<WarriorsPage />} />
            <Route path="/warriors" element={<WarriorsPage />} />
            <Route path="/history/navy" element={<MarathaNavyPage />} />
            <Route path="/navy" element={<MarathaNavyPage />} />
            <Route path="/maratha-navy" element={<MarathaNavyPage />} />
            <Route path="/history/balidan-maas" element={<BalidanMaasPage />} />
            <Route path="/balidan-maas" element={<BalidanMaasPage />} />
            <Route path="/history/dates" element={<HistoricalDatesPage />} />
            <Route path="/dates" element={<HistoricalDatesPage />} />
            <Route path="/history/swarajya-administration" element={<SwarajyaAdminPage />} />
            <Route path="/swarajya-administration" element={<SwarajyaAdminPage />} />
            <Route path="/history/dnyankosh" element={<DnyankoshPage />} />
            <Route path="/dnyankosh" element={<DnyankoshPage />} />
            <Route path="/history/granthalaya" element={<GranthalayaPage />} />
            <Route path="/granthalaya" element={<GranthalayaPage />} />
            <Route path="/history/shivcharitra" element={<ShivcharitraKathanHubPage />} />
            <Route path="/shivcharitra" element={<ShivcharitraKathanHubPage />} />
            <Route path="/shivcharitra-kathan" element={<ShivcharitraKathanHubPage />} />
            <Route path="/history/movements" element={<MovementsPage />} />
            <Route path="/movements" element={<MovementsPage />} />
            <Route path="/history/:slug" element={<GenericArticlePage />} />
            
            {/* Forts & Trails */}
            <Route path="/forts" element={<FortsMapPage />} />
            <Route path="/forts/trails" element={<HeritageTrailsPage />} />
            <Route path="/forts/:slug" element={<GenericArticlePage />} />

            {/* Network & Community */}
            <Route path="/network" element={<MaharashtraNetworkPage />} />
            <Route path="/community" element={<CommunityFeedPage />} />
            <Route path="/community/safety" element={<CommunitySafetyPage />} />
            <Route path="/safety" element={<CommunitySafetyPage />} />
            <Route path="/groups" element={<CommunityFeedPage />} />
            <Route path="/news" element={<NewsAnnouncementsPage />} />
            <Route path="/calendar" element={<MarathaCalendarPage />} />
            <Route path="/calender" element={<MarathaCalendarPage />} />
            <Route path="/dinadarshika" element={<MarathaCalendarPage />} />
            <Route path="/dindadarshika" element={<MarathaCalendarPage />} />
            <Route path="/panchang" element={<MarathaCalendarPage />} />
            <Route path="/events" element={<MarathaCalendarPage />} />
            <Route path="/events/calendar" element={<MarathaCalendarPage />} />
            <Route path="/events/calender" element={<MarathaCalendarPage />} />
            <Route path="/maratha-calendar" element={<MarathaCalendarPage />} />
            <Route path="/history/calendar" element={<MarathaCalendarPage />} />
            <Route path="/history/calender" element={<MarathaCalendarPage />} />
            <Route path="/donation" element={<DonationsPage />} />
            <Route path="/campaigns" element={<DonationsPage />} />
            <Route path="/directory" element={<PeopleDirectoryPage />} />
            <Route path="/professionals" element={<PeopleDirectoryPage />} />

            {/* Membership, Card & User Center */}
            <Route path="/card" element={<DigitalMemberCardPage />} />
            <Route path="/member/card" element={<DigitalMemberCardPage />} />
            <Route path="/verify" element={<DigitalMemberCardPage defaultTab="verify" />} />
            <Route path="/verify/qr" element={<DigitalMemberCardPage defaultTab="verify" />} />
            <Route path="/verify/qr/:code" element={<DigitalMemberCardPage defaultTab="verify" />} />
            <Route path="/verify/:code" element={<DigitalMemberCardPage defaultTab="verify" />} />
            <Route path="/verify-member" element={<DigitalMemberCardPage defaultTab="verify" />} />
            <Route path="/register" element={<RegisterWizardPage />} />
            <Route path="/onboarding" element={<RegisterWizardPage />} />
            <Route path="/membership" element={<RegisterWizardPage />} />
            <Route path="/login" element={<LoginPage />} />
            {/* Private Member Center — Protected for Authenticated Members */}
            <Route path="/dashboard" element={<MemberProtectedRoute><MemberDashboardPage /></MemberProtectedRoute>} />
            <Route path="/profile" element={<MemberProtectedRoute><UserProfilePage /></MemberProtectedRoute>} />
            <Route path="/settings" element={<MemberProtectedRoute><UserProfilePage /></MemberProtectedRoute>} />
            <Route path="/notifications" element={<MemberProtectedRoute><NotificationsPage /></MemberProtectedRoute>} />
            <Route path="/messages" element={<MemberProtectedRoute><MessagesPage /></MemberProtectedRoute>} />

            {/* Business Sangam, Meetings & Opportunities */}
            <Route path="/sangam" element={<BusinessSangamPage />} />
            <Route path="/meetings" element={<MemberProtectedRoute><MeetingsPortalPage /></MemberProtectedRoute>} />
            <Route path="/business/meetings" element={<MemberProtectedRoute><MeetingsPortalPage /></MemberProtectedRoute>} />
            <Route path="/business-meetings" element={<MemberProtectedRoute><MeetingsPortalPage /></MemberProtectedRoute>} />
            <Route path="/referrals" element={<MemberProtectedRoute><ReferralsTrackerPage /></MemberProtectedRoute>} />
            <Route path="/create-referral" element={<MemberProtectedRoute><CreateReferralPage /></MemberProtectedRoute>} />
            <Route path="/referrals/create" element={<MemberProtectedRoute><CreateReferralPage /></MemberProtectedRoute>} />
            <Route path="/business" element={<BusinessDirectoryPage />} />
            <Route path="/business/directory" element={<BusinessDirectoryPage />} />
            <Route path="/business/list" element={<BusinessDirectoryPage />} />
            <Route path="/business/opportunities" element={<BusinessDirectoryPage />} />
            <Route path="/business/mandal" element={<BusinessSangamPage />} />
            <Route path="/business/membership-application" element={<BusinessSangamPage />} />

            {/* Jobs, Education & Services */}
            <Route path="/jobs" element={<JobsPortalPage />} />
            <Route path="/education" element={<JobsPortalPage />} />
            <Route path="/services" element={<JobsPortalPage />} />
            <Route path="/services/booking" element={<MemberProtectedRoute><ServiceBookingPage /></MemberProtectedRoute>} />
            <Route path="/service-booking" element={<MemberProtectedRoute><ServiceBookingPage /></MemberProtectedRoute>} />

            {/* Maharashtra Culture & Heritage Knowledge Graph */}
            <Route path="/culture" element={<MaharashtraCultureHubPage />} />
            <Route path="/culture/diversity" element={<MaharashtraCultureHubPage />} />
            <Route path="/culture/dialects" element={<MarathiDialectsArchivePage />} />
            <Route path="/dialects" element={<MarathiDialectsArchivePage />} />
            <Route path="/culture/food" element={<MaharashtraFoodCulturePage />} />
            <Route path="/food" element={<MaharashtraFoodCulturePage />} />
            <Route path="/culture/gramdevat-jatra" element={<GramdevatJatraPage />} />
            <Route path="/culture/gramdevat" element={<GramdevatJatraPage />} />
            <Route path="/gramdevat" element={<GramdevatJatraPage />} />
            <Route path="/jatra" element={<GramdevatJatraPage />} />
            <Route path="/culture/heritage-map" element={<InteractiveHeritageMapPage />} />
            <Route path="/heritage-map" element={<InteractiveHeritageMapPage />} />
            <Route path="/history/knowledge-graph" element={<KnowledgeGraphExplorerPage />} />
            <Route path="/knowledge-graph" element={<KnowledgeGraphExplorerPage />} />
            <Route path="/community/oral-history" element={<CommunityOralHistoryPage />} />
            <Route path="/oral-history" element={<CommunityOralHistoryPage />} />
            <Route path="/culture/shivkal-festivals" element={<ShivkalFestivalsPage />} />
            <Route path="/shivkal-festivals" element={<ShivkalFestivalsPage />} />
            <Route path="/festivals" element={<ShivkalFestivalsPage />} />

            {/* Connect Maratha — Expanded Maharashtra Civilization Explorer (49 Features / 12 Worlds) */}
            <Route path="/universe" element={<ConnectMarathaUniversePage />} />
            <Route path="/civilization" element={<ConnectMarathaUniversePage />} />
            <Route path="/master-map" element={<ConnectMarathaUniversePage />} />
            <Route path="/time-machine" element={<ConnectMarathaUniversePage />} />
            <Route path="/connect-everything" element={<ConnectMarathaUniversePage />} />
            <Route path="/explore" element={<ConnectMarathaUniversePage />} />
            <Route path="/fort-explorer" element={<ConnectMarathaUniversePage />} />
            <Route path="/battle-explorer" element={<ConnectMarathaUniversePage />} />
            <Route path="/personalities" element={<ConnectMarathaUniversePage />} />
            <Route path="/women-in-history" element={<ConnectMarathaUniversePage />} />
            <Route path="/family-heritage" element={<ConnectMarathaUniversePage />} />
            <Route path="/villages" element={<ConnectMarathaUniversePage />} />
            <Route path="/temple-encyclopedia" element={<ConnectMarathaUniversePage />} />
            <Route path="/literature-library" element={<ConnectMarathaUniversePage />} />
            <Route path="/water-heritage" element={<ConnectMarathaUniversePage />} />
            <Route path="/wada-architecture" element={<ConnectMarathaUniversePage />} />
            <Route path="/folk-art" element={<ConnectMarathaUniversePage />} />
            <Route path="/performing-arts" element={<ConnectMarathaUniversePage />} />
            <Route path="/powada-archive" element={<ConnectMarathaUniversePage />} />
            <Route path="/heritage-passport" element={<ConnectMarathaUniversePage />} />
            <Route path="/virtual-museum" element={<ConnectMarathaUniversePage />} />

            {/* Maharashtra Master Data Platform (50+ Interconnected Datasets & Atlas) */}
            <Route path="/platform" element={<MaharashtraDataPlatformPage />} />
            <Route path="/atlas" element={<MaharashtraDataPlatformPage />} />
            <Route path="/data-platform" element={<MaharashtraDataPlatformPage />} />
            <Route path="/maharashtra-platform" element={<MaharashtraDataPlatformPage />} />
            <Route path="/knowledge-platform" element={<MaharashtraDataPlatformPage />} />
            <Route path="/modi-script" element={<MaharashtraDataPlatformPage />} />
            <Route path="/audio-heritage" element={<MaharashtraDataPlatformPage />} />
            <Route path="/qr-heritage" element={<MaharashtraDataPlatformPage />} />
            <Route path="/trails" element={<MaharashtraDataPlatformPage />} />
            <Route path="/api-docs" element={<MaharashtraDataPlatformPage />} />

            {/* Gallery, Symbols, Temples */}
            <Route path="/gallery" element={<PhotoGalleryPage />} />
            <Route path="/culture/gallery" element={<PhotoGalleryPage />} />
            <Route path="/culture/symbols" element={<SymbolsPage />} />
            <Route path="/symbols" element={<SymbolsPage />} />
            <Route path="/culture/temples" element={<TemplesPage />} />
            <Route path="/temples" element={<TemplesPage />} />

            {/* Governance, Leadership & Global Search */}
            <Route path="/governance" element={<GovernancePage />} />
            <Route path="/roles-matrix" element={<RoleEligibilityMatrixPage />} />
            <Route path="/roles" element={<RoleEligibilityMatrixPage />} />
            <Route path="/referral-eligibility" element={<RoleEligibilityMatrixPage />} />
            <Route path="/governance/roles" element={<RoleEligibilityMatrixPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/vision" element={<VisionMissionPage />} />
            <Route path="/vision-mission" element={<VisionMissionPage />} />
            <Route path="/mission" element={<VisionMissionPage />} />
            <Route path="/goals" element={<BlueprintVisionPage />} />
            <Route path="/why-join" element={<WhyJoinPage />} />
            <Route path="/whytojoin" element={<WhyJoinPage />} />
            <Route path="/benefits" element={<WhyJoinPage />} />
            <Route path="/contact" element={<GovernancePage />} />
            <Route path="/leaders" element={<AboutPage />} />
            <Route path="/achievers" element={<AchieversPage />} />
            <Route path="/blueprint" element={<BlueprintVisionPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/more" element={<MorePortalsPage />} />
            <Route path="/portals" element={<MorePortalsPage />} />

            {/* Dedicated Secure CRM Login Gateways */}
            <Route path="/crm/login" element={<CRMLoginPage />} />
            <Route path="/admin/login" element={<CRMLoginPage />} />

            {/* Role-Specific Live Enterprise CRM Suite — Protected for Authenticated Staff/Admins */}
            <Route path="/crm" element={<CRMProtectedRoute><CRMRoleHubPage /></CRMProtectedRoute>} />
            <Route path="/crm/roles" element={<CRMProtectedRoute><CRMRoleHubPage /></CRMProtectedRoute>} />
            <Route path="/crm/admin" element={<CRMProtectedRoute allowedRoles={['superadmin', 'admin', 'ceo']}><SuperAdminDashboardPage /></CRMProtectedRoute>} />
            <Route path="/admin" element={<CRMProtectedRoute allowedRoles={['superadmin', 'admin', 'ceo']}><SuperAdminDashboardPage /></CRMProtectedRoute>} />
            <Route path="/admin/dashboard" element={<CRMProtectedRoute allowedRoles={['superadmin', 'admin', 'ceo']}><SuperAdminDashboardPage /></CRMProtectedRoute>} />
            <Route path="/admin/users" element={<CRMProtectedRoute allowedRoles={['superadmin', 'admin', 'ceo']}><SuperAdminDashboardPage /></CRMProtectedRoute>} />
            <Route path="/admin/members" element={<CRMProtectedRoute allowedRoles={['superadmin', 'admin', 'ceo']}><SuperAdminDashboardPage /></CRMProtectedRoute>} />

            <Route path="/crm/ceo" element={<CRMProtectedRoute allowedRoles={['superadmin', 'admin', 'ceo']}><CEOPage /></CRMProtectedRoute>} />
            <Route path="/ceo" element={<CRMProtectedRoute allowedRoles={['superadmin', 'admin', 'ceo']}><CEOPage /></CRMProtectedRoute>} />
            <Route path="/ceo-dashboard" element={<CRMProtectedRoute allowedRoles={['superadmin', 'admin', 'ceo']}><CEOPage /></CRMProtectedRoute>} />

            <Route path="/crm/district" element={<CRMProtectedRoute allowedRoles={['superadmin', 'admin', 'district_admin', 'district']}><DistrictAdminCRM /></CRMProtectedRoute>} />

            <Route path="/crm/chapter" element={<CRMProtectedRoute allowedRoles={['superadmin', 'admin', 'chapter_president', 'chapter']}><ChapterPresidentCRM /></CRMProtectedRoute>} />

            <Route path="/crm/helpdesk" element={<CRMProtectedRoute allowedRoles={['superadmin', 'admin', 'seva_helpdesk', 'helpdesk_admin']}><SevaHelpdeskCRM /></CRMProtectedRoute>} />
            <Route path="/crm/seva" element={<CRMProtectedRoute allowedRoles={['superadmin', 'admin', 'seva_helpdesk', 'helpdesk_admin']}><SevaHelpdeskCRM /></CRMProtectedRoute>} />

            <Route path="/crm/finance" element={<CRMProtectedRoute allowedRoles={['superadmin', 'admin', 'finance_officer', 'finance']}><FinanceLedgerCRM /></CRMProtectedRoute>} />

            <Route path="/reports" element={<CRMProtectedRoute allowedRoles={['superadmin', 'admin', 'ceo']}><AdminERPPage /></CRMProtectedRoute>} />
            <Route path="/crm/reports" element={<CRMProtectedRoute allowedRoles={['superadmin', 'admin', 'ceo']}><AdminERPPage /></CRMProtectedRoute>} />
            <Route path="/cms" element={<CRMProtectedRoute allowedRoles={['superadmin', 'admin']}><SiteContentEditorPage /></CRMProtectedRoute>} />
            <Route path="/crm/cms" element={<CRMProtectedRoute allowedRoles={['superadmin', 'admin']}><SiteContentEditorPage /></CRMProtectedRoute>} />

            {/* Connect Maratha AI Agent (Trilingual RAG, Forts, Swarajya, Support) */}
            <Route path="/ai" element={<ConnectMarathaAIAgentPage />} />
            <Route path="/ai-agent" element={<ConnectMarathaAIAgentPage />} />
            <Route path="/assistant" element={<ConnectMarathaAIAgentPage />} />
            <Route path="/crm/ai" element={<ConnectMarathaAIAgentPage />} />

            {/* Newly Added Community Ecosystem Modules with Full URL Variations */}
            <Route path="/doctors" element={<DoctorsDirectoryPage />} />
            <Route path="/doctors-directory" element={<DoctorsDirectoryPage />} />
            <Route path="/doctors-list" element={<DoctorsDirectoryPage />} />
            <Route path="/medical" element={<DoctorsDirectoryPage />} />

            <Route path="/artists" element={<ArtistsDirectoryPage />} />
            <Route path="/artists-directory" element={<ArtistsDirectoryPage />} />
            <Route path="/singers" element={<ArtistsDirectoryPage />} />
            <Route path="/actors" element={<ArtistsDirectoryPage />} />

            <Route path="/bank" element={<MarathaBankPage />} />
            <Route path="/maratha-bank" element={<MarathaBankPage />} />
            <Route path="/finance" element={<MarathaBankPage />} />
            <Route path="/maratha-finance" element={<MarathaBankPage />} />

            <Route path="/builders" element={<BuildersDirectoryPage />} />
            <Route path="/builders-directory" element={<BuildersDirectoryPage />} />
            <Route path="/real-estate" element={<BuildersDirectoryPage />} />
            <Route path="/developers" element={<BuildersDirectoryPage />} />

            <Route path="/officers" element={<GovernmentOfficersPage />} />
            <Route path="/government-officers" element={<GovernmentOfficersPage />} />
            <Route path="/ias-ips" element={<GovernmentOfficersPage />} />
            <Route path="/govt-officers" element={<GovernmentOfficersPage />} />

            <Route path="/books" element={<BooksLiteraturePage />} />
            <Route path="/books-literature" element={<BooksLiteraturePage />} />
            <Route path="/literature" element={<BooksLiteraturePage />} />
            <Route path="/marathi-books" element={<BooksLiteraturePage />} />

            <Route path="/movies" element={<MarathiMoviesPage />} />
            <Route path="/marathi-movies" element={<MarathiMoviesPage />} />
            <Route path="/cinema" element={<MarathiMoviesPage />} />
            <Route path="/films" element={<MarathiMoviesPage />} />

            <Route path="/dairy" element={<MarathaDairyPage />} />
            <Route path="/maratha-dairy" element={<MarathaDairyPage />} />
            <Route path="/milk" element={<MarathaDairyPage />} />

            <Route path="/speakers" element={<MotivationalSpeakersPage />} />
            <Route path="/motivational-speakers" element={<MotivationalSpeakersPage />} />
            <Route path="/speakers-list" element={<MotivationalSpeakersPage />} />

            <Route path="/organizations" element={<MarathaOrganizationsPage />} />
            <Route path="/maratha-organizations" element={<MarathaOrganizationsPage />} />
            <Route path="/orgs" element={<MarathaOrganizationsPage />} />
            <Route path="/sanghatana" element={<MarathaOrganizationsPage />} />

            <Route path="/manufacturers" element={<ManufacturersPage />} />
            <Route path="/manufacturers-directory" element={<ManufacturersPage />} />
            <Route path="/industry" element={<ManufacturersPage />} />
            <Route path="/manufacturing" element={<ManufacturersPage />} />

            <Route path="/maratha-news" element={<MarathaNewsMediaPage />} />
            <Route path="/news-media" element={<MarathaNewsMediaPage />} />
            <Route path="/media" element={<MarathaNewsMediaPage />} />
            <Route path="/epapers" element={<MarathaNewsMediaPage />} />

            <Route path="/women" element={<WomenEmpowermentPage />} />
            <Route path="/women-empowerment" element={<WomenEmpowermentPage />} />
            <Route path="/mahila" element={<WomenEmpowermentPage />} />

            <Route path="/political" element={<PoliticalLeadersPartiesPage />} />
            <Route path="/politicaleader" element={<PoliticalLeadersPartiesPage />} />
            <Route path="/politicalleader" element={<PoliticalLeadersPartiesPage />} />
            <Route path="/political-leader" element={<PoliticalLeadersPartiesPage />} />
            <Route path="/political-leaders" element={<PoliticalLeadersPartiesPage />} />
            <Route path="/political-parties" element={<PoliticalLeadersPartiesPage />} />
            <Route path="/parties" element={<PoliticalLeadersPartiesPage />} />
            <Route path="/leaders-parties" element={<PoliticalLeadersPartiesPage />} />

            <Route path="/social-workers" element={<SocialWorkersPage />} />
            <Route path="/socialworker" element={<SocialWorkersPage />} />
            <Route path="/social-worker" element={<SocialWorkersPage />} />
            <Route path="/social" element={<SocialWorkersPage />} />

            <Route path="/blood" element={<BloodHelpPortalPage />} />
            <Route path="/blood-help" element={<BloodHelpPortalPage />} />
            <Route path="/blood-donation" element={<BloodHelpPortalPage />} />

            <Route path="/matrimony" element={<MatrimonyPortalPage />} />
            <Route path="/matrimony-portal" element={<MatrimonyPortalPage />} />
            <Route path="/vivah" element={<MatrimonyPortalPage />} />
            <Route path="/vadhu-var" element={<MatrimonyPortalPage />} />

            {/* Governance & Role Eligibility Matrix Routes */}
            <Route path="/governance/roles-matrix" element={<RoleEligibilityMatrixPage />} />
            <Route path="/roles-matrix" element={<RoleEligibilityMatrixPage />} />
            <Route path="/eligibility-matrix" element={<RoleEligibilityMatrixPage />} />

            {/* Generic Article Route & Fallback */}
            <Route path="/article" element={<GenericArticlePage />} />
            <Route path="/articles" element={<GenericArticlePage />} />
            <Route path="/article/:slug" element={<GenericArticlePage />} />
            <Route path="/history/maratha-navy" element={<MarathaNavyPage />} />
            <Route path="*" element={<GenericArticlePage />} />
          </Route>
        </Routes>
          </SiteContentProvider>
        </ScopeProvider>
      </AuthProvider>
      </LanguageProvider>
    </ToastProvider>
  );
}
