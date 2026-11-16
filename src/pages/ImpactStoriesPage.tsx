import React from 'react';
import { ArrowRight, Award, HeartPulse, MapPin } from 'lucide-react';
import { useRoktodaanStore } from '../store/useRoktodaanStore';
import { Button } from '../components/ui/button';

export const ImpactStoriesPage: React.FC = () => {
  const { language, impactBaseline, donors, navigate } = useRoktodaanStore();
  const bn = language === 'bn';

  const stories = [
    {
      id: 'st-1',
      location: bn ? 'সাভার, ঢাকা জেলা' : 'Savar Upazila, Dhaka',
      bloodGroup: 'A+',
      timing: bn ? '২২ মিনিটে সমন্বয়' : 'Matched in 22 minutes',
      title: bn
        ? 'হৃদযন্ত্রের জরুরি অস্ত্রোপচারে সাভার আশুলিয়া থেকে ২ ব্যাগ A+ রক্ত সংগ্রহ'
        : 'Two A+ Units Coordinated from Ashulia Union for Emergency Cardiac Surgery',
      summary: bn
        ? 'এনাম মেডিকেল কলেজ হাসপাতালের আইসিইউ রোগীর জন্য রক্তের অনুরোধ পাঠানোর ২২ মিনিটের মধ্যেই আশুলিয়া ইউনিয়নের ২ জন ৯০-দিন অতিক্রান্ত দাতা সাড়া দেন।'
        : 'When an ICU cardiac case needed 2 bags at Enam Medical College, Roktodaan auto-matched verified donors from Ashulia Union within 4 km, dispatching instant email alerts.',
    },
    {
      id: 'st-2',
      location: bn ? 'পাঁচলাইশ, চট্টগ্রাম' : 'Panchlaish, Chattogram',
      bloodGroup: 'O-',
      timing: bn ? 'সর্বজনীন O- সমন্বয়' : 'Universal O- Emergency Support',
      title: bn
        ? 'চট্টগ্রাম মেডিকেল শিশু থ্যালাসেমিয়া ওয়ার্ডে O- দাতা সমন্বয়'
        : 'Chattogram Medical Pediatric Thalassemia Ward Matched with Universal O- Donor',
      summary: bn
        ? 'বিরল Rh-নেগেটিভ রক্তের সংকটে রক্তদানের সামঞ্জস্যতা ইঞ্জিন নিকটতম O- দাতাকে শনাক্ত করে নিরাপদ পরিসঞ্চালনে সহায়তা করে।'
        : 'Facing a rare negative-group shortage at CMCH, our ABO/Rh compatibility logic surfaced nearby O- donors outside their 90-day cooldown window.',
    },
    {
      id: 'st-3',
      location: bn ? 'আখালিয়া, সিলেট সদর' : 'Sylhet Sadar, Sylhet',
      bloodGroup: 'O+',
      timing: bn ? 'বিশ্ববিদ্যালয় ক্যাম্পাস নেটওয়ার্ক' : 'Campus & Union Network',
      title: bn
        ? 'সিলেট ওসমানী মেডিকেলে প্রসূতি জরুরি প্রয়োজনে স্বেচ্ছাসেবী সাড়া'
        : 'Maternal Emergency Support at Sylhet Osmani Medical via Campus Donors',
      summary: bn
        ? 'যাচাইকৃত মোবাইল OTP ও ইউনিয়ন-ভিত্তিক সার্চের মাধ্যমে গভীর রাতেও দ্রুত স্বেচ্ছাসেবী রক্তদাতার সাথে রোগীর পরিবারের যোগাযোগ হয়।'
        : 'Using Union-level filtering and mandatory OTP-verified contact details, the maternity ward team connected directly with an eligible SUST donor in under 30 minutes.',
    },
    {
      id: 'st-4',
      location: bn ? 'মতিহার, রাজশাহী' : 'Boalia / Motihar, Rajshahi',
      bloodGroup: 'A-',
      timing: bn ? '৯০-দিন নিরাপদ চক্র' : '90-Day Safe Cycle Verified',
      title: bn
        ? 'রাজশাহী বিশ্ববিদ্যালয় ক্যাম্পাস চ্যাপ্টারে ১১ বার সফল রক্তদান মাইলফলক'
        : 'Rajshahi Community Chapter Completes Verified Multi-Year Voluntary Cycle',
      summary: bn
        ? 'স্বয়ংক্রিয় ৯০ দিনের বিরতি ট্র্যাকার নিশ্চিত করে প্রতিটি রক্তদাতা সুস্থ হিমোগ্লোবিন মাত্রা নিয়েই পরবর্তী দানে অংশ নিচ্ছেন।'
        : 'Automated 90-day cooldown tracking ensures long-term community donors maintain healthy iron levels across 11+ safe voluntary donations.',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-800">
            {bn ? 'প্রভাব ও মানবিক সাফল্য' : 'Verified National Impact & Stories'}
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {bn ? 'রক্তদান প্রভাব ও জীবন বাঁচানোর গল্প' : 'Impact & Life-Saving Coordination Stories'}
          </h1>
          <p className="text-base leading-relaxed text-slate-600">
            {bn
              ? 'আন্তর্জাতিক দাতা সংস্থা ও বাংলাদেশের হাসপাতাল অংশীদারদের জন্য স্বচ্ছ পরিসংখ্যান ও বাস্তব সমন্বয় প্রতিবেদন।'
              : 'Transparent humanitarian coordination metrics and verified community response stories across Bangladesh Divisions.'}
          </p>
        </div>

        <Button onClick={() => navigate('/contact')}>
          {bn ? 'অংশীদারিত্বের আবেদন করুন' : 'Partner With Roktodaan'}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </header>

      {/* Live Transparency Counters */}
      <section aria-label="Public impact metrics" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-medium text-slate-500">
            {bn ? 'মোট নিবন্ধিত দাতা' : 'Total Registered Donors'}
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900 tabular-nums">
            {(impactBaseline.totalDonors + donors.length).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-medium text-slate-500">
            {bn ? 'সফল ম্যাচ সম্পন্ন' : 'Successful Matches'}
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-rose-800 tabular-nums">
            {impactBaseline.successfulMatches.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-medium text-slate-500">
            {bn ? 'জীবন রক্ষা ও সহায়তা' : 'Lives Impacted'}
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900 tabular-nums">
            {impactBaseline.livesImpacted.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-medium text-slate-500">
            {bn ? 'সংযুক্ত ইউনিয়ন ও ওয়ার্ড' : 'Unions & Wards Active'}
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900 tabular-nums">
            {impactBaseline.activeUnionsCovered.toLocaleString()}
          </p>
        </div>
      </section>

      {/* Case Studies */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {stories.map((story) => (
          <article key={story.id} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-rose-800" aria-hidden="true" />
                  {story.location}
                </span>
                <span className="font-mono text-xs font-bold text-rose-900">
                  {story.bloodGroup}
                </span>
              </div>
              <h2 className="font-display text-lg font-bold text-slate-900 leading-snug">
                {story.title}
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">{story.summary}</p>
            </div>
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                <Award className="h-3.5 w-3.5" aria-hidden="true" />
                {story.timing}
              </span>
              <HeartPulse className="h-4 w-4 text-rose-800" aria-hidden="true" />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};
