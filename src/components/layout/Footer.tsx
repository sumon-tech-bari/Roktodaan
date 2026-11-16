import React from 'react';
import { t } from '../../lib/i18n';
import { cn } from '../../lib/utils';
import { useRoktodaanStore } from '../../store/useRoktodaanStore';
import { PWAInstallButton } from '../shared/PWAInstallPrompt';

export const Footer: React.FC = () => {
  const { language, setLanguage, customPages, navigate } = useRoktodaanStore();
  const copy = t(language);

  const footerCustomPages = customPages.filter(
    (p) => p.isPublished && (p.placement === 'footer' || p.placement === 'both')
  );

  return (
    <footer className="border-t border-slate-200 bg-white pb-20 md:pb-8">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm space-y-2">
            <span className="font-display text-lg font-bold tracking-tight text-rose-900">
              {copy.brand}
            </span>
            <p className="text-sm leading-relaxed text-slate-600">{copy.footer.tagline}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
            <button
              type="button"
              onClick={() => navigate('/how-it-works')}
              className="hover:text-slate-900 cursor-pointer whitespace-nowrap"
            >
              {language === 'bn' ? 'যেভাবে কাজ করে' : 'How it Works'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/safety')}
              className="hover:text-slate-900 cursor-pointer whitespace-nowrap"
            >
              {language === 'bn' ? 'নিরাপত্তা নির্দেশিকা' : 'Safety & Guidelines'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/stories')}
              className="hover:text-slate-900 cursor-pointer whitespace-nowrap"
            >
              {language === 'bn' ? 'প্রভাব ও গল্প' : 'Impact Stories'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/about')}
              className="hover:text-slate-900 cursor-pointer whitespace-nowrap"
            >
              {copy.footer.partners}
            </button>
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="hover:text-slate-900 cursor-pointer whitespace-nowrap"
            >
              {language === 'bn' ? 'যোগাযোগ' : 'Contact'}
            </button>
            {footerCustomPages.map((page) => (
              <button
                key={page.id}
                type="button"
                onClick={() => navigate(`/p/${page.slug}`)}
                className="hover:text-slate-900 cursor-pointer whitespace-nowrap"
              >
                {language === 'bn' ? page.titleBn : page.titleEn}
              </button>
            ))}
            <button
              type="button"
              onClick={() => navigate('/legal/privacy')}
              className="hover:text-slate-900 cursor-pointer whitespace-nowrap"
            >
              {copy.footer.privacy}
            </button>
            <button
              type="button"
              onClick={() => navigate('/legal/terms')}
              className="hover:text-slate-900 cursor-pointer whitespace-nowrap"
            >
              {copy.footer.terms}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="hover:text-slate-900 cursor-pointer whitespace-nowrap"
            >
              {copy.nav.admin}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              role="group"
              aria-label={copy.footer.language}
              className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1"
            >
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer',
                  language === 'en'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('bn')}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer',
                  language === 'bn'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                বাংলা
              </button>
            </div>

            <PWAInstallButton />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>{copy.footer.copyright}</span>
          <span className="font-medium text-slate-600">
            Roktodaan is only a matching platform, not a medical service.
          </span>
        </div>
      </div>
    </footer>
  );
};
