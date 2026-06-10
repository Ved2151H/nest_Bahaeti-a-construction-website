import React, { useState } from 'react';
import { 
  TrendingUp, Users, DollarSign, Activity, 
  BarChart3, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight,
  CheckCircle, Clock, AlertCircle, Filter, Download, Building, Zap, Bell, UserPlus
} from 'lucide-react';
import { DEVELOPER_DEALS, USERS, ACTIVITY_FEED } from './data';
import type { User, Deal } from './data';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, ComposedChart
} from 'recharts';
import { AddLeadModal } from './components/AddLeadModal';
import { MyLeads } from './components/MyLeads';

interface DirectorDashboardProps {
  user: User;
  localUsers: User[];
}

export const DirectorDashboard: React.FC<DirectorDashboardProps> = ({ user, localUsers }) => {
  const [dateRange, setDateRange] = useState('This Month');
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);

  const [pendingApprovals, setPendingApprovals] = useState([
    { id: 1, agent: 'Arjun R.', unit: 'B-1402 (3BHK)', amount: '₹75 L', discount: '4.5%', status: 'Pending', readiness: 'Ready today if approved', marginImpact: 'Drops IRR by 0.02%, secures ₹1.5Cr cash flow' },
    { id: 2, agent: 'Kavita M.', unit: 'A-1101 (2BHK)', amount: '₹50 L', discount: '5.0%', status: 'Pending', readiness: 'Needs 3 days to arrange funds', marginImpact: 'Drops IRR by 0.03%, secures ₹1.0Cr cash flow' },
    { id: 3, agent: 'Rahul S.', unit: 'B-0804 (3BHK)', amount: '₹75 L', discount: '3.8%', status: 'Pending', readiness: 'Ready today if approved', marginImpact: 'Drops IRR by 0.01%, secures ₹1.5Cr cash flow' },
  ]);

  const [activities, setActivities] = useState(ACTIVITY_FEED);

  const handleApprovalAction = (id: number, action: 'Approved' | 'Rejected') => {
    const target = pendingApprovals.find(item => item.id === id);
    if (!target) return;

    setPendingApprovals(prev => prev.filter(item => item.id !== id));

    const newActivity = {
      id: `act_approval_${Date.now()}_${id}`,
      time: 'Just now',
      message: `Director ${action.toLowerCase()} the ${target.discount} discount request from ${target.agent} for unit ${target.unit}.`,
      type: 'approval' as const
    };

    ACTIVITY_FEED.unshift(newActivity);
    setActivities([newActivity, ...activities]);
  };

  // Mock Data for 17-Floor, 136-Unit Project
  const tivData = {
    total: 850000000, // 85 Cr
    realized: 320000000, // 32 Cr
    pipeline: 160000000, // 16 Cr
    velocity: 4 // units per month
  };

  const burnDownData = [
    { month: 'Oct', targetTIV: 85, actualTIV: 85 },
    { month: 'Nov', targetTIV: 80, actualTIV: 81 },
    { month: 'Dec', targetTIV: 75, actualTIV: 72 },
    { month: 'Jan', targetTIV: 70, actualTIV: 65 },
    { month: 'Feb', targetTIV: 65, actualTIV: 58 },
    { month: 'Mar', targetTIV: 60, actualTIV: 53 }, // Current remaining TIV (85 - 32)
  ];

  const typologyPerformance = [
    { name: 'Wing A - 2BHK', sold: 22, available: 12, revenue: 11 }, // 11 Cr
    { name: 'Wing A - 3BHK', sold: 18, available: 16, revenue: 13.5 }, // 13.5 Cr
    { name: 'Wing B - 2BHK', sold: 15, available: 19, revenue: 7.5 }, // 7.5 Cr
    { name: 'Wing B - 3BHK', sold: 8, available: 26, revenue: 6 }, // 6 Cr
  ];

  const cashFlowProjections = [
    { milestone: 'Plinth', expected: 8.5, collected: 8.5, status: 'Completed' },
    { milestone: 'Slab 1-5', expected: 12.0, collected: 11.2, status: 'Active' },
    { milestone: 'Slab 6-10', expected: 15.0, collected: 4.5, status: 'Upcoming' },
    { milestone: 'Slab 11-15', expected: 15.0, collected: 0, status: 'Future' },
    { milestone: 'Slab 16-17', expected: 8.0, collected: 0, status: 'Future' },
    { milestone: 'Finishing', expected: 16.5, collected: 0, status: 'Future' },
  ];

  const portfolioPaceData = [
    { month: 'Oct', sales: 15, construction: 10 },
    { month: 'Nov', sales: 25, construction: 15 },
    { month: 'Dec', sales: 35, construction: 25 },
    { month: 'Jan', sales: 45, construction: 30 },
    { month: 'Feb', sales: 60, construction: 45 },
    { month: 'Mar', sales: 75, construction: 50 },
  ];

  const formatCurrency = (val: number) => {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif text-brand-ink">Director's Command Center</h1>
          <p className="text-sm text-brand-ink/60">Portfolio Pace, TIV Burn-Down, and Cash Flow Projections.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsAddLeadModalOpen(true)}
            className="flex items-center gap-2 btn-premium-primary px-4 py-2 text-sm font-semibold cursor-pointer"
          >
            <UserPlus size={16} /> Add New Lead
          </button>
          <select 
            className="bg-[#16161A] border border-brand-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-accent/50 text-brand-ink"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>This Quarter</option>
            <option>Year to Date</option>
          </select>
          <button className="flex items-center gap-2 btn-premium-secondary px-3 py-2 text-sm cursor-pointer">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-premium p-6 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-accent/20 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-bg/10 flex items-center justify-center text-brand-accent">
              <Building size={20} />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
              <ArrowUpRight size={12} /> 37% Sold
            </span>
          </div>
          <p className="text-xs uppercase tracking-widest text-brand-bg/50 mb-1">Realized Revenue</p>
          <p className="font-serif text-3xl text-white">{formatCurrency(tivData.realized)}</p>
          <div className="mt-4 w-full bg-brand-bg/20 h-1.5 rounded-full overflow-hidden">
            <div className="bg-brand-accent h-full rounded-full" style={{ width: `${(tivData.realized / tivData.total) * 100}%` }}></div>
          </div>
          <p className="text-[10px] text-brand-bg/50 mt-2 text-right">Total TIV: {formatCurrency(tivData.total)}</p>
        </div>

        <div className="card-premium p-6 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center text-brand-ink/70">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-widest text-brand-ink/50 mb-1">Pipeline Revenue</p>
          <p className="font-serif text-3xl">{formatCurrency(tivData.pipeline)}</p>
          <p className="text-[10px] text-brand-ink/50 mt-2">Expected to close in 30 days</p>
        </div>

        <div className="card-premium p-6 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center text-brand-ink/70">
              <Activity size={20} />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
              <ArrowUpRight size={12} /> +1.2
            </span>
          </div>
          <p className="text-xs uppercase tracking-widest text-brand-ink/50 mb-1">Sales Velocity</p>
          <p className="font-serif text-3xl">{tivData.velocity} <span className="text-lg text-brand-ink/50 font-sans">units/mo</span></p>
          <p className="text-[10px] text-brand-ink/50 mt-2">Wing A: 8 mos to sell out | Wing B: 14 mos</p>
        </div>

        <div className="card-premium p-6 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center text-brand-ink/70">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-widest text-brand-ink/50 mb-1">Price Realization</p>
          <p className="font-serif text-3xl">96.5%</p>
          <p className="text-[10px] text-brand-ink/50 mt-2">Avg. discount given: 3.5%</p>
        </div>
      </div>

      {/* My Leads Section */}
      <MyLeads showAll={true} userId={user.id} />

      {/* Portfolio Pace Matrix */}
      <div className="card-premium p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm uppercase tracking-widest font-semibold flex items-center gap-2">
            <Activity size={16} className="text-brand-accent" /> Portfolio Pace Matrix (Sales vs. Construction)
          </h3>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={portfolioPaceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [`${value}%`, undefined]}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="sales" name="Avg. Sales Progress" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="construction" name="Avg. Construction Progress" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 p-3 rounded-2xl flex items-start gap-2">
          <AlertCircle size={16} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-400">
            <strong>AI Insight:</strong> Across the portfolio, sales are outpacing construction by 25%. Consider accelerating construction milestones on 'My Nest' to unlock the next payment tranche and improve cash flow.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TIV Burn-Down */}
        <div className="card-premium p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm uppercase tracking-widest font-semibold flex items-center gap-2">
              <TrendingUp size={16} className="text-brand-accent" /> TIV Burn-Down (Cr)
            </h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={burnDownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} domain={[40, 90]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="targetTIV" name="Target TIV Remaining" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                <Line type="monotone" dataKey="actualTIV" name="Actual TIV Remaining" stroke="#141414" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wing & Typology Performance Matrix */}
        <div className="card-premium p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm uppercase tracking-widest font-semibold flex items-center gap-2">
              <BarChart3 size={16} className="text-brand-accent" /> Wing & Typology Performance
            </h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={typologyPerformance} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#141414" fontSize={12} tickLine={false} axisLine={false} width={100} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="sold" name="Units Sold" stackId="a" fill="#141414" radius={[0, 0, 0, 0]} barSize={24} />
                <Bar dataKey="available" name="Units Available" stackId="a" fill="#e5e7eb" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 p-3 rounded-2xl flex items-start gap-2">
            <Zap size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs text-red-400">
              <strong>AI Alert:</strong> Wing B 3BHKs are moving 40% slower than Wing A. Consider shifting marketing spend or increasing broker incentives for Wing B.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow & Milestone Projections */}
        <div className="lg:col-span-2 card-premium p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm uppercase tracking-widest font-semibold flex items-center gap-2">
              <DollarSign size={16} className="text-brand-accent" /> Cash Flow & Milestone Projections (Cr)
            </h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <ComposedChart data={cashFlowProjections} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="milestone" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="collected" name="Collected (Cr)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expected" name="Expected (Cr)" fill="#e5e7eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 p-3 rounded-2xl flex items-start gap-2">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs text-red-400">
              <strong>Collection Risk:</strong> ₹1.2Cr from 'Slab 1-5' milestone is 7 days overdue. Short-term cash flow projection downgraded. Advisors have been notified to follow up.
            </p>
          </div>
        </div>

        {/* Approvals Inbox */}
        <div className="card-premium p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm uppercase tracking-widest font-semibold flex items-center gap-2">
              <CheckCircle size={16} className="text-orange-500" /> Discount Approvals
            </h3>
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
              {pendingApprovals.length} Pending
            </span>
          </div>
          <div className="space-y-3">
            {pendingApprovals.length === 0 ? (
              <div className="p-6 text-center text-brand-ink/50 text-sm border border-brand-border/10 rounded-lg bg-brand-bg/10">
                All discount requests cleared.
              </div>
            ) : (
              pendingApprovals.map(deal => (
                <div key={deal.id} className="p-4 border border-brand-border/20 rounded-lg bg-brand-bg/30">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium">{deal.unit}</p>
                      <p className="text-xs text-brand-ink/60">Agent: {deal.agent}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded font-bold">
                      {deal.discount} OFF
                    </span>
                  </div>
                  <div className="my-2 space-y-1">
                    <p className="text-[10px] text-brand-ink/70 flex items-center gap-1">
                      <Clock size={10} className="text-orange-500" /> {deal.readiness}
                    </p>
                    <p className="text-[10px] text-brand-ink/70 flex items-center gap-1">
                      <TrendingUp size={10} className="text-blue-500" /> {deal.marginImpact}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => handleApprovalAction(deal.id, 'Approved')}
                      className="flex-1 btn-premium-primary py-2 text-xs uppercase tracking-widest font-semibold cursor-pointer"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleApprovalAction(deal.id, 'Rejected')}
                      className="flex-1 btn-premium-secondary py-2 text-xs uppercase tracking-widest font-semibold cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Ecosystem Activity Feed */}
      <div className="card-premium p-6">
        <h3 className="text-sm uppercase tracking-widest font-semibold flex items-center gap-2 mb-6">
          <Bell size={16} className="text-brand-accent" /> Ecosystem Activity Feed
        </h3>
        <div className="space-y-4">
          {activities.map((log) => (
            <div key={log.id} className="flex gap-3 items-start p-3 rounded-lg border border-brand-border/10 bg-brand-bg/20">
              <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${
                log.type === 'milestone' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]' :
                log.type === 'approval' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]' :
                log.type === 'sale' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' :
                'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
              }`} />
              <div>
                <p className="text-xs text-brand-ink/50 mb-1 font-mono">{log.time}</p>
                <p className="text-sm text-brand-ink/80">{log.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <AddLeadModal isOpen={isAddLeadModalOpen} onClose={() => setIsAddLeadModalOpen(false)} userId={user.id} />
    </div>
  );
};
