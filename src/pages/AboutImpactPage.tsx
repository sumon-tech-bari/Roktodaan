import React from 'react';
import { ArrowRight, Globe2, HeartHandshake, ShieldCheck } from 'lucide-react';
import { t } from '../lib/i18n';
import { useRoktodaanStore } from '../store/useRoktodaanStore';
import { Button } from '../components/ui/button';

export const AboutImpactPage: React.FC = () => {
  const { language, impactBaseline, donors, bloodBanks, navigate } = useRoktodaanStore();
  const copy = t(language);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h1
              style={{ textWrap: 'balance' }}
              className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            >
              {copy.about.title}
            </h1>
            <p className="text-base leading-relaxed text-slate-600">{copy.about.subtitle}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-6">
            <div>
              <p className="font-display text-2xl font-bold text-rose-800 tabular-nums">
                {impactBaseline.livesImpacted.toLocaleString()}
              </p>
              <p className="text-xs text-slate-600">Verified lives supported across 64 districts</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-slate-900 tabular-nums">
                {impactBaseline.activeUnionsCovered.toLocaleString()}
              </p>
              <p className="text-xs text-slate-600">Unions & municipal wards mapped with GPS</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <img
            src="/src/assets/images/medical_cold_chain_logistics_1794820531599.jpg"
            alt="International cold-chain blood transport box beside Bangladesh delta map"
            referrerPolicy="no-referrer"
            className="h-full min-h-[240px] w-full object-cover"
          />
        </div>
      </div>

      {/* Three Core Humanitarian Standards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <ShieldCheck className="h-6 w-6 text-rose-800" aria-hidden="true" />
          <h2 className="font-display text-lg font-semibold text-slate-900">
            WHO 90-Day Safety Governance
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Every donor record automatically enforces a mandatory 90-day recovery interval between whole-blood donations, protecting donor hemoglobin health.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <Globe2 className="h-6 w-6 text-rose-800" aria-hidden="true" />
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Union-Level Disaster Resilience
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Built with offline-capable Progressive Web App caching and bilingual Bengali/English accessibility for rural upazilas and monsoon-affected unions.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          <HeartHandshake className="h-6 w-6 text-rose-800" aria-hidden="true" />
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Charity & NGO Federation Ready
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Role-based verification queues allow Red Crescent, Rotary Clubs, Sandhani, and district hospitals to audit local donor pools and blood banks.
          </p>
        </div>
      </div>

      {/* Partner Directory */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900">
              Verified Blood Transfusion Partners ({bloodBanks.length})
            </h2>
            <p className="text-sm text-slate-600">
              Active blood centers coordinated alongside {donors.length} live verified community donors.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => navigate('/contact')}>
              {language === 'bn' ? 'অংশীদারিত্ব আবেদন' : 'Partner With Us'}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/find-donors')}>
              {copy.about.partnerCta}
            </Button>
          </div>
        </div>

        <div className="divide-y divide-slate-200 border-t border-slate-200">
          {bloodBanks.map((bank) => (
            <div
              key={bank.id}
              className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {language === 'bn' ? bank.nameBn : bank.name}
                </p>
                <p className="text-xs text-slate-600">
                  {bank.address} · {bank.division}
                </p>
              </div>
              <div className="text-xs text-slate-600 font-mono tabular-nums">
                {bank.phone} · {bank.is24Hours ? '24/7' : 'Scheduled'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
