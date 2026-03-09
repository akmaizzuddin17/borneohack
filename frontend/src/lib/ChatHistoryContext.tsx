import { createContext, useContext, useState, ReactNode } from 'react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: { source: string; page: string; country: string }[];
}

export interface ChatSession {
  id: string;
  title: string;
  date: string;
  messages: ChatMessage[];
}

interface ChatHistoryContextType {
  sessions: ChatSession[];
  currentMessages: ChatMessage[];
  setCurrentMessages: (msgs: ChatMessage[]) => void;
  saveSession: (messages: ChatMessage[]) => void;
  loadSession: (id: string) => void;
  clearCurrent: () => void;
}

const ChatHistoryContext = createContext<ChatHistoryContextType>({
  sessions: [],
  currentMessages: [],
  setCurrentMessages: () => {},
  saveSession: () => {},
  loadSession: () => {},
  clearCurrent: () => {},
});

export function ChatHistoryProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);

  const saveSession = (messages: ChatMessage[]) => {
    if (messages.length < 2) return;
    const firstUserMsg = messages.find(m => m.role === 'user')?.content ?? 'Chat Session';
    const title = firstUserMsg.length > 50 ? firstUserMsg.slice(0, 50) + '...' : firstUserMsg;
    const session: ChatSession = {
      id: Date.now().toString(),
      title,
      date: new Date().toLocaleString(),
      messages,
    };
    setSessions(prev => [session, ...prev.slice(0, 19)]); // keep last 20
  };

  const loadSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) setCurrentMessages(session.messages);
  };

  const clearCurrent = () => setCurrentMessages([]);

  return (
    <ChatHistoryContext.Provider value={{ sessions, currentMessages, setCurrentMessages, saveSession, loadSession, clearCurrent }}>
      {children}
    </ChatHistoryContext.Provider>
  );
}

export const useChatHistory = () => useContext(ChatHistoryContext);
