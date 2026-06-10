import React, { useState } from 'react';
import { X, Building2, User, DollarSign, Calendar, CheckCircle2 } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface UpdateUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: any; // Using any for now, should ideally be typed
  userId?: string;
}

export const UpdateUnitModal: React.FC<UpdateUnitModalProps> = ({ isOpen, onClose, unit, userId }) => {
  const [status, setStatus] = useState(unit?.status || 'Available');
  const [buyerName, setBuyerName] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !unit) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUserId = userId || auth.currentUser?.uid;
    if (!targetUserId) return;

    setIsSubmitting(true);
    try {
      const unitRef = doc(db, 'units', unit.id);
      
      const updateData: any = {
        status,
        updatedAt: serverTimestamp(),
        unitNumber: unit.unitNumber,
        projectId: unit.projectId || 'p_my_nest',
        type: unit.typeId || 't_3bhk',
        price: parsePrice(unit.price)
      };

      if (status === 'Blocked' || status === 'Sold') {
        updateData.bookedBy = buyerName; // In a real app, this would be a user UID
        updateData.advisorId = targetUserId;
        updateData.bookedAt = serverTimestamp();
        updateData.tokenAmount = Number(tokenAmount) || 0;
      }

      await setDoc(unitRef, updateData, { merge: true });
      onClose();
    } catch (error) {
      console.error('Error updating unit:', error);
      alert('Failed to update unit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const parsePrice = (priceStr: string) => {
    if (!priceStr) return 0;
    if (priceStr.includes('Cr')) return parseFloat(priceStr.replace(/[^0-9.]/g, '')) * 10000000;
    if (priceStr.includes('L')) return parseFloat(priceStr.replace(/[^0-9.]/g, '')) * 100000;
    return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#111114] border border-brand-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-6 border-b border-brand-border/30 flex items-center justify-between bg-brand-bg/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-accent/10 text-brand-accent rounded-lg">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-serif text-brand-ink">Update Unit {unit.unitName || unit.unitNumber}</h2>
              <p className="text-xs text-brand-ink/50 uppercase tracking-widest">{unit.type || '3 BHK'} • {unit.basePrice || '₹75L'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-brand-border/20 rounded-full transition-colors">
            <X size={20} className="text-brand-ink/60" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <form id="update-unit-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Status Selection */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-brand-ink/60 mb-3 font-semibold">Unit Status</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus('Available')}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    status === 'Available' 
                      ? 'border-green-500/50 bg-green-500/10 text-green-400 shadow-sm' 
                      : 'border-brand-border text-brand-ink/60 hover:bg-[#16161A]'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${status === 'Available' ? 'bg-green-500' : 'bg-brand-ink/20'}`}></div>
                  Available
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('Blocked')}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    status === 'Blocked' 
                      ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400 shadow-sm' 
                      : 'border-brand-border text-brand-ink/60 hover:bg-[#16161A]'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${status === 'Blocked' ? 'bg-yellow-500' : 'bg-brand-ink/20'}`}></div>
                  Blocked
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('Sold')}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    status === 'Sold' 
                      ? 'border-red-500/50 bg-red-500/10 text-red-400 shadow-sm' 
                      : 'border-brand-border text-brand-ink/60 hover:bg-[#16161A]'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${status === 'Sold' ? 'bg-red-500' : 'bg-brand-ink/20'}`}></div>
                  Sold
                </button>
              </div>
            </div>

            {/* Conditional Fields for Blocked/Sold */}
            {(status === 'Blocked' || status === 'Sold') && (
              <div className="space-y-4 pt-4 border-t border-brand-border/30 animate-in slide-in-from-top-2 duration-300">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-brand-ink/60 mb-1 font-semibold">Buyer Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={16} className="text-brand-ink/40" />
                    </div>
                    <input 
                      type="text" 
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-brand-border bg-[#16161A] text-brand-ink rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition-all"
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-brand-ink/60 mb-1 font-semibold">Token Amount (₹)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign size={16} className="text-brand-ink/40" />
                    </div>
                    <input 
                      type="number" 
                      required={status === 'Blocked'}
                      value={tokenAmount}
                      onChange={(e) => setTokenAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-brand-border bg-[#16161A] text-brand-ink rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition-all"
                      placeholder="e.g. 500000"
                    />
                  </div>
                  <p className="text-[10px] text-brand-ink/50 mt-1 italic">Required to block the unit.</p>
                </div>
              </div>
            )}
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
            form="update-unit-form"
            disabled={isSubmitting || ((status === 'Blocked' || status === 'Sold') && !buyerName)}
            className="btn-premium-primary px-6 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? 'Updating...' : 'Confirm Update'}
          </button>
        </div>
      </div>
    </div>
  );
};
