import { CallLog, Customer, EmailMessage, AdminProfile, Tenant, Transaction, PlanTier, Appointment, Task, Job, Worker } from '../types';
import { MOCK_CALLS, MOCK_CUSTOMERS, MOCK_EMAILS, MOCK_ADMIN_PROFILE, MOCK_JOBS, MOCK_WORKERS } from '../constants';

const STORAGE_KEYS = {
  CUSTOMERS: 'nexus_db_customers',
  CALLS: 'nexus_db_calls',
  EMAILS: 'nexus_db_emails',
  ADMIN: 'nexus_db_admin_profile',
  TENANTS: 'nexus_db_tenants',
  TRANSACTIONS: 'nexus_db_transactions',
  PLANS: 'nexus_db_plans',
  APPOINTMENTS: 'nexus_db_appointments',
  TASKS: 'nexus_db_tasks',
  JOBS: 'nexus_db_jobs',
  WORKERS: 'nexus_db_workers'
};

const SECRET_KEY = "NEXUS_SAAS_DEMO_KEY_DO_NOT_USE_IN_PROD";

const obfuscateData = (data: any): string => {
    try {
        const jsonString = JSON.stringify(data);
        const safeString = encodeURIComponent(jsonString);
        const encrypted = safeString.split('').map((c, i) =>
            String.fromCharCode(c.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length))
        ).join('');
        return btoa(encrypted);
    } catch (e) {
        console.error("Obfuscation failed", e);
        return "";
    }
};

const deobfuscateData = (ciphertext: string | null): any => {
    if (!ciphertext) return null;
    try {
        const decoded = atob(ciphertext);
        const decrypted = decoded.split('').map((c, i) =>
            String.fromCharCode(c.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length))
        ).join('');
        
        const jsonString = decodeURIComponent(decrypted);
        return JSON.parse(jsonString);
    } catch (e) {
        return null;
    }
};

const DEFAULT_PLANS: PlanTier[] = [
  {
    id: 'Email Only',
    name: 'Email Only',
    price: 100,
    period: 'week',
    description: 'Perfect for businesses that just need to automate their inbox.',
    features: [
      { text: 'AI Email Drafts', included: true },
      { text: 'Smart Templates', included: true },
      { text: 'Email Analytics', included: true },
      { text: 'CRM Integration', included: true },
      { text: 'AI Receptionist', included: false },
      { text: 'Call Recording', included: false },
      { text: 'Voice Transcription', included: false },
    ]
  },
  {
    id: 'Receptionist Only',
    name: 'Receptionist Only',
    price: 400,
    period: 'week',
    description: 'Automate your phone lines with a human-like AI voice agent.',
    features: [
      { text: 'AI Voice Receptionist', included: true },
      { text: '24/7 Call Handling', included: true },
      { text: 'Call Recording & Transcripts', included: true },
      { text: 'Appointment Booking', included: true },
      { text: 'AI Email Drafts', included: false },
      { text: 'Email Analytics', included: false },
      { text: 'Smart Templates', included: false },
    ]
  },
  {
    id: 'Pro Bundle',
    name: 'Pro Bundle',
    price: 500,
    period: 'week',
    description: 'The complete package. Automate everything and save time.',
    highlight: false,
    features: [
      { text: 'AI Voice Receptionist', included: true },
      { text: 'AI Email Automation', included: true },
      { text: 'Unified CRM Dashboard', included: true },
      { text: 'Advanced Analytics', included: true },
      { text: 'Priority Support', included: true },
      { text: 'Unlimited Storage', included: true },
      { text: 'Job Allocation', included: false },
    ]
  },
  {
    id: 'Business Elite',
    name: 'Business Elite',
    price: 700,
    period: 'week',
    description: 'The ultimate power suite. Includes AI Field Operations & Dispatch.',
    highlight: true,
    features: [
      { text: 'Everything in Pro Bundle', included: true },
      { text: 'Job Allocation & Dispatch', included: true },
      { text: 'Worker Management', included: true },
      { text: 'SMS Job Alerts', included: true },
      { text: 'Real-time Status Tracking', included: true },
      { text: 'Priority 24/7 Support', included: true },
      { text: 'Dedicated Account Manager', included: true },
    ]
  }
];

const MOCK_TENANTS_UPDATED = [
  {
    id: 't1',
    businessName: 'Acme Supplies',
    ownerName: 'John Doe',
    email: 'john@acme.com',
    plan: 'Pro Bundle' as const,
    status: 'Active' as const,
    joinedDate: 'Jan 15, 2023',
    mrr: 2000,
    billingCycle: 'weekly' as const,
    nextBillingDate: 'Nov 15, 2023',
    paymentMethod: { brand: 'Visa', last4: '4242', isValid: true }
  }
];
const MOCK_TRANSACTIONS: Transaction[] = [];
const MOCK_APPOINTMENTS: Appointment[] = [];
const MOCK_TASKS: Task[] = [];


