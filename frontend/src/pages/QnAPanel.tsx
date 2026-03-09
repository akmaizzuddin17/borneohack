import { useState, useRef, useEffect } from 'react';
import { Compass, History, User, Bot, FileText, ChevronDown, Send, Paperclip, Globe, Loader2, X, CheckCircle, Clock, MessageSquare, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { queryTrade, uploadPdf } from '../lib/api';
import { useLang } from '../lib/LanguageContext';
import { useChatHistory, ChatMessage } from '../lib/ChatHistoryContext';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function QnAPanel() {
  const { t } = useLang();
  const { sessions, currentMessages, setCurrentMessages, saveSession, loadSession, clearCurrent } = useChatHistory();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [translateMode, setTranslateMode] = useState(false);
  const [translateLang, setTranslateLang] = useState('id');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [uploadMsg, setUploadMsg] = useState('');
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [showTranslatePanel, setShowTranslatePanel] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const autoQueryFired = useRef(false);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [currentMessages]);

  useEffect(() => {
    const state = location.state as { autoQuery?: string } | null;
    if (state?.autoQuery && !autoQueryFired.current) {
      autoQueryFired.current = true;
      handleSend(state.autoQuery);
      window.history.replaceState({}, '');
    }
  }, []);

  const handleSend = async (questionOverride?: string) => {
    const question = (questionOverride ?? input).trim();
    if (!question || loading) return;
    setInput('');
    setError('');

    let finalQuestion = question;
    if (translateMode) {
      const langNames: Record<string, string> = { id: 'Indonesian (Bahasa Indonesia)', th: 'Thai', vi: 'Vietnamese', ms: 'Malay (Bahasa Melayu)', tl: 'Filipino (Tagalog)' };
      finalQuestion = `${question}\n\nPlease also provide a translation of your answer in ${langNames[translateLang] ?? translateLang}.`;
    }

    const newMessages: ChatMessage[] = [...currentMessages, { role: 'user', content: question }];
    setCurrentMessages(newMessages);
    setLoading(true);
    try {
      const data = await queryTrade(finalQuestion);
      const updated: ChatMessage[] = [...newMessages, { role: 'assistant', content: data.answer, sources: data.sources }];
      setCurrentMessages(updated);
      saveSession(updated);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get answer. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) { setUploadMsg('Only PDF files are supported.'); setUploadStatus('error'); return; }
    setUploadStatus('uploading'); setUploadMsg(`Uploading ${file.name}...`);
    try {
      const result = await uploadPdf(file);
      setUploadStatus('done');
      setUploadMsg(`"${file.name}" uploaded! ${result.stats?.total_chunks ?? ''} chunks added.`);
      const updated: ChatMessage[] = [...currentMessages, { role: 'assistant', content: `I've successfully loaded **"${file.name}"** into my knowledge base. You can now ask me questions about this document!`, sources: [] }];
      setCurrentMessages(updated);
    } catch (err: any) {
      setUploadStatus('error'); setUploadMsg(err.response?.data?.detail || 'Upload failed.');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const LANGS = [
    { code: 'id', label: '🇮🇩 Indonesian' }, { code: 'ms', label: '🇲🇾 Malay' },
    { code: 'th', label: '🇹🇭 Thai' }, { code: 'vi', label: '🇻🇳 Vietnamese' }, { code: 'tl', label: '🇵🇭 Filipino' },
  ];

  const SUGGESTIONS = [
    'How do I sell pepper to Indonesia?', 'What are the import duties for Thailand?',
    'Vietnam agricultural import rules', 'How do I get ASEAN Form D certificate?',
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white pb-[72px] font-display text-slate-900">

      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowHistory(false)} />
          <div className="relative z-10 flex w-80 flex-col bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-2 font-bold text-primary"><Clock className="h-5 w-5" /> Chat History</div>
              <button onClick={() => setShowHistory(false)}><X className="h-5 w-5 text-slate-400 hover:text-slate-600" /></button>
            </div>
            <div className="flex flex-col gap-1 overflow-y-auto p-3 flex-1">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                  <MessageSquare className="mb-3 h-10 w-10 opacity-30" />
                  <p className="text-sm font-medium">No chat history yet</p>
                  <p className="text-xs mt-1">Your conversations will appear here</p>
                </div>
              ) : sessions.map(s => (
                <button key={s.id} onClick={() => { loadSession(s.id); setShowHistory(false); }}
                  className="rounded-xl border border-transparent px-4 py-3 text-left hover:border-primary/20 hover:bg-primary/5 transition-colors">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">{s.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{s.date} · {s.messages.length} messages</p>
                </button>
              ))}
            </div>
            <div className="border-t border-slate-200 p-3">
              <button onClick={() => { clearCurrent(); setShowHistory(false); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/20 transition-colors">
                <Plus className="h-4 w-4" /> New Conversation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Panel */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={() => setShowProfile(false)}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 mt-16 mr-4 w-72 rounded-2xl bg-white shadow-2xl border border-slate-200 dark:bg-slate-900" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white text-xl font-bold">T</div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Trader</p>
                  <p className="text-xs text-slate-500">Borneo Export Vendor</p>
                </div>
              </div>
            </div>
            <div className="p-3 space-y-1">
              {[
                { label: 'Chat History', icon: '🕐', action: () => { setShowProfile(false); setShowHistory(true); } },
                { label: 'My Saved Checklists', icon: '📋', action: () => setShowProfile(false) },
                { label: 'My Documents', icon: '📁', action: () => setShowProfile(false) },
                { label: 'Settings', icon: '⚙️', action: () => setShowProfile(false) },
              ].map(item => (
                <button key={item.label} onClick={item.action} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors">
                  <span>{item.icon}</span> {item.label}
                </button>
              ))}
            </div>
            <div className="border-t border-slate-100 p-3">
              <div className="rounded-xl bg-primary/5 p-3 text-center">
                <p className="text-xs text-primary font-bold">ASEAN Trade Compass v2.0</p>
                <p className="text-xs text-slate-500 mt-0.5">Powered by LM Studio + RAG</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#1B433219] bg-white px-6 md:px-10">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white"><Compass className="h-6 w-6" /></div>
          <div className="flex flex-col">
            <h1 className="text-[18px] font-bold text-primary">ASEAN Trade Compass</h1>
            <p className="text-[11px] font-medium text-[#1B433299]">Official Trade Advisory Portal</p>
          </div>
        </Link>
        <div className="flex gap-2">
          <button onClick={() => { setShowHistory(true); setShowProfile(false); }}
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${showHistory ? 'bg-primary text-white' : 'bg-[#F1F5F9] text-primary hover:bg-primary/20'}`}
            title="Chat History">
            <History className="h-5 w-5" />
          </button>
          <button onClick={() => { setShowProfile(true); setShowHistory(false); }}
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${showProfile ? 'bg-primary text-white' : 'bg-[#F1F5F9] text-primary hover:bg-primary/20'}`}
            title="Profile">
            <User className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-[80px] lg:px-[160px]">
        <div className="mx-auto flex w-full max-w-[900px] flex-col items-center gap-4">
          <div className="flex w-full flex-col gap-1 text-center mb-2">
            <h2 className="text-[36px] font-extrabold text-primary">{t.qnaTitle}</h2>
            <p className="text-[16px] font-medium text-[#1B4332B3]">{t.qnaSubtitle}</p>
          </div>

          {currentMessages.length === 0 && !loading && (
            <div className="mt-6 flex flex-col items-center justify-center text-center w-full">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#1B433219]"><Bot className="h-10 w-10 text-primary" /></div>
              <h3 className="mb-2 text-lg font-bold text-primary">Ask me anything about ASEAN trade</h3>
              <p className="max-w-md text-sm text-[#1B4332B3]">Duties, regulations, Form D certificates, documentation, country procedures — I know it all.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map(q => (
                  <button key={q} onClick={() => handleSend(q)} className="rounded-full border border-[#1B433219] bg-[#1B43320A] px-4 py-2 text-sm font-medium text-primary hover:bg-[#1B433219] transition-colors">{q}</button>
                ))}
              </div>
            </div>
          )}

          {currentMessages.map((msg, i) => msg.role === 'user' ? (
            <div key={i} className="flex w-full items-end justify-end gap-3">
              <div className="flex flex-col items-end gap-1">
                <p className="text-[11px] font-semibold tracking-[1.5px] text-[#1B433299] uppercase">You</p>
                <div className="rounded-b-2xl rounded-tl-2xl rounded-tr-none bg-primary px-5 py-3.5 text-white max-w-[75%]">
                  <p className="text-[16px] font-medium leading-relaxed">{msg.content}</p>
                </div>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-[13px] font-bold text-white">U</div>
            </div>
          ) : (
            <div key={i} className="flex w-full items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white mt-1"><Bot className="h-4 w-4" /></div>
              <div className="flex w-full flex-col items-start gap-2 min-w-0">
                <p className="text-[11px] font-semibold tracking-[1.5px] text-[#1B433299] uppercase">Trade Assistant</p>
                <div className="flex w-full flex-col gap-3 rounded-b-2xl rounded-tr-2xl rounded-tl-none border border-[#1B433219] bg-white px-5 py-4 shadow-sm">
                  <MarkdownRenderer content={msg.content} />
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-1 border-t border-slate-100 pt-3">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {msg.sources.slice(0, 3).map((s, j) => (
                          <div key={j} className="flex items-center gap-1.5 rounded-full border border-[#1B433219] bg-[#F1F5F9] px-3 py-1">
                            <FileText className="h-3.5 w-3.5 text-primary" />
                            <span className="text-[11px] font-bold text-primary">{s.source?.split(/[/\\]/).pop()} · p.{s.page}</span>
                          </div>
                        ))}
                      </div>
                      <details className="group cursor-pointer">
                        <summary className="flex list-none items-center gap-1.5 text-xs font-bold text-primary hover:text-accent">
                          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                          ALL SOURCES ({msg.sources.length})
                        </summary>
                        <div className="mt-2 space-y-1 rounded-lg bg-[#1B43320A] p-3 text-xs text-slate-700">
                          {msg.sources.map((s, j) => <p key={j}>• {s.source?.split(/[/\\]/).pop()} — Page {s.page} ({s.country})</p>)}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex w-full items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white mt-1"><Bot className="h-4 w-4" /></div>
              <div className="flex flex-col items-start gap-1">
                <p className="text-[11px] font-semibold tracking-[1.5px] text-[#1B433299] uppercase">Trade Assistant</p>
                <div className="rounded-b-2xl rounded-tr-2xl rounded-tl-none border border-[#1B433219] bg-white px-5 py-4 shadow-sm">
                  <div className="flex items-center gap-3"><Loader2 className="h-5 w-5 animate-spin text-primary" /><span className="text-[16px] font-medium text-slate-700">Researching regulations...</span></div>
                </div>
              </div>
            </div>
          )}

          {error && <div className="w-full rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-center text-red-700 text-sm">{error}</div>}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="flex shrink-0 flex-col items-center bg-[#F9F5F0CC] px-4 pb-4 pt-3 md:px-[80px] lg:px-[160px]">
        <div className="flex w-full max-w-[900px] flex-col gap-2">

          {showUploadPanel && (
            <div className="rounded-2xl border-2 border-primary/20 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-primary flex items-center gap-2 text-sm"><Paperclip className="h-4 w-4" /> Attach PDF Document</p>
                <button onClick={() => { setShowUploadPanel(false); setUploadStatus('idle'); setUploadMsg(''); }}><X className="h-4 w-4 text-slate-400 hover:text-slate-600" /></button>
              </div>
              <p className="text-xs text-slate-500 mb-3">Upload a trade regulation PDF — I'll add it to my knowledge base.</p>
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" id="pdf-upload" />
              <label htmlFor="pdf-upload" className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors">
                {uploadStatus === 'uploading' ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</> : <><Paperclip className="h-4 w-4" /> Click to select PDF</>}
              </label>
              {uploadMsg && <p className={`mt-2 text-xs font-medium ${uploadStatus === 'done' ? 'text-green-600' : uploadStatus === 'error' ? 'text-red-600' : 'text-slate-500'}`}>{uploadStatus === 'done' && <CheckCircle className="inline h-3.5 w-3.5 mr-1" />}{uploadMsg}</p>}
            </div>
          )}

          {showTranslatePanel && (
            <div className="rounded-2xl border-2 border-primary/20 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-primary flex items-center gap-2 text-sm"><Globe className="h-4 w-4" /> Translate Responses</p>
                <button onClick={() => setShowTranslatePanel(false)}><X className="h-4 w-4 text-slate-400" /></button>
              </div>
              <p className="text-xs text-slate-500 mb-3">AI will reply in English AND your chosen language.</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => setTranslateLang(l.code)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${translateLang === l.code ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
                    {l.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setTranslateMode(!translateMode)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold text-xs transition-colors ${translateMode ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                {translateMode ? <><CheckCircle className="h-4 w-4" /> Translation ON — Click to turn OFF</> : '▶ Enable Translation'}
              </button>
            </div>
          )}

          <div className="relative flex w-full items-center rounded-2xl border-2 border-[#1B433233] bg-white shadow-[0_4px_20px_#00000012]">
            <input
              className="h-[60px] w-full rounded-2xl bg-transparent pl-5 pr-[64px] text-[16px] text-slate-700 placeholder:text-slate-400 focus:outline-none"
              placeholder={t.qnaPlaceholder}
              type="text" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              disabled={loading}
            />
            <button onClick={() => handleSend()} disabled={loading || !input.trim()}
              className="absolute right-[10px] flex h-[44px] w-[44px] items-center justify-center rounded-xl bg-primary text-white hover:bg-accent disabled:opacity-50 transition-colors">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>

          <div className="flex justify-center gap-3">
            <button onClick={() => { setShowUploadPanel(!showUploadPanel); setShowTranslatePanel(false); }} disabled={loading}
              className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors ${showUploadPanel ? 'border-primary bg-primary text-white' : 'border-[#1B433233] text-[#1B433299] hover:border-primary hover:text-primary'}`}>
              <Paperclip className="h-3.5 w-3.5" /> {t.attachDoc}
            </button>
            <button onClick={() => { setShowTranslatePanel(!showTranslatePanel); setShowUploadPanel(false); }} disabled={loading}
              className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors ${(showTranslatePanel || translateMode) ? 'border-primary bg-primary text-white' : 'border-[#1B433233] text-[#1B433299] hover:border-primary hover:text-primary'}`}>
              <Globe className="h-3.5 w-3.5" /> {translateMode ? `${t.translate}: ON` : t.translate}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
