import React, { useState } from 'react';
import { Bug, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const ReportBugView: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    severity: 'low',
    description: '',
    steps: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to a backend or issue tracker
    console.log("Bug Report Submitted:", formData);
    setSubmitted(true);
    // Reset after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ title: '', severity: 'low', description: '', steps: '' });
    }, 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-red-100 text-red-600 rounded-xl">
          <Bug size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Report a Bug</h1>
          <p className="text-slate-500">Found an issue? Let us know so we can fix it.</p>
        </div>
      </div>

      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-in zoom-in-95">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Report Submitted!</h3>
          <p className="text-slate-600">Thank you for helping us improve NexusAI. Our team has been notified.</p>
          <button 
            onClick={() => setSubmitted(false)}
            className="mt-6 text-indigo-600 font-medium hover:text-indigo-700 hover:underline"
          >
            Submit another report
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center gap-2 text-slate-700">
             <AlertTriangle size={18} />
             <span className="text-sm font-medium">Please provide as much detail as possible.</span>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Issue Title
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Email automation failed to draft reply"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Severity
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({...formData, severity: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                >
                  <option value="low">Low - Minor annoyance</option>
                  <option value="medium">Medium - Feature broken</option>
                  <option value="high">High - System crash</option>
                  <option value="critical">Critical - Data loss</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe what happened..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Steps to Reproduce (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="1. Go to CRM&#10;2. Click on..."
                value={formData.steps}
                onChange={(e) => setFormData({...formData, steps: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none font-mono text-sm"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
              >
                <Send size={18} />
                Submit Report
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};