import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Megaphone, Pencil, Trash2 } from 'lucide-react';
import { adCampaignSchema, type AdCampaignFormValues } from '../../lib/validations';
import { cn } from '../../lib/utils';
import { useRoktodaanStore } from '../../store/useRoktodaanStore';
import type { AdCampaign } from '../../types/database';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';

const PRESET_IMAGES = [
  {
    label: 'Cold-Chain Medical Logistics',
    url: '/src/assets/images/medical_cold_chain_logistics_1794820531599.jpg',
  },
  {
    label: 'Community Donor Drive',
    url: '/src/assets/images/community_donor_drive_1794820532640.jpg',
  },
  {
    label: 'Roktodaan Blood Clinic',
    url: '/src/assets/images/hero_roktodaan_clinic_1794820531516.jpg',
  },
];

export const AdminAdsTab: React.FC = () => {
  const {
    adCampaigns,
    customPages,
    saveAdCampaign,
    toggleAdCampaign,
    deleteAdCampaign,
  } = useRoktodaanStore();

  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<AdCampaignFormValues>({
    resolver: zodResolver(adCampaignSchema),
    defaultValues: {
      sponsorName: '',
      titleEn: '',
      titleBn: '',
      descriptionEn: '',
      descriptionBn: '',
      ctaLabelEn: 'Learn More',
      ctaLabelBn: 'বিস্তারিত দেখুন',
      targetRoute: '/register-donor',
      imageUrl: PRESET_IMAGES[0].url,
      placement: 'landing',
      isActive: true,
    },
  });

  const handleEdit = (ad: AdCampaign) => {
    setEditingId(ad.id);
    form.reset({
      sponsorName: ad.sponsorName,
      titleEn: ad.titleEn,
      titleBn: ad.titleBn,
      descriptionEn: ad.descriptionEn,
      descriptionBn: ad.descriptionBn,
      ctaLabelEn: ad.ctaLabelEn,
      ctaLabelBn: ad.ctaLabelBn,
      targetRoute: ad.targetRoute,
      imageUrl: ad.imageUrl ?? '',
      placement: ad.placement,
      isActive: ad.isActive,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    form.reset({
      sponsorName: '',
      titleEn: '',
      titleBn: '',
      descriptionEn: '',
      descriptionBn: '',
      ctaLabelEn: 'Learn More',
      ctaLabelBn: 'বিস্তারিত দেখুন',
      targetRoute: '/register-donor',
      imageUrl: PRESET_IMAGES[0].url,
      placement: 'landing',
      isActive: true,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        form.setValue('imageUrl', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (data: AdCampaignFormValues) => {
    saveAdCampaign({
      id: editingId ?? undefined,
      sponsorName: data.sponsorName,
      titleEn: data.titleEn,
      titleBn: data.titleBn,
      descriptionEn: data.descriptionEn,
      descriptionBn: data.descriptionBn,
      ctaLabelEn: data.ctaLabelEn,
      ctaLabelBn: data.ctaLabelBn,
      targetRoute: data.targetRoute,
      imageUrl: data.imageUrl || undefined,
      placement: data.placement,
      isActive: data.isActive,
    });
    toast.success('Sponsor campaign / ad saved and published.');
    resetForm();
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-5 space-y-3">
        <h2 className="font-display text-base font-semibold text-slate-900">
          Ads & Partner Campaigns ({adCampaigns.length})
        </h2>

        {adCampaigns.map((ad) => (
          <div
            key={ad.id}
            className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <Megaphone className="mt-0.5 h-4 w-4 text-rose-800 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    {ad.sponsorName} · {ad.placement}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">{ad.titleEn}</p>
                </div>
              </div>
              <span
                className={cn(
                  'text-xs font-semibold uppercase shrink-0',
                  ad.isActive ? 'text-emerald-700' : 'text-slate-400'
                )}
              >
                {ad.isActive ? 'Active' : 'Paused'}
              </span>
            </div>

            <p className="text-xs text-slate-600">{ad.descriptionEn}</p>

            <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(ad)}>
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  Edit
                </Button>
                <button
                  type="button"
                  onClick={() => toggleAdCampaign(ad.id)}
                  className="font-medium text-slate-700 hover:underline cursor-pointer"
                >
                  {ad.isActive ? 'Pause' : 'Activate'}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-500 tabular-nums">{ad.clicks} clicks</span>
                <button
                  type="button"
                  aria-label={`Delete ad ${ad.titleEn}`}
                  onClick={() => {
                    deleteAdCampaign(ad.id);
                    if (editingId === ad.id) resetForm();
                    toast.success('Campaign deleted');
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-display text-base font-semibold text-slate-900">
            {editingId ? 'Edit Campaign Banner' : 'Add Sponsored Banner / Campaign Ad'}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-medium text-rose-800 hover:underline cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ad-sponsor">Sponsor / Organization</Label>
            <Input
              id="ad-sponsor"
              placeholder="e.g. Red Crescent Bangladesh"
              {...form.register('sponsorName')}
            />
            {form.formState.errors.sponsorName && (
              <p className="text-xs text-red-600">{form.formState.errors.sponsorName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ad-placement">Display Placement</Label>
            <Select id="ad-placement" {...form.register('placement')}>
              <option value="landing">Landing Page</option>
              <option value="find_donors">Find Donors Directory</option>
              <option value="request_blood">Request Blood Page</option>
              <option value="custom_pages">Custom CMS Pages</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ad-title-en">Campaign Title (EN)</Label>
            <Input id="ad-title-en" {...form.register('titleEn')} />
            {form.formState.errors.titleEn && (
              <p className="text-xs text-red-600">{form.formState.errors.titleEn.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ad-title-bn">Campaign Title (BN)</Label>
            <Input id="ad-title-bn" {...form.register('titleBn')} />
            {form.formState.errors.titleBn && (
              <p className="text-xs text-red-600">{form.formState.errors.titleBn.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ad-desc-en">Description (EN)</Label>
            <Textarea id="ad-desc-en" rows={2} {...form.register('descriptionEn')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ad-desc-bn">Description (BN)</Label>
            <Textarea id="ad-desc-bn" rows={2} {...form.register('descriptionBn')} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="ad-cta-en">Button Label (EN)</Label>
            <Input id="ad-cta-en" {...form.register('ctaLabelEn')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ad-cta-bn">Button Label (BN)</Label>
            <Input id="ad-cta-bn" {...form.register('ctaLabelBn')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ad-route">Target Page / Link</Label>
            <Select id="ad-route" {...form.register('targetRoute')}>
              <option value="/register-donor">Donor Registration</option>
              <option value="/find-donors">Find Donors</option>
              <option value="/request-blood">Request Blood</option>
              <option value="/about">Partners & Impact</option>
              {customPages.map((p) => (
                <option key={p.id} value={`/p/${p.slug}`}>
                  Custom: /p/{p.slug}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="ad-image-preset">Banner Image Preset</Label>
            <Select id="ad-image-preset" {...form.register('imageUrl')}>
              {PRESET_IMAGES.map((img) => (
                <option key={img.url} value={img.url}>
                  {img.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ad-image-upload">Or Upload Custom Image (&lt;2 MB)</Label>
            <input
              id="ad-image-upload"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageUpload}
              className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-700 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3">
            <Switch
              ariaLabel="Activate campaign banner"
              checked={form.watch('isActive')}
              onCheckedChange={(val) => form.setValue('isActive', val)}
            />
            <span className="text-sm font-medium text-slate-700">Active immediately</span>
          </div>
          <Button type="submit">{editingId ? 'Update Campaign' : 'Publish Campaign'}</Button>
        </div>
      </form>
    </div>
  );
};
