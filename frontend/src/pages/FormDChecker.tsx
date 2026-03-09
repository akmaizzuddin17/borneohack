import { useState } from 'react';
import { Compass, BadgeCheck, ChevronRight, RotateCcw, CheckCircle, XCircle, AlertCircle, Loader2, ChevronDown, MapPin, Lightbulb, ClipboardList, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { checkFormD, FormDResponse } from '../lib/api';

const QUESTIONS = [
  { id: "company_name",           section: "Section 1 – Business Information",   question: "What is your company name?",                                                                           hint: "e.g. Borneo Spice Trading Sdn Bhd" },
  { id: "product_name",           section: "Section 1 – Business Information",   question: "What product are you exporting?",                                                                      hint: "e.g. Black pepper, dried chilli, palm oil" },
  { id: "exporting_country",      section: "Section 1 – Business Information",   question: "Which country are you exporting FROM?",                                                                hint: "e.g. Malaysia, Indonesia, Vietnam" },
  { id: "importing_country",      section: "Section 1 – Business Information",   question: "Which country are you exporting TO?",                                                                  hint: "e.g. Indonesia, Thailand, Philippines" },
  { id: "manufacturing_location", section: "Section 1 – Business Information",   question: "Where is your product manufactured or produced?",                                                      hint: "e.g. Sarawak, Malaysia" },
  { id: "hs_code",                section: "Section 1 – Business Information",   question: "What is the HS Code of your product? (Type 'unknown' if unsure)",                                      hint: "e.g. 0904.11 for unground black pepper" },
  { id: "wholly_obtained",        section: "Section 2 – Product Origin",         question: "Is your product wholly obtained or produced entirely within an ASEAN country? (grown, harvested, or extracted locally with no outside materials?)", hint: "Answer: Yes or No" },
  { id: "asean_raw_materials",    section: "Section 2 – Product Origin",         question: "Are your raw materials sourced from ASEAN countries?",                                                 hint: "Answer: Yes, No, or Partially" },
  { id: "non_asean_materials",    section: "Section 2 – Product Origin",         question: "Do you use any materials imported from outside ASEAN? If yes, describe briefly.",                      hint: "e.g. No / Yes – packaging from China" },
  { id: "material_sources",       section: "Section 3 – Raw Materials",          question: "Where are your main raw materials sourced from? List the countries.",                                   hint: "e.g. Pepper from Sarawak (Malaysia), packaging from China" },
  { id: "asean_material_pct",     section: "Section 3 – Raw Materials",          question: "Approximately what percentage of your raw materials (by cost or value) come from ASEAN countries?",   hint: "Enter a number, e.g. 80" },
  { id: "imported_material_pct",  section: "Section 3 – Raw Materials",          question: "Approximately what percentage of your raw materials come from OUTSIDE ASEAN?",                         hint: "Enter a number, e.g. 20. Should add up to 100% with previous answer." },
  { id: "manufacturing_country",  section: "Section 4 – Manufacturing Process",  question: "In which country does your manufacturing or production process take place?",                           hint: "e.g. Malaysia" },
  { id: "production_processes",   section: "Section 4 – Manufacturing Process",  question: "What production processes are performed on your product?",                                             hint: "e.g. Cleaning, drying, grinding, packaging" },
  { id: "final_transformation",   section: "Section 4 – Manufacturing Process",  question: "Where does the final transformation or finishing of your product occur?",                              hint: "e.g. Final drying and packaging in Kuching, Malaysia" },
  { id: "fob_price",              section: "Section 5 – Regional Value Content", question: "What is the FOB (Free On Board) export price of your product per batch or unit?",                     hint: "e.g. USD 500 per 100kg. FOB = price at port before shipping costs." },
  { id: "non_asean_cost",         section: "Section 5 – Regional Value Content", question: "What is the total COST of non-ASEAN imported materials used per batch? Enter 0 if none.",             hint: "e.g. USD 50 for imported packaging from China" },
  { id: "has_production_records", section: "Section 6 – Supporting Documents",   question: "Do you have production records showing where and how your product was made?",                          hint: "Answer: Yes or No" },
  { id: "has_material_invoices",  section: "Section 6 – Supporting Documents",   question: "Do you have invoices or receipts for raw materials showing their country of origin?",                  hint: "Answer: Yes or No" },
  { id: "has_manufacturing_docs", section: "Section 6 – Supporting Documents",   question: "Do you have manufacturing documentation such as a bill of materials or cost breakdown?",               hint: "Answer: Yes or No" },
];

const SECTIONS = [...new Set(QUESTIONS.map(q => q.section))];


// Renders the AI explanation split into visual sections
function ExplanationSections({ explanation }: { explanation: string }) {
  const sections = [
    { marker: '## 🏅 ELIGIBILITY RESULT', icon: '🏅', title: 'Eligibility Result', color: 'border-green-200 bg-green-50 dark:bg-green-900/20', titleColor: 'text-green-800 dark:text-green-300' },
    { marker: '## 📋 EXPLANATION',        icon: '📋', title: 'Explanation',        color: 'border-blue-200 bg-blue-50 dark:bg-blue-900/20',  titleColor: 'text-blue-800 dark:text-blue-300' },
    { marker: '## 📊 COMPLIANCE SUMMARY', icon: '📊', title: 'Compliance Summary', color: 'border-primary/20 bg-primary/5 dark:bg-primary/10',titleColor: 'text-primary dark:text-primary' },
    { marker: '## 💡 RECOMMENDATION',     icon: '💡', title: 'Recommendation',     color: 'border-amber-200 bg-amber-50 dark:bg-amber-900/20',titleColor: 'text-amber-800 dark:text-amber-300' },
    { marker: '## 📍 WHERE TO APPLY',     icon: '📍', title: 'Where to Apply & Submit Documents', color: 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-emerald-400/30', titleColor: 'text-emerald-800 dark:text-emerald-200' },
  ];

  const parsed: { icon: string; title: string; content: string; color: string; titleColor: string }[] = [];

  let remaining = explanation;
  for (let i = 0; i < sections.length; i++) {
    const { marker, icon, title, color, titleColor } = sections[i];
    const idx = remaining.indexOf(marker);
    if (idx === -1) continue;
    const afterMarker = remaining.slice(idx + marker.length);
    // Find where next section starts
    let end = afterMarker.length;
    for (let j = i + 1; j < sections.length; j++) {
      const nextIdx = afterMarker.indexOf(sections[j].marker);
      if (nextIdx !== -1 && nextIdx < end) end = nextIdx;
    }
    const content = afterMarker.slice(0, end).trim();
    parsed.push({ icon, title, content, color, titleColor });
  }

  // If no sections parsed, just show raw text
  if (parsed.length === 0) {
    return (
      <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-slate-800">
        <h4 className="font-bold text-primary dark:text-slate-100 mb-3">Detailed Assessment</h4>
        <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{explanation}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {parsed.map(({ icon, title, content, color, titleColor }) => (
        <div key={title} className={`rounded-2xl border p-5 shadow-sm ${color}`}>
          <h4 className={`font-bold mb-3 flex items-center gap-2 text-base ${titleColor}`}>
            <span className="text-lg">{icon}</span> {title}
          </h4>
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
            {content}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FormDChecker() {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentInput, setCurrentInput] = useState('');
  const [result, setResult] = useState<FormDResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentQ = step >= 0 && step < QUESTIONS.length ? QUESTIONS[step] : null;
  const progress = step >= 0 ? Math.round((step / QUESTIONS.length) * 100) : 0;
  const currentSection = currentQ?.section ?? '';
  const prevSection = step > 0 ? QUESTIONS[step - 1]?.section : '';
  const sectionChanged = currentSection !== prevSection;

  const handleStart = () => { setStep(0); setAnswers({}); setResult(null); setError(''); setCurrentInput(''); };

  const handleNext = async () => {
    if (!currentInput.trim() || !currentQ) return;
    const newAnswers = { ...answers, [currentQ.id]: currentInput.trim() };
    setAnswers(newAnswers);
    setCurrentInput('');

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);  // ← THIS is the fix: always advance to next question
    } else {
      setLoading(true);
      setError('');
      try {
        const data = await checkFormD(newAnswers);
        setResult(data);
        setStep(QUESTIONS.length);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to evaluate. Is the backend running?');
        setStep(QUESTIONS.length - 1);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReset = () => { setStep(-1); setAnswers({}); setCurrentInput(''); setResult(null); setError(''); };

  const verdictConfig = {
    'ELIGIBLE': { icon: <CheckCircle className="h-8 w-8 text-green-600" />, bg: 'bg-green-50 border-green-400', text: 'text-green-800', label: '🏅 ELIGIBLE for Certificate Form D' },
    'NOT ELIGIBLE': { icon: <XCircle className="h-8 w-8 text-red-600" />, bg: 'bg-red-50 border-red-400', text: 'text-red-800', label: '❌ NOT ELIGIBLE for Certificate Form D' },
    'MORE INFORMATION REQUIRED': { icon: <AlertCircle className="h-8 w-8 text-yellow-600" />, bg: 'bg-yellow-50 border-yellow-400', text: 'text-yellow-800', label: '⚠️ MORE INFORMATION REQUIRED' },
  };
  const vc = result ? verdictConfig[result.verdict] ?? verdictConfig['MORE INFORMATION REQUIRED'] : null;

  return (
    <div className="relative flex min-h-screen flex-col bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100 pb-[80px]">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-primary/10 bg-white px-6 py-4 dark:bg-background-dark">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg bg-primary p-2 text-white"><Compass className="h-6 w-6" /></div>
          <h1 className="text-xl font-bold tracking-tight text-primary dark:text-slate-100">ASEAN Trade Compass</h1>
        </Link>
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-bold text-emerald-700">Form D Checker</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-8">

        {/* ── INTRO ── */}
        {step === -1 && (
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center gap-2 text-emerald-700 font-semibold text-sm uppercase tracking-wider">
                <BadgeCheck className="h-4 w-4" /><span>ASEAN Certificate of Origin</span>
              </div>
              <h2 className="text-4xl font-extrabold text-primary dark:text-slate-100 mb-3">Form D Eligibility Checker</h2>
              <p className="text-lg text-slate-500 dark:text-slate-400">Check if your product qualifies for <strong>zero or reduced import duties</strong> when trading within ASEAN under ATIGA.</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[['🛃','Zero Duties','Reduced tariffs for ASEAN buyers'],['🌏','10 Countries','All ASEAN member states'],['⚡','20 Questions','AI-powered assessment']].map(([icon, title, desc]) => (
                <div key={title} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center dark:bg-emerald-900/20">
                  <div className="text-2xl mb-1">{icon}</div>
                  <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">{title}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">{desc}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm dark:bg-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">6 Sections Covered:</h3>
              <div className="grid grid-cols-2 gap-2">
                {SECTIONS.map((s, i) => (
                  <div key={s} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">{i + 1}</span>
                    <span>{s.replace('Section ' + (i+1) + ' – ', '')}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleStart} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-primary/90 active:scale-95">
              Start Eligibility Check <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* ── QUESTIONS ── */}
        {step >= 0 && step < QUESTIONS.length && currentQ && (
          <div className="space-y-5">
            {/* Progress */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
                <span>Question {step + 1} of {QUESTIONS.length}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-primary/10">
                <div className="h-3 rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Section badge */}
            {(step === 0 || sectionChanged) && (
              <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                <p className="text-sm font-bold text-primary">{currentQ.section}</p>
              </div>
            )}

            {/* Previous answers (last 3) */}
            {Object.entries(answers).slice(-3).map(([key, val]) => {
              const q = QUESTIONS.find(q => q.id === key);
              return (
                <div key={key} className="flex items-start gap-3 rounded-xl border border-primary/10 bg-white p-3 shadow-sm dark:bg-slate-800">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 truncate">{q?.question}</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{val}</p>
                  </div>
                </div>
              );
            })}

            {/* Current question */}
            <div className="rounded-2xl border-2 border-primary bg-primary/5 p-5 dark:bg-primary/10">
              <p className="text-lg font-bold text-primary dark:text-slate-100 mb-1">{currentQ.question}</p>
              <p className="text-sm text-primary/60 dark:text-slate-400">{currentQ.hint}</p>
            </div>

            {/* Input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={currentInput}
                onChange={e => setCurrentInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleNext(); } }}
                placeholder="Type your answer here..."
                autoFocus
                className="flex-1 h-14 rounded-2xl border-2 border-primary/10 bg-white px-5 text-lg font-medium shadow-sm placeholder:text-slate-400 focus:border-accent focus:ring-0 dark:border-slate-700 dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={handleNext}
                disabled={!currentInput.trim()}
                className="flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-5 py-3 font-bold text-white shadow-lg transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
              >
                {step === QUESTIONS.length - 1 ? 'Submit' : 'Next'}
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">{error}</div>}
          </div>
        )}

        {/* ── LOADING ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <p className="text-xl font-bold text-primary">Evaluating your eligibility...</p>
            <p className="text-slate-500 text-sm text-center">AI is analysing your answers against official ASEAN Rules of Origin</p>
          </div>
        )}

        {/* ── RESULT ── */}
        {result && vc && !loading && (
          <div className="space-y-5">
            {/* Verdict */}
            <div className={`rounded-2xl border-2 p-6 ${vc.bg}`}>
              <div className="flex items-center gap-3 mb-4">
                {vc.icon}
                <span className={`text-2xl font-extrabold ${vc.text}`}>{vc.label}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.rvc !== null && (
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${result.rvc >= 40 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    RVC: {result.rvc}% {result.rvc >= 40 ? '✅ ≥40%' : '❌ <40%'}
                  </span>
                )}
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${result.is_asean_manufacturer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {result.is_asean_manufacturer ? '✅' : '❌'} ASEAN Manufacturer
                </span>
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${result.is_asean_destination ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {result.is_asean_destination ? '✅' : '❌'} ASEAN Destination
                </span>
                {result.asean_material_pct > 0 && (
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${result.asean_material_pct >= 60 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    ASEAN Materials: {result.asean_material_pct}%
                  </span>
                )}
              </div>
            </div>

            {/* AI Explanation - sectioned */}
            <ExplanationSections explanation={result.explanation} />

            {/* Answers Summary */}
            <details className="rounded-2xl border border-primary/10 bg-white shadow-sm dark:bg-slate-800 overflow-hidden">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 font-bold text-primary dark:text-slate-100 text-sm">
                <span>📋 View Your Full Answers ({QUESTIONS.length} questions)</span>
                <ChevronDown className="h-4 w-4" />
              </summary>
              <div className="px-6 pb-5 space-y-1 border-t border-primary/10 pt-4">
                {SECTIONS.map(section => (
                  <div key={section} className="mb-4">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">{section}</p>
                    {QUESTIONS.filter(q => q.section === section).map(q => (
                      <div key={q.id} className="flex justify-between gap-4 text-sm py-1.5 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-slate-500 dark:text-slate-400 text-xs">{q.question}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0 text-xs">{result.answers[q.id] || '—'}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </details>

            <button onClick={handleReset} className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-primary/20 bg-white px-8 py-4 text-lg font-bold text-primary shadow-sm transition-all hover:bg-primary/5 active:scale-95 dark:bg-slate-800">
              <RotateCcw className="h-5 w-5" /> Check Another Product
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
