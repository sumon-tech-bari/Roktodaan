import React, { Suspense, lazy } from 'react';
import { Toaster } from 'sonner';
import { useRoktodaanStore } from './store/useRoktodaanStore';
import { TopBar } from './components/layout/TopBar';
import { Footer } from './components/layout/Footer';
import { EmergencyNoticeBar } from './components/shared/EmergencyNoticeBar';
import { OfflineIndicator } from './components/shared/PWAInstallPrompt';
import { LandingPage } from './pages/LandingPage';

const FindDonorsPage = lazy(() =>
  import('./pages/FindDonorsPage').then((m) => ({ default: m.FindDonorsPage }))
);
const RequestBloodPage = lazy(() =>
  import('./pages/RequestBloodPage').then((m) => ({ default: m.RequestBloodPage }))
);
const DonorRegistrationPage = lazy(() =>
  import('./pages/DonorRegistrationPage').then((m) => ({ default: m.DonorRegistrationPage }))
);
const AuthPage = lazy(() =>
  import('./pages/AuthPage').then((m) => ({ default: m.AuthPage }))
);
const DonorDashboardPage = lazy(() =>
  import('./pages/DonorDashboardPage').then((m) => ({ default: m.DonorDashboardPage }))
);
const SeekerDashboardPage = lazy(() =>
  import('./pages/SeekerDashboardPage').then((m) => ({ default: m.SeekerDashboardPage }))
);
const ProfileSettingsPage = lazy(() =>
  import('./pages/ProfileSettingsPage').then((m) => ({ default: m.ProfileSettingsPage }))
);
const AdminPanelPage = lazy(() =>
  import('./pages/AdminPanelPage').then((m) => ({ default: m.AdminPanelPage }))
);
const AboutImpactPage = lazy(() =>
  import('./pages/AboutImpactPage').then((m) => ({ default: m.AboutImpactPage }))
);
const HowItWorksPage = lazy(() =>
  import('./pages/HowItWorksPage').then((m) => ({ default: m.HowItWorksPage }))
);
const SafetyGuidelinesPage = lazy(() =>
  import('./pages/SafetyGuidelinesPage').then((m) => ({ default: m.SafetyGuidelinesPage }))
);
const ImpactStoriesPage = lazy(() =>
  import('./pages/ImpactStoriesPage').then((m) => ({ default: m.ImpactStoriesPage }))
);
const ContactPartnershipPage = lazy(() =>
  import('./pages/ContactPartnershipPage').then((m) => ({ default: m.ContactPartnershipPage }))
);
const LegalPage = lazy(() =>
  import('./pages/LegalPage').then((m) => ({ default: m.LegalPage }))
);
const CustomPageViewer = lazy(() =>
  import('./pages/CustomPageViewer').then((m) => ({ default: m.CustomPageViewer }))
);

const RouteLoadingFallback: React.FC = () => (
  <div className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-slate-500">
    Loading Roktodaan workspace...
  </div>
);

export default function App() {
  const currentRoute = useRoktodaanStore((s) => s.currentRoute);

  const renderPage = () => {
    if (currentRoute.startsWith('/p/')) {
      return <CustomPageViewer slug={currentRoute.slice(3)} />;
    }

    switch (currentRoute) {
      case '/':
        return <LandingPage />;
      case '/find-donors':
        return <FindDonorsPage />;
      case '/request-blood':
        return <RequestBloodPage />;
      case '/register-donor':
        return <DonorRegistrationPage />;
      case '/auth':
        return <AuthPage />;
      case '/dashboard/donor':
        return <DonorDashboardPage />;
      case '/dashboard/seeker':
        return <SeekerDashboardPage />;
      case '/profile':
        return <ProfileSettingsPage />;
      case '/admin':
        return <AdminPanelPage />;
      case '/about':
        return <AboutImpactPage />;
      case '/how-it-works':
        return <HowItWorksPage />;
      case '/safety':
        return <SafetyGuidelinesPage />;
      case '/stories':
        return <ImpactStoriesPage />;
      case '/contact':
        return <ContactPartnershipPage />;
      case '/legal/privacy':
        return <LegalPage mode="privacy" />;
      case '/legal/terms':
        return <LegalPage mode="terms" />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopBar />
      <EmergencyNoticeBar />
      <main className="flex-1">
        <Suspense fallback={<RouteLoadingFallback />}>{renderPage()}</Suspense>
      </main>
      <Footer />
      <OfflineIndicator />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
