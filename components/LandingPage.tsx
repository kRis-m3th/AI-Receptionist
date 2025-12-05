import React, { useState, useEffect } from 'react';
import { Play, Check, ArrowRight, Phone, Mail, Users, Zap, Globe, Shield, Star, Menu, X, PauseCircle, PlayCircle, LogIn, Lock, Hammer, Heart, Briefcase, Home, Car, Store, CheckCircle2, Sparkles, Smartphone, BarChart3, MessageSquare, Mic, Volume2 } from 'lucide-react';
import { getAllPlans } from '../services/dbService';
import { PlanTier } from '../types';
import { LandingChatWidget } from './LandingChatWidget';

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void; // New prop
}

// --- Voice Demo Data ---
const VOICE_PERSONAS = [
  { 
    id: 'kore', 
    name: 'Sarah (Professional)', 
    desc: 'Polite, calm, and perfect for corporate scheduling.',
    sampleText: "Hello! Thank you for calling Nexus Innovations. How can I assist you with your appointment today?",
    pitch: 1,
    rate: 1,
    lang: 'en-US'
  },
  { 
    id: 'puck', 
    name: 'James (Friendly)', 
    desc: 'Warm, energetic, and great for sales inquiries.',
    sampleText: "Hey there! Thanks for reaching out. I'd love to tell you more about our special offers this week.",
    pitch: 0.9,
    rate: 1.05,
    lang: 'en-GB' // Fallback to British if available for distinction
  },
  { 
    id: 'fenrir', 
    name: 'Marcus (Direct)', 
    desc: 'Concise, efficient, ideal for support triage.',
    sampleText: "Support desk here. Please describe the issue you are facing and I'll log a ticket immediately.",
    pitch: 0.8,
    rate: 1.1,
    lang: 'en-US'
  }
];

