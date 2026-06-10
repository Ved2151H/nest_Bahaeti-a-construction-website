import React from 'react';
import { User, USERS } from './data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, Target, Activity, TrendingUp, Zap, Sparkles, Building } from 'lucide-react';

interface DirectorTeamViewProps {
  teamMembers: User[];
}

export const DirectorTeamView: React.FC<DirectorTeamViewProps> = ({ teamMembers }) => {
  // Mock data for Inventory-Mapped Agent Scorecards
  const scorecards = [
    { id: 't_adv1', name: 'Arjun Reddy', activeDeals: 12, conversionRate: 18, revenue: 11.5, target: 12.0, capacity: 80, sold2BHK: 8, sold3BHK: 10, avgDiscount: 4.2 },
    { id: 't_adv2', name: 'Kavita Menon', activeDeals: 8, conversionRate: 15, revenue: 8.5, target: 10.0, capacity: 60, sold2BHK: 11, sold3BHK: 4, avgDiscount: 2.8 },
    { id: 't_man', name: 'Neha Kapoor', activeDeals: 5, conversionRate: 22, revenue: 14.0, target: 12.0, capacity: 90, sold2BHK: 4, sold3BHK: 16, avgDiscount: 3.1 },
    { id: 't_coo', name: 'Siddharth Jain', activeDeals: 15, conversionRate: 10, revenue: 4.5, target: 8.0, capacity: 95, sold2BHK: 6, sold3BHK: 2, avgDiscount: 5.5 },
  ];

  const capacityData = scorecards.map(s => ({
    name: s.name.split(' ')[0],
    capacity: s.capacity,
    deals: s.activeDeals
  }));

  return (
    <div className="space-y-8 mb-8 animate-in fade-in duration-500">
      
      {/* AI Matchmaker (Scarcity vs Leads) */}
      <div className="card-premium p-6 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-32 h-32 bg-brand-accent/20 rounded-full blur-3xl"></div>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-sm uppercase tracking-widest font-semibold flex items-center gap-2 text-brand-accent">
              <Sparkles size={16} /> AI Matchmaker: Scarcity vs. Leads
            </h3>
            <p className="text-sm text-brand-ink/60 mt-1">Smart targeting for remaining high-value inventory.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-brand-bg border border-brand-accent/20 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-serif text-lg">Top Floor 3BHKs (Wing B)</h4>
              <span className="bg-red-500/20 text-red-300 text-[10px] uppercase tracking-widest px-2 py-1 rounded border border-red-500/30">Only 4 Left</span>
            </div>
            <p className="text-xs text-brand-ink/60 mb-4">Floors 15-17 are nearly sold out. Maximize realization on remaining units.</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm bg-brand-secondary border border-brand-border p-2 rounded-lg">
                <span>Ramesh Patel (Warm)</span>
                <button className="text-brand-accent text-xs hover:underline">Assign to Neha</button>
              </div>
              <div className="flex justify-between items-center text-sm bg-brand-secondary border border-brand-border p-2 rounded-lg">
                <span>Sunita Sharma (Hot)</span>
                <button className="text-brand-accent text-xs hover:underline">Assign to Arjun</button>
              </div>
            </div>
          </div>
          
          <div className="bg-brand-bg border border-brand-border/30 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-serif text-lg">Mid-Floor 2BHKs (Wing A)</h4>
              <span className="bg-blue-500/20 text-blue-300 text-[10px] uppercase tracking-widest px-2 py-1 rounded border border-blue-500/30">Steady Velocity</span>
            </div>
            <p className="text-xs text-brand-ink/60 mb-4">12 units available. Good opportunity for bulk deals or investor pitches.</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm bg-brand-secondary border border-brand-border p-2 rounded-lg">
                <span>Vikram Singh (Investor)</span>
                <button className="text-brand-accent text-xs hover:underline">Assign to Kavita</button>
              </div>
              <div className="flex justify-between items-center text-sm bg-brand-secondary border border-brand-border p-2 rounded-lg">
                <span>Anita Desai (Cold)</span>
                <button className="text-brand-accent text-xs hover:underline">Send Nurture Email</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Scorecards */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm uppercase tracking-widest font-semibold flex items-center gap-2">
            <Target size={16} className="text-brand-accent" /> Inventory-Mapped Agent Scorecards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scorecards.slice(0, 4).map(agent => (
              <div key={agent.id} className="card-premium p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-serif text-lg">{agent.name}</p>
                    <p className="text-[10px] uppercase tracking-widest text-brand-ink/50">{agent.activeDeals} Active Deals</p>
                  </div>
                  <div className={`text-xs font-semibold px-2 py-1 rounded border ${agent.revenue >= agent.target ? 'badge-premium-success' : 'badge-premium-warning'}`}>
                    {((agent.revenue / agent.target) * 100).toFixed(0)}% to Target
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-brand-ink/60">Revenue</span>
                      <span className="font-medium">₹{agent.revenue}Cr / ₹{agent.target}Cr</span>
                    </div>
                    <div className="w-full bg-brand-bg h-1.5 rounded-full overflow-hidden">
                      <div className="bg-brand-ink h-full rounded-full" style={{ width: `${Math.min((agent.revenue / agent.target) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-brand-border/10">
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-widest text-brand-ink/50">2BHK Sold</p>
                      <p className="font-semibold text-sm">{agent.sold2BHK}</p>
                    </div>
                    <div className="text-center border-l border-r border-brand-border/10">
                      <p className="text-[10px] uppercase tracking-widest text-brand-ink/50">3BHK Sold</p>
                      <p className="font-semibold text-sm">{agent.sold3BHK}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-widest text-brand-ink/50">Avg Disc.</p>
                      <p className={`font-semibold text-sm ${agent.avgDiscount > 4.5 ? 'text-red-400' : 'text-green-400'}`}>{agent.avgDiscount}%</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Capacity Planning */}
        <div className="card-premium p-6 flex flex-col">
          <h3 className="text-sm uppercase tracking-widest font-semibold mb-6 flex items-center gap-2">
            <Activity size={16} className="text-blue-500" /> Capacity Planning
          </h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={capacityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-brand-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ background: '#111114', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#F5F5F5' }}
                />
                <Bar dataKey="capacity" radius={[4, 4, 0, 0]}>
                  {capacityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.capacity > 85 ? '#ef4444' : entry.capacity > 60 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-brand-border/10 flex justify-between text-xs text-brand-ink/60">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Optimal</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> High</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Overloaded</span>
          </div>
        </div>
      </div>

      {/* Team Activity Feed */}
      <div className="card-premium p-6">
        <h3 className="text-sm uppercase tracking-widest font-semibold mb-6 flex items-center gap-2">
          <Activity size={16} className="text-brand-accent" /> Recent Team Activity
        </h3>
        <div className="space-y-4">
          {[
            { id: 1, agent: 'Arjun Reddy', action: 'moved deal to Negotiation', deal: 'Anil D. (Wing B - 1402)', time: '2 hours ago' },
            { id: 2, agent: 'Kavita Menon', action: 'completed site visit for', deal: 'Ramesh P. (Wing A - 1101)', time: '4 hours ago' },
            { id: 3, agent: 'Neha Kapoor', action: 'approved concession request for', deal: 'Priya S. (Wing B - 0804)', time: 'Yesterday' },
            { id: 4, agent: 'Arjun Reddy', action: 'added a new lead', deal: 'Sneha K. (2BHK Premium)', time: 'Yesterday' },
          ].map(activity => (
            <div key={activity.id} className="flex items-start gap-3 p-3 border border-brand-border/10 rounded-lg hover:bg-brand-bg/50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-brand-bg flex items-center justify-center text-brand-ink/50 font-serif text-sm shrink-0">
                {activity.agent.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold">{activity.agent}</span> {activity.action} <span className="font-medium text-brand-accent">{activity.deal}</span>
                </p>
                <p className="text-xs text-brand-ink/50 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
