import { useState } from 'react';
import { Compass, Languages, History, BadgeCheck, ArrowRight, FileText, Copy, Share2, FileDown, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { translateLetter } from '../lib/api';

const COUNTRIES = ['Indonesia', 'Thailand', 'Vietnam', 'Malaysia', 'Philippines'];

export default function Translation() {
  const [product, setProduct] = useState('');
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [senderName, setSenderName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [englishLetter, setEnglishLetter] = useState('');
  const [translatedLetter, setTranslatedLetter] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);

  const canSubmit = product.trim() && senderName.trim() && companyName.trim();

  const handleGenerate = async () => {
    if (!canSubmit || loading) return;
    setLoading(true); setError(''); setGenerated(false);
    try {
      const data = await translateLetter(product, country, senderName, companyName);
      setEnglishLetter(data.english_letter); setTranslatedLetter(data.translated_letter); setTargetLanguage(data.target_language); setGenerated(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate letter.');
    } finally { setLoading(false); }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#FAFAFA] font-display text-slate-900 pb-[80px]">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-solid border-primary/10 bg-white px-6 py-3 md:px-10">
        <Link to="/" className="flex items-center gap-4 text-primary">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white"><Compass className="h-5 w-5" /></div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-slate-900">ASEAN Trade Compass</h2>
        </Link>
        <div className="flex flex-1 items-center justify-end gap-4 md:gap-8">
          <nav className="hidden items-center gap-9 md:flex">
            <Link to="/" className="text-sm font-medium text-slate-700 transition-colors hover:text-primary">Dashboard</Link>
            <Link to="/translation" className="border-b-2 border-primary text-sm font-bold text-primary">Translations</Link>
          </nav>
          <div className="flex gap-2">
            <button className="flex h-10 cursor-pointer items-center justify-center rounded-lg bg-primary/10 px-3 text-primary transition-colors hover:bg-primary/20"><Languages className="h-5 w-5" /></button>
            <button className="flex h-10 cursor-pointer items-center justify-center rounded-lg bg-primary/10 px-3 text-primary transition-colors hover:bg-primary/20"><History className="h-5 w-5" /></button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-10">
        {!generated && (
          <div>
            <div className="mb-8">
              <div className="mb-1 flex items-center gap-2"><span className="text-sm font-semibold tracking-wider text-primary uppercase">Document Translation</span><BadgeCheck className="h-4 w-4 text-primary" /></div>
              <h1 className="text-4xl font-bold leading-tight text-slate-900">Draft & Translate Letter</h1>
              <p className="mt-2 text-lg text-slate-500">Fill in the details to generate a formal business letter and translate it.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                { label: 'Product', value: product, onChange: setProduct, placeholder: 'e.g. pepper' },
                { label: 'Your Name', value: senderName, onChange: setSenderName, placeholder: 'e.g. Ahmad' },
                { label: 'Company Name', value: companyName, onChange: setCompanyName, placeholder: 'e.g. Borneo Spice Co.' },
              ].map(({ label, value, onChange, placeholder }) => (
                <div key={label} className="flex flex-col gap-2">
                  <label className="text-sm font-bold tracking-wider text-primary/60 uppercase">{label}</label>
                  <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={loading}
                    className="h-14 rounded-2xl border-2 border-primary/10 bg-white px-5 text-lg font-medium shadow-sm placeholder:text-slate-400 focus:border-accent focus:ring-0" />
                </div>
              ))}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold tracking-wider text-primary/60 uppercase">Destination Country</label>
                <select value={country} onChange={e => setCountry(e.target.value)} disabled={loading}
                  className="h-14 rounded-2xl border-2 border-primary/10 bg-white px-5 text-lg font-medium shadow-sm focus:border-accent focus:ring-0">
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <button type="button" onClick={handleGenerate} disabled={loading || !canSubmit}
              className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-primary text-lg font-bold text-white shadow-lg transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50">
              {loading ? <><Loader2 className="h-6 w-6 animate-spin" /> Generating & Translating...</> : <>Generate & Translate <ArrowRight className="h-5 w-5" /></>}
            </button>
            {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-center text-red-700">{error}</div>}
          </div>
        )}

        {generated && (
          <>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="mb-1 flex items-center gap-2"><span className="text-sm font-semibold tracking-wider text-primary uppercase">Document Translation</span><BadgeCheck className="h-4 w-4 text-primary" /></div>
                <h1 className="text-4xl font-bold leading-tight text-slate-900">Translation Letter Panel</h1>
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-lg text-slate-600">English</p>
                  <ArrowRight className="h-5 w-5 text-accent" />
                  <p className="text-lg font-semibold text-slate-600">{targetLanguage}</p>
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end">
                <p className="text-sm text-slate-500">Sender: <span className="font-medium text-slate-700">{senderName}</span></p>
                <p className="text-sm text-slate-500">Company: <span className="font-medium text-slate-700">{companyName}</span></p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="flex items-center gap-2 text-xl font-bold text-primary"><FileText className="h-6 w-6" />Original (English)</h3>
                  <span className="rounded bg-slate-200 px-2 py-1 text-xs font-bold text-slate-600">SOURCE</span>
                </div>
                <div className="min-h-[400px] rounded-xl border-2 border-primary/10 bg-white p-8 shadow-sm">
                  <div className="prose prose-slate max-w-none text-lg leading-relaxed text-slate-800 whitespace-pre-wrap">{englishLetter}</div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="flex items-center gap-2 text-xl font-bold text-accent"><Languages className="h-6 w-6" />{targetLanguage}</h3>
                  <span className="rounded bg-accent/10 px-2 py-1 text-xs font-bold text-accent">TRANSLATED</span>
                </div>
                <div className="min-h-[400px] rounded-xl border-2 border-accent/20 bg-primary/5 p-8 shadow-sm">
                  <div className="prose prose-slate max-w-none text-lg leading-relaxed text-slate-800 whitespace-pre-wrap">{translatedLetter}</div>
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-4 rounded-xl border border-primary/10 bg-white p-6 shadow-lg md:justify-end">
              <button onClick={() => navigator.clipboard.writeText(englishLetter)} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-6 py-3 font-bold text-slate-700 transition-all hover:bg-slate-200"><Copy className="h-5 w-5" /> Copy English</button>
              <button onClick={() => navigator.clipboard.writeText(translatedLetter)} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-6 py-3 font-bold text-slate-700 transition-all hover:bg-slate-200"><Share2 className="h-5 w-5" /> Copy Translation</button>
              <button onClick={() => { setGenerated(false); setProduct(''); setSenderName(''); setCompanyName(''); }} className="flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-bold text-white shadow-md transition-all hover:bg-primary/90"><FileDown className="h-5 w-5" /> New Letter</button>
            </div>

            <div className="mt-8 border-t border-primary/5 pt-6 text-center md:text-left">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:gap-8">
                <p className="text-sm text-slate-500"><span className="font-bold">Last modified:</span> Just now by AI Trade Engine</p>
                <div className="flex items-center justify-center gap-4 text-xs font-medium tracking-widest text-slate-400 uppercase md:justify-start">
                  <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> Secured Translation</span>
                  <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Compliance Checked</span>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
