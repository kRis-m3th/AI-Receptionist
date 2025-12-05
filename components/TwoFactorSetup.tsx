import React, { useState } from 'react';
import { ShieldCheck, Smartphone, Key, ArrowRight, CheckCircle2, Copy, AlertTriangle, X, Loader2 } from 'lucide-react';
import { generateTOTPSecret, registerSecurityKey, generateBackupCodes } from '../services/webAuthnService';

interface TwoFactorSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (method: 'app' | 'key', codes: string[]) => void;
  userEmail: string;
}

type Step = 'select' | 'setup-app' | 'setup-key' | 'verify' | 'backup';

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ isOpen, onClose, onComplete, userEmail }) => {
  const [step, setStep] = useState<Step>('select');
  const [method, setMethod] = useState<'app' | 'key' | null>(null);
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // --- Handlers ---

  const startAppSetup = () => {
    const newSecret = generateTOTPSecret();
    setSecret(newSecret);
    setMethod('app');
    setStep('setup-app');
  };

  const startKeySetup = async () => {
    setMethod('key');
    setIsLoading(true);
    setError('');
    try {
        await registerSecurityKey(userEmail, "NexusAI User");
        // If successful (didn't throw), generate backup codes immediately
        const codes = generateBackupCodes();
        setBackupCodes(codes);
        setStep('backup');
    } catch (e: any) {
        setError(e.message || "Failed to register security key.");
    } finally {
        setIsLoading(false);
    }
  };

  const verifyAppCode = () => {
    // In a real app, verify against backend. 
    // Here we simulate success if the code is 6 digits.
    if (verificationCode.length !== 6 || isNaN(Number(verificationCode))) {
        setError("Please enter a valid 6-digit code.");
        return;
    }
    
    setError('');
    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        const codes = generateBackupCodes();
        setBackupCodes(codes);
        setStep('backup');
    }, 1000);
  };

  const finishSetup = () => {
    if (method) {
        onComplete(method, backupCodes);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // --- Render Steps ---

  const renderSelectStep = () => (
    <div className="space-y-6">
        <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Secure Your Account</h2>
            <p className="text-slate-500 dark:text-slate-400">Choose a second verification method.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
                onClick={startAppSetup}
                className="p-6 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-left group"
            >
                <div className="bg-indigo-100 dark:bg-indigo-900/50 w-12 h-12 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                    <Smartphone size={24} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Authenticator App</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Google Auth, Authy, 1Password, etc.</p>
            </button>

            <button 
                onClick={startKeySetup}
                className="p-6 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-left group"
            >
                <div className="bg-purple-100 dark:bg-purple-900/50 w-12 h-12 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                    <Key size={24} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Security Key</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">YubiKey, TouchID, FaceID.</p>
            </button>
        </div>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
    </div>
  );

  const renderAppSetup = () => {
    // Generate QR URL (Using a reliable public API for demo purposes)
    const label = `NexusAI:${userEmail}`;
    const otpauth = `otpauth://totp/${label}?secret=${secret}&issuer=NexusAI`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`;

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Scan QR Code</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Open your authenticator app and scan the image below.</p>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 w-fit mx-auto">
                <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg flex justify-between items-center">
                <code className="text-slate-800 dark:text-slate-200 font-mono tracking-widest">{secret}</code>
                <button onClick={() => copyToClipboard(secret)} className="text-slate-400 hover:text-indigo-600">
                    <Copy size={18} />
                </button>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Enter the 6-digit code from your app</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        maxLength={6}
                        placeholder="000000"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white tracking-widest text-center text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button 
                        onClick={verifyAppCode}
                        disabled={isLoading || verificationCode.length !== 6}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                        Verify
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
            
            <button onClick={() => setStep('select')} className="text-slate-500 text-sm hover:underline w-full text-center">Back to methods</button>
        </div>
    );
  };

  const renderBackupStep = () => (
    <div className="space-y-6 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
        </div>
        <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">2FA Enabled Successfully!</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
                Save these backup codes in a safe place. You can use them to log in if you lose access to your device.
            </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-4">
            {backupCodes.map((code, i) => (
                <div key={i} className="font-mono text-slate-800 dark:text-slate-200 font-medium tracking-wide">
                    {code}
                </div>
            ))}
        </div>

        <div className="flex gap-3">
             <button 
                onClick={() => copyToClipboard(backupCodes.join('\n'))}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
             >
                <Copy size={18} /> Copy All
             </button>
             <button 
                onClick={finishSetup}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
             >
                Done
             </button>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="text-indigo-600 dark:text-indigo-400" size={20} />
                Two-Factor Authentication
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={24} />
            </button>
        </div>
        
        <div className="p-8 overflow-y-auto">
            {step === 'select' && renderSelectStep()}
            {step === 'setup-app' && renderAppSetup()}
            {step === 'backup' && renderBackupStep()}
            {/* Setup Key Step is mostly handled by browser dialog, but we show loading state */}
            {step === 'select' && isLoading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex flex-col items-center justify-center z-10">
                    <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                    <p className="font-semibold text-slate-900 dark:text-white">Waiting for security key...</p>
                    <p className="text-sm text-slate-500">Follow your browser's instructions.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};