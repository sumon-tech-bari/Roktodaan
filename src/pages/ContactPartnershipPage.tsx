import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Building2, CheckCircle2, Globe2, Mail, Phone, Send } from 'lucide-react';
import { partnershipInquirySchema, type PartnershipInquiryFormValues } from '../lib/validations';
import { useRoktodaanStore } from '../store/useRoktodaanStore';
import type { PartnershipInquiry } from '../types/database';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { MedicalDisclaimerBanner } from '../components/shared/MedicalDisclaimerBanner';

export const ContactPartnershipPage: React.FC = () => {
  const { language, submitPartnershipInquiry, navigate } = useRoktodaanStore();
  const bn = language === 'bn';
  const [submittedInquiry, setSubmittedInquiry] = useState<PartnershipInquiry | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PartnershipInquiryFormValues>({
    resolver: zodResolver(partnershipInquirySchema),
    defaultValues: {
      organizationName: '',
      organizationType: 'ngo',
      contactPerson: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  const onSubmit = (data: PartnershipInquiryFormValues) => {
    const created = submitPartnershipInquiry(data);
    setSubmittedInquiry(created);
    toast.success(
      bn
        ? 'অংশীদারিত্বের আবেদন সফলভাবে জমা হয়েছে।'
        : 'Partnership inquiry recorded for Roktodaan review.'
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      <header className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-800">
          {bn ? 'যোগাযোগ ও প্রাতিষ্ঠানিক অংশীদারিত্ব' : 'Contact & International Partnerships'}
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {bn ? 'সংস্থা ও দাতব্য অংশীদারিত্ব আবেদন' : 'Contact & Organization Partnership Desk'}
        </h1>
        <p className="text-base leading-relaxed text-slate-600">
          {bn
            ? 'রেড ক্রিসেন্ট, রোটারি, হাসপাতাল ব্লাড ব্যাংক, বিশ্ববিদ্যালয় চ্যাপ্টার বা এনজিও পার্টনারশিপের জন্য আমাদের সাথে যোগাযোগ করুন।'
            : 'Designed for international NGOs (Red Cross, Rotary), licensed Bangladesh blood banks, university chapters, and CSR health programs.'}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {submittedInquiry ? (
            <div className="rounded-xl border border-emerald-200 bg-white p-8 space-y-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h2 className="font-display text-xl font-bold text-slate-900">
                    {bn ? 'আবেদন গৃহীত হয়েছে' : 'Partnership Inquiry Logged'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Reference ID: <span className="font-mono font-semibold text-slate-900">{submittedInquiry.id}</span>
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 space-y-1">
                <p>
                  <strong>{submittedInquiry.organizationName}</strong> ({submittedInquiry.organizationType.toUpperCase()})
                </p>
                <p className="text-xs text-slate-600">
                  {submittedInquiry.contactPerson} · {submittedInquiry.email} · {submittedInquiry.phone}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSubmittedInquiry(null);
                    reset();
                  }}
                >
                  {bn ? 'আরেকটি আবেদন পাঠান' : 'Submit Another Inquiry'}
                </Button>
                <Button onClick={() => navigate('/about')}>
                  {bn ? 'অংশীদার পেজ দেখুন' : 'Back to Partners'}
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5"
            >
              <h2 className="font-display text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3">
                {bn ? 'অংশীদারিত্ব ফর্ম' : 'Submit Partnership or General Inquiry'}
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="inq-org-name">
                    {bn ? 'সংস্থা বা প্রতিষ্ঠানের নাম' : 'Organization Name'}
                  </Label>
                  <Input
                    id="inq-org-name"
                    placeholder="e.g. Red Crescent District Chapter"
                    {...register('organizationName')}
                  />
                  {errors.organizationName && (
                    <p className="text-xs text-red-600">{errors.organizationName.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inq-org-type">
                    {bn ? 'প্রতিষ্ঠানের ধরন' : 'Organization Type'}
                  </Label>
                  <Select id="inq-org-type" {...register('organizationType')}>
                    <option value="ngo">{bn ? 'আন্তর্জাতিক / দেশীয় এনজিও' : 'Humanitarian NGO / Charity'}</option>
                    <option value="hospital">{bn ? 'হাসপাতাল / ব্লাড ব্যাংক' : 'Hospital / Licensed Blood Bank'}</option>
                    <option value="university">{bn ? 'বিশ্ববিদ্যালয় / যুব ক্লাব' : 'University / Student Chapter'}</option>
                    <option value="corporate">{bn ? 'কর্পোরেট সিএসআর' : 'Corporate CSR Health Drive'}</option>
                    <option value="government">{bn ? 'সরকারি স্বাস্থ্য দপ্তর' : 'Government Health Desk'}</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="inq-contact-person">
                    {bn ? 'যোগাযোগকারীর নাম' : 'Contact Person'}
                  </Label>
                  <Input id="inq-contact-person" placeholder="Dr. / Coordinator Name" {...register('contactPerson')} />
                  {errors.contactPerson && (
                    <p className="text-xs text-red-600">{errors.contactPerson.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inq-email">{bn ? 'ইমেইল' : 'Official Email'}</Label>
                  <Input id="inq-email" type="email" placeholder="partner@organization.org" {...register('email')} />
                  {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inq-phone">{bn ? 'মোবাইল নম্বর' : 'Bangladesh Phone'}</Label>
                  <Input id="inq-phone" placeholder="+8801711000000" {...register('phone')} />
                  {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="inq-message">
                  {bn ? 'অংশীদারিত্বের বিবরণ ও অঞ্চল' : 'Collaboration Scope & Target Districts'}
                </Label>
                <Textarea
                  id="inq-message"
                  rows={4}
                  placeholder="Describe your target divisions/districts, donor verification needs, or SMS/camp integration requirements..."
                  {...register('message')}
                />
                {errors.message && <p className="text-xs text-red-600">{errors.message.message}</p>}
              </div>

              <MedicalDisclaimerBanner language={language} compact />

              <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {bn ? 'আবেদন জমা দিন' : 'Submit Partnership Inquiry'}
                </Button>
              </div>
            </form>
          )}
        </div>

        <aside className="lg:col-span-5 space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="font-display text-base font-semibold text-slate-900">
              {bn ? 'প্রাতিষ্ঠানিক সমন্বয় ডেস্ক' : 'National Coordination Desk'}
            </h2>
            <div className="space-y-3 text-sm text-slate-600">
              <p className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-rose-800 shrink-0" aria-hidden="true" />
                <span>Dhaka Central Secretariat, Bangladesh</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-rose-800 shrink-0" aria-hidden="true" />
                <span className="font-mono text-xs">partnerships@roktodaan.org</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-rose-800 shrink-0" aria-hidden="true" />
                <span className="font-mono text-xs">+8801715000001</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Globe2 className="h-4 w-4 text-rose-800 shrink-0" aria-hidden="true" />
                <span>64 Districts · 8 Divisions Coverage</span>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
            <h3 className="font-display text-sm font-semibold text-slate-900">
              {bn ? 'অংশীদারদের জন্য সুবিধাসমূহ' : 'What Partners Receive'}
            </h3>
            <ul className="space-y-2 text-xs leading-relaxed text-slate-600">
              <li>• Verified donor & blood bank CSV / JSON audit exports</li>
              <li>• Multi-district emergency banner broadcasting</li>
              <li>• Campus & union-level voluntary donor drive landing pages</li>
              <li>• Transparent WHO 90-day recovery compliance metrics</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};
