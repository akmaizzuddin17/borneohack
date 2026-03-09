import { useState } from 'react';
import { Compass, Globe, Search, MessageSquare, ClipboardCheck, FileEdit, Globe2, BadgeCheck, ArrowRight, X, TrendingUp, AlertCircle, BookOpen, Lightbulb } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const SUGGESTIONS = ['Palm Oil Standards', 'Sarawak Export Tax', 'Halal Certification', 'Form D Certificate', 'Indonesia pepper import', 'Thailand import duties'];

// Trade news / updates data
const TRADE_UPDATES = [
  {
    id: 1,
    tag: 'Route Update',
    tagColor: 'bg-accent text-white',
    title: 'New Borneo–Nusantara Trade Route Now Open',
    date: '2024',
    summary: 'The new capital city Nusantara in East Kalimantan opens a closer trade corridor for Borneo-based exporters to access the Indonesian market. Timber, palm oil, and spice exporters stand to benefit from reduced logistics costs.',
    details: [
      'Estimated logistics cost reduction: 15–20% for East Kalimantan routes',
      'New port facilities at Balikpapan serving Nusantara region',
      'Updated HS tariff codes for timber products under ATIGA',
      'Spices (HS 0904): ATIGA preferential rate 0% vs MFN 5%',
      'Contact: Kementerian Perdagangan Indonesia — www.kemendag.go.id',
    ],
    action: 'Ask about Indonesia export requirements',
    link: '/qna',
    query: 'What are the export requirements and tariff rates for timber and spices to Indonesia via Nusantara?',
  },
  {
    id: 2,
    tag: 'Regulation',
    tagColor: 'bg-blue-600 text-white',
    title: 'ASEAN Import Licensing Procedures Updated (ATIGA Art. 44)',
    date: '2024',
    summary: 'ASEAN has updated guidelines for import licensing under ATIGA Article 44. Automatic licenses must now be approved within 10 working days, and non-automatic licenses within 30–60 days.',
    details: [
      'Automatic licenses: approved within 10 working days',
      'Non-automatic licenses: 30 days (first-come) or 60 days (simultaneous)',
      'Applications must approach no more than 3 administrative bodies',
      'Minor documentation errors cannot be used to reject applications',
      'All goods covered by import licensing listed in AHTN 8-digit codes',
    ],
    action: 'Learn about import licensing',
    link: '/qna',
    query: 'What are the ASEAN import licensing procedures and how long does it take to get approved?',
  },
  {
    id: 3,
    tag: 'Certificate',
    tagColor: 'bg-emerald-600 text-white',
    title: 'Form D Certificate of Origin — Issuing Authorities by Country',
    date: '2024',
    summary: 'All ASEAN member states now accept self-certification for Certificate of Origin. Official issuing authorities have been confirmed for each country.',
    details: [
      'Malaysia → MITI (Trade Services Division)',
      'Indonesia → Ministry of Trade (Directorate General of Foreign Trade)',
      'Thailand → Ministry of Commerce (Department of Foreign Trade)',
      'Vietnam → Ministry of International Trade',
      'Philippines → Bureau of Customs (Export Coordination Division)',
      'Singapore → Singapore Customs (Documentation Specialist Branch)',
      'Self-certification accepted by ALL member countries',
    ],
    action: 'Check Form D eligibility',
    link: '/form-d',
    query: '',
  },
];

// Useful tips for Borneo vendors
const QUICK_TIPS = [
  { icon: '📋', title: 'Always get Form D', desc: 'Saves 5–30% on tariffs when exporting within ASEAN' },
  { icon: '🏷️', title: 'Label in local language', desc: 'Indonesia, Thailand & Vietnam require local language labels' },
  { icon: '🌿', title: 'Phytosanitary cert needed', desc: 'Required for all plant-based products (pepper, fruits, herbs)' },
  { icon: '⚡', title: 'Digital customs', desc: 'Thailand & Singapore use fully digital customs — register early' },
];