export const initDB = () => {
  // Ensure strict initialization order
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, obfuscateData(MOCK_CUSTOMERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CALLS)) {
    localStorage.setItem(STORAGE_KEYS.CALLS, obfuscateData(MOCK_CALLS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EMAILS)) {
    localStorage.setItem(STORAGE_KEYS.EMAILS, obfuscateData(MOCK_EMAILS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ADMIN)) {
    localStorage.setItem(STORAGE_KEYS.ADMIN, obfuscateData(MOCK_ADMIN_PROFILE));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TENANTS)) {
    localStorage.setItem(STORAGE_KEYS.TENANTS, obfuscateData(MOCK_TENANTS_UPDATED));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, obfuscateData(MOCK_TRANSACTIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, obfuscateData(MOCK_APPOINTMENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    localStorage.setItem(STORAGE_KEYS.TASKS, obfuscateData(MOCK_TASKS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.JOBS)) {
    localStorage.setItem(STORAGE_KEYS.JOBS, obfuscateData(MOCK_JOBS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.WORKERS)) {
    localStorage.setItem(STORAGE_KEYS.WORKERS, obfuscateData(MOCK_WORKERS));
  }

  // --- MIGRATION LOGIC FOR EXISTING USERS ---
  // Force update plans if "Business Elite" is missing
  const currentPlans = deobfuscateData(localStorage.getItem(STORAGE_KEYS.PLANS));
  if (!currentPlans || !currentPlans.find((p: PlanTier) => p.id === 'Business Elite')) {
      console.log("Migrating Plans: Adding Business Elite");
      localStorage.setItem(STORAGE_KEYS.PLANS, obfuscateData(DEFAULT_PLANS));
  }
};

// --- NEW REGISTRATION FUNCTION ---
export const registerUser = (userData: { name: string; email: string; companyName: string; plan: string }) => {
    // 1. Create new Admin Profile
    const newProfile: AdminProfile = {
        id: generateId(),
        name: userData.name,
        email: userData.email,
        phone: '',
        role: 'Business Owner',
        accessLevel: 'tenant_admin', // New users are tenant admins, not super admins
        companyName: userData.companyName,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
        plan: userData.plan as any,
        credits: 0,
        billing: {
            last4: '4242', // Mock
            brand: 'Visa',
            expiry: '12/28',
            nextBillingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
        }
    };
    updateAdminProfile(newProfile);

    // 2. Add to Tenants List (so they exist in the ecosystem)
    const newTenant: Tenant = {
        id: newProfile.id,
        businessName: userData.companyName,
        ownerName: userData.name,
        email: userData.email,
        plan: userData.plan as any,
        status: 'Active',
        joinedDate: new Date().toLocaleDateString(),
        mrr: DEFAULT_PLANS.find(p => p.id === userData.plan)?.price || 0,
        billingCycle: 'weekly',
        nextBillingDate: newProfile.billing.nextBillingDate
    };
    addTenant(newTenant);

    // 3. Optional: Clear demo data for a fresh start, or keep it for the "Demo Experience"
    // For this app, we will KEEP the demo data so the dashboard isn't empty, 
    // but in a real app, you would initialize empty arrays.
};

export const getAllCustomers = (): Customer[] => deobfuscateData(localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) || [];
export const bulkAddCustomers = (newCustomers: Customer[]) => {
  const existing = getAllCustomers();
  const updated = [...newCustomers, ...existing]; 
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, obfuscateData(updated));
  return updated;
};

export const getAllCalls = (): CallLog[] => deobfuscateData(localStorage.getItem(STORAGE_KEYS.CALLS)) || [];
export const getCallsByCustomerId = (customerId: string): CallLog[] => {
  const calls = getAllCalls();
  return calls.filter(c => c.customerId === customerId);
};
export const addCallLog = (call: CallLog) => {
  const calls = getAllCalls();
  const updatedCalls = [call, ...calls];
  localStorage.setItem(STORAGE_KEYS.CALLS, obfuscateData(updatedCalls));
  return updatedCalls;
};

export const getAllEmails = (): EmailMessage[] => deobfuscateData(localStorage.getItem(STORAGE_KEYS.EMAILS)) || [];
export const getEmailsByCustomerEmail = (email: string): EmailMessage[] => {
  if (!email) return [];
  const emails = getAllEmails();
  return emails.filter(e => e.email?.toLowerCase() === email.toLowerCase());
};

export const sendOutboundEmail = (toEmail: string, customerName: string, subject: string, content: string) => {
    const newEmail: EmailMessage = {
        id: generateId(),
        sender: 'NexusAI System', 
        email: toEmail,
        subject: subject,
        preview: content.substring(0, 50) + '...',
        content: content,
        date: 'Just now',
        read: true 
    };
    
    const emails = getAllEmails();
    const updated = [newEmail, ...emails];
    localStorage.setItem(STORAGE_KEYS.EMAILS, obfuscateData(updated));
    return updated;
};

export const getAdminProfile = (): AdminProfile => {
  const stored = localStorage.getItem(STORAGE_KEYS.ADMIN);
  return stored ? deobfuscateData(stored) : MOCK_ADMIN_PROFILE;
};
export const updateAdminProfile = (profile: AdminProfile) => {
  localStorage.setItem(STORAGE_KEYS.ADMIN, obfuscateData(profile));
};
export const addStoreCredit = (amount: number) => {
    const profile = getAdminProfile();
    profile.credits = (profile.credits || 0) + amount;
    updateAdminProfile(profile);
    addTransaction({
        id: generateId(),
        tenantId: profile.id,
        tenantName: profile.companyName,
        amount: amount,
        date: new Date().toLocaleDateString(),
        status: 'succeeded',
        type: 'credit_adjustment',
        paymentMethod: 'System Credit'
    });
};

export const getAllPlans = (): PlanTier[] => deobfuscateData(localStorage.getItem(STORAGE_KEYS.PLANS)) || DEFAULT_PLANS;
export const updatePlans = (plans: PlanTier[]) => {
    localStorage.setItem(STORAGE_KEYS.PLANS, obfuscateData(plans));
}

export const getAllTenants = (): Tenant[] => deobfuscateData(localStorage.getItem(STORAGE_KEYS.TENANTS)) || [];
export const updateTenants = (tenants: Tenant[]) => localStorage.setItem(STORAGE_KEYS.TENANTS, obfuscateData(tenants));
export const addTenant = (tenant: Tenant) => {
    const tenants = getAllTenants();
    const updated = [tenant, ...tenants];
    localStorage.setItem(STORAGE_KEYS.TENANTS, obfuscateData(updated));
    return updated;
};

export const getAllTransactions = (): Transaction[] => deobfuscateData(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) || [];
export const addTransaction = (transaction: Transaction) => {
    const txs = getAllTransactions();
    const updated = [transaction, ...txs];
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, obfuscateData(updated));
    return updated;
};
export const bulkAddTransactions = (newTxs: Transaction[]) => {
    const txs = getAllTransactions();
    const updated = [...newTxs, ...txs];
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, obfuscateData(updated));
    return updated;
};

export const getAllAppointments = (): Appointment[] => deobfuscateData(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) || [];
export const addAppointment = (appt: Appointment) => {
    const appts = getAllAppointments();
    const updated = [appt, ...appts];
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, obfuscateData(updated));
    return updated;
};
export const updateAppointment = (updatedAppt: Appointment) => {
    const appts = getAllAppointments();
    const updated = appts.map(a => a.id === updatedAppt.id ? updatedAppt : a);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, obfuscateData(updated));
    return updated;
};
export const deleteAppointment = (id: string) => {
    const appts = getAllAppointments();
    const updated = appts.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, obfuscateData(updated));
    return updated;
};

