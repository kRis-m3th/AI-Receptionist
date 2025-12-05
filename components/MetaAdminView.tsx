import React, { useState, useEffect } from 'react';
import { Users, Server, Cpu, Globe, Key, AlertCircle, Save, CheckCircle2, ShieldCheck, Building2, TrendingUp, Search, Plus, MoreHorizontal, DollarSign, CreditCard, RefreshCw, FileText, Tag, Edit2, BookOpen, ArrowLeft, Lock } from 'lucide-react';
import { AIConfig, AIProvider, Tenant, Transaction, PlanTier } from '../types';
import { getAIConfig, saveAIConfig } from '../services/aiService';
import { getAllTenants, addTenant, generateId, getAllTransactions, bulkAddTransactions, updateTenants, getAllPlans, updatePlans, getAdminProfile } from '../services/dbService';
import { runMonthlyBilling } from '../services/paymentService';
import { KnowledgeBaseView } from './KnowledgeBaseView';

export const MetaAdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tenants' | 'billing' | 'plans' | 'platform' | 'knowledge'>('tenants');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // SECURITY CHECK: Verify access level on mount
  useEffect(() => {
      const profile = getAdminProfile();
      if (profile.accessLevel === 'super_admin') {
          setIsAuthorized(true);
      }
      setIsLoading(false);
  }, []);

  if (isLoading) return <div className="p-10 text-center">Verifying permissions...</div>;

  if (!isAuthorized) {
      return (
          <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-4">
              <div className="bg-red-100 p-4 rounded-full text-red-600">
                  <Lock size={48} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
              <p className="text-slate-500 max-w-md">
                  You do not have sufficient permissions to view the Meta Admin Console. 
                  This incident has been logged.
              </p>
          </div>
      );
  }

  return (
    <div className="space-y-6">
       <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="text-indigo-400" size={32} />
                <h1 className="text-3xl font-bold tracking-tight">Meta Admin Console</h1>
            </div>
            <p className="text-slate-400 text-lg">Manage customers, platform settings, and billing.</p>
          </div>
          <div className="flex bg-slate-800 p-1 rounded-lg flex-wrap">
             <button 
               onClick={() => setActiveTab('tenants')}
               className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${activeTab === 'tenants' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
             >
                Customers
             </button>
             <button 
               onClick={() => setActiveTab('billing')}
               className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${activeTab === 'billing' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
             >
                Billing
             </button>
             <button 
               onClick={() => setActiveTab('plans')}
               className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${activeTab === 'plans' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
             >
                Plans
             </button>
             <button 
               onClick={() => setActiveTab('platform')}
               className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${activeTab === 'platform' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
             >
                Platform
             </button>
             <button 
               onClick={() => setActiveTab('knowledge')}
               className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${activeTab === 'knowledge' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
             >
                Knowledge Base (Global)
             </button>
          </div>
       </div>

       {activeTab === 'tenants' ? <TenantManagement /> : 
        activeTab === 'billing' ? <BillingManagement /> :
        activeTab === 'plans' ? <PlanManagement /> :
        activeTab === 'knowledge' ? <KnowledgeBaseView /> :
        <PlatformSettings />}
    </div>
  );
};

// --- SUB-COMPONENT: Plan Management ---
const PlanManagement: React.FC = () => {
    const [plans, setPlans] = useState<PlanTier[]>([]);
    const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<PlanTier>>({});

    useEffect(() => {
        setPlans(getAllPlans());
    }, []);

    const handleEditClick = (plan: PlanTier) => {
        setEditingPlanId(plan.id);
        setEditForm(plan);
    };

    const handleSave = () => {
        if (!editingPlanId) return;
        const updatedPlans = plans.map(p => p.id === editingPlanId ? { ...p, ...editForm } as PlanTier : p);
        updatePlans(updatedPlans);
        setPlans(updatedPlans);
        setEditingPlanId(null);
    };

    const handleCancel = () => {
        setEditingPlanId(null);
        setEditForm({});
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {editingPlanId === plan.id ? (
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Plan Name</label>
                                    <input 
                                        type="text" 
                                        value={editForm.name} 
                                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Price</label>
                                        <input 
                                            type="number" 
                                            value={editForm.price} 
                                            onChange={e => setEditForm({...editForm, price: Number(e.target.value)})}
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Period</label>
                                        <input 
                                            type="text" 
                                            value={editForm.period} 
                                            onChange={e => setEditForm({...editForm, period: e.target.value})}
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
                                    <textarea 
                                        value={editForm.description} 
                                        onChange={e => setEditForm({...editForm, description: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button onClick={handleCancel} className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded">Cancel</button>
                                    <button onClick={handleSave} className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                                    <button onClick={() => handleEditClick(plan)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600">
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                                <div className="text-3xl font-bold text-slate-900 mb-2">${plan.price} <span className="text-sm text-slate-400 font-normal">/{plan.period}</span></div>
                                <p className="text-slate-500 text-sm mb-6 h-10">{plan.description}</p>
                                
                                <div className="space-y-2">
                                    {plan.features.slice(0,4).map((f, i) => (
                                        <div key={i} className={`text-xs flex items-center gap-2 ${f.included ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${f.included ? 'bg-green-500' : 'bg-slate-300'}`} />
                                            {f.text}
                                        </div>
                                    ))}
                                    {plan.features.length > 4 && <div className="text-xs text-slate-400 italic">...and {plan.features.length - 4} more</div>}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: Tenant Management ---
const TenantManagement: React.FC = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'rag'>('overview');

    useEffect(() => {
        setTenants(getAllTenants());
    }, []);

    const filteredTenants = tenants.filter(t => 
        t.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddTenant = () => {
        const newTenant: Tenant = {
            id: generateId(),
            businessName: "New Business Inc",
            ownerName: "Pending Owner",
            email: "pending@email.com",
            plan: 'Email Only',
            status: 'Trial',
            joinedDate: new Date().toLocaleDateString(),
            mrr: 0,
            billingCycle: 'monthly',
            nextBillingDate: new Date().toLocaleDateString()
        };
        const updated = addTenant(newTenant);
        setTenants(updated);
    };

    if (selectedTenant) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                <div className="flex items-center gap-4 mb-6">
                    <button 
                        onClick={() => setSelectedTenant(null)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{selectedTenant.businessName}</h1>
                        <p className="text-slate-500 text-sm">Managing Tenant Profile</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                    <div className="border-b border-slate-200 flex px-6">
                        <button 
                            onClick={() => setActiveDetailTab('overview')}
                            className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
                                activeDetailTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Overview
                        </button>
                        <button 
                            onClick={() => setActiveDetailTab('rag')}
                            className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
                                activeDetailTab === 'rag' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Knowledge Base (RAG)
                        </button>
                    </div>

                    <div className="p-6 flex-1 bg-slate-50">
                        {activeDetailTab === 'overview' && (
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <h3 className="font-bold text-slate-900 mb-4">Account Details</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between border-b border-slate-100 pb-2">
                                            <span className="text-slate-500">Owner</span>
                                            <span className="font-medium text-slate-900">{selectedTenant.ownerName}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-100 pb-2">
                                            <span className="text-slate-500">Email</span>
                                            <span className="font-medium text-slate-900">{selectedTenant.email}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-100 pb-2">
                                            <span className="text-slate-500">Status</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${selectedTenant.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {selectedTenant.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between pt-2">
                                            <span className="text-slate-500">Joined</span>
                                            <span className="font-medium text-slate-900">{selectedTenant.joinedDate}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <h3 className="font-bold text-slate-900 mb-4">Billing Snapshot</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between border-b border-slate-100 pb-2">
                                            <span className="text-slate-500">Plan</span>
                                            <span className="font-medium text-slate-900">{selectedTenant.plan}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-100 pb-2">
                                            <span className="text-slate-500">MRR</span>
                                            <span className="font-medium text-green-600">${selectedTenant.mrr}</span>
                                        </div>
                                        <div className="flex justify-between pt-2">
                                            <span className="text-slate-500">Next Billing</span>
                                            <span className="font-medium text-slate-900">{selectedTenant.nextBillingDate}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeDetailTab === 'rag' && (
                            <KnowledgeBaseView customerId={selectedTenant.id} />
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search businesses..." 
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={handleAddTenant}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Customer
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                                <th className="p-4 border-b border-slate-200">Business</th>
                                <th className="p-4 border-b border-slate-200">Owner</th>
                                <th className="p-4 border-b border-slate-200">Plan</th>
                                <th className="p-4 border-b border-slate-200">Status</th>
                                <th className="p-4 border-b border-slate-200 text-right">MRR</th>
                                <th className="p-4 border-b border-slate-200 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTenants.map((tenant) => (
                                <tr 
                                    key={tenant.id} 
                                    onClick={() => setSelectedTenant(tenant)}
                                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                                >
                                    <td className="p-4 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center text-slate-500">
                                                <Building2 size={16} />
                                            </div>
                                            <span className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{tenant.businessName}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 border-b border-slate-100 text-sm">
                                        <div className="text-slate-900">{tenant.ownerName}</div>
                                        <div className="text-slate-500 text-xs">{tenant.email}</div>
                                    </td>
                                    <td className="p-4 border-b border-slate-100">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                                            tenant.plan === 'Enterprise' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                            tenant.plan === 'Pro Bundle' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                            'bg-slate-50 text-slate-600 border-slate-200'
                                        }`}>
                                            {tenant.plan}
                                        </span>
                                    </td>
                                    <td className="p-4 border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${
                                                tenant.status === 'Active' ? 'bg-green-500' :
                                                tenant.status === 'Trial' ? 'bg-blue-500' : 'bg-red-500'
                                            }`}></div>
                                            <span className="text-sm text-slate-700">{tenant.status}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 border-b border-slate-100 text-right font-mono text-sm">
                                        ${tenant.mrr}
                                    </td>
                                    <td className="p-4 border-b border-slate-100 text-right">
                                        <button className="text-slate-400 hover:text-indigo-600 p-2">
                                            <Edit2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENT: Billing Management ---
const BillingManagement: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isRunningPayroll, setIsRunningPayroll] = useState(false);

    useEffect(() => {
        setTransactions(getAllTransactions());
        setTenants(getAllTenants());
    }, []);

    const totalMRR = tenants.reduce((sum, t) => sum + t.mrr, 0);
    const totalTransactions = transactions.reduce((sum, t) => t.status === 'succeeded' && t.type === 'charge' ? sum + t.amount : sum, 0);

    const handleRunPayroll = async () => {
        setIsRunningPayroll(true);
        try {
            const { updatedTenants, transactions: newTxs } = await runMonthlyBilling(tenants);
            
            // Save to DB
            updateTenants(updatedTenants);
            bulkAddTransactions(newTxs);
            
            // Update UI
            setTenants(updatedTenants);
            setTransactions(prev => [...newTxs, ...prev]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsRunningPayroll(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Total Monthly Revenue (MRR)</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-2 flex items-baseline gap-1">
                        ${totalMRR} <span className="text-xs text-slate-400 font-normal">/mo</span>
                    </h3>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">YTD Collected Revenue</p>
                    <h3 className="text-3xl font-bold text-green-600 mt-2">${totalTransactions.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                     <p className="text-sm font-medium text-slate-500">Billing Operations</p>
                     <button 
                        onClick={handleRunPayroll}
                        disabled={isRunningPayroll}
                        className="mt-2 w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-70"
                     >
                        {isRunningPayroll ? <RefreshCw className="animate-spin" size={18} /> : <DollarSign size={18} />}
                        {isRunningPayroll ? 'Processing...' : 'Run Monthly Billing'}
                     </button>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <CreditCard size={18} className="text-slate-500" />
                        Transaction History
                    </h3>
                </div>
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white z-10 shadow-sm">
                            <tr className="text-slate-600 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                                <th className="p-4">Tenant</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Payment Method</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Invoice</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500">
                                        No transactions recorded yet. Run billing to generate data.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                                        <td className="p-4 font-medium text-slate-900">{tx.tenantName}</td>
                                        <td className="p-4 text-sm text-slate-500">{tx.date}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                                                tx.type === 'charge' ? 'bg-indigo-50 text-indigo-700' :
                                                tx.type === 'refund' ? 'bg-orange-50 text-orange-700' :
                                                'bg-blue-50 text-blue-700'
                                            }`}>
                                                {tx.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-mono">${tx.amount.toFixed(2)}</td>
                                        <td className="p-4 text-sm text-slate-600 flex items-center gap-2">
                                            <CreditCard size={14} /> {tx.paymentMethod}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                                                tx.status === 'succeeded' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                            }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {tx.status === 'succeeded' && (
                                                <button className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1">
                                                    <FileText size={14} /> PDF
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENT: Platform Settings (Original) ---
const PlatformSettings: React.FC = () => {
    const [config, setConfig] = useState<AIConfig>(getAIConfig());
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setConfig(getAIConfig());
    }, []);

    const handleSave = () => {
        saveAIConfig(config);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const getProviderDescription = (provider: AIProvider) => {
        switch (provider) {
        case 'gemini': return 'Use Google\'s Gemini models (Recommended). Default.';
        case 'openai': return 'Use OpenAI\'s GPT models (requires valid API key).';
        case 'anthropic': return 'Use Anthropic\'s Claude models.';
        case 'custom': return 'Connect to any OpenAI-compatible endpoint (e.g., Localhost, Ollama, LM Studio).';
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                            <Cpu size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">LLM Provider Configuration</h2>
                            <p className="text-sm text-slate-500">Configure the AI models that power the platform for all users.</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Provider Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {(['gemini', 'openai', 'anthropic', 'custom'] as AIProvider[]).map((provider) => (
                            <button
                                key={provider}
                                onClick={() => setConfig({ ...config, provider })}
                                className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                                    config.provider === provider
                                        ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <div className="font-semibold capitalize text-slate-900 mb-1">{provider}</div>
                                <div className="text-xs text-slate-500 leading-snug">{getProviderDescription(provider)}</div>
                                {config.provider === provider && (
                                    <div className="absolute top-3 right-3 text-indigo-600">
                                        <CheckCircle2 size={16} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    <hr className="border-slate-100" />

                    {/* Configuration Fields */}
                    <div className="space-y-6 max-w-2xl">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                <Key size={16} /> API Key
                            </label>
                            <input
                                type="password"
                                value={config.apiKey}
                                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                                placeholder={config.provider === 'custom' ? "Optional for local LLMs" : `Enter your ${config.provider} API key`}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                    <Server size={16} /> Model Name
                                </label>
                                <input
                                    type="text"
                                    value={config.model}
                                    onChange={(e) => setConfig({ ...config, model: e.target.value })}
                                    placeholder={
                                        config.provider === 'gemini' ? 'gemini-2.5-flash' :
                                            config.provider === 'openai' ? 'gpt-4o' :
                                                'Model ID'
                                    }
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                />
                            </div>

                            {(config.provider === 'custom' || config.provider === 'openai') && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                        <Globe size={16} /> Base URL
                                    </label>
                                    <input
                                        type="text"
                                        value={config.baseUrl || ''}
                                        onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                                        placeholder={config.provider === 'openai' ? "https://api.openai.com/v1" : "http://localhost:11434/v1"}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    />
                                </div>
                            )}
                        </div>

                        {config.provider === 'custom' && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800 text-sm">
                                <AlertCircle className="shrink-0" size={20} />
                                <p>
                                    Ensure your custom endpoint supports OpenAI-compatible chat completions format.
                                    If using a local server (like Ollama), you may need to enable CORS.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <Save size={18} />
                            Save Configuration
                        </button>
                        {saved && (
                            <span className="flex items-center gap-2 text-green-600 font-medium animate-in fade-in slide-in-from-left-2">
                                <CheckCircle2 size={18} />
                                Settings Saved!
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}