import React, { useState, useEffect } from 'react';
import { Mic, Play, Settings2, Volume2, History, Calendar, Phone, Clock, User, Save, Sliders, Check, Globe } from 'lucide-react';
import { generateReceptionistResponse } from '../services/aiService';
import { getAllCalls, addCallLog, generateId } from '../services/dbService';
import { CallLog } from '../types';

const AVAILABLE_VOICES = [
    { id: 'us_female_1', name: 'Sarah', accent: 'American', style: 'Professional', lang: 'en-US', gender: 'female', sample: "Hello, how can I assist you today?" },
    { id: 'us_male_1', name: 'Michael', accent: 'American', style: 'Friendly', lang: 'en-US', gender: 'male', sample: "Hey there! Thanks for calling." },
    { id: 'uk_female_1', name: 'Emma', accent: 'British', style: 'Polite', lang: 'en-GB', gender: 'female', sample: "Good afternoon. How may I help you?" },
    { id: 'au_female_1', name: 'Matilda', accent: 'Australian', style: 'Cheerful', lang: 'en-AU', gender: 'female', sample: "G'day! Thanks for giving us a ring. How can I help?" },
    { id: 'au_male_1', name: 'Steve', accent: 'Australian', style: 'Direct', lang: 'en-AU', gender: 'male', sample: "Hello mate, what can I do for you today?" },
];

