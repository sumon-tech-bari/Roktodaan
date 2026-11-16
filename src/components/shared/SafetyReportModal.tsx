import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ShieldAlert, X } from 'lucide-react';
import { userReportSchema, type UserReportFormValues } from '../../lib/validations';
import { useRoktodaanStore } from '../../store/useRoktodaanStore';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';

interface SafetyReportModalProps {
  targetUserId: string;
  targetName: string;
  onClose: () => void;
}

export const SafetyReportModal: React.FC<SafetyReportModalProps> = ({
  targetUserId,
  targetName,
  onClose,
}) => {
  const { language, reportUser } = useRoktodaanStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserReportFormValues>({
    resolver: zodResolver(userReportSchema),
    defaultValues: {
      reason: 'payment_demand',
      details: '',
      blockUser: true,
    },
  });

  const blockUser = watch('blockUser');

  const onSubmit = (data: UserReportFormValues) => {
    reportUser({
      targetUserId,
      targetName,
      reason: data.reason,
      details: data.details,
      blockUser: data.blockUser,
    });
    toast.success(
      language === 'bn'
        ? data.blockUser
          ? 'রিপোর্ট জমা হয়েছে এবং ব্যবহারকারীকে ব্লক করা হয়েছে।'
          : 'নিরাপত্তা রিপোর্ট জমা হয়েছে।'
        : data.blockUser
        ? `Safety report submitted and ${targetName} has been blocked from your view.`
        : 'Safety report submitted to Roktodaan moderation team.'
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="safety-report-title"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 space-y-5 shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-800 shrink-0" aria-hidden="true" />
            <div>
              <h2 id="safety-report-title" className="font-display text-base font-bold text-slate-900">
                {language === 'bn' ? 'রিপোর্ট বা ব্লক করুন' : 'Report or Block Account'}
              </h2>
              <p className="text-xs text-slate-500">{targetName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close safety dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="report-reason">
              {language === 'bn' ? 'রিপোর্টের কারণ' : 'Reason for Report'}
            </Label>
            <Select id="report-reason" {...register('reason')}>
              <option value="payment_demand">
                {language === 'bn' ? 'টাকা বা পারিশ্রমিক দাবি করেছে' : 'Demanded money / payment'}
              </option>
              <option value="fake_profile">
                {language === 'bn' ? 'ভুয়া বা ভুল তথ্য' : 'Fake profile or false blood group'}
              </option>
              <option value="harassment">
                {language === 'bn' ? 'অসদাচরণ বা হয়রানি' : 'Harassment or abusive conduct'}
              </option>
              <option value="unreachable">
                {language === 'bn' ? 'নম্বর বন্ধ বা সাড়া দিচ্ছেন না' : 'Repeatedly unreachable / unresponsive'}
              </option>
              <option value="other">{language === 'bn' ? 'অন্যান্য' : 'Other safety concern'}</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="report-details">
              {language === 'bn' ? 'বিস্তারিত বিবরণ' : 'Incident Details'}
            </Label>
            <Textarea
              id="report-details"
              rows={3}
              placeholder={
                language === 'bn'
                  ? 'সংক্ষেপে ঘটনার বিবরণ লিখুন...'
                  : 'Briefly describe what happened for moderation review...'
              }
              {...register('details')}
            />
            {errors.details && <p className="text-xs text-red-600">{errors.details.message}</p>}
          </div>

          <label className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={blockUser}
              onChange={(e) => setValue('blockUser', e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-800"
            />
            <span>
              {language === 'bn'
                ? 'এই ব্যবহারকারীকে ব্লক করুন (ভবিষ্যতে ম্যাচিং বা তালিকায় দেখাবে না)'
                : 'Block this user immediately so they do not appear in my matches or directory'}
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button type="submit" size="sm">
              {language === 'bn' ? 'রিপোর্ট জমা দিন' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
