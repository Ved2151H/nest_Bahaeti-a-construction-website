import React, { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, PieChart as PieChartIcon, Activity, Target, ArrowRight, Award, Wallet, Building2, Briefcase, Filter, Edit2, X, Plus, Trash2, History, Receipt, AlertCircle, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend, ComposedChart, Line } from 'recharts';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, onSnapshot, query, where, setDoc, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  color: string;
}

interface ProjectBudget {
  projectId: string;
  totalCap: number;
  categories: BudgetCategory[];
  updatedAt?: any;
}

interface Expense {
  id: string;
  projectId: string;
  categoryId: string;
  amount: number;
  date: string;
  vendor: string;
  notes: string;
  status: 'Paid' | 'Committed';
  loggedBy: string;
  createdAt?: any;
}

interface BudgetHistory {
  id: string;
  projectId: string;
  action: string;
  description: string;
  performedBy: string;
  timestamp: any;
  previousTotal?: number;
  newTotal?: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

import { Project, Deal, User } from './data';

interface DirectorBudgetROIProps {
  projects: Project[];
  deals: Deal[];
  currentUser?: User;
}

const DirectorBudgetROI: React.FC<DirectorBudgetROIProps> = ({ projects, deals, currentUser }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [budget, setBudget] = useState<ProjectBudget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [history, setHistory] = useState<BudgetHistory[]>([]);
  
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [budgetForm, setBudgetForm] = useState<{ totalCap: number; categories: BudgetCategory[] }>({
    totalCap: 0,
    categories: []
  });

  const [expenseForm, setExpenseForm] = useState({
    categoryId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    notes: '',
    status: 'Paid' as 'Paid' | 'Committed'
  });

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId) return;

