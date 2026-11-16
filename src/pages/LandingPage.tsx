import React, { useState } from 'react';
import { ArrowRight, MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { t } from '../lib/i18n';
import { BLOOD_GROUPS, matchDonorsForRequest } from '../lib/matching';
import { findUnionCoordinates } from '../lib/bangladesh-locations';
import { cn, formatRelativeTime } from '../lib/utils';
import { useRoktodaanStore } from '../store/useRoktodaanStore';
import type { BloodGroup } from '../types/database';
import { Button } from '../components/ui/button';
import { LocationCascadeSelector } from '../components/shared/LocationCascadeSelector';
import { AdBannerSlot } from '../components/shared/AdBannerSlot';

export const LandingPage: React.FC = () => {
  const {
    language,
    setLanguage,
    donors,
    requests,
    impactBaseline,
    navigate,
    setPreselectedArea,
  } = useRoktodaanStore();
  const copy = t(language);

  const [quickBloodGroup, setQuickBloodGroup] = useState<BloodGroup>('O+');
  const [quickArea, setQuickArea] = useState({
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Savar',
    unionName: 'Ashulia',
  });
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const coords = findUnionCoordinates(
    quickArea.division,
    quickArea.district,
    quickArea.upazila,
    quickArea.unionName
  );
  const quickMatches = matchDonorsForRequest(
    {
      bloodGroup: quickBloodGroup,
      division: quickArea.division,
      district: quickArea.district,
      upazila: quickArea.upazila,
      unionName: quickArea.unionName,
      latitude: coords.lat,
      longitude: coords.lng,
      urgency: 'urgent',
    },
    donors
  );

  const openRequests = requests.filter((r) => r.status === 'open' || r.status === 'matched').slice(0, 3);

  const handleQuickSearch = () => {
    setPreselectedArea({
      ...quickArea,
      bloodGroup: quickBloodGroup,
    });
    navigate('/find-donors');
  };

  return (
    <div className="bg-slate-50">
      {/* Compact bilingual utility strip directly inside workspace canvas (outside TopBar) */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
          <p className="text-xs font-medium text-slate-600">{copy.hero.eyebrow}</p>
          <div
            role="group"
            aria-label="Language selection"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5"
          >
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer',
                language === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              )}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('bn')}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer',
                language === 'bn' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              )}
            >
              বাংলা
            </button>
          </div>
        </div>
      </div>

      {/* Section 1: Hero Split */}
      <section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-stretch">
            <div className="flex flex-col justify-between lg:col-span-6 space-y-6">
              <div className="space-y-5">
                <h1
                  style={{ textWrap: 'balance' }}
                  className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl leading-[1.12]"
                >
                  {copy.hero.title}
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  {copy.hero.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button size="lg" onClick={() => navigate('/request-blood')}>
                  {copy.hero.primaryCta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/register-donor')}>
                  {copy.hero.secondaryCta}
                </Button>
              </div>

              <div className="border-t border-slate-200 pt-5 text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>WHO 90-day safety interval</span>
                <span aria-hidden="true">·</span>
                <span>All 8 Bangladesh divisions</span>
                <span aria-hidden="true">·</span>
                <span>Masked donor privacy</span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 min-h-[280px]">
                {!heroImgFailed ? (
                  <img
                    src="/src/assets/images/hero_roktodaan_clinic_1794820531516.jpg"
                    alt="Modern humanitarian blood donation clinic in Bangladesh with medical staff"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-[300px] flex-col items-center justify-center bg-gradient-to-br from-rose-900 to-slate-900 p-8 text-center text-white">
                    <ShieldCheck className="h-12 w-12 text-rose-200 mb-3" aria-hidden="true" />
                    <p className="font-display text-xl font-semibold">Roktodaan Clinical Network</p>
                    <p className="mt-1 text-sm text-rose-100">Nationwide Union-Level Blood Matching</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4-column Impact Strip directly below hero */}
          <div className="mt-10 grid grid-cols-2 gap-4 border-t border-slate-200 pt-8 lg:grid-cols-4">
            <div>
              <p className="font-display text-2xl font-bold text-slate-900 tabular-nums sm:text-3xl">
                {(impactBaseline.totalDonors + donors.length).toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-slate-600">{copy.stats.donors}</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-rose-800 tabular-nums sm:text-3xl">
                {impactBaseline.successfulMatches.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-slate-600">{copy.stats.matches}</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-slate-900 tabular-nums sm:text-3xl">
                {impactBaseline.livesImpacted.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-slate-600">{copy.stats.lives}</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-slate-900 tabular-nums sm:text-3xl">
                {impactBaseline.activeUnionsCovered.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-slate-600">{copy.stats.unions}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Interactive Union-Level Availability Checker */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-5">
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-900">
                {copy.hero.locationCheckTitle}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Select blood group and Bangladesh Division → District → Upazila → Union to preview live compatible donors.
              </p>
            </div>
            <div className="text-sm font-medium text-rose-800 tabular-nums">
              {quickMatches.length} eligible donors nearby
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <span className="block text-sm font-medium text-slate-800 mb-2">
                {copy.findDonors.bloodGroupLabel}
              </span>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Select blood group">
                {BLOOD_GROUPS.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setQuickBloodGroup(group)}
                    className={cn(
                      'min-h-[40px] min-w-[52px] rounded-lg border px-3 text-sm font-semibold transition-colors cursor-pointer',
                      quickBloodGroup === group
                        ? 'border-rose-800 bg-rose-800 text-white'
                        : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                    )}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            <LocationCascadeSelector
              language={language}
              division={quickArea.division}
              district={quickArea.district}
              upazila={quickArea.upazila}
              unionName={quickArea.unionName}
              onChange={setQuickArea}
            />

            <div className="flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-600">
                {quickMatches.length > 0 ? (
                  <span>
                    Closest match: <strong className="text-slate-900">{quickMatches[0].donor.fullName}</strong> ({quickMatches[0].donor.bloodGroup}) ·{' '}
                    <span className="font-mono tabular-nums">{quickMatches[0].distanceKm} km</span> away
                  </span>
                ) : (
                  <span>Expand search to Upazila or District level in Find Donors.</span>
                )}
              </div>
              <Button onClick={handleQuickSearch}>
                View Matched Donors
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: How Clinical Matching Works + Active Emergency Feed */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                {copy.howItWorks.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {copy.howItWorks.subtitle}
              </p>
            </div>

            <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              <div className="p-6">
                <h3 className="font-display text-base font-semibold text-slate-900">
                  {copy.howItWorks.step1Title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {copy.howItWorks.step1Desc}
                </p>
              </div>
              <div className="p-6">
                <h3 className="font-display text-base font-semibold text-slate-900">
                  {copy.howItWorks.step2Title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {copy.howItWorks.step2Desc}
                </p>
              </div>
              <div className="p-6">
                <h3 className="font-display text-base font-semibold text-slate-900">
                  {copy.howItWorks.step3Title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {copy.howItWorks.step3Desc}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Active Requests Across Bangladesh
              </h2>
              <button
                type="button"
                onClick={() => navigate('/request-blood')}
                className="text-xs font-semibold text-rose-800 hover:underline cursor-pointer"
              >
                New Request
              </button>
            </div>

            <div className="space-y-3">
              {openRequests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 font-display text-lg font-bold text-rose-900">
                      {req.bloodGroup}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {req.hospitalName || req.patientName}
                        </p>
                        <span
                          className={cn(
                            'text-xs font-semibold uppercase tracking-wide shrink-0',
                            req.urgency === 'critical'
                              ? 'text-red-700'
                              : req.urgency === 'urgent'
                              ? 'text-amber-700'
                              : 'text-slate-600'
                          )}
                        >
                          {req.urgency}
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                        <span className="truncate">
                          {req.unionName}, {req.upazila}, {req.district}
                        </span>
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 tabular-nums">
                        <span>
                          {req.bagsNeeded} {req.bagsNeeded === 1 ? 'bag' : 'bags'} needed
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{formatRelativeTime(req.createdAt, language)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <img
                src="/src/assets/images/community_donor_drive_1794820532640.jpg"
                alt="Bangladeshi community blood donation camp organized with humanitarian volunteers"
                referrerPolicy="no-referrer"
                className="h-44 w-full object-cover"
              />
              <div className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Global NGO & Charity Integration
                  </p>
                  <p className="text-xs text-slate-600">
                    Designed for Red Cross, Rotary & campus chapters
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/about')}>
                  <CheckCircle2 className="h-3.5 w-3.5 text-rose-800" aria-hidden="true" />
                  Partners
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <AdBannerSlot placement="landing" />
        </div>
      </section>
    </div>
  );
};
