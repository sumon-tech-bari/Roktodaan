import React from 'react';
import { ArrowRight, CalendarCheck2, Droplets, MailCheck, MapPin, ShieldCheck } from 'lucide-react';
import { BLOOD_GROUPS, COMPATIBLE_DONOR_GROUPS, getCompatibleRecipientGroups } from '../lib/matching';
import { useRoktodaanStore } from '../store/useRoktodaanStore';
import { Button } from '../components/ui/button';
import { MedicalDisclaimerBanner } from '../components/shared/MedicalDisclaimerBanner';

export const HowItWorksPage: React.FC = () => {
  const { language, navigate } = useRoktodaanStore();
  const bn = language === 'bn';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
      <header className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-800">
          {bn ? 'ক্লিনিক্যাল ম্যাচিং প্রোটোকল' : 'Clinical Matching Protocol'}
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {bn ? 'রক্তদান (Roktodaan) যেভাবে কাজ করে' : 'How Roktodaan Matches Patients & Donors'}
        </h1>
        <p className="text-base leading-relaxed text-slate-600">
          {bn
            ? 'বাংলাদেশের ইউনিয়ন পর্যায় থেকে জরুরি প্রয়োজনে ডব্লিউএইচও ৯০ দিনের বিরতি ও সঠিক ABO/Rh রক্তের গ্রুপ অনুযায়ী দ্রুত রক্তদাতা সমন্বয় করা হয়।'
            : 'Every blood request passes through four deterministic clinical and geographic checks before notifying nearby voluntary donors down to the Bangladesh Union level.'}
        </p>
      </header>

      {/* 4-Step Operational Pipeline */}
      <section aria-label="Matching workflow steps" className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <MapPin className="h-6 w-6 text-rose-800" aria-hidden="true" />
          <p className="font-mono text-xs font-semibold text-slate-400">STEP 01</p>
          <h2 className="font-display text-base font-bold text-slate-900">
            {bn ? 'ইউনিয়ন জিপিএস দূরত্ব' : 'Union GPS Proximity'}
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            {bn
              ? 'বিভাগ → জেলা → উপজেলা → ইউনিয়ন অনুযায়ী Haversine দূরত্ব হিসাব করে নিকটতম দাতাদের অগ্রাধিকার দেওয়া হয়।'
              : 'Division, District, Upazila, and Union coordinates compute real Haversine travel distance from donor to hospital.'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <Droplets className="h-6 w-6 text-rose-800" aria-hidden="true" />
          <p className="font-mono text-xs font-semibold text-slate-400">STEP 02</p>
          <h2 className="font-display text-base font-bold text-slate-900">
            {bn ? 'ABO ও Rh সামঞ্জস্যতা' : 'ABO & Rh Compatibility'}
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            {bn
              ? 'শুধুমাত্র সামঞ্জস্যপূর্ণ রক্তদাতা দেখানো হয়—যেমন O- সবাইকে দিতে পারে এবং AB+ সবার থেকে নিতে পারে।'
              : 'Exact group matches rank first alongside medically compatible groups—O- donates to all, AB+ receives from all.'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <CalendarCheck2 className="h-6 w-6 text-rose-800" aria-hidden="true" />
          <p className="font-mono text-xs font-semibold text-slate-400">STEP 03</p>
          <h2 className="font-display text-base font-bold text-slate-900">
            {bn ? '৯০ দিনের স্বয়ংক্রিয় বিরতি' : '90-Day Recovery Lock'}
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            {bn
              ? 'সফল রক্তদানের পর দাতার প্রোফাইল স্বয়ংক্রিয়ভাবে ৯০ দিনের জন্য বিরতি অবস্থায় চলে যায়।'
              : 'After a completed donation, donors automatically switch to unavailable for 90 days to protect hemoglobin health.'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <MailCheck className="h-6 w-6 text-rose-800" aria-hidden="true" />
          <p className="font-mono text-xs font-semibold text-slate-400">STEP 04</p>
          <h2 className="font-display text-base font-bold text-slate-900">
            {bn ? 'তাৎক্ষণিক ইমেইল ও এসএমএস' : 'Multi-Channel Dispatch'}
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            {bn
              ? 'যাচাইকৃত মোবাইল OTP অনুরোধ জমা হলে ইমেইল অ্যালার্ট পাঠানো হয় এবং এসএমএস গেটওয়ে কিউ প্রস্তুত থাকে।'
              : 'Phone-verified requests trigger instant donor email notifications with a Bangladesh SMS gateway payload ready.'}
          </p>
        </div>
      </section>

      {/* Complete ABO/Rh Compatibility Matrix Table */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              {bn ? 'ABO ও Rh রক্তের গ্রুপ সামঞ্জস্যতা তালিকা' : 'Complete ABO & Rh Blood Compatibility Chart'}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {bn
                ? 'রোগী ও দাতার জন্য চিকিৎসাবিজ্ঞান-সম্মত সামঞ্জস্যতা规则 (O- সর্বজনীন দাতা, AB+ সর্বজনীন গ্রহীতা)।'
                : 'Medical transfusion rules enforced across matching and donor search: O- is universal donor, AB+ is universal recipient.'}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate('/find-donors')}>
            {bn ? 'দাতা খুঁজুন' : 'Search Compatible Donors'}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-6 py-3.5">{bn ? 'রক্তের গ্রুপ' : 'Blood Group'}</th>
                <th className="px-6 py-3.5">{bn ? 'যাদের রক্ত দিতে পারবেন (Donate To)' : 'Can Donate To'}</th>
                <th className="px-6 py-3.5">{bn ? 'যাদের থেকে রক্ত নিতে পারবেন (Receive From)' : 'Can Receive From'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {BLOOD_GROUPS.map((group) => {
                const donateTo = getCompatibleRecipientGroups(group);
                const receiveFrom = COMPATIBLE_DONOR_GROUPS[group];
                return (
                  <tr key={group} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5">
                      <span className="inline-flex h-9 w-12 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 font-display font-bold text-rose-900">
                        {group}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs text-slate-800">
                      {donateTo.join(', ')}
                      {group === 'O-' && (
                        <span className="ml-2 font-sans font-semibold text-rose-800">
                          ({bn ? 'সর্বজনীন দাতা' : 'Universal Donor'})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs text-slate-700">
                      {receiveFrom.join(', ')}
                      {group === 'AB+' && (
                        <span className="ml-2 font-sans font-semibold text-emerald-700">
                          ({bn ? 'সর্বজনীন গ্রহীতা' : 'Universal Recipient'})
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <MedicalDisclaimerBanner language={language} />

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-rose-800 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-display text-base font-semibold text-slate-900">
              {bn ? 'রক্তদান বা অনুরোধ শুরু করতে প্রস্তুত?' : 'Ready to coordinate blood safely?'}
            </p>
            <p className="text-xs text-slate-600">
              {bn ? 'বাধ্যতামূলক OTP যাচাইকরণের মাধ্যমে আপনার এলাকার সাথে যুক্ত হোন।' : 'Mandatory phone verification protects every patient and donor across Bangladesh.'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => navigate('/register-donor')}>
            {bn ? 'রক্তদাতা নিবন্ধন' : 'Register as Donor'}
          </Button>
          <Button onClick={() => navigate('/request-blood')}>
            {bn ? 'রক্তের অনুরোধ করুন' : 'Request Blood'}
          </Button>
        </div>
      </div>
    </div>
  );
};
