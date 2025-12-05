import React, { useState, useEffect } from 'react';
import { User, CreditCard, HelpCircle, Save, Camera, Mail, Phone, Building, CheckCircle2, MessageSquare, Briefcase, Plus, X, Trash2, Edit2 } from 'lucide-react';
import { AdminProfile, Worker } from '../types';
import { getAdminProfile, updateAdminProfile, getAllWorkers, addWorker, updateWorker, deleteWorker, generateId } from '../services/dbService';
import { PaymentModal } from './PaymentModal';

interface AdminProfileViewProps {
  setCurrentView?: (view: string) => void;
}

export const AdminProfileView: React.FC<AdminProfileViewProps> = ({ setCurrentView }) => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'help' | 'team'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState<Partial<AdminProfile>>({});
  
  // Help Form State
  const [helpRequest, setHelpRequest] = useState('');

  // Team Management State
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [workerForm, setWorkerForm] = useState<Partial<Worker>>({
      name: '', email: '', phone: '', role: '', skills: [], status: 'Available'
  });

  useEffect(() => {
    const data = getAdminProfile();
    setProfile(data);
    setFormData(data);
    setWorkers(getAllWorkers());
  }, []);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    const updated = { ...profile, ...formData } as AdminProfile;
    updateAdminProfile(updated);
    setProfile(updated);
    setIsEditing(false);
    showNotification('Profile updated successfully', 'success');
  };

  const handlePaymentSuccess = (cardDetails: { last4: string, brand: string, expiry: string }) => {
    if (!profile) return;

    const updated = {
        ...profile,
        billing: {
            ...profile.billing,
            last4: cardDetails.last4,
            brand: cardDetails.brand,
            expiry: cardDetails.expiry
        }
    };
    updateAdminProfile(updated);
    setProfile(updated);
    showNotification('Payment method updated successfully', 'success');
  };

  const handleHelpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
        setHelpRequest('');
        showNotification('Request sent! Support will contact you shortly.', 'success');
    }, 1000);
  };

  // --- WORKER HANDLERS ---
  const openAddWorkerModal = () => {
      setEditingWorkerId(null);
      setWorkerForm({ name: '', email: '', phone: '', role: '', skills: [], status: 'Available' });
      setIsWorkerModalOpen(true);
  };

  const openEditWorkerModal = (worker: Worker) => {
      setEditingWorkerId(worker.id);
      setWorkerForm(worker);
      setIsWorkerModalOpen(true);
  };

  const handleWorkerDelete = (id: string) => {
      if (window.confirm("Are you sure you want to remove this employee?")) {
          const updated = deleteWorker(id);
          setWorkers(updated);
          showNotification('Worker removed successfully', 'success');
      }
  };

  const handleWorkerSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const skillString = (workerForm.skills as any); // Handle string input from form
      const skillArray = Array.isArray(skillString) ? skillString : typeof skillString === 'string' ? skillString.split(',').map(s => s.trim()) : [];

      const payload: Worker = {
          id: editingWorkerId || generateId(),
          name: workerForm.name || 'New Worker',
          email: workerForm.email || '',
          phone: workerForm.phone || '',
          role: workerForm.role || 'Staff',
          skills: skillArray,
          status: (workerForm.status as any) || 'Available',
          avatarUrl: workerForm.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(workerForm.name || 'U')}&background=random`
      };

      if (editingWorkerId) {
          const updated = updateWorker(payload);
          setWorkers(updated);
          showNotification('Worker updated successfully', 'success');
      } else {
          const updated = addWorker(payload);
          setWorkers(updated);
          showNotification('Worker added successfully', 'success');
      }
      setIsWorkerModalOpen(false);
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 relative">
      {/* Payment Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />

      {/* Add/Edit Worker Modal */}
      {isWorkerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editingWorkerId ? 'Edit Worker' : 'Add New Worker'}</h2>
                      <button onClick={() => setIsWorkerModalOpen(false)}><X className="text-slate-400" size={24} /></button>
                  </div>
                  <form onSubmit={handleWorkerSubmit} className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                          <input 
                              required
                              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                              value={workerForm.name}
                              onChange={e => setWorkerForm({...workerForm, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role / Job Title</label>
                          <input 
                              required
                              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                              placeholder="e.g. Technician"
                              value={workerForm.role}
                              onChange={e => setWorkerForm({...workerForm, role: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                              <input 
                                  required
                                  type="email"
                                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                  value={workerForm.email}
                                  onChange={e => setWorkerForm({...workerForm, email: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone (SMS)</label>
                              <input 
                                  required
                                  type="tel"
                                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                  placeholder="+1..."
                                  value={workerForm.phone}
                                  onChange={e => setWorkerForm({...workerForm, phone: e.target.value})}
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Skills (Comma separated)</label>
                          <input 
                              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                              placeholder="Repair, Installation, HVAC"
                              value={Array.isArray(workerForm.skills) ? workerForm.skills.join(', ') : workerForm.skills}
                              onChange={e => setWorkerForm({...workerForm, skills: e.target.value as any})}
                          />
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                          <button type="button" onClick={() => setIsWorkerModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
                          <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700">Save Worker</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Account & Settings</h1>
           <p className="text-slate-500 dark:text-slate-400">Manage your personal profile, team, and subscription.</p>
        </div>
        {notification && (
            <div className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2 ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <CheckCircle2 size={16} />
                {notification.message}
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col items-center text-center">
            <div className="relative group cursor-pointer mb-4">
               <img src={profile.avatarUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 dark:border-slate-800" />
               <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Camera className="text-white" size={24} />
               </div>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{profile.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{profile.role}</p>
            <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
               <div className="text-center">
                 <p className="text-xs text-slate-400 uppercase tracking-wider">Plan</p>
                 <p className="font-semibold text-indigo-600 dark:text-indigo-400 text-sm line-clamp-1">{profile.plan}</p>
               </div>
               <div className="text-center">
                 <p className="text-xs text-slate-400 uppercase tracking-wider">Member Since</p>
                 <p className="font-semibold text-slate-700 dark:text-slate-300">Oct 2023</p>
               </div>
            </div>
          </div>

          <nav className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors border-l-4 ${activeTab === 'profile' ? 'border-l-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
               <User size={20} />
               <span className="font-medium">Personal Information</span>
            </button>
            <button 
              onClick={() => setActiveTab('team')}
              className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors border-l-4 ${activeTab === 'team' ? 'border-l-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
               <Briefcase size={20} />
               <span className="font-medium">Team & Workers</span>
            </button>
            <button 
              onClick={() => setActiveTab('billing')}
              className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors border-l-4 ${activeTab === 'billing' ? 'border-l-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
               <CreditCard size={20} />
               <span className="font-medium">Billing & Payment</span>
            </button>
            <button 
              onClick={() => setActiveTab('help')}
              className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors border-l-4 ${activeTab === 'help' ? 'border-l-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
               <HelpCircle size={20} />
               <span className="font-medium">Request Features / Help</span>
            </button>
          </nav>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 min-h-[500px]">
                {/* --- PROFILE TAB --- */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h3>
                        {!isEditing ? (
                          <button type="button" onClick={() => setIsEditing(true)} className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Edit Profile</button>
                        ) : (
                          <div className="flex gap-3">
                             <button type="button" onClick={() => { setIsEditing(false); setFormData(profile); }} className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">Cancel</button>
                             <button type="submit" className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700">Save Changes</button>
                          </div>
                        )}
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                           <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input 
                                disabled={!isEditing}
                                type="text"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:text-slate-500"
                              />
                           </div>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role / Title</label>
                           <input 
                                disabled={!isEditing}
                                type="text"
                                value={formData.role || ''}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:text-slate-500"
                              />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                           <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input 
                                disabled={!isEditing}
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:text-slate-500"
                              />
                           </div>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                           <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input 
                                disabled={!isEditing}
                                type="tel"
                                value={formData.phone || ''}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:text-slate-500"
                              />
                           </div>
                        </div>
                        <div className="md:col-span-2">
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Company Name</label>
                           <div className="relative">
                              <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input 
                                disabled={!isEditing}
                                type="text"
                                value={formData.companyName || ''}
                                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:text-slate-500"
                              />
                           </div>
                        </div>
                     </div>
                  </form>
                )}

                {/* --- TEAM TAB --- */}
                {activeTab === 'team' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Team & Workers</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your field agents and staff for job dispatch.</p>
                            </div>
                            <button 
                                onClick={openAddWorkerModal}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
                            >
                                <Plus size={18} /> Add Worker
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {workers.length === 0 ? (
                                <div className="col-span-2 text-center py-12 text-slate-500">
                                    <Briefcase size={48} className="mx-auto mb-4 opacity-30" />
                                    <p>No workers found.</p>
                                    <p className="text-sm">Add your employees to start assigning jobs.</p>
                                </div>
                            ) : (
                                workers.map(worker => (
                                    <div key={worker.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex flex-col gap-3 group relative hover:shadow-md transition-shadow">
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEditWorkerModal(worker)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleWorkerDelete(worker.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <img src={worker.avatarUrl} alt={worker.name} className="w-12 h-12 rounded-full border border-slate-100" />
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white">{worker.name}</h4>
                                                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{worker.role}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} className="text-slate-400" /> {worker.email}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} className="text-slate-400" /> {worker.phone}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {worker.skills.map((skill, i) => (
                                                <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                        
                                        <div className="mt-auto pt-2">
                                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                                worker.status === 'Available' ? 'bg-green-100 text-green-700' :
                                                worker.status === 'On Job' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {worker.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* --- BILLING TAB --- */}
                {activeTab === 'billing' && (
                  <div className="space-y-8">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Current Subscription</h3>
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-900/30 flex justify-between items-center">
                            <div>
                                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider mb-1">Current Plan</p>
                                <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{profile.plan}</h4>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Next billing date: {profile.billing.nextBillingDate}</p>
                            </div>
                            <button 
                                onClick={() => setCurrentView && setCurrentView('plans')}
                                className="px-4 py-2 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                            >
                                Change Plan
                            </button>
                        </div>
                      </div>

                      <div>
                         <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Payment Method</h3>
                         <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg mb-6">
                            <div className="w-12 h-8 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-400 text-xs">
                                {profile.billing.brand}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-slate-900 dark:text-white">•••• •••• •••• {profile.billing.last4}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Expires {profile.billing.expiry}</p>
                            </div>
                            <span className="text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">Default</span>
                         </div>

                         <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Need to update your card? Securely add a new payment method below.</p>
                            <button 
                                onClick={() => setIsPaymentModalOpen(true)}
                                className="px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 text-white font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-indigo-700 flex items-center gap-2 mx-auto"
                            >
                                <CreditCard size={18} />
                                Update Payment Method
                            </button>
                         </div>
                      </div>
                  </div>
                )}

                {/* --- HELP TAB --- */}
                {activeTab === 'help' && (
                   <div className="space-y-6">
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-6">
                         <div className="flex items-start gap-4">
                             <div className="p-3 bg-white dark:bg-slate-800 rounded-full text-indigo-600 dark:text-indigo-400 shadow-sm">
                                <MessageSquare size={24} />
                             </div>
                             <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg">How can we help?</h3>
                                <p className="text-slate-600 dark:text-slate-400 mt-1">
                                    Have a feature request? Need help with a bug? Or just want to say hi? 
                                    Fill out the form below and our support team will get back to you within 24 hours.
                                </p>
                             </div>
                         </div>
                      </div>

                      <form onSubmit={handleHelpSubmit} className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Request Type</label>
                            <select className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                                <option>Feature Request</option>
                                <option>Technical Support</option>
                                <option>Billing Question</option>
                                <option>Other</option>
                            </select>
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message</label>
                            <textarea 
                                required
                                value={helpRequest}
                                onChange={(e) => setHelpRequest(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                placeholder="Describe your request or issue in detail..."
                            />
                         </div>
                         <div className="flex justify-end">
                            <button type="submit" className="px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 text-white font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-indigo-700 flex items-center gap-2">
                                <Send size={16} className="rotate-0" />
                                Send Request
                            </button>
                         </div>
                      </form>
                   </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

// Simple icon for the help form button
const Send = ({ size, className }: { size?: number, className?: string }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
);