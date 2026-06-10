import React, { useState } from 'react';
import type { User, Project, Deal } from './data';
import { 
  Target, TrendingUp, Zap, Sparkles, AlertCircle, Search, 
  MapPin, Building, CheckCircle, Clock, DollarSign, Filter,
  ChevronRight, ArrowRight, Activity, Percent, FileText, Upload, Send, Eye, User as UserIcon, X, Phone, MessageSquare, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { AddLeadModal } from './components/AddLeadModal';
import { MyLeads } from './components/MyLeads';

interface AdvisorDashboardProps {
  user: User;
  projects: Project[];
  myDeals: Deal[];
  setActiveTab?: (tab: 'overview' | 'team' | 'roles' | 'pipeline' | 'inventory' | 'projects' | 'schedules' | 'documents' | 'project_details' | 'budget-roi') => void;
}

interface VaultDoc {
  name: string;
  status: 'executed' | 'under_review' | 'pending_signature' | 'missing';
  date: string;
  type: string;
  content?: string;
}

export const AdvisorDashboard: React.FC<AdvisorDashboardProps> = ({ user, projects, myDeals, setActiveTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [discountValue, setDiscountValue] = useState(0);

  // Modals & Action States
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callTargetName, setCallTargetName] = useState('');
  const [callTimer, setCallTimer] = useState('00:00');
  const [showWarmLeadsModal, setShowWarmLeadsModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [dealBuilderLoading, setDealBuilderLoading] = useState(false);
  const [dealBuilderSuccess, setDealBuilderSuccess] = useState<string | null>(null);
  const [showQuoteLoading, setShowQuoteLoading] = useState(false);
  const [showQuoteSuccess, setShowQuoteSuccess] = useState(false);

  // Stateful Documents
  const [vaultDocs, setVaultDocs] = useState<VaultDoc[]>([
    { name: 'Booking Form', status: 'executed', date: 'Mar 10, 2026', type: 'pdf', content: 'Official Booking Form for Priya Patel. Unit: 1205. Status: Fully Executed & Verified.' },
    { name: 'KYC Documents', status: 'executed', date: 'Mar 11, 2026', type: 'img', content: 'Aadhaar Card, PAN Card, and Address Proof uploads for Priya Patel. Status: Verified.' },
    { name: 'Allotment Letter', status: 'under_review', date: 'Mar 15, 2026', type: 'pdf', content: 'Allotment Letter for Unit 1205. Currently under administrative review.' },
    { name: 'Agreement to Sale', status: 'pending_signature', date: 'Mar 20, 2026', type: 'pdf', content: 'Agreement to Sale (ATS) for Unit 1205. Sent to client for Aadhaar signature verification.' },
    { name: 'Payment Schedule', status: 'missing', date: '-', type: 'pdf', content: '' },
  ]);
  const [previewDoc, setPreviewDoc] = useState<VaultDoc | null>(null);

  // Performance Tracker Mock Data
  const targets = {
    revenue: 12.0, // Cr
    achieved: 8.5, // Cr
    sold2BHK: 4,
    sold3BHK: 2,
    target3BHK: 4,
    commissionEarned: 850000,
    nextDealBonus: 75000
  };

  // Discount guardrail states
  const getDiscountStatus = (val: number) => {
    if (val <= 2) return { color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-500', text: 'Auto-Approved', action: 'Close Deal Instantly' };
    if (val <= 4.5) return { color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-500', text: 'Requires Approval', action: 'Request Director Approval' };
    return { color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-500', text: 'Locked', action: 'Exceeds Max Discount' };
  };

  const discountStatus = getDiscountStatus(discountValue);

  const startCall = (name: string) => {
    setCallTargetName(name);
    setCallTimer('Dialing...');
    setShowCallModal(true);
    setTimeout(() => setCallTimer('00:01'), 2000);
    const interval = setInterval(() => {
      setCallTimer(prev => {
        if (prev === 'Dialing...') return '00:01';
        const [m, s] = prev.split(':').map(Number);
        const totalSec = m * 60 + s + 1;
        const min = String(Math.floor(totalSec / 60)).padStart(2, '0');
        const sec = String(totalSec % 60).padStart(2, '0');
        return `${min}:${sec}`;
      });
    }, 1000);
    (window as any).advisorCallInterval = interval;
  };

  const stopCall = () => {
    clearInterval((window as any).advisorCallInterval);
    setShowCallModal(false);
  };

  const handleSendReminder = () => {
    alert("Payment Reminder request successfully dispatched to Rahul Sharma via secure WhatsApp, Email & SMS!");
  };

  const handleDealBuilderAction = () => {
    setDealBuilderLoading(true);
    setTimeout(() => {
      setDealBuilderLoading(false);
      if (discountValue <= 2) {
        setDealBuilderSuccess(`Deal completed! Smart term sheet generated for Unit B-1402 with base price discounted by ${discountValue}% (Final: ₹${(7500000 * (1 - discountValue / 100)).toLocaleString('en-IN')}).`);
      } else {
        setDealBuilderSuccess(`Director Approval request submitted successfully for 3BHK Unit B-1402 at a discounted rate of ${discountValue}%. Priority alert dispatched to director's workspace.`);
      }
    }, 2000);
  };

  const handleGenerateAgreement = () => {
    alert("Compiling agreement templates... Generating unified Builder-Buyer Agreement (BBA) for Priya Patel.");
    const updated = vaultDocs.map(d => d.name === 'Agreement to Sale' ? { ...d, status: 'under_review' as const, date: 'Just now' } : d);
    setVaultDocs(updated);
  };

  const handleDocAction = (docItem: VaultDoc) => {
    if (docItem.status === 'missing') {
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setVaultDocs(prev => prev.map(d => d.name === docItem.name ? {
          ...d,
          status: 'executed',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          content: `Uploaded Payment Schedule Document: ${file.name}. Verification successful.`
        } : d));
      };
      input.click();
    } else if (docItem.status === 'pending_signature') {
      alert(`Re-sent secure signature link to client's verified mobile & email.`);
    } else {
      setPreviewDoc(docItem);
    }
  };

  const handleGenerateSmartQuote = () => {
    setShowQuoteLoading(true);
    setTimeout(() => {
      setShowQuoteLoading(false);
      setShowQuoteSuccess(true);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Action Bar */}
      <div className="flex justify-between items-center card-premium p-4">
        <div>
          <h2 className="text-xl font-serif text-brand-ink">Welcome back, {user.name}</h2>
          <p className="text-sm text-brand-ink/60">Here's your sales pipeline and urgent tasks for today.</p>
        </div>
        <button 
          onClick={() => setIsAddLeadModalOpen(true)}
          className="btn-premium-primary px-4 py-2 text-sm font-semibold cursor-pointer flex items-center gap-2"
        >
          <UserIcon size={16} /> Add New Lead
        </button>
      </div>

      {/* Urgent Tasks Alert */}
      <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
        <AlertCircle size={20} className="text-red-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-1">Urgent Action Required: Collection Risk</h3>
          <p className="text-sm text-brand-ink/80 mb-3">
            Your client <strong>Rahul Sharma (Unit B-0804)</strong> is 7 days overdue for the 'Slab 1-5' milestone payment (₹1.2Cr). Please follow up immediately to secure the cash flow.
          </p>
          <div className="flex gap-3">
            <button 
              onClick={() => startCall('Rahul Sharma (Unit B-0804)')}
              className="text-xs uppercase tracking-widest font-semibold text-red-400 bg-red-500/20 border border-red-500/30 px-4 py-2 rounded-[14px] hover:bg-red-500/30 transition-all cursor-pointer"
            >
              Call Rahul Now
            </button>
            <button 
              onClick={handleSendReminder}
              className="text-xs uppercase tracking-widest font-semibold btn-premium-secondary text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2 cursor-pointer"
            >
              Send Payment Reminder
            </button>
          </div>
        </div>
      </div>

      {/* 1. "Urgency & Scarcity" Playbook */}
      <div className="card-premium p-6 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-32 h-32 bg-brand-accent/20 rounded-full blur-3xl"></div>
        <div className="flex items-center gap-3 mb-4">
          <Sparkles size={20} className="text-brand-accent" />
          <h2 className="text-sm uppercase tracking-widest font-semibold text-brand-accent">AI Sales Playbook</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-brand-bg border border-brand-accent/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-yellow-400" />
              <h3 className="font-serif text-lg">Upcoming Price Hike</h3>
            </div>
            <p className="text-sm text-brand-ink/75 mb-3">
              Developer has scheduled a 2% price hike for Wing A 2BHKs next week. You have 8 warm leads for this typology.
            </p>
            <button 
              onClick={() => setShowWarmLeadsModal(true)}
              className="text-xs uppercase tracking-widest font-semibold text-brand-bg bg-brand-accent px-4 py-2 rounded-sm hover:bg-brand-accent/90 transition-colors cursor-pointer"
            >
              Call Warm Leads Now
            </button>
          </div>
          <div className="bg-brand-bg border border-brand-border/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-red-400" />
              <h3 className="font-serif text-lg">Scarcity Alert</h3>
            </div>
            <p className="text-sm text-brand-ink/75 mb-3">
              You have a site visit with Ramesh today. Wing B top-floor 3BHKs are almost sold out (only 4 left). Pitch Unit B-1502 to create urgency.
            </p>
            <button 
              onClick={() => setShowUnitModal(true)}
              className="btn-premium-secondary px-4 py-2 text-xs uppercase tracking-widest font-semibold cursor-pointer"
            >
              View Unit B-1502
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 4. Personal Target Tracker */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-sm uppercase tracking-widest font-semibold flex items-center gap-2">
            <Target size={16} className="text-brand-accent" /> My Performance Tracker
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-premium p-6">
              <p className="text-xs uppercase tracking-widest text-brand-ink/50 mb-2">Revenue Achieved</p>
              <div className="flex items-end gap-2 mb-4">
                <p className="font-serif text-3xl">₹{targets.achieved}Cr</p>
                <p className="text-sm text-brand-ink/60 mb-1">/ ₹{targets.revenue}Cr Target</p>
              </div>
              <div className="w-full h-2 bg-brand-bg rounded-full overflow-hidden mb-2">
                <div className="h-full bg-brand-ink" style={{ width: `${(targets.achieved / targets.revenue) * 100}%` }}></div>
              </div>
              <p className="text-xs text-brand-ink/60">
                You need to sell <span className="font-semibold text-brand-ink">two more 3BHKs</span> this month to hit your target and unlock your bonus.
              </p>
            </div>
            <div className="card-premium p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-brand-ink/50 mb-2">Commission Forecaster</p>
                <p className="font-serif text-3xl text-green-600">₹{(targets.commissionEarned / 100000).toFixed(1)}L <span className="text-sm text-brand-ink/60 font-sans">Earned</span></p>
              </div>
              <div className="bg-brand-bg/50 p-3 rounded-lg border border-brand-border/20 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp size={16} className="text-brand-accent" />
                  <span>Closing Unit A-1201 today will add <strong className="text-brand-ink">₹{(targets.nextDealBonus / 1000).toFixed(0)}k</strong> to your payout.</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Live "Deal Builder" & Discount Guardrails */}
          <h2 className="text-sm uppercase tracking-widest font-semibold flex items-center gap-2 pt-4">
            <DollarSign size={16} className="text-brand-accent" /> Live Deal Builder
          </h2>
          <div className="card-premium p-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <h3 className="font-serif text-xl mb-1">Unit B-1402 (3BHK)</h3>
                <p className="text-sm text-brand-ink/60 mb-6">Base Price: ₹75,00,000</p>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <label className="font-medium">Discount Percentage</label>
                      <span className="font-bold">{discountValue}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      step="0.5" 
                      value={discountValue} 
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value))}
                      className="w-full accent-brand-ink"
                    />
                    <div className="flex justify-between text-xs text-brand-ink/50 mt-1">
                      <span>0%</span>
                      <span>5%</span>
                      <span>10%</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-brand-border/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-brand-ink/60">Final Price</span>
                      <span className="font-serif text-2xl">₹{(7500000 * (1 - discountValue / 100)).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 bg-brand-bg/30 p-6 rounded-xl border border-brand-border/20 flex flex-col justify-center items-center text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${discountStatus.bg} ${discountStatus.color}`}>
                  <Percent size={24} />
                </div>
                <h4 className={`font-semibold mb-1 ${discountStatus.color}`}>{discountStatus.text}</h4>
                <p className="text-xs text-brand-ink/60 mb-6 px-4">
                  {discountValue <= 2 ? 'This discount is within your pre-approved limits.' : 
                   discountValue <= 4.5 ? 'This requires Director approval before you can generate the term sheet.' : 
                   'This discount exceeds maximum allowable limits for this unit type.'}
                </p>
                {dealBuilderLoading ? (
                  <div className="w-full py-2 flex flex-col items-center justify-center">
                    <motion.div 
                      animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      className="w-6 h-6 border-2 border-brand-accent border-t-transparent rounded-full mb-1"
                    />
                    <span className="text-[10px] uppercase tracking-widest text-brand-ink/50">Processing Deal Option...</span>
                  </div>
                ) : (
                  <button 
                    disabled={discountValue > 4.5}
                    onClick={handleDealBuilderAction}
                    className={`w-full py-3 rounded-sm text-xs uppercase tracking-widest font-semibold transition-colors ${
                      discountValue <= 2 ? 'btn-premium-primary text-xs cursor-pointer' : 
                      discountValue <= 4.5 ? 'bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30 rounded-[14px] cursor-pointer' : 
                      'bg-[#16161A] text-brand-ink/30 border border-brand-border rounded-[14px] cursor-not-allowed'
                    }`}
                  >
                    {discountStatus.action}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* My Leads Section */}
          <div className="pt-4">
            <MyLeads userId={user.id} />
          </div>

          {/* 6. Document Control (The Deal Vault) */}
          <h2 className="text-sm uppercase tracking-widest font-semibold flex items-center gap-2 pt-4">
            <FileText size={16} className="text-brand-accent" /> Document Control (Deal Vault)
          </h2>
          <div className="card-premium overflow-hidden">
            <div className="p-4 border-b border-brand-border/20 bg-brand-bg/50 flex justify-between items-center">
              <div>
                <h3 className="font-serif text-lg">Priya Patel - Unit 1205</h3>
                <p className="text-xs text-brand-ink/60">Status: Booked</p>
              </div>
              <button 
                onClick={handleGenerateAgreement}
                className="text-xs uppercase tracking-widest font-semibold btn-premium-primary px-4 py-2 text-xs uppercase tracking-widest font-semibold cursor-pointer"
              >
                Generate Agreement
              </button>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-bg/30 border-b border-brand-border/20">
                <tr>
                  <th className="p-4 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Document</th>
                  <th className="p-4 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Status</th>
                  <th className="p-4 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Last Updated</th>
                  <th className="p-4 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {vaultDocs.map((doc, idx) => (
                  <tr key={idx} className="border-b border-brand-border/10 last:border-0 hover:bg-brand-bg/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-medium">
                        <FileText size={14} className="text-brand-ink/50" /> {doc.name}
                      </div>
                    </td>
                    <td className="p-4">
                      {doc.status === 'executed' && <span className="bg-green-100 text-green-700 text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm border border-green-200">Executed</span>}
                      {doc.status === 'under_review' && <span className="bg-blue-100 text-blue-700 text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm border border-blue-200">Under Review</span>}
                      {doc.status === 'pending_signature' && <span className="bg-yellow-100 text-yellow-700 text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm border border-yellow-200">Pending Signature</span>}
                      {doc.status === 'missing' && <span className="bg-red-100 text-red-700 text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm border border-red-200">Missing</span>}
                    </td>
                    <td className="p-4 text-xs text-brand-ink/60">{doc.date}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleDocAction(doc)}
                        className={`text-xs font-semibold hover:underline flex items-center gap-1 ${
                          doc.status === 'missing' ? 'text-brand-accent' : 
                          doc.status === 'pending_signature' ? 'text-brand-ink' : 
                          'text-brand-ink/60'
                        }`}
                      >
                        {doc.status === 'missing' ? (
                          <>
                            <Upload size={12} /> Upload
                          </>
                        ) : doc.status === 'pending_signature' ? (
                          <>
                            <Send size={12} /> Resend
                          </>
                        ) : (
                          <>
                            <Eye size={12} /> View
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* 5. Pocket Inventory Mini-Map */}
          <div className="card-premium p-6">
            <h2 className="text-sm uppercase tracking-widest font-semibold mb-4 flex items-center gap-2">
              <Search size={16} className="text-brand-accent" /> Pocket Inventory
            </h2>
            <div className="relative mb-4">
              <input 
                type="text" 
                placeholder="e.g., East-facing, 2BHK, >10th floor" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#16161A] border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-accent text-brand-ink"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink/40" />
            </div>
            
            <div className="space-y-3">
              <div 
                onClick={() => startCall('Priya Patel (Unit A-1101)')}
                className="p-3 border border-brand-accent/50 bg-brand-accent/5 rounded-lg hover:border-brand-accent transition-colors cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-brand-accent text-white text-[8px] uppercase tracking-widest font-bold px-2 py-1 rounded-bl-lg">
                  New Release (Phase 2)
                </div>
                <div className="flex justify-between items-start mb-1 mt-2">
                  <h4 className="font-semibold group-hover:text-brand-accent transition-colors">Unit A-1101</h4>
                  <span className="bg-green-100 text-green-700 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded">Available</span>
                </div>
                <p className="text-xs text-brand-ink/60 mb-2">2BHK • East Facing • 11th Floor</p>
                <p className="font-medium text-sm">₹50.0 L</p>
              </div>
              <div 
                onClick={() => startCall('Kiran Kumar (Unit B-1202)')}
                className="p-3 border border-brand-accent/50 bg-brand-accent/5 rounded-lg hover:border-brand-accent transition-colors cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-brand-accent text-white text-[8px] uppercase tracking-widest font-bold px-2 py-1 rounded-bl-lg">
                  New Release (Phase 2)
                </div>
                <div className="flex justify-between items-start mb-1 mt-2">
                  <h4 className="font-semibold group-hover:text-brand-accent transition-colors">Unit B-1202</h4>
                  <span className="bg-green-100 text-green-700 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded">Available</span>
                </div>
                <p className="text-xs text-brand-ink/60 mb-2">2BHK • East Facing • 12th Floor</p>
                <p className="font-medium text-sm">₹50.0 L</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab?.('inventory')}
              className="w-full mt-4 text-xs uppercase tracking-widest font-semibold text-brand-accent hover:text-brand-ink transition-colors flex items-center justify-center gap-1"
            >
              View Full Stack Plan <ArrowRight size={14} />
            </button>
          </div>

          {/* 3. Dynamic Payment Schedules */}
          <div className="card-premium p-6">
            <h2 className="text-sm uppercase tracking-widest font-semibold mb-4 flex items-center gap-2">
              <Activity size={16} className="text-brand-accent" /> Milestone-Linked Quotes
            </h2>
            <p className="text-xs text-brand-ink/60 mb-4">
              Generate payment plans tied to live construction reality, building trust with buyers.
            </p>
            
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-brand-border/50 before:to-transparent">
              {projects[0]?.milestones?.map((milestone, idx) => (
                <div key={milestone.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${milestone.status === 'completed' ? 'is-active' : ''}`}>
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full border shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${
                    milestone.status === 'completed' ? 'border-white bg-green-500 text-white' : 
                    milestone.status === 'in_progress' ? 'border-white bg-brand-accent text-white' : 
                    'border-brand-border bg-[#16161A] text-brand-ink/30'
                  }`}>
                    {milestone.status === 'completed' ? <CheckCircle size={12} /> : 
                     milestone.status === 'in_progress' ? <Clock size={12} /> : 
                     <div className="w-2 h-2 bg-brand-border/50 rounded-full"></div>}
                  </div>
                  <div className={`w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border ${
                    milestone.status === 'completed' ? 'border-brand-border/20 bg-brand-bg/30' : 
                    milestone.status === 'in_progress' ? 'border-brand-accent/30 bg-brand-accent/5' : 
                    'border-brand-border/10 opacity-60'
                  }`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold">{milestone.name}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        milestone.status === 'completed' ? 'text-green-400 bg-green-500/10 border border-green-500/20' : 
                        milestone.status === 'in_progress' ? 'text-brand-accent bg-brand-accent/10' : 
                        'text-brand-ink/50'
                      }`}>
                        {milestone.status === 'completed' ? 'Completed' : 
                         milestone.status === 'in_progress' ? 'In Progress' : 
                         new Date(milestone.targetDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-brand-ink/60">{milestone.percentageDue}% Due</p>
                  </div>
                </div>
              ))}
            </div>
            
            {showQuoteLoading ? (
              <div className="w-full mt-6 py-2 flex flex-col items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 border-2 border-brand-accent border-t-transparent rounded-full mb-1"
                />
                <span className="text-[10px] uppercase tracking-widest text-brand-ink/50">Compiling Smart Quote...</span>
              </div>
            ) : (
              <button 
                onClick={handleGenerateSmartQuote}
                className="w-full mt-6 bg-brand-ink text-brand-bg py-2.5 rounded-sm text-xs uppercase tracking-widest font-semibold hover:bg-brand-ink/90 transition-colors"
              >
                Generate Smart Quote PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =============================================================== */}
      {/* Dynamic Modal Panels */}
      {/* =============================================================== */}
      <AnimatePresence>
        
        {/* Calling Modal */}
        {showCallModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-bg/90 backdrop-blur-md z-50"
            />
            <motion.div 
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              className="fixed inset-0 m-auto max-w-xs h-[300px] bg-[#111114] border border-brand-border rounded-2xl shadow-2xl z-50 p-6 flex flex-col items-center justify-between text-center"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand-bg border-2 border-brand-accent flex items-center justify-center mx-auto shadow-xl">
                  <UserIcon size={32} className="text-brand-accent"/>
                </div>
                <div>
                  <h3 className="font-serif text-lg text-brand-ink">{callTargetName}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-brand-accent mt-0.5">Calling via PropMax Dialer...</p>
                </div>
                <div className="font-mono text-lg text-brand-ink/70">{callTimer}</div>
              </div>

              <button 
                onClick={stopCall}
                className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors shadow-lg"
              >
                <X size={20}/>
              </button>
            </motion.div>
          </>
        )}

        {/* Warm Leads Dialer List Modal */}
        {showWarmLeadsModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-bg/85 backdrop-blur-sm z-50"
              onClick={() => setShowWarmLeadsModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto max-w-md h-[400px] bg-[#111114] border border-brand-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col p-6"
            >
              <div className="flex justify-between items-center border-b border-brand-border/20 pb-4 bg-brand-bg/50 -mx-6 -mt-6 p-6">
                <div>
                  <h3 className="font-serif text-lg text-brand-ink">Wing A - 2BHK Warm Leads</h3>
                  <p className="text-[10px] uppercase tracking-widest text-brand-ink/40">Price Hike Playbook Dialer</p>
                </div>
                <button onClick={() => setShowWarmLeadsModal(false)} className="text-brand-ink/50 hover:text-brand-ink"><X size={20}/></button>
              </div>

              <div className="flex-1 py-4 overflow-y-auto space-y-3 custom-scrollbar">
                {[
                  { name: 'Amit Saxena', budget: '₹55 L', status: 'Site Visited' },
                  { name: 'Shalini Gupta', budget: '₹52 L', status: 'Negotiating' },
                  { name: 'Dr. Vivek Joshi', budget: '₹50 L', status: 'Highly Interested' },
                  { name: 'Megha Deshmukh', budget: '₹54 L', status: 'Inquired' },
                  { name: 'Rohan Shinde', budget: '₹52 L', status: 'Warm Followup' },
                ].map((lead, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-brand-bg/40 border border-brand-border/10 rounded hover:border-brand-accent/50 transition-colors">
                    <div>
                      <p className="font-semibold text-xs text-brand-ink">{lead.name}</p>
                      <p className="text-[10px] text-brand-ink/50">{lead.status} • Budget: {lead.budget}</p>
                    </div>
                    <button 
                      onClick={() => { setShowWarmLeadsModal(false); startCall(`${lead.name} (${lead.status})`); }}
                      className="btn-premium-primary p-2 rounded-full cursor-pointer shadow"
                    >
                      <Phone size={12}/>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {/* Unit Detail Scarcity Modal */}
        {showUnitModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-bg/85 backdrop-blur-sm z-50"
              onClick={() => setShowUnitModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto max-w-sm h-[420px] bg-[#111114] border border-brand-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col p-6 justify-between"
            >
              <div className="flex justify-between items-center border-b border-brand-border/20 pb-4 bg-brand-bg/50 -mx-6 -mt-6 p-6">
                <div>
                  <h3 className="font-serif text-lg text-brand-ink">Unit B-1502 Specifications</h3>
                  <p className="text-[10px] uppercase tracking-widest text-brand-ink/40">Wing B Top-Floor 3BHK Premium</p>
                </div>
                <button onClick={() => setShowUnitModal(false)} className="text-brand-ink/50 hover:text-brand-ink"><X size={20}/></button>
              </div>

              <div className="flex-1 py-4 text-xs space-y-4 text-brand-ink/80">
                <div className="h-28 rounded border border-brand-border/10 overflow-hidden relative">
                  <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600" alt="3BHK" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-[8px] uppercase tracking-widest font-bold px-2 py-1 rounded shadow">
                    Only 4 Left
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-brand-ink/40">Carpet Area</span>
                    <p className="font-semibold">1,350 sq.ft.</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-brand-ink/40">Price</span>
                    <p className="font-semibold text-brand-accent">₹78.50 L</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-brand-ink/40">Direction</span>
                    <p className="font-semibold">East Facing</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-brand-ink/40">Floor Level</span>
                    <p className="font-semibold">15th Floor (Penthouse)</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => { setShowUnitModal(false); startCall('Ramesh (Site Visit Followup)'); }}
                className="w-full btn-premium-primary py-3 text-xs uppercase tracking-widest font-bold cursor-pointer flex items-center justify-center gap-2"
              >
                Call Ramesh to Pitch <Phone size={12}/>
              </button>
            </motion.div>
          </>
        )}

        {/* Deal Builder Output Feedback */}
        {dealBuilderSuccess && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-bg/85 backdrop-blur-sm z-50"
              onClick={() => setDealBuilderSuccess(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto max-w-sm h-[250px] bg-[#111114] border border-brand-border rounded-2xl shadow-2xl z-50 p-6 flex flex-col justify-between"
            >
              <div className="flex justify-between items-center border-b border-brand-border/20 pb-3">
                <span className="font-bold text-brand-accent text-sm uppercase tracking-widest">Deal Action Successful</span>
                <button onClick={() => setDealBuilderSuccess(null)} className="text-brand-ink/50 hover:text-brand-ink"><X size={18}/></button>
              </div>
              <p className="text-xs leading-relaxed text-brand-ink/80 my-4">{dealBuilderSuccess}</p>
              <button 
                onClick={() => setDealBuilderSuccess(null)}
                className="w-full btn-premium-primary py-2.5 text-xs uppercase tracking-widest font-semibold cursor-pointer"
              >
                Dismiss View
              </button>
            </motion.div>
          </>
        )}

        {/* Document Vault Content Viewer Modal */}
        {previewDoc && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-bg/85 backdrop-blur-sm z-50"
              onClick={() => setPreviewDoc(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto max-w-md h-[380px] bg-[#111114] border border-brand-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col p-6 justify-between"
            >
              <div className="flex justify-between items-center border-b border-brand-border/20 pb-4 bg-brand-bg/50 -mx-6 -mt-6 p-6">
                <div>
                  <h3 className="font-serif text-lg text-brand-ink">{previewDoc.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-brand-ink/40">Deal vault document preview — {previewDoc.date}</p>
                </div>
                <button onClick={() => setPreviewDoc(null)} className="text-brand-ink/50 hover:text-brand-ink"><X size={20}/></button>
              </div>

              <div className="flex-1 py-4 overflow-y-auto text-xs leading-relaxed text-brand-ink/70 custom-scrollbar font-mono bg-brand-bg/20 p-4 border border-brand-border/10 rounded my-4">
                {previewDoc.content}
              </div>

              <button 
                onClick={() => { setPreviewDoc(null); alert(`Downloading ${previewDoc.name} locally...`); }}
                className="w-full btn-premium-primary py-2.5 text-xs uppercase tracking-widest font-semibold cursor-pointer flex items-center justify-center gap-2"
              >
                <Download size={14}/> Download File
              </button>
            </motion.div>
          </>
        )}

        {/* Smart Quote success feedback */}
        {showQuoteSuccess && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-bg/85 backdrop-blur-sm z-50"
              onClick={() => setShowQuoteSuccess(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto max-w-sm h-[320px] bg-[#111114] border border-brand-border rounded-2xl shadow-2xl z-50 p-6 flex flex-col justify-between text-center"
            >
              <div className="flex justify-between items-center border-b border-brand-border/20 pb-3 text-left">
                <span className="font-bold text-brand-accent text-sm uppercase tracking-widest">Smart Quote Compiled</span>
                <button onClick={() => setShowQuoteSuccess(false)} className="text-brand-ink/50 hover:text-brand-ink"><X size={18}/></button>
              </div>
              
              <div className="my-4 space-y-2">
                <div className="w-10 h-10 bg-green-950/20 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-900/50">
                  <CheckCircle size={20}/>
                </div>
                <p className="font-serif text-lg text-brand-ink">PDF Generated</p>
                <p className="text-xs text-brand-ink/60">Milestone-linked quotes successfully bundled for My Nest Residency configurations.</p>
              </div>

              <button 
                onClick={() => { setShowQuoteSuccess(false); alert("Smart Quote PDF downloaded to local storage."); }}
                className="w-full btn-premium-primary py-2.5 text-xs uppercase tracking-widest font-semibold cursor-pointer flex items-center justify-center gap-2 shadow"
              >
                <Download size={14}/> Download PDF Quote
              </button>
            </motion.div>
          </>
        )}

      </AnimatePresence>

      <AddLeadModal isOpen={isAddLeadModalOpen} onClose={() => setIsAddLeadModalOpen(false)} userId={user.id} />
    </div>
  );
};