export const ReceptionistView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'logs'>('overview');
    
    // Test AI Simulator State
    const [testQuery, setTestQuery] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    // Logs State
    const [logs, setLogs] = useState<CallLog[]>([]);

    // Voice Settings State
    const [voiceSettings, setVoiceSettings] = useState({
        voiceId: 'us_female_1',
        speed: 1.0,
        pitch: 1.0,
        greeting: "Hello! Thank you for calling NexusAI. How can I help you today?"
    });
    const [systemVoices, setSystemVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

    useEffect(() => {
        loadLogs();
        const loadVoices = () => {
            setSystemVoices(window.speechSynthesis.getVoices());
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, [activeTab]);

    const loadLogs = () => {
        const allCalls = getAllCalls();
        // Sort by date (mock date parsing for demo, in prod use real timestamps)
        setLogs(allCalls);
    };

    const handleTestQuery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!testQuery.trim()) return;

        setIsThinking(true);
        const response = await generateReceptionistResponse(testQuery);
        setAiResponse(response);
        setIsThinking(false);

        const newLog: CallLog = {
            id: generateId(),
            caller: 'Simulator Test',
            customerId: undefined,
            duration: '0m 30s',
            date: 'Just now',
            status: 'Answered',
            summary: `User asked: "${testQuery}". AI Responded.`
        };
        addCallLog(newLog);
    };

    const handleExampleClick = (text: string) => {
        setTestQuery(text);
    };

    const handlePreviewVoice = (voice: typeof AVAILABLE_VOICES[0]) => {
        window.speechSynthesis.cancel();
        
        if (playingVoiceId === voice.id) {
            setPlayingVoiceId(null);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(voice.sample);
        utterance.rate = voiceSettings.speed;
        utterance.pitch = voiceSettings.pitch;
        
        // Try to match system voice
        const sysVoice = systemVoices.find(v => v.lang === voice.lang && !v.name.includes('Google')) 
                      || systemVoices.find(v => v.lang === voice.lang)
                      || systemVoices.find(v => v.lang === 'en-US');
        
        if (sysVoice) utterance.voice = sysVoice;

        setPlayingVoiceId(voice.id);
        utterance.onend = () => setPlayingVoiceId(null);
        window.speechSynthesis.speak(utterance);
    };

    const handleSaveSettings = () => {
        // Mock save
        alert("Voice settings updated successfully!");
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
             {/* Sub-Navigation */}
             <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'overview' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    Overview & Simulator
                </button>
                <button 
                    onClick={() => setActiveTab('settings')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'settings' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    Voice Settings
                </button>
                 <button 
                    onClick={() => setActiveTab('logs')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'logs' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    Call Logs
                </button>
             </div>

             {/* Content Area */}
             <div className="min-h-[600px]">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Status Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4 shadow-sm">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                <Mic size={32} className="text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Receptionist is Active</h2>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                Your AI agent is currently listening for calls on <strong>+1 (555) 019-2834</strong>.
                            </p>
                            <div className="pt-4 flex justify-center gap-4">
                                <button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-2 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    Pause
                                </button>
                                <button 
                                    onClick={() => setActiveTab('settings')}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                                >
                                    Configure Voice
                                </button>
                            </div>
                        </div>

                        {/* Simulator Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Settings2 size={20} /> Test Your AI
                            </h3>
                            
                            <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-4 overflow-y-auto max-h-[300px] min-h-[250px] flex flex-col">
                                {aiResponse ? (
                                    <div className="space-y-4 mt-auto animate-in fade-in slide-in-from-bottom-2">
                                        <div className="flex justify-end">
                                            <div className="bg-indigo-600 text-white px-4 py-2 rounded-t-lg rounded-bl-lg max-w-[80%] text-sm">
                                                {testQuery}
                                            </div>
                                        </div>
                                        <div className="flex justify-start">
                                            <div className={`bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-t-lg rounded-br-lg max-w-[90%] text-sm shadow-sm ${
                                                aiResponse.includes("Action Performed") ? "border-green-300 bg-green-50 dark:bg-green-900/20" : ""
                                            }`}>
                                                {aiResponse}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Interaction Logged</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                                        <Volume2 size={32} className="mb-2 opacity-50" />
                                        <p>Ask a question to test your Knowledge Base.</p>
                                    </div>
                                )}
                            </div>

                            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                                <button 
                                    onClick={() => handleExampleClick("Book an appointment for Alice at 2pm tomorrow")}
                                    className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full whitespace-nowrap hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
                                >
                                    <Calendar size={12} /> Book Appointment
                                </button>
                                <button 
                                    onClick={() => handleExampleClick("What are your opening hours?")}
                                    className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full whitespace-nowrap hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Check Hours
                                </button>
                            </div>

                            <form onSubmit={handleTestQuery} className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={testQuery}
                                    onChange={(e) => setTestQuery(e.target.value)}
                                    placeholder="e.g. Can I schedule a call for Friday?"
                                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <button 
                                    type="submit" 
                                    disabled={isThinking || !testQuery.trim()}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {isThinking ? '...' : <Play size={20} fill="currentColor" />}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Globe size={20} className="text-indigo-600" /> Voice Persona
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {AVAILABLE_VOICES.map((voice) => (
                                        <div 
                                            key={voice.id}
                                            onClick={() => setVoiceSettings({...voiceSettings, voiceId: voice.id})}
                                            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                                                voiceSettings.voiceId === voice.id 
                                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                                                : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800'
                                            }`}
                                        >
                                            <div className={`p-3 rounded-full ${voiceSettings.voiceId === voice.id ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                                <Volume2 size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h4 className="font-bold text-slate-900 dark:text-white">{voice.name}</h4>
                                                    {voice.lang === 'en-AU' && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-medium">AU</span>}
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{voice.accent} • {voice.style}</p>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handlePreviewVoice(voice); }}
                                                    className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                                                >
                                                    {playingVoiceId === voice.id ? 'Playing...' : <><Play size={12} fill="currentColor" /> Preview</>}
                                                </button>
                                            </div>
                                            {voiceSettings.voiceId === voice.id && (
                                                <div className="absolute top-4 right-4 bg-indigo-600 text-white rounded-full p-1">
                                                    <Check size={12} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Greeting Message</h3>
                                <p className="text-sm text-slate-500 mb-4">This is the first thing the caller will hear when they connect.</p>
                                <textarea 
                                    className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    rows={3}
                                    value={voiceSettings.greeting}
                                    onChange={(e) => setVoiceSettings({...voiceSettings, greeting: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Sliders size={20} /> Characteristics
                                </h3>
                                
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Talking Speed</label>
                                            <span className="text-xs text-slate-500">{voiceSettings.speed}x</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="0.5" 
                                            max="1.5" 
                                            step="0.1" 
                                            value={voiceSettings.speed}
                                            onChange={(e) => setVoiceSettings({...voiceSettings, speed: parseFloat(e.target.value)})}
                                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                        <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                                            <span>Slow</span>
                                            <span>Fast</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pitch / Tone</label>
                                            <span className="text-xs text-slate-500">{voiceSettings.pitch}x</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="0.5" 
                                            max="1.5" 
                                            step="0.1" 
                                            value={voiceSettings.pitch}
                                            onChange={(e) => setVoiceSettings({...voiceSettings, pitch: parseFloat(e.target.value)})}
                                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                        <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                                            <span>Deep</span>
                                            <span>High</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <button 
                                        onClick={handleSaveSettings}
                                        className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                                    >
                                        <Save size={18} /> Save Configuration
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm animate-in fade-in">
                        {logs.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                <History size={48} className="mx-auto mb-4 opacity-30" />
                                <p>No calls logged yet.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {logs.map((log) => (
                                    <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 p-2 rounded-full ${
                                                log.status === 'Missed' ? 'bg-red-100 text-red-600' : 
                                                log.status === 'Voicemail' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                                            }`}>
                                                <Phone size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{log.caller}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{log.date}</p>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700 max-w-xl">
                                                    {log.summary}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-mono text-slate-500 flex items-center gap-1 justify-end mb-2">
                                                <Clock size={12} /> {log.duration}
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                log.status === 'Missed' ? 'bg-red-50 text-red-700' : 
                                                log.status === 'Voicemail' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                                            }`}>
                                                {log.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
             </div>
        </div>
    );
};