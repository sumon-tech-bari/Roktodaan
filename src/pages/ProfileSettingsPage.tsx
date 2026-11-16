import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { LogOut, Save, ShieldCheck } from 'lucide-react';
import { BLOOD_GROUPS, checkDonationEligibility } from '../lib/matching';
import { donorProfileSchema, type DonorProfileFormValues } from '../lib/validations';
import { useRoktodaanStore } from '../store/useRoktodaanStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { LocationCascadeSelector } from '../components/shared/LocationCascadeSelector';

export const ProfileSettingsPage: React.FC = () => {
  const {
    language,
    currentUser,
    donors,
    upsertDonorProfile,
    signOut,
    navigate,
  } = useRoktodaanStore();

  const existingProfile = currentUser
    ? donors.find((d) => d.userId === currentUser.id)
    : undefined;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DonorProfileFormValues>({
    resolver: zodResolver(donorProfileSchema),
    defaultValues: {
      fullName: existingProfile?.fullName ?? currentUser?.fullName ?? '',
      phone: existingProfile?.phone ?? currentUser?.phone ?? '',
      bloodGroup: existingProfile?.bloodGroup ?? 'O+',
      division: existingProfile?.division ?? 'Dhaka',
      district: existingProfile?.district ?? 'Dhaka',
      upazila: existingProfile?.upazila ?? 'Savar',
      unionName: existingProfile?.unionName ?? 'Ashulia',
      isAvailable: existingProfile?.isAvailable ?? true,
      lastDonationDate: existingProfile?.lastDonationDate ?? '',
      contactPreference: existingProfile?.contactPreference ?? 'phone',
    },
  });

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-slate-900">Sign in required</h1>
        <p className="text-sm text-slate-600">
          Please sign in with email or phone OTP to configure your donor profile and Union location.
        </p>
        <Button onClick={() => navigate('/auth')}>Go to Sign In</Button>
      </div>
    );
  }

  const division = watch('division');
  const district = watch('district');
  const upazila = watch('upazila');
  const unionName = watch('unionName');
  const isAvailable = watch('isAvailable');
  const lastDonationDate = watch('lastDonationDate');

  const eligibility = checkDonationEligibility(lastDonationDate || null);

  const onSubmit = (data: DonorProfileFormValues) => {
    upsertDonorProfile(currentUser.id, {
      ...data,
      lastDonationDate: data.lastDonationDate || null,
    });
    toast.success('Profile and Bangladesh Union location saved.');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Profile & Donor Settings
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Account role: <strong className="uppercase text-slate-900">{currentUser.role}</strong> ·{' '}
            {currentUser.email}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
            Switch Account / Role
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign Out
          </Button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="prof-name">Full Name</Label>
            <Input id="prof-name" {...register('fullName')} />
            {errors.fullName && (
              <p className="text-xs text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prof-phone">Mobile Number (Bangladesh)</Label>
            <Input id="prof-phone" {...register('phone')} />
            {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="prof-blood-group">Blood Group</Label>
            <Select id="prof-blood-group" {...register('bloodGroup')}>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prof-last-donation">Last Donation Date</Label>
            <Input id="prof-last-donation" type="date" {...register('lastDonationDate')} />
            <p className="text-xs text-slate-500">
              {eligibility.eligible
                ? 'Eligible now (90-day interval cleared)'
                : `In recovery window (${eligibility.daysRemaining} days left)`}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prof-contact-pref">Contact Preference</Label>
            <Select id="prof-contact-pref" {...register('contactPreference')}>
              <option value="phone">Direct Phone Call</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS Text</option>
              <option value="in_app">In-App Dashboard</option>
            </Select>
          </div>
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Union-Level Location (Bangladesh)
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

        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Available for Emergency Blood Requests
            </p>
            <p className="text-xs text-slate-600">
              Turn off if traveling or temporarily unable to donate.
            </p>
          </div>
          <Switch
            ariaLabel="Available for donation"
            checked={isAvailable}
            onCheckedChange={(val) => setValue('isAvailable', val)}
          />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            {existingProfile?.isVerified
              ? 'Verified donor record'
              : 'Verification badge is reviewed by partner hospitals/admins'}
          </span>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4" aria-hidden="true" />
            Save Profile Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
