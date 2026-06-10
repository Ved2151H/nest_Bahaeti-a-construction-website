import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { Deal, Project, User } from './data';

/** Injected by Vite (`define` in vite.config.ts); empty until you set GEMINI_API_KEY in `.env`. */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';

let geminiClient: GoogleGenAI | null | undefined;
function getGeminiClient(): GoogleGenAI | null {
  if (geminiClient !== undefined) return geminiClient;
  if (!GEMINI_API_KEY) {
    geminiClient = null;
    return null;
  }
  geminiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  return geminiClient;
}

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  deals: Deal[];
  projects: Project[];
  users: User[];
}

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const welcomeWithKey =
  'Hello! I am your PropMax AI assistant. You can ask me questions about your deals, projects, or team performance. For example: "Show me all hot leads" or "What is our total pipeline value?"';

const welcomeNoKey =
  'AI chat needs a Gemini API key. Copy `.env.example` to `.env`, set GEMINI_API_KEY to a key from https://aistudio.google.com/apikey , then restart `npm run dev`.';

export function AIChatDrawer({ isOpen, onClose, deals, projects, users }: AIChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: GEMINI_API_KEY ? welcomeWithKey : welcomeNoKey },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = getGeminiClient();
      if (!ai) {
        setMessages(prev => [
          ...prev,
          {
            role: 'ai',
            content:
              'No API key configured. Add GEMINI_API_KEY to `.env` in the project root and restart the dev server.',
          },
        ]);
        return;
      }

      const context = `
        You are a helpful AI assistant for a real estate CRM called PropMax.
        Here is the current state of the CRM:
        
        Projects: ${JSON.stringify(projects.map(p => ({ name: p.name, location: p.location })))}
        Deals: ${JSON.stringify(deals.map(d => ({ buyer: d.buyerName, status: d.status, amount: d.amount, temp: d.temperature, project: projects.find(p => p.id === d.projectId)?.name })))}
        Users: ${JSON.stringify(users.map(u => ({ name: u.name, role: u.roleId })))}
        
        Answer the user's question based ONLY on this context. Be concise and professional.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `${context}\n\nUser Question: ${userMessage}`,
      });

      setMessages(prev => [...prev, { role: 'ai', content: response.text || 'I could not process that request.' }]);
    } catch (error) {
      console.error('Error querying AI:', error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error while processing your request.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-ink/20 backdrop-blur-sm z-40"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-brand-surface shadow-2xl z-50 flex flex-col border-l border-brand-border"
          >
            <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-bg/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="font-serif text-xl mb-0.5">PropMax AI</h2>
                  <p className="text-[10px] text-brand-ink/60 uppercase tracking-widest">Natural Language Querying</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-brand-border/20 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {!GEMINI_API_KEY && (
              <div className="px-4 py-2 text-xs bg-amber-950/40 text-amber-100/90 border-b border-amber-800/30">
                Set <code className="rounded bg-black/30 px-1">GEMINI_API_KEY</code> in <code className="rounded bg-black/30 px-1">.env</code> and restart the dev server.
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-brand-bg/10">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-brand-ink text-white rounded-tr-sm' 
                      : 'bg-brand-surface border border-brand-border text-brand-ink rounded-tl-sm shadow-sm'
                  }`}>
                    {msg.role === 'ai' && (
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-widest font-bold text-brand-accent">
                        <Bot size={12} /> AI Assistant
                      </div>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-brand-surface border border-brand-border text-brand-ink rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t border-brand-border bg-brand-surface">
              <div className="relative flex items-center">
                <input 
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder={GEMINI_API_KEY ? 'Ask anything about your CRM...' : 'Configure GEMINI_API_KEY in .env first'}
                  disabled={!GEMINI_API_KEY}
                  className="w-full bg-brand-bg/50 border border-brand-border/50 rounded-full py-3 pl-4 pr-12 text-sm outline-none focus:border-brand-accent disabled:opacity-50"
                />
                <button 
                  onClick={handleSend}
                  disabled={!GEMINI_API_KEY || !input.trim() || isLoading}
                  className="absolute right-2 p-2 bg-brand-accent text-brand-ink rounded-full hover:bg-brand-accent/90 disabled:opacity-50 disabled:hover:bg-brand-accent transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[10px] text-center text-brand-ink/40 mt-3">AI can make mistakes. Verify important information.</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
