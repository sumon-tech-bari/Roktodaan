import React, { useState } from 'react';
import { ArrowRight, Megaphone } from 'lucide-react';
import type { AdPlacement } from '../../types/database';
import { useRoktodaanStore, type AppRoute } from '../../store/useRoktodaanStore';
import { Button } from '../ui/button';

interface AdBannerSlotProps {
  placement: AdPlacement;
}

export const AdBannerSlot: React.FC<AdBannerSlotProps> = ({ placement }) => {
  const { language, adCampaigns, recordAdClick, navigate } = useRoktodaanStore();
  const [imgFailed, setImgFailed] = useState<Record<string, boolean>>({});

  const activeAds = adCampaigns.filter((a) => a.isActive && a.placement === placement);
  if (activeAds.length === 0) {
    return null;
  }

  const ad = activeAds[0];
  const title = language === 'bn' ? ad.titleBn : ad.titleEn;
  const description = language === 'bn' ? ad.descriptionBn : ad.descriptionEn;
  const ctaLabel = language === 'bn' ? ad.ctaLabelBn : ad.ctaLabelEn;

  const handleAction = () => {
    recordAdClick(ad.id);
    if (ad.targetRoute.startsWith('http://') || ad.targetRoute.startsWith('https://')) {
      return;
    }
    navigate(ad.targetRoute as AppRoute);
  };

  return (
    <aside
      aria-label="Partner campaign"
      className="overflow-hidden rounded-xl border border-slate-200 bg-white"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
        <div className="md:col-span-4 bg-slate-100 min-h-[160px]">
          {ad.imageUrl && !imgFailed[ad.id] ? (
            <img
              src={ad.imageUrl}
              alt={title}
              referrerPolicy="no-referrer"
              onError={() => setImgFailed((prev) => ({ ...prev, [ad.id]: true }))}
              className="h-full w-full object-cover max-h-[220px] md:max-h-none"
            />
          ) : (
            <div className="flex h-full min-h-[160px] flex-col items-center justify-center bg-gradient-to-br from-rose-900 to-slate-900 p-6 text-center text-white">
              <Megaphone className="h-8 w-8 text-rose-200 mb-2" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-100">
                {ad.sponsorName}
              </p>
            </div>
          )}
        </div>

        <div className="md:col-span-8 flex flex-col justify-between gap-4 p-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-rose-800">
                {language === 'bn' ? 'অংশীদার ক্যাম্পেইন' : 'Partner Campaign'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{ad.sponsorName}</span>
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 sm:text-xl">{title}</h3>
            <p className="text-sm leading-relaxed text-slate-600">{description}</p>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
            <span className="text-xs text-slate-500">
              {language === 'bn'
                ? 'অ্যাডমিন প্যানেল থেকে পরিচালিত'
                : 'Verified partner announcement'}
            </span>
            {ad.targetRoute.startsWith('http://') || ad.targetRoute.startsWith('https://') ? (
              <a
                href={ad.targetRoute}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => recordAdClick(ad.id)}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-rose-800 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-900 whitespace-nowrap"
              >
                <span>{ctaLabel}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ) : (
              <Button size="sm" onClick={handleAction}>
                <span>{ctaLabel}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
