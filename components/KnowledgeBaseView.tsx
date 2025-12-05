import React, { useState, useEffect } from 'react';
import { BookOpen, Globe, FileText, Trash2, Save, CheckCircle2, AlertCircle, Building, Clock, MapPin, UploadCloud, RefreshCw, X } from 'lucide-react';
import { getKnowledgeSources, getBusinessProfile, saveBusinessProfile, addKnowledgeSource, deleteKnowledgeSource } from '../services/ragService';
import { KnowledgeSource, BusinessProfile, BusinessHours } from '../types';

interface KnowledgeBaseViewProps {
    customerId?: string; // This ID acts as the "Tenant ID" or context ID.
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({ customerId }) => {
    // Default to 'profile' tab so the user sees business info first
    const [activeTab, setActiveTab] = useState<'profile' | 'sources'>('profile');
    
    // Load profile specific to the customerId (or global if undefined)
    const [profile, setProfile] = useState<BusinessProfile>(getBusinessProfile(customerId));
    const [sources, setSources] = useState<KnowledgeSource[]>([]);
    const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

    // Source Form State
    const [newSourceType, setNewSourceType] = useState<'text' | 'website'>('website');
    const [newSourceTitle, setNewSourceTitle] = useState('');
    const [newSourceContent, setNewSourceContent] = useState('');
    const [isAddingSource, setIsAddingSource] = useState(false);

    useEffect(() => {
        // Load initial data
        loadData();
    }, [customerId]);

    // Simulate "Polling" for status updates (mocking backend indexing)
    useEffect(() => {
        const interval = setInterval(() => {
            loadData();
        }, 2000);
        return () => clearInterval(interval);
    }, [customerId]);

    const loadData = () => {
        const allSources = getKnowledgeSources();
        // Filter sources based on ID. 
        // If customerId is provided, show sources with that ID.
        // If no customerId (Global admin), show sources with NO ID (undefined).
        const targetId = customerId || undefined;
        const filtered = allSources.filter(s => s.customerId === targetId);
        setSources(filtered);
        
        // Reload profile for specific ID
        setProfile(getBusinessProfile(customerId));
    };

    const showNotification = (msg: string, type: 'success' | 'error') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleProfileSave = () => {
        saveBusinessProfile(profile, customerId);
        showNotification("Business Profile saved successfully!", "success");
    };

    const handleHoursChange = (index: number, field: keyof BusinessHours, value: any) => {
        const newHours = [...profile.hours];
        // @ts-ignore
        newHours[index][field] = value;
        setProfile({ ...profile, hours: newHours });
    };

    const handleAddSource = (e: React.FormEvent) => {
        e.preventDefault();
        // Pass customerId to add function
        addKnowledgeSource(newSourceType, newSourceTitle, newSourceContent, undefined, customerId);
        loadData(); // Refresh local state immediately
        setIsAddingSource(false);
        setNewSourceTitle('');
        setNewSourceContent('');
        showNotification("Source added. Indexing started...", "success");
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Simple text file reading
        if (file.type === 'text/plain' || file.name.endsWith('.md')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                addKnowledgeSource('file', file.name, text, file.name, customerId);
                loadData();
                showNotification(`Uploaded ${file.name}`, "success");
            };
            reader.readAsText(file);
        } else {
            // Mock PDF upload
            addKnowledgeSource('file', file.name, "[PDF Content Placeholder - Backend required for real PDF parsing]", file.name, customerId);
            loadData();
            showNotification(`Uploaded ${file.name} (Mock Processing)`, "success");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {customerId ? 'Customer Knowledge Base' : 'Global Knowledge Base'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {customerId ? 'Configure the AI personality and facts for this specific customer.' : 'Manage global settings.'}
                    </p>
                </div>
                {notification && (
                    <div className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                        notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        {notification.msg}
                    </div>
                )}
            </div>

            <div className="border-b border-slate-200 dark:border-slate-700 flex gap-6">
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === 'profile' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Business Profile
                </button>
                <button 
                    onClick={() => setActiveTab('sources')}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === 'sources' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Documents & Links ({sources.length})
                </button>
            </div>

            {/* --- PROFILE TAB --- */}
            {activeTab === 'profile' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* General Info */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Building size={20} /> General Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Company Name</label>
                                <input 
                                    type="text" 
                                    value={profile.companyName}
                                    onChange={e => setProfile({...profile, companyName: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Business Description</label>
                                <textarea 
                                    rows={3}
                                    value={profile.description}
                                    onChange={e => setProfile({...profile, description: e.target.value})}
                                    placeholder="e.g. A family-owned Italian restaurant serving authentic pasta..."
                                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Industry</label>
                                <input 
                                    type="text" 
                                    value={profile.industry}
                                    onChange={e => setProfile({...profile, industry: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Phone</label>
                                <input 
                                    type="text" 
                                    value={profile.phone}
                                    onChange={e => setProfile({...profile, phone: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Address</label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                    <input 
                                        type="text" 
                                        value={profile.address}
                                        onChange={e => setProfile({...profile, address: e.target.value})}
                                        className="w-full pl-9 pr-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                             <div className="col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Google Business / Website URL</label>
                                <div className="relative">
                                    <Globe size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                    <input 
                                        type="text" 
                                        value={profile.website}
                                        onChange={e => setProfile({...profile, website: e.target.value})}
                                        placeholder="https://..."
                                        className="w-full pl-9 pr-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operating Hours */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Clock size={20} /> Operating Hours
                            </h3>
                            <button onClick={handleProfileSave} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
                                <Save size={16} /> Save Profile
                            </button>
                        </div>
                        <div className="space-y-2">
                            {profile.hours.map((hour, idx) => (
                                <div key={hour.day} className="flex items-center gap-4 text-sm">
                                    <div className="w-24 font-medium text-slate-700 dark:text-slate-300">{hour.day}</div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={!hour.closed} 
                                            onChange={(e) => handleHoursChange(idx, 'closed', !e.target.checked)}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                                        />
                                        <span className="text-slate-500 text-xs">Open</span>
                                    </label>
                                    {!hour.closed ? (
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="time" 
                                                value={hour.open} 
                                                onChange={(e) => handleHoursChange(idx, 'open', e.target.value)}
                                                className="px-2 py-1 border rounded bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                                            />
                                            <span className="text-slate-400">-</span>
                                            <input 
                                                type="time" 
                                                value={hour.close}
                                                onChange={(e) => handleHoursChange(idx, 'close', e.target.value)}
                                                className="px-2 py-1 border rounded bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 text-xs italic ml-2">Closed</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- SOURCES TAB --- */}
            {activeTab === 'sources' && (
                <div className="space-y-6">
                    {/* Add Source Card */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                        {!isAddingSource ? (
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => { setIsAddingSource(true); setNewSourceType('website'); }}
                                    className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-colors shadow-sm"
                                >
                                    <Globe size={18} className="text-blue-500" /> Add Website Link
                                </button>
                                <button 
                                    onClick={() => { setIsAddingSource(true); setNewSourceType('text'); }}
                                    className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-colors shadow-sm"
                                >
                                    <FileText size={18} className="text-orange-500" /> Enter Text Manually
                                </button>
                                <label className="cursor-pointer flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-colors shadow-sm">
                                    <UploadCloud size={18} className="text-purple-500" /> Upload Document
                                    <input type="file" className="hidden" accept=".txt,.md,.pdf" onChange={handleFileUpload} />
                                </label>
                            </div>
                        ) : (
                            <form onSubmit={handleAddSource} className="space-y-4 animate-in fade-in">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-slate-900 dark:text-white">Add {newSourceType === 'website' ? 'Website' : 'Text'} Source</h3>
                                    <button type="button" onClick={() => setIsAddingSource(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Title / Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={newSourceTitle}
                                        onChange={e => setNewSourceTitle(e.target.value)}
                                        placeholder={newSourceType === 'website' ? "e.g. Pricing Page" : "e.g. Return Policy"}
                                        className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white dark:border-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{newSourceType === 'website' ? 'URL' : 'Content'}</label>
                                    {newSourceType === 'website' ? (
                                        <input 
                                            required
                                            type="url"
                                            value={newSourceContent}
                                            onChange={e => setNewSourceContent(e.target.value)}
                                            placeholder="https://example.com/pricing"
                                            className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white dark:border-slate-700"
                                        />
                                    ) : (
                                        <textarea 
                                            required
                                            rows={5}
                                            value={newSourceContent}
                                            onChange={e => setNewSourceContent(e.target.value)}
                                            placeholder="Paste your text content here..."
                                            className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white dark:border-slate-700"
                                        />
                                    )}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setIsAddingSource(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Add Source</button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Source List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sources.length === 0 && (
                            <div className="col-span-full text-center py-12 text-slate-500">
                                <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                                <p>No documents found.</p>
                                <p className="text-sm">Add documents to help the AI answer questions accurately.</p>
                            </div>
                        )}
                        
                        {sources.map((source) => (
                            <div key={source.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                                <button 
                                    onClick={() => deleteKnowledgeSource(source.id)}
                                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={18} />
                                </button>
                                
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-lg ${
                                        source.type === 'website' ? 'bg-blue-100 text-blue-600' : 
                                        source.type === 'file' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'
                                    }`}>
                                        {source.type === 'website' ? <Globe size={20} /> : source.type === 'file' ? <FileText size={20} /> : <BookOpen size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{source.title}</h4>
                                        <p className="text-xs text-slate-500 capitalize">{source.type}</p>
                                    </div>
                                </div>
                                
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-4 h-8 line-clamp-2 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                                    {source.content}
                                </div>

                                <div className="flex justify-between items-center text-xs">
                                    <span className={`flex items-center gap-1 font-medium ${
                                        source.status === 'ready' ? 'text-green-600' : 
                                        source.status === 'processing' ? 'text-amber-600' : 'text-red-600'
                                    }`}>
                                        {source.status === 'ready' ? <CheckCircle2 size={12} /> : 
                                         source.status === 'processing' ? <RefreshCw size={12} className="animate-spin" /> : <AlertCircle size={12} />}
                                        {source.status.toUpperCase()}
                                    </span>
                                    <span className="text-slate-400">{new Date(source.lastUpdated).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};