function GreetingBanner() {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const emoji = hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙';
  const taglines = [
    'Your ASEAN trade journey starts here.',
    'Smart exports. Zero tariff surprises.',
    'From Borneo to ASEAN — we guide every step.',
    'Trade smarter across Southeast Asia.',
  ];
  const tagline = taglines[new Date().getDay() % taglines.length];

  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <p className="text-lg font-semibold text-primary opacity-80">{timeGreeting}, Trader!</p>
      </div>
      <h1 className="text-4xl font-extrabold leading-tight text-slate-900 dark:text-slate-100">
        What do you want to <span className="text-accent">export</span> today?
      </h1>
      <p className="mt-2 text-base text-slate-400 font-medium italic">{tagline}</p>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [activeUpdate, setActiveUpdate] = useState<typeof TRADE_UPDATES[0] | null>(null);
  const navigate = useNavigate();

  const handleSearch = (q?: string) => {
    const searchTerm = (q ?? query).trim();
    if (!searchTerm) return;
    navigate('/qna', { state: { autoQuery: searchTerm } });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light pb-[80px] dark:bg-background-dark text-slate-900 dark:text-slate-100">

      {/* News Modal */}
      {activeUpdate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4" onClick={() => setActiveUpdate(null)}>
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActiveUpdate(null)} className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800"><X className="h-5 w-5" /></button>
            <span className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold ${activeUpdate.tagColor}`}>{activeUpdate.tag}</span>
            <h3 className="mb-1 text-xl font-extrabold text-primary dark:text-slate-100">{activeUpdate.title}</h3>
            <p className="mb-4 text-sm text-slate-500">{activeUpdate.date}</p>
            <p className="mb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{activeUpdate.summary}</p>
            <div className="mb-6 rounded-2xl bg-primary/5 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">Key Points</p>
              <ul className="space-y-1.5">
                {activeUpdate.details.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            {activeUpdate.query ? (
              <button
                onClick={() => { setActiveUpdate(null); navigate(activeUpdate.link, { state: { autoQuery: activeUpdate.query } }); }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90 transition-colors">
                {activeUpdate.action} <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <Link to={activeUpdate.link} onClick={() => setActiveUpdate(null)} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90 transition-colors">
                {activeUpdate.action} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-primary/10 bg-background-light px-6 py-4 dark:bg-background-dark">
        <div className="flex items-center gap-3 text-primary dark:text-slate-100">
          <div className="flex items-center justify-center rounded-lg bg-primary p-1.5 text-white"><Compass className="h-6 w-6" /></div>
          <h2 className="text-xl font-bold tracking-tight">ASEAN Trade Compass</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
          <Globe className="h-4 w-4" /> English
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">

        {/* Hero search */}
        <div className="mb-8">
          <GreetingBanner />
        </div>

        <div className="relative mb-10">
          <div className="flex flex-col gap-3">
            <div className="relative flex items-center">
              <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center"><Search className="h-6 w-6 text-primary/60" /></div>
              <input
                className="h-16 w-full rounded-2xl border-2 border-primary/10 bg-white pl-14 pr-[130px] text-lg font-medium shadow-sm placeholder:text-slate-400 focus:border-accent focus:ring-0 dark:border-slate-700 dark:bg-slate-800"
                placeholder="Type your export query..."
                type="text" value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              />
              <button onClick={() => handleSearch()} disabled={!query.trim()} className="absolute right-2 flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-40">
                Search <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 px-1">
              <span className="text-xs font-semibold tracking-wider text-primary/60 uppercase">Suggested:</span>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => handleSearch(s)} className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary hover:bg-primary/15 transition-colors">{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Quick Trade Tips</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {QUICK_TIPS.map(tip => (
              <div key={tip.title} className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm dark:bg-slate-800">
                <div className="mb-2 text-2xl">{tip.icon}</div>
                <p className="text-sm font-bold text-primary dark:text-slate-200">{tip.title}</p>
                <p className="text-xs text-slate-500 mt-1">{tip.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-slate-800 dark:text-slate-200">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Link to="/qna" className="flex cursor-pointer items-start gap-4 rounded-2xl border-b-4 border-accent bg-white p-6 shadow-md hover:shadow-lg dark:bg-slate-800">
              <div className="flex size-14 items-center justify-center rounded-xl bg-accent/10 text-accent"><MessageSquare className="h-8 w-8" /></div>
              <div><h3 className="mb-1 text-lg font-bold text-primary">Ask a Trade Question</h3><p className="text-sm text-slate-500">Instant answers on duties, routes, and regulations.</p></div>
            </Link>
            <Link to="/checklist" className="flex cursor-pointer items-start gap-4 rounded-2xl border-b-4 border-primary bg-white p-6 shadow-md hover:shadow-lg dark:bg-slate-800">
              <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary"><ClipboardCheck className="h-8 w-8" /></div>
              <div><h3 className="mb-1 text-lg font-bold text-primary">Get Compliance Checklist</h3><p className="text-sm text-slate-500">Step-by-step requirements for your product.</p></div>
            </Link>
            <Link to="/translation" className="flex cursor-pointer items-start gap-4 rounded-2xl border-b-4 border-primary bg-white p-6 shadow-md hover:shadow-lg dark:bg-slate-800">
              <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileEdit className="h-8 w-8" /></div>
              <div><h3 className="mb-1 text-lg font-bold text-primary">Draft a Business Letter</h3><p className="text-sm text-slate-500">Formal export letters in multiple languages.</p></div>
            </Link>
            <Link to="/form-d" className="flex cursor-pointer items-start gap-4 rounded-2xl border-b-4 border-accent bg-white p-6 shadow-md hover:shadow-lg dark:bg-slate-800">
              <div className="flex size-14 items-center justify-center rounded-xl bg-accent/10 text-accent"><BadgeCheck className="h-8 w-8" /></div>
              <div><h3 className="mb-1 text-lg font-bold text-primary">Check Form D Eligibility</h3><p className="text-sm text-slate-500">Qualify for zero ASEAN import duties.</p></div>
            </Link>
          </div>
        </section>

        {/* Trade Updates / News section */}
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Trade Updates</h2>
          </div>
          <div className="flex flex-col gap-4">
            {TRADE_UPDATES.map(update => (
              <div key={update.id} className="relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-primary p-6 text-white md:flex-row md:items-center">
                <div className="flex-1 z-10">
                  <span className={`mb-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${update.tagColor}`}>{update.tag}</span>
                  <h3 className="mb-2 text-lg font-bold">{update.title}</h3>
                  <p className="text-sm opacity-85 leading-relaxed max-w-lg">{update.summary}</p>
                  <button onClick={() => setActiveUpdate(update)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-bold text-white hover:bg-amber-600 transition-colors">
                    Read Update <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-accent/20 z-10">
                  <Globe2 className="h-12 w-12 text-accent/50" />
                </div>
                <div className="absolute right-0 top-0 h-full w-32 skew-x-12 bg-white/5" />
              </div>
            ))}
          </div>
        </section>

        {/* Documentation Guide */}
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Standard Documents Needed for Any ASEAN Export</h2>
          </div>
          <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-slate-800">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                { doc: 'Commercial Invoice', req: 'Always required', note: 'Must be signed by manufacturer/supplier' },
                { doc: 'Bill of Lading / Air Waybill', req: 'Always required', note: 'Proof of shipment and ownership' },
                { doc: 'Packing List', req: 'Always required', note: 'Weight, quantity, dimensions breakdown' },
                { doc: 'Certificate of Origin (Form D)', req: 'For ATIGA rates', note: 'Unlocks 0% preferential tariff in ASEAN' },
                { doc: 'Import Permit', req: 'Conditional', note: 'Required for regulated/restricted goods' },
                { doc: 'Phytosanitary Certificate', req: 'For plants/food', note: 'Required for all agricultural products' },
                { doc: 'Health Certificate', req: 'For food/chemicals', note: 'Issued by relevant national authority' },
                { doc: 'Customs Export Declaration', req: 'Always required', note: 'Filed with customs at departure' },
              ].map(({ doc, req, note }) => (
                <div key={doc} className="flex items-start gap-3 rounded-xl border border-primary/5 bg-primary/2 p-3">
                  <div className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${req === 'Always required' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{req}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{doc}</p>
                    <p className="text-xs text-slate-500">{note}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-blue-50 p-3 dark:bg-blue-900/20">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300"><strong>Tip:</strong> Use the Checklist feature to get a complete, product-specific document list for your destination country.</p>
            </div>
          </div>
        </section>

        {/* CO Issuing Authorities Table */}
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Certificate of Origin Issuing Authorities</h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm dark:bg-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="px-5 py-3 text-left font-bold">Country</th>
                  <th className="px-5 py-3 text-left font-bold">CO Issuing Authority</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['🇧🇳 Brunei', 'Ministry of Foreign Affairs and Trade'],
                  ['🇰🇭 Cambodia', 'Ministry of Commerce'],
                  ['🇮🇩 Indonesia', 'Ministry of Trade (Directorate General of Foreign Trade)'],
                  ['🇱🇦 Laos', 'Ministry of Commerce (Directorate of Import and Export)'],
                  ['🇲🇾 Malaysia', 'MITI (Trade Services Division)'],
                  ['🇲🇲 Myanmar', 'Ministry of Commerce (Directorate of Trade)'],
                  ['🇵🇭 Philippines', 'Bureau of Customs (Export Coordination Division)'],
                  ['🇸🇬 Singapore', 'Singapore Customs (Documentation Specialist Branch)'],
                  ['🇹🇭 Thailand', 'Ministry of Commerce (Department of Foreign Trade)'],
                  ['🇻🇳 Vietnam', 'Ministry of International Trade'],
                ].map(([country, authority], i) => (
                  <tr key={country} className={i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-primary/5 dark:bg-slate-700/50'}>
                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{country}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{authority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-primary/10 bg-emerald-50 px-5 py-3 dark:bg-emerald-900/20">
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">✅ Self-certification is accepted by ALL ASEAN member countries.</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
