import React, { useMemo, useState } from 'react';
import { CheckCircle2, Flag, MapPin, Phone, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { t } from '../lib/i18n';
import { BLOOD_GROUPS, COMPATIBLE_DONOR_GROUPS, matchDonorsForRequest } from '../lib/matching';
import { findUnionCoordinates } from '../lib/bangladesh-locations';
import { cn, maskPhoneNumber } from '../lib/utils';
import { useRoktodaanStore } from '../store/useRoktodaanStore';
import type { BloodGroup } from '../types/database';
import { Button } from '../components/ui/button';
import { LocationCascadeSelector } from '../components/shared/LocationCascadeSelector';
import { DonorMap } from '../components/shared/DonorMap';
import { AdBannerSlot } from '../components/shared/AdBannerSlot';
import { MedicalDisclaimerBanner } from '../components/shared/MedicalDisclaimerBanner';
import { SafetyReportModal } from '../components/shared/SafetyReportModal';

export const FindDonorsPage: React.FC = () => {
  const {
    language,
    donors,
    bloodBanks,
    requests,
    blockedUserIds,
    preselectedArea,
    setPreselectedArea,
    navigate,
  } = useRoktodaanStore();
  const copy = t(language);

  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(
    preselectedArea?.bloodGroup ?? 'O+'
  );
  const [area, setArea] = useState({
    division: preselectedArea?.division ?? '',
    district: preselectedArea?.district ?? '',
    upazila: preselectedArea?.upazila ?? '',
    unionName: preselectedArea?.unionName ?? '',
  });
  const [exactOnly, setExactOnly] = useState(false);
  const [includeCooldown, setIncludeCooldown] = useState(false);
  const [revealedPhones, setRevealedPhones] = useState<Record<string, boolean>>({});
  const [reportTarget, setReportTarget] = useState<{ userId: string; name: string } | null>(null);

  const center = useMemo(() => {
    if (area.division && area.district && area.upazila) {
      return findUnionCoordinates(area.division, area.district, area.upazila, area.unionName);
    }
    return { lat: 23.8103, lng: 90.4125 };
  }, [area]);

  const mapZoom = area.unionName ? 13 : area.upazila ? 11 : area.district ? 9 : 7;

  const matchedDonors = useMemo(() => {
    const visibleDonors = donors.filter((d) => !blockedUserIds.includes(d.userId));
    const base = matchDonorsForRequest(
      {
        bloodGroup,
        division: area.division || 'Dhaka',
        district: area.district || 'Dhaka',
        upazila: area.upazila || 'Savar',
        unionName: area.unionName || 'Ashulia',
        latitude: center.lat,
        longitude: center.lng,
        urgency: 'urgent',
      },
      visibleDonors,
      { includeCooldown }
    );

    return base.filter((item) => {
      if (exactOnly && !item.exactBloodMatch) return false;
      if (area.division && item.donor.division !== area.division) return false;
      if (area.district && item.donor.district !== area.district) return false;
      if (area.upazila && item.donor.upazila !== area.upazila) return false;
      if (area.unionName && item.donor.unionName !== area.unionName) return false;
      return true;
    });
  }, [bloodGroup, area, center, donors, blockedUserIds, exactOnly, includeCooldown]);

  const handleRequestForArea = () => {
    setPreselectedArea({
      ...area,
      bloodGroup,
    });
    navigate('/request-blood');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {copy.findDonors.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{copy.findDonors.subtitle}</p>
        </div>
        <Button onClick={handleRequestForArea}>
          {copy.findDonors.requestDirectly}
        </Button>
      </div>

      {/* Filters Panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="block text-sm font-medium text-slate-800 mb-2">
              {copy.findDonors.bloodGroupLabel}
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by blood group">
              {BLOOD_GROUPS.map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setBloodGroup(group)}
                  className={cn(
                    'min-h-[40px] min-w-[50px] rounded-lg border px-3 text-sm font-semibold transition-colors cursor-pointer',
                    bloodGroup === group
                      ? 'border-rose-800 bg-rose-800 text-white'
                      : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                  )}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={exactOnly}
                onChange={(e) => setExactOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-rose-800 focus:ring-rose-700"
              />
              {copy.findDonors.exactOnly}
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={includeCooldown}
                onChange={(e) => setIncludeCooldown(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-rose-800 focus:ring-rose-700"
              />
              {copy.findDonors.includeCooldown}
            </label>
          </div>
        </div>

        <LocationCascadeSelector
          language={language}
          division={area.division}
          district={area.district}
          upazila={area.upazila}
          unionName={area.unionName}
          allowAll
          onChange={setArea}
        />

          <p className="text-xs text-slate-600">
            {language === 'bn' ? (
              <>
                <strong>{bloodGroup}</strong> রোগীর জন্য সামঞ্জস্যপূর্ণ রক্তদাতা গ্রুপ:{' '}
                <span className="font-semibold text-rose-900">
                  {exactOnly ? bloodGroup : COMPATIBLE_DONOR_GROUPS[bloodGroup].join(', ')}
                </span>
              </>
            ) : (
              <>
                Compatible donor blood groups for <strong>{bloodGroup}</strong> recipient:{' '}
                <span className="font-semibold text-rose-900">
                  {exactOnly ? bloodGroup : COMPATIBLE_DONOR_GROUPS[bloodGroup].join(', ')}
                </span>
              </>
            )}
          </p>

        {(area.division || exactOnly || includeCooldown) && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              Showing {matchedDonors.length} compatible donors
            </span>
            <button
              type="button"
              onClick={() => {
                setArea({ division: '', district: '', upazila: '', unionName: '' });
                setExactOnly(false);
                setIncludeCooldown(false);
              }}
              className="font-medium text-rose-800 hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      <MedicalDisclaimerBanner language={language} compact />

      {/* Results Grid + Interactive Map */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-7 space-y-3" data-testid="donor-results-list">
          {matchedDonors.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
              <p className="font-display text-base font-semibold text-slate-900">
                {copy.findDonors.noResultsTitle}
              </p>
              <p className="mt-1.5 text-sm text-slate-600">{copy.findDonors.noResultsDesc}</p>
              <Button
                variant="outline"
                className="mt-5"
                onClick={() => setArea({ division: '', district: '', upazila: '', unionName: '' })}
              >
                Show Nationwide Donors
              </Button>
            </div>
          ) : (
            matchedDonors.map(({ donor, distanceKm, exactBloodMatch, eligibility }) => {
              const isRevealed = !!revealedPhones[donor.id];
              return (
                <div
                  key={donor.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 font-display text-lg font-bold text-rose-900">
                        {donor.bloodGroup}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-display text-base font-semibold text-slate-900">
                            {donor.fullName}
                          </h2>
                          {donor.isVerified && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                              {copy.findDonors.verifiedLabel}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                          <span>
                            {donor.unionName}, {donor.upazila}, {donor.district}
                          </span>
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 tabular-nums">
                          <span>{exactBloodMatch ? 'Exact group' : 'Compatible ABO/Rh'}</span>
                          <span aria-hidden="true">·</span>
                          <span>{distanceKm} km away</span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={
                              eligibility.eligible ? 'font-medium text-emerald-700' : 'text-amber-700'
                            }
                          >
                            {eligibility.eligible
                              ? copy.findDonors.eligibleNow
                              : `${copy.findDonors.cooldownLabel} (${eligibility.daysRemaining}d left)`}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{donor.totalDonations} donations</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant={isRevealed ? 'outline' : 'default'}
                        onClick={() =>
                          setRevealedPhones((prev) => ({ ...prev, [donor.id]: !prev[donor.id] }))
                        }
                      >
                        <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="font-mono tabular-nums">
                          {isRevealed ? donor.phone : maskPhoneNumber(donor.phone)}
                        </span>
                      </Button>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" aria-hidden="true" />
                        Prefers {donor.contactPreference}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setReportTarget({ userId: donor.userId, name: donor.fullName })
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-rose-800 cursor-pointer"
                      >
                        <Flag className="h-3 w-3" aria-hidden="true" />
                        {language === 'bn' ? 'রিপোর্ট / ব্লক' : 'Report / Block'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-3">
          <h2 className="font-display text-base font-semibold text-slate-900">
            {copy.findDonors.mapTitle}
          </h2>
          <DonorMap
            donors={matchedDonors.map((m) => m.donor)}
            bloodBanks={bloodBanks}
            activeRequests={requests.filter((r) => r.status === 'open')}
            center={center}
            zoom={mapZoom}
          />
        </div>
      </div>

      <AdBannerSlot placement="find_donors" />

      {reportTarget && (
        <SafetyReportModal
          targetUserId={reportTarget.userId}
          targetName={reportTarget.name}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
};
