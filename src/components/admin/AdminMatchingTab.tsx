import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, Mail, MapPin, MessageSquare, Send, ShieldCheck, Zap } from 'lucide-react';
import { getMatchReasons, matchDonorsForRequest } from '../../lib/matching';
import { cn, formatRelativeTime } from '../../lib/utils';
import { useRoktodaanStore } from '../../store/useRoktodaanStore';
import { Button } from '../ui/button';
import { Select } from '../ui/select';

export const AdminMatchingTab: React.FC = () => {
  const {
    language,
    requests,
    donors,
    matches,
    notificationLogs,
    dispatchMatchToDonor,
    autoMatchRequest,
    completeDonationMatch,
  } = useRoktodaanStore();

  const activeRequests = useMemo(
    () => requests.filter((r) => r.status === 'open' || r.status === 'matched'),
    [requests]
  );

  const [selectedReqId, setSelectedReqId] = useState<string>(
    activeRequests[0]?.id ?? requests[0]?.id ?? ''
  );
  const [maxDistanceKm, setMaxDistanceKm] = useState<string>('all');
  const [exactOnly, setExactOnly] = useState(false);
  const [includeCooldown, setIncludeCooldown] = useState(false);

  const selectedRequest =
    requests.find((r) => r.id === selectedReqId) ?? activeRequests[0] ?? requests[0];

  const rankedMatches = useMemo(() => {
    if (!selectedRequest) return [];
    const maxKm = maxDistanceKm === 'all' ? undefined : Number(maxDistanceKm);
    return matchDonorsForRequest(selectedRequest, donors, {
      includeCooldown,
    }).filter((entry) => {
      if (exactOnly && !entry.exactBloodMatch) return false;
      if (typeof maxKm === 'number' && entry.distanceKm > maxKm) return false;
      return true;
    });
  }, [selectedRequest, donors, includeCooldown, exactOnly, maxDistanceKm]);

  const requestMatches = useMemo(
    () => (selectedRequest ? matches.filter((m) => m.requestId === selectedRequest.id) : []),
    [matches, selectedRequest]
  );

  const handleAutoMatch = () => {
    if (!selectedRequest) return;
    const maxKm = maxDistanceKm === 'all' ? undefined : Number(maxDistanceKm);
    const { matches: created, notificationsSent } = autoMatchRequest(selectedRequest.id, {
      limit: 3,
      maxDistanceKm: maxKm,
    });
    if (created.length === 0) {
      toast.info('All eligible nearby donors within this filter have already been alerted.');
    } else {
      toast.success(
        `Dispatched smart match alerts to ${created.length} top eligible donor(s) (${notificationsSent} email(s) + SMS queue).`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1.5 flex-1 max-w-xl">
            <label
              htmlFor="admin-match-request"
              className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              {language === 'bn' ? 'সক্রিয় রক্তের অনুরোধ নির্বাচন করুন' : 'Select Blood Request to Match'}
            </label>
            <Select
              id="admin-match-request"
              value={selectedRequest?.id ?? ''}
              onChange={(e) => setSelectedReqId(e.target.value)}
            >
              {requests.map((req) => (
                <option key={req.id} value={req.id}>
                  [{req.bloodGroup}] {req.patientName} — {req.unionName}, {req.district} ({req.urgency.toUpperCase()} · {req.status})
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label htmlFor="admin-match-radius" className="sr-only">
                Max radius
              </label>
              <Select
                id="admin-match-radius"
                value={maxDistanceKm}
                onChange={(e) => setMaxDistanceKm(e.target.value)}
              >
                <option value="all">Any distance (Nationwide)</option>
                <option value="10">Within 10 km</option>
                <option value="25">Within 25 km</option>
                <option value="50">Within 50 km</option>
              </Select>
            </div>

            <Button
              onClick={handleAutoMatch}
              disabled={!selectedRequest || selectedRequest.status === 'fulfilled' || selectedRequest.status === 'cancelled'}
            >
              <Zap className="h-4 w-4" aria-hidden="true" />
              {language === 'bn' ? 'শীর্ষ ৩ দাতাকে অটো-ম্যাচ করুন' : 'Auto-Match Top 3 Donors'}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 border-t border-slate-100 pt-4 text-xs text-slate-700">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={exactOnly}
              onChange={(e) => setExactOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-rose-800"
            />
            Exact blood group only
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeCooldown}
              onChange={(e) => setIncludeCooldown(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-rose-800"
            />
            Include donors in 90-day recovery window
          </label>
          {selectedRequest && (
            <span className="ml-auto font-mono text-slate-500 tabular-nums">
              {rankedMatches.length} ranked candidate(s) · {requestMatches.length} dispatched
            </span>
          )}
        </div>
      </div>

      {/* Ranked Candidates + Live Dispatches */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-3">
          <h2 className="font-display text-base font-semibold text-slate-900">
            Ranked Compatible Donors ({rankedMatches.length})
          </h2>

          {rankedMatches.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
              No donors matched this radius and eligibility criteria. Expand the distance filter to search nearby districts.
            </div>
          ) : (
            rankedMatches.map((entry) => {
              const existing = requestMatches.find((m) => m.donorId === entry.donor.id);
              const reasons = getMatchReasons(entry, language);

              return (
                <div
                  key={entry.donor.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 font-display text-base font-bold text-rose-900">
                      {entry.donor.bloodGroup}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">{entry.donor.fullName}</p>
                        {entry.donor.isVerified && (
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-label="Verified" />
                        )}
                        <span className="font-mono text-xs font-semibold text-rose-800 tabular-nums">
                          Score {entry.matchScore}
                        </span>
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-600">
                        <MapPin className="h-3 w-3 text-slate-400" aria-hidden="true" />
                        {entry.donor.unionName}, {entry.donor.upazila}, {entry.donor.district}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 tabular-nums">
                        {reasons.join(' · ')} · {entry.distanceKm} km away ·{' '}
                        {entry.eligibility.eligible
                          ? 'Eligible now'
                          : `${entry.eligibility.daysRemaining}d cooldown`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {existing ? (
                      <>
                        <span
                          className={cn(
                            'text-xs font-semibold uppercase',
                            existing.status === 'completed' || existing.status === 'accepted'
                              ? 'text-emerald-700'
                              : existing.status === 'declined'
                              ? 'text-slate-400'
                              : 'text-amber-700'
                          )}
                        >
                          {existing.status}
                        </span>
                        {existing.status !== 'completed' && existing.status !== 'declined' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              completeDonationMatch(existing.id);
                              toast.success('Donation recorded, 90-day cooldown started, and impact updated.');
                            }}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                            Complete
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!entry.eligibility.eligible || !selectedRequest}
                        onClick={() => {
                          if (!selectedRequest) return;
                          dispatchMatchToDonor(
                            selectedRequest.id,
                            entry.donor,
                            entry.distanceKm,
                            `Matched (${entry.exactBloodMatch ? 'Exact' : 'Compatible'} · ${entry.distanceKm} km)`
                          );
                          toast.success(`Match alert dispatched to ${entry.donor.fullName}`);
                        }}
                      >
                        <Send className="h-3.5 w-3.5" aria-hidden="true" />
                        Dispatch Alert
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Live Match Coordination Log */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="font-display text-base font-semibold text-slate-900">
            Active Match Coordination ({matches.length})
          </h2>

          <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {matches.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">
                No match alerts dispatched yet. Use Auto-Match or Dispatch Alert to coordinate donors.
              </div>
            ) : (
              matches.map((m) => {
                const req = requests.find((r) => r.id === m.requestId);
                return (
                  <div key={m.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {m.donorName} ({m.donorBloodGroup})
                      </p>
                      <span
                        className={cn(
                          'text-xs font-semibold uppercase',
                          m.status === 'completed' || m.status === 'accepted'
                            ? 'text-emerald-700'
                            : m.status === 'pending'
                            ? 'text-amber-700'
                            : 'text-slate-500'
                        )}
                      >
                        {m.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      For: <strong>{req?.patientName ?? m.requestId}</strong> ({req?.bloodGroup}) ·{' '}
                      <span className="font-mono tabular-nums">{m.distanceKm} km</span>
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{formatRelativeTime(m.createdAt, language)}</span>
                      {(m.status === 'pending' || m.status === 'accepted') && (
                        <button
                          type="button"
                          onClick={() => {
                            completeDonationMatch(m.id);
                            toast.success('Donation marked completed');
                          }}
                          className="font-semibold text-rose-800 hover:underline cursor-pointer"
                        >
                          Mark Donated
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <h2 className="font-display text-base font-semibold text-slate-900 pt-3">
            Email & Bangladesh SMS Queue ({notificationLogs.length})
          </h2>
          <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white max-h-[340px] overflow-y-auto">
            {notificationLogs.length === 0 ? (
              <div className="p-5 text-xs text-slate-500">
                Email and Bangladesh SMS alerts generated during blood requests or auto-matching appear here.
              </div>
            ) : (
              notificationLogs.slice(0, 20).map((log) => (
                <div key={log.id} className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                      {log.channel === 'email' ? (
                        <Mail className="h-3.5 w-3.5 text-rose-800" aria-hidden="true" />
                      ) : (
                        <MessageSquare className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
                      )}
                      {log.donorName} ({log.channel.toUpperCase()})
                    </span>
                    <span
                      className={cn(
                        'font-mono text-[11px] font-semibold uppercase',
                        log.status === 'sent' ? 'text-emerald-700' : 'text-amber-700'
                      )}
                    >
                      {log.status === 'sent' ? 'Email Sent' : 'SMS Queued'}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-slate-500">
                    {log.channel === 'email' ? log.recipientEmail : log.recipientPhone}
                  </p>
                  <p className="text-xs text-slate-700 line-clamp-2">{log.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
