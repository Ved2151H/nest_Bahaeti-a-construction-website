import React, { useState } from 'react';
import { 
  TrendingUp, AlertTriangle, Users, DollarSign, 
  Activity, BarChart3, PieChart as PieChartIcon, 
  ArrowUpRight, ArrowDownRight, Clock, ShieldAlert,
  Zap, Target, Map, X, Mail, Phone, Info
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, ComposedChart, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Project, Deal } from './data';

interface DeveloperInsightsProps {
  projects: Project[];
  deals: Deal[];
}

export const DeveloperInsights: React.FC<DeveloperInsightsProps> = ({ projects, deals }) => {
  const [selectedRiskBuyer, setSelectedRiskBuyer] = useState<any | null>(null);
  const [alertedBuyers, setAlertedBuyers] = useState<Record<string, boolean>>({});

  // 1. Financial & Cash Flow Command Center
  const cashFlowData = [
    { month: 'Oct', billed: 4.2, collected: 3.8, projected: 0 },
    { month: 'Nov', billed: 5.1, collected: 4.9, projected: 0 },
    { month: 'Dec', billed: 6.5, collected: 5.2, projected: 0 },
    { month: 'Jan', billed: 3.2, collected: 2.8, projected: 0 },
    { month: 'Feb', billed: 7.8, collected: 6.1, projected: 0 },
    { month: 'Mar', billed: 8.5, collected: 4.2, projected: 0 }, // Current month
    { month: 'Apr', billed: 0, collected: 0, projected: 9.2 },
    { month: 'May', billed: 0, collected: 0, projected: 5.5 },
  ];

  const agingDues = [
    { range: '0-30 Days', amount: 2.4, count: 12, fill: '#10b981' },
    { range: '31-60 Days', amount: 1.8, count: 8, fill: '#f59e0b' },
    { range: '61-90 Days', amount: 0.9, count: 4, fill: '#f97316' },
    { range: '90+ Days', amount: 1.2, count: 3, fill: '#ef4444' },
  ];

  // 2. Inventory Velocity & Dynamic Pricing
  const velocityData = [
    { type: '2 BHK - Lower', velocity: 85, avgDays: 12, demand: 'High' },
    { type: '2 BHK - Upper', velocity: 65, avgDays: 24, demand: 'Medium' },
    { type: '3 BHK - Lower', velocity: 92, avgDays: 8, demand: 'Very High' },
    { type: '3 BHK - Upper', velocity: 45, avgDays: 45, demand: 'Low' },
    { type: 'Penthouses', velocity: 20, avgDays: 120, demand: 'Very Low' },
  ];

  const pricingRecommendations = [
    { unit: '3 BHK (Floors 1-5)', current: '₹8,500/sqft', suggested: '₹8,850/sqft', reason: 'Selling 40% faster than baseline. High demand.', impact: '+₹1.2 Cr' },
    { unit: '2 BHK (Floors 15+)', current: '₹9,200/sqft', suggested: '₹8,900/sqft', reason: 'Zero site visits in last 21 days. Stagnant.', impact: 'Accelerate sales' },
  ];

  // 4. AI-Powered Risk & Sentiment Analysis
  const cancellationRisk = [
    { 
      buyer: 'Rajesh Kumar', 
      unit: 'B-1402', 
      risk: 'High', 
      reason: 'Missed 2 consecutive payment milestones. Unresponsive to calls.', 
      amount: '₹1.8 Cr',
      history: [
        { date: '15 May 2026', type: 'system', message: 'Milestone 3 payment of ₹45 Lakh overdue by 15 days.' },
        { date: '20 May 2026', type: 'email', message: 'Automated payment reminder and notice sent to rajesh.kumar@gmail.com.' },
        { date: '28 May 2026', type: 'call', message: 'Relationship Manager noted: Phone ringing, no response. Sent WhatsApp follow-up.' },
        { date: '05 Jun 2026', type: 'system', message: 'Milestone 4 payment of ₹45 Lakh overdue. Total outstanding: ₹90 Lakh.' },
        { date: '08 Jun 2026', type: 'call', message: 'Relationship Manager noted: Client phone switched off. Escalating to Developer dashboard.' },
      ]
    },
    { 
      buyer: 'Sneha Patel', 
      unit: 'A-805', 
      risk: 'Medium', 
      reason: 'Requested cancellation policy details via email. Expressed loan concerns.', 
      amount: '₹1.4 Cr',
      history: [
        { date: '22 May 2026', type: 'email', message: 'Buyer sent email asking for cancellation refund timeline and terms.' },
        { date: '25 May 2026', type: 'call', message: 'Relationship Manager noted: Discussed with buyer. Sneha is facing approval delays from HDFC Bank for structural slab milestone.' },
        { date: '01 Jun 2026', type: 'email', message: 'Sent contact details of pre-approved partners (SBI, ICICI) to accelerate loan disbursement.' },
        { date: '08 Jun 2026', type: 'email', message: 'Buyer requested a 15-day extension to clear outstanding slab-5 milestone payment.' },
      ]
    },
  ];

  const buyerDemographics = [
    { name: 'IT Professionals', value: 45, fill: '#3b82f6' },
    { name: 'Business Owners', value: 30, fill: '#8b5cf6' },
    { name: 'Doctors/CAs', value: 15, fill: '#10b981' },
    { name: 'NRIs', value: 10, fill: '#f59e0b' },
  ];

  return (
    <div className="space-y-8 mt-12 animate-in fade-in duration-500">
      <div className="border-b border-brand-border/30 pb-4">
        <h2 className="text-2xl font-serif text-brand-ink flex items-center gap-2">
          <Zap className="text-brand-accent" />
          Baheti Housing - Developer Insights
        </h2>
        <p className="text-sm text-brand-ink/60 mt-1">AI-powered analytics, cash flow projections, and risk assessment.</p>
      </div>

      {/* 1. Financial & Cash Flow Command Center */}
      <section className="space-y-6">
        <h3 className="text-sm uppercase tracking-widest font-semibold flex items-center gap-2">
          <DollarSign size={16} className="text-green-600" /> Financial & Cash Flow Command Center
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card-premium p-6">
            <h4 className="text-xs uppercase tracking-widest text-brand-ink/50 mb-6">Collection Efficiency & Projections (in Cr)</h4>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <ComposedChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="billed" name="Amount Billed" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="collected" name="Amount Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="projected" name="Projected (Milestones)" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-premium p-6">
            <h4 className="text-xs uppercase tracking-widest text-brand-ink/50 mb-6">Outstanding Dues Aging</h4>
            <div className="space-y-5">
              {agingDues.map((due, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{due.range}</span>
                    <span className="font-serif">₹{due.amount} Cr</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-brand-ink/50 mb-2 uppercase tracking-widest">
                    <span>{due.count} Customers</span>
                  </div>
                  <div className="w-full h-1.5 bg-brand-bg rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(due.amount / 2.4) * 100}%`, backgroundColor: due.fill }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Inventory Velocity & Dynamic Pricing */}
      <section className="space-y-6">
        <h3 className="text-sm uppercase tracking-widest font-semibold flex items-center gap-2">
          <Activity size={16} className="text-blue-500" /> Inventory Velocity & AI Pricing
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-premium p-6">
            <h4 className="text-xs uppercase tracking-widest text-brand-accent mb-6">AI Pricing Recommendations</h4>
            <div className="space-y-4">
              {pricingRecommendations.map((rec, idx) => (
                <div key={idx} className="bg-brand-bg border border-brand-border/30 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-brand-ink">{rec.unit}</span>
                    <span className={`text-xs px-2 py-1 rounded-sm ${rec.impact.includes('+') ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                      {rec.impact}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm mb-3">
                    <span className="line-through text-brand-ink/40">{rec.current}</span>
                    <ArrowUpRight size={14} className="text-brand-accent" />
                    <span className="font-bold text-brand-accent">{rec.suggested}</span>
                  </div>
                  <p className="text-xs text-brand-ink/60 leading-relaxed">
                    <Zap size={12} className="inline mr-1 text-brand-accent" />
                    {rec.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="card-premium p-6">
            <h4 className="text-xs uppercase tracking-widest text-brand-ink/50 mb-6">Sales Velocity by Typology</h4>
            <div className="space-y-4">
              {velocityData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-brand-bg/50 rounded-lg transition-colors border border-transparent hover:border-brand-border/30">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.type}</p>
                    <p className="text-[10px] uppercase tracking-widest text-brand-ink/50 mt-1">Avg {item.avgDays} days to sell</p>
                  </div>
                  <div className="w-32 mx-4">
                    <div className="w-full h-1.5 bg-brand-bg rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${item.velocity > 80 ? 'bg-green-500' : item.velocity > 50 ? 'bg-blue-500' : 'bg-orange-500'}`} 
                        style={{ width: `${item.velocity}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-20 text-right">
                    <span className={`text-xs font-medium ${item.velocity > 80 ? 'text-green-600' : item.velocity > 50 ? 'text-blue-600' : 'text-orange-600'}`}>
                      {item.demand}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. AI-Powered Risk & Sentiment Analysis */}
      <section className="space-y-6">
        <h3 className="text-sm uppercase tracking-widest font-semibold flex items-center gap-2">
          <ShieldAlert size={16} className="text-red-500" /> AI Risk & Demographics
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card-premium p-6">
            <h4 className="text-xs uppercase tracking-widest text-brand-ink/50 mb-6">Cancellation Risk Predictor</h4>
            <div className="space-y-4">
              {cancellationRisk.map((risk, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <div className={`p-2 rounded-full ${risk.risk === 'High' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                    <AlertTriangle size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="font-medium">{risk.buyer} <span className="text-brand-ink/50 text-sm font-normal ml-2">Unit {risk.unit}</span></h5>
                      <span className="font-serif text-sm">{risk.amount}</span>
                    </div>
                    <p className="text-sm text-brand-ink/70">{risk.reason}</p>
                    <div className="mt-3 flex gap-2">
                      <button 
                        onClick={() => setSelectedRiskBuyer(risk)}
                        className="text-xs btn-premium-secondary px-3 py-1.5 cursor-pointer rounded hover:bg-brand-bg transition-colors text-brand-ink font-medium"
                      >
                        View Deal History
                      </button>
                      <button 
                        onClick={() => {
                          setAlertedBuyers(prev => ({ ...prev, [risk.buyer]: true }));
                          alert(`Alert sent to Sales Director regarding cancellation risk for ${risk.buyer} (Unit ${risk.unit}). Action assigned.`);
                        }}
                        disabled={alertedBuyers[risk.buyer]}
                        className={`text-xs px-3 py-1.5 rounded font-medium transition-all ${
                          alertedBuyers[risk.buyer]
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed'
                            : 'btn-premium-primary cursor-pointer'
                        }`}
                      >
                        {alertedBuyers[risk.buyer] ? 'Alerted & Notified' : 'Alert Sales Director'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-premium p-6">
            <h4 className="text-xs uppercase tracking-widest text-brand-ink/50 mb-2">Buyer Demographics</h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={buyerDemographics}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {buyerDemographics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {buyerDemographics.map((demo, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: demo.fill }}></div>
                    <span className="text-brand-ink/70">{demo.name}</span>
                  </div>
                  <span className="font-medium">{demo.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Risk Buyer Deal History Modal */}
      {selectedRiskBuyer && (
        <div className="fixed inset-0 bg-brand-bg/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-premium w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-brand-border flex justify-between items-center bg-brand-surface">
              <div>
                <h3 className="font-semibold text-brand-ink text-sm uppercase tracking-wider">Risk Audit & Deal History</h3>
                <p className="text-xs text-brand-ink/60 mt-1">
                  {selectedRiskBuyer.buyer} &bull; Unit {selectedRiskBuyer.unit} &bull; {selectedRiskBuyer.amount}
                </p>
              </div>
              <button 
                onClick={() => setSelectedRiskBuyer(null)}
                className="text-brand-ink/50 hover:text-brand-ink transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar bg-brand-secondary/50 space-y-6 text-brand-ink">
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-xs font-semibold text-red-400 uppercase tracking-widest">Active Cancellation Alert</h4>
                  <p className="text-xs text-brand-ink/80 mt-0.5">{selectedRiskBuyer.reason}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-widest text-brand-ink/50 mb-4 font-semibold">Audit Trail Timeline</h4>
                <div className="relative border-l border-brand-border/30 pl-4 ml-2 space-y-6">
                  {selectedRiskBuyer.history.map((hist: any, idx: number) => {
                    let IconComponent = Info;
                    let iconColor = 'text-blue-400 bg-blue-400/10 border-blue-400/20';
                    
                    if (hist.type === 'system') {
                      IconComponent = ShieldAlert;
                      iconColor = 'text-red-400 bg-red-400/10 border-red-400/20';
                    } else if (hist.type === 'email') {
                      IconComponent = Mail;
                      iconColor = 'text-orange-400 bg-orange-400/10 border-orange-400/20';
                    } else if (hist.type === 'call') {
                      IconComponent = Phone;
                      iconColor = 'text-green-400 bg-green-400/10 border-green-400/20';
                    }
                    
                    return (
                      <div key={idx} className="relative">
                        {/* Timeline Bullet */}
                        <div className={`absolute -left-[27px] top-0.5 p-1 rounded-full border ${iconColor}`}>
                          <IconComponent size={10} />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-brand-ink/40 block mb-1">
                            {hist.date}
                          </span>
                          <p className="text-xs text-brand-ink/80 leading-relaxed">
                            {hist.message}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-brand-border/30 flex justify-end gap-2 bg-brand-bg/50">
              <button 
                onClick={() => setSelectedRiskBuyer(null)}
                className="btn-premium-secondary text-xs px-4 py-2"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setAlertedBuyers(prev => ({ ...prev, [selectedRiskBuyer.buyer]: true }));
                  alert(`Alert dispatched to Sales Director regarding ${selectedRiskBuyer.buyer}.`);
                  setSelectedRiskBuyer(null);
                }}
                disabled={alertedBuyers[selectedRiskBuyer.buyer]}
                className={`text-xs px-4 py-2 rounded font-medium transition-colors ${
                  alertedBuyers[selectedRiskBuyer.buyer] 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed'
                    : 'btn-premium-primary cursor-pointer'
                }`}
              >
                {alertedBuyers[selectedRiskBuyer.buyer] ? 'Director Alerted' : 'Alert Sales Director'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
