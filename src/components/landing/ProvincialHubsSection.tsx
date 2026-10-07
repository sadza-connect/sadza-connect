import Link from 'next/link';
import { MapPin, Building, Trees, Factory, Landmark, Mountain } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';

const PROVINCIAL_HUBS = [
  {
    name: 'Harare Province',
    sub: 'Harare CBD, Borrowdale, Chitungwiza',
    listings: '2,400+ Listings',
    focus: 'Finance, Corporate HQ, Tech & Government',
    icon: Building,
  },
  {
    name: 'Bulawayo Metro',
    sub: 'Bulawayo CBD, Kelvin, Belmont',
    listings: '1,150+ Listings',
    focus: 'Manufacturing, Heavy Industry & Spares',
    icon: Factory,
  },
  {
    name: 'Midlands Province',
    sub: 'Gweru & Kwekwe Hubs',
    listings: '680+ Listings',
    focus: 'Mining, Solar, Education & Metal Works',
    icon: Landmark,
  },
  {
    name: 'Victoria Falls & Hwange',
    sub: 'Matabeleland North',
    listings: '420+ Listings',
    focus: 'World Heritage Tourism, Safaris & Lodges',
    icon: Mountain,
  },
  {
    name: 'Manicaland Province',
    sub: 'Mutare, Nyanga & Vumba',
    listings: '510+ Listings',
    focus: 'Timber, Coffee & Cross-Border Logistics',
    icon: Trees,
  },
  {
    name: 'Masvingo Province',
    sub: 'Great Zimbabwe & Chiredzi',
    listings: '390+ Listings',
    focus: 'Heritage Tourism, Agro-Sugar & Cattle Ranching',
    icon: MapPin,
  },
];

export function ProvincialHubsSection() {
  return (
    <section className="py-20 bg-white dark:bg-ink-950 transition-colors">
      <div className="container-x">
        <SectionHeading
          centered
          eyebrow="National Coverage"
          title="Covering All Ten Provinces of Zimbabwe"
          description="From major metropolitan capitals to provincial growth points and border trading posts."
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROVINCIAL_HUBS.map((hub, idx) => {
            const Icon = hub.icon;
            return (
              <div
                key={idx}
                className="group rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-6 shadow-card dark:shadow-card-dark hover:shadow-card-hover dark:hover:shadow-card-hover-dark hover:border-brand-500/50 dark:hover:border-brand-500/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-bold text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/80 px-2.5 py-0.5 rounded-full border border-brand-200/60 dark:border-brand-800">
                      {hub.listings}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-ink-950 dark:text-white">
                    {hub.name}
                  </h3>
                  <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
                    {hub.sub}
                  </p>

                  <div className="mt-4 pt-3 border-t border-ink-100 dark:border-ink-800">
                    <span className="text-[11px] text-ink-400 uppercase tracking-wider font-semibold">
                      Key Drivers:
                    </span>
                    <p className="text-xs font-semibold text-ink-800 dark:text-ink-200 mt-0.5">
                      {hub.focus}
                    </p>
                  </div>
                </div>

                <Link
                  href="#directory"
                  className="mt-5 inline-flex items-center text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
                >
                  Explore Province Listings →
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
