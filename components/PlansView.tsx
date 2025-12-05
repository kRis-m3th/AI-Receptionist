import React, { useEffect, useState } from 'react';
import { Check, X, Zap, Crown, Mail, Phone, CheckCircle2, AlertTriangle, CreditCard, Wallet, ArrowRight, Briefcase } from 'lucide-react';
import { getAdminProfile, updateAdminProfile, getAllPlans, addStoreCredit, addTransaction, generateId } from '../services/dbService';
import { AdminProfile, SubscriptionPlan, PlanTier } from '../types';
import { PaymentModal } from './PaymentModal';

export const PlansView: React.FC = () => {
  const [plans, setPlans] = useState<PlanTier[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<SubscriptionPlan>('Pro Bundle');
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  
  // State for Switch Logic
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [upgradeAmount, setUpgradeAmount] = useState<number | null>(null);
  const [downgradeDetails, setDowngradeDetails] = useState<{amount: number, planId: SubscriptionPlan} | null>(null);
  
  // Modals
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isDowngradeModalOpen, setIsDowngradeModalOpen] = useState(false);

  useEffect(() => {
    const adminData = getAdminProfile();
    const plansData = getAllPlans();
    
    if (adminData) {
      setProfile(adminData);
      setCurrentPlanId(adminData.plan);
    }
    setPlans(plansData);
  }, []);

  // --- Calculation Logic ---

  const calculateProration = (targetPlanId: SubscriptionPlan) => {
    if (!profile) return { diff: 0, isUpgrade: false };
    
    const currentPlan = plans.find(p => p.id === currentPlanId);
    const targetPlan = plans.find(p => p.id === targetPlanId);
    
    if (!currentPlan || !targetPlan) return { diff: 0, isUpgrade: false };

    // SIMPLE PRORATION LOGIC FOR DEMO:
    // Assume 7 day cycle. Calculate generic "remaining value" based on a mock date.
    // In production, use `profile.billing.nextBillingDate` diff against `new Date()`.
    
    const totalCycleDays = 7;
    const daysUsed = 3; // Mocking that user is 3 days into their week
    const daysRemaining = totalCycleDays - daysUsed;
    const fractionRemaining = daysRemaining / totalCycleDays;

    const currentRemainingValue = currentPlan.price * fractionRemaining;
    const targetRemainingCost = targetPlan.price * fractionRemaining;

    const diff = targetRemainingCost - currentRemainingValue;
    return { diff, isUpgrade: diff > 0 };
  };

  // --- Handlers ---

  const handlePlanClick = (planId: SubscriptionPlan) => {
    setProcessingPlanId(planId);
    const { diff, isUpgrade } = calculateProration(planId);
    
    if (isUpgrade) {
        // Prepare Upgrade -> Payment
        setUpgradeAmount(diff);
        setIsPaymentOpen(true);
    } else {
        // Prepare Downgrade -> Refund/Credit Choice
        setDowngradeDetails({ amount: Math.abs(diff), planId });
        setIsDowngradeModalOpen(true);
    }
  };

  const finalizePlanSwitch = (newPlanId: SubscriptionPlan, billingAction: string) => {
    if (!profile) return;

    // Update Profile
    const updatedProfile = { 
        ...profile, 
        plan: newPlanId,
        // Reset billing date logic would go here in real app
    };
    updateAdminProfile(updatedProfile);
    setProfile(updatedProfile);
    setCurrentPlanId(newPlanId);
    setProcessingPlanId(null);
    
    // Cleanup
    setIsPaymentOpen(false);
    setIsDowngradeModalOpen(false);
    setUpgradeAmount(null);
    setDowngradeDetails(null);

    // Mock Notification (console for now, real toast in prod)
    console.log(`Plan switched to ${newPlanId}. Action: ${billingAction}`);
  };

  const handlePaymentSuccess = () => {
    // 1. Charge Processed via PaymentModal
    // 2. Log Transaction
    if(upgradeAmount) {
        addTransaction({
            id: generateId(),
            tenantId: profile?.id || 'admin',
            tenantName: profile?.companyName || 'Admin',
            amount: upgradeAmount,
            date: new Date().toLocaleDateString(),
            status: 'succeeded',
            type: 'charge',
            paymentMethod: `${profile?.billing.brand} •••• ${profile?.billing.last4}`
        });
    }

    // 3. Finalize
    if (processingPlanId) {
        finalizePlanSwitch(processingPlanId as SubscriptionPlan, 'Charged Difference');
    }
  };

  const handleDowngradeAction = (action: 'refund' | 'credit') => {
    if (!downgradeDetails || !profile) return;

    if (action === 'credit') {
        addStoreCredit(downgradeDetails.amount);
    } else {
        // refund logic (mock transaction)
        addTransaction({
            id: generateId(),
            tenantId: profile.id,
            tenantName: profile.companyName,
            amount: downgradeDetails.amount,
            date: new Date().toLocaleDateString(),
            status: 'succeeded',
            type: 'refund',
            paymentMethod: `${profile.billing.brand} •••• ${profile.billing.last4}`
        });
    }

    finalizePlanSwitch(downgradeDetails.planId, action === 'credit' ? 'Store Credit Added' : 'Refund Issued');
  };

  // --- Render ---

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 relative">
      
      {/* --- UPGRADE PAYMENT MODAL --- */}
      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => { setIsPaymentOpen(false); setProcessingPlanId(null); }}
        onSuccess={handlePaymentSuccess}
        amount={upgradeAmount || 0}
      />

      {/* --- DOWNGRADE CHOICE MODAL --- */}
      {isDowngradeModalOpen && downgradeDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
                  <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertTriangle size={32} />
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Plan Downgrade</h2>
                      <p className="text-slate-500 dark:text-slate-400 mt-2">
                          You have <strong>${downgradeDetails.amount.toFixed(2)}</strong> of unused time remaining on your current plan. How would you like to handle this balance?
                      </p>
                  </div>

                  <div className="space-y-3">
                      <button 
                        onClick={() => handleDowngradeAction('credit')}
                        className="w-full p-4 rounded-xl border-2 border-indigo-100 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-900/10 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all flex items-center justify-between group"
                      >
                          <div className="flex items-center gap-3">
                              <div className="bg-indigo-200 dark:bg-indigo-800 p-2 rounded-lg text-indigo-700 dark:text-indigo-200">
                                  <Wallet size={20} />
                              </div>
                              <div className="text-left">
                                  <p className="font-bold text-slate-900 dark:text-white">Keep as Store Credit</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">Apply automatically to future invoices.</p>
                              </div>
                          </div>
                          <ArrowRight className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button 
                        onClick={() => handleDowngradeAction('refund')}
                        className="w-full p-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all flex items-center justify-between group"
                      >
                          <div className="flex items-center gap-3">
                              <div className="bg-slate-200 dark:bg-slate-800 p-2 rounded-lg text-slate-700 dark:text-slate-300">
                                  <CreditCard size={20} />
                              </div>
                              <div className="text-left">
                                  <p className="font-bold text-slate-900 dark:text-white">Refund to Card</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">Takes 5-10 business days.</p>
                              </div>
                          </div>
                      </button>
                  </div>
                  
                  <button 
                    onClick={() => { setIsDowngradeModalOpen(false); setProcessingPlanId(null); }}
                    className="mt-6 w-full py-2 text-slate-400 hover:text-slate-600 text-sm font-medium"
                  >
                      Cancel Downgrade
                  </button>
              </div>
          </div>
      )}

      {/* --- HEADER --- */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Choose the Right Plan</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Flexible weekly plans to grow with your business. Upgrade or downgrade at any time.
        </p>
        {profile?.credits && profile.credits > 0 ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full font-medium text-sm border border-green-100 dark:border-green-900/30">
                <Wallet size={16} />
                Available Credit: ${profile.credits.toFixed(2)}
            </div>
        ) : null}
      </div>

      {/* --- PLANS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
        {plans.map((plan) => {
          const isCurrent = currentPlanId === plan.id;
          const isProcessing = processingPlanId === plan.id;
          
          // Get Icon based on plan ID (Dynamic mapping since we can't store component in JSON)
          let Icon = Crown;
          let colorClass = "text-white";
          if (plan.id === 'Email Only') { Icon = Mail; colorClass = "text-blue-500"; }
          if (plan.id === 'Receptionist Only') { Icon = Phone; colorClass = "text-green-500"; }
          if (plan.id === 'Business Elite') { Icon = Briefcase; colorClass = "text-purple-500"; }
          
          return (
            <div 
              key={plan.id}
              className={`relative rounded-2xl p-6 flex flex-col transition-all duration-300 ${
                plan.highlight 
                  ? 'bg-slate-900 text-white shadow-xl scale-105 border-2 border-indigo-500 z-10' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg whitespace-nowrap">
                  <Zap size={12} fill="currentColor" /> {plan.id === 'Business Elite' ? 'Premium Tier' : 'Most Popular'}
                </div>
              )}

              <div className="mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                  plan.highlight ? 'bg-white/10' : 'bg-slate-100 dark:bg-slate-800'
                }`}>
                  <Icon size={24} className={colorClass} />
                </div>
                <h3 className={`text-lg font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {plan.name}
                </h3>
                <p className={`text-xs leading-relaxed ${plan.highlight ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-bold ${plan.highlight ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    ${plan.price}
                  </span>
                  <span className={`${plan.highlight ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    /{plan.period}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    {feature.included ? (
                      <div className={`mt-0.5 rounded-full p-0.5 ${plan.highlight ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                        <Check size={10} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className={`mt-0.5 rounded-full p-0.5 ${plan.highlight ? 'bg-white/10 text-slate-500' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                        <X size={10} strokeWidth={3} />
                      </div>
                    )}
                    <span className={`text-xs ${
                      feature.included 
                        ? (plan.highlight ? 'text-slate-200' : 'text-slate-700 dark:text-slate-300')
                        : (plan.highlight ? 'text-slate-600 line-through' : 'text-slate-400 dark:text-slate-600 line-through')
                    }`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <button
                disabled={isCurrent || !!processingPlanId}
                onClick={() => handlePlanClick(plan.id)}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isCurrent 
                    ? 'bg-green-500 text-white cursor-default opacity-100' 
                    : plan.highlight 
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {isProcessing ? (
                   <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isCurrent ? (
                  <>
                    <CheckCircle2 size={16} /> Current Plan
                  </>
                ) : (
                  'Switch Plan'
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};