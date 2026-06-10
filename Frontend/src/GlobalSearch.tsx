import React, { useState, useEffect } from 'react';
import { Search, MapPin, User, Building, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Deal, Project, User as UserType } from './data';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  deals: Deal[];
  projects: Project[];
  users: UserType[];
  onSelectDeal: (deal: Deal) => void;
}

export function GlobalSearch({ isOpen, onClose, deals, projects, users, onSelectDeal }: GlobalSearchProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open search
          const event = new CustomEvent('open-global-search');
          window.dispatchEvent(event);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredDeals = deals.filter(d => 
    d.buyerName.toLowerCase().includes(query.toLowerCase()) ||
    d.unitName.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.location.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-brand-ink/40 backdrop-blur-sm z-[100] flex items-start justify-center pt-[10vh]"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-2xl bg-brand-surface rounded-xl shadow-2xl overflow-hidden border border-brand-border/50"
        >
          <div className="flex items-center px-4 py-4 border-b border-brand-border">
            <Search size={20} className="text-brand-ink/40 mr-3" />
            <input 
              autoFocus
              type="text"
              placeholder="Search deals, buyers, projects... (Cmd+K)"
              className="flex-1 bg-transparent border-none outline-none text-brand-ink placeholder:text-brand-ink/40 text-lg"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button onClick={onClose} className="p-1 hover:bg-brand-bg rounded-md text-brand-ink/40 hover:text-brand-ink">
              <X size={20} />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {query.length > 0 ? (
              <>
                {filteredDeals.length > 0 && (
                  <div className="mb-4">
                    <div className="px-3 py-2 text-[10px] uppercase tracking-widest font-semibold text-brand-ink/50">Deals & Buyers</div>
                    {filteredDeals.map(deal => (
                      <button 
                        key={deal.id}
                        onClick={() => {
                          onSelectDeal(deal);
                          onClose();
                        }}
                        className="w-full text-left px-3 py-3 hover:bg-brand-bg rounded-lg flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-ink/5 flex items-center justify-center text-brand-ink/60 group-hover:bg-brand-accent/10 group-hover:text-brand-accent transition-colors">
                            <User size={14} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-brand-ink">{deal.buyerName}</div>
                            <div className="text-xs text-brand-ink/60">{deal.unitName} • {deal.status}</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-brand-accent">{deal.amount}</div>
                      </button>
                    ))}
                  </div>
                )}

                {filteredProjects.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-[10px] uppercase tracking-widest font-semibold text-brand-ink/50">Projects</div>
                    {filteredProjects.map(project => (
                      <button 
                        key={project.id}
                        className="w-full text-left px-3 py-3 hover:bg-brand-bg rounded-lg flex items-center gap-3 group transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-brand-ink/5 flex items-center justify-center text-brand-ink/60 group-hover:bg-brand-accent/10 group-hover:text-brand-accent transition-colors">
                          <Building size={14} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-brand-ink">{project.name}</div>
                          <div className="text-xs text-brand-ink/60 flex items-center gap-1"><MapPin size={10} /> {project.location}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {filteredDeals.length === 0 && filteredProjects.length === 0 && (
                  <div className="py-12 text-center text-brand-ink/40 text-sm">
                    No results found for "{query}"
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center text-brand-ink/40 text-sm">
                Start typing to search across your CRM...
              </div>
            )}
          </div>
          
          <div className="bg-brand-bg/50 px-4 py-3 border-t border-brand-border flex items-center justify-between text-[10px] text-brand-ink/50">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><kbd className="bg-brand-surface px-1.5 py-0.5 rounded border border-brand-border/50 font-mono">↑</kbd><kbd className="bg-brand-surface px-1.5 py-0.5 rounded border border-brand-border/50 font-mono">↓</kbd> to navigate</span>
              <span className="flex items-center gap-1"><kbd className="bg-brand-surface px-1.5 py-0.5 rounded border border-brand-border/50 font-mono">↵</kbd> to select</span>
            </div>
            <span className="flex items-center gap-1"><kbd className="bg-brand-surface px-1.5 py-0.5 rounded border border-brand-border/50 font-mono">esc</kbd> to close</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
