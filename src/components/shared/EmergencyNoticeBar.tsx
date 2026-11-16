import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRoktodaanStore, type AppRoute } from '../../store/useRoktodaanStore';

export const EmergencyNoticeBar: React.FC = () => {
  const { language, emergencyNotices, navigate } = useRoktodaanStore();
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const visibleNotices = emergencyNotices.filter(
    (n) => n.isActive && !dismissedIds.includes(n.id)
  );

  if (visibleNotices.length === 0) {
    return null;
  }

  const active = visibleNotices[0];
  const title = language === 'bn' ? active.titleBn : active.titleEn;
  const message = language === 'bn' ? active.messageBn : active.messageEn;
  const ctaLabel = language === 'bn' ? active.ctaLabelBn : active.ctaLabelEn;

  const isCritical = active.severity === 'critical';
  const isUrgent = active.severity === 'urgent';

  return (
    <div
      role="region"
      aria-label="Emergency notice"
      className={cn(
        'border-b text-sm',
        isCritical
          ? 'border-rose-900 bg-rose-900 text-white'
          : isUrgent
          ? 'border-amber-200 bg-amber-50 text-amber-950'
          : 'border-slate-200 bg-slate-900 text-white'
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:items-center">
          {active.severity === 'info' ? (
            <Info className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" aria-hidden="true" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" aria-hidden="true" />
          )}
          <div className="min-w-0 flex-1">
            <span className="font-semibold">{title}</span>
            {active.targetBloodGroup && (
              <span className="ml-2 font-mono text-xs font-semibold opacity-90">
                [{active.targetBloodGroup}]
              </span>
            )}
            <span className="mx-2 hidden opacity-60 sm:inline" aria-hidden="true">
              ·
            </span>
            <span className="block text-xs opacity-90 sm:inline">{message}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {ctaLabel && active.ctaRoute && (
            <button
              type="button"
              onClick={() => navigate(active.ctaRoute as AppRoute)}
              className={cn(
                'inline-flex min-h-[32px] items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer',
                isCritical
                  ? 'bg-white text-rose-900 hover:bg-rose-50'
                  : isUrgent
                  ? 'bg-amber-900 text-white hover:bg-amber-950'
                  : 'bg-white text-slate-900 hover:bg-slate-100'
              )}
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            aria-label="Dismiss emergency notice"
            onClick={() => setDismissedIds((prev) => [...prev, active.id])}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md opacity-80 hover:opacity-100 cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
