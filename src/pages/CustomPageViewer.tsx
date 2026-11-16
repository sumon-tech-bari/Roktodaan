import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { useRoktodaanStore, type AppRoute } from '../store/useRoktodaanStore';
import { Button } from '../components/ui/button';
import { AdBannerSlot } from '../components/shared/AdBannerSlot';

interface CustomPageViewerProps {
  slug: string;
}

export const CustomPageViewer: React.FC<CustomPageViewerProps> = ({ slug }) => {
  const { language, currentUser, customPages, navigate } = useRoktodaanStore();
  const [coverFailed, setCoverFailed] = useState(false);

  const page = customPages.find((p) => p.slug === slug);
  const canView = page && (page.isPublished || currentUser?.role === 'admin');

  if (!canView) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
        <FileText className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
        <h1 className="font-display text-2xl font-bold text-slate-900">
          {language === 'bn' ? 'পেজটি খুঁজে পাওয়া যায়নি' : 'Page Not Found'}
        </h1>
        <p className="text-sm text-slate-600">
          {language === 'bn'
            ? 'এই পেজটি এখনো প্রকাশিত হয়নি অথবা মুছে ফেলা হয়েছে।'
            : 'This page is currently unpublished or has been removed by the administrator.'}
        </p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {language === 'bn' ? 'হোমে ফিরে যান' : 'Return Home'}
        </Button>
      </div>
    );
  }

  const title = language === 'bn' ? page.titleBn : page.titleEn;
  const subtitle = language === 'bn' ? page.subtitleBn : page.subtitleEn;

  const templateLabel: Record<typeof page.template, string> = {
    article: language === 'bn' ? 'তথ্য ও নির্দেশিকা' : 'Editorial Guide',
    camp: language === 'bn' ? 'রক্তদান ক্যাম্প' : 'Blood Donation Camp',
    faq: language === 'bn' ? 'প্রশ্নোত্তর ও নীতিমালা' : 'Guidelines & FAQ',
    partner: language === 'bn' ? 'অংশীদার স্পটলাইট' : 'Partner Spotlight',
  };

  return (
    <div className="bg-slate-50 pb-20 md:pb-12">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-800">
                {templateLabel[page.template]}
                {!page.isPublished && ' · Draft Preview'}
              </p>
              <h1
                style={{ textWrap: 'balance' }}
                className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
              >
                {title}
              </h1>
              <p className="text-base leading-relaxed text-slate-600">{subtitle}</p>
            </div>
            {currentUser?.role === 'admin' && (
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
                Edit in Admin CMS
              </Button>
            )}
          </div>

          {page.coverImageUrl && !coverFailed && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 max-h-[340px]">
              <img
                src={page.coverImageUrl}
                alt={title}
                referrerPolicy="no-referrer"
                onError={() => setCoverFailed(true)}
                className="h-full w-full object-cover max-h-[340px]"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        {page.blocks.map((block) => {
          const heading = language === 'bn' ? block.headingBn : block.headingEn;
          const body = language === 'bn' ? block.bodyBn : block.bodyEn;
          const ctaLabel = language === 'bn' ? block.ctaLabelBn : block.ctaLabelEn;

          return (
            <section
              key={block.id}
              className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-3"
            >
              <h2 className="font-display text-xl font-semibold text-slate-900">{heading}</h2>
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">{body}</p>
              {ctaLabel && block.ctaRoute && (
                <div className="pt-2">
                  {block.ctaRoute.startsWith('http://') || block.ctaRoute.startsWith('https://') ? (
                    <a
                      href={block.ctaRoute}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-rose-800 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-900"
                    >
                      <span>{ctaLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  ) : (
                    <Button size="sm" onClick={() => navigate(block.ctaRoute as AppRoute)}>
                      <span>{ctaLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  )}
                </div>
              )}
            </section>
          );
        })}

        <AdBannerSlot placement="custom_pages" />
      </div>
    </div>
  );
};
