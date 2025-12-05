import React, { useState } from 'react';
import { CheckCircle2, User, Building, CreditCard, ArrowRight, ArrowLeft, Zap, Mail, Phone, Briefcase } from 'lucide-react';
import { getAllPlans, registerUser } from '../services/dbService';
import { PlanTier } from '../types';

interface OnboardingViewProps {
    onComplete: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        companyName: '',
        industry: 'General',
        plan: 'Pro Bundle'
    });
    const [plans] = useState<PlanTier[]>(getAllPlans());
    const [isProcessing, setIsProcessing] = useState(false);

    const handleNext = () => {
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        setIsProcessing(true);
        
        // Simulate API delay
        setTimeout(() => {
            registerUser({
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                companyName: formData.companyName,
                plan: formData.plan
            });
            setIsProcessing(false);
            onComplete();
        }, 1500);
    };

    const getPlanIcon = (planId: string) => {
        if (planId === 'Email Only') return <Mail className="text-blue-500" size={24} />;
        if (planId === 'Receptionist Only') return <Phone className="text-green-500" size={24} />;
        if (planId === 'Business Elite') return <Briefcase className="text-purple-500" size={24} />;
        return <Zap className="text-indigo-500" size={24} />;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
            
            {/* Progress Bar */}
            <div className="w-full max-w-2xl mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div className={`flex flex-col items-center gap-2 ${step >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
                        <span className="text-xs font-medium uppercase tracking-wider">Account</span>
                    </div>
                    <div className={`h-1 flex-1 mx-4 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                    <div className={`flex flex-col items-center gap-2 ${step >= 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
                        <span className="text-xs font-medium uppercase tracking-wider">Business</span>
                    </div>
                    <div className={`h-1 flex-1 mx-4 rounded-full ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                    <div className={`flex flex-col items-center gap-2 ${step >= 3 ? 'text-indigo-600' : 'text-slate-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</div>
                        <span className="text-xs font-medium uppercase tracking-wider">Plan</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                
                {/* --- STEP 1: ACCOUNT --- */}
                {step === 1 && (
                    <div className="p-8 space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h2>
                            <p className="text-slate-500 dark:text-slate-400">Start automating your business in minutes.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                                <input 
                                    className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.firstName}
                                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                                    placeholder="Jane"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                                <input 
                                    className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.lastName}
                                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                                    placeholder="Doe"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                <input 
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    placeholder="jane@company.com"
                                    type="email"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                            <input 
                                className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                type="password"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="pt-4 flex justify-end">
                            <button 
                                onClick={handleNext}
                                disabled={!formData.firstName || !formData.email || !formData.password}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                Next Step <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* --- STEP 2: BUSINESS --- */}
                {step === 2 && (
                    <div className="p-8 space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tell us about your business</h2>
                            <p className="text-slate-500 dark:text-slate-400">We'll customize your dashboard based on this.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                <input 
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.companyName}
                                    onChange={e => setFormData({...formData, companyName: e.target.value})}
                                    placeholder="Acme Innovations LLC"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Industry</label>
                            <select 
                                className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.industry}
                                onChange={e => setFormData({...formData, industry: e.target.value})}
                            >
                                <option>General</option>
                                <option>Technology / SaaS</option>
                                <option>Home Services (HVAC, Plumbing)</option>
                                <option>Healthcare / Dental</option>
                                <option>Retail / E-commerce</option>
                                <option>Legal / Professional Services</option>
                            </select>
                        </div>
                        <div className="pt-4 flex justify-between">
                            <button 
                                onClick={handleBack}
                                className="text-slate-500 hover:text-slate-700 px-4 py-2 font-medium flex items-center gap-2"
                            >
                                <ArrowLeft size={18} /> Back
                            </button>
                            <button 
                                onClick={handleNext}
                                disabled={!formData.companyName}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                Choose Plan <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* --- STEP 3: PLAN --- */}
                {step === 3 && (
                    <div className="p-8 space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Select a Plan</h2>
                            <p className="text-slate-500 dark:text-slate-400">Start with a 7-day free trial. Cancel anytime.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                            {plans.map(plan => (
                                <div 
                                    key={plan.id}
                                    onClick={() => setFormData({...formData, plan: plan.id})}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                        formData.plan === plan.id 
                                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                                        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">
                                            {getPlanIcon(plan.id)}
                                        </div>
                                        {formData.plan === plan.id && <CheckCircle2 className="text-indigo-600" size={20} />}
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{plan.description}</p>
                                    <div className="font-bold text-lg text-slate-900 dark:text-white">
                                        ${plan.price}<span className="text-xs font-normal text-slate-500">/{plan.period}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-800 mt-4">
                            <button 
                                onClick={handleBack}
                                className="text-slate-500 hover:text-slate-700 px-4 py-2 font-medium flex items-center gap-2"
                            >
                                <ArrowLeft size={18} /> Back
                            </button>
                            <button 
                                onClick={handleSubmit}
                                disabled={isProcessing}
                                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 flex items-center gap-2 disabled:opacity-70 transition-all"
                            >
                                {isProcessing ? 'Creating Account...' : 'Complete Setup'}
                                {!isProcessing && <CheckCircle2 size={20} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};