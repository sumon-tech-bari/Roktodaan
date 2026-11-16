import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { Language } from '../../types/database';
import { cn } from '../../lib/utils';

interface MedicalDisclaimerBannerProps {
  language: Language;
  className?: string;
  compact?: boolean;
}

export const MedicalDisclaimerBanner: React.FC<MedicalDisclaimerBannerProps> = ({
  language,
  className,
  compact = false,
}) => {
  return (
    <div
      role="note"
      aria-label={language === 'bn' ? 'চিকিৎসা সতর্কতা' : 'Medical disclaimer'}
      className={cn(
        'flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-100/80 text-slate-700',
        compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-xs sm:text-sm',
        className
      )}
    >
      <AlertCircle className="h-4 w-4 shrink-0 text-rose-800 mt-0.5" aria-hidden="true" />
      <p className="leading-relaxed">
        <strong className="font-semibold text-slate-900">
          {language === 'bn'
            ? 'চিকিৎসা সতর্কতা: রক্তদান শুধুমাত্র একটি রক্তদাতা সমন্বয় প্ল্যাটফর্ম, কোনো চিকিৎসা সেবা নয়।'
            : 'Medical Disclaimer: Roktodaan is only a matching platform, not a medical service.'}
        </strong>{' '}
        {language === 'bn'
          ? 'রক্ত পরিসঞ্চালনের পূর্বে সর্বদা অনুমোদিত হাসপাতাল বা ব্লাড ব্যাংকে ক্রস-ম্যাচিং ও স্ক্রিনিং সম্পন্ন করুন।'
          : 'Always perform cross-matching, hemoglobin screening, and transfusion procedures through a licensed hospital or blood bank.'}
      </p>
    </div>
  );
};
