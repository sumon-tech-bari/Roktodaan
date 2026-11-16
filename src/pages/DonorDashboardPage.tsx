import React, { useState } from 'react';
import { toast } from 'sonner';
import { Calendar, Check, Flag, Lock, MapPin, ShieldCheck, X } from 'lucide-react';
import { t } from '../lib/i18n';
import { checkDonationEligibility, matchRequestsForDonor } from '../lib/matching';
import { cn, formatRelativeTime } from '../lib/utils';
import { useRoktodaanStore } from '../store/useRoktodaanStore';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { MedicalDisclaimerBanner } from '../components/shared/MedicalDisclaimerBanner';
import { SafetyReportModal } from '../components/shared/SafetyReportModal';

export const DonorDashboardPage: React.FC = () => {
  const {
    language,
    currentUser,
    donors,
    requests,
    matches,
    blockedUserIds,
    toggleDonorAvailability,
    respondToRequest,
    completeDonationMatch,
    navigate,
  } = useRoktodaanStore();
  const copy = t(language);
  const [reportTarget, setReportTarget] = useState<{ userId: string; name: string } | null>(null);

  const donorProfile = currentUser
    ? donors.find((d) => d.userId === currentUser.id)
    : undefined;

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Sign in to access your Donor Dashboard
        </h1>
        <p className="text-sm text-slate-600">
          Manage your donation availability, 90-day medical interval, and incoming emergency alerts.
        </p>
        <Button onClick={() => navigate('/auth')}>Sign In</Button>
      </div>
    );
  }

  if (!donorProfile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Complete Your Donor Profile
        </h1>
        <p className="text-sm text-slate-600">
          Add your blood group and Bangladesh Union address to start receiving nearby blood requests.
        </p>
        <Button onClick={() => navigate('/profile')}>Set Up Donor Profile</Button>
      </div>
    );
  }

  const eligibility = checkDonationEligibility(donorProfile.lastDonationDate);
  const incomingRequests = matchRequestsForDonor(donorProfile, requests).filter(
    (entry) => !blockedUserIds.includes(entry.request.seekerId)
  );
  const myResponses = matches.filter((m) => m.donorId === donorProfile.id);
  const pendingDispatches = myResponses.filter((m) => m.status === 'pending');

  const handleRespond = (requestId: string, status: 'accepted' | 'declined', distanceKm: number) => {
    respondToRequest(
      requestId,
      donorProfile,
      status,
      distanceKm,
      status === 'accepted'
        ? 'Confirmed available for cross-match.'
        : 'Unable to reach at this time.'
    );
    toast.success(
      status === 'accepted'
        ? 'Request accepted. Seeker can now see your confirmation.'
        : 'Response recorded.'
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {copy.dashboard.donorTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {donorProfile.fullName} · Blood Group{' '}
            <strong className="text-rose-800">{donorProfile.bloodGroup}</strong> ·{' '}
            {donorProfile.unionName}, {donorProfile.upazila}, {donorProfile.district}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/seeker')}>
            Switch to Seeker Tracker
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Top Controls Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500">{copy.dashboard.availabilityTitle}</p>
            <p className="mt-1 font-display text-base font-semibold text-slate-900">
              {!eligibility.eligible
                ? language === 'bn'
                  ? `৯০ দিনের বিরতি (${eligibility.daysRemaining} দিন বাকি)`
                  : `90-Day Recovery Lock (${eligibility.daysRemaining}d left)`
                : donorProfile.isAvailable
                ? copy.dashboard.availabilityOn
                : copy.dashboard.availabilityOff}
            </p>
            {!eligibility.eligible && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-700">
                <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
                {language === 'bn'
                  ? 'রক্তদানের পর ৯০ দিনের জন্য স্বয়ংক্রিয়ভাবে বন্ধ থাকবে।'
                  : `Auto-locked until ${eligibility.nextEligibleDate}`}
              </p>
            )}
          </div>
          <Switch
            ariaLabel="Toggle donation availability"
            checked={donorProfile.isAvailable && eligibility.eligible}
            disabled={!eligibility.eligible && !donorProfile.isAvailable}
            onCheckedChange={() => {
              const result = toggleDonorAvailability(currentUser.id);
              if (!result.ok) {
                toast.error(
                  language === 'bn'
                    ? `৯০ দিনের বিরতি শর্ত অনুযায়ী আরও ${result.daysRemaining} দিন অপেক্ষা করতে হবে (${result.nextEligibleDate})।`
                    : `Automatically locked for 90-day recovery (${result.daysRemaining} days left until ${result.nextEligibleDate}).`
                );
                return;
              }
              toast.success(
                result.isAvailable
                  ? 'You are now visible as Available for nearby matches'
                  : 'Status paused — hidden from new searches'
              );
            }}
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">{copy.dashboard.eligibilityTitle}</p>
          <p
            className={cn(
              'mt-1 font-display text-base font-semibold',
              eligibility.eligible ? 'text-emerald-700' : 'text-amber-700'
            )}
          >
            {eligibility.eligible
              ? copy.dashboard.eligibleReady
              : `${eligibility.daysRemaining} days remaining (${eligibility.nextEligibleDate})`}
          </p>
          <p className="mt-1 text-xs text-slate-500 flex items-center gap-1.5 tabular-nums">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            Last donation: {donorProfile.lastDonationDate || 'None recorded'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Verification & History</p>
          <p className="mt-1 font-display text-base font-semibold text-slate-900 tabular-nums">
            {donorProfile.totalDonations} completed donations
          </p>
          <p className="mt-1 text-xs text-slate-600 flex items-center gap-1.5">
            <ShieldCheck
              className={cn(
                'h-3.5 w-3.5',
                donorProfile.isVerified ? 'text-emerald-600' : 'text-slate-400'
              )}
              aria-hidden="true"
            />
            {donorProfile.isVerified ? 'Verified National Donor' : 'Pending verification review'}
          </p>
        </div>
      </div>

      {/* Direct Smart Match Dispatches */}
      {pendingDispatches.length > 0 && (
        <section
          aria-label="Direct match alerts"
          className="rounded-xl border border-rose-200 bg-rose-50/70 p-5 space-y-3"
        >
          <h2 className="font-display text-base font-semibold text-rose-950">
            Priority Dispatched Match Alerts ({pendingDispatches.length})
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {pendingDispatches.map((match) => {
              const req = requests.find((r) => r.id === match.requestId);
              if (!req) return null;
              return (
                <div
                  key={match.id}
                  className="rounded-xl border border-rose-200 bg-white p-4 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-bold text-slate-900">
                        {req.hospitalName || req.patientName} ({req.bloodGroup})
                      </span>
                      <span className="font-mono text-xs text-rose-800 tabular-nums">
                        {match.distanceKm} km
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      {req.unionName}, {req.upazila}, {req.district} · {req.bagsNeeded} bag(s) · {req.urgency.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRespond(req.id, 'declined', match.distanceKm)}
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                      {copy.dashboard.declineBtn}
                    </Button>
                    <Button
                      size="sm"
                      disabled={!eligibility.eligible}
                      onClick={() => handleRespond(req.id, 'accepted', match.distanceKm)}
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      {copy.dashboard.acceptBtn}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Content Split */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-4">
          <h2 className="font-display text-lg font-semibold text-slate-900">
            {copy.dashboard.incomingRequests} ({incomingRequests.length})
          </h2>

          {incomingRequests.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
              No active compatible blood requests at this moment.
            </div>
          ) : (
            <div className="space-y-3">
              {incomingRequests.map(({ request, distanceKm, exactBloodMatch }) => {
                const existingMatch = myResponses.find((m) => m.requestId === request.id);
                const canRespond = !existingMatch || existingMatch.status === 'pending';
                return (
                  <div
                    key={request.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 font-display text-lg font-bold text-rose-900">
                          {request.bloodGroup}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-display text-base font-semibold text-slate-900">
                              {request.hospitalName || request.patientName}
                            </h3>
                            <span
                              className={cn(
                                'text-xs font-semibold uppercase',
                                request.urgency === 'critical'
                                  ? 'text-red-700'
                                  : request.urgency === 'urgent'
                                  ? 'text-amber-700'
                                  : 'text-slate-600'
                              )}
                            >
                              {request.urgency}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-600 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                            {request.unionName}, {request.upazila}, {request.district}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 tabular-nums">
                            <span>{request.bagsNeeded} bags needed</span>
                            <span aria-hidden="true">·</span>
                            <span>{distanceKm} km away</span>
                            <span aria-hidden="true">·</span>
                            <span>{exactBloodMatch ? 'Exact blood match' : 'Compatible group'}</span>
                            <span aria-hidden="true">·</span>
                            <span>{formatRelativeTime(request.createdAt, language)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {request.notes && (
                      <p className="rounded-lg bg-slate-50 px-3.5 py-2.5 text-xs text-slate-700">
                        {request.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs text-slate-500 font-mono">
                          Attendant: {request.contactPhone}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setReportTarget({
                              userId: request.seekerId,
                              name: `${request.patientName} (${request.seekerName})`,
                            })
                          }
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-rose-800 cursor-pointer"
                        >
                          <Flag className="h-3 w-3" aria-hidden="true" />
                          {language === 'bn' ? 'রিপোর্ট / ব্লক' : 'Report / Block'}
                        </button>
                      </div>
                      {!canRespond && existingMatch ? (
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              'text-xs font-semibold uppercase',
                              existingMatch.status === 'accepted' || existingMatch.status === 'completed'
                                ? 'text-emerald-700'
                                : 'text-slate-500'
                            )}
                          >
                            {existingMatch.status === 'completed'
                              ? 'Donation Completed'
                              : `You ${existingMatch.status}`}
                          </span>
                          {existingMatch.status === 'accepted' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                completeDonationMatch(existingMatch.id);
                                toast.success('Donation completed! 90-day recovery window started.');
                              }}
                            >
                              Mark Donated
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRespond(request.id, 'declined', distanceKm)}
                          >
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                            {copy.dashboard.declineBtn}
                          </Button>
                          <Button
                            size="sm"
                            disabled={!eligibility.eligible}
                            onClick={() => handleRespond(request.id, 'accepted', distanceKm)}
                          >
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                            {copy.dashboard.acceptBtn}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-4">
          <h2 className="font-display text-lg font-semibold text-slate-900">
            {copy.dashboard.responseHistory} ({myResponses.length})
          </h2>

          <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {myResponses.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">
                Your accepted and declined donation responses will appear here.
              </div>
            ) : (
              myResponses.map((match) => {
                const req = requests.find((r) => r.id === match.requestId);
                return (
                  <div key={match.id} className="p-4 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {req?.hospitalName || req?.patientName || 'Blood Request'}
                      </p>
                      <span
                        className={cn(
                          'text-xs font-semibold uppercase',
                          match.status === 'accepted' ? 'text-emerald-700' : 'text-slate-500'
                        )}
                      >
                        {match.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 tabular-nums">
                      {req?.bloodGroup} · {match.distanceKm} km ·{' '}
                      {match.respondedAt ? formatRelativeTime(match.respondedAt, language) : ''}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <MedicalDisclaimerBanner language={language} compact />

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
