import React, { useState } from 'react';
import { CreditCard, Lock, X, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { validateCardNumber, getCardBrand } from '../services/paymentService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (cardDetails: { last4: string, brand: string, expiry: string }) => void;
  amount?: number; // If processing a specific amount immediately
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess, amount }) => {
  const [formData, setFormData] = useState({
    name: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    zip: ''
  });
  
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardBrand, setCardBrand] = useState('Unknown');

  if (!isOpen) return null;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 16) value = value.slice(0, 16);
    
    setFormData({ ...formData, cardNumber: value });
    setCardBrand(getCardBrand(value));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setFormData({ ...formData, expiry: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic Client-side Validation
    if (!validateCardNumber(formData.cardNumber)) {
        setError('Invalid card number. Please check digits.');
        return;
    }
    if (formData.cvc.length < 3) {
        setError('Invalid CVC.');
        return;
    }

    setIsProcessing(true);

    // Simulate API delay
    setTimeout(() => {
        setIsProcessing(false);
        // Mock Success
        onSuccess({
            last4: formData.cardNumber.slice(-4),
            brand: cardBrand,
            expiry: formData.expiry
        });
        onClose();
        // Reset form
        setFormData({ name: '', cardNumber: '', expiry: '', cvc: '', zip: '' });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
            <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="text-green-600" size={20} />
                    Secure Payment
                </h2>
                <p className="text-xs text-slate-500">Encrypted 256-bit SSL Connection</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
                <X size={24} />
            </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {amount && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-center mb-4">
                    <p className="text-slate-600 text-sm">Total Amount Due</p>
                    <p className="text-3xl font-bold text-indigo-700">${amount.toFixed(2)}</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Cardholder Name</label>
                <input 
                    required
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
            </div>

            <div className="relative">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Card Number</label>
                <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        required
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        className="w-full pl-10 pr-12 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono"
                        value={formData.cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                    />
                    {cardBrand !== 'Unknown' && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {cardBrand}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Expiry (MM/YY)</label>
                    <input 
                        required
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-center"
                        value={formData.expiry}
                        onChange={handleExpiryChange}
                        maxLength={5}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">CVC / CWW</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            required
                            type="password"
                            placeholder="123"
                            className="w-full pl-9 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.cvc}
                            onChange={e => setFormData({...formData, cvc: e.target.value.replace(/\D/g,'').slice(0,4)})}
                        />
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <button 
                    type="submit" 
                    disabled={isProcessing}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isProcessing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Lock size={18} />
                            {amount ? `Pay $${amount.toFixed(2)}` : 'Verify & Save Card'}
                        </>
                    )}
                </button>
            </div>
            
            <div className="flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               {/* Simplified mock icons */}
               <div className="text-[10px] font-bold border rounded px-1">VISA</div>
               <div className="text-[10px] font-bold border rounded px-1">MC</div>
               <div className="text-[10px] font-bold border rounded px-1">AMEX</div>
               <div className="text-[10px] font-bold border rounded px-1">DISC</div>
            </div>
        </form>
      </div>
    </div>
  );
};