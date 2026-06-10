import React, { useState } from 'react';
import { DollarSign, FileText, ShoppingCart, TrendingUp, AlertCircle, CheckCircle, CreditCard, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const ERPFinance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ledger' | 'procurement' | 'invoices'>('ledger');

  const cashFlowData = [
    { month: 'Oct', in: 400, out: 240 },
    { month: 'Nov', in: 300, out: 139 },
    { month: 'Dec', in: 200, out: 980 },
    { month: 'Jan', in: 278, out: 390 },
    { month: 'Feb', in: 189, out: 480 },
    { month: 'Mar', in: 239, out: 380 },
  ];

  const purchaseOrders = [
    { id: 'PO-2026-001', vendor: 'UltraTech Cement', item: 'OPC 53 Grade (500 Bags)', amount: '₹1,85,000', status: 'Approved', date: '22 Mar 2026' },
    { id: 'PO-2026-002', vendor: 'Tata Steel', item: 'TMT Bars (10 Tons)', amount: '₹6,50,000', status: 'Pending Director Approval', date: '25 Mar 2026' },
    { id: 'PO-2026-003', vendor: 'Kajaria Ceramics', item: 'Vitrified Tiles (2000 sqft)', amount: '₹1,20,000', status: 'Draft', date: '26 Mar 2026' },
  ];

  const invoices = [
    { id: 'INV-001', client: 'Ramesh Sharma (Unit 402)', amount: '₹12,50,000', milestone: 'Slab 3 Completion', status: 'Paid', dueDate: '15 Mar 2026' },
    { id: 'INV-002', client: 'Priya Patel (Unit 505)', amount: '₹12,50,000', milestone: 'Slab 3 Completion', status: 'Overdue', dueDate: '15 Mar 2026' },
    { id: 'INV-003', client: 'Amit Kumar (Unit 601)', amount: '₹15,000', milestone: 'Legal Charges', status: 'Pending', dueDate: '30 Mar 2026' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif text-brand-ink">Finance & Procurement ERP</h2>
          <p className="text-sm text-brand-ink/60">Automated Invoicing, Ledgers, and Supply Chain.</p>
        </div>
        <button className="btn-premium-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Download size={16} /> Export Tally XML
        </button>
      </div>

      <div className="flex gap-4 border-b border-brand-border/30">
        <button 
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 px-2 text-sm font-medium uppercase tracking-widest transition-colors ${activeTab === 'ledger' ? 'border-b-2 border-brand-accent text-brand-ink' : 'text-brand-ink/50 hover:text-brand-ink'}`}
        >
          Financial Ledger
        </button>
        <button 
          onClick={() => setActiveTab('procurement')}
          className={`pb-3 px-2 text-sm font-medium uppercase tracking-widest transition-colors ${activeTab === 'procurement' ? 'border-b-2 border-brand-accent text-brand-ink' : 'text-brand-ink/50 hover:text-brand-ink'}`}
        >
          Procurement (POs)
        </button>
        <button 
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 px-2 text-sm font-medium uppercase tracking-widest transition-colors ${activeTab === 'invoices' ? 'border-b-2 border-brand-accent text-brand-ink' : 'text-brand-ink/50 hover:text-brand-ink'}`}
        >
          Client Invoicing
        </button>
      </div>

      {activeTab === 'ledger' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-premium p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-green-500/20 text-green-400 rounded-lg"><TrendingUp size={20} /></div>
              </div>
              <p className="text-sm text-brand-ink/60 mb-1">Total Cash Inflow (YTD)</p>
              <h3 className="text-2xl font-bold text-brand-ink">₹12.4 Cr</h3>
            </div>
            <div className="card-premium p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-red-500/20 text-red-400 rounded-lg"><DollarSign size={20} /></div>
              </div>
              <p className="text-sm text-brand-ink/60 mb-1">Total Cash Outflow (YTD)</p>
              <h3 className="text-2xl font-bold text-brand-ink">₹8.2 Cr</h3>
            </div>
            <div className="card-premium p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><CreditCard size={20} /></div>
              </div>
              <p className="text-sm text-brand-ink/60 mb-1">Net Working Capital</p>
              <h3 className="text-2xl font-bold text-brand-ink">₹4.2 Cr</h3>
            </div>
          </div>

          <div className="card-premium p-6">
            <h3 className="text-lg font-bold text-brand-ink mb-6">Cash Flow Projection</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={cashFlowData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                  <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-brand-border)" vertical={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111114', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', color: '#F5F5F5' }} />
                  <Area type="monotone" dataKey="in" stroke="#22c55e" fillOpacity={1} fill="url(#colorIn)" name="Cash In (Lakhs)" />
                  <Area type="monotone" dataKey="out" stroke="#ef4444" fillOpacity={1} fill="url(#colorOut)" name="Cash Out (Lakhs)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'procurement' && (
        <div className="card-premium p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-brand-ink flex items-center gap-2">
              <ShoppingCart className="text-brand-accent" size={20} /> Purchase Orders (POs)
            </h3>
            <button className="text-sm text-brand-accent hover:underline">Create New PO</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-secondary/50 border-b border-brand-border">
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">PO Number</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Vendor</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Item/Service</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Amount</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="border-b border-brand-border hover:bg-brand-secondary/50 transition-colors">
                    <td className="p-4 font-medium text-brand-ink">{po.id}</td>
                    <td className="p-4 text-brand-ink/70">{po.vendor}</td>
                    <td className="p-4 text-brand-ink/70">{po.item}</td>
                    <td className="p-4 font-serif">{po.amount}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        po.status === 'Approved' ? 'badge-premium-success' :
                        po.status.includes('Approval') ? 'badge-premium-warning' :
                        'btn-premium-secondary'
                      }`}>
                        {po.status === 'Approved' ? <CheckCircle size={12} /> : po.status.includes('Approval') ? <AlertCircle size={12} /> : <FileText size={12} />}
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="card-premium p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-brand-ink flex items-center gap-2">
              <FileText className="text-brand-accent" size={20} /> Automated Demand Letters
            </h3>
            <button className="text-sm text-brand-accent hover:underline">Generate Batch</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-secondary/50 border-b border-brand-border">
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Invoice ID</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Client & Unit</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Milestone</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Amount</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Due Date</th>
                  <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/60">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-brand-border hover:bg-brand-secondary/50 transition-colors">
                    <td className="p-4 font-medium text-brand-ink">{inv.id}</td>
                    <td className="p-4 text-brand-ink/70">{inv.client}</td>
                    <td className="p-4 text-brand-ink/70">{inv.milestone}</td>
                    <td className="p-4 font-serif">{inv.amount}</td>
                    <td className="p-4 text-brand-ink/70">{inv.dueDate}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        inv.status === 'Paid' ? 'badge-premium-success' :
                        inv.status === 'Overdue' ? 'badge-premium-danger' :
                        'badge-premium-warning'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
