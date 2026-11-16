import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { BLOOD_GROUPS } from '../../lib/matching';
import { BANGLADESH_DIVISIONS } from '../../lib/bangladesh-locations';
import { emergencyNoticeSchema, type EmergencyNoticeFormValues } from '../../lib/validations';
import { cn } from '../../lib/utils';
import { useRoktodaanStore } from '../../store/useRoktodaanStore';
import type { EmergencyNotice } from '../../types/database';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';

export const AdminNoticesTab: React.FC = () => {
  const {
    emergencyNotices,
    saveEmergencyNotice,
    toggleEmergencyNotice,
    deleteEmergencyNotice,
  } = useRoktodaanStore();

  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<EmergencyNoticeFormValues>({
    resolver: zodResolver(emergencyNoticeSchema),
    defaultValues: {
      titleEn: '',
      titleBn: '',
      messageEn: '',
      messageBn: '',
      severity: 'critical',
      targetBloodGroup: '',
      targetDivision: '',
      ctaLabelEn: 'Respond Now',
      ctaLabelBn: 'এখনই সাড়া দিন',
      ctaRoute: '/dashboard/donor',
      isActive: true,
    },
  });

  const handleEdit = (notice: EmergencyNotice) => {
    setEditingId(notice.id);
    form.reset({
      titleEn: notice.titleEn,
      titleBn: notice.titleBn,
      messageEn: notice.messageEn,
      messageBn: notice.messageBn,
      severity: notice.severity,
      targetBloodGroup: notice.targetBloodGroup ?? '',
      targetDivision: notice.targetDivision ?? '',
      ctaLabelEn: notice.ctaLabelEn ?? '',
      ctaLabelBn: notice.ctaLabelBn ?? '',
      ctaRoute: notice.ctaRoute ?? '/dashboard/donor',
      isActive: notice.isActive,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    form.reset({
      titleEn: '',
      titleBn: '',
      messageEn: '',
      messageBn: '',
      severity: 'critical',
      targetBloodGroup: '',
      targetDivision: '',
      ctaLabelEn: 'Respond Now',
      ctaLabelBn: 'এখনই সাড়া দিন',
      ctaRoute: '/dashboard/donor',
      isActive: true,
    });
  };

  const onSubmit = (data: EmergencyNoticeFormValues) => {
    saveEmergencyNotice({
      id: editingId ?? undefined,
      titleEn: data.titleEn,
      titleBn: data.titleBn,
      messageEn: data.messageEn,
      messageBn: data.messageBn,
      severity: data.severity,
      targetBloodGroup: data.targetBloodGroup || undefined,
      targetDivision: data.targetDivision || undefined,
      ctaLabelEn: data.ctaLabelEn || undefined,
      ctaLabelBn: data.ctaLabelBn || undefined,
      ctaRoute: data.ctaRoute || undefined,
      isActive: data.isActive,
    });
    toast.success('Emergency notice saved and broadcast settings updated.');
    resetForm();
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-5 space-y-3">
        <h2 className="font-display text-base font-semibold text-slate-900">
          Broadcast Notices ({emergencyNotices.length})
        </h2>

        {emergencyNotices.map((notice) => (
          <div
            key={notice.id}
            className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <AlertTriangle
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0',
                    notice.severity === 'critical'
                      ? 'text-red-700'
                      : notice.severity === 'urgent'
                      ? 'text-amber-700'
                      : 'text-slate-600'
                  )}
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{notice.titleEn}</p>
                  <p className="text-xs text-slate-600">{notice.titleBn}</p>
                </div>
              </div>
              <span
                className={cn(
                  'text-xs font-semibold uppercase shrink-0',
                  notice.isActive ? 'text-emerald-700' : 'text-slate-400'
                )}
              >
                {notice.isActive ? 'Live' : 'Paused'}
              </span>
            </div>

            <p className="text-xs text-slate-600">{notice.messageEn}</p>

            <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(notice)}>
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  Edit
                </Button>
                <button
                  type="button"
                  onClick={() => toggleEmergencyNotice(notice.id)}
                  className="text-xs font-medium text-slate-700 hover:underline cursor-pointer"
                >
                  {notice.isActive ? 'Pause' : 'Activate'}
                </button>
              </div>
              <button
                type="button"
                aria-label={`Delete notice ${notice.titleEn}`}
                onClick={() => {
                  deleteEmergencyNotice(notice.id);
                  if (editingId === notice.id) resetForm();
                  toast.success('Notice removed');
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-700 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
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
            {editingId ? 'Edit Emergency Notice' : 'Publish New Emergency Notice'}
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
            <Label htmlFor="notice-title-en">Headline (English)</Label>
            <Input
              id="notice-title-en"
              placeholder="e.g. Urgent O- Shortage in Dhaka ICU"
              {...form.register('titleEn')}
            />
            {form.formState.errors.titleEn && (
              <p className="text-xs text-red-600">{form.formState.errors.titleEn.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notice-title-bn">Headline (Bengali)</Label>
            <Input
              id="notice-title-bn"
              placeholder="যেমন: ঢাকায় জরুরি O- রক্তের প্রয়োজন"
              {...form.register('titleBn')}
            />
            {form.formState.errors.titleBn && (
              <p className="text-xs text-red-600">{form.formState.errors.titleBn.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="notice-msg-en">Message (English)</Label>
            <Textarea id="notice-msg-en" rows={2} {...form.register('messageEn')} />
            {form.formState.errors.messageEn && (
              <p className="text-xs text-red-600">{form.formState.errors.messageEn.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notice-msg-bn">Message (Bengali)</Label>
            <Textarea id="notice-msg-bn" rows={2} {...form.register('messageBn')} />
            {form.formState.errors.messageBn && (
              <p className="text-xs text-red-600">{form.formState.errors.messageBn.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="notice-severity">Severity</Label>
            <Select id="notice-severity" {...form.register('severity')}>
              <option value="critical">Critical (Deep Red Bar)</option>
              <option value="urgent">Urgent (Amber Alert)</option>
              <option value="info">Announcement (Dark Slate)</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notice-group">Target Blood Group (Optional)</Label>
            <Select id="notice-group" {...form.register('targetBloodGroup')}>
              <option value="">All Groups</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notice-division">Target Division (Optional)</Label>
            <Select id="notice-division" {...form.register('targetDivision')}>
              <option value="">Nationwide</option>
              {BANGLADESH_DIVISIONS.map((d) => (
                <option key={d.nameEn} value={d.nameEn}>
                  {d.nameEn}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="notice-cta-en">CTA Label (EN)</Label>
            <Input id="notice-cta-en" {...form.register('ctaLabelEn')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notice-cta-bn">CTA Label (BN)</Label>
            <Input id="notice-cta-bn" {...form.register('ctaLabelBn')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notice-cta-route">Action Target</Label>
            <Select id="notice-cta-route" {...form.register('ctaRoute')}>
              <option value="/dashboard/donor">Donor Dashboard</option>
              <option value="/find-donors">Find Donors</option>
              <option value="/request-blood">Request Blood</option>
              <option value="/register-donor">Register Donor</option>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3">
            <Switch
              ariaLabel="Activate notice globally"
              checked={form.watch('isActive')}
              onCheckedChange={(val) => form.setValue('isActive', val)}
            />
            <span className="text-sm font-medium text-slate-700">Show banner live</span>
          </div>
          <Button type="submit">{editingId ? 'Update Notice' : 'Broadcast Notice'}</Button>
        </div>
      </form>
    </div>
  );
};
