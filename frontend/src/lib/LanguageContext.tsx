import { createContext, useContext, useState, ReactNode } from 'react';

export type Lang = 'en' | 'ms' | 'id';

interface Translations {
  greeting: string;
  tagline: string;
  searchPlaceholder: string;
  suggested: string;
  quickTips: string;
  quickActions: string;
  tradeUpdates: string;
  askQuestion: string;
  askDesc: string;
  checklist: string;
  checklistDesc: string;
  draftLetter: string;
  letterDesc: string;
  formD: string;
  formDDesc: string;
  countries: string;
  countriesDesc: string;
  navHome: string;
  navAsk: string;
  navChecklist: string;
  navCountries: string;
  navFormD: string;
  navLetter: string;
  qnaTitle: string;
  qnaSubtitle: string;
  qnaPlaceholder: string;
  attachDoc: string;
  translate: string;
  readUpdate: string;
  search: string;
}

const TRANSLATIONS: Record<Lang, Translations> = {
  en: {
    greeting: 'Good {time}, Trader!',
    tagline: 'Your ASEAN trade journey starts here.',
    searchPlaceholder: 'Type your export query...',
    suggested: 'Suggested:',
    quickTips: 'Quick Trade Tips',
    quickActions: 'Quick Actions',
    tradeUpdates: 'Trade Updates',
    askQuestion: 'Ask a Trade Question',
    askDesc: 'Instant answers on duties, routes, and regulations.',
    checklist: 'Get Compliance Checklist',
    checklistDesc: 'Step-by-step requirements for your product.',
    draftLetter: 'Draft a Business Letter',
    letterDesc: 'Formal export letters in multiple languages.',
    formD: 'Check Form D Eligibility',
    formDDesc: 'Qualify for zero ASEAN import duties.',
    countries: 'Country Import Guides',
    countriesDesc: 'Import procedures for each ASEAN country.',
    navHome: 'Home',
    navAsk: 'Ask',
    navChecklist: 'Checklist',
    navCountries: 'Countries',
    navFormD: 'Form D',
    navLetter: 'Letter',
    qnaTitle: 'Trade Q&A Panel',
    qnaSubtitle: 'Expert AI guidance on cross-border ASEAN regulations',
    qnaPlaceholder: 'Ask about trade routes, tariffs, or documentation...',
    attachDoc: 'ATTACH DOCUMENT',
    translate: 'TRANSLATE',
    readUpdate: 'Read Update',
    search: 'Search',
  },
  ms: {
    greeting: '{time} yang baik, Peniaga!',
    tagline: 'Perjalanan perdagangan ASEAN anda bermula di sini.',
    searchPlaceholder: 'Taip soalan eksport anda...',
    suggested: 'Dicadangkan:',
    quickTips: 'Tips Perdagangan Pantas',
    quickActions: 'Tindakan Pantas',
    tradeUpdates: 'Kemas Kini Perdagangan',
    askQuestion: 'Tanya Soalan Perdagangan',
    askDesc: 'Jawapan segera tentang duti, laluan, dan peraturan.',
    checklist: 'Dapatkan Senarai Semak Pematuhan',
    checklistDesc: 'Keperluan langkah demi langkah untuk produk anda.',
    draftLetter: 'Draf Surat Perniagaan',
    letterDesc: 'Surat eksport rasmi dalam pelbagai bahasa.',
    formD: 'Semak Kelayakan Borang D',
    formDDesc: 'Layak untuk duti import ASEAN sifar.',
    countries: 'Panduan Import Negara',
    countriesDesc: 'Prosedur import untuk setiap negara ASEAN.',
    navHome: 'Utama',
    navAsk: 'Tanya',
    navChecklist: 'Senarai',
    navCountries: 'Negara',
    navFormD: 'Borang D',
    navLetter: 'Surat',
    qnaTitle: 'Panel Soal Jawab Perdagangan',
    qnaSubtitle: 'Panduan AI pakar tentang peraturan merentas sempadan ASEAN',
    qnaPlaceholder: 'Tanya tentang laluan, tarif, atau dokumentasi...',
    attachDoc: 'LAMPIR DOKUMEN',
    translate: 'TERJEMAH',
    readUpdate: 'Baca Kemas Kini',
    search: 'Cari',
  },
  id: {
    greeting: 'Selamat {time}, Pedagang!',
    tagline: 'Perjalanan perdagangan ASEAN Anda dimulai di sini.',
    searchPlaceholder: 'Ketik pertanyaan ekspor Anda...',
    suggested: 'Disarankan:',
    quickTips: 'Tips Perdagangan Cepat',
    quickActions: 'Tindakan Cepat',
    tradeUpdates: 'Pembaruan Perdagangan',
    askQuestion: 'Ajukan Pertanyaan Perdagangan',
    askDesc: 'Jawaban instan tentang bea, rute, dan regulasi.',
    checklist: 'Dapatkan Daftar Periksa',
    checklistDesc: 'Persyaratan langkah demi langkah untuk produk Anda.',
    draftLetter: 'Buat Surat Bisnis',
    letterDesc: 'Surat ekspor formal dalam berbagai bahasa.',
    formD: 'Periksa Kelayakan Formulir D',
    formDDesc: 'Memenuhi syarat untuk bea masuk ASEAN nol.',
    countries: 'Panduan Impor Negara',
    countriesDesc: 'Prosedur impor untuk setiap negara ASEAN.',
    navHome: 'Beranda',
    navAsk: 'Tanya',
    navChecklist: 'Daftar',
    navCountries: 'Negara',
    navFormD: 'Form D',
    navLetter: 'Surat',
    qnaTitle: 'Panel Tanya Jawab Perdagangan',
    qnaSubtitle: 'Panduan AI ahli tentang regulasi lintas batas ASEAN',
    qnaPlaceholder: 'Tanya tentang rute, tarif, atau dokumentasi...',
    attachDoc: 'LAMPIRKAN DOKUMEN',
    translate: 'TERJEMAHKAN',
    readUpdate: 'Baca Pembaruan',
    search: 'Cari',
  },
};

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: () => {},
  t: TRANSLATIONS.en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  return (
    <LangContext.Provider value={{ lang, setLang, t: TRANSLATIONS[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
