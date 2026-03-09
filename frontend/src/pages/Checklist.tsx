import { useState } from 'react';
import { Compass, Bell, User, ArrowRightLeft, FileEdit, ArrowRight, BadgeCheck, Loader2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getChecklist } from '../lib/api';

const COUNTRIES = ['Indonesia', 'Thailand', 'Vietnam', 'Malaysia', 'Philippines'];

export default function Checklist() {
  const [product, setProduct] = useState('');
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [steps, setSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-fill country from CountryGuide navigation
  useState(() => {
    const state = location.state as { autoCountry?: string } | null;
    if (state?.autoCountry) setCountry(state.autoCountry);
  });

  // FIXED: handleGenerate now uses onClick directly, not form submit
  const handleGenerate = async () => {
    if (!product.trim() || loading) return;
    setLoading(true);
    setError('');
    setSteps([]);
    setGenerated(false);
    setCheckedSteps(new Set());

    try {
      const data = await getChecklist(product, country);
      // Parse numbered lines from checklist response
      const lines = data.checklist
        .split('\n')
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 2 && /^\d+[\.\)]/.test(l));

      if (lines.length === 0) {
        // fallback: split by newlines if no numbered items found
        const fallback = data.checklist.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 5);
        setSteps(fallback);
      } else {
        setSteps(lines);
      }
      setGenerated(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate checklist. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (idx: number) => {
    setCheckedSteps(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const completedCount = checkedSteps.size;
  const totalSteps = steps.length;
  const progressPct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="relative flex min-h-screen flex-col bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100 pb-[80px]">
      <div className="flex h-full grow flex-col">
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-primary/10 bg-surface-light px-6 py-4 dark:bg-background-dark">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg bg-primary p-2 text-white"><Compass className="h-6 w-6" /></div>
            <h1 className="text-xl font-bold tracking-tight text-primary dark:text-slate-100">ASEAN Trade Compass</h1>
          </Link>
          <div className="flex items-center gap-3">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"><Bell className="h-6 w-6" /></button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90"><User className="h-6 w-6" /></button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl px-4 py-8">
          {!generated && (
            <div className="mb-8">
              <div className="mb-1 flex items-center gap-2 font-semibold text-accent">
                <ArrowRightLeft className="h-4 w-4" />
                <span className="text-sm tracking-wider uppercase">Export Route</span>
              </div>
              <h2 className="mb-4 text-4xl font-extrabold text-primary dark:text-slate-100">Compliance Checklist</h2>
              <p className="text-lg text-slate-500 mb-6">Enter your product and destination to generate a compliance checklist.</p>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold tracking-wider text-primary/60 uppercase">Product</label>
                  <input
                    type="text"
                    value={product}
                    onChange={e => setProduct(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                    placeholder="e.g. pepper, palm oil, rubber"
                    disabled={loading}
                    className="h-14 w-full rounded-2xl border-2 border-primary/10 bg-white px-5 text-lg font-medium shadow-sm transition-all placeholder:text-slate-400 focus:border-accent focus:ring-0 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold tracking-wider text-primary/60 uppercase">Destination Country</label>
                  <select
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    disabled={loading}
                    className="h-14 w-full rounded-2xl border-2 border-primary/10 bg-white px-5 text-lg font-medium shadow-sm transition-all focus:border-accent focus:ring-0 dark:border-slate-700 dark:bg-slate-800"
                  >
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {/* FIXED: button with onClick, not inside a form */}
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading || !product.trim()}
                  className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-primary px-8 text-lg font-bold text-white shadow-lg transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
                >
                  {loading ? <><Loader2 className="h-6 w-6 animate-spin" /> Generating...</> : <>Generate Checklist <ArrowRight className="h-5 w-5" /></>}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-center text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {error}
              <button onClick={() => { setError(''); setGenerated(false); }} className="ml-4 underline text-sm">Try Again</button>
            </div>
          )}

          {generated && steps.length > 0 && (
            <>
              <div className="mb-8">
                <div className="mb-1 flex items-center gap-2 font-semibold text-accent">
                  <ArrowRightLeft className="h-4 w-4" />
                  <span className="text-sm tracking-wider uppercase">Export Route</span>
                </div>
                <h2 className="mb-2 text-4xl font-extrabold text-primary dark:text-slate-100">{product} → {country}</h2>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-500 dark:text-slate-400">{totalSteps} steps required</p>
                  <span className="font-bold text-primary">{progressPct}% Complete</span>
                </div>
                <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-primary/10">
                  <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
                <button onClick={() => { setGenerated(false); setProduct(''); setCheckedSteps(new Set()); }} className="mt-4 text-sm text-primary underline">
                  ← Generate new checklist
                </button>
              </div>

              <div className="mb-10 space-y-4">
                {steps.map((step, idx) => {
                  const isChecked = checkedSteps.has(idx);
                  return (
                    <div key={idx} className={`group flex gap-4 rounded-xl border p-5 shadow-sm transition-all cursor-pointer ${isChecked ? 'border-primary/10 bg-surface-light opacity-60 dark:bg-slate-800/50' : 'border-primary/20 bg-white dark:bg-slate-800'}`} onClick={() => toggleStep(idx)}>
                      <div className="pt-1 shrink-0">
                        <input checked={isChecked} onChange={() => toggleStep(idx)} className="h-6 w-6 cursor-pointer rounded border-slate-300 text-primary focus:ring-primary" type="checkbox" onClick={e => e.stopPropagation()} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-base font-medium leading-relaxed ${isChecked ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>{step}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="sticky bottom-8 flex justify-center">
                <button onClick={() => navigate('/translation')} className="group flex w-full max-w-md items-center justify-center gap-3 rounded-xl bg-primary px-10 py-4 font-bold text-white shadow-2xl transition-all hover:scale-[1.02] hover:bg-primary/90 active:scale-95">
                  <FileEdit className="h-6 w-6" />
                  <span className="text-lg">Draft Inquiry Letter</span>
                  <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </>
          )}
        </main>

        <footer className="mt-auto border-t border-primary/10 bg-primary/5 px-6 py-12 dark:bg-background-dark/50">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center gap-6">
              <div className="flex items-center gap-1 font-bold text-primary"><BadgeCheck className="h-5 w-5" /><span>ATIGA Compliant</span></div>
            </div>
            <p className="text-sm text-slate-500">© 2024 ASEAN Trade Compass.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
