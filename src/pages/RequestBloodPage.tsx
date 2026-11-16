import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, MailCheck, MapPin, Phone, Send, ShieldCheck, Zap } from 'lucide-react';
import { t } from '../lib/i18n';
import { BLOOD_GROUPS, getMatchReasons, matchDonorsForRequest } from '../lib/matching';
import { bloodRequestSchema, type BloodRequestFormValues } from '../lib/validations';
import { cn } from '../lib/utils';
import { useRoktodaanStore } from '../store/useRoktodaanStore';
import type { BloodRequest } from '../types/database';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { LocationCascadeSelector } from '../components/shared/LocationCascadeSelector';
import { AdBannerSlot } from '../components/shared/AdBannerSlot';
import { PhoneOtpVerifier } from '../components/shared/PhoneOtpVerifier';
import { MedicalDisclaimerBanner } from '../components/shared/MedicalDisclaimerBanner';

export const RequestBloodPage: React.FC = () => {
  const {
    language,
    donors,
    matches,
    blockedUserIds,
    currentUser,
    preselectedArea,
    createBloodRequest,
    dispatchMatchToDonor,
    autoMatchRequest,
    navigate,
  } = useRoktodaanStore();
  const copy = t(language);

  const [createdRequest, setCreatedRequest] = useState<BloodRequest | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(Boolean(currentUser?.phoneVerified && currentUser?.phone));
  const [dispatchSummary, setDispatchSummary] = useState<{
    matchedCount: number;
    notificationsSent: number;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BloodRequestFormValues>({
    resolver: zodResolver(bloodRequestSchema) as never,
    defaultValues: {
      patientName: '',
      bloodGroup: preselectedArea?.bloodGroup ?? 'A+',
      bagsNeeded: 1,
      urgency: 'urgent',
      hospitalName: '',
      contactPhone: currentUser?.phone ?? '',
      division: preselectedArea?.division || 'Dhaka',
      district: preselectedArea?.district || 'Dhaka',
      upazila: preselectedArea?.upazila || 'Savar',
      unionName: preselectedArea?.unionName || 'Ashulia',
      notes: '',
    },
  });

  const division = watch('division');
  const district = watch('district');
  const upazila = watch('upazila');
  const unionName = watch('unionName');
  const urgency = watch('urgency');

  const onSubmit = (data: BloodRequestFormValues) => {
    if (!phoneVerified) {
      toast.error(
        language === 'bn'
          ? 'রক্তের অনুরোধ পাঠানোর আগে মোবাইল নম্বর OTP দিয়ে যাচাই করুন।'
          : 'Please complete mandatory mobile number OTP verification before submitting.'
      );
      return;
    }

    const req = createBloodRequest({ ...data, phoneVerified: true });
    const { matches: dispatched, notificationsSent } = autoMatchRequest(req.id, { limit: 3 });
    setCreatedRequest(req);
    setDispatchSummary({ matchedCount: dispatched.length, notificationsSent });
    toast.success(
      language === 'bn'
        ? `রক্তের অনুরোধ জমা হয়েছে! ${dispatched.length} জন দাতাকে ম্যাচ ও ${notificationsSent}টি ইমেইল/এসএমএস অ্যালার্ট পাঠানো হয়েছে।`
        : `Blood request published! ${dispatched.length} nearby donor(s) matched and ${notificationsSent} email alert(s) + SMS gateway queue sent.`
    );
  };

  const instantMatches = createdRequest
    ? matchDonorsForRequest(
        createdRequest,
        donors.filter((d) => !blockedUserIds.includes(d.userId))
      )
    : [];
  const dispatchedForRequest = createdRequest
    ? matches.filter((m) => m.requestId === createdRequest.id)
    : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {copy.requestBlood.title}
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">{copy.requestBlood.subtitle}</p>
      </div>

      {createdRequest ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-6 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-700 mt-0.5" aria-hidden="true" />
                <div>
                  <h2 className="font-display text-lg font-semibold text-slate-900">
                    Request Active for {createdRequest.patientName} ({createdRequest.bloodGroup})
                  </h2>
                  <p className="mt-1 text-sm text-slate-700">
                    {createdRequest.bagsNeeded} bag(s) · {createdRequest.unionName},{' '}
                    {createdRequest.upazila}, {createdRequest.district} · Urgency:{' '}
                    <span className="font-semibold uppercase">{createdRequest.urgency}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCreatedRequest(null);
                    setDispatchSummary(null);
                  }}
                >
                  Create Another
                </Button>
                <Button size="sm" onClick={() => navigate('/dashboard/seeker')}>
                  Track in Seeker Dashboard
                </Button>
              </div>
            </div>

            {dispatchSummary && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 py-2.5 text-xs text-slate-700">
                <MailCheck className="h-4 w-4 text-emerald-700 shrink-0" aria-hidden="true" />
                <span>
                  {language === 'bn'
                    ? `${dispatchSummary.notificationsSent}টি ইমেইল অ্যালার্ট পাঠানো হয়েছে এবং বাংলাদেশ এসএমএস গেটওয়ে কিউ প্রস্তুত হয়েছে।`
                    : `${dispatchSummary.notificationsSent} email alert(s) dispatched + Bangladesh SMS gateway queued for ${dispatchSummary.matchedCount} top compatible donor(s).`}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-lg font-semibold text-slate-900">
                {copy.requestBlood.matchedHeader} ({instantMatches.length})
              </h3>
              {instantMatches.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const { matches: created, notificationsSent } = autoMatchRequest(
                      createdRequest.id,
                      { limit: 3 }
                    );
                    toast.success(
                      created.length > 0
                        ? `Dispatched alerts to ${created.length} additional donor(s) (${notificationsSent} email(s) + SMS queue).`
                        : 'Top nearby eligible donors have already been alerted.'
                    );
                  }}
                >
                  <Zap className="h-3.5 w-3.5 text-rose-800" aria-hidden="true" />
                  Auto-Match Next 3 Donors
                </Button>
              )}
            </div>
            {instantMatches.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
                No donors currently marked available within this group. Your request remains open for incoming donors.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {instantMatches.map((entry) => {
                  const { donor, distanceKm, matchScore } = entry;
                  const existingMatch = dispatchedForRequest.find((m) => m.donorId === donor.id);
                  const reasons = getMatchReasons(entry, language);

                  return (
                    <div
                      key={donor.id}
                      className="rounded-xl border border-slate-200 bg-white p-5 flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 font-display font-bold text-rose-900">
                          {donor.bloodGroup}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                            {donor.fullName}
                            {donor.isVerified && (
                              <ShieldCheck className="h-4 w-4 text-emerald-600" aria-label="Verified" />
                            )}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-600 flex items-center gap-1">
                            <MapPin className="h-3 w-3" aria-hidden="true" />
                            {donor.unionName}, {donor.upazila}
                          </p>
                          <p className="mt-1.5 text-xs text-slate-500 tabular-nums">
                            {reasons.join(' · ')} · {distanceKm} km · Score {matchScore}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <a
                          href={`tel:${donor.phone}`}
                          className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg bg-rose-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-900"
                        >
                          <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                          Call
                        </a>
                        {existingMatch ? (
                          <span className="text-[11px] font-semibold uppercase text-emerald-700">
                            {existingMatch.status === 'pending' ? 'Alert Sent' : existingMatch.status}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              dispatchMatchToDonor(createdRequest.id, donor, distanceKm);
                              toast.success(`Alert sent to ${donor.fullName}`);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-800 hover:underline cursor-pointer"
                          >
                            <Send className="h-3 w-3" aria-hidden="true" />
                            Dispatch Alert
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="req-patient-name">{copy.requestBlood.patientName}</Label>
              <Input
                id="req-patient-name"
                placeholder="e.g. Abdul Karim / ICU Bed 04"
                {...register('patientName')}
              />
              {errors.patientName && (
                <p className="text-xs text-red-600">{errors.patientName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="req-contact-phone">{copy.requestBlood.contactPhone}</Label>
              <Input
                id="req-contact-phone"
                placeholder="+8801712345678"
                {...register('contactPhone')}
              />
              {errors.contactPhone && (
                <p className="text-xs text-red-600">{errors.contactPhone.message}</p>
              )}
            </div>
          </div>

          <PhoneOtpVerifier
            phone={watch('contactPhone') || ''}
            language={language}
            verified={phoneVerified}
            onVerifiedChange={setPhoneVerified}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="req-blood-group">{copy.requestBlood.bloodGroup}</Label>
              <Select id="req-blood-group" {...register('bloodGroup')}>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </Select>
              {errors.bloodGroup && (
                <p className="text-xs text-red-600">{errors.bloodGroup.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="req-bags">{copy.requestBlood.bagsNeeded}</Label>
              <Input
                id="req-bags"
                type="number"
                min={1}
                max={10}
                {...register('bagsNeeded')}
              />
              {errors.bagsNeeded && (
                <p className="text-xs text-red-600">{errors.bagsNeeded.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="req-hospital">{copy.requestBlood.hospitalName}</Label>
              <Input
                id="req-hospital"
                placeholder="e.g. Dhaka Medical College"
                {...register('hospitalName')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-sm font-medium text-slate-800">
              {copy.requestBlood.urgency}
            </span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(
                [
                  { value: 'normal', label: copy.requestBlood.urgencyNormal },
                  { value: 'urgent', label: copy.requestBlood.urgencyUrgent },
                  { value: 'critical', label: copy.requestBlood.urgencyCritical },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue('urgency', opt.value, { shouldValidate: true })}
                  className={cn(
                    'flex min-h-[44px] items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors cursor-pointer',
                    urgency === opt.value
                      ? opt.value === 'critical'
                        ? 'border-red-600 bg-red-600 text-white'
                        : 'border-rose-800 bg-rose-800 text-white'
                      : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                  )}
                >
                  {opt.value === 'critical' && (
                    <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Patient Location (Bangladesh Administrative Hierarchy)
            </h2>
            <LocationCascadeSelector
              language={language}
              division={division}
              district={district}
              upazila={upazila}
              unionName={unionName}
              onChange={(next) => {
                setValue('division', next.division, { shouldValidate: true });
                setValue('district', next.district, { shouldValidate: true });
                setValue('upazila', next.upazila, { shouldValidate: true });
                setValue('unionName', next.unionName, { shouldValidate: true });
              }}
              errors={{
                division: errors.division?.message,
                district: errors.district?.message,
                upazila: errors.upazila?.message,
                unionName: errors.unionName?.message,
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="req-notes">{copy.requestBlood.notes}</Label>
            <Textarea
              id="req-notes"
              placeholder="Ward number, surgery timing, cross-match availability..."
              {...register('notes')}
            />
          </div>

          <MedicalDisclaimerBanner language={language} compact />

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Compatible donors in the patient’s Union and surrounding Upazilas receive automatic email & SMS alerts.
            </p>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {copy.requestBlood.submitBtn}
            </Button>
          </div>
        </form>
      )}

      <AdBannerSlot placement="request_blood" />
    </div>
  );
};
