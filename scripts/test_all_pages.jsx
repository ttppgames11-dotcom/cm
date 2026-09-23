import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { ScopeProvider } from '../src/context/ScopeContext';

// Import all 23 pages
import HomePage from '../src/pages/home/HomePage';
import HistoryPage from '../src/pages/history/HistoryPage';
import FortsMapPage from '../src/pages/forts/FortsMapPage';
import MaharashtraNetworkPage from '../src/pages/network/MaharashtraNetworkPage';
import DigitalMemberCardPage from '../src/pages/member/DigitalMemberCardPage';
import RegisterWizardPage from '../src/pages/member/RegisterWizardPage';
import LoginPage from '../src/pages/member/LoginPage';
import MemberDashboardPage from '../src/pages/member/MemberDashboardPage';
import UserProfilePage from '../src/pages/member/UserProfilePage';
import BusinessSangamPage from '../src/pages/sangam/BusinessSangamPage';
import ReferralsTrackerPage from '../src/pages/sangam/ReferralsTrackerPage';
import CreateReferralPage from '../src/pages/sangam/CreateReferralPage';
import BusinessDirectoryPage from '../src/pages/business/BusinessDirectoryPage';
import CommunityFeedPage from '../src/pages/community/CommunityFeedPage';
import EventsCalendarPage from '../src/pages/events/EventsCalendarPage';
import DonationsPage from '../src/pages/donation/DonationsPage';
import PeopleDirectoryPage from '../src/pages/directory/PeopleDirectoryPage';
import JobsPortalPage from '../src/pages/jobs/JobsPortalPage';
import PhotoGalleryPage from '../src/pages/culture/PhotoGalleryPage';
import GovernancePage from '../src/pages/governance/GovernancePage';
import AdminERPPage from '../src/pages/admin/AdminERPPage';
import CEODashboardPage from '../src/pages/admin/CEODashboardPage';
import GenericArticlePage from '../src/pages/common/GenericArticlePage';

const pages = [
  { name: 'HomePage (/)', component: <HomePage /> },
  { name: 'HistoryPage (/history)', component: <HistoryPage /> },
  { name: 'FortsMapPage (/forts)', component: <FortsMapPage /> },
  { name: 'MaharashtraNetworkPage (/network)', component: <MaharashtraNetworkPage /> },
  { name: 'DigitalMemberCardPage (/card)', component: <DigitalMemberCardPage /> },
  { name: 'RegisterWizardPage (/register)', component: <RegisterWizardPage /> },
  { name: 'LoginPage (/login)', component: <LoginPage /> },
  { name: 'MemberDashboardPage (/dashboard)', component: <MemberDashboardPage /> },
  { name: 'UserProfilePage (/profile)', component: <UserProfilePage /> },
  { name: 'BusinessSangamPage (/sangam)', component: <BusinessSangamPage /> },
  { name: 'ReferralsTrackerPage (/referrals)', component: <ReferralsTrackerPage /> },
  { name: 'CreateReferralPage (/create-referral)', component: <CreateReferralPage /> },
  { name: 'BusinessDirectoryPage (/business/directory)', component: <BusinessDirectoryPage /> },
  { name: 'CommunityFeedPage (/community)', component: <CommunityFeedPage /> },
  { name: 'EventsCalendarPage (/events)', component: <EventsCalendarPage /> },
  { name: 'DonationsPage (/donation)', component: <DonationsPage /> },
  { name: 'PeopleDirectoryPage (/directory)', component: <PeopleDirectoryPage /> },
  { name: 'JobsPortalPage (/jobs)', component: <JobsPortalPage /> },
  { name: 'PhotoGalleryPage (/gallery)', component: <PhotoGalleryPage /> },
  { name: 'GovernancePage (/governance)', component: <GovernancePage /> },
  { name: 'AdminERPPage (/admin)', component: <AdminERPPage /> },
  { name: 'CEODashboardPage (/ceo)', component: <CEODashboardPage /> },
  { name: 'GenericArticlePage (/history/shivaji-maharaj)', component: <GenericArticlePage /> },
  { name: 'GenericArticlePage fallback (/some-random-slug)', component: <GenericArticlePage /> }
];

console.log('Testing SSR rendering of all 24 page variations...');
let passed = 0;
let failed = 0;

for (const p of pages) {
  try {
    const html = renderToString(
      <AuthProvider>
        <ScopeProvider>
          <MemoryRouter>
            {p.component}
          </MemoryRouter>
        </ScopeProvider>
      </AuthProvider>
    );
    console.log(`✅ PASS: ${p.name} (rendered ${html.length} chars)`);
    passed++;
  } catch (err) {
    console.error(`❌ FAIL: ${p.name} -> ${err.message}`);
    console.error(err.stack);
    failed++;
  }
}

console.log(`\nResult: ${passed} PASSED, ${failed} FAILED.`);
if (failed > 0) process.exit(1);
