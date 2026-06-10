import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, AlertTriangle, Activity, BarChart3, 
  Clock, ShieldCheck, Zap, Target, Map, ArrowUpRight, ArrowDownRight,
  Landmark, FileCheck, Building2, Bell
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, ComposedChart, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Project, Milestone, ACTIVITY_FEED } from './data';

interface DeveloperProjectInsightsProps {
  project: Project;
}

export const DeveloperProjectInsights: React.FC<DeveloperProjectInsightsProps> = ({ project }) => {
  const [phase2Unlocked, setPhase2Unlocked] = useState(false);
  const [localMilestones, setLocalMilestones] = useState<Milestone[]>(project.milestones || []);

  useEffect(() => {
    setLocalMilestones(project.milestones || []);
  }, [project.id, project.milestones]);

  const handleToggleMilestone = (milestoneId: string) => {
    const updated = localMilestones.map(m => {
      if (m.id === milestoneId) {
        if (m.status === 'pending') {
          alert(`Milestone "${m.name}" marked In Progress.`);
          return { ...m, status: 'in_progress' as const };
        } else if (m.status === 'in_progress') {
          alert(`Milestone "${m.name}" marked Completed. Slab milestone e-sign payment demands triggered for booked buyers!`);
          return { ...m, status: 'completed' as const, actualDate: new Date().toISOString() };
        }
      }
      return m;
    });
    setLocalMilestones(updated);
  };
  
  // Generate slightly different data based on project ID to avoid repetition
  const isProject1 = project.id === 'proj_mynest';
  const isProject2 = project.id === 'proj_aurora';

  // 1. Construction vs. Sales Synchronization (The "Pace" Matrix)
  const paceData = isProject1 ? [
    { month: 'Oct', sales: 15, construction: 10 },
    { month: 'Nov', sales: 25, construction: 20 },
    { month: 'Dec', sales: 40, construction: 35 },
    { month: 'Jan', sales: 55, construction: 45 },
    { month: 'Feb', sales: 65, construction: 50 },
    { month: 'Mar', sales: 72, construction: 55 }, // Current
  ] : isProject2 ? [
    { month: 'Oct', sales: 5, construction: 15 },
    { month: 'Nov', sales: 10, construction: 25 },
    { month: 'Dec', sales: 15, construction: 35 },
    { month: 'Jan', sales: 25, construction: 45 },
    { month: 'Feb', sales: 35, construction: 55 },
    { month: 'Mar', sales: 42, construction: 65 }, // Current
  ] : [
    { month: 'Oct', sales: 30, construction: 30 },
    { month: 'Nov', sales: 45, construction: 40 },
    { month: 'Dec', sales: 60, construction: 50 },
    { month: 'Jan', sales: 75, construction: 65 },
    { month: 'Feb', sales: 85, construction: 75 },
    { month: 'Mar', sales: 92, construction: 85 }, // Current
  ];

  const paceAlert = isProject1 
    ? { type: 'warning', text: 'Sales are at 72% while construction is at 55%. Ensure construction pace accelerates to meet RERA delivery timelines and avoid penalty risks.', badge: 'Sales Outpacing Build', badgeClass: 'bg-orange-100 text-orange-800', boxClass: 'bg-orange-50 border-orange-100', iconClass: 'text-orange-500' }
    : isProject2
    ? { type: 'danger', text: 'Construction is at 65% but sales are lagging at 42%. High risk of unsold inventory post-completion. Immediate marketing push required.', badge: 'Build Outpacing Sales', badgeClass: 'bg-red-100 text-red-800', boxClass: 'bg-red-50 border-red-100', iconClass: 'text-red-500' }
    : { type: 'success', text: 'Sales and construction are perfectly synchronized. Cash flow is optimal for current construction phase.', badge: 'Synchronized', badgeClass: 'bg-green-100 text-green-800', boxClass: 'bg-green-50 border-green-100', iconClass: 'text-green-500' };

  // 2. Phased Inventory Release & AI Launch Strategy
  const inventoryStrategy = isProject1 ? [
    { phase: 'Tower A', status: 'Active', sold: '85%', recommendation: 'Hold remaining 15% for premium pricing near completion.' },
    { phase: 'Tower B', status: 'Holdback', sold: '0%', recommendation: 'Launch next week. AI suggests 6% price premium over Tower A base rate.' },
    { phase: 'Retail Podium', status: 'Planning', sold: '0%', recommendation: 'Delay launch until residential occupancy reaches 40% to maximize commercial value.' }
  ] : isProject2 ? [
    { phase: 'Phase 1 (Villas)', status: 'Active', sold: '45%', recommendation: 'Increase broker incentives by 1% to accelerate slow-moving inventory.' },
    { phase: 'Phase 2 (Plots)', status: 'Active', sold: '90%', recommendation: 'Release corner plots at 12% premium immediately.' }
  ] : [
    { phase: 'East Wing', status: 'Sold Out', sold: '100%', recommendation: 'Collect final milestone payments.' },
    { phase: 'West Wing', status: 'Active', sold: '75%', recommendation: 'Bundle remaining units with free parking to close out.' },
    { phase: 'Clubhouse', status: 'Under Construction', sold: 'N/A', recommendation: 'Highlight in marketing materials to boost West Wing sales.' }
  ];

  // 3. Compliance & RERA Health Monitor
  const complianceStatus = isProject1 ? [
    { item: 'RERA Q4 Filing', status: 'Green', due: '15 Apr 2026', note: 'All documents prepared.' },
    { item: 'Fire NOC Renewal', status: 'Yellow', due: '30 May 2026', note: 'Pending inspection scheduling.' },
    { item: 'Escrow Account (70/30)', status: 'Green', due: 'Continuous', note: 'Balance ratio maintained at 74/26.' },
    { item: 'Environmental Clearance', status: 'Red', due: 'Overdue', note: 'Awaiting municipal response. Follow up required.' }
  ] : isProject2 ? [
    { item: 'RERA Q1 Filing', status: 'Green', due: '15 Jul 2026', note: 'On track.' },
    { item: 'Aviation NOC', status: 'Green', due: 'Approved', note: 'Valid until project completion.' },
    { item: 'Escrow Account (70/30)', status: 'Yellow', due: 'Continuous', note: 'Balance ratio at 68/32. Deposit required.' }
  ] : [
    { item: 'Completion Certificate', status: 'Yellow', due: '10 Aug 2026', note: 'Final inspection scheduled.' },
    { item: 'Occupancy Certificate', status: 'Planning', due: '15 Sep 2026', note: 'Dependent on CC approval.' },
    { item: 'RERA Final Filing', status: 'Green', due: '30 Oct 2026', note: 'Drafting in progress.' }
  ];

  // 4. Project-Level Profitability & Cost Overruns
  const profitabilityData = isProject1 ? [
    { category: 'Land & Approvals', budgeted: 45, actual: 46, status: 'On Track' },
    { category: 'Construction', budgeted: 120, actual: 135, status: 'Overrun' },
    { category: 'Marketing & Sales', budgeted: 15, actual: 12, status: 'Under Budget' },
    { category: 'Admin & Ops', budgeted: 8, actual: 8, status: 'On Track' }
  ] : isProject2 ? [
    { category: 'Land & Approvals', budgeted: 80, actual: 80, status: 'On Track' },
    { category: 'Construction', budgeted: 200, actual: 195, status: 'Under Budget' },
    { category: 'Marketing & Sales', budgeted: 25, actual: 30, status: 'Overrun' },
    { category: 'Admin & Ops', budgeted: 12, actual: 14, status: 'Overrun' }
  ] : [
    { category: 'Land & Approvals', budgeted: 30, actual: 32, status: 'On Track' },
    { category: 'Construction', budgeted: 90, actual: 88, status: 'Under Budget' },
    { category: 'Marketing & Sales', budgeted: 10, actual: 9, status: 'Under Budget' },
    { category: 'Admin & Ops', budgeted: 5, actual: 5, status: 'On Track' }
  ];

  // 5. Micro-Market Competitor Radar
  const competitorData = isProject1 ? [
    { name: 'Godrej Properties (2km)', type: '3 BHK', price: '₹8,200/sqft', trend: 'down', alert: 'Dropped price by ₹150/sqft last week. Consider flexible payment plan.' },
    { name: 'Lodha Group (3.5km)', type: '2 BHK', price: '₹9,500/sqft', trend: 'up', alert: 'Increased base rate. Opportunity to capture price-sensitive buyers.' },
    { name: 'Prestige Estates (1km)', type: 'Luxury Villas', price: '₹12,000/sqft', trend: 'stable', alert: 'Launching new phase next month. Monitor their marketing spend.' }
  ] : isProject2 ? [
    { name: 'DLF Phase 5 (1km)', type: 'Luxury Villas', price: '₹15,000/sqft', trend: 'up', alert: 'Strong NRI demand driving prices up.' },
    { name: 'Emaar MGF (2.5km)', type: 'Premium Plots', price: '₹10,500/sqft', trend: 'stable', alert: 'Stagnant sales. Offering free registration.' }
  ] : [
    { name: 'Sobha Developers (0.5km)', type: 'Ultra Luxury 4 BHK', price: '₹14,000/sqft', trend: 'up', alert: 'New launch in vicinity. Monitor pricing.' },
    { name: 'Brigade Group (4km)', type: 'Premium 3 BHK', price: '₹9,800/sqft', trend: 'down', alert: 'Aggressive broker incentives detected.' }
  ];

  return (
    <div className="space-y-8 mt-8 border-t border-brand-border/30 pt-8">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="text-brand-accent" size={20} />
        <h3 className="text-lg font-serif text-brand-ink">Project Intelligence: {project.name}</h3>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 1. Construction Milestone & Pace Tracker */}
        <div className="card-premium p-6 xl:col-span-2">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="text-xs uppercase tracking-widest font-semibold text-brand-ink flex items-center gap-2">
                <Building2 size={14} className="text-blue-500" /> Construction Milestone & Pace Tracker
              </h4>
              <p className="text-[10px] text-brand-ink/50 mt-1">Track physical progress and trigger payment schedules</p>
            </div>
            <span className="bg-green-100 text-green-700 text-[10px] uppercase tracking-widest px-2 py-1 rounded font-semibold">
              On Schedule
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-bg/30 border-b border-brand-border/20">
                <tr>
                  <th className="p-3 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Milestone</th>
                  <th className="p-3 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Target Date</th>
                  <th className="p-3 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Actual Date</th>
                  <th className="p-3 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Payment Due</th>
                  <th className="p-3 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Status</th>
                  <th className="p-3 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {localMilestones.map((milestone) => (
                  <tr key={milestone.id} className="border-b border-brand-border/10 last:border-0 hover:bg-brand-bg/50 transition-colors">
                    <td className="p-3 font-medium">{milestone.name}</td>
                    <td className="p-3 text-brand-ink/70">{new Date(milestone.targetDate).toLocaleDateString()}</td>
                    <td className="p-3 text-brand-ink/70">{milestone.actualDate ? new Date(milestone.actualDate).toLocaleDateString() : '-'}</td>
                    <td className="p-3 font-medium">{milestone.percentageDue}%</td>
                    <td className="p-3">
                      {milestone.status === 'completed' && <span className="bg-green-100 text-green-700 text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm border border-green-200">Completed</span>}
                      {milestone.status === 'in_progress' && <span className="bg-blue-100 text-blue-700 text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm border border-blue-200">In Progress</span>}
                      {milestone.status === 'pending' && <span className="bg-brand-bg text-brand-ink/50 text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm border border-brand-border/30">Pending</span>}
                    </td>
                    <td className="p-3">
                      {milestone.status !== 'completed' && (
                        <button 
                          onClick={() => handleToggleMilestone(milestone.id)}
                          className="text-xs font-semibold text-brand-accent hover:underline text-left"
                        >
                          Mark {milestone.status === 'pending' ? 'In Progress' : 'Completed'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {localMilestones.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-brand-ink/50 italic text-xs">No milestones defined for this project.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <p className="text-xs text-brand-ink/70 mt-4 bg-blue-500/10 border border-blue-500/20 p-3 rounded-2xl">
            <AlertTriangle size={14} className="inline mr-1 text-blue-500" />
            <strong>AI Insight:</strong> Slab 6 is currently in progress. Completing this milestone will automatically trigger 10% payment demands for 42 booked units, generating approximately ₹3.15 Cr in revenue.
          </p>
        </div>

        {/* 2. Phased Inventory Release & AI Launch Strategy */}
        <div className="card-premium p-6 flex flex-col">
          <h4 className="text-xs uppercase tracking-widest font-semibold text-brand-ink flex items-center gap-2 mb-6">
            <Target size={14} className="text-purple-500" /> AI Launch Strategy
          </h4>
          <div className="space-y-4 flex-1">
            {inventoryStrategy.map((phase, idx) => (
              <div key={idx} className="border border-brand-border bg-brand-bg/40 p-4 rounded-[18px] hover:border-brand-accent/50 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm">{phase.phase}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-serif text-brand-ink/70">{phase.sold} Sold</span>
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded ${
                      phase.status === 'Active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      (phase.status === 'Holdback' && phase.phase === 'Phase 2 (Floors 6-10)' && phase2Unlocked) ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      phase.status === 'Holdback' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-brand-secondary text-brand-ink/50'
                    }`}>
                      {(phase.status === 'Holdback' && phase.phase === 'Phase 2 (Floors 6-10)' && phase2Unlocked) ? 'Active' : phase.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-brand-ink/70 leading-relaxed flex items-start gap-2">
                  <Zap size={14} className="text-brand-accent shrink-0 mt-0.5" />
                  {phase.recommendation}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-brand-border/20">
            <button 
              onClick={() => {
                setPhase2Unlocked(true);
                alert("Phase 2 inventory unlocked successfully! Base rates updated (+6% premium) and inventory synced to all active sales advisors.");
              }}
              disabled={phase2Unlocked}
              className={`w-full py-2.5 rounded-sm text-xs uppercase tracking-widest font-semibold transition-colors ${phase2Unlocked ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'btn-premium-primary'}`}
            >
              {phase2Unlocked ? 'Phase 2 Unlocked & Synced to Advisors' : 'Unlock Phase 2 Inventory (12 Units)'}
            </button>
          </div>
        </div>

        {/* 3. Compliance & RERA Health Monitor */}
        <div className="card-premium p-6">
          <h4 className="text-xs uppercase tracking-widest font-semibold text-brand-ink flex items-center gap-2 mb-6">
            <ShieldCheck size={14} className="text-green-600" /> Compliance & RERA Health
          </h4>
          <div className="space-y-4">
            {complianceStatus.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-brand-border/10 bg-brand-bg/40 border border-brand-border rounded-[18px]">
                <div className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                  item.status === 'Green' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' :
                  item.status === 'Yellow' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]' :
                  'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                }`} />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">{item.item}</span>
                    <span className="text-[10px] uppercase tracking-widest text-brand-ink/50">Due: {item.due}</span>
                  </div>
                  <p className="text-xs text-brand-ink/70">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Micro-Market Competitor Radar */}
        <div className="card-premium p-6">
          <h4 className="text-xs uppercase tracking-widest font-semibold text-brand-ink flex items-center gap-2 mb-6">
            <Map size={14} className="text-orange-500" /> Micro-Market Competitor Radar
          </h4>
          <div className="grid grid-cols-1 gap-4">
            {competitorData.map((comp, idx) => (
              <div key={idx} className="border border-brand-border/30 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="font-medium text-sm">{comp.name}</h5>
                    <span className="text-[10px] uppercase tracking-widest text-brand-ink/50">{comp.type}</span>
                  </div>
                  <div className={`p-1.5 rounded-full ${
                    comp.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                    comp.trend === 'up' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    'bg-brand-secondary text-brand-ink/50'
                  }`}>
                    {comp.trend === 'down' ? <ArrowDownRight size={14} /> : comp.trend === 'up' ? <ArrowUpRight size={14} /> : <Activity size={14} />}
                  </div>
                </div>
                <div className="mb-3">
                  <span className="font-serif text-lg">{comp.price}</span>
                </div>
                <p className="text-xs text-brand-ink/70 leading-relaxed bg-brand-bg/50 p-2 rounded border border-brand-border/20">
                  {comp.alert}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Ecosystem Activity Feed */}
        <div className="card-premium p-6">
          <h4 className="text-xs uppercase tracking-widest font-semibold text-brand-ink flex items-center gap-2 mb-6">
            <Bell size={14} className="text-brand-accent" /> Ecosystem Activity Feed
          </h4>
          <div className="space-y-4">
            {ACTIVITY_FEED.map((log) => (
              <div key={log.id} className="flex gap-3 items-start">
                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                  log.type === 'milestone' ? 'bg-blue-500' :
                  log.type === 'approval' ? 'bg-orange-500' :
                  log.type === 'sale' ? 'bg-green-500' :
                  'bg-purple-500'
                }`} />
                <div>
                  <p className="text-xs text-brand-ink/50 mb-0.5">{log.time}</p>
                  <p className="text-sm text-brand-ink/80">{log.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
