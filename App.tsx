import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CRMView } from './components/CRMView';
import { EmailView } from './components/EmailView';
import { SettingsView } from './components/SettingsView';
import { ReportBugView } from './components/ReportBugView';
import { AdminProfileView } from './components/AdminProfileView';
import { MetaAdminView } from './components/MetaAdminView';
import { PlansView } from './components/PlansView';
import { LandingPage } from './components/LandingPage';
import { ReceptionistView } from './components/ReceptionistView';
import { AppointmentsView } from './components/AppointmentsView';
import { JobsView } from './components/JobsView';
import { OnboardingView } from './components/OnboardingView'; // Import Onboarding
import { Bell, Search, Clock, CheckCircle2 } from 'lucide-react';
import { initDB, getAllTasks, updateTask } from './services/dbService';
import { Task } from './types';

const TopBar: React.FC = () => {
  const [reminders, setReminders] = useState<Task[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Poll for tasks with reminders enabled
    const checkReminders = () => {
      const allTasks = getAllTasks();
      const activeReminders = allTasks.filter(t => t.reminder && !t.completed);
      setReminders(activeReminders);
    };

    checkReminders();
    const interval = setInterval(checkReminders, 2000); // Poll every 2s

    // Click outside listener for dropdown
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
        clearInterval(interval);
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCompleteReminder = (task: Task) => {
      updateTask({ ...task, completed: true });
      // Local update for instant feedback, real update happens on next poll
      setReminders(prev => prev.filter(t => t.id !== task.id));
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30 transition-colors">
        {/* Search Bar */}
        <div className="relative w-96 hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
            type="text"
            placeholder="Global search (Cmd + K)"
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
        />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full text-xs font-semibold border border-green-100 dark:border-green-900/30">
            <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            AI Receptionist Active
        </div>

        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
                <Bell size={20} />
                {reminders.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white dark:border-slate-900">
                        {reminders.length}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">Reminders</span>
                        <span className="text-xs text-slate-500">{reminders.length} Active</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                        {reminders.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                <Bell size={24} className="mx-auto mb-2 opacity-30" />
                                No active reminders.
                            </div>
                        ) : (
                            <div>
                                {reminders.map(task => (
                                    <div key={task.id} className="p-3 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-3">
                                        <div className="mt-1 text-orange-500">
                                            <Clock size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{task.text}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Task Reminder</p>
                                        </div>
                                        <button 
                                            onClick={() => handleCompleteReminder(task)}
                                            className="text-slate-400 hover:text-green-600 transition-colors"
                                            title="Mark Complete"
                                        >
                                            <CheckCircle2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
        </div>
    </header>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false); // New State
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    // Initialize the simulated database
    initDB();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleSignup = () => {
      setIsOnboarding(true);
  };

  const handleOnboardingComplete = () => {
      setIsOnboarding(false);
      setIsAuthenticated(true);
      setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'crm': return <CRMView />;
      case 'appointments': return <AppointmentsView />;
      case 'jobs': return <JobsView />;
      case 'email': return <EmailView />;
      case 'receptionist': return <ReceptionistView />;
      case 'plans': return <PlansView />;
      case 'settings': return <SettingsView />;
      case 'report-bug': return <ReportBugView />;
      case 'admin-profile': return <AdminProfileView setCurrentView={setCurrentView} />;
      case 'meta-admin': return <MetaAdminView />;
      default: return <DashboardView />;
    }
  };

  if (isOnboarding) {
      return <OnboardingView onComplete={handleOnboardingComplete} />;
  }

  if (!isAuthenticated) {
    return <LandingPage onLogin={handleLogin} onSignup={handleSignup} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout} />
      
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <TopBar />
        <div className="p-8 flex-1 overflow-y-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;