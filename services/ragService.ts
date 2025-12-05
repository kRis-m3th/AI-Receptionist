import { KnowledgeSource, BusinessProfile, BusinessHours } from '../types';
import { generateId } from './dbService';

const STORAGE_KEYS = {
    KNOWLEDGE_SOURCES: 'nexus_rag_sources',
    BUSINESS_PROFILES: 'nexus_rag_profiles' // Changed to plural/object storage
};

const DEFAULT_HOURS: BusinessHours[] = [
    { day: 'Monday', open: '09:00', close: '17:00', closed: false },
    { day: 'Tuesday', open: '09:00', close: '17:00', closed: false },
    { day: 'Wednesday', open: '09:00', close: '17:00', closed: false },
    { day: 'Thursday', open: '09:00', close: '17:00', closed: false },
    { day: 'Friday', open: '09:00', close: '17:00', closed: false },
    { day: 'Saturday', open: '10:00', close: '14:00', closed: false },
    { day: 'Sunday', open: '00:00', close: '00:00', closed: true },
];

const DEFAULT_PROFILE: BusinessProfile = {
    companyName: 'My Business',
    industry: 'General',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    hours: DEFAULT_HOURS
};

// --- DATA ACCESS ---

export const getKnowledgeSources = (): KnowledgeSource[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE_SOURCES);
        return stored ? JSON.parse(stored) : [];
    } catch { return []; }
};

export const saveKnowledgeSources = (sources: KnowledgeSource[]) => {
    localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_SOURCES, JSON.stringify(sources));
};

// Modified to get profile by ID (defaults to 'global' if not provided)
export const getBusinessProfile = (id: string = 'global'): BusinessProfile => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.BUSINESS_PROFILES);
        const profiles = stored ? JSON.parse(stored) : {};
        return profiles[id] || DEFAULT_PROFILE;
    } catch { return DEFAULT_PROFILE; }
};

// Modified to save profile by ID
export const saveBusinessProfile = (profile: BusinessProfile, id: string = 'global') => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.BUSINESS_PROFILES);
        const profiles = stored ? JSON.parse(stored) : {};
        profiles[id] = profile;
        localStorage.setItem(STORAGE_KEYS.BUSINESS_PROFILES, JSON.stringify(profiles));
    } catch (e) { console.error("Error saving profile", e); }
};

// --- OPERATIONS ---

export const addKnowledgeSource = (type: KnowledgeSource['type'], title: string, content: string, fileName?: string, customerId?: string): KnowledgeSource => {
    const sources = getKnowledgeSources();
    const newSource: KnowledgeSource = {
        id: generateId(),
        type,
        title,
        content,
        fileName,
        status: 'processing', // Simulate processing
        lastUpdated: new Date().toLocaleString(),
        customerId
    };

    // Simulate "Indexing" delay
    setTimeout(() => {
        const current = getKnowledgeSources();
        const updated = current.map(s => s.id === newSource.id ? { ...s, status: 'ready' } : s);
        // @ts-ignore
        saveKnowledgeSources(updated as KnowledgeSource[]);
    }, 2000);

    const updatedList = [newSource, ...sources];
    saveKnowledgeSources(updatedList);
    return newSource;
};

export const deleteKnowledgeSource = (id: string) => {
    const sources = getKnowledgeSources();
    saveKnowledgeSources(sources.filter(s => s.id !== id));
};

// --- RAG CONTEXT BUILDER ---

export const constructRAGContext = (tenantId: string = 'global'): string => {
    const profile = getBusinessProfile(tenantId);
    
    // Filter sources: If tenantId is provided, get sources specific to that tenant OR global sources (optional policy)
    // For SaaS strict multi-tenancy, usually we strictly filter by tenantId.
    const allSources = getKnowledgeSources();
    const sources = allSources.filter(s => s.status === 'ready' && (s.customerId === tenantId || (!s.customerId && tenantId === 'global')));

    let context = `SYSTEM CONTEXT FOR AI RECEPTIONIST:\n\n`;

    // 1. Structured Business Profile
    context += `--- BUSINESS DETAILS ---\n`;
    context += `Name: ${profile.companyName}\n`;
    context += `Industry: ${profile.industry}\n`;
    context += `Description: ${profile.description}\n`;
    context += `Address: ${profile.address}\n`;
    context += `Contact: ${profile.phone} | ${profile.email}\n`;
    context += `Website: ${profile.website}\n`;
    context += `Operating Hours:\n${profile.hours.map(h => 
        `  - ${h.day}: ${h.closed ? 'Closed' : `${h.open} to ${h.close}`}`
    ).join('\n')}\n\n`;

    // 2. Unstructured Sources
    context += `--- KNOWLEDGE BASE ---\n`;
    if (sources.length === 0) {
        context += `(No additional documents provided.)\n`;
    } else {
        sources.forEach((source, index) => {
            context += `\n[Source ${index + 1}: ${source.title} (${source.type})]\n`;
            if (source.type === 'website') {
                context += `URL: ${source.content}\n(Note: As an AI, use your internal knowledge about this URL if available, otherwise rely on general knowledge about this business type.)\n`;
            } else {
                // Limit content length to prevent context overflow (simple truncation for MVP)
                const truncatedContent = source.content.length > 2000 
                    ? source.content.substring(0, 2000) + "...(truncated)" 
                    : source.content;
                context += `${truncatedContent}\n`;
            }
        });
    }

    return context;
};