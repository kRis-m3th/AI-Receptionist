// This service mocks a real Payment Gateway like Stripe
import { Tenant, Transaction } from '../types';
import { generateId } from './dbService';

// --- Card Validation Logic (Luhn Algorithm) ---
export const validateCardNumber = (number: string): boolean => {
  const regex = new RegExp("^[0-9]{13,19}$");
  if (!regex.test(number)) return false;

  let sum = 0;
  let shouldDouble = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number.charAt(i));
    if (shouldDouble) {
      if ((digit *= 2) > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

export const getCardBrand = (number: string): string => {
  if (number.match(/^4/)) return "Visa";
  if (number.match(/^5[1-5]/)) return "MasterCard";
  if (number.match(/^3[47]/)) return "Amex";
  if (number.match(/^6(?:011|5)/)) return "Discover";
  return "Unknown";
};

// --- Mock API Calls ---

export const processOneTimePayment = async (amount: number, cardDetails: any): Promise<{success: boolean, transactionId?: string, error?: string}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock random failure for realism (1 in 20 chance)
      if (Math.random() > 0.95) {
        resolve({ success: false, error: "Card declined by issuer." });
      } else {
        resolve({ success: true, transactionId: `tx_${generateId()}` });
      }
    }, 1500);
  });
};

export const runMonthlyBilling = async (tenants: Tenant[]): Promise<{ updatedTenants: Tenant[], transactions: Transaction[] }> => {
  const transactions: Transaction[] = [];
  const updatedTenants = [...tenants];
  
  // Simulate processing a batch of payments
  // In a real app, this happens server-side via cron jobs
  
  for (let i = 0; i < updatedTenants.length; i++) {
    const tenant = updatedTenants[i];
    
    if (tenant.status !== 'Active' || tenant.mrr === 0) continue;

    // Simulate charging the card on file
    const success = Math.random() > 0.1; // 10% chance of failure for demo purposes
    
    transactions.push({
      id: `tx_${generateId()}`,
      tenantId: tenant.id,
      tenantName: tenant.businessName,
      amount: tenant.mrr,
      date: new Date().toLocaleDateString(),
      status: success ? 'succeeded' : 'failed',
      type: 'charge',
      paymentMethod: `${tenant.paymentMethod?.brand || 'Visa'} •••• ${tenant.paymentMethod?.last4 || '4242'}`
    });

    // Update billing date if successful
    if (success) {
      const currentDate = new Date();
      currentDate.setMonth(currentDate.getMonth() + 1);
      updatedTenants[i] = {
        ...tenant,
        nextBillingDate: currentDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})
      };
    }
  }

  return new Promise((resolve) => {
    setTimeout(() => {
        resolve({ updatedTenants, transactions });
    }, 2000);
  });
};