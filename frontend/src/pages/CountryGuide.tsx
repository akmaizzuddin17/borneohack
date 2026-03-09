import { useState } from 'react';
import { Compass, MapPin, FileText, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const COUNTRIES = [
  {
    code: 'ID', flag: '🇮🇩', name: 'Indonesia',
    color: 'border-red-300 bg-red-50',
    badgeColor: 'bg-red-600 text-white',
    registration: ['Register with Ministry of Trade (Kementerian Perdagangan)', 'Obtain NIK — Customs Identification Number (Nomor Identitas Kepabeanan)', 'Obtain API — Importer Identification Number (Angka Pengenal Import)', 'Get NPWP — Taxpayer Identification Number'],
    licenseTypes: ['API-U: General Import License', 'API-P: Producer Import License', 'API-T: Limited/Industry-specific License'],
    documents: ['Commercial Invoice (signed by manufacturer)', 'Bill of Lading (3 originals + 4 copies)', 'Certificate of Insurance', 'Packing List', 'Import Permit', 'Customs Import Declaration'],
    platform: 'INATRADE — inatrade.kemdag.go.id',
    formD: 'Ministry of Trade — Directorate General of Foreign Trade',
    tariff: 'MFN 5% / ATIGA 0% for most agricultural goods',
    tip: 'Indonesia requires API license for ALL imports. Without it, goods will be held at customs.',
  },
  {
    code: 'TH', flag: '🇹🇭', name: 'Thailand',
    color: 'border-blue-300 bg-blue-50',
    badgeColor: 'bg-blue-700 text-white',
    registration: ['Obtain a "Digital Certificate" for e-Customs system access', 'Register on Thailand e-Customs system (e-Customs.customs.go.th)', 'Check if goods are "Green Line" (low risk) or "Red Line" (extra docs needed)'],
    licenseTypes: ['Automatic for most goods', 'Non-automatic for restricted items (weapons, chemicals, food with health cert)'],
    documents: ['Bill of Lading or Air Waybill', 'Commercial Invoice', 'Packing List', 'Import License (if required)', 'Certificate of Origin (Form D for ATIGA)', 'Technical standards certificate (for electronics)'],
    platform: 'Thailand e-Customs — e-Customs.customs.go.th',
    formD: 'Ministry of Commerce — Department of Foreign Trade (DFT)',
    tariff: 'MFN 30% spices / 0% ATIGA with Form D',
    tip: '"Red Line" shipments require extra inspection. Declare accurately to avoid delays.',
  },
  {
    code: 'VN', flag: '🇻🇳', name: 'Vietnam',
    color: 'border-red-300 bg-red-50',
    badgeColor: 'bg-red-700 text-white',
    registration: ['Register with Department of Planning and Investment (DPI)', 'Obtain Investment Certificate (foreign investors)', 'Obtain import business code registration certificate', 'Register business with local tax authority'],
    licenseTypes: ['Automatic for standard goods', 'Non-automatic for restricted items (requires permit from relevant ministry)'],
    documents: ['Bill of Lading', 'Cargo Release Order', 'Commercial Invoice', 'Customs Import Declaration Form', 'Inspection Report', 'Packing List', 'Technical standard / Health certificate'],
    platform: 'Vietnam Customs Portal — customs.gov.vn',
    formD: 'Ministry of Industry and Trade (MOIT) — Import-Export Management Department',
    tariff: 'MFN 5% pepper / 0% ATIGA. Processed foods 15–30% MFN / 5–10% ATIGA',
    tip: 'Submit import dossier at least 30 days before shipment arrives for agricultural products.',
  },
  {
    code: 'MY', flag: '🇲🇾', name: 'Malaysia',
    color: 'border-blue-300 bg-blue-50',
    badgeColor: 'bg-blue-800 text-white',
    registration: ['Register with Companies Commission of Malaysia (SSM)', 'Apply for import license from MITI (if goods are regulated)', 'Register with Royal Malaysian Customs Department (RMCD)'],
    licenseTypes: ['Most goods: no license required', 'Regulated goods: MITI import license required'],
    documents: ['Customs Import/Export Declaration (K1/K2)', 'Commercial Invoice', 'Bill of Lading', 'Packing List', 'Certificate of Origin'],
    platform: 'MyTRADELINK / eTRADE — dagangnet.com',
    formD: 'MITI — Trade Services Division',
    tariff: '0% for most ASEAN goods under ATIGA',
    tip: 'Malaysia uses eTRADE (DagangNet) for all customs declarations. Register early.',
  },
  {
    code: 'PH', flag: '🇵🇭', name: 'Philippines',
    color: 'border-yellow-300 bg-yellow-50',
    badgeColor: 'bg-yellow-700 text-white',
    registration: ['Obtain Import Clearance Certificate (ICC) from Bureau of Internal Revenue', 'Register with Bureau of Customs (BOC) — Client Profile Registration System (CPRS)', 'ICC valid 3 years; CPRS renewed annually (cost: PHP 1,000)'],
    licenseTypes: ['Automatic for standard goods', 'Non-automatic: requires permit from relevant agency (e.g. DA for agriculture)'],
    documents: ['Packing List', 'Commercial Invoice', 'Bill of Lading', 'Import Permit', 'Customs Import Declaration', 'Certificate of Origin'],
    platform: 'Philippines Customs — customs.gov.ph (CPRS)',
    formD: 'Bureau of Customs — Export Coordination Division',
    tariff: 'Varies by product; 0% ATIGA for qualified goods with Form D',
    tip: 'CPRS must be renewed annually. Failure to renew will block all import activities.',
  },
  {
    code: 'SG', flag: '🇸🇬', name: 'Singapore',
    color: 'border-red-300 bg-red-50',
    badgeColor: 'bg-red-800 text-white',
    registration: ['Register with ACRA to get Unique Entity Number (UEN)', 'Activate Customs Account via UEN', 'Set up Inter-Bank GIRO (IBG) account for GST/duty payments', 'Register as declaring agent or appoint one'],
    licenseTypes: ['Most goods: no license required', 'Controlled goods: licenses from relevant authority (HSA, AVA, etc.)'],
    documents: ['Approved Customs Permit (printed copy)', 'Commercial Invoice', 'Packing List', 'Bill of Lading or Air Waybill', 'Container number + shipper seal number'],
    platform: 'TradeNet — tradenet.gov.sg',
    formD: 'Singapore Customs — Documentation Specialist Branch',
    tariff: 'Generally 0% import duty; GST applies',
    tip: 'Singapore\'s TradeNet is fully digital and very fast. Permits typically approved same day.',
  },
];

export default function CountryGuide() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const navigate = useNavigate();

  const toggle = (code: string) => setExpanded(prev => prev === code ? null : code);

  return (
    <div className="relative flex min-h-screen flex-col bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100 pb-[80px]">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-primary/10 bg-white px-6 py-4 dark:bg-background-dark">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg bg-primary p-2 text-white"><Compass className="h-6 w-6" /></div>
          <h1 className="text-xl font-bold text-primary dark:text-slate-100">ASEAN Trade Compass</h1>
        </Link>
        <div className="flex items-center gap-2 text-sm font-bold text-primary">
          <MapPin className="h-4 w-4" /> Country Import Guides
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-extrabold text-primary dark:text-slate-100 mb-2">Country Import Guides</h2>
          <p className="text-slate-500 text-lg">Step-by-step import procedures for each ASEAN destination country — registration, documents, platforms and Form D authorities.</p>
        </div>

        <div className="space-y-4">
          {COUNTRIES.map(c => (
            <div key={c.code} className={`rounded-2xl border-2 overflow-hidden transition-all ${expanded === c.code ? 'border-primary shadow-lg' : 'border-primary/10 bg-white dark:bg-slate-800'}`}>
              {/* Header row */}
              <button className="flex w-full items-center justify-between px-6 py-5 text-left" onClick={() => toggle(c.code)}>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{c.flag}</span>
                  <div>
                    <p className="text-xl font-extrabold text-primary dark:text-slate-100">{c.name}</p>
                    <p className="text-sm text-slate-500">{c.tariff}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${c.badgeColor}`}>Form D: {c.code}</span>
                  {expanded === c.code ? <ChevronUp className="h-5 w-5 text-primary" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                </div>
              </button>

              {/* Expanded content */}
              {expanded === c.code && (
                <div className="border-t border-primary/10 px-6 pb-6 pt-4 space-y-5 bg-white dark:bg-slate-800">
                  {/* Tip */}
                  <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 dark:bg-amber-900/20">
                    <p className="text-sm text-amber-800 dark:text-amber-300"><strong>💡 Key Tip:</strong> {c.tip}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* Registration */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">📋 Registration Steps</p>
                      <ul className="space-y-1.5">
                        {c.registration.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold mt-0.5">{i + 1}</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Documents */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">📄 Required Documents</p>
                      <ul className="space-y-1.5">
                        {c.documents.map((d, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* License types */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">🔑 License Types</p>
                    <div className="flex flex-wrap gap-2">
                      {c.licenseTypes.map((l, i) => (
                        <span key={i} className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">{l}</span>
                      ))}
                    </div>
                  </div>

                  {/* Platform + Form D */}
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:bg-blue-900/20">
                      <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">💻 Digital Platform</p>
                      <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">{c.platform}</p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:bg-emerald-900/20">
                      <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">📍 Form D Issuing Authority</p>
                      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{c.formD}</p>
                    </div>
                  </div>

                  {/* CTA buttons */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button onClick={() => navigate('/qna', { state: { autoQuery: `What are the import requirements and procedures for ${c.name}?` } })}
                      className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
                      Ask about {c.name} →
                    </button>
                    <button onClick={() => navigate('/checklist', { state: { autoCountry: c.name } })}
                      className="flex items-center gap-2 rounded-xl border border-primary/20 bg-white px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5 transition-colors dark:bg-slate-700">
                      Get Checklist for {c.name}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
