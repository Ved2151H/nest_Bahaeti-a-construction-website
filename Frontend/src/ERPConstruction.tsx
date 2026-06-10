import React, { useState } from 'react';
import { Building, CheckCircle, Clock, AlertCircle, HardHat, FileText, Camera, Upload, Zap } from 'lucide-react';

export const ERPConstruction: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'milestones' | 'qc' | 'logs'>('milestones');

  const milestones = [
    { id: 1, name: 'Excavation & Foundation', status: 'Completed', progress: 100, date: '15 Oct 2025' },
    { id: 2, name: 'Plinth Level', status: 'Completed', progress: 100, date: '10 Nov 2025' },
    { id: 3, name: 'Slab 1-5', status: 'In Progress', progress: 60, date: 'Target: 30 Mar 2026' },
    { id: 4, name: 'Slab 6-10', status: 'Pending', progress: 0, date: 'Target: 15 May 2026' },
    { id: 5, name: 'Brickwork & Plastering', status: 'Pending', progress: 0, date: 'Target: 10 Aug 2026' },
  ];

  const qcChecks = [
    { id: 1, area: 'Slab 3 Reinforcement', inspector: 'Rajesh K.', status: 'Approved', date: '24 Mar 2026' },
    { id: 2, area: 'Column C4 Concrete Mix', inspector: 'Amit S.', status: 'Rejected', date: '25 Mar 2026', issue: 'Slump test failed. Re-ordered batch.' },
    { id: 3, area: 'Slab 4 Shuttering', inspector: 'Rajesh K.', status: 'Pending Review', date: '26 Mar 2026' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif text-brand-ink">Construction & Execution ERP</h2>
          <p className="text-sm text-brand-ink/60">Milestone tracking, Quality Control, and Site Logs.</p>
        </div>
        <button className="btn-premium-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Upload size={16} /> Upload Site Report
        </button>
      </div>

      <div className="flex gap-4 border-b border-brand-border/30">
        <button 
          onClick={() => setActiveTab('milestones')}
          className={`pb-3 px-2 text-sm font-medium uppercase tracking-widest transition-colors ${activeTab === 'milestones' ? 'border-b-2 border-brand-accent text-brand-ink' : 'text-brand-ink/50 hover:text-brand-ink'}`}
        >
          Project Milestones
        </button>
        <button 
          onClick={() => setActiveTab('qc')}
          className={`pb-3 px-2 text-sm font-medium uppercase tracking-widest transition-colors ${activeTab === 'qc' ? 'border-b-2 border-brand-accent text-brand-ink' : 'text-brand-ink/50 hover:text-brand-ink'}`}
        >
          Quality Control (QC)
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-2 text-sm font-medium uppercase tracking-widest transition-colors ${activeTab === 'logs' ? 'border-b-2 border-brand-accent text-brand-ink' : 'text-brand-ink/50 hover:text-brand-ink'}`}
        >
          Daily Site Logs
        </button>
      </div>

      {activeTab === 'milestones' && (
        <div className="card-premium p-6">
          <h3 className="text-lg font-bold text-brand-ink mb-6 flex items-center gap-2">
            <Building className="text-brand-accent" size={20} /> Construction Milestones
          </h3>
          <div className="space-y-6">
            {milestones.map((m) => (
              <div key={m.id} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  m.status === 'Completed' ? 'bg-green-500/20 text-green-500' :
                  m.status === 'In Progress' ? 'bg-blue-500/20 text-blue-500' :
                  'bg-brand-secondary text-brand-ink/50 border border-brand-border'
                }`}>
                  {m.status === 'Completed' ? <CheckCircle size={20} /> : m.status === 'In Progress' ? <Zap size={20} /> : <Clock size={20} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-brand-ink">{m.name}</span>
                    <span className="text-sm text-brand-ink/60">{m.date}</span>
                  </div>
                  <div className="w-full bg-brand-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${m.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'}`} 
                      style={{ width: `${m.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'qc' && (
        <div className="card-premium p-6">
          <h3 className="text-lg font-bold text-brand-ink mb-6 flex items-center gap-2">
            <HardHat className="text-brand-accent" size={20} /> Quality Control Inspections
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-secondary/50 border-b border-brand-border">
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Area/Task</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Inspector</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Date</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Status</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Notes</th>
                </tr>
              </thead>
              <tbody>
                {qcChecks.map((qc) => (
                  <tr key={qc.id} className="border-b border-brand-border hover:bg-brand-secondary/50 transition-colors">
                    <td className="p-4 font-medium text-brand-ink">{qc.area}</td>
                    <td className="p-4 text-brand-ink/70">{qc.inspector}</td>
                    <td className="p-4 text-brand-ink/70">{qc.date}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        qc.status === 'Approved' ? 'badge-premium-success' :
                        qc.status === 'Rejected' ? 'badge-premium-danger' :
                        'badge-premium-warning'
                      }`}>
                        {qc.status === 'Approved' ? <CheckCircle size={12} /> : qc.status === 'Rejected' ? <AlertCircle size={12} /> : <Clock size={12} />}
                        {qc.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-brand-ink/60">{qc.issue || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="card-premium p-6 flex flex-col items-center justify-center py-12 text-center">
          <Camera className="w-12 h-12 text-brand-ink/20 mb-4" />
          <h3 className="text-lg font-medium text-brand-ink mb-2">Daily Site Logs</h3>
          <p className="text-brand-ink/60 max-w-md">
            Site engineers can upload daily photos, labor count, and material received logs here. Integrated with the mobile app.
          </p>
          <button className="btn-premium-secondary mt-6 px-4 py-2 text-sm font-medium">
            View Log Archive
          </button>
        </div>
      )}
    </div>
  );
};
