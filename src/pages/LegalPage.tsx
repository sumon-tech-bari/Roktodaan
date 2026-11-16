import React from 'react';
import { useRoktodaanStore } from '../store/useRoktodaanStore';
import { Button } from '../components/ui/button';

interface LegalPageProps {
  mode: 'privacy' | 'terms';
}

export const LegalPage: React.FC<LegalPageProps> = ({ mode }) => {
  const { navigate } = useRoktodaanStore();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
            {mode === 'privacy' ? 'Privacy Policy & Data Protection' : 'Terms of Service & Clinical Charter'}
          </h1>
          <p className="mt-1 text-xs text-slate-500">Effective Date: November 2026 · Roktodaan Network</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(mode === 'privacy' ? '/legal/terms' : '/legal/privacy')}
        >
          {mode === 'privacy' ? 'Read Terms' : 'Read Privacy'}
        </Button>
      </div>

      {mode === 'privacy' ? (
        <div className="space-y-5 text-sm leading-relaxed text-slate-700">
          <section className="space-y-2">
            <h2 className="font-display text-base font-semibold text-slate-900">
              1. Minimal Medical & Geographic Data Collection
            </h2>
            <p>
              Roktodaan collects only the information necessary to coordinate voluntary blood donations across Bangladesh: your name, verified phone or email, ABO/Rh blood group, last donation date, and administrative location (Division, District, Upazila, Union).
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="font-display text-base font-semibold text-slate-900">
              2. Phone Number Masking & Consent Controls
            </h2>
            <p>
              Donor phone numbers are masked in public directory listings. Direct phone visibility is unlocked strictly during active blood coordination or when a donor toggles availability to active. Donors can pause visibility at any moment with one tap.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="font-display text-base font-semibold text-slate-900">
              3. Zero Commercial Sale & Humanitarian Auditability
            </h2>
            <p>
              Roktodaan never sells, rents, or monetizes donor contact records. Aggregated, anonymized impact statistics may be shared with accredited partners such as Bangladesh Red Crescent Society, Rotary International, and public hospitals.
            </p>
          </section>
        </div>
      ) : (
        <div className="space-y-5 text-sm leading-relaxed text-slate-700">
          <section className="space-y-2">
            <h2 className="font-display text-base font-semibold text-slate-900">
              1. Voluntary Non-Remunerated Donation Charter
            </h2>
            <p>
              In strict alignment with World Health Organization (WHO) and Safe Blood Transfusion Bangladesh guidelines, Roktodaan strictly prohibits buying, selling, or commercial brokering of human blood or blood components.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="font-display text-base font-semibold text-slate-900">
              2. Mandatory 90-Day Interval & Clinical Screening
            </h2>
            <p>
              Donors must wait at least 90 days (3 months) between whole-blood donations. Final medical suitability, hemoglobin testing, and infectious disease screening remain the responsibility of the attending licensed blood bank or hospital.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="font-display text-base font-semibold text-slate-900">
              3. Emergency Coordination Disclaimer
            </h2>
            <p>
              Roktodaan facilitates rapid donor discovery and communication. Seekers should always coordinate simultaneously with hospital transfusion departments during critical emergencies.
            </p>
          </section>
        </div>
      )}
    </div>
  );
};
