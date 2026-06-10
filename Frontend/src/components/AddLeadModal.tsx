import React, { useState } from 'react';
import { X, User, Phone, Mail, DollarSign, Tag, FileText } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, userId }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState('Facebook Ads');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUserId = userId || auth.currentUser?.uid;
    if (!name || !targetUserId) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'leads'), {
        name,
        phone,
        email,
        source,
        status: 'New',
        assignedTo: targetUserId,
        budget: Number(budget) || 0,
        notes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      onClose();
      // Reset form
      setName('');
      setPhone('');
      setEmail('');
      setSource('Facebook Ads');
      setBudget('');
      setNotes('');
    } catch (error) {
      console.error('Error adding lead:', error);
      alert('Failed to add lead. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#111114] border border-brand-border rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-brand-border/30 flex items-center justify-between bg-brand-bg/30">
          <h2 className="text-xl font-serif text-brand-ink">Add New Lead</h2>
          <button onClick={onClose} className="p-2 hover:bg-brand-border/20 rounded-full transition-colors">
            <X size={20} className="text-brand-ink/60" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <form id="add-lead-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-brand-ink/60 mb-1 font-semibold">Full Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-brand-ink/40" />
                </div>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-brand-border bg-[#16161A] text-brand-ink rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition-all"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-brand-ink/60 mb-1 font-semibold">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={16} className="text-brand-ink/40" />
                  </div>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-brand-border bg-[#16161A] text-brand-ink rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-brand-ink/60 mb-1 font-semibold">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-brand-ink/40" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-brand-border bg-[#16161A] text-brand-ink rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition-all"
                    placeholder="rahul@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-brand-ink/60 mb-1 font-semibold">Lead Source</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag size={16} className="text-brand-ink/40" />
                  </div>
                  <select 
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                     className="w-full pl-10 pr-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition-all appearance-none bg-[#16161A] text-brand-ink"
                  >
                    <option value="Facebook Ads">Facebook Ads</option>
                    <option value="Google Search">Google Search</option>
                    <option value="Direct Walk-in">Direct Walk-in</option>
                    <option value="Referral">Referral</option>
                    <option value="Sub-Broker">Sub-Broker</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-brand-ink/60 mb-1 font-semibold">Budget (₹)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign size={16} className="text-brand-ink/40" />
                  </div>
                  <input 
                    type="number" 
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition-all bg-[#16161A] text-brand-ink"
                    placeholder="e.g. 7500000"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-brand-ink/60 mb-1 font-semibold">Initial Notes</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText size={16} className="text-brand-ink/40" />
                </div>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                     className="w-full pl-10 pr-4 py-2 border border-brand-border bg-[#16161A] text-brand-ink rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition-all min-h-[100px] resize-none"
                  placeholder="Looking for a 3BHK, ready to move in 6 months..."
                ></textarea>
              </div>
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t border-brand-border/30 bg-[#16161A]/50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="btn-premium-secondary px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="add-lead-form"
            disabled={isSubmitting || !name}
            className="btn-premium-primary px-6 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? 'Saving...' : 'Save Lead'}
          </button>
        </div>
      </div>
    </div>
  );
};