export const getAllTasks = (): Task[] => deobfuscateData(localStorage.getItem(STORAGE_KEYS.TASKS)) || [];
export const addTask = (task: Task) => {
    const tasks = getAllTasks();
    const updated = [task, ...tasks];
    localStorage.setItem(STORAGE_KEYS.TASKS, obfuscateData(updated));
    return updated;
};
export const updateTask = (updatedTask: Task) => {
    const tasks = getAllTasks();
    const updated = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    localStorage.setItem(STORAGE_KEYS.TASKS, obfuscateData(updated));
    return updated;
};
export const deleteTask = (id: string) => {
    const tasks = getAllTasks();
    const updated = tasks.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TASKS, obfuscateData(updated));
    return updated;
};

// --- JOB & WORKER METHODS ---
export const getAllWorkers = (): Worker[] => deobfuscateData(localStorage.getItem(STORAGE_KEYS.WORKERS)) || [];
export const addWorker = (worker: Worker) => {
    const workers = getAllWorkers();
    const updated = [worker, ...workers];
    localStorage.setItem(STORAGE_KEYS.WORKERS, obfuscateData(updated));
    return updated;
};
export const updateWorker = (updatedWorker: Worker) => {
    const workers = getAllWorkers();
    const updated = workers.map(w => w.id === updatedWorker.id ? updatedWorker : w);
    localStorage.setItem(STORAGE_KEYS.WORKERS, obfuscateData(updated));
    return updated;
};
export const deleteWorker = (id: string) => {
    const workers = getAllWorkers();
    const updated = workers.filter(w => w.id !== id);
    localStorage.setItem(STORAGE_KEYS.WORKERS, obfuscateData(updated));
    return updated;
};

export const getAllJobs = (): Job[] => deobfuscateData(localStorage.getItem(STORAGE_KEYS.JOBS)) || [];

export const addJob = (job: Job) => {
  const jobs = getAllJobs();
  const updated = [job, ...jobs];
  localStorage.setItem(STORAGE_KEYS.JOBS, obfuscateData(updated));
  return updated;
};

export const updateJob = (updatedJob: Job) => {
  const jobs = getAllJobs();
  const updated = jobs.map(j => j.id === updatedJob.id ? updatedJob : j);
  localStorage.setItem(STORAGE_KEYS.JOBS, obfuscateData(updated));
  return updated;
};

export const generateId = () => Math.random().toString(36).substr(2, 9);