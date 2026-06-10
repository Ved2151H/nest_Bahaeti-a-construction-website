import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, doc, setDoc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { User, USERS, ROLES, RoleDefinition, Permission, PROJECTS, Project, UnitType, Deal, DEVELOPER_DEALS } from './data';
import { 
  LogOut, Home, Heart, Users, TrendingUp, Calendar, 
  MapPin, Building, Shield, Plus, LayoutDashboard, 
  X, Edit2, UserMinus, Key, CheckSquare, Square, MoreVertical,
  Eye, MessageSquare, Camera, FileText, CheckCircle, ArrowRight, Layers, Minus, IndianRupee, Phone, Activity, Target, PieChart as PieChartIcon, BarChart2, DollarSign, Flame, ThermometerSun, Snowflake, Clock, History, AlertCircle, Search, Check, ListTodo, MessageCircle, Filter, Database, ChevronRight, ChevronLeft, Download, Upload
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import ScheduleCalendar from './ScheduleCalendar';
import { DirectorDashboard } from './DirectorDashboard';
import { DirectorTeamView } from './DirectorTeamView';
import { DirectorBudgetROI } from './DirectorBudgetROI';
import { DeveloperInsights } from './DeveloperInsights';
import { DeveloperProjectInsights } from './DeveloperProjectInsights';
import { InventoryStackPlan } from './InventoryStackPlan';
import { AdvisorDashboard } from './AdvisorDashboard';
import { BuyerDashboard } from './BuyerDashboard';
import { BuyerDocumentVault } from './BuyerDocumentVault';
import { BuyerProjectDetails } from './BuyerProjectDetails';
import { GlobalSearch } from './GlobalSearch';
import { AIChatDrawer } from './AIChatDrawer';
import { DealDocuments } from './DealDocuments';

import { generateFollowUpMessage, analyzeLead } from './services/geminiService';
import { Bot, Copy, Sparkles } from 'lucide-react';

const PERMISSION_LABELS: Record<Permission, string> = {
  manage_team: 'Manage Team Directory',
  manage_roles: 'Manage Roles & Permissions',
  view_global_pipeline: 'View Global Pipeline',
  view_own_pipeline: 'View Own Pipeline',
  manage_inventory: 'Manage Inventory'
};

export default function Dashboard({ user, onLogout, onGoToLanding }: { user: User, onLogout: () => void, onGoToLanding?: () => void }) {
  const [simulatedRole, setSimulatedRole] = useState<string>('r_dir');
  const effectiveUser = user.roleId === 'r_admin' ? {
    ...user,
    roleId: simulatedRole,
    id: simulatedRole === 'r_buyer' ? 'u_buyer1' :
        simulatedRole === 'r_developer' ? 'u_dev1' :
        simulatedRole === 'r_adv' ? 'u_adv1' :
        simulatedRole === 'r_dir' ? 'u_dir1' : user.id,
  } : user;

  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'roles' | 'pipeline' | 'inventory' | 'projects' | 'schedules' | 'documents' | 'project_details' | 'budget-roi'>('overview');
  
  const [localUsers, setLocalUsers] = useState<User[]>(USERS);
  
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData: User[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          id: doc.id,
          name: data.displayName || data.name || 'Unknown User',
          email: data.email || '',
          roleId: data.role === 'admin' ? 'r_admin' : 
                  data.role === 'director' ? 'r_dir' : 
                  data.role === 'advisor' ? 'r_adv' : 
                  data.role === 'developer' ? 'r_developer' : 'r_buyer',
          status: data.status || 'active',
          avatar: data.photoURL,
          assignedAgentId: data.assignedAgentId,
          reportsTo: data.reportsTo
        });
      });
      setLocalUsers(usersData);
    });
    return () => unsubscribe();
  }, []);

  const [localRoles, setLocalRoles] = useState<RoleDefinition[]>(ROLES);
  const [localProjects, setLocalProjects] = useState<Project[]>(PROJECTS);
  const [localDeals, setLocalDeals] = useState<Deal[]>(DEVELOPER_DEALS);
  const [firebaseUnits, setFirebaseUnits] = useState<Record<string, any>>({});

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'units'), (snapshot) => {
      const unitsMap: Record<string, any> = {};
      snapshot.forEach(doc => {
        unitsMap[doc.id] = { id: doc.id, ...doc.data() };
      });
      setFirebaseUnits(unitsMap);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'leads'), (snapshot) => {
      const dealsData: Deal[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        dealsData.push({
          id: doc.id,
          buyerName: data.name || data.buyerName || 'Unknown',
          buyerProfile: data.profile || data.buyerProfile || '',
          amount: typeof data.budget === 'number' ? `₹${(data.budget / 100000).toFixed(2)} L` : (data.amount || '₹0 L'),
          status: data.status || 'Lead',
          date: data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString() : new Date().toLocaleDateString(),
          temperature: data.temperature || 'Warm',
          daysInStage: data.daysInStage || 0,
          probability: data.probability || 50,
          history: data.history || [],
          verification: data.verification || 'Unverified',
          nextAction: data.nextAction || 'Initial Contact',
          source: data.source || 'Website',
          timeline: data.timeline || '1-3 Months',
          assignedTo: data.assignedTo || '',
          projectId: data.projectId || '',
          unitId: data.unitId || '',
          unitName: data.unitName || '',
          buyerId: data.buyerId || ''
        });
      });
      setLocalDeals(dealsData);
    });
    return () => unsubscribe();
  }, []);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isLogActivityOpen, setIsLogActivityOpen] = useState(false);
  const [newActivityNote, setNewActivityNote] = useState('');
  const [newActivityTemp, setNewActivityTemp] = useState<'Hot' | 'Warm' | 'Cold'>('Warm');
  const [newNextAction, setNewNextAction] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [generatedFollowUp, setGeneratedFollowUp] = useState<string | null>(null);
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  const [leadAnalysis, setLeadAnalysis] = useState<{ score: number, analysis: string } | null>(null);
  const [isAnalyzingLead, setIsAnalyzingLead] = useState(false);
  const [listingsViewMode, setListingsViewMode] = useState<'list' | 'map'>('list');
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [newLeadStep, setNewLeadStep] = useState<1 | 2>(1);
  const initialLeadForm = {
    buyerName: '',
    email: '',
    phone: '',
    buyerProfile: '',
    source: 'Website',
    timeline: '1-3 Months',
    assignedTo: user.id,
    projectId: '',
    unitId: '',
    unitName: '',
    amount: ''
  };
  const [leadForm, setLeadForm] = useState(initialLeadForm);

  useEffect(() => {
    setGeneratedFollowUp(null);
    setLeadAnalysis(null);
  }, [selectedDeal?.id]);

  useEffect(() => {
    const handleOpenSearch = () => setIsGlobalSearchOpen(true);
    window.addEventListener('open-global-search', handleOpenSearch);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('open-global-search', handleOpenSearch);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    // Mock seeding delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSeeding(false);
  };

  // Drag and Drop State
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<Deal['status'] | null>(null);
  const [stageGateModalOpen, setStageGateModalOpen] = useState(false);
  const [stageGateTargetStatus, setStageGateTargetStatus] = useState<Deal['status'] | null>(null);
  const [stageGateFormData, setStageGateFormData] = useState<any>({});

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(dealId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: Deal['status']) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStatus !== status) {
      setDragOverStatus(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverStatus(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: Deal['status']) => {
    e.preventDefault();
    setDragOverStatus(null);
    if (!draggedDealId) return;

    const deal = localDeals.find(d => d.id === draggedDealId);
    if (!deal || deal.status === newStatus) {
      setDraggedDealId(null);
      return;
    }

    // Open Stage-Gate Modal
    setStageGateTargetStatus(newStatus);
    setStageGateFormData({});
    setStageGateModalOpen(true);
  };

  const handleStageGateSubmit = async () => {
    if (!draggedDealId || !stageGateTargetStatus) return;

    const newHistoryEntry = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      note: `Moved to ${stageGateTargetStatus}.${Object.keys(stageGateFormData).length > 0 ? ' ' + Object.entries(stageGateFormData).map(([k, v]) => `${k}: ${v}`).join(', ') : ''}`,
      author: user.name
    };

    const deal = localDeals.find(d => d.id === draggedDealId);
    if (deal) {
      let updatedDeal = {
        ...deal,
        status: stageGateTargetStatus,
        ...stageGateFormData,
        history: [newHistoryEntry, ...deal.history]
      };

      // Automations
      if (stageGateTargetStatus === 'Site Visit') {
        updatedDeal.probability = Math.max(deal.probability, 40);
        updatedDeal.nextAction = 'Conduct Site Visit';
      } else if (stageGateTargetStatus === 'Negotiation') {
        updatedDeal.temperature = 'Hot';
        updatedDeal.probability = Math.max(deal.probability, 70);
        
        // Check if offer is significantly below base price
        if (stageGateFormData.offeredPrice && deal.amount) {
          const offerVal = parseInt(stageGateFormData.offeredPrice.replace(/\D/g, ''));
          const baseVal = parseInt(deal.amount.replace(/\D/g, ''));
          if (offerVal && baseVal && offerVal < baseVal * 0.95) {
            updatedDeal.actionRequired = true;
            updatedDeal.history.unshift({
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              note: 'System Flag: Offer is >5% below base price. Approval needed.',
              author: 'System'
            });
          }
        }
      } else if (stageGateTargetStatus === 'Booked') {
        updatedDeal.probability = 100;
        updatedDeal.actionRequired = false;
        updatedDeal.nextAction = 'Collect remaining documents';
        
        // Inventory Sync
        const unitToBook = stageGateFormData.finalUnitId || deal.unitId;
        if (unitToBook) {
          try {
            await updateDoc(doc(db, 'units', unitToBook), {
              status: 'Booked',
              linkedLeadId: deal.id,
              updatedAt: new Date()
            });
          } catch (e) {
            console.error('Failed to sync inventory:', e);
          }
        }
      } else if (stageGateTargetStatus === 'Lost') {
        updatedDeal.temperature = 'Cold';
        updatedDeal.probability = 0;
        updatedDeal.actionRequired = false;
        updatedDeal.nextAction = '';
        
        // Release Inventory
        const unitToRelease = deal.finalUnitId || deal.unitId;
        if (unitToRelease) {
          try {
            await updateDoc(doc(db, 'units', unitToRelease), {
              status: 'Available',
              linkedLeadId: null,
              updatedAt: new Date()
            });
          } catch (e) {
            console.error('Failed to release inventory:', e);
          }
        }
      }
      
      try {
        const { id, date, ...restDealData } = updatedDeal;
        await updateDoc(doc(db, 'leads', deal.id), {
          ...restDealData,
          updatedAt: new Date()
        });
      } catch (error) {
        console.error("Error updating deal status:", error);
      }
    }

    setDraggedDealId(null);
    setStageGateModalOpen(false);
    setStageGateTargetStatus(null);
    setStageGateFormData({});
  };
  
  const handleLogActivity = async () => {
    if (!selectedDeal || !newActivityNote.trim()) return;

    const newHistoryEntry = {
      date: 'Today', // In a real app, use current date
      note: newActivityNote,
      author: user.name
    };

    const updatedDeal = {
      ...selectedDeal,
      temperature: newActivityTemp,
      nextAction: newNextAction || selectedDeal.nextAction || '',
      history: [newHistoryEntry, ...selectedDeal.history]
    };
    
    try {
      const { id, date, ...restDealData } = updatedDeal;
      await updateDoc(doc(db, 'leads', selectedDeal.id), {
        ...restDealData,
        updatedAt: new Date()
      });
      setSelectedDeal(updatedDeal);
    } catch (error) {
      console.error("Error logging activity:", error);
    }
    
    setNewActivityNote('');
    setNewNextAction('');
    setIsLogActivityOpen(false);
  };

  const handleLeadFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'amount') {
      const numericValue = value.replace(/\D/g, '');
      const formatted = numericValue ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(parseInt(numericValue)) : '';
      setLeadForm(prev => ({ ...prev, amount: formatted }));
    } else {
      setLeadForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNextStep = () => {
    if (!leadForm.buyerName || !leadForm.buyerProfile) {
      alert('Please fill in required fields (Name, Profile)');
      return;
    }
    setNewLeadStep(2);
  };

  const submitLead = async (addAnother: boolean) => {
    if (!leadForm.projectId || !leadForm.unitName || !leadForm.amount) {
      alert('Please fill in required fields (Project, Unit, Budget)');
      return;
    }

    let prob = 20;
    let temp: 'Hot' | 'Warm' | 'Cold' = 'Warm';
    
    if (leadForm.source === 'Referral') prob += 20;
    if (leadForm.timeline === 'Immediate') prob += 30;
    if (leadForm.timeline === '1-3 Months') prob += 10;
    
    const numericAmount = parseInt(leadForm.amount.replace(/\D/g, '')) || 0;
    if (numericAmount > 1000000) prob += 10;
    
    if (prob >= 50) temp = 'Hot';
    else if (prob <= 20) temp = 'Cold';
    else temp = 'Warm';
    
    const nextAction = temp === 'Hot' ? 'Call within 24 hours' : 'Initial Contact';

    const newDealId = `deal_${Date.now()}`;
    const newLead = {
      id: newDealId,
      ...leadForm,
      status: 'Lead',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      temperature: temp,
      daysInStage: 0,
      probability: Math.min(prob, 99),
      history: [{
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        note: `Lead created via Wizard. System scored as ${temp} (${prob}% probability).`,
        author: user.name
      }],
      verification: 'Unverified',
      nextAction: nextAction
    };

    try {
      console.log('Creating lead:', newLead);
      
      // Save to Firebase
      const { id, date, ...restLeadData } = newLead;
      await addDoc(collection(db, 'leads'), {
        ...restLeadData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      if (addAnother) {
        setLeadForm({ ...initialLeadForm, assignedTo: user.id });
        setNewLeadStep(1);
      } else {
        closeNewLeadModal();
      }
    } catch (error: any) {
      console.error('Error creating lead:', error);
      alert(`Failed to create lead: ${error.message}`);
    }
  };

  const closeNewLeadModal = () => {
    setIsNewLeadModalOpen(false);
    setNewLeadStep(1);
    setLeadForm({ ...initialLeadForm, assignedTo: user.id });
  };

  const renderPropMaxDashboard = () => {
    const isDirector = effectiveUser.roleId === 'r_dir';
    
    // For Advisors, show their assigned deals. For Directors, show all deals in their projects.
    
    const actionItems = myDeals.filter(d => d.daysInStage > 7 || d.actionRequired || d.nextAction);
    const stalledDeals = myDeals.filter(d => d.daysInStage > 7);

    return (
      <div className="space-y-8">
        {/* Action Center */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-sm uppercase tracking-widest font-semibold text-brand-ink">Action Center</h2>
              <p className="text-xs text-brand-ink/60 mt-1">Your prioritized tasks for today</p>
            </div>
            {isDirector && (
              <div className="bg-red-900/20 text-red-400 px-3 py-1.5 rounded-sm text-xs font-bold flex items-center gap-2 border border-red-900/50">
                <AlertCircle size={14} /> {stalledDeals.length} Stalled Deals Require Attention
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card-premium overflow-hidden">
              <div className="p-4 border-b border-brand-border bg-brand-bg/50 flex items-center gap-2">
                <ListTodo size={16} className="text-brand-accent" />
                <h3 className="text-xs font-bold uppercase tracking-widest">To-Do List</h3>
              </div>
              <div className="divide-y divide-brand-border/10">
                {actionItems.slice(0, 5).map(deal => (
                  <div key={`action-${deal.id}`} className="p-4 hover:bg-brand-bg/30 transition-colors flex items-start gap-4">
                    <button className="mt-1 w-5 h-5 rounded border border-brand-border/50 flex items-center justify-center text-transparent hover:border-brand-accent hover:text-brand-accent transition-colors">
                      <Check size={12} />
                    </button>
                    <div className="flex-1 cursor-pointer" onClick={() => setSelectedDeal(deal)}>
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-sm">{deal.buyerName} <span className="text-brand-ink/50 font-normal text-xs">({deal.unitName})</span></p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-widest ${deal.actionRequired ? 'bg-red-900/40 text-red-700' : 'bg-brand-bg text-brand-ink/70'}`}>
                          {deal.actionRequired ? 'Approval Needed' : deal.status}
                        </span>
                      </div>
                      <p className="text-xs text-brand-ink/80">
                        {deal.actionRequired || deal.nextAction || `Stalled in ${deal.status} for ${deal.daysInStage} days`}
                      </p>
                    </div>
                  </div>
                ))}
                {actionItems.length === 0 && (
                  <div className="p-8 text-center text-brand-ink/50 text-sm">
                    You're all caught up! No pending actions.
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="bg-brand-surface p-5 rounded-xl shadow-sm border border-brand-border">
                <p className="text-[10px] uppercase tracking-widest text-brand-ink/50 mb-1">Pipeline Value</p>
                <p className="font-serif text-2xl text-brand-accent">{formatPrice(myDeals.reduce((sum, d) => sum + (d.status !== 'Booked' ? parsePrice(d.amount) : 0), 0))}</p>
                <p className="text-xs text-brand-ink/60 mt-2">Active deals across all stages</p>
              </div>
              <div className="bg-brand-surface p-5 rounded-xl shadow-sm border border-brand-border">
                <p className="text-[10px] uppercase tracking-widest text-brand-ink/50 mb-1">Closing Probability</p>
                <div className="flex items-end gap-2">
                  <p className="font-serif text-2xl text-green-400">68%</p>
                  <p className="text-xs text-brand-ink/60 mb-1">Avg. across Negotiation stage</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Pipeline */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-sm uppercase tracking-widest font-semibold text-brand-ink">Active Pipeline</h2>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {isDirector && (
                <div className="flex items-center gap-2 bg-brand-surface border border-brand-border rounded-sm px-3 py-1.5 flex-1 md:flex-none">
                  <Search size={14} className="text-brand-ink/40" />
                  <input 
                    type="text" 
                    placeholder="Search deals, clients, agents..." 
                    className="bg-transparent border-none outline-none text-xs w-full md:w-48 placeholder:text-brand-ink/40"
                  />
                </div>
              )}
              {isDirector && (
                <select className="bg-brand-surface border border-brand-border rounded-sm px-3 py-1.5 text-xs outline-none focus:border-brand-accent flex-1 md:flex-none">
                  <option value="all">All Agents</option>
                  <option value="t_adv1">Arjun Reddy</option>
                  <option value="t_adv2">Kavita Menon</option>
                </select>
              )}
              <button className="text-xs border border-brand-border/50 px-3 py-1.5 rounded-sm hover:bg-brand-bg transition-colors flex items-center gap-2 flex-1 md:flex-none justify-center">
                <Filter size={14} /> Filter
              </button>
              <button 
                onClick={() => setIsNewLeadModalOpen(true)}
                className="text-xs bg-brand-ink text-brand-bg px-3 py-1.5 rounded-sm hover:bg-brand-ink/90 transition-colors flex items-center gap-2 flex-1 md:flex-none justify-center"
              >
                <Plus size={14} /> New Lead
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
            {['Lead', 'Site Visit', 'Negotiation', 'Booked'].map(status => {
              const columnDeals = myDeals.filter(d => d.status === status);
              
              return (
                <div 
                  key={status} 
                  className={`bg-brand-bg/50 p-4 rounded-lg border flex flex-col h-[600px] min-w-[280px] transition-colors ${dragOverStatus === status ? 'border-brand-accent bg-brand-accent/5' : 'border-brand-border'}`}
                  onDragOver={(e) => handleDragOver(e, status as Deal['status'])}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, status as Deal['status'])}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/70">{status}</h4>
                    <span className="bg-brand-surface text-brand-ink text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {columnDeals.length}
                    </span>
                  </div>
                  
                  <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {columnDeals.map(deal => (
                      <div 
                        key={deal.id} 
                        onClick={() => setSelectedDeal(deal)} 
                        className={`bg-brand-surface p-3 rounded shadow-sm border transition-colors cursor-pointer group relative overflow-hidden ${
                          deal.status === 'Site Visit' && deal.daysInStage > 7 ? 'border-red-400 hover:border-red-500' :
                          deal.status === 'Site Visit' && deal.daysInStage >= 4 ? 'border-yellow-400 hover:border-yellow-500' :
                          'border-brand-border hover:border-brand-accent'
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal.id)}
                      >
                        <div className="w-full h-1 bg-brand-bg absolute top-0 left-0">
                          <div className={`h-full transition-all duration-500 ${
                            deal.status === 'Lead' ? 'w-1/4 bg-brand-accent/40' :
                            deal.status === 'Site Visit' ? 'w-2/4 bg-brand-accent/60' :
                            deal.status === 'Negotiation' ? 'w-3/4 bg-brand-accent/80' :
                            deal.status === 'Booked' ? 'w-full bg-green-500' :
                            deal.status === 'Lost' ? 'w-full bg-red-500' : 'w-0'
                          }`} />
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical size={14} className="text-brand-ink/40 hover:text-brand-ink" />
                        </div>
                        <div className="flex justify-between items-start mb-1 mt-1 pr-4">
                          <p className="font-semibold text-sm group-hover:text-brand-accent transition-colors">{deal.buyerName}</p>
                        </div>
                        <p className="text-[10px] text-brand-ink/60 mb-3 line-clamp-1">{deal.buyerProfile}</p>
                        
                        <div className="flex justify-between items-center text-xs mb-3">
                          <span className="bg-brand-bg px-2 py-1 rounded-sm text-[10px] font-medium">{deal.unitName}</span>
                          <span className="font-medium text-brand-accent">{deal.amount}</span>
                        </div>

                        {/* Quick Action Indicators */}
                        <div className="flex gap-2 mb-3">
                          {deal.temperature === 'Hot' && <span className="flex items-center gap-1 text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-sm"><Flame size={10}/> HOT</span>}
                          {deal.actionRequired && <span className="flex items-center gap-1 text-[9px] font-bold text-red-400 bg-red-50 px-1.5 py-0.5 rounded-sm"><AlertCircle size={10}/> ACTION</span>}
                        </div>

                        <div className="flex justify-between items-center border-t border-brand-border pt-2">
                          <span className={`text-[10px] flex items-center gap-1 ${deal.daysInStage > 7 ? 'text-red-400 font-medium' : deal.daysInStage >= 4 ? 'text-yellow-400' : 'text-green-600'}`}>
                            <Clock size={10} /> {deal.daysInStage}d
                          </span>
                          <span className="text-[10px] text-brand-ink/50 flex items-center gap-1">
                            <MessageSquare size={10} /> {deal.history.length}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  };

  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [userFormData, setUserFormData] = useState<Partial<User>>({});

  const [isRoleDrawerOpen, setIsRoleDrawerOpen] = useState(false);
  const [roleFormData, setRoleFormData] = useState<Partial<RoleDefinition>>({});

  // Helpers
  const getUserRole = (u: User) => localRoles.find(r => r.id === u.roleId);
  const hasPermission = (u: User, perm: Permission) => {
    const role = getUserRole(u);
    return role?.permissions.includes(perm) || false;
  };

  const currentUserRole = getUserRole(effectiveUser);
  const isTeamMember = !['r_buyer', 'r_developer'].includes(effectiveUser.roleId);

  // Relationship-based filtering
  const myProjects = localProjects.filter(p => p.developerId === effectiveUser.id);
  const developerDeals = localDeals.filter(d => myProjects.some(p => p.id === d.projectId));
  const assignedAgent = localUsers.find(u => u.id === effectiveUser.assignedAgentId);
  const myClients = localUsers.filter(u => u.assignedAgentId === effectiveUser.id);
  const myDeals = hasPermission(effectiveUser, 'view_global_pipeline') ? localDeals : localDeals.filter(d => d.assignedTo === effectiveUser.id);
  
  const teamMembers = localUsers.filter(u => !['r_buyer', 'r_developer'].includes(u.roleId));

  // Developer Financial Helpers
  const parsePrice = (priceStr: string | number) => {
    if (typeof priceStr === 'number') return priceStr;
    if (!priceStr) return 0;
    const num = parseFloat(String(priceStr).replace(/[^0-9.]/g, ''));
    if (String(priceStr).includes('Cr')) return num * 10000000;
    if (String(priceStr).includes('L')) return num * 100000;
    return num;
  };

  const formatPrice = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val}`;
  };

  const totalPipelineValue = localDeals.reduce((sum, deal) => sum + parsePrice(deal.amount), 0);
  const myPipelineValue = localDeals.filter(d => d.assignedTo === effectiveUser.id).reduce((sum, deal) => sum + parsePrice(deal.amount), 0);

  let totalDeveloperRevenue = 0;
  let totalDeveloperTIV = 0;
  myProjects.forEach(p => {
    p.unitTypes.forEach(ut => {
      const price = parsePrice(ut.basePrice);
      const sold = ut.totalUnits - ut.availableUnits;
      totalDeveloperRevenue += sold * price;
      totalDeveloperTIV += ut.availableUnits * price;
    });
  });

  const handleUpdateInventory = (projectId: string, unitTypeId: string, delta: number) => {
    setLocalProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        unitTypes: p.unitTypes.map(ut => {
          if (ut.id !== unitTypeId) return ut;
          const newAvailable = Math.max(0, Math.min(ut.totalUnits, ut.availableUnits + delta));
          return { ...ut, availableUnits: newAvailable };
        })
      };
    }));
  };

  // User Drawer
  const openUserDrawer = (editUser?: User) => {
    if (editUser) {
      setUserFormData(editUser);
    } else {
      setUserFormData({ 
        id: 'new_u_' + Date.now(), 
        name: '', 
        email: '', 
        roleId: 'r_adv', 
        status: 'active',
        reportsTo: user.id 
      });
    }
    setIsUserDrawerOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const roleMap: Record<string, string> = {
        'r_admin': 'admin',
        'r_dir': 'director',
        'r_adv': 'advisor',
        'r_developer': 'developer',
        'r_buyer': 'buyer'
      };
      
      const userData = {
        displayName: userFormData.name,
        email: userFormData.email,
        role: roleMap[userFormData.roleId] || 'buyer',
        status: userFormData.status,
        assignedAgentId: userFormData.assignedAgentId || null,
        reportsTo: userFormData.reportsTo || null,
        updatedAt: new Date()
      };

      if (userFormData.id?.startsWith('new_u_')) {
        const newDocRef = doc(collection(db, 'users'));
        await setDoc(newDocRef, {
          ...userData,
          uid: newDocRef.id,
          createdAt: new Date()
        });
      } else {
        await updateDoc(doc(db, 'users', userFormData.id), userData);
      }
      setIsUserDrawerOpen(false);
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Failed to save user. Please try again.");
    }
  };

  // Role Drawer
  const openRoleDrawer = (editRole?: RoleDefinition) => {
    if (editRole) {
      setRoleFormData(editRole);
    } else {
      setRoleFormData({
        id: 'new_r_' + Date.now(),
        name: '',
        permissions: [],
        level: 5
      });
    }
    setIsRoleDrawerOpen(true);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (roleFormData.id?.startsWith('new_r_')) {
      setLocalRoles([...localRoles, roleFormData as RoleDefinition]);
    } else {
      setLocalRoles(localRoles.map(r => r.id === roleFormData.id ? roleFormData as RoleDefinition : r));
    }
    setIsRoleDrawerOpen(false);
  };

  const togglePermission = (perm: Permission) => {
    setRoleFormData(prev => {
      const perms = prev.permissions || [];
      if (perms.includes(perm)) {
        return { ...prev, permissions: perms.filter(p => p !== perm) };
      } else {
        return { ...prev, permissions: [...perms, perm] };
      }
    });
  };

  const handleGenerateFollowUp = async () => {
    if (!selectedDeal) return;
    setIsGeneratingFollowUp(true);
    const project = localProjects.find(p => p.id === selectedDeal.projectId);
    const message = await generateFollowUpMessage(selectedDeal, project);
    setGeneratedFollowUp(message);
    setIsGeneratingFollowUp(false);
  };

  const handleAnalyzeLead = async () => {
    if (!selectedDeal) return;
    setIsAnalyzingLead(true);
    const project = localProjects.find(p => p.id === selectedDeal.projectId);
    const result = await analyzeLead(selectedDeal, project);
    setLeadAnalysis(result);
    setIsAnalyzingLead(false);
  };

  const handleCopyFollowUp = () => {
    if (generatedFollowUp) {
      navigator.clipboard.writeText(generatedFollowUp);
      // Optional: Add a toast notification here
    }
  };

  const renderSidebarLinks = () => {
    if (effectiveUser.roleId === 'r_buyer') {
      return (
        <>
          <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition-colors w-full text-left ${activeTab === 'overview' ? 'bg-brand-accent/10 text-brand-accent' : 'text-brand-ink/50 hover:text-brand-ink hover:bg-brand-ink/5'}`}>
            <Home size={18} /> Overview
          </button>
          <button onClick={() => setActiveTab('documents')} className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition-colors w-full text-left ${activeTab === 'documents' ? 'bg-brand-accent/10 text-brand-accent' : 'text-brand-ink/50 hover:text-brand-ink hover:bg-brand-ink/5'}`}>
            <FileText size={18} /> Document Vault
          </button>
          <button onClick={() => setActiveTab('project_details')} className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition-colors w-full text-left ${activeTab === 'project_details' ? 'bg-brand-accent/10 text-brand-accent' : 'text-brand-ink/50 hover:text-brand-ink hover:bg-brand-ink/5'}`}>
            <Building size={18} /> Project Details
          </button>
        </>
      );
    }
    if (effectiveUser.roleId === 'r_developer') {
      return (
        <>
          <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition-colors w-full text-left ${activeTab === 'overview' ? 'bg-brand-accent/10 text-brand-accent' : 'text-brand-ink/50 hover:text-brand-ink hover:bg-brand-ink/5'}`}>
            <LayoutDashboard size={18} /> Portfolio Overview
          </button>
          <button onClick={() => setActiveTab('projects')} className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition-colors w-full text-left ${activeTab === 'projects' ? 'bg-brand-accent/10 text-brand-accent' : 'text-brand-ink/50 hover:text-brand-ink hover:bg-brand-ink/5'}`}>
            <Layers size={18} /> My Projects
          </button>
          <button onClick={() => setActiveTab('inventory')} className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition-colors w-full text-left ${activeTab === 'inventory' ? 'bg-brand-accent/10 text-brand-accent' : 'text-brand-ink/50 hover:text-brand-ink hover:bg-brand-ink/5'}`}>
            <Building size={18} /> Inventory
          </button>
        </>
      );
    }
    if (isTeamMember) {
      return (
        <>
          <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition-colors w-full text-left ${activeTab === 'overview' ? 'bg-brand-accent/10 text-brand-accent' : 'text-brand-ink/50 hover:text-brand-ink hover:bg-brand-ink/5'}`}>
            <LayoutDashboard size={18} /> Overview
          </button>
          {hasPermission(effectiveUser, 'manage_team') && (
            <button onClick={() => setActiveTab('team')} className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition-colors w-full text-left ${activeTab === 'team' ? 'bg-brand-accent/10 text-brand-accent' : 'text-brand-ink/50 hover:text-brand-ink hover:bg-brand-ink/5'}`}>
              <Users size={18} /> Team Directory
            </button>
          )}
          {hasPermission(effectiveUser, 'manage_roles') && (
            <button onClick={() => setActiveTab('roles')} className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition-colors w-full text-left ${activeTab === 'roles' ? 'bg-brand-accent/10 text-brand-accent' : 'text-brand-ink/50 hover:text-brand-ink hover:bg-brand-ink/5'}`}>
              <Key size={18} /> Roles & Permissions
            </button>
          )}
          {(hasPermission(effectiveUser, 'view_global_pipeline') || hasPermission(effectiveUser, 'view_own_pipeline')) && (
            <button onClick={() => setActiveTab('pipeline')} className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition-colors w-full text-left ${activeTab === 'pipeline' ? 'bg-brand-accent/10 text-brand-accent' : 'text-brand-ink/50 hover:text-brand-ink hover:bg-brand-ink/5'}`}>
              <TrendingUp size={18} /> {hasPermission(effectiveUser, 'view_global_pipeline') ? 'Global Pipeline' : 'My Pipeline'}
            </button>
          )}
          <button onClick={() => setActiveTab('inventory')} className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition-colors w-full text-left ${activeTab === 'inventory' ? 'bg-brand-accent/10 text-brand-accent' : 'text-brand-ink/50 hover:text-brand-ink hover:bg-brand-ink/5'}`}>
            <Building size={18} /> Inventory Matrix
          </button>
          <button onClick={() => setActiveTab('schedules')} className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition-colors w-full text-left ${activeTab === 'schedules' ? 'bg-brand-accent/10 text-brand-accent' : 'text-brand-ink/50 hover:text-brand-ink hover:bg-brand-ink/5'}`}>
            <Calendar size={18} /> Schedules
          </button>
          {effectiveUser.roleId === 'r_dir' && (
            <button onClick={() => setActiveTab('budget-roi')} className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition-colors w-full text-left ${activeTab === 'budget-roi' ? 'bg-brand-accent/10 text-brand-accent' : 'text-brand-ink/50 hover:text-brand-ink hover:bg-brand-ink/5'}`}>
              <PieChartIcon size={18} /> Project Budget & ROI
            </button>
          )}
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-ink flex flex-col md:flex-row selection:bg-brand-accent selection:text-brand-bg relative">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-brand-surface border-r border-brand-border text-brand-ink p-6 flex flex-col z-10">
        <div className="font-serif text-2xl tracking-widest uppercase text-brand-accent mb-12">PropMax</div>
        
        <div className="mb-12">
          <p className="text-[10px] uppercase tracking-widest text-brand-ink/50 mb-2">Logged in as</p>
          <p className="font-medium text-brand-ink">{user.name}</p>
          <div className={`inline-flex items-center gap-1 mt-2 px-2 py-1 text-[10px] uppercase tracking-widest rounded-sm ${currentUserRole?.level === 1 ? 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20' : 'bg-brand-bg/50 text-brand-ink/70 border border-brand-border'}`}>
            {currentUserRole?.level === 1 && <Shield size={10} />}
            {currentUserRole?.name || 'User'}
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {renderSidebarLinks()}
        </nav>

        {user.roleId === 'r_admin' && (
          <div className="mt-8 mb-4 p-4 bg-brand-bg/50 rounded-sm border border-brand-accent/20">
            <p className="text-[10px] uppercase tracking-widest text-brand-accent mb-3">Admin Simulation</p>
            <select 
              value={simulatedRole}
              onChange={(e) => {
                setSimulatedRole(e.target.value);
                setActiveTab('overview');
              }}
              className="w-full bg-brand-surface border border-brand-border text-brand-ink text-sm rounded-sm px-3 py-2 outline-none focus:border-brand-accent"
            >
              <option value="r_dir">Director</option>
              <option value="r_adv">Advisor</option>
              <option value="r_developer">Developer</option>
              <option value="r_buyer">Buyer</option>
            </select>
          </div>
        )}

        {(user.roleId === 'r_admin' || currentUserRole?.level === 1) && (
          <button 
            onClick={handleSeedDatabase} 
            disabled={isSeeding}
            className="flex items-center gap-3 px-4 py-3 text-brand-accent hover:text-brand-accent/80 transition-colors text-sm w-full text-left mt-4"
          >
            <Database size={18} /> {isSeeding ? 'Seeding...' : 'Seed Database'}
          </button>
        )}

        {onGoToLanding && (
          <button onClick={onGoToLanding} className="flex items-center gap-3 px-4 py-3 text-brand-ink/50 hover:text-brand-accent transition-colors text-sm w-full text-left mt-auto">
            <Home size={18} /> Back to Website
          </button>
        )}

        <button onClick={onLogout} className={`flex items-center gap-3 px-4 py-3 text-brand-ink/50 hover:text-brand-accent transition-colors text-sm w-full text-left ${onGoToLanding ? 'mt-2' : 'mt-auto'}`}>
          <LogOut size={18} /> Secure Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto relative z-0">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="font-serif text-4xl mb-2">
              {activeTab === 'team' ? 'Team Directory' : 
               activeTab === 'roles' ? 'Roles & Permissions' :
               `Welcome back, ${user.name.split(' ')[0]}`}
            </h1>
            <p className="text-brand-ink/60">
              {activeTab === 'team' ? 'Manage roles, reporting structure, and access across the CSN brokerage.' : 
               activeTab === 'roles' ? 'Define custom roles and granular access controls for the platform.' :
               'Here is your private real estate portfolio overview.'}
            </p>
          </div>
          {activeTab === 'team' && hasPermission(effectiveUser, 'manage_team') && (
            <button 
              onClick={() => openUserDrawer()}
              className="bg-brand-ink text-brand-bg px-6 py-3 rounded-sm text-xs uppercase tracking-widest font-semibold hover:bg-brand-ink/90 transition-colors flex items-center gap-2"
            >
              <Plus size={16} /> Invite Member
            </button>
          )}
          {activeTab === 'roles' && hasPermission(effectiveUser, 'manage_roles') && (
            <button 
              onClick={() => openRoleDrawer()}
              className="bg-brand-ink text-brand-bg px-6 py-3 rounded-sm text-xs uppercase tracking-widest font-semibold hover:bg-brand-ink/90 transition-colors flex items-center gap-2"
            >
              <Plus size={16} /> Create Role
            </button>
          )}
        </header>

        {/* ROLES & PERMISSIONS TAB */}
        {activeTab === 'roles' && hasPermission(effectiveUser, 'manage_roles') && (
          <div className="space-y-6">
            <div className="card-premium overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-brand-bg border-b border-brand-border">
                  <tr>
                    <th className="p-4 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Role Name</th>
                    <th className="p-4 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Hierarchy Level</th>
                    <th className="p-4 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Permissions</th>
                    <th className="p-4 font-medium text-brand-ink/60 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {localRoles.filter(r => !['r_buyer', 'r_developer'].includes(r.id)).map(role => (
                    <tr key={role.id} className="border-b border-brand-border last:border-0 hover:bg-brand-bg/50 transition-colors">
                      <td className="p-4 font-medium">{role.name}</td>
                      <td className="p-4">
                        <span className="bg-brand-bg px-2 py-1 rounded-sm text-[10px] uppercase tracking-widest text-brand-ink/70 border border-brand-border/50">
                          Level {role.level}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {role.permissions.map(p => (
                            <span key={p} className="bg-brand-accent/10 text-brand-accent px-2 py-1 rounded-sm text-[9px] uppercase tracking-widest">
                              {p.replace(/_/g, ' ')}
                            </span>
                          ))}
                          {role.permissions.length === 0 && <span className="text-brand-ink/40 italic text-xs">No permissions</span>}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => openRoleDrawer(role)}
                          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-semibold text-brand-ink/60 hover:text-brand-accent transition-colors border border-brand-border/50 px-3 py-1.5 rounded-sm hover:border-brand-accent"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TEAM DIRECTORY TAB */}
        {activeTab === 'team' && hasPermission(effectiveUser, 'manage_team') && (
          <div className="space-y-6">
            {effectiveUser.roleId === 'r_dir' && <DirectorTeamView teamMembers={teamMembers} />}
            <div className="card-premium overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-brand-bg border-b border-brand-border">
                  <tr>
                    <th className="p-4 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Member Name</th>
                    <th className="p-4 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Role / Access</th>
                    <th className="p-4 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Reports To</th>
                    <th className="p-4 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Active Clients</th>
                    <th className="p-4 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Status</th>
                    <th className="p-4 font-medium text-brand-ink/60 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map(member => {
                    const clientCount = localUsers.filter(u => u.assignedAgentId === member.id).length;
                    const manager = localUsers.find(u => u.id === member.reportsTo);
                    const memberRole = getUserRole(member);
                    return (
                      <tr key={member.id} className="border-b border-brand-border last:border-0 hover:bg-brand-bg/50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium">{member.name}</div>
                          <div className="text-xs text-brand-ink/50">{member.email}</div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] uppercase tracking-widest border ${
                            memberRole?.level === 1 ? 'bg-brand-accent/10 text-brand-accent border-brand-accent/30' : 
                            'bg-brand-bg text-brand-ink/70 border-brand-border/50'
                          }`}>
                            {memberRole?.level === 1 && <Shield size={10} />}
                            {memberRole?.name || 'Unknown'}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-brand-ink/70">
                          {manager ? manager.name : '-'}
                        </td>
                        <td className="p-4 font-medium">{clientCount > 0 ? clientCount : '-'}</td>
                        <td className="p-4">
                          <span className="flex items-center gap-1.5 text-xs">
                            <span className={`w-2 h-2 rounded-full ${
                              member.status === 'active' ? 'bg-green-500' : 
                              member.status === 'on-leave' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></span>
                            <span className="capitalize">{member.status}</span>
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => openUserDrawer(member)}
                            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-semibold text-brand-ink/60 hover:text-brand-accent transition-colors border border-brand-border/50 px-3 py-1.5 rounded-sm hover:border-brand-accent"
                          >
                            <Edit2 size={12} /> Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-8">
            {PROJECTS[0] && (
              <InventoryStackPlan 
                project={PROJECTS[0]} 
                user={effectiveUser} 
                deals={localDeals} 
                onOpenDeal={(deal) => {
                  setSelectedDeal(deal);
                  setActiveTab('pipeline');
                }}
                onCreateLead={(unit) => {
                  setLeadForm({
                    ...initialLeadForm,
                    projectId: PROJECTS[0].id,
                    unitId: unit.id,
                    unitName: unit.unitNumber,
                    amount: unit.price
                  });
                  setNewLeadStep(1);
                  setIsNewLeadModalOpen(true);
                  setActiveTab('pipeline');
                }}
              />
            )}
          </div>
        )}

        {/* PIPELINE TAB */}
        {activeTab === 'pipeline' && renderPropMaxDashboard()}

        {/* SCHEDULES TAB */}
        {activeTab === 'schedules' && (
          <div className="space-y-6">
            <ScheduleCalendar />
          </div>
        )}

        {/* BUDGET & ROI TAB (Director Only) */}
        {activeTab === 'budget-roi' && effectiveUser.roleId === 'r_dir' && (
          <DirectorBudgetROI projects={localProjects} deals={localDeals} currentUser={effectiveUser} />
        )}

        {/* DEVELOPER PROJECTS TAB */}
        {activeTab === 'projects' && effectiveUser.roleId === 'r_developer' && (
          <div className="space-y-12">
            {myProjects.map(project => {
              const totalUnits = project.unitTypes.reduce((sum, ut) => sum + ut.totalUnits, 0);
              const availableUnits = project.unitTypes.reduce((sum, ut) => sum + ut.availableUnits, 0);
              const soldUnits = totalUnits - availableUnits;
              const soldPercentage = Math.round((soldUnits / totalUnits) * 100) || 0;

              return (
                <div key={project.id} className="card-premium overflow-hidden">
                  <div className="flex flex-col md:flex-row border-b border-brand-border">
                    <img src={project.image} alt={project.name} className="w-full md:w-72 h-48 md:h-auto object-cover" referrerPolicy="no-referrer" />
                    <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h2 className="font-serif text-3xl mb-1">{project.name}</h2>
                          <p className="text-brand-ink/60 flex items-center gap-2 text-sm"><MapPin size={14}/> {project.location}</p>
                        </div>
                        <span className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-sm font-semibold ${
                          project.status === 'Ready to Move' ? 'bg-green-100 text-green-800' :
                          project.status === 'Under Construction' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      
                      <div className="mt-6 flex items-center gap-8">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-brand-ink/50 mb-1">Project Completion</p>
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-brand-bg/50 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-accent" style={{ width: `${soldPercentage}%` }}></div>
                            </div>
                            <span className="font-medium text-sm">{soldPercentage}% Sold</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-brand-ink/50 mb-1">Total Inventory</p>
                          <p className="font-medium">{totalUnits} Units</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 md:p-8 bg-brand-bg/30">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm uppercase tracking-widest font-semibold text-brand-ink/80">Unit Type Matrix</h3>
                      <p className="text-xs text-brand-ink/50 italic">Update availability to sync with PropMax portal</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="border-b border-brand-border">
                          <tr>
                            <th className="pb-3 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Unit Type</th>
                            <th className="pb-3 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Size</th>
                            <th className="pb-3 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Base Price</th>
                            <th className="pb-3 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px] text-center">Total</th>
                            <th className="pb-3 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px] text-center">Sold</th>
                            <th className="pb-3 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px] text-center">Available</th>
                          </tr>
                        </thead>
                        <tbody>
                          {project.unitTypes.map(ut => (
                            <tr key={ut.id} className="border-b border-brand-border last:border-0">
                              <td className="py-4 font-medium">{ut.name}</td>
                              <td className="py-4 text-brand-ink/70">{ut.size}</td>
                              <td className="py-4 font-medium text-brand-accent">{ut.basePrice}</td>
                              <td className="py-4 text-center">{ut.totalUnits}</td>
                              <td className="py-4 text-center text-green-600 font-medium">{ut.totalUnits - ut.availableUnits}</td>
                              <td className="py-4 text-center font-bold">
                                <div className="flex items-center justify-center gap-2">
                                  <button onClick={() => handleUpdateInventory(project.id, ut.id, -1)} className="p-1 hover:bg-brand-bg rounded-sm text-brand-ink/50 hover:text-brand-ink transition-colors"><Minus size={14}/></button>
                                  <span className="w-6 text-center">{ut.availableUnits}</span>
                                  <button onClick={() => handleUpdateInventory(project.id, ut.id, 1)} className="p-1 hover:bg-brand-bg rounded-sm text-brand-ink/50 hover:text-brand-ink transition-colors"><Plus size={14}/></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Project Analytics Funnel */}
                  <div className="p-6 md:p-8 border-t border-brand-border bg-brand-surface">
                    <h3 className="text-sm uppercase tracking-widest font-semibold mb-6 text-brand-accent">Marketing Funnel (Last 30 Days)</h3>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={[
                          { name: 'Portal Views', count: 4500 },
                          { name: 'Inquiries', count: 320 },
                          { name: 'Site Visits', count: 85 },
                          { name: 'Offers', count: 12 }
                        ]} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
                          <XAxis type="number" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis dataKey="name" type="category" stroke="#ffffff80" fontSize={11} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#141414', borderColor: '#ffffff20', borderRadius: '4px', fontSize: '12px' }}
                            itemStyle={{ color: '#D4AF37' }}
                            cursor={{fill: '#ffffff05'}}
                          />
                          <Bar dataKey="count" fill="#D4AF37" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Active Deals Pipeline (Kanban) */}
                  <div className="p-6 md:p-8 border-t border-brand-border bg-brand-bg/10">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm uppercase tracking-widest font-semibold text-brand-ink">Active Deals Pipeline</h3>
                      <button className="text-xs text-brand-accent font-semibold hover:underline">View All Deals</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {['Lead', 'Site Visit', 'Negotiation', 'Booked'].map(status => {
                        const columnDeals = localDeals.filter(d => d.projectId === project.id && d.status === status);
                        const columnTotal = columnDeals.reduce((sum, d) => sum + parsePrice(d.amount), 0);
                        
                        return (
                          <div 
                            key={status} 
                            className={`bg-brand-bg/50 p-4 rounded-lg border flex flex-col h-full transition-colors ${dragOverStatus === status ? 'border-brand-accent bg-brand-accent/5' : 'border-brand-border'}`}
                            onDragOver={(e) => handleDragOver(e, status as Deal['status'])}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, status as Deal['status'])}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/70">{status}</h4>
                              <span className="bg-brand-surface text-brand-ink text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                {columnDeals.length}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-brand-accent mb-4">
                              {formatPrice(columnTotal)}
                            </div>
                            <div className="space-y-3 flex-1">
                              {columnDeals.map(deal => (
                                <div 
                                  key={deal.id} 
                                  onClick={() => setSelectedDeal(deal)} 
                                  className={`bg-brand-surface p-3 rounded shadow-sm border transition-colors cursor-pointer group relative overflow-hidden ${
                                    deal.status === 'Site Visit' && deal.daysInStage > 7 ? 'border-red-400 hover:border-red-500' :
                                    deal.status === 'Site Visit' && deal.daysInStage >= 4 ? 'border-yellow-400 hover:border-yellow-500' :
                                    'border-brand-border hover:border-brand-accent'
                                  }`}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, deal.id)}
                                >
                                  <div className="w-full h-1 bg-brand-bg absolute top-0 left-0">
                                    <div className={`h-full transition-all duration-500 ${
                                      deal.status === 'Lead' ? 'w-1/4 bg-brand-accent/40' :
                                      deal.status === 'Site Visit' ? 'w-2/4 bg-brand-accent/60' :
                                      deal.status === 'Negotiation' ? 'w-3/4 bg-brand-accent/80' :
                                      deal.status === 'Booked' ? 'w-full bg-green-500' :
                                      deal.status === 'Lost' ? 'w-full bg-red-500' : 'w-0'
                                    }`} />
                                  </div>
                                  <div className="flex justify-between items-start mb-1 mt-1">
                                    <p className="font-semibold text-sm group-hover:text-brand-accent transition-colors">{deal.buyerName}</p>
                                    {deal.temperature === 'Hot' && <Flame size={14} className="text-orange-500" />}
                                    {deal.temperature === 'Warm' && <ThermometerSun size={14} className="text-yellow-500" />}
                                    {deal.temperature === 'Cold' && <Snowflake size={14} className="text-blue-400" />}
                                  </div>
                                  <p className="text-[10px] text-brand-ink/60 mb-3 line-clamp-1">{deal.buyerProfile}</p>
                                  <div className="flex justify-between items-center text-xs mb-3">
                                    <span className="bg-brand-bg px-2 py-1 rounded-sm text-[10px] font-medium">{deal.unitName}</span>
                                    <span className="font-medium text-brand-accent">{deal.amount}</span>
                                  </div>

                                  {/* Stage Specific Info */}
                                  <div className="mb-3 pb-3 border-b border-brand-border">
                                    {deal.status === 'Lead' && (
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-[10px]">
                                          <span className="text-brand-ink/50">Source:</span>
                                          <span className="font-medium">{deal.source}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px]">
                                          <span className="text-brand-ink/50">Status:</span>
                                          <span className={`font-medium ${deal.verification === 'Pre-qualified' ? 'text-green-600' : deal.verification === 'Phone Verified' ? 'text-blue-400' : 'text-yellow-600'}`}>{deal.verification}</span>
                                        </div>
                                      </div>
                                    )}
                                    {deal.status === 'Site Visit' && (
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-[10px]">
                                          <span className="text-brand-ink/50">Visits:</span>
                                          <span className="font-medium">{deal.visitCount} {deal.visitCount === 1 ? 'Visit' : 'Visits'}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px]">
                                          <span className="text-brand-ink/50">Interest:</span>
                                          <span className="font-medium truncate max-w-[100px]">{deal.interest}</span>
                                        </div>
                                      </div>
                                    )}
                                    {deal.status === 'Negotiation' && (
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-[10px]">
                                          <span className="text-brand-ink/50">Ask vs Offer:</span>
                                          <span className="font-medium text-brand-accent">{deal.askingPrice} → {deal.offeredPrice}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px]">
                                          <span className="text-brand-ink/50">Blocker:</span>
                                          <span className="font-medium text-red-500 truncate max-w-[100px]">{deal.blocker}</span>
                                        </div>
                                      </div>
                                    )}
                                    {deal.status === 'Booked' && (
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-[10px]">
                                          <span className="text-brand-ink/50">Milestone:</span>
                                          <span className="font-medium text-green-600 truncate max-w-[100px]">{deal.paymentMilestone}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px]">
                                          <span className="text-brand-ink/50">Next Due:</span>
                                          <span className="font-medium">{deal.nextPaymentDue?.date}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex justify-between items-center pt-1">
                                    <span className={`text-[10px] flex items-center gap-1 ${deal.daysInStage > 7 ? 'text-red-500 font-medium' : deal.daysInStage >= 4 ? 'text-yellow-600' : 'text-green-600'}`}>
                                      <Clock size={10} /> {deal.daysInStage} days
                                    </span>
                                    <span className="text-[10px] text-brand-ink/50">{deal.probability}% win</span>
                                  </div>
                                </div>
                              ))}
                              {columnDeals.length === 0 && (
                                <div className="h-20 border-2 border-dashed border-brand-border rounded flex items-center justify-center text-[10px] text-brand-ink/40 uppercase tracking-widest">
                                  No Deals
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Marketing ROI & Price Trends */}
                  <div className="p-6 md:p-8 border-t border-brand-border grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-sm uppercase tracking-widest font-semibold mb-6 text-brand-ink">Marketing Source Attribution</h3>
                      <div className="flex items-center h-48">
                        <ResponsiveContainer width="50%" height="100%" minWidth={0}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'PropMax Portal', value: 45 },
                                { name: 'Google Ads', value: 30 },
                                { name: 'Social Media', value: 15 },
                                { name: 'Referrals', value: 10 },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={70}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {['#D4AF37', '#141414', '#8E9299', '#E6E6E6'].map((color, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '4px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="w-1/2 pl-4 space-y-3">
                          {[
                            { name: 'PropMax Portal', value: '45%', color: '#D4AF37' },
                            { name: 'Google Ads', value: '30%', color: '#141414' },
                            { name: 'Social Media', value: '15%', color: '#8E9299' },
                            { name: 'Referrals', value: '10%', color: '#E6E6E6' },
                          ].map(src => (
                            <div key={src.name} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: src.color }}></span>
                                <span className="text-brand-ink/70">{src.name}</span>
                              </div>
                              <span className="font-semibold">{src.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm uppercase tracking-widest font-semibold mb-6 text-brand-ink">Price Realization Trend (Avg ₹/sqft)</h3>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                          <LineChart data={[
                            { month: 'May', price: 6200 },
                            { month: 'Jun', price: 6250 },
                            { month: 'Jul', price: 6300 },
                            { month: 'Aug', price: 6400 },
                            { month: 'Sep', price: 6450 },
                            { month: 'Oct', price: 6500 },
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8E9299' }} dy={10} />
                            <YAxis domain={['dataMin - 100', 'dataMax + 100']} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8E9299' }} dx={-10} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#141414', color: '#fff', borderRadius: '4px', border: 'none', fontSize: '12px' }}
                              itemStyle={{ color: '#D4AF37' }}
                            />
                            <Line type="monotone" dataKey="price" stroke="#D4AF37" strokeWidth={3} dot={{ r: 4, fill: '#D4AF37', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  {/* Developer Project Insights */}
                  <div className="p-6 md:p-8 bg-brand-bg/5">
                    <DeveloperProjectInsights project={project} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            {/* Developer Overview */}
            {effectiveUser.roleId === 'r_developer' && (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-brand-surface p-6 rounded-xl shadow-sm border border-brand-border">
                    <p className="text-xs uppercase tracking-widest text-brand-accent mb-2">Revenue Realized</p>
                    <p className="font-serif text-3xl text-brand-ink">{formatPrice(totalDeveloperRevenue)}</p>
                  </div>
                  <div className="bg-brand-surface p-6 rounded-xl shadow-sm border border-brand-border">
                    <p className="text-xs uppercase tracking-widest text-brand-ink/50 mb-2">Total Inventory Value (TIV)</p>
                    <p className="font-serif text-3xl">{formatPrice(totalDeveloperTIV)}</p>
                  </div>
                  <div className="bg-brand-surface p-6 rounded-xl shadow-sm border border-brand-border">
                    <p className="text-xs uppercase tracking-widest text-brand-ink/50 mb-2">Units Sold</p>
                    <p className="font-serif text-3xl text-green-600">
                      {myProjects.reduce((sum, p) => sum + p.unitTypes.reduce((s, ut) => s + (ut.totalUnits - ut.availableUnits), 0), 0)}
                    </p>
                  </div>
                  <div className="bg-brand-surface p-6 rounded-xl shadow-sm border border-brand-border">
                    <p className="text-xs uppercase tracking-widest text-brand-ink/50 mb-2">Available Inventory</p>
                    <p className="font-serif text-3xl">
                      {myProjects.reduce((sum, p) => sum + p.unitTypes.reduce((s, ut) => s + ut.availableUnits, 0), 0)}
                    </p>
                  </div>
                </div>

                {/* Granular Financials & Benchmarking */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-brand-surface p-6 rounded-xl shadow-sm border border-brand-border">
                    <div className="flex items-center gap-3 mb-6">
                      <DollarSign size={20} className="text-brand-accent" />
                      <h3 className="text-sm uppercase tracking-widest font-semibold text-brand-ink">Cash Flow & Collections</h3>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-brand-ink/60">Amount Collected (Milestone Based)</span>
                          <span className="font-medium text-green-600">{formatPrice(totalDeveloperRevenue * 0.45)}</span>
                        </div>
                        <div className="w-full h-2 bg-brand-bg rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-brand-ink/60">Pending Receivables</span>
                          <span className="font-medium text-brand-accent">{formatPrice(totalDeveloperRevenue * 0.55)}</span>
                        </div>
                        <div className="w-full h-2 bg-brand-bg rounded-full overflow-hidden">
                          <div className="h-full bg-brand-accent" style={{ width: '55%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-brand-surface p-6 rounded-xl shadow-sm border border-brand-border">
                    <div className="flex items-center gap-3 mb-6">
                      <Target size={20} className="text-brand-accent" />
                      <h3 className="text-sm uppercase tracking-widest font-semibold text-brand-ink">Market Benchmarking (CSN)</h3>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-brand-border pb-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-brand-ink/50 mb-1">Avg. Absorption Rate</p>
                          <p className="font-serif text-xl text-brand-ink">12 Units/mo</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-widest text-brand-ink/50 mb-1">Market Avg</p>
                          <p className="font-serif text-xl text-brand-ink/75">8 Units/mo</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-brand-ink/50 mb-1">Avg. Realization</p>
                          <p className="font-serif text-xl text-brand-ink">₹6,500/sqft</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-widest text-brand-ink/50 mb-1">Market Avg</p>
                          <p className="font-serif text-xl text-brand-ink/75">₹6,100/sqft</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <section className="lg:col-span-2">
                    <h2 className="text-sm uppercase tracking-widest font-semibold mb-6">Recent Project Activity</h2>
                    <div className="card-premium overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-brand-bg border-b border-brand-border">
                          <tr>
                            <th className="p-4 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Project</th>
                            <th className="p-4 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Recent Inquiry</th>
                            <th className="p-4 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Unit Type</th>
                            <th className="p-4 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-brand-border hover:bg-brand-bg/50 transition-colors">
                            <td className="p-4 font-medium">PropMax Residency</td>
                            <td className="p-4 text-brand-ink/70">Site Visit Scheduled (Today)</td>
                            <td className="p-4"><span className="bg-brand-bg px-2 py-1 rounded-sm text-[10px] uppercase tracking-widest border border-brand-border/50">3BHK Luxury</span></td>
                            <td className="p-4"><span className="text-yellow-600 font-medium text-xs">Pending</span></td>
                          </tr>
                          <tr className="border-b border-brand-border hover:bg-brand-bg/50 transition-colors">
                            <td className="p-4 font-medium">Aurangabad Tech Park Villas</td>
                            <td className="p-4 text-brand-ink/70">Offer Received (₹2.1 Cr)</td>
                            <td className="p-4"><span className="bg-brand-bg px-2 py-1 rounded-sm text-[10px] uppercase tracking-widest border border-brand-border/50">Bungalow Unit</span></td>
                            <td className="p-4"><span className="text-green-600 font-medium text-xs">Negotiation</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {assignedAgent && (
                    <section className="space-y-6">
                      <h2 className="text-sm uppercase tracking-widest font-semibold mb-6">PropMax Team</h2>
                      <div className="bg-brand-surface p-6 rounded-xl shadow-sm border border-brand-border">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 bg-brand-bg rounded-full flex items-center justify-center text-brand-ink/50">
                            <Shield size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-brand-ink/50">Account Director</p>
                            <p className="font-serif text-xl">{assignedAgent.name}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <button className="w-full flex items-center justify-center gap-2 bg-brand-ink text-brand-bg py-3 rounded-sm text-xs uppercase tracking-widest font-semibold hover:bg-brand-ink/90 transition-colors">
                            <Phone size={14} /> Schedule Strategy Call
                          </button>
                          <button className="w-full flex items-center justify-center gap-2 border border-brand-border/50 py-3 rounded-sm text-xs uppercase tracking-widest font-semibold hover:border-brand-accent hover:text-brand-accent transition-colors">
                            <TrendingUp size={14} /> Request Marketing Push
                          </button>
                        </div>
                      </div>
                    </section>
                  )}
                </div>
                
                {/* Developer Insights Module */}
                <DeveloperInsights projects={myProjects} deals={developerDeals} />
              </div>
            )}


            {/* Buyer Overview */}
            {effectiveUser.roleId === 'r_buyer' && (
              <BuyerDashboard user={user} projects={localProjects} assignedAgent={assignedAgent} setActiveTab={setActiveTab} />
            )}

            {/* Seller Overview removed */}

            {/* Advisor Overview */}
            {isTeamMember && effectiveUser.roleId !== 'r_dir' && (
              <AdvisorDashboard user={user} projects={localProjects} myDeals={myDeals} setActiveTab={setActiveTab} />
            )}

            {/* Director Overview */}
            {effectiveUser.roleId === 'r_dir' && (
              <DirectorDashboard user={user} localUsers={localUsers} />
            )}
          </>
        )}

        {/* Buyer Document Vault */}
        {effectiveUser.roleId === 'r_buyer' && activeTab === 'documents' && (
          <BuyerDocumentVault user={user} projects={localProjects} />
        )}

        {/* Buyer Project Details */}
        {effectiveUser.roleId === 'r_buyer' && activeTab === 'project_details' && (
          <BuyerProjectDetails user={user} projects={localProjects} />
        )}
      </main>

      {/* Slide-out Drawer for ROLE Management */}
      <AnimatePresence>
        {isRoleDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm z-40"
              onClick={() => setIsRoleDrawerOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-brand-surface shadow-2xl z-50 flex flex-col border-l border-brand-border"
            >
              <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-bg">
                <h2 className="font-serif text-2xl">
                  {roleFormData.id?.startsWith('new_r_') ? 'Create Role' : 'Edit Role'}
                </h2>
                <button onClick={() => setIsRoleDrawerOpen(false)} className="text-brand-ink/50 hover:text-brand-ink transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8">
                <form id="role-form" onSubmit={handleSaveRole} className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-ink/60 mb-2 font-semibold">Role Name</label>
                    <input 
                      type="text" 
                      required
                      value={roleFormData.name || ''}
                      onChange={e => setRoleFormData({...roleFormData, name: e.target.value})}
                      className="w-full bg-brand-bg border border-brand-border/50 px-4 py-3 rounded-sm text-sm outline-none focus:border-brand-accent transition-colors" 
                      placeholder="e.g. Marketing Lead"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-ink/60 mb-2 font-semibold">Hierarchy Level (1 = Highest)</label>
                    <input 
                      type="number" 
                      min="1"
                      max="99"
                      required
                      value={roleFormData.level || 5}
                      onChange={e => setRoleFormData({...roleFormData, level: parseInt(e.target.value)})}
                      className="w-full bg-brand-bg border border-brand-border/50 px-4 py-3 rounded-sm text-sm outline-none focus:border-brand-accent transition-colors" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-ink/60 mb-4 font-semibold">Permissions</label>
                    <div className="space-y-3">
                      {(Object.keys(PERMISSION_LABELS) as Permission[]).map(perm => {
                        const isSelected = roleFormData.permissions?.includes(perm);
                        return (
                          <div 
                            key={perm}
                            onClick={() => togglePermission(perm)}
                            className={`flex items-center gap-3 p-3 rounded-sm border cursor-pointer transition-colors ${isSelected ? 'border-brand-accent bg-brand-accent/5 text-brand-ink' : 'border-brand-border/50 text-brand-ink/70 hover:border-brand-ink/30'}`}
                          >
                            {isSelected ? <CheckSquare size={18} className="text-brand-accent" /> : <Square size={18} className="text-brand-ink/30" />}
                            <span className="text-sm font-medium">{PERMISSION_LABELS[perm]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-brand-border bg-brand-bg flex gap-4">
                <button 
                  onClick={() => setIsRoleDrawerOpen(false)}
                  className="flex-1 border border-brand-ink text-brand-ink py-3 rounded-sm text-xs uppercase tracking-widest font-semibold hover:bg-brand-ink/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="role-form"
                  className="flex-1 bg-brand-accent text-brand-ink py-3 rounded-sm text-xs uppercase tracking-widest font-semibold hover:bg-brand-accent/90 transition-colors"
                >
                  Save Role
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Slide-out Drawer for USER Management */}
      <AnimatePresence>
        {isUserDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm z-40"
              onClick={() => setIsUserDrawerOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-brand-surface shadow-2xl z-50 flex flex-col border-l border-brand-border"
            >
              <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-bg">
                <h2 className="font-serif text-2xl">
                  {userFormData.id?.startsWith('new_u_') ? 'Invite Team Member' : 'Manage Member'}
                </h2>
                <button onClick={() => setIsUserDrawerOpen(false)} className="text-brand-ink/50 hover:text-brand-ink transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8">
                <form id="user-form" onSubmit={handleSaveUser} className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-ink/60 mb-2 font-semibold">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={userFormData.name || ''}
                      onChange={e => setUserFormData({...userFormData, name: e.target.value})}
                      className="w-full bg-brand-bg border border-brand-border/50 px-4 py-3 rounded-sm text-sm outline-none focus:border-brand-accent transition-colors" 
                      placeholder="e.g. Arjun Reddy"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-ink/60 mb-2 font-semibold">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={userFormData.email || ''}
                      onChange={e => setUserFormData({...userFormData, email: e.target.value})}
                      className="w-full bg-brand-bg border border-brand-border/50 px-4 py-3 rounded-sm text-sm outline-none focus:border-brand-accent transition-colors" 
                      placeholder="arjun@propmax.in"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-brand-ink/60 mb-2 font-semibold">Role</label>
                      <select 
                        value={userFormData.roleId || ''}
                        onChange={e => setUserFormData({...userFormData, roleId: e.target.value})}
                        className="w-full bg-brand-bg border border-brand-border/50 px-4 py-3 rounded-sm text-sm outline-none focus:border-brand-accent transition-colors appearance-none"
                      >
                        {localRoles.filter(r => !['r_buyer', 'r_developer'].includes(r.id)).map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-brand-ink/60 mb-2 font-semibold">Status</label>
                      <select 
                        value={userFormData.status || 'active'}
                        onChange={e => setUserFormData({...userFormData, status: e.target.value as any})}
                        className="w-full bg-brand-bg border border-brand-border/50 px-4 py-3 rounded-sm text-sm outline-none focus:border-brand-accent transition-colors appearance-none"
                      >
                        <option value="active">Active</option>
                        <option value="on-leave">On Leave</option>
                        <option value="inactive">Suspended</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-ink/60 mb-2 font-semibold">Reports To</label>
                    <select 
                      value={userFormData.reportsTo || ''}
                      onChange={e => setUserFormData({...userFormData, reportsTo: e.target.value})}
                      className="w-full bg-brand-bg border border-brand-border/50 px-4 py-3 rounded-sm text-sm outline-none focus:border-brand-accent transition-colors appearance-none"
                    >
                      <option value="">-- Select Manager --</option>
                      {teamMembers
                        .filter(m => m.id !== userFormData.id)
                        .map(m => {
                          const mRole = getUserRole(m);
                          return (
                            <option key={m.id} value={m.id}>{m.name} ({mRole?.name})</option>
                          );
                        })
                      }
                    </select>
                    <p className="text-[10px] text-brand-ink/40 mt-2">Defines the reporting hierarchy and pipeline visibility.</p>
                  </div>

                  {!userFormData.id?.startsWith('new_u_') && (
                    <div className="pt-6 border-t border-brand-border">
                      <h4 className="text-xs font-semibold mb-4 text-brand-ink">Danger Zone</h4>
                      <div className="flex gap-4">
                        <button type="button" className="flex-1 flex items-center justify-center gap-2 border border-red-200 bg-red-50 text-red-700 py-3 rounded-sm text-xs font-semibold hover:bg-red-100 transition-colors">
                          <UserMinus size={14} /> Suspend Access
                        </button>
                        <button type="button" className="flex-1 flex items-center justify-center gap-2 border border-brand-border/50 bg-brand-bg py-3 rounded-sm text-xs font-semibold hover:border-brand-accent transition-colors">
                          Reassign Clients
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              <div className="p-6 border-t border-brand-border bg-brand-bg flex gap-4">
                <button 
                  onClick={() => setIsUserDrawerOpen(false)}
                  className="flex-1 border border-brand-ink text-brand-ink py-3 rounded-sm text-xs uppercase tracking-widest font-semibold hover:bg-brand-ink/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="user-form"
                  className="flex-1 bg-brand-accent text-brand-ink py-3 rounded-sm text-xs uppercase tracking-widest font-semibold hover:bg-brand-accent/90 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Deal Details Drawer */}
      <AnimatePresence>
        {selectedDeal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDeal(null)}
              className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-brand-surface shadow-2xl z-50 flex flex-col border-l border-brand-border"
            >
              <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-bg/30">
                <div>
                  <h2 className="font-serif text-2xl mb-1">Deal Details</h2>
                  <p className="text-xs text-brand-ink/60 uppercase tracking-widest">{localProjects.find(p => p.id === selectedDeal.projectId)?.name} • {selectedDeal.unitName}</p>
                </div>
                <button onClick={() => setSelectedDeal(null)} className="p-2 hover:bg-brand-border/20 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Action Required Banner */}
                {selectedDeal.actionRequired && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 -mt-2">
                    <div className="flex items-center gap-2 text-red-700 mb-1">
                      <AlertCircle size={16} />
                      <h4 className="text-xs font-bold uppercase tracking-widest">Action Required</h4>
                    </div>
                    <p className="text-sm text-red-600">{selectedDeal.actionRequired}</p>
                  </div>
                )}

                {/* Deal Header Info */}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{selectedDeal.buyerName}</h3>
                      <p className="text-sm text-brand-ink/60">{selectedDeal.buyerProfile}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-medium text-brand-accent">{selectedDeal.amount}</p>
                      <p className="text-xs text-brand-ink/50">{selectedDeal.probability}% Probability</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-brand-bg/50 p-3 rounded border border-brand-border">
                      <p className="text-[10px] uppercase tracking-widest text-brand-ink/50 mb-1">Current Stage</p>
                      <p className="font-medium text-sm">{selectedDeal.status}</p>
                    </div>
                    <div className="bg-brand-bg/50 p-3 rounded border border-brand-border">
                      <p className="text-[10px] uppercase tracking-widest text-brand-ink/50 mb-1">Time in Stage</p>
                      <p className={`font-medium text-sm flex items-center gap-1 ${selectedDeal.daysInStage > 7 ? 'text-red-500' : selectedDeal.daysInStage >= 4 ? 'text-yellow-600' : 'text-green-600'}`}>
                        <Clock size={14} /> {selectedDeal.daysInStage} Days
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Lead Analysis */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs uppercase tracking-widest font-semibold flex items-center gap-2 text-brand-ink/80">
                      <Sparkles size={14} /> Predictive Lead Scoring
                    </h4>
                    {!leadAnalysis && (
                      <button 
                        onClick={handleAnalyzeLead}
                        disabled={isAnalyzingLead}
                        className="text-[10px] uppercase tracking-widest font-bold bg-brand-accent/10 text-brand-accent px-2 py-1 rounded hover:bg-brand-accent/20 transition-colors flex items-center gap-1"
                      >
                        <Bot size={12} /> {isAnalyzingLead ? 'Analyzing...' : 'Analyze Lead'}
                      </button>
                    )}
                  </div>

                  {leadAnalysis && (
                    <div className="bg-gradient-to-br from-brand-accent/5 to-transparent border border-brand-accent/20 rounded-lg p-4">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-brand-border/30"
                              strokeWidth="3"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className={`${leadAnalysis.score >= 70 ? 'text-green-500' : leadAnalysis.score >= 40 ? 'text-yellow-500' : 'text-red-500'}`}
                              strokeDasharray={`${leadAnalysis.score}, 100`}
                              strokeWidth="3"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-lg font-bold text-brand-ink">{leadAnalysis.score}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-brand-ink/80 leading-relaxed">{leadAnalysis.analysis}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Deal Documents */}
                <DealDocuments dealId={selectedDeal.id} />

                {/* Stage Context */}
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-semibold mb-4 flex items-center gap-2 text-brand-ink/80">
                    <Search size={14} /> Stage Context: {selectedDeal.status}
                  </h4>
                  <div className="bg-brand-bg/30 p-4 rounded border border-brand-border space-y-3">
                    {selectedDeal.status === 'Lead' && (
                      <>
                        <div className="flex justify-between text-sm"><span className="text-brand-ink/60">Source</span><span className="font-medium">{selectedDeal.source}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-brand-ink/60">Verification</span><span className="font-medium">{selectedDeal.verification}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-brand-ink/60">Next Action</span><span className="font-medium">{selectedDeal.nextAction}</span></div>
                      </>
                    )}
                    {selectedDeal.status === 'Site Visit' && (
                      <>
                        <div className="flex justify-between text-sm"><span className="text-brand-ink/60">Visit Count</span><span className="font-medium">{selectedDeal.visitCount}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-brand-ink/60">Primary Interest</span><span className="font-medium">{selectedDeal.interest}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-brand-ink/60">Main Concern</span><span className="font-medium">{selectedDeal.concern}</span></div>
                      </>
                    )}
                    {selectedDeal.status === 'Negotiation' && (
                      <>
                        <div className="flex justify-between text-sm"><span className="text-brand-ink/60">Asking Price</span><span className="font-medium">{selectedDeal.askingPrice}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-brand-ink/60">Current Offer</span><span className="font-medium text-brand-accent">{selectedDeal.offeredPrice}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-brand-ink/60">Key Blocker</span><span className="font-medium text-red-500">{selectedDeal.blocker}</span></div>
                        {selectedDeal.concessions && selectedDeal.concessions.length > 0 && (
                          <div className="pt-2 border-t border-brand-border">
                            <span className="text-brand-ink/60 text-xs block mb-1">Concessions Requested:</span>
                            <ul className="list-disc list-inside text-sm font-medium">
                              {selectedDeal.concessions.map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                    {selectedDeal.status === 'Booked' && (
                      <>
                        <div className="flex justify-between text-sm"><span className="text-brand-ink/60">Payment Milestone</span><span className="font-medium text-green-600">{selectedDeal.paymentMilestone}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-brand-ink/60">Next Payment Due</span><span className="font-medium">{selectedDeal.nextPaymentDue?.date} ({selectedDeal.nextPaymentDue?.amount})</span></div>
                        <div className="flex justify-between text-sm"><span className="text-brand-ink/60">Document Status</span><span className="font-medium">{selectedDeal.documentStatus}</span></div>
                      </>
                    )}
                  </div>
                </div>

                {/* Interaction History */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs uppercase tracking-widest font-semibold flex items-center gap-2 text-brand-ink/80">
                      <History size={14} /> Interaction History
                    </h4>
                    <button 
                      onClick={handleGenerateFollowUp}
                      disabled={isGeneratingFollowUp}
                      className="text-[10px] uppercase tracking-widest font-bold bg-brand-accent/10 text-brand-accent px-2 py-1 rounded hover:bg-brand-accent/20 transition-colors flex items-center gap-1"
                    >
                      <Bot size={12} /> {isGeneratingFollowUp ? 'Drafting...' : 'Draft Follow-Up'}
                    </button>
                  </div>

                  {generatedFollowUp && (
                    <div className="mb-4 bg-brand-accent/5 border border-brand-accent/20 rounded p-3 relative group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-brand-accent flex items-center gap-1">
                          <Bot size={12} /> AI Draft
                        </span>
                        <button 
                          onClick={handleCopyFollowUp}
                          className="text-brand-ink/40 hover:text-brand-accent transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                      <p className="text-sm text-brand-ink/90 whitespace-pre-wrap">{generatedFollowUp}</p>
                    </div>
                  )}

                  <div className="space-y-4 border-l-2 border-brand-border ml-2 pl-4">
                    {selectedDeal.history.map((h, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-brand-accent border-2 border-brand-bg"></div>
                        <div className="bg-brand-surface p-3 rounded border border-brand-border shadow-sm">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold text-brand-ink/70">{h.author}</span>
                            <span className="text-[9px] text-brand-ink/40 uppercase tracking-widest">{h.date}</span>
                          </div>
                          <p className="text-xs text-brand-ink/80 leading-relaxed">{h.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-brand-border bg-brand-bg/30 space-y-3">
                {effectiveUser.roleId === 'r_advisor' || effectiveUser.roleId === 'r_director' ? (
                  <>
                    {!isLogActivityOpen ? (
                      <button 
                        onClick={() => setIsLogActivityOpen(true)}
                        className="w-full bg-brand-ink text-brand-bg py-3 rounded-sm text-xs uppercase tracking-widest font-semibold hover:bg-brand-ink/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit2 size={14} /> Log Activity
                      </button>
                    ) : (
                      <div className="bg-brand-surface p-4 rounded border border-brand-border shadow-sm space-y-3">
                        <textarea 
                          className="w-full bg-brand-bg/50 border border-brand-border/50 rounded-sm p-3 text-sm outline-none focus:border-brand-accent resize-none h-24"
                          placeholder="Enter interaction notes..."
                          value={newActivityNote}
                          onChange={(e) => setNewActivityNote(e.target.value)}
                        />
                        <input 
                          type="text"
                          className="w-full bg-brand-bg/50 border border-brand-border/50 rounded-sm p-3 text-sm outline-none focus:border-brand-accent"
                          placeholder="Next Action (e.g. Call tomorrow at 10 AM)"
                          value={newNextAction}
                          onChange={(e) => setNewNextAction(e.target.value)}
                        />
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            {(['Hot', 'Warm', 'Cold'] as const).map(temp => (
                              <button
                                key={temp}
                                onClick={() => setNewActivityTemp(temp)}
                                className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border ${
                                  newActivityTemp === temp 
                                    ? temp === 'Hot' ? 'bg-orange-100 text-orange-700 border-orange-200' 
                                    : temp === 'Warm' ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                    : 'bg-blue-100 text-blue-700 border-blue-200'
                                    : 'bg-brand-bg border-brand-border/50 text-brand-ink/50 hover:bg-brand-border/20'
                                }`}
                              >
                                {temp}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setIsLogActivityOpen(false)}
                              className="px-3 py-1.5 text-xs font-semibold text-brand-ink/60 hover:text-brand-ink"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={handleLogActivity}
                              disabled={!newActivityNote.trim()}
                              className="px-3 py-1.5 bg-brand-accent text-brand-ink rounded-sm text-xs font-semibold disabled:opacity-50"
                            >
                              Save Note
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    <button className="w-full border border-brand-border/50 bg-brand-surface text-brand-ink py-3 rounded-sm text-xs uppercase tracking-widest font-semibold hover:border-brand-accent transition-colors flex items-center justify-center gap-2">
                      <MessageCircle size={14} /> Message Buyer
                    </button>
                    {selectedDeal.status !== 'Lost' && selectedDeal.status !== 'Booked' && (
                      <button 
                        onClick={() => {
                          setDraggedDealId(selectedDeal.id);
                          setStageGateTargetStatus('Lost');
                          setStageGateFormData({});
                          setStageGateModalOpen(true);
                        }}
                        className="w-full border border-red-200 bg-red-50 text-red-600 py-3 rounded-sm text-xs uppercase tracking-widest font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <X size={14} /> Mark as Lost
                      </button>
                    )}
                  </>
                ) : (
                  <button className="w-full bg-brand-ink text-brand-bg py-3 rounded-sm text-xs uppercase tracking-widest font-semibold hover:bg-brand-ink/90 transition-colors">
                    Contact Advisor
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Stage Gate Modal */}
      <AnimatePresence>
        {stageGateModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="card-premium w-full max-w-md overflow-hidden"
              >
                <div className="p-6 border-b border-brand-border bg-brand-bg/50">
                  <h3 className="font-serif text-xl">Move to {stageGateTargetStatus}</h3>
                  <p className="text-xs text-brand-ink/60 mt-1">Please provide required details to proceed.</p>
                </div>
                <div className="p-6 space-y-4">
                  {stageGateTargetStatus === 'Lead' && (
                    <p className="text-sm text-brand-ink/70">Are you sure you want to move this deal back to Lead? This will reset its progress.</p>
                  )}
                  {stageGateTargetStatus === 'Site Visit' && (
                    <>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-ink/70 mb-2">Visit Date & Time</label>
                        <input 
                          type="datetime-local" 
                          className="w-full border border-brand-border/50 rounded-sm p-2 text-sm outline-none focus:border-brand-accent"
                          onChange={(e) => setStageGateFormData({...stageGateFormData, visitDate: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-ink/70 mb-2">Visit Type</label>
                          <select 
                            className="w-full border border-brand-border/50 rounded-sm p-2 text-sm outline-none focus:border-brand-accent bg-brand-surface"
                            onChange={(e) => setStageGateFormData({...stageGateFormData, visitType: e.target.value})}
                          >
                            <option value="In-person">In-person</option>
                            <option value="Virtual">Virtual (Zoom/Meet)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-ink/70 mb-2">Unit Focus</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 3BHK, High Floor"
                            className="w-full border border-brand-border/50 rounded-sm p-2 text-sm outline-none focus:border-brand-accent"
                            onChange={(e) => setStageGateFormData({...stageGateFormData, unitFocus: e.target.value})}
                          />
                        </div>
                      </div>
                    </>
                  )}
                  {stageGateTargetStatus === 'Negotiation' && (
                    <>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-ink/70 mb-2">Interested Unit (Optional)</label>
                        <select 
                          className="w-full border border-brand-border/50 rounded-sm p-2 text-sm outline-none focus:border-brand-accent bg-brand-surface mb-4"
                          onChange={(e) => setStageGateFormData({...stageGateFormData, interestedUnitIds: e.target.value ? [e.target.value] : [], unitId: e.target.value, unitName: localProjects[0]?.units.find(u => u.id === e.target.value)?.unitNumber || ''})}
                        >
                          <option value="">Select Unit...</option>
                          {localProjects[0]?.units.filter(u => firebaseUnits[u.id]?.status === 'Available' || u.status === 'Available').map(u => (
                            <option key={u.id} value={u.id}>{u.unitNumber} ({u.typeId === 't_2bhk' ? '2 BHK' : '3 BHK'})</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-ink/70 mb-2">Offer Amount</label>
                          <input 
                            type="text" 
                            placeholder="e.g. ₹92 L"
                            className="w-full border border-brand-border/50 rounded-sm p-2 text-sm outline-none focus:border-brand-accent"
                            onChange={(e) => setStageGateFormData({...stageGateFormData, offeredPrice: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-ink/70 mb-2">Concessions Requested</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Free parking"
                            className="w-full border border-brand-border/50 rounded-sm p-2 text-sm outline-none focus:border-brand-accent"
                            onChange={(e) => setStageGateFormData({...stageGateFormData, concessions: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-ink/70 mb-2">Post-Visit Feedback</label>
                        <textarea 
                          placeholder="What did they like? Main concerns?"
                          className="w-full border border-brand-border/50 rounded-sm p-2 text-sm outline-none focus:border-brand-accent min-h-[60px] resize-none"
                          onChange={(e) => setStageGateFormData({...stageGateFormData, feedback: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-ink/70 mb-2">Primary Blocker</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Waiting for loan pre-approval"
                          className="w-full border border-brand-border/50 rounded-sm p-2 text-sm outline-none focus:border-brand-accent"
                          onChange={(e) => setStageGateFormData({...stageGateFormData, blocker: e.target.value})}
                        />
                      </div>
                    </>
                  )}
                  {stageGateTargetStatus === 'Booked' && (
                    <>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-ink/70 mb-2">Assign Unit</label>
                        <select 
                          className="w-full border border-brand-border/50 rounded-sm p-2 text-sm outline-none focus:border-brand-accent bg-brand-surface mb-4"
                          onChange={(e) => setStageGateFormData({...stageGateFormData, finalUnitId: e.target.value, unitId: e.target.value, unitName: localProjects[0]?.units.find(u => u.id === e.target.value)?.unitNumber || ''})}
                        >
                          <option value="">Select Unit...</option>
                          {localProjects[0]?.units.filter(u => firebaseUnits[u.id]?.status === 'Available' || u.status === 'Available' || firebaseUnits[u.id]?.status === 'On Hold' || u.status === 'On Hold').map(u => (
                            <option key={u.id} value={u.id}>{u.unitNumber} ({u.typeId === 't_2bhk' ? '2 BHK' : '3 BHK'})</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-ink/70 mb-2">Final Agreed Price</label>
                          <input 
                            type="text" 
                            placeholder="e.g. ₹95 L"
                            className="w-full border border-brand-border/50 rounded-sm p-2 text-sm outline-none focus:border-brand-accent"
                            onChange={(e) => setStageGateFormData({...stageGateFormData, amount: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-ink/70 mb-2">Token Amount</label>
                          <input 
                            type="text" 
                            placeholder="e.g. ₹5 L"
                            className="w-full border border-brand-border/50 rounded-sm p-2 text-sm outline-none focus:border-brand-accent"
                            onChange={(e) => setStageGateFormData({...stageGateFormData, tokenAmount: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-ink/70 mb-2">Payment Plan</label>
                        <select 
                          className="w-full border border-brand-border/50 rounded-sm p-2 text-sm outline-none focus:border-brand-accent bg-brand-surface"
                          onChange={(e) => setStageGateFormData({...stageGateFormData, paymentPlan: e.target.value})}
                        >
                          <option value="">Select Plan...</option>
                          <option value="Construction-Linked">Construction-Linked</option>
                          <option value="20:80 Subvention">20:80 Subvention</option>
                          <option value="Down Payment">Down Payment</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <input 
                          type="checkbox" 
                          id="kycStatus"
                          className="w-4 h-4 text-brand-accent border-brand-border/50 rounded focus:ring-brand-accent"
                          onChange={(e) => setStageGateFormData({...stageGateFormData, kycVerified: e.target.checked})}
                        />
                        <label htmlFor="kycStatus" className="text-sm text-brand-ink/80">KYC Documents Collected (ID/PAN/Address)</label>
                      </div>
                    </>
                  )}
                  {stageGateTargetStatus === 'Lost' && (
                    <>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-ink/70 mb-2">Reason for Loss</label>
                        <select 
                          className="w-full border border-brand-border/50 rounded-sm p-2 text-sm outline-none focus:border-brand-accent bg-brand-surface"
                          onChange={(e) => setStageGateFormData({...stageGateFormData, lossReason: e.target.value})}
                        >
                          <option value="">Select Reason...</option>
                          <option value="Price too high">Price too high</option>
                          <option value="Bought competitor property">Bought competitor property</option>
                          <option value="Loan rejected">Loan rejected</option>
                          <option value="Unresponsive">Unresponsive</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-ink/70 mb-2">Additional Notes</label>
                        <textarea 
                          placeholder="Any other details..."
                          className="w-full border border-brand-border/50 rounded-sm p-2 text-sm outline-none focus:border-brand-accent min-h-[60px] resize-none"
                          onChange={(e) => setStageGateFormData({...stageGateFormData, lossNotes: e.target.value})}
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="p-6 border-t border-brand-border bg-brand-bg/30 flex gap-4">
                  <button 
                    onClick={() => {
                      setStageGateModalOpen(false);
                      setDraggedDealId(null);
                    }}
                    className="flex-1 border border-brand-ink text-brand-ink py-2.5 rounded-sm text-xs uppercase tracking-widest font-semibold hover:bg-brand-ink/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleStageGateSubmit}
                    className="flex-1 bg-brand-accent text-brand-ink py-2.5 rounded-sm text-xs uppercase tracking-widest font-semibold hover:bg-brand-accent/90 transition-colors"
                  >
                    Confirm Move
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <GlobalSearch 
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        deals={localDeals}
        projects={localProjects}
        users={localUsers}
        onSelectDeal={(deal) => setSelectedDeal(deal)}
      />

      <AIChatDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        deals={localDeals}
        projects={localProjects}
        users={localUsers}
      />

      {/* Floating Action Button for AI Chat */}
      <button
        onClick={() => setIsAIChatOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-brand-accent text-brand-ink rounded-full shadow-2xl flex items-center justify-center hover:bg-brand-accent/90 transition-transform hover:scale-105 z-30"
      >
        <Sparkles size={24} />
      </button>

      {/* New Lead Modal */}
      {isNewLeadModalOpen && (
        <div className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-bg rounded-lg shadow-2xl w-full max-w-2xl border border-brand-border overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-brand-border flex justify-between items-center bg-brand-surface">
              <div>
                <h3 className="font-semibold text-brand-ink">Create New Lead</h3>
                <p className="text-xs text-brand-ink/60 mt-0.5">Step {newLeadStep} of 2: {newLeadStep === 1 ? 'Contact & Assignment' : 'Requirements & Budget'}</p>
              </div>
              <button 
                onClick={closeNewLeadModal}
                className="text-brand-ink/50 hover:text-brand-ink transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto custom-scrollbar bg-brand-bg/30">
              {newLeadStep === 1 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-brand-ink/70 mb-1">Buyer Name *</label>
                    <input 
                      name="buyerName" value={leadForm.buyerName} onChange={handleLeadFormChange}
                      required type="text" 
                      className="w-full bg-brand-surface border border-brand-border rounded-sm px-3 py-2 text-sm outline-none focus:border-brand-accent transition-colors"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-ink/70 mb-1">Email Address</label>
                    <input 
                      name="email" value={leadForm.email} onChange={handleLeadFormChange}
                      type="email" 
                      className="w-full bg-brand-surface border border-brand-border rounded-sm px-3 py-2 text-sm outline-none focus:border-brand-accent transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-ink/70 mb-1">Phone Number</label>
                    <input 
                      name="phone" value={leadForm.phone} onChange={handleLeadFormChange}
                      type="tel" 
                      className="w-full bg-brand-surface border border-brand-border rounded-sm px-3 py-2 text-sm outline-none focus:border-brand-accent transition-colors"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-brand-ink/70 mb-1">Buyer Profile *</label>
                    <input 
                      name="buyerProfile" value={leadForm.buyerProfile} onChange={handleLeadFormChange}
                      required type="text" 
                      className="w-full bg-brand-surface border border-brand-border rounded-sm px-3 py-2 text-sm outline-none focus:border-brand-accent transition-colors"
                      placeholder="e.g. Tech Executive, First-time buyer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-ink/70 mb-1">Source</label>
                    <select 
                      name="source" value={leadForm.source} onChange={handleLeadFormChange}
                      className="w-full bg-brand-surface border border-brand-border rounded-sm px-3 py-2 text-sm outline-none focus:border-brand-accent transition-colors"
                    >
                      <option value="Website">Website</option>
                      <option value="Referral">Referral</option>
                      <option value="Walk-in">Walk-in</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Portal">Property Portal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-ink/70 mb-1">Buying Timeline</label>
                    <select 
                      name="timeline" value={leadForm.timeline} onChange={handleLeadFormChange}
                      className="w-full bg-brand-surface border border-brand-border rounded-sm px-3 py-2 text-sm outline-none focus:border-brand-accent transition-colors"
                    >
                      <option value="Immediate">Immediate</option>
                      <option value="1-3 Months">1-3 Months</option>
                      <option value="3-6 Months">3-6 Months</option>
                      <option value="Just Browsing">Just Browsing</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-brand-ink/70 mb-1">Assign To</label>
                    <select 
                      name="assignedTo" value={leadForm.assignedTo} onChange={handleLeadFormChange}
                      className="w-full bg-brand-surface border border-brand-border rounded-sm px-3 py-2 text-sm outline-none focus:border-brand-accent transition-colors"
                    >
                      {localUsers.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.roleId === 'r_dir' ? 'Director' : 'Advisor'})</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-ink/70 mb-1">Project *</label>
                    <select 
                      name="projectId" value={leadForm.projectId} onChange={handleLeadFormChange}
                      required
                      className="w-full bg-brand-surface border border-brand-border rounded-sm px-3 py-2 text-sm outline-none focus:border-brand-accent transition-colors"
                    >
                      <option value="">Select Project</option>
                      {localProjects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-ink/70 mb-1">Unit Interest *</label>
                    <input 
                      name="unitName" value={leadForm.unitName} onChange={handleLeadFormChange}
                      required type="text" 
                      className="w-full bg-brand-surface border border-brand-border rounded-sm px-3 py-2 text-sm outline-none focus:border-brand-accent transition-colors"
                      placeholder="e.g. 3BHK Premium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-ink/70 mb-1">Budget/Amount *</label>
                    <input 
                      name="amount" value={leadForm.amount} onChange={handleLeadFormChange}
                      required type="text" 
                      className="w-full bg-brand-surface border border-brand-border rounded-sm px-3 py-2 text-sm outline-none focus:border-brand-accent transition-colors"
                      placeholder="e.g. $1,500,000"
                    />
                  </div>
                  
                  <div className="bg-brand-accent/10 border border-brand-accent/20 rounded-sm p-3 mt-4">
                    <div className="flex items-start gap-2">
                      <Sparkles size={16} className="text-brand-accent mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-brand-ink">Smart Automation</h4>
                        <p className="text-[10px] text-brand-ink/70 mt-1">
                          Lead score and next actions will be automatically generated based on the timeline, source, and budget provided.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-brand-border bg-brand-bg/50 flex justify-between items-center">
              {newLeadStep === 1 ? (
                <>
                  <button 
                    type="button"
                    onClick={closeNewLeadModal}
                    className="px-4 py-2 text-sm font-medium text-brand-ink/70 hover:text-brand-ink transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleNextStep}
                    className="px-4 py-2 bg-brand-ink text-brand-bg text-sm font-medium rounded-sm hover:bg-brand-ink/90 transition-colors flex items-center gap-2"
                  >
                    Next Step <ChevronRight size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button 
                    type="button"
                    onClick={() => setNewLeadStep(1)}
                    className="px-4 py-2 text-sm font-medium text-brand-ink/70 hover:text-brand-ink transition-colors flex items-center gap-2"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => submitLead(true)}
                      className="px-4 py-2 border border-brand-ink text-brand-ink text-sm font-medium rounded-sm hover:bg-brand-ink/5 transition-colors"
                    >
                      Save & Add Another
                    </button>
                    <button 
                      type="button"
                      onClick={() => submitLead(false)}
                      className="px-4 py-2 bg-brand-ink text-brand-bg text-sm font-medium rounded-sm hover:bg-brand-ink/90 transition-colors"
                    >
                      Save & Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