const INDUSTRIES = [
  {
    id: 'trades',
    name: 'Home Services',
    icon: <Hammer size={24} className="text-orange-500" />,
    description: 'Auto-dispatch for HVAC, Plumbers, and Electricians.',
  },
  {
    id: 'health',
    name: 'Healthcare',
    icon: <Heart size={24} className="text-red-500" />,
    description: 'HIPAA-compliant booking for Dental & MedSpas.',
  },
  {
    id: 'legal',
    name: 'Legal & Finance',
    icon: <Briefcase size={24} className="text-blue-500" />,
    description: 'Client intake and consultation scheduling.',
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    icon: <Home size={24} className="text-indigo-500" />,
    description: 'Capture leads from property inquiries 24/7.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignup }) => {
  const [plans, setPlans] = useState<PlanTier[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Voice State
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [availableSystemVoices, setAvailableSystemVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Animation State
  const [heroActive, setHeroActive] = useState(false);

  useEffect(() => {
    setPlans(getAllPlans());
    setHeroActive(true);

    // Load browser voices
    const loadVoices = () => {
      setAvailableSystemVoices(window.speechSynthesis.getVoices());
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const handlePlayVoice = (persona: typeof VOICE_PERSONAS[0]) => {
    window.speechSynthesis.cancel();
    
    if (playingVoice === persona.id) {
      setPlayingVoice(null);
      return;
    }

    setPlayingVoice(persona.id);

    const utterance = new SpeechSynthesisUtterance(persona.sampleText);
    utterance.pitch = persona.pitch;
    utterance.rate = persona.rate;

    const voice = availableSystemVoices.find(v => v.lang === persona.lang && !v.name.includes('Google')) 
               || availableSystemVoices.find(v => v.lang === 'en-US');
    
    if (voice) utterance.voice = voice;

    utterance.onend = () => setPlayingVoice(null);
    window.speechSynthesis.speak(utterance);
  };

  const attemptLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (password === 'admin123') {
          onLogin();
      } else {
          setAuthError('Invalid credentials. Try "admin123"');
      }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 overflow-x-hidden">
      
      {/* --- LOGIN MODAL --- */}
      {isLoginModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full animate-in zoom-in-95 border border-slate-100">
                  <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Lock size={24} />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
                      <p className="text-slate-500 text-sm mt-1">Enter your password to access the dashboard.</p>
                  </div>
                  <form onSubmit={attemptLogin} className="space-y-4">
                      <div>
                          <input 
                            autoFocus
                            type="password"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            placeholder="Password (hint: admin123)"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                          />
                          {authError && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><X size={12}/> {authError}</p>}
                      </div>
                      <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
                          Login
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setIsLoginModalOpen(false)}
                        className="w-full text-slate-400 hover:text-slate-600 text-sm mt-2 font-medium"
                      >
                          Cancel
                      </button>
                  </form>
              </div>
          </div>
      )}

      {/* --- NAVBAR --- */}
      <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/20">
                <Zap className="text-white h-5 w-5" fill="currentColor" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">NexusAI</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Features</a>
              <a href="#demo" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Demo</a>
              <a href="#pricing" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Pricing</a>
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors"
              >
                Login
              </button>
              <button 
                onClick={onSignup}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:scale-105 active:scale-95"
              >
                Get Started
              </button>
            </div>

            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-900 p-2">
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-6 space-y-4 absolute w-full shadow-xl">
             <a href="#features" className="block text-slate-600 font-medium text-lg">Features</a>
             <a href="#demo" className="block text-slate-600 font-medium text-lg">Demo</a>
             <a href="#pricing" className="block text-slate-600 font-medium text-lg">Pricing</a>
             <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                <button onClick={() => setIsLoginModalOpen(true)} className="w-full bg-slate-100 text-slate-900 py-3 rounded-xl font-bold">Login</button>
                <button onClick={onSignup} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">Get Started</button>
             </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse"></div>
            <div className="absolute top-[10%] right-[-10%] w-[50%] h-[60%] bg-purple-200/30 rounded-full blur-[100px] mix-blend-multiply"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[100px] mix-blend-multiply"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              
              {/* Text Content */}
              <div className={`text-center lg:text-left transition-all duration-1000 ${heroActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                 <div className="inline-flex items-center gap-2 bg-white border border-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-8 shadow-sm hover:shadow-md transition-shadow cursor-default">
                    <Sparkles size={14} fill="currentColor" /> <span>AI Receptionist 2.0 is here</span>
                 </div>
                 
                 <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                    The AI Phone Agent <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x">That Never Sleeps.</span>
                 </h1>
                 
                 <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    Automate inbound calls, book appointments, and capture leads instantly. 
                    It sounds human, acts smart, and integrates with your CRM.
                 </p>
                 
                 <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                    <button onClick={onSignup} className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 hover:-translate-y-1">
                       Start Free Trial <ArrowRight size={20} />
                    </button>
                    <a href="#demo" className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 hover:-translate-y-1">
                       <PlayCircle size={20} /> Hear Demo
                    </a>
                 </div>

                 <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-500" /> 14-day free trial</span>
                    <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-500" /> Cancel anytime</span>
                 </div>
              </div>

              {/* Hero Visual (Interactive Phone Mockup) */}
              <div className={`relative mx-auto lg:ml-auto w-full max-w-[320px] lg:max-w-[380px] perspective-1000 transition-all duration-1000 delay-300 ${heroActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                  {/* Phone Body */}
                  <div className="relative bg-slate-900 rounded-[3rem] p-4 shadow-2xl border-8 border-slate-800 overflow-hidden ring-1 ring-white/20">
                      {/* Dynamic Island / Notch */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-32 bg-black rounded-b-2xl z-20"></div>
                      
                      {/* Screen Content */}
                      <div className="bg-slate-900 h-[600px] rounded-[2.2rem] relative overflow-hidden flex flex-col pt-12">
                          
                          {/* Call UI */}
                          <div className="flex-1 flex flex-col items-center pt-12 relative z-10">
                              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] mb-6 shadow-lg shadow-indigo-500/30 animate-pulse">
                                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                                      <img src="https://ui-avatars.com/api/?name=Nexus+AI&background=random" alt="AI" className="w-full h-full object-cover opacity-80" />
                                  </div>
                              </div>
                              <h3 className="text-2xl font-bold text-white mb-1">Nexus Assistant</h3>
                              <p className="text-indigo-300 text-sm font-medium animate-pulse">00:24 • AI Active</p>

                              {/* Waveform Visualization */}
                              <div className="flex gap-1 h-8 items-center mt-12">
                                  {[...Array(15)].map((_, i) => (
                                      <div key={i} className="w-1.5 bg-indigo-500 rounded-full animate-wave" style={{
                                          height: `${Math.random() * 100}%`,
                                          animationDelay: `${i * 0.1}s`
                                      }}></div>
                                  ))}
                              </div>
                          </div>

                          {/* Incoming Transcription Bubble */}
                          <div className="px-6 mb-8">
                              <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/50 shadow-lg transform transition-all hover:scale-105 cursor-default">
                                  <p className="text-xs text-indigo-300 font-bold mb-1 uppercase tracking-wider">Live Transcript</p>
                                  <p className="text-slate-200 text-sm leading-relaxed">
                                      "I can certainly help you book that appointment for Tuesday at 2 PM. I'll send a confirmation text now."
                                  </p>
                              </div>
                          </div>

                          {/* Call Controls */}
                          <div className="bg-slate-800/50 backdrop-blur-sm mt-auto p-6 pb-10 grid grid-cols-3 gap-4 justify-items-center">
                              <div className="w-14 h-14 bg-slate-700/50 rounded-full flex items-center justify-center text-white"><Mic size={24}/></div>
                              <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/30"><Phone size={24} className="rotate-[135deg]"/></div>
                              <div className="w-14 h-14 bg-slate-700/50 rounded-full flex items-center justify-center text-white"><Volume2 size={24}/></div>
                          </div>
                      </div>
                  </div>
                  
                  {/* Floating Notification Badge behind phone */}
                  <div className="absolute top-20 -right-12 bg-white p-3 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 animate-float z-30 hidden lg:flex">
                      <div className="bg-green-100 p-2 rounded-lg text-green-600"><CheckCircle2 size={20}/></div>
                      <div>
                          <p className="text-xs text-slate-500 font-bold uppercase">CRM Updated</p>
                          <p className="text-sm font-bold text-slate-900">Lead Captured</p>
                      </div>
                  </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- LOGO STRIP --- */}
      <section className="py-10 border-y border-slate-100 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">Trusted by forward-thinking businesses</p>
              <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                  {/* Mock Logos */}
                  <div className="flex items-center gap-2 text-xl font-bold text-slate-800"><Zap size={24} className="text-indigo-600" /> AcmeCorp</div>
                  <div className="flex items-center gap-2 text-xl font-bold text-slate-800"><Globe size={24} className="text-blue-600" /> GlobalTech</div>
                  <div className="flex items-center gap-2 text-xl font-bold text-slate-800"><Shield size={24} className="text-green-600" /> SecureNet</div>
                  <div className="flex items-center gap-2 text-xl font-bold text-slate-800"><Briefcase size={24} className="text-purple-600" /> LawPoint</div>
                  <div className="flex items-center gap-2 text-xl font-bold text-slate-800"><Home size={24} className="text-orange-600" /> EstatePro</div>
              </div>
          </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-20 max-w-3xl mx-auto">
             <h2 className="text-4xl font-bold text-slate-900 mb-4">Complete Automation Suite</h2>
             <p className="text-xl text-slate-500">Replace your busy work with intelligent agents that handle communication across all channels.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  icon: <Smartphone size={32} className="text-white" />, 
                  bg: "bg-gradient-to-br from-purple-500 to-indigo-600",
                  title: 'AI Receptionist', 
                  desc: 'Answers calls, understands context, and books appointments directly into your calendar.' 
                },
                { 
                  icon: <Mail size={32} className="text-white" />, 
                  bg: "bg-gradient-to-br from-blue-500 to-cyan-500",
                  title: 'Email Autopilot', 
                  desc: 'Reads incoming emails, drafts intelligent replies, and manages your inbox folder structure.' 
                },
                { 
                  icon: <BarChart3 size={32} className="text-white" />, 
                  bg: "bg-gradient-to-br from-orange-500 to-red-500",
                  title: 'Unified CRM', 
                  desc: 'A central database that auto-updates based on every call and email interaction.' 
                }
              ].map((feature, i) => (
                <div key={i} className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                   <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${feature.bg}`}>
                      {feature.icon}
                   </div>
                   <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{feature.title}</h3>
                   <p className="text-slate-500 leading-relaxed text-lg">{feature.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* --- INDUSTRIES GRID --- */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
         {/* Decoration */}
         <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-900/20 blur-3xl rounded-full translate-x-1/2"></div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
             <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                 <div className="max-w-xl">
                     <h2 className="text-3xl md:text-4xl font-bold mb-4">Tailored for your industry</h2>
                     <p className="text-slate-400 text-lg">NexusAI comes with pre-trained models for specific business verticals.</p>
                 </div>
                 <button onClick={onSignup} className="text-white border border-slate-700 px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium">
                     View all industries
                 </button>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {INDUSTRIES.map((ind, idx) => (
                     <div key={idx} className="bg-slate-800/50 backdrop-blur border border-slate-700 p-6 rounded-2xl hover:bg-slate-800 transition-colors">
                         <div className="bg-slate-900 w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-slate-700">
                             {ind.icon}
                         </div>
                         <h3 className="text-lg font-bold mb-2">{ind.name}</h3>
                         <p className="text-sm text-slate-400">{ind.description}</p>
                     </div>
                 ))}
             </div>
         </div>
      </section>

      {/* --- VOICE DEMO SECTION --- */}
      <section id="demo" className="py-24 bg-white relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
               <div className="order-2 lg:order-1">
                  <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                      
                      <div className="flex items-center justify-between mb-8">
                          <h3 className="text-white font-bold text-lg flex items-center gap-2"><Zap size={18} className="text-yellow-400"/> Live Demo</h3>
                          <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Online</span>
                      </div>

                      <div className="space-y-4">
                         {VOICE_PERSONAS.map((persona) => (
                            <div 
                              key={persona.id}
                              onClick={() => handlePlayVoice(persona)}
                              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                                playingVoice === persona.id 
                                ? 'bg-indigo-600 border-indigo-500' 
                                : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                              }`}
                            >
                               <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    playingVoice === persona.id ? 'bg-white text-indigo-600' : 'bg-slate-700 text-white group-hover:bg-slate-600'
                                  }`}>
                                     {playingVoice === persona.id ? (
                                        <div className="flex gap-0.5 items-end h-4">
                                           <span className="w-1 bg-current animate-[bounce_1s_infinite] h-2"></span>
                                           <span className="w-1 bg-current animate-[bounce_1.2s_infinite] h-4"></span>
                                           <span className="w-1 bg-current animate-[bounce_0.8s_infinite] h-2"></span>
                                        </div>
                                     ) : <Play size={20} fill="currentColor" className="ml-1" />}
                                  </div>
                                  <div>
                                     <h3 className="font-bold text-white text-lg">{persona.name}</h3>
                                     <p className="text-sm text-slate-400">{persona.desc}</p>
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                  </div>
               </div>
               
               <div className="order-1 lg:order-2">
                  <h2 className="text-4xl font-bold mb-6 text-slate-900">Human-level voice AI. <br/><span className="text-indigo-600">Really.</span></h2>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    Most AI voices sound robotic. Ours breathe, pause, and intonate just like a real person. 
                    Your customers won't even know they're talking to a machine.
                  </p>
                  <ul className="space-y-4 mb-8">
                      <li className="flex items-center gap-3 text-slate-700 font-medium">
                          <div className="bg-green-100 p-1 rounded-full"><Check size={16} className="text-green-600" /></div>
                          Sub-second latency (feels instant)
                      </li>
                      <li className="flex items-center gap-3 text-slate-700 font-medium">
                          <div className="bg-green-100 p-1 rounded-full"><Check size={16} className="text-green-600" /></div>
                          Handles interruptions naturally
                      </li>
                      <li className="flex items-center gap-3 text-slate-700 font-medium">
                          <div className="bg-green-100 p-1 rounded-full"><Check size={16} className="text-green-600" /></div>
                          Customizable accents and tones
                      </li>
                  </ul>
               </div>
            </div>
         </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
             <h2 className="text-4xl font-bold text-slate-900">Simple, Transparent Pricing</h2>
             <p className="text-slate-500 mt-4 text-xl">No long-term contracts. Pause or cancel anytime.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`relative p-8 rounded-3xl border flex flex-col transition-all duration-300 ${
                    plan.highlight 
                      ? 'bg-white text-slate-900 border-indigo-200 shadow-2xl shadow-indigo-200/50 scale-105 z-10' 
                      : 'bg-white text-slate-900 border-slate-100 shadow-sm hover:shadow-xl'
                  }`}
                >
                   {plan.highlight && (
                     <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                       Most Popular
                     </div>
                   )}
                   
                   <div className="mb-6">
                      <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                      <p className="text-sm mt-2 text-slate-500">{plan.description}</p>
                   </div>

                   <div className="mb-8 flex items-baseline gap-1">
                      <span className="text-5xl font-extrabold text-slate-900">${plan.price}</span>
                      <span className="text-slate-500 font-medium">/{plan.period}</span>
                   </div>

                   <ul className="space-y-4 mb-8 flex-1">
                      {plan.features.map((feature, idx) => (
                         <li key={idx} className="flex items-start gap-3 text-sm">
                            {feature.included ? (
                               <div className="bg-indigo-100 p-0.5 rounded-full mt-0.5"><Check size={12} className="text-indigo-600" /></div>
                            ) : (
                               <div className="bg-slate-100 p-0.5 rounded-full mt-0.5"><X size={12} className="text-slate-400" /></div>
                            )}
                            <span className={feature.included ? 'text-slate-700 font-medium' : 'text-slate-400'}>{feature.text}</span>
                         </li>
                      ))}
                   </ul>

                   <button onClick={onSignup} className={`w-full py-4 rounded-xl font-bold transition-all ${
                     plan.highlight 
                       ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20' 
                       : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                   }`}>
                     Get Started
                   </button>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-20 pb-10">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
               <div className="flex items-center gap-2 mb-6">
                  <div className="bg-indigo-600 p-2 rounded-lg">
                    <Zap className="text-white h-5 w-5" />
                  </div>
                  <span className="font-bold text-2xl text-white">NexusAI</span>
               </div>
               <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-6">
                 Empowering small businesses with enterprise-grade AI automation tools. 
                 Replace busywork with smart agents and focus on growing your business.
               </p>
               <div className="flex gap-4">
                   {/* Social Placeholders */}
                   <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer">
                       <span className="font-bold">X</span>
                   </div>
                   <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer">
                       <span className="font-bold">in</span>
                   </div>
               </div>
            </div>
            <div>
               <h4 className="font-bold text-white mb-6">Product</h4>
               <ul className="space-y-4 text-sm text-slate-400">
                  <li><a href="#" className="hover:text-indigo-400 transition-colors">AI Receptionist</a></li>
                  <li><a href="#" className="hover:text-indigo-400 transition-colors">Email Automation</a></li>
                  <li><a href="#" className="hover:text-indigo-400 transition-colors">CRM</a></li>
                  <li><a href="#" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold text-white mb-6">Company</h4>
               <ul className="space-y-4 text-sm text-slate-400">
                  <li><a href="#" className="hover:text-indigo-400 transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
               </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            &copy; 2024 NexusAI Platform. All rights reserved.
         </div>
      </footer>

      {/* --- SALES CHAT WIDGET --- */}
      <LandingChatWidget />
      
      {/* Styles for Animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes wave {
            0%, 100% { height: 10%; }
            50% { height: 100%; }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-wave { animation: wave 1.2s ease-in-out infinite; }
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  );
};