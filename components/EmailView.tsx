import React, { useState, useEffect } from 'react';
import { Mail, Star, Trash2, Send, RefreshCw, Sparkles, X, Paperclip, MoreVertical } from 'lucide-react';
import { EmailMessage } from '../types';
import { generateEmailReply } from '../services/aiService';
import { getAllEmails } from '../services/dbService';

export const EmailView: React.FC = () => {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setEmails(getAllEmails());
  }, []);

  const handleGenerateReply = async () => {
    if (!selectedEmail) return;
    
    setIsGenerating(true);
    setReplyDraft("NexusAI is drafting your reply...");
    
    try {
      const response = await generateEmailReply(selectedEmail.content);
      setReplyDraft(response);
    } catch (error) {
      setReplyDraft("Failed to generate draft. Please check your AI Settings.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    // Height Calculation: 100vh - 4rem (TopBar) - 4rem (Padding) - 1rem (Buffer) = 9rem
    <div className="h-[calc(100vh-9rem)] min-h-[500px] flex gap-6 transition-all duration-300">
      {/* Email List */}
      <div className="w-1/3 min-w-[300px] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Mail size={18} /> Inbox <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{emails.filter(e => !e.read).length} New</span>
          </h2>
          <button className="text-slate-400 hover:text-indigo-600 transition-colors"><RefreshCw size={16} /></button>
        </div>
        <div className="overflow-y-auto flex-1">
          {emails.map((email) => (
            <div 
              key={email.id}
              onClick={() => {
                setSelectedEmail(email);
                setReplyDraft(''); // Reset draft on email change
              }}
              className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                selectedEmail?.id === email.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'
              } ${!email.read ? 'bg-slate-50' : ''}`}
            >
              <div className="flex justify-between mb-1">
                <span className={`font-medium ${!email.read ? 'text-slate-900' : 'text-slate-600'}`}>{email.sender}</span>
                <span className="text-xs text-slate-400">{email.date}</span>
              </div>
              <p className={`text-sm mb-1 ${!email.read ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>{email.subject}</p>
              <p className="text-xs text-slate-500 line-clamp-2">{email.preview}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Email Detail / Reading Pane */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
        {selectedEmail ? (
          <>
            {/* Header - Fixed */}
            <div className="p-6 border-b border-slate-200 shrink-0">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-xl font-bold text-slate-900 line-clamp-1">{selectedEmail.subject}</h1>
                <div className="flex gap-2 shrink-0">
                  <button className="p-2 text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors">
                    <Star size={20} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={20} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                  {selectedEmail.sender[0]}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{selectedEmail.sender}</p>
                  <p className="text-xs text-slate-500">to me</p>
                </div>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
              <div className="whitespace-pre-wrap text-slate-800 leading-relaxed font-sans max-w-none">
                {selectedEmail.content}
                {/* Mock footer to ensure content has some length */}
                <br /><br />
                <div className="border-t border-slate-100 pt-4 mt-4">
                    <p className="text-xs text-slate-400 italic">
                        Sent from NexusAI CRM integration.
                    </p>
                </div>
              </div>
            </div>

            {/* Reply Area - Fixed Bottom */}
            <div className="p-4 border-t border-slate-200 bg-white shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              {replyDraft ? (
                <div className="border border-indigo-200 rounded-lg overflow-hidden shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-2">
                   <div className="bg-indigo-50 px-4 py-2 flex justify-between items-center border-b border-indigo-100">
                      <span className="text-xs font-semibold text-indigo-800 flex items-center gap-1">
                        <Sparkles size={12} /> AI Draft
                      </span>
                      <button onClick={() => setReplyDraft('')} className="text-indigo-400 hover:text-indigo-700 transition-colors">
                        <X size={14} />
                      </button>
                   </div>
                   <textarea 
                    className="w-full p-4 h-32 focus:outline-none text-slate-700 text-sm resize-none bg-white"
                    value={replyDraft}
                    onChange={(e) => setReplyDraft(e.target.value)}
                   />
                   <div className="bg-slate-50 p-3 flex justify-between items-center border-t border-slate-100">
                      <div className="flex gap-2">
                          <button className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200 transition-colors"><Paperclip size={16} /></button>
                      </div>
                      <div className="flex gap-2">
                        <button 
                            onClick={handleGenerateReply}
                            className="text-xs font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1 px-3 py-1.5 rounded hover:bg-indigo-50 transition-colors"
                        >
                            <RefreshCw size={12} /> Regenerate
                        </button>
                        <button className="bg-indigo-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-indigo-700 flex items-center gap-2 shadow-sm transition-colors">
                            <Send size={14} /> Send Reply
                        </button>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="flex gap-4 items-center">
                  <div className="flex-1 relative">
                    <input 
                        onClick={() => setReplyDraft(' ')}
                        className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-xl text-slate-600 placeholder:text-slate-400 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm text-sm outline-none"
                        placeholder="Type a reply..."
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                        <Paperclip size={18} />
                    </button>
                  </div>
                  <button 
                    onClick={handleGenerateReply}
                    disabled={isGenerating}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium shadow-md hover:shadow-lg transition-all whitespace-nowrap disabled:opacity-70 disabled:shadow-none"
                  >
                    {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    {isGenerating ? 'Drafting...' : 'AI Reply'}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/30">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Mail size={32} className="text-slate-300" />
            </div>
            <p className="text-lg font-medium text-slate-500">Select an email to view</p>
            <p className="text-sm max-w-xs mt-2">NexusAI can read, summarize, and draft replies for you automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
};