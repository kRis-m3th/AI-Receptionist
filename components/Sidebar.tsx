import React from 'react';
import { LayoutDashboard, Users, Mail, Phone, Settings, Activity, Bug, ShieldCheck, CreditCard, LogOut, Calendar, Briefcase } from 'lucide-react';
import { getAdminProfile } from '../services/dbService';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'crm', label: 'CRM', icon: <Users size={20} /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar size={20} /> },
    { id: 'jobs', label: 'Field Ops & Jobs', icon: <Briefcase size={20} /> },
    { id: 'email', label: 'Email Automation', icon: <Mail size={20} /> },
    { id: 'receptionist', label: 'AI Receptionist', icon: <Phone size={20} /> },
    { id: 'plans', label: 'Plans & Pricing', icon: <CreditCard size={20} /> },
    { id: 'settings', label: 'User Settings', icon: <Settings size={20} /> },
  ];

  // Get dynamic profile data
  const adminProfile = getAdminProfile();
  
  // Security Check: Only super_admin can see Meta Admin link
  const canAccessMetaAdmin = adminProfile.accessLevel === 'super_admin';

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 border-r border-slate-800 z-40">
      <button 
        onClick={onLogout} 
        className="w-full p-6 flex items-center gap-3 hover:bg-slate-800 transition-colors text-left"
        title="Go to Public Landing Page"
      >
        <div className="bg-indigo-500 p-2 rounded-lg">
          <Activity size={24} className="text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">NexusAI</span>
      </button>

      <nav className="flex-1 px-4 py-4 flex flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              currentView === item.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}

        {/* META ADMIN LINK - Protected by Role Check */}
        {canAccessMetaAdmin && (
            <div className="my-2 border-t border-slate-800/50 pt-2">
               <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Administration</p>
               <button
                onClick={() => setCurrentView('meta-admin')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  currentView === 'meta-admin'
                    ? 'bg-gradient-to-r from-purple-900/50 to-indigo-900/50 text-indigo-300 border border-indigo-500/30'
                    : 'text-indigo-300/70 hover:bg-slate-800 hover:text-indigo-300'
                }`}
              >
                <ShieldCheck size={20} />
                <span className="font-medium">Meta Admin</span>
              </button>
            </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate-800/50">
          <button
            onClick={() => setCurrentView('report-bug')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              currentView === 'report-bug'
                ? 'bg-red-900/30 text-red-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-red-400'
            }`}
          >
            <Bug size={20} />
            <span className="font-medium">Report Bug</span>
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <button 
          onClick={() => setCurrentView('admin-profile')}
          className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors duration-200 ${
             currentView === 'admin-profile' ? 'bg-slate-800' : 'hover:bg-slate-800'
          }`}
        >
          <img
            src={adminProfile.avatarUrl}
            alt="User"
            className="w-10 h-10 rounded-full border-2 border-slate-700 object-cover"
          />
          <div className="text-left">
            <p className="text-sm font-medium text-white line-clamp-1">{adminProfile.name}</p>
            <p className="text-xs text-slate-500">{adminProfile.plan}</p>
          </div>
        </button>
        
        {onLogout && (
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
};