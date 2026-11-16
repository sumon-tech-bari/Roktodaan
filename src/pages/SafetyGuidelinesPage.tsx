import React from 'react';
import { ArrowRight, Ban, CalendarClock, CheckCircle2, PhoneCall, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useRoktodaanStore } from '../store/useRoktodaanStore';
import { Button } from '../components/ui/button';
import { MedicalDisclaimerBanner } from '../components/shared/MedicalDisclaimerBanner';

export const SafetyGuidelinesPage: React.FC = () => {
  const { language, navigate } = useRoktodaanStore();
  const bn = language === 'bn';

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-800">
          {bn ? 'বিশ্বাস ও নিরাপত্তা নীতিমালা' : 'Trust, Safety & Clinical Governance'}
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {bn ? 'নিরাপত্তা ও রক্তদান নির্দেশিকা' : 'Safety & Voluntary Donation Guidelines'}
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-slate-600">
          {bn
            ? 'রক্তদান (Roktodaan) স্বেচ্ছাসেবী রক্তদাতা ও রোগীর পরিবারের মধ্যে নিরাপদ সমন্বয় নিশ্চিত করে। নিচের নীতিমালা মেনে চলা সকলের জন্য বাধ্যতামূলক।'
            : 'Roktodaan maintains strict safety safeguards for patients, families, and voluntary donors across all 64 districts of Bangladesh.'}
        </p>
      </header>

      <MedicalDisclaimerBanner language={language} />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <PhoneCall className="h-5 w-5 text-rose-800" aria-hidden="true" />
            <h2 className="font-display text-lg font-semibold text-slate-900">
              {bn ? 'বাধ্যতামূলক মোবাইল নম্বর যাচাই (OTP)' : 'Mandatory Phone Verification'}
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            {bn
              ? 'ভুয়া অনুরোধ ও স্প্যাম প্রতিরোধে প্রতিটি দাতা নিবন্ধন ও রক্তের অনুরোধের আগে +880 মোবাইল নম্বর ৬-সংখ্যার OTP দ্বারা যাচাই করতে হয়।'
              : 'Every donor profile and urgent blood request requires 6-digit Bangladesh mobile (+880) OTP verification prior to publication to eliminate hoax or unreachable listings.'}
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <CalendarClock className="h-5 w-5 text-rose-800" aria-hidden="true" />
            <h2 className="font-display text-lg font-semibold text-slate-900">
              {bn ? '৯০ দিনের বাধ্যতামূলক বিরতি নিয়ম' : 'Automatic 90-Day Recovery Lock'}
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            {bn
              ? 'একবার রক্তদান সম্পন্ন হলে দাতার প্রোফাইল ৯০ দিনের জন্য স্বয়ংক্রিয়ভাবে অনুপলব্ধ হয়ে যায় এবং পুনরায় চালু করা যায় না।'
              : 'Once a donation is completed, the donor profile automatically becomes unavailable for 90 days (3 months) per WHO whole-blood safety standards and cannot be toggled back early.'}
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <Ban className="h-5 w-5 text-rose-800" aria-hidden="true" />
            <h2 className="font-display text-lg font-semibold text-slate-900">
              {bn ? 'শূন্য-আর্থিক লেনদেন নীতি' : 'Zero-Payment Voluntary Pledge'}
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            {bn
              ? 'রক্তদান প্ল্যাটফর্মে রক্তের বিনিময়ে কোনো টাকা বা পারিশ্রমিক দাবি করা সম্পূর্ণ নিষিদ্ধ। কেউ অর্থ চাইলে তাৎক্ষণিক রিপোর্ট ও ব্লক করুন।'
              : 'Voluntary non-remunerated donation only. Requesting or offering money for blood is strictly prohibited under Bangladesh Safe Blood Transfusion Act and leads to permanent account suspension.'}
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-5 w-5 text-rose-800" aria-hidden="true" />
            <h2 className="font-display text-lg font-semibold text-slate-900">
              {bn ? 'রিপোর্ট ও ব্লক সুরক্ষা' : 'Instant Report & Block Moderation'}
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            {bn
              ? 'যেকোনো সন্দেহজনক দাতা বা অনুরোধকারীর বিরুদ্ধে সরাসরি রিপোর্ট ও ব্লক করা যায়—ব্লক করা অ্যাকাউন্ট আপনার ড্যাশবোর্ডে আর দেখাবে না।'
              : 'Seekers and donors can report and immediately block abusive, paid-broker, or unreachable accounts directly from Donor Search and Incoming Request cards.'}
          </p>
        </section>
      </div>

      {/* Hospital Cross-Match Checklist */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-emerald-700" aria-hidden="true" />
          <h2 className="font-display text-lg font-semibold text-slate-900">
            {bn ? 'হাসপাতালে রক্ত গ্রহণের পূর্বের চেকলিস্ট' : 'Mandatory Pre-Transfusion Checklist at Hospital'}
          </h2>
        </div>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm text-slate-700">
          {[
            bn ? 'দাতার বয়স ১৮–৬৫ বছর ও ওজন ন্যূনতম ৫০ কেজি নিশ্চিত করুন' : 'Confirm donor is aged 18–65 and weighs at least 50 kg',
            bn ? 'অনুমোদিত ল্যাবে হিমোগ্লোবিন ও ৫টি সংক্রামক স্ক্রিনিং সম্পন্ন করুন' : 'Complete mandatory lab screening (HBV, HCV, HIV, Syphilis, Malaria)',
            bn ? 'হাসপাতালের ব্লাড ব্যাংকে সরাসরি ক্রস-ম্যাচিং পরীক্ষা করুন' : 'Run blood cross-matching at the licensed hospital blood bank',
            bn ? 'স্বেচ্ছাসেবীর যাতায়াত নিরাপত্তা ও হাসপাতালের রিসিপ্ট সংরক্ষণ করুন' : 'Meet inside the hospital premises or verified blood center',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50 p-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button onClick={() => navigate('/find-donors')}>
            {bn ? 'নিরাপদ দাতা খুঁজুন' : 'Find Verified Donors'}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button variant="outline" onClick={() => navigate('/how-it-works')}>
            {bn ? 'ম্যাচিং পদ্ধতি দেখুন' : 'See Compatibility Chart'}
          </Button>
        </div>
      </section>
    </div>
  );
};
