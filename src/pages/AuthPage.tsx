import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { KeyRound, ShieldCheck, UserCheck } from 'lucide-react';
import { authStepOneSchema, otpVerifySchema } from '../lib/validations';
import { cn } from '../lib/utils';
import { useRoktodaanStore } from '../store/useRoktodaanStore';
import type { UserRole } from '../types/database';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { z } from 'zod';

type StepOneForm = z.infer<typeof authStepOneSchema>;
type StepTwoForm = z.infer<typeof otpVerifySchema>;

export const AuthPage: React.FC = () => {
  const { currentUser, signInWithOtp, switchDemoRole, signOut, navigate } = useRoktodaanStore();
  const [step, setStep] = useState<'identifier' | 'otp'>('identifier');
  const [pendingPayload, setPendingPayload] = useState<StepOneForm | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');

  const stepOneForm = useForm<StepOneForm>({
    resolver: zodResolver(authStepOneSchema),
    defaultValues: {
      identifier: '',
      fullName: '',
      role: 'donor',
    },
  });

  const stepTwoForm = useForm<StepTwoForm>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: {
      otp: '',
    },
  });

  const selectedRole = stepOneForm.watch('role');

  const handleSendOtp = (data: StepOneForm) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setPendingPayload(data);
    setStep('otp');
    toast.success(`Verification code sent to ${data.identifier}`);
  };

  const handleVerifyOtp = (data: StepTwoForm) => {
    if (!pendingPayload) return;
    if (data.otp !== generatedOtp && data.otp !== '123456') {
      stepTwoForm.setError('otp', { message: 'Incorrect OTP code. Use the code shown below.' });
      return;
    }
    const user = signInWithOtp({
      identifier: pendingPayload.identifier,
      fullName: pendingPayload.fullName,
      role: pendingPayload.role,
    });
    toast.success(`Signed in as ${user.fullName}`);
    if (user.role === 'donor') {
      navigate('/profile');
    } else if (user.role === 'seeker') {
      navigate('/request-blood');
    } else {
      navigate('/dashboard/donor');
    }
  };

  const handleQuickRole = (role: UserRole) => {
    switchDemoRole(role);
    toast.success(`Active session switched to ${role} account`);
    if (role === 'admin') navigate('/admin');
    else if (role === 'seeker') navigate('/dashboard/seeker');
    else navigate('/dashboard/donor');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              Sign in or Register with Roktodaan
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">
              Passwordless email or Bangladesh mobile OTP verification for donors, seekers, and hospitals.
            </p>
          </div>

          {step === 'identifier' ? (
            <form onSubmit={stepOneForm.handleSubmit(handleSendOtp)} noValidate className="space-y-5">
              <div className="space-y-2">
                <span className="block text-sm font-medium text-slate-800">Account Role</span>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: 'donor', label: 'Donor' },
                      { value: 'seeker', label: 'Seeker' },
                      { value: 'hospital', label: 'Blood Bank' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => stepOneForm.setValue('role', item.value)}
                      className={cn(
                        'min-h-[42px] rounded-lg border px-3 text-sm font-medium transition-colors cursor-pointer',
                        selectedRole === item.value
                          ? 'border-rose-800 bg-rose-800 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="auth-fullname">Full Name (for new registrations)</Label>
                <Input
                  id="auth-fullname"
                  placeholder="e.g. Tariqul Islam"
                  {...stepOneForm.register('fullName')}
                />
                {stepOneForm.formState.errors.fullName && (
                  <p className="text-xs text-red-600">
                    {stepOneForm.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="auth-identifier">Email or Bangladesh Mobile Number</Label>
                <Input
                  id="auth-identifier"
                  placeholder="name@example.com or +8801712345678"
                  {...stepOneForm.register('identifier')}
                />
                {stepOneForm.formState.errors.identifier && (
                  <p className="text-xs text-red-600">
                    {stepOneForm.formState.errors.identifier.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg">
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                Send 6-Digit OTP Code
              </Button>
            </form>
          ) : (
            <form onSubmit={stepTwoForm.handleSubmit(handleVerifyOtp)} noValidate className="space-y-5">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p>
                  Enter the 6-digit code dispatched to{' '}
                  <strong className="text-slate-900">{pendingPayload?.identifier}</strong>.
                </p>
                <p className="mt-1 font-mono text-xs text-rose-800">
                  Demo OTP code: <strong className="tabular-nums">{generatedOtp}</strong>
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="auth-otp">6-Digit Verification Code</Label>
                <Input
                  id="auth-otp"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  className="font-mono text-lg tracking-widest"
                  {...stepTwoForm.register('otp')}
                />
                {stepTwoForm.formState.errors.otp && (
                  <p className="text-xs text-red-600">{stepTwoForm.formState.errors.otp.message}</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('identifier')}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Verify & Continue
                </Button>
              </div>
            </form>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <p className="text-xs text-slate-600">
              First-time blood donor? Complete your Union profile and blood group directly.
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate('/register-donor')}>
              Register as a Blood Donor
            </Button>
          </div>
        </div>

        {/* Right column: Instant Role Access & Current Session */}
        <div className="lg:col-span-5 space-y-5">
          {currentUser && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Active Session
                </span>
                <span className="text-xs font-semibold text-rose-800 uppercase">
                  {currentUser.role}
                </span>
              </div>
              <div>
                <p className="font-display text-base font-semibold text-slate-900">
                  {currentUser.fullName}
                </p>
                <p className="text-xs text-slate-600 font-mono">{currentUser.phone}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                  Edit Profile
                </Button>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-rose-800" aria-hidden="true" />
              <h2 className="font-display text-sm font-semibold text-slate-900">
                Role-Based Access Preview
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Explore every permission tier in Roktodaan immediately without external SMS gateway setup.
            </p>
            <div className="grid grid-cols-1 gap-2">
              {(
                [
                  { role: 'donor', title: 'Donor — Ariful Islam (O+, Savar)' },
                  { role: 'seeker', title: 'Seeker — Nusrat Jahan (Active ICU Request)' },
                  { role: 'hospital', title: 'Blood Bank — Dhaka Red Crescent Center' },
                  { role: 'admin', title: 'Admin — Dr. Mahmudul Hasan (National Ops)' },
                ] as const
              ).map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleQuickRole(item.role)}
                  className={cn(
                    'flex min-h-[42px] items-center justify-between rounded-lg border px-3.5 py-2 text-left text-xs font-medium transition-colors cursor-pointer',
                    currentUser?.role === item.role
                      ? 'border-rose-800 bg-rose-50 text-rose-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <span>{item.title}</span>
                  <UserCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
