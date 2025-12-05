import { Customer, CustomerStatus, EmailMessage, CallLog, AdminProfile, Tenant, Worker, Job } from './types';

// ... existing code ...
export const MOCK_ADMIN_PROFILE: AdminProfile = {
  id: 'admin_001',
  name: 'Alex Johnson',
  email: 'alex.johnson@nexus.com',
  phone: '+1 (555) 999-8888',
  role: 'Business Owner',
  accessLevel: 'super_admin', // Grants access to Meta Admin
  companyName: 'Nexus Innovations',
  avatarUrl: 'https://picsum.photos/seed/admin/200',
  plan: 'Pro Bundle',
  credits: 0,
  billing: {
    last4: '4242',
    brand: 'Visa',
    expiry: '12/25',
    nextBillingDate: 'Nov 1, 2023'
  }
};

export const MOCK_WORKERS: Worker[] = [
  {
    id: 'w1',
    name: 'Mike Torrez',
    email: 'mike@nexus.com',
    phone: '+1 (555) 010-5555',
    role: 'Senior Technician',
    status: 'Available',
    skills: ['Repair', 'Installation'],
    avatarUrl: 'https://picsum.photos/seed/worker1/150'
  },
  {
    id: 'w2',
    name: 'Sarah Jenkins',
    email: 'sarah@nexus.com',
    phone: '+1 (555) 010-6666',
    role: 'Field Specialist',
    status: 'On Job',
    skills: ['Maintenance', 'Consultation'],
    avatarUrl: 'https://picsum.photos/seed/worker2/150'
  },
  {
    id: 'w3',
    name: 'Dave Chen',
    email: 'dave@nexus.com',
    phone: '+1 (555) 010-7777',
    role: 'Installer',
    status: 'Offline',
    skills: ['Installation'],
    avatarUrl: 'https://picsum.photos/seed/worker3/150'
  }
];

export const MOCK_JOBS: Job[] = [
  {
    id: 'j1',
    customerId: '1', // Alice Freeman
    workerId: 'w2',
    title: 'Server Rack Installation',
    description: 'Install new server rack in the main data closet.',
    type: 'Installation',
    status: 'In Progress',
    date: '2023-10-25',
    location: '123 Innovation Dr, San Francisco',
    priority: 'High'
  },
  {
    id: 'j2',
    customerId: '2', // Bob Smith
    workerId: 'w1',
    title: 'HVAC Maintenance',
    description: 'Routine checkup of the AC units on roof.',
    type: 'Maintenance',
    status: 'Pending',
    date: '2023-10-26',
    location: '45 Creative Ave, Austin',
    priority: 'Medium'
  },
  {
    id: 'j3',
    customerId: '4', // Dana Lee
    title: 'Network Repair',
    description: 'Internet connectivity issues in the lobby.',
    type: 'Repair',
    status: 'Pending', // Unassigned
    date: '2023-10-27',
    location: '777 Venture Blvd, New York',
    priority: 'High'
  }
];

