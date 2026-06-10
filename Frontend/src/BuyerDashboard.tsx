import React, { useState } from 'react';
import { User, Project } from './data';
import { 
  Building, CheckCircle, Clock, AlertCircle, Download, Eye, FileText, 
  MapPin, Sparkles, ArrowRight, Upload, Bell, Zap, Percent, Edit2, 
  ChevronRight, Phone, MessageCircle, X, Copy, Check, Send, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BuyerDashboardProps {
  user: User;
  projects: Project[];
  assignedAgent?: User;
  setActiveTab?: (tab: 'overview' | 'team' | 'roles' | 'pipeline' | 'inventory' | 'projects' | 'schedules' | 'documents' | 'project_details' | 'budget-roi') => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ user, projects, assignedAgent, setActiveTab }) => {
  const project = projects[0]; // Assuming first project for demo
  const bookedUnit = project?.units.find(u => u.status === 'Booked' || u.status === 'Sold');

  // Modals & Action States
  const [droneModalOpen, setDroneModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'success'>('details');
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callTimer, setCallTimer] = useState('00:00');
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{sender: 'user' | 'agent', text: string}[]>([
    { sender: 'agent', text: `Hello ${user.name.split(' ')[0]}, how can I assist you with your property at My Nest today?` }
  ]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedReferralType, setSelectedReferralType] = useState<'2BHK' | '3BHK'>('2BHK');
  const [previewDoc, setPreviewDoc] = useState<{name: string, date: string, content: string, pendingSign?: boolean} | null>(null);
  const [signedDoc, setSignedDoc] = useState(false);

  // Dynamic Payment States
  const [paidMilestones, setPaidMilestones] = useState<string[]>(['m1']); // m1 is completed by default
  const [totalPaidPercent, setTotalPaidPercent] = useState(25);
  const [nextDuePercent, setNextDuePercent] = useState(10);
  const [nextDueAmount, setNextDueAmount] = useState('₹12,00,000');

  // Mock Referral Data
  const referralIncentives = {
    '2BHK': '₹1,00,000',
    '3BHK': '₹2,50,000'
  };

  const discountStatus = 'Approved by Director';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://mynest.baheti.com/invite?ref=${user.id}&type=${selectedReferralType.toLowerCase()}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleSimulatePayment = () => {
    setPaymentStep('processing');
    setTimeout(() => {
      setPaymentStep('success');
      setPaidMilestones(prev => [...prev, 'm2']);
      setTotalPaidPercent(35);
      setNextDuePercent(15);
      setNextDueAmount('₹18,00,000');
    }, 2500);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newMsg = { sender: 'user' as const, text: chatMessage };
    setChatHistory(prev => [...prev, newMsg]);
    setChatMessage('');

    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        sender: 'agent',
        text: `Thanks for writing. I have received your request regarding "${newMsg.text}". I'll compile the details and call you shortly!`
      }]);
    }, 1500);
  };

  const handleSignDocument = () => {
    setSignedDoc(true);
    setTimeout(() => {
      setPreviewDoc(null);
      setSignedDoc(false);
      alert("Document Builder Buyer Agreement signed successfully using secure Aadhaar e-Sign!");
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Concierge Greeting */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-brand-ink mb-2">
            {getGreeting()}, {user.name.split(' ')[0]}.
          </h1>
          <p className="text-brand-ink/60 text-sm font-light">Welcome to your private member's portal.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Construction & Payments */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Unit Overview */}
            <section>
              <h2 className="text-[10px] uppercase tracking-widest font-semibold mb-4 text-brand-ink/50">Your Property</h2>
              {bookedUnit ? (
                <div className="flex flex-col sm:flex-row gap-6 card-premium p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl -z-10"></div>
                  <div className="w-32 h-32 bg-brand-bg rounded-lg flex items-center justify-center font-serif text-4xl text-brand-accent border border-brand-accent/20 shadow-inner">
                    {bookedUnit.unitNumber}
                  </div>
                  <div className="flex flex-col justify-center flex-1 z-10">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-serif text-2xl mb-1 text-brand-ink">{project.name}</h3>
                        <p className="text-brand-accent font-medium text-lg mb-2">{bookedUnit.price}</p>
                      </div>
                      <div className="text-[10px] uppercase tracking-widest font-semibold text-brand-bg bg-brand-accent px-3 py-1 rounded-sm shadow-sm">
                        {bookedUnit.status}
                      </div>
                    </div>
                    <p className="text-sm text-brand-ink/60 flex items-center gap-1 mb-4">
                      <MapPin size={14} className="text-brand-accent/70"/> {project.location}
                    </p>
                    
                    {/* Live Discount Status */}
                    <div className="bg-brand-bg/50 p-3 rounded-lg border border-brand-border/10 flex items-center justify-between backdrop-blur-sm">
                      <span className="text-xs text-brand-ink/70 flex items-center gap-2">
                        <Percent size={14} className="text-brand-accent"/> Special Discount Applied
                      </span>
                      <span className="text-xs font-semibold text-brand-accent flex items-center gap-1">
                        <CheckCircle size={12}/> {discountStatus}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card-premium p-6 text-center text-brand-ink/60">
                  No units booked yet.
                </div>
              )}
            </section>

            {/* Live Construction & Payment Schedule */}
            <section>
              <h2 className="text-[10px] uppercase tracking-widest font-semibold mb-4 flex items-center gap-2 text-brand-ink/50">
                <Building size={14} className="text-brand-accent" /> Live Construction & Payments
              </h2>
              <div className="card-premium p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-bg via-brand-accent/50 to-brand-bg opacity-50"></div>
                
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h3 className="font-serif text-xl mb-1 text-brand-ink">Project Timeline</h3>
                    <p className="text-xs text-brand-ink/50">Track physical progress and upcoming payments</p>
                  </div>
                  <div className="text-right bg-brand-bg/80 p-4 rounded-lg border border-brand-border/10 backdrop-blur-md">
                    <p className="text-sm font-semibold text-brand-ink mb-1">Total Paid: <span className="text-brand-accent">{totalPaidPercent}%</span></p>
                    <p className="text-xs text-brand-ink/50">Next Due: {nextDuePercent}% ({nextDueAmount})</p>
                  </div>
                </div>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-3.5 before:-translate-x-px before:h-full before:w-px before:bg-gradient-to-b before:from-brand-accent before:via-brand-border/20 before:to-transparent">
                  {project?.milestones?.map((milestone, idx) => {
                    const isCompleted = paidMilestones.includes(milestone.id) || milestone.status === 'completed';
                    const isInProgress = milestone.id === 'm2' && !paidMilestones.includes('m2');

                    return (
                      <div key={milestone.id} className={`relative flex items-start gap-6 group ${isCompleted ? 'is-active' : ''}`}>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border shadow-2xl shrink-0 z-10 mt-1 transition-colors ${
                          isCompleted ? 'border-brand-accent bg-brand-accent text-brand-bg' : 
                          isInProgress ? 'border-brand-accent bg-brand-bg text-brand-accent' : 
                          'border-brand-border/20 bg-brand-bg text-brand-ink/20'
                        }`}>
                          {isCompleted ? <CheckCircle size={14} /> : 
                           isInProgress ? <Clock size={14} /> : 
                           <div className="w-1.5 h-1.5 bg-brand-border/30 rounded-full"></div>}
                        </div>
                        
                        <div className={`flex-1 p-5 rounded-xl border transition-all duration-300 ${
                          isCompleted ? 'border-brand-border/10 bg-brand-bg/50 hover:bg-brand-bg/80' : 
                          isInProgress ? 'border-brand-accent/30 bg-brand-accent/5 shadow-[0_0_15px_rgba(212,175,55,0.05)]' : 
                          'border-brand-border/5 opacity-50'
                        }`}>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <span className="text-base font-serif text-brand-ink block mb-1">{milestone.name}</span>
                              <p className="text-xs text-brand-ink/50">
                                {isCompleted ? `Completed on ${new Date(milestone.actualDate || '2026-05-15').toLocaleDateString()}` : 
                                 `Target: ${new Date(milestone.targetDate).toLocaleDateString()}`}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`text-[9px] uppercase tracking-widest font-semibold px-2 py-1 rounded-sm inline-block mb-1 ${
                                isCompleted ? 'text-brand-bg bg-brand-accent' : 
                                isInProgress ? 'text-brand-accent bg-brand-accent/10 border border-brand-accent/20' : 
                                'text-brand-ink/40 bg-brand-bg border border-brand-border/10'
                              }`}>
                                {isCompleted ? 'Completed' : 
                                 isInProgress ? 'In Progress' : 
                                 'Upcoming'}
                              </span>
                              <p className="text-sm font-semibold block text-brand-ink">{milestone.percentageDue}% Due</p>
                            </div>
                          </div>
                          
                          {/* Visual Progress Tracker (Photos/Video) */}
                          {isCompleted && milestone.id === 'm1' && (
                            <div 
                              onClick={() => setDroneModalOpen(true)}
                              className="mt-5 mb-2 h-36 bg-brand-bg rounded-lg border border-brand-border/10 overflow-hidden relative group cursor-pointer"
                            >
                              <img src="https://images.unsplash.com/photo-1541888081622-15cb2a64c486?auto=format&fit=crop&q=80&w=800" alt="Construction Progress" className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 flex items-center justify-center bg-brand-bg/40 group-hover:bg-transparent transition-colors duration-500">
                                <span className="bg-brand-bg/90 backdrop-blur-md text-brand-ink text-xs font-semibold px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 border border-brand-border/10">
                                  <Eye size={14} className="text-brand-accent"/> View Drone Footage
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Automated Payment Demands */}
                          {isInProgress && milestone.id === 'm2' && (
                            <div className="mt-5 pt-5 border-t border-brand-border/10 bg-red-950/20 -mx-5 -mb-5 p-5 rounded-b-xl border-x-0 border-b-0">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                  <span className="text-sm font-serif text-red-400 flex items-center gap-2 mb-1 animate-pulse">
                                    <AlertCircle size={16}/> Payment Due: {nextDueAmount}
                                  </span>
                                  <p className="text-xs text-red-400/70">Please process secure milestone payment to continue building.</p>
                                </div>
                                <button 
                                  onClick={() => { setPaymentStep('details'); setPaymentModalOpen(true); }}
                                  className="btn-premium-primary w-full sm:w-auto text-[10px] uppercase tracking-widest px-5 py-2.5 shadow-lg"
                                >
                                  Pay Now
                                </button>
                              </div>
                            </div>
                          )}

                          {isCompleted && milestone.id === 'm2' && (
                            <div className="mt-5 pt-4 border-t border-brand-border/10 flex justify-between items-center">
                              <span className="text-xs font-semibold text-brand-accent flex items-center gap-2">
                                <CheckCircle size={14}/> Payment Received
                              </span>
                              <button 
                                onClick={() => setReceiptModalOpen(true)}
                                className="text-xs font-semibold text-brand-ink/60 hover:text-brand-accent transition-colors flex items-center gap-1"
                              >
                                <Download size={14}/> Download Receipt
                              </button>
                            </div>
                          )}

                          {isCompleted && milestone.id === 'm1' && (
                            <div className="mt-5 pt-4 border-t border-brand-border/10 flex justify-between items-center">
                              <span className="text-xs font-semibold text-brand-accent flex items-center gap-2">
                                <CheckCircle size={14}/> Payment Received
                              </span>
                              <button 
                                onClick={() => setReceiptModalOpen(true)}
                                className="text-xs font-semibold text-brand-ink/60 hover:text-brand-accent transition-colors flex items-center gap-1"
                              >
                                <Download size={14}/> Download Receipt
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
        </div>

        {/* Right Column: Referrals & Advisor */}
        <div className="space-y-6">
          
          {/* Post-Sale & Referral Loop */}
          <section>
            <h2 className="text-[10px] uppercase tracking-widest font-semibold mb-4 flex items-center gap-2 text-brand-ink/50">
              <Users size={14} className="text-brand-accent" /> Referral Rewards
            </h2>
            <div className="card-premium overflow-hidden relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-brand-accent/5 rounded-full blur-3xl"></div>
              
              <div className="p-6 relative z-10">
                <h3 className="font-serif text-2xl mb-2 text-brand-ink">Invite Friends & Family</h3>
                <p className="text-sm text-brand-ink/50 mb-8 font-light leading-relaxed">
                  You've unlocked our premium referral tier. Earn exclusive rewards when your network joins the My Nest community.
                </p>

                <div className="space-y-3 mb-8">
                  <button
                    type="button"
                    onClick={() => setSelectedReferralType('2BHK')}
                    className={`w-full text-left bg-brand-bg/50 border p-4 rounded-lg flex justify-between items-center transition-all ${
                      selectedReferralType === '2BHK'
                        ? 'border-brand-accent shadow-[0_0_15px_rgba(212,175,55,0.15)] bg-brand-accent/5'
                        : 'border-brand-border/10 hover:border-brand-border/30'
                    } backdrop-blur-sm cursor-pointer`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedReferralType === '2BHK' ? 'border-brand-accent' : 'border-brand-border'}`}>
                        {selectedReferralType === '2BHK' && <div className="w-2 h-2 rounded-full bg-brand-accent"></div>}
                      </div>
                      <span className="text-sm font-medium text-brand-ink/80">Refer a 2BHK</span>
                    </div>
                    <span className="text-sm font-serif text-brand-accent font-semibold">{referralIncentives['2BHK']}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedReferralType('3BHK')}
                    className={`w-full text-left border p-4 rounded-lg flex justify-between items-center relative overflow-hidden transition-all ${
                      selectedReferralType === '3BHK'
                        ? 'border-brand-accent bg-brand-accent/10 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                        : 'bg-brand-bg/20 border-brand-border/10 hover:border-brand-border/30'
                    } backdrop-blur-sm cursor-pointer`}
                  >
                    <div className="absolute -left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-accent rounded-r-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>
                    <div className="flex items-center gap-3 pl-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedReferralType === '3BHK' ? 'border-brand-accent' : 'border-brand-border'}`}>
                        {selectedReferralType === '3BHK' && <div className="w-2 h-2 rounded-full bg-brand-accent"></div>}
                      </div>
                      <div>
                        <span className="text-sm font-medium block text-brand-ink">Refer a 3BHK</span>
                        <span className="text-[9px] text-brand-accent uppercase tracking-widest font-semibold mt-1 block">High Demand Bonus</span>
                      </div>
                    </div>
                    <span className="text-lg font-serif text-brand-accent font-semibold">{referralIncentives['3BHK']}</span>
                  </button>
                </div>

                <button 
                  onClick={handleCopyLink}
                  className="btn-premium-primary w-full text-[10px] uppercase tracking-widest px-4 py-4 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      Link Copied! <Check size={14} />
                    </>
                  ) : (
                    <>
                      Generate Invite Link <ArrowRight size={14} />
                    </>
                  )}
                </button>

                {copiedLink && (
                  <div className="mt-3 p-3 bg-brand-accent/10 border border-brand-accent/20 rounded-lg text-center animate-in fade-in duration-300">
                    <p className="text-[10px] text-brand-accent font-mono break-all">
                      https://mynest.baheti.com/invite?ref={user.id}&type={selectedReferralType.toLowerCase()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Assigned Advisor - The Relationship Manager Card */}
          {assignedAgent && (
            <section>
              <h2 className="text-[10px] uppercase tracking-widest font-semibold mb-4 flex items-center gap-2 text-brand-ink/50">
                <Sparkles size={14} className="text-brand-accent" /> Relationship Manager
              </h2>
              <div className="card-premium p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-16 h-16 rounded-full bg-brand-bg border border-brand-accent/30 flex items-center justify-center overflow-hidden shrink-0">
                    {assignedAgent.avatar ? (
                      <img src={assignedAgent.avatar} alt={assignedAgent.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    ) : (
                      <span className="font-serif text-2xl text-brand-accent">{assignedAgent.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-xl mb-0.5 text-brand-ink group-hover:text-brand-accent transition-colors">{assignedAgent.name}</h3>
                    <p className="text-brand-ink/50 text-xs mb-3">Dedicated Concierge</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
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
                          (window as any).callInterval = interval;
                        }}
                        className="btn-premium-secondary flex-1 text-[10px] uppercase tracking-widest py-2 flex items-center justify-center gap-1"
                      >
                        <Phone size={12} /> Call
                      </button>
                      <button 
                        onClick={() => setShowChatModal(true)}
                        className="btn-premium-secondary flex-1 text-[10px] uppercase tracking-widest py-2 flex items-center justify-center gap-1"
                      >
                        <MessageCircle size={12} /> Chat
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Elegant Document Vault Preview */}
          <section>
            <h2 className="text-[10px] uppercase tracking-widest font-semibold mb-4 flex items-center gap-2 text-brand-ink/50">
              <FileText size={14} className="text-brand-accent" /> Document Vault
            </h2>
            <div className="card-premium p-6">
              <div className="space-y-3">
                {[
                  { name: 'Allotment Letter', date: 'Oct 12, 2026', icon: FileText, content: 'This certifies the allotment of Unit 402, 3BHK Premium at My Nest Residency to the buyer, under Baheti Housing schemes. All parameters, rates, and basic amenities specifications stand locked.' },
                  { name: 'Payment Receipt #1', date: 'Oct 15, 2026', icon: Download, content: 'Receipt token payment collection of ₹10,00,000 for booking verification. Mode of transaction: Secured Wire Transfer. Status: Cleared and settled.' },
                  { name: 'Builder Buyer Agreement', date: 'Pending Signature', icon: Edit2, pending: true, content: 'Official contract for purchase and development specifications of the property. Requires Aadhaar e-Sign authorization. Clicking sign authorizes builder-buyer terms.' }
                ].map((doc, i) => (
                  <div 
                    key={i} 
                    onClick={() => setPreviewDoc({ name: doc.name, date: doc.date, content: doc.content, pendingSign: doc.pending })}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-brand-bg/50 border border-transparent hover:border-brand-border/10 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${doc.pending ? 'bg-brand-accent/10 text-brand-accent animate-pulse' : 'bg-brand-bg text-brand-ink/50 group-hover:text-brand-accent transition-colors'}`}>
                        <doc.icon size={14} />
                      </div>
                      <div>
                        <p className={`text-sm ${doc.pending ? 'text-brand-accent font-medium' : 'text-brand-ink/80'}`}>{doc.name}</p>
                        <p className="text-[10px] text-brand-ink/40">{doc.date}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-brand-ink/20 group-hover:text-brand-accent transition-colors" />
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setActiveTab?.('documents')}
                className="btn-premium-secondary w-full mt-4 text-[10px] uppercase tracking-widest py-2"
              >
                View All Documents
              </button>
            </div>
          </section>

        </div>
      </div>

      {/* =============================================================== */}
      {/* Dynamic Modal Components */}
      {/* =============================================================== */}
      <AnimatePresence>
        
        {/* Drone Footage Modal */}
        {droneModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-bg/85 backdrop-blur-sm z-50"
              onClick={() => setDroneModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto max-w-2xl h-[450px] card-premium z-50 overflow-hidden flex flex-col p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-serif text-lg text-brand-ink">Live Drone Construction Footage</h3>
                  <p className="text-[10px] uppercase tracking-widest text-brand-ink/50">My Nest Residency — Block A Plinth Verification</p>
                </div>
                <button onClick={() => setDroneModalOpen(false)} className="text-brand-ink/50 hover:text-brand-ink"><X size={20}/></button>
              </div>
              <div className="flex-1 rounded-lg border border-brand-border/10 overflow-hidden relative bg-brand-bg">
                <img src="https://images.unsplash.com/photo-1541888081622-15cb2a64c486?auto=format&fit=crop&q=80&w=1200" alt="Drone view" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-4 border border-brand-accent/30 pointer-events-none flex flex-col justify-between p-4">
                  <div className="flex justify-between text-[10px] font-mono text-brand-accent tracking-widest bg-brand-bg/60 p-2 rounded">
                    <span>REC ● 4K 60FPS</span>
                    <span>ALT: 45M | SPD: 2.3 M/S</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-brand-accent tracking-widest bg-brand-bg/60 p-2 rounded">
                    <span>GPS: 19.8640° N, 75.3370° E</span>
                    <span>BATTERY: 78%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Secure Milestone Payment Modal */}
        {paymentModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-bg/85 backdrop-blur-sm z-50"
              onClick={() => setPaymentModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              className="fixed inset-0 m-auto max-w-md h-[400px] card-premium z-50 overflow-hidden flex flex-col p-6 justify-between"
            >
              <div className="flex justify-between items-center border-b border-brand-border/20 pb-4">
                <span className="font-serif text-lg text-brand-ink">Secure Payment Gateway</span>
                <button onClick={() => setPaymentModalOpen(false)} className="text-brand-ink/50 hover:text-brand-ink"><X size={20}/></button>
              </div>

              <div className="flex-1 py-6 flex flex-col justify-center items-center text-center">
                {paymentStep === 'details' && (
                  <div className="space-y-4 w-full">
                    <p className="text-xs uppercase tracking-widest text-brand-ink/50">Milestone 2: Plinth Completion</p>
                    <p className="font-serif text-3xl text-brand-accent">{nextDueAmount}</p>
                    <p className="text-xs text-brand-ink/60 px-4">This transaction is secured via 256-bit encryption. The funds will be credited to Baheti Housing Escrow account.</p>
                    <button 
                      onClick={handleSimulatePayment}
                      className="btn-premium-primary w-full py-3.5 text-xs uppercase tracking-widest shadow-lg"
                    >
                      Authorize Payment
                    </button>
                  </div>
                )}

                {paymentStep === 'processing' && (
                  <div className="space-y-6">
                    <motion.div 
                      animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full mx-auto"
                    />
                    <p className="text-sm font-medium">Processing payment...</p>
                    <p className="text-[10px] uppercase tracking-widest text-brand-ink/50">Connecting with HDFC Secured Network</p>
                  </div>
                )}

                {paymentStep === 'success' && (
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-brand-accent text-brand-bg rounded-full flex items-center justify-center mx-auto shadow-xl">
                      <CheckCircle size={24}/>
                    </div>
                    <p className="font-serif text-xl text-brand-ink">Payment Successful!</p>
                    <p className="text-xs text-brand-ink/60">Your payment of {nextDueAmount} has been credited. Receipt generated.</p>
                    <button 
                      onClick={() => { setPaymentModalOpen(false); setReceiptModalOpen(true); }}
                      className="btn-premium-secondary px-6 py-2 text-[10px] uppercase tracking-widest font-semibold"
                    >
                      View Receipt
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}

        {/* Payment Receipt Modal */}
        {receiptModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-bg/85 backdrop-blur-sm z-50"
              onClick={() => setReceiptModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto max-w-sm h-[480px] card-premium z-50 overflow-hidden flex flex-col p-6 justify-between font-mono text-xs text-brand-ink/80"
            >
              <div className="flex justify-between items-center border-b border-dashed border-brand-border/30 pb-4">
                <span className="font-bold uppercase tracking-widest text-brand-accent">BAHETI HOUSING RECEIPT</span>
                <button onClick={() => setReceiptModalOpen(false)} className="text-brand-ink/50 hover:text-brand-ink"><X size={18}/></button>
              </div>

              <div className="space-y-4 py-6 border-b border-dashed border-brand-border/30">
                <div className="flex justify-between">
                  <span>RECEIPT NO:</span>
                  <span className="font-bold text-brand-ink">BH-PL-89472</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE/TIME:</span>
                  <span>{new Date().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>CLIENT NAME:</span>
                  <span>{user.name.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>PROPERTY:</span>
                  <span>{project.name.toUpperCase()} (UNIT {bookedUnit?.unitNumber})</span>
                </div>
                <div className="flex justify-between">
                  <span>TRANSACTION VALUE:</span>
                  <span className="text-brand-accent font-bold">₹12,00,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span>PAYMENT MODE:</span>
                  <span>WIRE / HDFC GATEWAY</span>
                </div>
                <div className="flex justify-between">
                  <span>STATUS:</span>
                  <span className="text-green-500 font-bold">SETTLED</span>
                </div>
              </div>

              <div className="pt-4 text-center text-[9px] text-brand-ink/40 space-y-3">
                <p>Digital Transaction Hash:<br/>0x72a5bcebd8f5788b71c08e8b8d2345</p>
                <button 
                  onClick={() => alert("Mock PDF receipt downloaded to local storage.")}
                  className="btn-premium-secondary w-full py-2 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Download size={12}/> Download PDF Copy
                </button>
              </div>
            </motion.div>
          </>
        )}

        {/* Relationship Manager Call Dialer Modal */}
        {showCallModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-bg/90 backdrop-blur-md z-50"
            />
            <motion.div 
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              className="fixed inset-0 m-auto max-w-xs h-[320px] card-premium z-50 p-6 flex flex-col items-center justify-between text-center"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand-bg border-2 border-brand-accent flex items-center justify-center overflow-hidden mx-auto shadow-xl">
                  {assignedAgent?.avatar ? (
                    <img src={assignedAgent.avatar} alt="Agent" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-serif text-2xl text-brand-accent">{assignedAgent?.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-serif text-lg text-brand-ink">{assignedAgent?.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-brand-accent mt-0.5">Calling Concierge...</p>
                </div>
                <div className="font-mono text-lg text-brand-ink/70">{callTimer}</div>
              </div>

              <button 
                onClick={() => {
                  clearInterval((window as any).callInterval);
                  setShowCallModal(false);
                }}
                className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors shadow-lg"
              >
                <X size={20}/>
              </button>
            </motion.div>
          </>
        )}

        {/* Relationship Manager Chat Drawer */}
        {showChatModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm z-40"
              onClick={() => setShowChatModal(false)}
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-brand-surface shadow-2xl z-50 flex flex-col border-l border-brand-border"
            >
              <div className="p-4 border-b border-brand-border/30 flex justify-between items-center bg-brand-bg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-bg border border-brand-accent/20 flex items-center justify-center overflow-hidden shrink-0">
                    {assignedAgent?.avatar ? (
                      <img src={assignedAgent.avatar} alt="Agent" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-serif text-lg text-brand-accent">{assignedAgent?.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif text-sm text-brand-ink">{assignedAgent?.name}</h3>
                    <span className="text-[9px] uppercase tracking-widest text-green-500 font-semibold">Online</span>
                  </div>
                </div>
                <button onClick={() => setShowChatModal(false)} className="text-brand-ink/50 hover:text-brand-ink"><X size={20}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-bg/30 custom-scrollbar">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-lg p-3 text-xs leading-relaxed ${
                      msg.sender === 'user' ? 'bg-brand-accent text-brand-bg font-medium' : 'bg-brand-secondary border border-brand-border text-brand-ink/90'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChatMessage} className="p-4 border-t border-brand-border/30 bg-brand-bg flex gap-2">
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-brand-secondary border border-brand-border rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-accent text-brand-ink placeholder:text-brand-ink/35 transition-all"
                />
                <button 
                  type="submit"
                  className="btn-premium-primary p-2 flex items-center justify-center"
                >
                  <Send size={14} />
                </button>
              </form>
            </motion.div>
          </>
        )}

        {/* Document Vault Preview & Signing Modal */}
        {previewDoc && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-bg/85 backdrop-blur-sm z-50"
              onClick={() => setPreviewDoc(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto max-w-md h-[460px] card-premium z-50 overflow-hidden flex flex-col p-6 justify-between"
            >
              <div className="flex justify-between items-center border-b border-brand-border/20 pb-4 bg-brand-bg/50 -mx-6 -mt-6 p-6">
                <div>
                  <h3 className="font-serif text-lg text-brand-ink">{previewDoc.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-brand-ink/40">vault document preview — {previewDoc.date}</p>
                </div>
                <button onClick={() => setPreviewDoc(null)} className="text-brand-ink/50 hover:text-brand-ink"><X size={20}/></button>
              </div>

              <div className="flex-1 py-6 overflow-y-auto text-xs leading-relaxed text-brand-ink/70 custom-scrollbar font-mono bg-brand-bg/20 p-4 border border-brand-border/10 rounded my-4">
                {previewDoc.content}
              </div>

              <div className="flex gap-4">
                {previewDoc.pendingSign ? (
                  <>
                    <button 
                      onClick={() => setPreviewDoc(null)}
                      className="btn-premium-secondary flex-1 py-2.5 text-xs uppercase tracking-widest font-semibold"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSignDocument}
                      disabled={signedDoc}
                      className="btn-premium-primary flex-1 py-2.5 text-xs uppercase tracking-widest flex items-center justify-center gap-1"
                    >
                      {signedDoc ? 'Signing...' : (
                        <>
                          e-Sign with Aadhaar <Check size={14}/>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => {
                      setPreviewDoc(null);
                      alert("Document downloaded to local storage.");
                    }}
                    className="btn-premium-primary w-full py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Download size={14}/> Download Document
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}

      </AnimatePresence>
    </div>
  );
};
