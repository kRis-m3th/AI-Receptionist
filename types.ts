import React from 'react';

export enum CustomerStatus {
  LEAD = 'Lead',
  ACTIVE = 'Active',
  CHURNED = 'Churned'
}

export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'custom';
export type UserRole = 'super_admin' | 'tenant_admin' | 'employee';

// --- NEW FIELD OPS TYPES ---

export type JobStatus = 'Pending' | 'Dispatched' | 'In Progress' | 'Completed' | 'Cancelled';
export type JobType = 'Installation' | 'Repair' | 'Maintenance' | 'Consultation';

export interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatarUrl?: string;
  status: 'Available' | 'On Job' | 'Offline';
  skills: string[];
}

export interface Job {
  id: string;
  customerId: string; // Link to Customer
  workerId?: string; // Link to Worker (optional if unassigned)
  title: string;
  description: string;
  type: JobType;
  status: JobStatus;
  date: string;
  location: string;
  priority: 'Low' | 'Medium' | 'High';
}

// ---------------------------

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  model: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentDetails {
  provider: string; // e.g. 'Visa', 'MasterCard'
  last4: string;
  expiryDate: string; // MM/YY
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
  lastContact: string;
  tags: string[];
  address?: Address;
  paymentDetails?: PaymentDetails;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number; // minutes
  type: 'Phone' | 'Video' | 'In-Person';
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
  notes?: string;
  sendReminder?: boolean;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  reminder: boolean; // If true, shows in notification bell
  dueDate?: string;
}

export type SubscriptionPlan = 'Email Only' | 'Receptionist Only' | 'Pro Bundle' | 'Business Elite' | 'Enterprise';

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PlanTier {
  id: SubscriptionPlan;
  name: string;
  price: number;
  period: string;
  description: string;
  features: PlanFeature[];
  highlight?: boolean;
}

// Represents a Business User of YOUR SaaS
export interface Tenant {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  plan: SubscriptionPlan;
  status: 'Active' | 'Suspended' | 'Trial';
  joinedDate: string;
  mrr: number; // Monthly Recurring Revenue
  billingCycle: 'weekly' | 'monthly' | 'yearly';
  nextBillingDate: string;
  paymentMethod?: {
    brand: string;
    last4: string;
    isValid: boolean;
  };
}

export interface Transaction {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  date: string;
  status: 'succeeded' | 'failed' | 'pending';
  type: 'charge' | 'refund' | 'credit_adjustment';
  invoicePdfUrl?: string;
  paymentMethod: string; // e.g., "Visa ending in 4242"
}

export interface EmailMessage {
  id: string;
  sender: string;
  email?: string; // sender email for linking
  subject: string;
  preview: string;
  content: string;
  date: string;
  read: boolean;
}

export interface CallLog {
  id: string;
  customerId?: string; // Links call to a specific customer profile
  caller: string;
  duration: string;
  date: string;
  status: 'Missed' | 'Answered' | 'Voicemail' | 'Outbound';
  summary: string;
  query?: string; // The main question/intent detected by AI
  followUpAction?: string; // Suggested next step for the user
}

export interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

export interface TwoFactorConfig {
  enabled: boolean;
  method: 'app' | 'key' | 'sms' | null;
  verifiedAt?: string;
  backupCodes?: string[];
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string; // Display role e.g. "Business Owner"
  accessLevel: UserRole; // Security role
  companyName: string;
  avatarUrl: string;
  plan: SubscriptionPlan;
  credits: number; // Store credit for downgrades
  billing: {
    last4: string;
    brand: string;
    expiry: string;
    nextBillingDate: string;
  };
  twoFactor?: TwoFactorConfig;
}

// --- KNOWLEDGE BASE / RAG TYPES ---

export type KnowledgeType = 'text' | 'website' | 'file' | 'google_profile';

export interface KnowledgeSource {
  id: string;
  type: KnowledgeType;
  title: string;
  content: string; // URL for website, Raw text for others
  status: 'processing' | 'ready' | 'error';
  lastUpdated: string;
  fileName?: string; // For files
  customerId?: string; // Linked to a specific customer
}

export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface BusinessProfile {
  companyName: string;
  industry: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  hours: BusinessHours[];
}