export const MOCK_TENANTS: Tenant[] = [
  {
    id: 't1',
    businessName: 'Acme Supplies',
    ownerName: 'John Doe',
    email: 'john@acme.com',
    plan: 'Pro Bundle',
    status: 'Active',
    joinedDate: 'Jan 15, 2023',
    mrr: 2000,
    billingCycle: 'weekly',
    nextBillingDate: 'Nov 15, 2023'
  },
  {
    id: 't2',
    businessName: 'Floral Designs',
    ownerName: 'Jane Rose',
    email: 'jane@floral.com',
    plan: 'Email Only',
    status: 'Active',
    joinedDate: 'Mar 10, 2023',
    mrr: 400,
    billingCycle: 'weekly',
    nextBillingDate: 'Nov 10, 2023'
  },
  {
    id: 't3',
    businessName: 'Tech Start',
    ownerName: 'Mike Code',
    email: 'mike@techstart.io',
    plan: 'Email Only',
    status: 'Trial',
    joinedDate: 'Oct 01, 2023',
    mrr: 0,
    billingCycle: 'weekly',
    nextBillingDate: 'Nov 01, 2023'
  },
  {
    id: 't4',
    businessName: 'Old Bistro',
    ownerName: 'Chef Gusteau',
    email: 'chef@bistro.com',
    plan: 'Receptionist Only',
    status: 'Suspended',
    joinedDate: 'Feb 20, 2023',
    mrr: 1600,
    billingCycle: 'weekly',
    nextBillingDate: 'Oct 20, 2023'
  }
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'Alice Freeman',
    email: 'alice@techcorp.com',
    phone: '+1 (555) 010-9988',
    company: 'TechCorp',
    status: CustomerStatus.ACTIVE,
    lastContact: '2 hours ago',
    tags: ['VIP', 'Enterprise'],
    address: {
      street: '123 Innovation Dr',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA'
    },
    paymentDetails: {
      provider: 'Visa',
      last4: '4242',
      expiryDate: '12/25'
    }
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@designstudio.io',
    phone: '+1 (555) 012-3344',
    company: 'Design Studio',
    status: CustomerStatus.LEAD,
    lastContact: '1 day ago',
    tags: ['Inquiry'],
    address: {
      street: '45 Creative Ave',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'USA'
    }
  },
  {
    id: '3',
    name: 'Charlie Davis',
    email: 'charlie@logistics.net',
    phone: '+1 (555) 019-2233',
    company: 'Fast Logistics',
    status: CustomerStatus.CHURNED,
    lastContact: '3 weeks ago',
    tags: ['Former'],
    address: {
      street: '88 Supply Chain Rd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    }
  },
  {
    id: '4',
    name: 'Dana Lee',
    email: 'dana@startuplab.co',
    phone: '+1 (555) 111-2222',
    company: 'Startup Lab',
    status: CustomerStatus.ACTIVE,
    lastContact: '5 mins ago',
    tags: ['New'],
    address: {
      street: '777 Venture Blvd',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    paymentDetails: {
      provider: 'MasterCard',
      last4: '8899',
      expiryDate: '09/26'
    }
  }
];

export const MOCK_EMAILS: EmailMessage[] = [
  {
    id: 'e1',
    sender: 'Sarah Connor',
    email: 'sarah@techcorp.com',
    subject: 'Project Timeline Update',
    preview: 'Hi, I wanted to check in on the timeline for...',
    content: 'Hi Team,\n\nI wanted to check in on the timeline for the Q4 deliverables. Are we still on track for next Friday?\n\nBest,\nSarah',
    date: '10:30 AM',
    read: false
  },
  {
    id: 'e2',
    sender: 'Alice Freeman',
    email: 'alice@techcorp.com',
    subject: 'Paper Supply Order',
    preview: 'We need to restock the 8x11 paper supplies...',
    content: 'Good morning,\n\nWe need to restock the 8x11 paper supplies immediately. Please process the attached invoice.\n\nThanks,\nMichael',
    date: 'Yesterday',
    read: true
  },
  {
    id: 'e3',
    sender: 'Support Ticket #992',
    email: 'support@client.com',
    subject: 'Urgent: Login Issue',
    preview: 'I cannot access my dashboard using the creds...',
    content: 'Hello,\n\nI cannot access my dashboard using the credentials provided. Can you reset my password?\n\nRegards,\nClient',
    date: 'Yesterday',
    read: true
  }
];

export const MOCK_CALLS: CallLog[] = [
  {
    id: 'c1',
    customerId: '1',
    caller: '+1 (555) 010-9988',
    duration: '2m 14s',
    date: 'Today, 9:15 AM',
    status: 'Answered',
    summary: 'Caller inquired about pricing tiers for Enterprise plan.',
    query: "What is the cost for the Enterprise tier if we have 50 users?",
    followUpAction: "Send updated pricing PDF to Alice"
  },
  {
    id: 'c2',
    customerId: '2',
    caller: '+1 (555) 012-3344',
    duration: '0m 45s',
    date: 'Today, 8:30 AM',
    status: 'Voicemail',
    summary: 'Left message regarding scheduling a demo next week.',
    query: "Can I book a demo for next Tuesday?",
    followUpAction: "Call back to schedule demo"
  },
  {
    id: 'c3',
    customerId: undefined, // Unknown caller
    caller: '+1 (555) 999-0000',
    duration: '0m 00s',
    date: 'Yesterday',
    status: 'Missed',
    summary: 'N/A',
    query: "N/A",
    followUpAction: "Check if number is associated with a lead"
  },
  {
    id: 'c4',
    customerId: '3',
    caller: '+1 (555) 019-2233',
    duration: '4m 20s',
    date: 'Yesterday',
    status: 'Answered',
    summary: 'Customer complained about login issues.',
    query: "Why can't I reset my password?",
    followUpAction: "Reset password manually and email temporary credentials"
  }
];

export const CHART_DATA = [
  { name: 'Mon', calls: 40, emails: 24 },
  { name: 'Tue', calls: 30, emails: 13 },
  { name: 'Wed', calls: 20, emails: 58 },
  { name: 'Thu', calls: 27, emails: 39 },
  { name: 'Fri', calls: 18, emails: 48 },
  { name: 'Sat', calls: 23, emails: 38 },
  { name: 'Sun', calls: 34, emails: 43 },
];