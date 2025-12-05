import React, { useState, useEffect } from 'react';
import { Bell, Shield, Eye, Moon, Monitor, CheckCircle2, Sun, AlertTriangle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { TwoFactorSetup } from './TwoFactorSetup';
import { TwoFactorConfig } from '../types';

// Mock function to simulate DB fetch/save for 2FA
// In a real app, this goes to dbService
const get2FAConfig = (): TwoFactorConfig => {
    const stored = localStorage.getItem('nexus_2fa_config');
    return stored ? JSON.parse(stored) : { enabled: false, method: null };
};

const save2FAConfig = (config: TwoFactorConfig) => {
    localStorage.setItem('nexus_2fa_config', JSON.stringify(config));
};

export const SettingsView: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState({
    emailNotifs: true,
    smsNotifs: false,
    marketingEmails: false,
  });
  
  // 2FA State
  const [twoFactorConfig, setTwoFactorConfig] = useState<TwoFactorConfig>({ enabled: false, method: null });
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);

  useEffect(() => {
      setTwoFactorConfig(get2FAConfig());
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handle2FAComplete = (method: 'app' | 'key', codes: string[]) => {
      const newConfig: TwoFactorConfig = {
          enabled: true,
          method: method,
          verifiedAt: new Date().toISOString(),
          backupCodes: codes
      };
      setTwoFactorConfig(newConfig);
      save2FAConfig(newConfig);
      setIs2FAModalOpen(false);
  };

  const disable2FA = () => {
      const confirmed = window.confirm("Are you sure you want to disable Two-Factor Authentication? Your account will be less secure.");
      if (confirmed) {
          const newConfig: TwoFactorConfig = { enabled: false, method: null };
          setTwoFactorConfig(newConfig);
          save2FAConfig(newConfig);
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <TwoFactorSetup 
        isOpen={is2FAModalOpen} 
        onClose={() => setIs2FAModalOpen(false)}
        onComplete={handle2FAComplete}
        userEmail="admin@nexus.ai"
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Preferences</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your notifications and display settings.</p>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                <Bell size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notifications</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Choose how you want to be alerted.</p>
            </div>
        </div>
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-200">Email Notifications</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive summaries and urgent alerts via email.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={prefs.emailNotifs} onChange={() => setPrefs({...prefs, emailNotifs: !prefs.emailNotifs})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
            </div>
            <hr className="border-slate-100 dark:border-slate-800"/>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-200">SMS Alerts</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Get text messages for missed calls (Charges may apply).</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={prefs.smsNotifs} onChange={() => setPrefs({...prefs, smsNotifs: !prefs.smsNotifs})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
            </div>
        </div>
      </div>

      {/* Security (Enhanced 2FA) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
                <Shield size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Protect your account access.</p>
            </div>
        </div>
        <div className="p-8 space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-slate-900 dark:text-slate-200">Two-Factor Authentication (2FA)</h3>
                        {twoFactorConfig.enabled && (
                            <span className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                <CheckCircle2 size={12} /> ON
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg">
                        Secure your account with TOTP apps (Google Authenticator) or hardware security keys (YubiKey, TouchID).
                    </p>
                    {twoFactorConfig.enabled && twoFactorConfig.method && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <span className="font-medium">Active Method:</span>
                            <span className="capitalize bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                {twoFactorConfig.method === 'app' ? 'Authenticator App' : 'Security Key'}
                            </span>
                        </div>
                    )}
                </div>
                
                <div>
                    {!twoFactorConfig.enabled ? (
                        <button 
                            onClick={() => setIs2FAModalOpen(true)}
                            className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            Enable 2FA
                        </button>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <button 
                                onClick={() => setIs2FAModalOpen(true)}
                                className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline"
                            >
                                Reconfigure
                            </button>
                            <button 
                                onClick={disable2FA}
                                className="text-red-600 dark:text-red-400 text-sm font-medium hover:underline"
                            >
                                Disable
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                 <button className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">Change Password</button>
            </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                <Eye size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Appearance</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Customize your workspace.</p>
            </div>
        </div>
        <div className="p-8 flex gap-4">
             <button 
                onClick={() => setTheme('light')}
                className={`flex-1 p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${
                  theme === 'light' 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' 
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
             >
                <Sun size={24} />
                <span className="font-medium">Light</span>
             </button>
             <button 
                onClick={() => setTheme('dark')}
                className={`flex-1 p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${
                  theme === 'dark' 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' 
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
             >
                <Moon size={24} />
                <span className="font-medium">Dark</span>
             </button>
             <button 
                onClick={() => setTheme('system')}
                className={`flex-1 p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${
                  theme === 'system' 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' 
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
             >
                <Monitor size={24} />
                <span className="font-medium">System</span>
             </button>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <CheckCircle2 size={18} />
          Save Preferences
        </button>
        {saved && (
          <span className="text-green-600 dark:text-green-400 font-medium animate-in fade-in">
            Preferences Saved!
          </span>
        )}
      </div>
    </div>
  );
};