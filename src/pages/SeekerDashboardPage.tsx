import React from 'react';
import { toast } from 'sonner';
import { CheckCircle2, MapPin, Phone, PlusCircle, Send, Zap } from 'lucide-react';
import { t } from '../lib/i18n';
import { matchDonorsForRequest } from '../lib/matching';
import { cn, formatRelativeTime } from '../lib/utils';
import { useRoktodaanStore } from '../store/useRoktodaanStore';
import { Button } from '../components/ui/button';

export const SeekerDashboardPage: React.FC = () => {
  const {
    language,
    currentUser,
    requests,
    donors,
    matches,
    blockedUserIds,
    updateRequestStatus,
    autoMatchRequest,
    dispatchMatchToDonor,
    completeDonationMatch,
    navigate,
  } = useRoktodaanStore();
  const copy = t(language);

  const visibleRequests = currentUser
    ? requests.filter((r) => r.seekerId === currentUser.id || currentUser.role === 'admin')
    : requests.slice(0, 3);

  const displayRequests = visibleRequests.length > 0 ? visibleRequests : requests;

  const handleStatusChange = (requestId: string, status: 'fulfilled' | 'cancelled') => {
    updateRequestStatus(requestId, status);
    toast.success(
      status === 'fulfilled'
        ? 'Request marked as fulfilled. Impact metrics updated.'
        : 'Blood request cancelled.'
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {copy.dashboard.seekerTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Track live blood requests, donor confirmations, and compatible nearby volunteers.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/donor')}>
            Donor View
          </Button>
          <Button size="sm" onClick={() => navigate('/request-blood')}>
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            {copy.nav.requestBlood}
          </Button>
        </div>
      </div>

      {displayRequests.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-4">
          <p className="font-display text-lg font-semibold text-slate-900">
            No active blood requests yet
          </p>
          <p className="text-sm text-slate-600">
            Create an emergency blood request to match compatible donors in your Union.
          </p>
          <Button onClick={() => navigate('/request-blood')}>Create Blood Request</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {displayRequests.map((req) => {
            const unblockedDonors = donors.filter((d) => !blockedUserIds.includes(d.userId));
            const topMatches = matchDonorsForRequest(req, unblockedDonors).slice(0, 4);
            const requestMatches = matches.filter((m) => m.requestId === req.id);
            const acceptedResponses = requestMatches.filter(
              (m) => m.status === 'accepted' || m.status === 'completed'
            );
            const pendingCount = requestMatches.filter((m) => m.status === 'pending').length;

            return (
              <div
                key={req.id}
                className="rounded-xl border border-slate-200 bg-white p-6 space-y-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 font-display text-lg font-bold text-rose-900">
                      {req.bloodGroup}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="font-display text-lg font-semibold text-slate-900">
                          {req.patientName}
                        </h2>
                        <span
                          className={cn(
                            'text-xs font-semibold uppercase',
                            req.status === 'fulfilled'
                              ? 'text-emerald-700'
                              : req.status === 'matched'
                              ? 'text-rose-800'
                              : req.status === 'cancelled'
                              ? 'text-slate-400'
                              : 'text-amber-700'
                          )}
                        >
                          {req.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                        {req.hospitalName ? `${req.hospitalName} · ` : ''}
                        {req.unionName}, {req.upazila}, {req.district}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 tabular-nums">
                        {req.bagsNeeded} bags · Urgency: {req.urgency} · {pendingCount} pending alert(s) ·{' '}
                        {formatRelativeTime(req.createdAt, language)}
                      </p>
                    </div>
                  </div>

                  {(req.status === 'open' || req.status === 'matched') && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const { matches: created } = autoMatchRequest(req.id, { limit: 3 });
                          toast.success(
                            created.length > 0
                              ? `Dispatched smart match alerts & emails to ${created.length} donor(s).`
                              : 'All top eligible nearby donors are already alerted.'
                          );
                        }}
                      >
                        <Zap className="h-3.5 w-3.5 text-rose-800" aria-hidden="true" />
                        Auto-Match Top 3
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(req.id, 'cancelled')}
                      >
                        {copy.dashboard.cancelRequest}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(req.id, 'fulfilled')}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        {copy.dashboard.markFulfilled}
                      </Button>
                    </div>
                  )}
                </div>

                {acceptedResponses.length > 0 && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                      Confirmed & Completed Donors ({acceptedResponses.length})
                    </p>
                    <div className="divide-y divide-emerald-200/70">
                      {acceptedResponses.map((m) => (
                        <div
                          key={m.id}
                          className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm"
                        >
                          <div>
                            <strong className="text-slate-900">{m.donorName}</strong> ({m.donorBloodGroup}) ·{' '}
                            <span className="text-slate-600">{m.donorLocationLabel}</span>
                            {m.donorNote && (
                              <p className="text-xs text-slate-600 mt-0.5">{m.donorNote}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <a
                              href={`tel:${m.donorPhone}`}
                              className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-rose-800 hover:underline"
                            >
                              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                              {m.donorPhone}
                            </a>
                            {m.status === 'accepted' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  completeDonationMatch(m.id);
                                  toast.success('Donation verified! 90-day cooldown updated.');
                                }}
                              >
                                Mark Donated
                              </Button>
                            ) : (
                              <span className="text-xs font-semibold uppercase text-emerald-800">
                                Completed
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Top Compatible Nearby Donors ({topMatches.length})
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {topMatches.map(({ donor, distanceKm }) => {
                      const matchRecord = requestMatches.find((m) => m.donorId === donor.id);
                      return (
                        <div
                          key={donor.id}
                          className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 flex flex-col justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-slate-900">
                                {donor.fullName}
                              </span>
                              <span className="font-display text-sm font-bold text-rose-800">
                                {donor.bloodGroup}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-600">
                              {donor.unionName}, {donor.upazila}
                            </p>
                          </div>
                          <div className="flex items-center justify-between border-t border-slate-200/80 pt-2 text-xs">
                            <span className="font-mono tabular-nums text-slate-500">
                              {distanceKm} km
                            </span>
                            {matchRecord ? (
                              <span className="font-semibold uppercase text-emerald-700">
                                {matchRecord.status === 'pending' ? 'Alert Sent' : matchRecord.status}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  dispatchMatchToDonor(req.id, donor, distanceKm);
                                  toast.success(`Dispatched alert to ${donor.fullName}`);
                                }}
                                className="inline-flex items-center gap-1 font-semibold text-rose-800 hover:underline cursor-pointer"
                              >
                                <Send className="h-3 w-3" aria-hidden="true" />
                                Alert
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
