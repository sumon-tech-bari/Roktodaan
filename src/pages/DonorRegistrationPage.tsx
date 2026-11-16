import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  Droplets,
  MapPin,
  ShieldCheck,
  Upload,
  UserPlus,
  X,
} from 'lucide-react';
import { t } from '../lib/i18n';
import { findUnionCoordinates } from '../lib/bangladesh-locations';
import { BLOOD_GROUPS, checkDonationEligibility } from '../lib/matching';
import { donorRegistrationSchema, type DonorRegistrationFormValues } from '../lib/validations';
import { cn } from '../lib/utils';
import { useRoktodaanStore } from '../store/useRoktodaanStore';
import type { BloodGroup, DonorProfile } from '../types/database';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { LocationCascadeSelector } from '../components/shared/LocationCascadeSelector';
import { PhoneOtpVerifier } from '../components/shared/PhoneOtpVerifier';
import { MedicalDisclaimerBanner } from '../components/shared/MedicalDisclaimerBanner';

export const DonorRegistrationPage: React.FC = () => {
  const {
    language,
    setLanguage,
    preselectedArea,
    registerDonor,
    setPreselectedArea,
    navigate,
  } = useRoktodaanStore();
  const copy = t(language);
  const dr = copy.donorRegistration;

  const [registeredDonor, setRegisteredDonor] = useState<DonorProfile | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DonorRegistrationFormValues>({
    resolver: zodResolver(donorRegistrationSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      bloodGroup: preselectedArea?.bloodGroup ?? 'O+',
      division: preselectedArea?.division || 'Dhaka',
      district: preselectedArea?.district || 'Dhaka',
      upazila: preselectedArea?.upazila || 'Savar',
      unionName: preselectedArea?.unionName || 'Ashulia',
      isAvailable: true,
      lastDonationDate: '',
      contactPreference: 'phone',
      avatarUrl: '',
      medicalConsent: false,
    },
  });

  const selectedBloodGroup = watch('bloodGroup');
  const division = watch('division');
  const district = watch('district');
  const upazila = watch('upazila');
  const unionName = watch('unionName');
  const isAvailable = watch('isAvailable');
  const lastDonationDate = watch('lastDonationDate');
  const avatarUrl = watch('avatarUrl');
  const medicalConsent = watch('medicalConsent');

  const eligibility = checkDonationEligibility(lastDonationDate || null);
  const coords =
    division && district && upazila && unionName
      ? findUnionCoordinates(division, district, upazila, unionName)
      : null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error(
        language === 'bn'
          ? 'অনুগ্রহ করে JPG বা PNG ছবি আপলোড করুন'
          : 'Please upload a JPG or PNG image file'
      );
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error(
        language === 'bn'
          ? 'ছবির আকার অবশ্যই ২ মেগাবাইটের নিচে হতে হবে'
          : 'Profile photo must be smaller than 2 MB'
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setValue('avatarUrl', reader.result, { shouldDirty: true });
      }
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (data: DonorRegistrationFormValues) => {
    if (!phoneVerified) {
      toast.error(
        language === 'bn'
          ? 'নিবন্ধন সম্পন্ন করতে প্রথমে মোবাইল নম্বরের OTP যাচাই করুন।'
          : 'Please complete mandatory mobile phone OTP verification before submitting.'
      );
      return;
    }

    const { donor } = registerDonor({
      fullName: data.fullName,
      phone: data.phone,
      phoneVerified: true,
      email: data.email || undefined,
      bloodGroup: data.bloodGroup,
      division: data.division,
      district: data.district,
      upazila: data.upazila,
      unionName: data.unionName,
      isAvailable: eligibility.eligible ? data.isAvailable : false,
      lastDonationDate: data.lastDonationDate || null,
      contactPreference: data.contactPreference,
      avatarUrl: data.avatarUrl || undefined,
    });

    setRegisteredDonor(donor);
    toast.success(
      language === 'bn'
        ? 'রক্তদাতা নিবন্ধন সফলভাবে সম্পন্ন হয়েছে।'
        : 'Donor registration completed and added to the live directory.'
    );
  };

  const handleViewInDirectory = () => {
    if (registeredDonor) {
      setPreselectedArea({
        division: registeredDonor.division,
        district: registeredDonor.district,
        upazila: registeredDonor.upazila,
        unionName: registeredDonor.unionName,
        bloodGroup: registeredDonor.bloodGroup,
      });
    }
    navigate('/find-donors');
  };

  const handleRegisterAnother = () => {
    setRegisteredDonor(null);
    setPhoneVerified(false);
    reset({
      fullName: '',
      phone: '',
      email: '',
      bloodGroup: 'O+',
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Savar',
      unionName: 'Ashulia',
      isAvailable: true,
      lastDonationDate: '',
      contactPreference: 'phone',
      avatarUrl: '',
      medicalConsent: false,
    });
  };

  return (
    <div className="bg-slate-50 pb-20 md:pb-12">
      {/* Page header & bilingual utility bar */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-800">
              {language === 'bn'
                ? 'জাতীয় স্বেচ্ছাসেবী রক্তদাতা নিবন্ধন'
                : 'National Voluntary Donor Onboarding'}
            </p>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {dr.title}
            </h1>
            <p className="max-w-2xl text-sm text-slate-600">{dr.subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            <div
              role="group"
              aria-label="Registration language"
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
            <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
              {copy.nav.signIn}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {registeredDonor ? (
          <section
            aria-label="Donor registration confirmation"
            className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
                    {dr.successTitle}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">{dr.successSubtitle}</p>
                </div>
              </div>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 font-display text-xl font-bold text-rose-900">
                {registeredDonor.bloodGroup}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  {language === 'bn' ? 'দাতা আইডি' : 'Donor ID'}
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-slate-900 tabular-nums">
                  {registeredDonor.id}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  {language === 'bn' ? 'নিবন্ধিত নাম' : 'Registered Donor'}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {registeredDonor.fullName}
                </p>
                <p className="font-mono text-xs text-slate-600">{registeredDonor.phone}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  {language === 'bn' ? 'ইউনিয়ন ঠিকানা' : 'Union Coverage'}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {registeredDonor.unionName}, {registeredDonor.upazila}
                </p>
                <p className="text-xs text-slate-600">
                  {registeredDonor.district}, {registeredDonor.division}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  {language === 'bn' ? 'চিকিৎসা যোগ্যতা' : 'Clinical Eligibility'}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {checkDonationEligibility(registeredDonor.lastDonationDate).eligible
                    ? language === 'bn'
                      ? 'দান করতে সম্পূর্ণ যোগ্য'
                      : 'Eligible to donate now'
                    : language === 'bn'
                    ? `${checkDonationEligibility(registeredDonor.lastDonationDate).daysRemaining} দিন বিরতি বাকি`
                    : `${checkDonationEligibility(registeredDonor.lastDonationDate).daysRemaining} days recovery left`}
                </p>
                <p className="text-xs text-slate-600">
                  {registeredDonor.isAvailable
                    ? copy.findDonors.availableLabel
                    : copy.findDonors.unavailableLabel}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={() => navigate('/dashboard/donor')}>
                  {dr.goToDashboard}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button variant="outline" onClick={handleViewInDirectory}>
                  {dr.viewInDirectory}
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={handleRegisterAnother}>
                {language === 'bn' ? 'আরেকজন দাতা নিবন্ধন করুন' : 'Register Another Donor'}
              </Button>
            </div>
          </section>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Main form column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Section 01: Identity & Contact */}
              <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
                <h2 className="font-display text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
                  {dr.personalSection}
                </h2>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="donor-full-name">{dr.fullName}</Label>
                    <Input
                      id="donor-full-name"
                      placeholder={language === 'bn' ? 'যেমন: নাফিসা তাবাসসুম' : 'e.g. Nafisa Tabassum'}
                      {...register('fullName')}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-600">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="donor-phone">{dr.phone}</Label>
                    <Input
                      id="donor-phone"
                      inputMode="tel"
                      placeholder="+8801711889900"
                      {...register('phone')}
                    />
                    {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
                  </div>
                </div>

                <PhoneOtpVerifier
                  phone={watch('phone') || ''}
                  language={language}
                  verified={phoneVerified}
                  onVerifiedChange={setPhoneVerified}
                />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:items-start">
                  <div className="space-y-1.5">
                    <Label htmlFor="donor-email">{dr.email}</Label>
                    <Input
                      id="donor-email"
                      type="email"
                      placeholder="name@example.com"
                      {...register('email')}
                    />
                    {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="donor-photo">{dr.photoLabel}</Label>
                    <div className="flex items-center gap-3">
                      {avatarUrl ? (
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-200">
                          <img
                            src={avatarUrl}
                            alt="Donor avatar preview"
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            aria-label="Remove profile photo"
                            onClick={() => setValue('avatarUrl', '')}
                            className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900/80 text-white cursor-pointer"
                          >
                            <X className="h-3 w-3" aria-hidden="true" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                          <Upload className="h-4 w-4" aria-hidden="true" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <input
                          id="donor-photo"
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handlePhotoUpload}
                          className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-50 cursor-pointer"
                        />
                        <p className="mt-1 text-[11px] text-slate-500">{dr.photoHint}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 02: Blood Group & Clinical Readiness */}
              <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
                <h2 className="font-display text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
                  {dr.bloodSection}
                </h2>

                <div className="space-y-2">
                  <span className="block text-sm font-medium text-slate-800">{dr.bloodGroup}</span>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-8" role="group" aria-label={dr.bloodGroup}>
                    {BLOOD_GROUPS.map((group: BloodGroup) => {
                      const active = selectedBloodGroup === group;
                      return (
                        <button
                          key={group}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setValue('bloodGroup', group, { shouldValidate: true })}
                          className={cn(
                            'min-h-[44px] rounded-lg border text-sm font-bold transition-colors cursor-pointer whitespace-nowrap',
                            active
                              ? 'border-rose-800 bg-rose-800 text-white'
                              : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                          )}
                        >
                          {group}
                        </button>
                      );
                    })}
                  </div>
                  {errors.bloodGroup && (
                    <p className="text-xs text-red-600">{errors.bloodGroup.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="donor-last-donation">{dr.lastDonation}</Label>
                    <Input
                      id="donor-last-donation"
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      {...register('lastDonationDate')}
                    />
                    <p
                      className={cn(
                        'flex items-center gap-1.5 text-xs',
                        eligibility.eligible ? 'text-emerald-700' : 'text-amber-700'
                      )}
                    >
                      <CalendarCheck2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {eligibility.eligible
                        ? language === 'bn'
                          ? 'যোগ্য: ৯০ দিনের বিরতি শর্ত পূর্ণ হয়েছে'
                          : 'Eligible: 90-day WHO interval cleared'
                        : language === 'bn'
                        ? `বিরতি কাল: আর ${eligibility.daysRemaining} দিন বাকি (${eligibility.nextEligibleDate})`
                        : `Recovery window: ${eligibility.daysRemaining} days left (next: ${eligibility.nextEligibleDate})`}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="donor-contact-pref">{dr.contactPreference}</Label>
                    <Select id="donor-contact-pref" {...register('contactPreference')}>
                      <option value="phone">
                        {language === 'bn' ? 'সরাসরি ফোন কল' : 'Direct Phone Call'}
                      </option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="sms">
                        {language === 'bn' ? 'এসএমএস বার্তা' : 'SMS Text'}
                      </option>
                      <option value="in_app">
                        {language === 'bn' ? 'ইন-অ্যাপ ড্যাশবোর্ড' : 'In-App Dashboard Alert'}
                      </option>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{dr.availableNow}</p>
                    <p className="text-xs text-slate-600">{dr.availableHint}</p>
                  </div>
                  <Switch
                    ariaLabel={dr.availableNow}
                    checked={isAvailable}
                    onCheckedChange={(val) => setValue('isAvailable', val)}
                  />
                </div>
              </section>

              {/* Section 03: Union-Level Bangladesh Location */}
              <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <h2 className="font-display text-base font-semibold text-slate-900">
                    {dr.locationSection}
                  </h2>
                  {coords && (
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-600 tabular-nums">
                      <MapPin className="h-3.5 w-3.5 text-rose-800" aria-hidden="true" />
                      {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                    </span>
                  )}
                </div>

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
              </section>

              {/* Consent & Submit */}
              <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="donor-medical-consent"
                    className="flex items-start gap-3 cursor-pointer"
                  >
                    <input
                      id="donor-medical-consent"
                      type="checkbox"
                      checked={medicalConsent}
                      onChange={(e) =>
                        setValue('medicalConsent', e.target.checked, { shouldValidate: true })
                      }
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-800 focus:ring-rose-700 cursor-pointer"
                    />
                    <span className="text-sm leading-relaxed text-slate-700">{dr.consentLabel}</span>
                  </label>
                  {errors.medicalConsent && (
                    <p className="text-xs text-red-600">{errors.medicalConsent.message}</p>
                  )}
                </div>

                <MedicalDisclaimerBanner language={language} compact />

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    {language === 'bn'
                      ? 'আপনার মোবাইল নম্বর সক্রিয় অনুরোধ না হওয়া পর্যন্ত গোপন থাকবে।'
                      : 'Your phone number stays masked until you accept a request.'}
                  </p>
                  <Button type="submit" size="lg" disabled={isSubmitting}>
                    <UserPlus className="h-4 w-4" aria-hidden="true" />
                    {dr.submitBtn}
                  </Button>
                </div>
              </section>
            </div>

            {/* Right column: Live Readiness Preview & Standards */}
            <aside className="lg:col-span-4 space-y-5">
              <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {language === 'bn' ? 'প্রোফাইল প্রিভিউ' : 'Live Donor Card Preview'}
                  </span>
                  <Droplets className="h-4 w-4 text-rose-800" aria-hidden="true" />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 font-display text-xl font-bold text-rose-900">
                    {selectedBloodGroup}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-semibold text-slate-900">
                      {watch('fullName')?.trim() ||
                        (language === 'bn' ? 'আপনার নাম' : 'Your Full Name')}
                    </p>
                    <p className="truncate text-xs text-slate-600">
                      {unionName || 'Union'}, {upazila || 'Upazila'}, {district || 'District'}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2 text-xs">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-500">
                      {language === 'bn' ? 'অবস্থা' : 'Availability'}
                    </span>
                    <span
                      className={cn(
                        'font-semibold',
                        isAvailable ? 'text-emerald-700' : 'text-slate-600'
                      )}
                    >
                      {isAvailable
                        ? copy.findDonors.availableLabel
                        : copy.findDonors.unavailableLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-500">
                      {language === 'bn' ? 'যোগ্যতা' : '90-Day Interval'}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {eligibility.eligible
                        ? copy.findDonors.eligibleNow
                        : `${eligibility.daysRemaining}d`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-500">
                      {language === 'bn' ? 'জিপিএস অবস্থান' : 'Union Coordinates'}
                    </span>
                    <span className="font-mono text-slate-700 tabular-nums">
                      {coords ? `${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}` : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
                <h3 className="font-display text-sm font-semibold text-slate-900">
                  {language === 'bn'
                    ? 'ডব্লিউএইচও রক্তদান নিরাপত্তা মানদণ্ড'
                    : 'Clinical Safety Standards'}
                </h3>
                <ul className="space-y-2 text-xs leading-relaxed text-slate-600">
                  <li>
                    {language === 'bn'
                      ? '• পূর্ণ রক্তদানের মধ্যে কমপক্ষে ৯০ দিনের (৩ মাস) বিরতি।'
                      : '• Minimum 90-day interval enforced automatically between donations.'}
                  </li>
                  <li>
                    {language === 'bn'
                      ? '• বয়স ১৮ থেকে ৬৫ বছর এবং ন্যূনতম ওজন ৫০ কেজি।'
                      : '• Donors must be aged 18–65 and weigh at least 50 kg.'}
                  </li>
                  <li>
                    {language === 'bn'
                      ? '• সম্পূর্ণ বিনা পারিশ্রমিকে স্বেচ্ছাসেবী রক্তদান নেটওয়ার্ক।'
                      : '• 100% voluntary, non-remunerated humanitarian coordination.'}
                  </li>
                </ul>
              </div>
            </aside>
          </form>
        )}
      </div>
    </div>
  );
};
