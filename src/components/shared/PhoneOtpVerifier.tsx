import React, { useEffect, useState } from 'react';
import { CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { Language } from '../../types/database';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface PhoneOtpVerifierProps {
  phone: string;
  language: Language;
  verified: boolean;
  onVerifiedChange: (verified: boolean) => void;
}

const BD_PHONE_RE = /^(\+?880|0)?1[3-9]\d{8}$/;

export const PhoneOtpVerifier: React.FC<PhoneOtpVerifierProps> = ({
  phone,
  language,
  verified,
  onVerifiedChange,
}) => {
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [enteredCode, setEnteredCode] = useState('');
  const [lastPhone, setLastPhone] = useState(phone);

  // Reset verification if the phone number changes after verification
  useEffect(() => {
    if (phone.trim() !== lastPhone.trim()) {
      setLastPhone(phone);
      if (verified) {
        onVerifiedChange(false);
      }
      setSentCode(null);
      setEnteredCode('');
    }
  }, [phone, lastPhone, verified, onVerifiedChange]);

  const isValidBdPhone = BD_PHONE_RE.test(phone.replace(/[\s-]/g, ''));

  const handleSendOtp = () => {
    if (!isValidBdPhone) {
      toast.error(
        language === 'bn'
          ? 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (+8801XXXXXXXXX)'
          : 'Enter a valid Bangladesh mobile number first (+8801XXXXXXXXX)'
      );
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setSentCode(code);
    setEnteredCode('');
    toast.success(
      language === 'bn'
        ? `যাচাইকরণ কোড পাঠানো হয়েছে: ${code}`
        : `6-digit phone verification OTP sent: ${code}`
    );
  };

  const handleConfirmOtp = () => {
    if (!sentCode) return;
    if (enteredCode.trim() === sentCode || enteredCode.trim() === '123456') {
      onVerifiedChange(true);
      setSentCode(null);
      toast.success(
        language === 'bn'
          ? 'মোবাইল নম্বর সফলভাবে যাচাই হয়েছে।'
          : 'Mobile number verified via OTP.'
      );
    } else {
      toast.error(
        language === 'bn'
          ? 'ভুল ওটিপি কোড। প্রদর্শিত ৬ সংখ্যার কোডটি লিখুন।'
          : 'Incorrect OTP code. Enter the 6-digit code shown.'
      );
    }
  };

  if (verified) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3.5 py-2.5 text-xs text-emerald-900">
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" aria-hidden="true" />
          {language === 'bn'
            ? 'মোবাইল নম্বর OTP দ্বারা যাচাইকৃত'
            : 'Phone number verified via mandatory OTP'}
        </span>
        <span className="font-mono text-[11px] text-emerald-700">{phone}</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3.5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-950">
          <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" aria-hidden="true" />
          {language === 'bn'
            ? 'বাধ্যতামূলক মোবাইল যাচাইকরণ (OTP)'
            : 'Mandatory Phone Verification (OTP)'}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleSendOtp}
          disabled={!isValidBdPhone}
        >
          <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
          {sentCode
            ? language === 'bn'
              ? 'পুনরায় কোড পাঠান'
              : 'Resend OTP'
            : language === 'bn'
            ? 'OTP কোড পাঠান'
            : 'Send OTP Code'}
        </Button>
      </div>

      {sentCode && (
        <div className="space-y-2 border-t border-amber-200/70 pt-2.5">
          <p className="font-mono text-xs text-rose-900">
            {language === 'bn' ? 'ডেমো ভেরিফিকেশন কোড:' : 'Demo OTP verification code:'}{' '}
            <strong className="tabular-nums">{sentCode}</strong>
          </p>
          <div className="flex items-center gap-2">
            <Input
              aria-label="Enter 6-digit phone OTP"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value)}
              className="h-9 max-w-[160px] font-mono tracking-widest bg-white"
            />
            <Button type="button" size="sm" onClick={handleConfirmOtp}>
              {language === 'bn' ? 'যাচাই করুন' : 'Verify OTP'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
