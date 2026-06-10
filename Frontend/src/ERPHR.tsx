import React, { useState } from 'react';
import { Users, DollarSign, Clock, CheckCircle, AlertCircle, FileText, Download } from 'lucide-react';

export const ERPHR: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'payroll' | 'attendance' | 'commissions'>('commissions');

  const commissions = [
    { id: 1, advisor: 'Sarah Connor', unit: 'A-402', dealValue: '₹1.2 Cr', commission: '₹2,40,000', status: 'Accrued', releaseDate: 'Pending 20% Payment' },
    { id: 2, advisor: 'John Smith', unit: 'B-105', dealValue: '₹85 L', commission: '₹1,70,000', status: 'Ready for Payout', releaseDate: 'Immediate' },
    { id: 3, advisor: 'Emily Davis', unit: 'A-701', dealValue: '₹1.5 Cr', commission: '₹3,00,000', status: 'Paid', releaseDate: '15 Mar 2026' },
  ];

  const attendance = [
    { id: 1, name: 'Rajesh K.', role: 'Site Engineer', checkIn: '08:15 AM', checkOut: '06:30 PM', status: 'Present', location: 'Site A' },
    { id: 2, name: 'Amit S.', role: 'QA Inspector', checkIn: '09:00 AM', checkOut: '05:00 PM', status: 'Present', location: 'Site A' },
    { id: 3, name: 'Sarah Connor', role: 'Sales Advisor', checkIn: '-', checkOut: '-', status: 'Leave', location: '-' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif text-brand-ink">HR & Payroll ERP</h2>
          <p className="text-sm text-brand-ink/60">Automated Commissions, Attendance, and Staff Management.</p>
        </div>
        <button className="btn-premium-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Download size={16} /> Export Payroll Data
        </button>
      </div>

      <div className="flex gap-4 border-b border-brand-border/30">
        <button 
          onClick={() => setActiveTab('commissions')}
          className={`pb-3 px-2 text-sm font-medium uppercase tracking-widest transition-colors ${activeTab === 'commissions' ? 'border-b-2 border-brand-accent text-brand-ink' : 'text-brand-ink/50 hover:text-brand-ink'}`}
        >
          Smart Commissions
        </button>
        <button 
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 px-2 text-sm font-medium uppercase tracking-widest transition-colors ${activeTab === 'attendance' ? 'border-b-2 border-brand-accent text-brand-ink' : 'text-brand-ink/50 hover:text-brand-ink'}`}
        >
          Site Attendance
        </button>
        <button 
          onClick={() => setActiveTab('payroll')}
          className={`pb-3 px-2 text-sm font-medium uppercase tracking-widest transition-colors ${activeTab === 'payroll' ? 'border-b-2 border-brand-accent text-brand-ink' : 'text-brand-ink/50 hover:text-brand-ink'}`}
        >
          Payroll Processing
        </button>
      </div>

      {activeTab === 'commissions' && (
        <div className="card-premium p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-brand-ink flex items-center gap-2">
              <DollarSign className="text-brand-accent" size={20} /> Automated Commission Engine
            </h3>
            <span className="text-sm text-brand-ink/60">Tied directly to realized cash flows</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-secondary/50 border-b border-brand-border">
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Advisor</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Unit & Value</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Commission</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Release Condition</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Status</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((comm) => (
                  <tr key={comm.id} className="border-b border-brand-border hover:bg-brand-secondary/50 transition-colors">
                    <td className="p-4 font-medium text-brand-ink">{comm.advisor}</td>
                    <td className="p-4 text-brand-ink/70">{comm.unit} ({comm.dealValue})</td>
                    <td className="p-4 font-serif text-brand-accent">{comm.commission}</td>
                    <td className="p-4 text-sm text-brand-ink/60">{comm.releaseDate}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        comm.status === 'Paid' ? 'badge-premium-success' :
                        comm.status === 'Ready for Payout' ? 'badge-premium-primary' :
                        'badge-premium-warning'
                      }`}>
                        {comm.status === 'Paid' ? <CheckCircle size={12} /> : comm.status === 'Ready for Payout' ? <DollarSign size={12} /> : <Clock size={12} />}
                        {comm.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="card-premium p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-brand-ink flex items-center gap-2">
              <Clock className="text-brand-accent" size={20} /> Geo-fenced Attendance
            </h3>
            <button className="text-sm text-brand-accent hover:underline">View Monthly Report</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-secondary/50 border-b border-brand-border">
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Staff Name</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Role</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Check In</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Check Out</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Location</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((att) => (
                  <tr key={att.id} className="border-b border-brand-border hover:bg-brand-secondary/50 transition-colors">
                    <td className="p-4 font-medium text-brand-ink">{att.name}</td>
                    <td className="p-4 text-brand-ink/70">{att.role}</td>
                    <td className="p-4 text-brand-ink/70">{att.checkIn}</td>
                    <td className="p-4 text-brand-ink/70">{att.checkOut}</td>
                    <td className="p-4 text-brand-ink/70">{att.location}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        att.status === 'Present' ? 'badge-premium-success' : 'badge-premium-danger'
                      }`}>
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="card-premium p-6 flex flex-col items-center justify-center py-12 text-center">
          <FileText className="w-12 h-12 text-brand-ink/20 mb-4" />
          <h3 className="text-lg font-medium text-brand-ink mb-2">Payroll Processing</h3>
          <p className="text-brand-ink/60 max-w-md">
            Generate monthly salary slips, process TDS, and manage employee benefits directly from the ERP.
          </p>
          <button className="btn-premium-secondary mt-6 px-4 py-2 text-sm font-medium">
            Run Payroll for March 2026
          </button>
        </div>
      )}
    </div>
  );
};
