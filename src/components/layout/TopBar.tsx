import React from 'react';
import { Droplets, LayoutDashboard, Search, ShieldCheck, UserCircle } from 'lucide-react';
import { t } from '../../lib/i18n';
import { cn } from '../../lib/utils';
import { useRoktodaanStore, type AppRoute } from '../../store/useRoktodaanStore';

export const TopBar: React.FC = () => {
  const { language, currentRoute, currentUser, customPages, navigate } = useRoktodaanStore();
  const copy = t(language);

  const dashboardRoute: AppRoute =
    currentUser?.role === 'seeker' ? '/dashboard/seeker' : '/dashboard/donor';

  const navLinks: { label: string; route: AppRoute }[] = [
    { label: copy.nav.findDonors, route: '/find-donors' },
    { label: copy.nav.requestBlood, route: '/request-blood' },
    { label: copy.nav.dashboard, route: dashboardRoute },
    { label: copy.nav.partners, route: '/about' },
  ];

  const headerCustomPages = customPages
    .filter((p) => p.isPublished && (p.placement === 'header' || p.placement === 'both'))
    .slice(0, 2);

  for (const page of headerCustomPages) {
    navLinks.push({
      label: language === 'bn' ? page.titleBn : page.titleEn,
      route: `/p/${page.slug}`,
    });
  }

  if (currentUser?.role === 'admin') {
    navLinks.push({ label: copy.nav.admin, route: '/admin' });
  }

  const handlePrimaryAction = () => {
    if (currentUser) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Single clean wordmark */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="font-display text-lg font-bold tracking-tight text-rose-900 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700 rounded"
          >
            {copy.brand}
          </button>

          {/* Zone 2: 4-5 single-line navigation links */}
          <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6">
            {navLinks.map((item) => {
              const isActive =
                currentRoute === item.route ||
                (item.route.startsWith('/dashboard') && currentRoute.startsWith('/dashboard'));
              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => navigate(item.route)}
                  className={cn(
                    'text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer',
                    isActive
                      ? 'border-rose-800 text-rose-900'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="inline-flex min-h-[38px] items-center justify-center rounded-lg bg-rose-800 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-900 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700 focus-visible:ring-offset-2"
            >
              {currentUser
                ? currentUser.fullName
                    .replace(/^(Dr\.|Prof\.|Md\.)\s+/i, '')
                    .split(' ')[0]
                : copy.nav.signIn}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Thumb Navigation (<= 15% mobile height budget) */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-40 grid h-16 grid-cols-4 border-t border-slate-200 bg-white/95 backdrop-blur-md md:hidden"
      >
        <button
          type="button"
          onClick={() => navigate('/find-donors')}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium whitespace-nowrap',
            currentRoute === '/find-donors' ? 'text-rose-800' : 'text-slate-600'
          )}
        >
          <Search className="h-5 w-5" aria-hidden="true" />
          <span>{language === 'bn' ? 'দাতা' : 'Donors'}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/request-blood')}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium whitespace-nowrap',
            currentRoute === '/request-blood' ? 'text-rose-800' : 'text-slate-600'
          )}
        >
          <Droplets className="h-5 w-5" aria-hidden="true" />
          <span>{language === 'bn' ? 'অনুরোধ' : 'Request'}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate(dashboardRoute)}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium whitespace-nowrap',
            currentRoute.startsWith('/dashboard') ? 'text-rose-800' : 'text-slate-600'
          )}
        >
          <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
          <span>{copy.nav.dashboard}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate(currentUser?.role === 'admin' ? '/admin' : '/profile')}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium whitespace-nowrap',
            currentRoute === '/profile' || currentRoute === '/admin'
              ? 'text-rose-800'
              : 'text-slate-600'
          )}
        >
          {currentUser?.role === 'admin' ? (
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          ) : (
            <UserCircle className="h-5 w-5" aria-hidden="true" />
          )}
          <span>{currentUser?.role === 'admin' ? copy.nav.admin : copy.nav.profile}</span>
        </button>
      </nav>
    </>
  );
};
