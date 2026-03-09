import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { LangProvider } from './lib/LanguageContext.tsx'
import { ChatHistoryProvider } from './lib/ChatHistoryContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LangProvider>
      <ChatHistoryProvider>
        <App />
      </ChatHistoryProvider>
    </LangProvider>
  </React.StrictMode>,
)