    const budgetUnsubscribe = onSnapshot(doc(db, 'project_budgets', selectedProjectId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as ProjectBudget;
        setBudget(data);
        setBudgetForm({ totalCap: data.totalCap, categories: data.categories });
      } else {
        const defaultBudget = {
          projectId: selectedProjectId,
          totalCap: 10000000,
          categories: [
            { id: 'cat-1', name: 'Digital Marketing & Lead Gen', allocated: 4000000, color: COLORS[0] },
            { id: 'cat-2', name: 'Advisor Payouts & Incentives', allocated: 3000000, color: COLORS[1] },
            { id: 'cat-3', name: 'Events & Activations', allocated: 1500000, color: COLORS[2] },
            { id: 'cat-4', name: 'Operational Overhead', allocated: 1500000, color: COLORS[3] },
          ]
        };
        setBudget(defaultBudget);
        setBudgetForm({ totalCap: defaultBudget.totalCap, categories: defaultBudget.categories });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `project_budgets/${selectedProjectId}`);
    });

    const expensesQuery = query(collection(db, 'expenses'), where('projectId', '==', selectedProjectId));
    const expensesUnsubscribe = onSnapshot(expensesQuery, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'expenses');
    });

    const historyQuery = query(collection(db, 'budget_history'), where('projectId', '==', selectedProjectId), orderBy('timestamp', 'desc'));
    const historyUnsubscribe = onSnapshot(historyQuery, (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BudgetHistory)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'budget_history');
    });

    return () => {
      budgetUnsubscribe();
      expensesUnsubscribe();
      historyUnsubscribe();
    };
  }, [selectedProjectId]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // --- CFO LEVEL CALCULATIONS ---
  
  // Helper to parse price strings like '₹50 L' or '₹1.5 Cr' to numbers
  const parsePrice = (priceStr: string | number | undefined): number => {
    if (typeof priceStr === 'number') return priceStr;
    if (!priceStr) return 0;
    const numStr = priceStr.replace(/[^0-9.]/g, '');
    const num = parseFloat(numStr);
    if (isNaN(num)) return 0;
    if (priceStr.toLowerCase().includes('cr')) return num * 10000000;
    if (priceStr.toLowerCase().includes('l')) return num * 100000;
    return num;
  };

  // 1. Revenue & Inventory
  const totalInventoryValue = selectedProject?.units?.reduce((sum: number, u: any) => sum + parsePrice(u.price), 0) || 0;
  const expectedMandateRevenue = totalInventoryValue * 0.07; // Assuming 7% mandate fee
  
  const soldUnits = selectedProject?.units?.filter((u: any) => u.status === 'Sold') || [];
  const soldInventoryValue = soldUnits.reduce((sum: number, u: any) => sum + parsePrice(u.price), 0);
  const realizedMandateRevenue = soldInventoryValue * 0.07;

  // 2. Commission Liability (Auto-accrued)
  // Assuming 40% of realized mandate revenue is owed to advisors/sub-brokers
  const autoCommissionLiability = realizedMandateRevenue * 0.40;

  // 3. Expenses (Paid vs Committed)
  const paidExpenses = expenses.filter(e => e.status === 'Paid' || !e.status); // Default old to Paid
  const committedExpenses = expenses.filter(e => e.status === 'Committed');

  const totalPaid = paidExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCommitted = committedExpenses.reduce((sum, e) => sum + e.amount, 0) + autoCommissionLiability;
  const totalSpent = totalPaid + totalCommitted;

  const totalAllocated = budget?.totalCap || 0;
  const spentPercentage = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
  
  const netMargin = expectedMandateRevenue > 0 ? ((expectedMandateRevenue - totalSpent) / expectedMandateRevenue) * 100 : 0;

  // 4. Working Capital Gap (The Float)
  // Assume we have collected 50% of the realized revenue from the developer so far
  const assumedCollectionRate = 0.50; 
  const cashIn = realizedMandateRevenue * assumedCollectionRate;
  const cashOut = totalPaid;
  const workingCapitalGap = cashOut - cashIn; // Positive = Burning our cash, Negative = Float positive

  // 5. Unit Economics
  const marketingCat = budget?.categories.find(c => c.name.toLowerCase().includes('marketing'));
  const totalMarketingSpend = expenses.filter(e => e.categoryId === marketingCat?.id).reduce((sum, e) => sum + e.amount, 0);
  const blendedCAC = soldUnits.length > 0 ? totalMarketingSpend / soldUnits.length : 0;
  
  const avgNetRevenuePerUnit = soldUnits.length > 0 ? (realizedMandateRevenue - autoCommissionLiability) / soldUnits.length : 0;
  const breakEvenUnits = avgNetRevenuePerUnit > 0 ? Math.ceil(totalAllocated / avgNetRevenuePerUnit) : 0;

  // --- DATA PREPARATION FOR UI ---

  const categoryBreakdown = budget?.categories.map(cat => {
    const isAdvisorCat = cat.name.toLowerCase().includes('advisor') || cat.name.toLowerCase().includes('payout');
    const catPaid = paidExpenses.filter(e => e.categoryId === cat.id).reduce((sum, e) => sum + e.amount, 0);
    let catCommitted = committedExpenses.filter(e => e.categoryId === cat.id).reduce((sum, e) => sum + e.amount, 0);
    
    if (isAdvisorCat) {
      catCommitted += autoCommissionLiability;
    }

    const totalCatSpent = catPaid + catCommitted;

    return {
      ...cat,
      paid: catPaid,
      committed: catCommitted,
      totalSpent: totalCatSpent,
      remaining: Math.max(0, cat.allocated - totalCatSpent),
      isOverBudget: totalCatSpent > cat.allocated
    };
  }) || [];

  const bvaChartData = categoryBreakdown.map(cat => ({
    name: cat.name,
    Allocated: cat.allocated,
    Paid: cat.paid,
    Committed: cat.committed,
  }));

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString('en-IN')}`;
  };

  // --- HANDLERS ---

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSaveBudget = async () => {
    if (!selectedProjectId) return;
    setErrorMsg(null);
    try {
      const previousTotal = budget?.totalCap || 0;
      await setDoc(doc(db, 'project_budgets', selectedProjectId), {
        projectId: selectedProjectId,
        totalCap: budgetForm.totalCap,
        categories: budgetForm.categories,
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, 'budget_history'), {
        projectId: selectedProjectId,
        action: 'Budget Updated',
        description: `Updated budget allocations and cap.`,
        performedBy: currentUser?.email || 'Admin',
        previousTotal,
        newTotal: budgetForm.totalCap,
        timestamp: serverTimestamp()
      });

      setIsManageModalOpen(false);
    } catch (error) {
      setErrorMsg("Failed to save budget. Please check your permissions.");
      handleFirestoreError(error, OperationType.WRITE, `project_budgets/${selectedProjectId}`);
    }
  };

  const handleLogExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !expenseForm.categoryId || !expenseForm.amount) return;
    setErrorMsg(null);

    try {
      const amount = Number(expenseForm.amount);
      const category = budget?.categories.find(c => c.id === expenseForm.categoryId);

      await addDoc(collection(db, 'expenses'), {
        projectId: selectedProjectId,
        categoryId: expenseForm.categoryId,
        amount,
        date: expenseForm.date,
        vendor: expenseForm.vendor,
        notes: expenseForm.notes,
        status: expenseForm.status,
        loggedBy: currentUser?.email || 'Admin',
        createdAt: serverTimestamp()
      });

      await addDoc(collection(db, 'budget_history'), {
        projectId: selectedProjectId,
        action: `Expense Logged (${expenseForm.status})`,
        description: `Logged ${formatCurrency(amount)} for ${category?.name} to ${expenseForm.vendor || 'Vendor'}`,
        performedBy: currentUser?.email || 'Admin',
        timestamp: serverTimestamp()
      });

      setIsExpenseModalOpen(false);
      setExpenseForm({ ...expenseForm, amount: '', vendor: '', notes: '' });
    } catch (error) {
      setErrorMsg("Failed to log expense. Please check your permissions.");
      handleFirestoreError(error, OperationType.CREATE, 'expenses');
    }
  };

  const addCategory = () => {
    const newCat: BudgetCategory = {
      id: `cat-${Date.now()}`,
      name: 'New Category',
      allocated: 0,
      color: COLORS[budgetForm.categories.length % COLORS.length]
    };
    setBudgetForm({ ...budgetForm, categories: [...budgetForm.categories, newCat] });
  };

  const removeCategory = (id: string) => {
    setBudgetForm({ ...budgetForm, categories: budgetForm.categories.filter(c => c.id !== id) });
  };

  const updateCategory = (id: string, field: keyof BudgetCategory, value: any) => {
    setBudgetForm({
      ...budgetForm,
      categories: budgetForm.categories.map(c => c.id === id ? { ...c, [field]: value } : c)
    });
  };

  const formAllocated = budgetForm.categories.reduce((sum, c) => sum + c.allocated, 0);
  const formUnallocated = budgetForm.totalCap - formAllocated;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-ink">Project Budget & ROI</h2>
          <p className="text-gray-500">Advanced financial control, working capital, and unit economics.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="border border-brand-border rounded-lg px-4 py-2 bg-brand-surface text-brand-ink text-sm outline-none focus:border-brand-accent transition-all"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id} className="bg-brand-surface text-brand-ink">{p.name}</option>
            ))}
          </select>
          <button 
            onClick={() => setIsHistoryModalOpen(true)}
            className="btn-premium-secondary flex items-center gap-2 px-4 py-2 text-sm font-medium"
          >
            <History className="w-4 h-4" />
            History
          </button>
          <button 
            onClick={() => setIsExpenseModalOpen(true)}
            className="btn-premium-secondary flex items-center gap-2 px-4 py-2 text-sm font-medium"
          >
            <Receipt className="w-4 h-4" />
            Log Expense
          </button>
          <button 
            onClick={() => setIsManageModalOpen(true)}
            className="btn-premium-primary flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Edit2 className="w-4 h-4" />
            Manage Budget
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex justify-between items-start">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{errorMsg}</p>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CFO KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-brand-secondary rounded-lg border border-brand-border">
              <DollarSign className="w-6 h-6 text-brand-accent" />
            </div>
            <span className="text-xs font-medium badge-premium-primary px-2.5 py-1 rounded-full">Mandate Revenue</span>
          </div>
          <p className="text-sm text-brand-ink/50 mb-1">Expected (7% Fee)</p>
          <h3 className="text-2xl font-bold text-brand-ink">{formatCurrency(expectedMandateRevenue)}</h3>
          <div className="mt-4 pt-4 border-t border-brand-border flex justify-between items-center">
            <span className="text-sm text-brand-ink/50">Realized So Far</span>
            <span className="text-sm font-semibold text-green-400">{formatCurrency(realizedMandateRevenue)}</span>
          </div>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-brand-secondary rounded-lg border border-brand-border">
              <Wallet className={`w-6 h-6 ${workingCapitalGap > 0 ? 'text-red-400' : 'text-green-400'}`} />
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${workingCapitalGap > 0 ? 'badge-premium-danger' : 'badge-premium-success'}`}>
              The Float
            </span>
          </div>
          <p className="text-sm text-brand-ink/50 mb-1">Working Capital Gap</p>
          <h3 className={`text-2xl font-bold ${workingCapitalGap > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {workingCapitalGap > 0 ? '-' : '+'}{formatCurrency(Math.abs(workingCapitalGap))}
          </h3>
          <div className="mt-4 pt-4 border-t border-brand-border flex justify-between items-center">
            <span className="text-sm text-brand-ink/50">Cash Out: <span className="text-brand-ink">{formatCurrency(cashOut)}</span></span>
            <span className="text-sm text-brand-ink/50">Cash In: <span className="text-brand-ink">{formatCurrency(cashIn)}</span></span>
          </div>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-brand-secondary rounded-lg border border-brand-border">
              <Activity className="w-6 h-6 text-brand-accent" />
            </div>
            <span className="text-xs font-medium badge-premium-primary px-2.5 py-1 rounded-full">Profitability</span>
          </div>
          <p className="text-sm text-brand-ink/50 mb-1">Projected Net Margin</p>
          <h3 className="text-2xl font-bold text-brand-ink">{netMargin.toFixed(1)}%</h3>
          <div className="mt-4 pt-4 border-t border-brand-border flex justify-between items-center">
            <span className="text-sm text-brand-ink/50">Total Spent</span>
            <span className="text-sm font-semibold text-brand-ink">{formatCurrency(totalSpent)}</span>
          </div>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-brand-secondary rounded-lg border border-brand-border">
              <Target className="w-6 h-6 text-brand-accent" />
            </div>
            <span className="text-xs font-medium badge-premium-warning px-2.5 py-1 rounded-full">Unit Economics</span>
          </div>
          <p className="text-sm text-brand-ink/50 mb-1">Break-Even Target</p>
          <h3 className="text-2xl font-bold text-brand-ink">{breakEvenUnits} Units</h3>
          <div className="mt-4 pt-4 border-t border-brand-border flex justify-between items-center">
            <span className="text-sm text-brand-ink/50">Current Sales</span>
            <span className="text-sm font-semibold text-brand-ink">{soldUnits.length} Units</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Actuals (Committed vs Paid) */}
        <div className="card-premium p-6">
          <h3 className="text-lg font-bold text-brand-ink mb-6">Budget vs Actuals (Committed vs Paid)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={bvaChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-brand-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/100000}L`} tick={{ fill: 'rgba(255,255,255,0.4)' }} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ background: '#111114', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#F5F5F5' }}
                />
                <Legend />
                <Bar dataKey="Allocated" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Paid" stackId="a" fill="#3B82F6" />
                <Bar dataKey="Committed" stackId="a" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Advanced Unit Economics */}
        <div className="card-premium p-6">
          <h3 className="text-lg font-bold text-brand-ink mb-6">Advanced Unit Economics</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-brand-secondary rounded-lg border border-brand-border">
              <p className="text-sm text-brand-ink/50 mb-1">Blended CAC</p>
              <p className="text-xl font-bold text-brand-ink">{formatCurrency(blendedCAC)}</p>
              <p className="text-xs text-brand-ink/40 mt-1">Per Booking</p>
            </div>
            <div className="p-4 bg-brand-secondary rounded-lg border border-brand-border">
              <p className="text-sm text-brand-ink/50 mb-1">Avg Net Revenue</p>
              <p className="text-xl font-bold text-brand-ink">{formatCurrency(avgNetRevenuePerUnit)}</p>
              <p className="text-xs text-brand-ink/40 mt-1">Per Booking (Post-Commission)</p>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <ComposedChart data={[
                { name: 'Unit Economics', CAC: blendedCAC, NetRev: avgNetRevenuePerUnit }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis tickFormatter={(val) => `₹${val/100000}L`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="CAC" fill="#ef4444" barSize={40} />
                <Bar dataKey="NetRev" fill="#10b981" barSize={40} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Breakdown Ledger */}
      <div className="card-premium overflow-hidden">
        <div className="p-6 border-b border-brand-border flex justify-between items-center">
          <h3 className="text-lg font-bold text-brand-ink">Category Breakdown Ledger</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Paid</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Committed</div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-secondary/50 border-b border-brand-border">
                <th className="p-4 text-sm font-semibold text-brand-ink/50">Category</th>
                <th className="p-4 text-sm font-semibold text-brand-ink/50">Allocated</th>
                <th className="p-4 text-sm font-semibold text-brand-ink/50">Paid (Cash Out)</th>
                <th className="p-4 text-sm font-semibold text-brand-ink/50">Committed (Accrued)</th>
                <th className="p-4 text-sm font-semibold text-brand-ink/50">Total Spent</th>
                <th className="p-4 text-sm font-semibold text-brand-ink/50">Remaining</th>
                <th className="p-4 text-sm font-semibold text-brand-ink/50">Status</th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdown.map((cat) => (
                <tr key={cat.id} className="border-b border-brand-border hover:bg-brand-secondary/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                      <span className="font-medium text-brand-ink">{cat.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-brand-ink">{formatCurrency(cat.allocated)}</td>
                  <td className="p-4 text-blue-400 font-medium">{formatCurrency(cat.paid)}</td>
                  <td className="p-4 text-brand-accent font-medium">
                    {formatCurrency(cat.committed)}
                    {(cat.name.toLowerCase().includes('advisor') || cat.name.toLowerCase().includes('payout')) && autoCommissionLiability > 0 && (
                      <span className="block text-xs text-brand-ink/40 mt-1">Includes auto-accrued</span>
                    )}
                  </td>
                  <td className="p-4 text-brand-ink font-bold">{formatCurrency(cat.totalSpent)}</td>
                  <td className="p-4 text-brand-ink/60">{formatCurrency(cat.remaining)}</td>
                  <td className="p-4">
                    {cat.isOverBudget ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold badge-premium-danger border">
                        <AlertCircle className="w-3 h-3" /> Over Budget
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold badge-premium-success border">
                        <CheckCircle2 className="w-3 h-3" /> On Track
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Manage Budget Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 bg-brand-bg/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-premium w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-brand-border flex justify-between items-center sticky top-0 bg-brand-surface z-10">
              <h3 className="text-xl font-bold text-brand-ink">Manage Project Budget</h3>
              <button onClick={() => setIsManageModalOpen(false)} className="text-brand-ink/50 hover:text-brand-ink">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-brand-secondary p-4 rounded-lg border border-brand-accent/20">
                <label className="block text-sm font-semibold text-brand-accent mb-1">Total Project Budget Cap (₹)</label>
                <input
                  type="number"
                  value={budgetForm.totalCap}
                  onChange={(e) => setBudgetForm({ ...budgetForm, totalCap: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-brand-border rounded-lg focus:border-brand-accent outline-none text-lg font-bold text-brand-ink bg-brand-bg"
                />
                <div className="mt-2 flex justify-between items-center text-sm">
                  <span className="text-brand-ink/70">Allocated: {formatCurrency(formAllocated)}</span>
                  <span className={`font-bold ${formUnallocated < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    Unallocated: {formatCurrency(formUnallocated)}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-brand-ink">Budget Categories</h4>
                  <button onClick={addCategory} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                    <Plus className="w-4 h-4" /> Add Category
                  </button>
                </div>
                
                <div className="space-y-3">
                  {budgetForm.categories.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-4 p-3 bg-brand-secondary rounded-lg border border-brand-border">
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }}></div>
                      <input
                        type="text"
                        value={cat.name}
                        onChange={(e) => updateCategory(cat.id, 'name', e.target.value)}
                        placeholder="Category Name"
                        className="flex-1 px-3 py-2 border border-brand-border rounded-md bg-brand-bg text-brand-ink outline-none focus:border-brand-accent transition-all"
                      />
                      <div className="relative w-48">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink/40">₹</span>
                        <input
                          type="number"
                          value={cat.allocated}
                          onChange={(e) => updateCategory(cat.id, 'allocated', Number(e.target.value))}
                          className="w-full pl-8 pr-3 py-2 border border-brand-border rounded-md bg-brand-bg text-brand-ink outline-none focus:border-brand-accent transition-all"
                        />
                      </div>
                      <button onClick={() => removeCategory(cat.id)} className="p-2 text-brand-ink/40 hover:text-red-400 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-brand-border flex justify-end gap-3 sticky bottom-0 bg-brand-surface">
              <button onClick={() => setIsManageModalOpen(false)} className="btn-premium-secondary px-4 py-2 font-medium">
                Cancel
              </button>
              <button 
                onClick={handleSaveBudget}
                disabled={formUnallocated < 0}
                className="btn-premium-primary px-6 py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Budget
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-brand-bg/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-premium w-full max-w-md">
            <div className="p-6 border-b border-brand-border flex justify-between items-center">
              <h3 className="text-xl font-bold text-brand-ink">Log Expense</h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-brand-ink/50 hover:text-brand-ink">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleLogExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-ink/75 mb-1">Category</label>
                <select
                  required
                  value={expenseForm.categoryId}
                  onChange={(e) => setExpenseForm({ ...expenseForm, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-bg text-brand-ink outline-none focus:border-brand-accent transition-all"
                >
                  <option value="">Select Category</option>
                  {budget?.categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-ink/75 mb-1">Status (Accrual vs Cash)</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setExpenseForm({ ...expenseForm, status: 'Committed' })}
                    className={`px-4 py-2 border rounded-lg text-sm font-semibold transition-colors ${expenseForm.status === 'Committed' ? 'badge-premium-warning border-brand-accent/30' : 'bg-brand-bg border-brand-border text-brand-ink/50 hover:bg-brand-secondary'}`}
                  >
                    Committed (PO/Invoice)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpenseForm({ ...expenseForm, status: 'Paid' })}
                    className={`px-4 py-2 border rounded-lg text-sm font-semibold transition-colors ${expenseForm.status === 'Paid' ? 'badge-premium-primary border-brand-border' : 'bg-brand-bg border-brand-border text-brand-ink/50 hover:bg-brand-secondary'}`}
                  >
                    Paid (Cash Out)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-ink/75 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-bg text-brand-ink outline-none focus:border-brand-accent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-ink/75 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-bg text-brand-ink outline-none focus:border-brand-accent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-ink/75 mb-1">Vendor / Payee</label>
                <input
                  type="text"
                  required
                  value={expenseForm.vendor}
                  onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                  className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-bg text-brand-ink outline-none focus:border-brand-accent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-ink/75 mb-1">Notes</label>
                <textarea
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-bg text-brand-ink outline-none focus:border-brand-accent transition-all"
                  rows={3}
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="btn-premium-secondary px-4 py-2 font-medium">
                  Cancel
                </button>
                <button type="submit" className="btn-premium-primary px-6 py-2 font-medium">
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-brand-bg/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-premium w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-brand-border flex justify-between items-center">
              <h3 className="text-xl font-bold text-brand-ink">Budget & Expense History</h3>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-brand-ink/50 hover:text-brand-ink">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {history.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No history recorded yet.</div>
              ) : (
                <div className="space-y-6">
                  {history.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="mt-1">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          {item.action.includes('Expense') ? <Receipt className="w-4 h-4 text-blue-600" /> : <Edit2 className="w-4 h-4 text-blue-600" />}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-brand-ink">{item.action}</p>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {item.performedBy}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.timestamp?.toDate?.()?.toLocaleString() || 'Just now'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export { DirectorBudgetROI };
