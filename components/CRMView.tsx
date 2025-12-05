import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, MoreHorizontal, Phone, Mail, Tag, ArrowLeft, Plus, Clock, MapPin, CreditCard, Upload, MessageSquare, BookOpen } from 'lucide-react';
import { Customer, CallLog, CustomerStatus, EmailMessage } from '../types';
import { getAllCustomers, getCallsByCustomerId, addCallLog, generateId, bulkAddCustomers, getEmailsByCustomerEmail } from '../services/dbService';
import { KnowledgeBaseView } from './KnowledgeBaseView';

export const CRMView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const [customerCalls, setCustomerCalls] = useState<CallLog[]>([]);
  const [customerEmails, setCustomerEmails] = useState<EmailMessage[]>([]);
  
  // State for adding a new call log
  const [isLoggingCall, setIsLoggingCall] = useState(false);
  const [newCallSummary, setNewCallSummary] = useState('');

  // Customer Detail Tabs
  const [activeDetailTab, setActiveDetailTab] = useState<'timeline' | 'documents'>('timeline');

  // Import functionality
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string>('');

  useEffect(() => {
    // Load customers from "Database"
    setCustomers(getAllCustomers());
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      setCustomerCalls(getCallsByCustomerId(selectedCustomer.id));
      setCustomerEmails(getEmailsByCustomerEmail(selectedCustomer.email));
      setActiveDetailTab('timeline'); // Reset tab when switching customers
    }
  }, [selectedCustomer]);

  const handleLogCall = () => {
    if (!selectedCustomer || !newCallSummary.trim()) return;

    const newCall: CallLog = {
      id: generateId(),
      customerId: selectedCustomer.id,
      caller: selectedCustomer.phone,
      duration: '0m 00s', // Placeholder for manual logs
      date: 'Just now',
      status: 'Outbound',
      summary: newCallSummary
    };

    addCallLog(newCall);
    setCustomerCalls(getCallsByCustomerId(selectedCustomer.id));
    setNewCallSummary('');
    setIsLoggingCall(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const newCustomers: Customer[] = [];

    // Basic CSV parser
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        const data: any = {};
        
        headers.forEach((header, index) => {
            data[header] = values[index] || '';
        });

        if (data['name'] || data['email']) {
            newCustomers.push({
                id: generateId(),
                name: data['name'] || data['full name'] || 'Unknown',
                email: data['email'] || '',
                phone: data['phone'] || data['mobile'] || '',
                company: data['company'] || data['organization'] || '',
                status: CustomerStatus.LEAD,
                lastContact: 'Never',
                tags: ['Imported']
            });
        }
    }
    return newCustomers;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result as string;
            const importedCustomers = parseCSV(text);
            
            if (importedCustomers.length > 0) {
                const updatedList = bulkAddCustomers(importedCustomers);
                setCustomers(updatedList);
                setImportStatus(`Successfully imported ${importedCustomers.length} contacts.`);
                setTimeout(() => setImportStatus(''), 3000);
            } else {
                setImportStatus('No valid contacts found in CSV.');
            }
        } catch (error) {
            console.error(error);
            setImportStatus('Error parsing CSV file.');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: CustomerStatus) => {
    switch (status) {
      case CustomerStatus.ACTIVE: return 'bg-green-100 text-green-700';
      case CustomerStatus.LEAD: return 'bg-blue-100 text-blue-700';
      case CustomerStatus.CHURNED: return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  // --- DETAIL VIEW ---
  if (selectedCustomer) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedCustomer(null)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Customer Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Profile Info & Payment */}
          <div className="lg:col-span-1 space-y-6">
            {/* Core Info */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-col items-center text-center mb-6">
                 <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-2xl mb-3">
                   {selectedCustomer.name.charAt(0)}
                 </div>
                 <h2 className="text-xl font-bold text-slate-900">{selectedCustomer.name}</h2>
                 <p className="text-slate-500">{selectedCustomer.company}</p>
                 <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedCustomer.status)}`}>
                    {selectedCustomer.status}
                 </div>
              </div>
              
              <div className="space-y-4 border-t border-slate-100 pt-6">
                 <div className="flex items-center gap-3 text-slate-600">
                    <Mail size={18} className="text-slate-400" />
                    <a href={`mailto:${selectedCustomer.email}`} className="text-sm hover:text-indigo-600 transition-colors">{selectedCustomer.email}</a>
                 </div>
                 <div className="flex items-center gap-3 text-slate-600">
                    <Phone size={18} className="text-slate-400" />
                    <a href={`tel:${selectedCustomer.phone}`} className="text-sm hover:text-indigo-600 transition-colors">{selectedCustomer.phone}</a>
                 </div>
                 <div className="flex items-start gap-3 text-slate-600">
                    <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      {selectedCustomer.address ? (
                        <>
                          <p>{selectedCustomer.address.street}</p>
                          <p>{selectedCustomer.address.city}, {selectedCustomer.address.state} {selectedCustomer.address.zipCode}</p>
                          <p>{selectedCustomer.address.country}</p>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">No address on file</span>
                      )}
                    </div>
                 </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                 <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tags</h3>
                 <div className="flex flex-wrap gap-2">
                    {selectedCustomer.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                 </div>
              </div>
            </div>

            {/* Payment Info (Mock Encrypted View) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={18} className="text-slate-500" />
                <h3 className="font-bold text-slate-900">Payment Method</h3>
              </div>
              {selectedCustomer.paymentDetails ? (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                   <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-slate-700">{selectedCustomer.paymentDetails.provider}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Active</span>
                   </div>
                   <div className="flex items-center gap-2 text-slate-600 font-mono text-sm">
                      <span>•••• •••• ••••</span>
                      <span>{selectedCustomer.paymentDetails.last4}</span>
                   </div>
                   <div className="mt-2 text-xs text-slate-400">
                      Expires: {selectedCustomer.paymentDetails.expiryDate}
                   </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No payment method linked.</p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Unified Interaction History */}
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                   <div className="flex gap-4 text-sm font-medium">
                      <button 
                        onClick={() => setActiveDetailTab('timeline')}
                        className={`pb-4 -mb-4 px-1 border-b-2 transition-colors ${activeDetailTab === 'timeline' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
                      >
                          Timeline
                      </button>
                      <button 
                        onClick={() => setActiveDetailTab('documents')}
                        className={`pb-4 -mb-4 px-1 border-b-2 transition-colors ${activeDetailTab === 'documents' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
                      >
                          Documents / Knowledge
                      </button>
                   </div>
                   {activeDetailTab === 'timeline' && (
                       <button 
                         onClick={() => setIsLoggingCall(!isLoggingCall)}
                         className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 flex items-center gap-1 transition-colors"
                       >
                         <Plus size={14} /> Log Interaction
                       </button>
                   )}
                </div>
                
                {activeDetailTab === 'documents' ? (
                    <div className="flex-1 p-6 overflow-y-auto">
                        <KnowledgeBaseView customerId={selectedCustomer.id} />
                    </div>
                ) : (
                    <>
                        {isLoggingCall && (
                          <div className="p-4 border-b border-indigo-100 bg-indigo-50 animate-in fade-in slide-in-from-top-2">
                            <textarea
                              value={newCallSummary}
                              onChange={(e) => setNewCallSummary(e.target.value)}
                              placeholder="Enter notes about this call or meeting..."
                              className="w-full p-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm mb-3"
                              rows={3}
                            />
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setIsLoggingCall(false)} className="px-3 py-1.5 text-slate-600 text-sm hover:text-slate-800">Cancel</button>
                              <button onClick={handleLogCall} className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 font-medium">Save Log</button>
                            </div>
                          </div>
                        )}

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                           {/* Combine Calls and Emails for a basic timeline view */}
                           {customerCalls.length === 0 && customerEmails.length === 0 ? (
                             <div className="flex flex-col items-center justify-center h-full text-slate-400">
                               <MessageSquare size={32} className="mb-2 opacity-50" />
                               <p>No interaction history yet.</p>
                             </div>
                           ) : (
                             <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
                                {/* Map Emails */}
                                {customerEmails.map((email) => (
                                   <div key={email.id} className="relative pl-8">
                                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                      </div>
                                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 hover:shadow-sm transition-shadow">
                                         <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1">
                                              <Mail size={10} /> Email
                                            </span>
                                            <span className="text-xs text-slate-400">{email.date}</span>
                                         </div>
                                         <p className="font-medium text-slate-900 text-sm">{email.subject}</p>
                                         <p className="text-xs text-slate-500 mt-1 line-clamp-2">{email.preview}</p>
                                      </div>
                                   </div>
                                ))}

                                {/* Map Calls */}
                                {customerCalls.map((call) => (
                                   <div key={call.id} className="relative pl-8">
                                      <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                                        call.status === 'Missed' ? 'bg-red-100' : 'bg-indigo-100'
                                      }`}>
                                         <div className={`w-1.5 h-1.5 rounded-full ${
                                            call.status === 'Missed' ? 'bg-red-500' : 'bg-indigo-500'
                                         }`}></div>
                                      </div>
                                      <div className="bg-white rounded-lg p-3 border border-slate-200 hover:shadow-sm transition-shadow">
                                         <div className="flex justify-between items-start mb-1">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                                              call.status === 'Missed' ? 'bg-red-50 text-red-700' : 'bg-indigo-50 text-indigo-700'
                                            }`}>
                                              <Phone size={10} /> {call.status} Call
                                            </span>
                                            <span className="text-xs text-slate-400">{call.date}</span>
                                         </div>
                                         <p className="text-slate-800 text-sm mt-1">{call.summary}</p>
                                         {call.duration !== '0m 00s' && (
                                           <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                                             <Clock size={10} /> {call.duration}
                                           </div>
                                         )}
                                      </div>
                                   </div>
                                ))}
                             </div>
                           )}
                        </div>
                    </>
                )}
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- LIST VIEW (Default) ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Customer Database</h1>
        <div className="flex gap-2">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".csv" 
                className="hidden" 
            />
            <button 
                onClick={handleImportClick}
                className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 font-medium shadow-sm transition-colors flex items-center gap-2"
            >
                <Upload size={18} />
                Import CSV
            </button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors flex items-center gap-2">
                <Plus size={18} />
                Add Customer
            </button>
        </div>
      </div>
      
      {importStatus && (
          <div className={`px-4 py-2 rounded-lg text-sm font-medium ${importStatus.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} animate-in fade-in slide-in-from-top-2`}>
              {importStatus}
          </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search customers or companies..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 text-slate-600 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium">
            <Filter size={16} />
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                <th className="p-4 border-b border-slate-200">Name</th>
                <th className="p-4 border-b border-slate-200">Contact</th>
                <th className="p-4 border-b border-slate-200">Status</th>
                <th className="p-4 border-b border-slate-200">Tags</th>
                <th className="p-4 border-b border-slate-200 text-right">Last Contact</th>
                <th className="p-4 border-b border-slate-200 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr 
                  key={customer.id} 
                  onClick={() => setSelectedCustomer(customer)}
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <td className="p-4 border-b border-slate-100">
                    <div>
                      <p className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{customer.name}</p>
                      <p className="text-sm text-slate-500">{customer.company}</p>
                    </div>
                  </td>
                  <td className="p-4 border-b border-slate-100">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail size={14} className="text-slate-400" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone size={14} className="text-slate-400" />
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 border-b border-slate-100">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(customer.status)}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="p-4 border-b border-slate-100">
                    <div className="flex gap-1 flex-wrap">
                      {customer.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">
                          <Tag size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 border-b border-slate-100 text-right text-sm text-slate-500">
                    {customer.lastContact}
                  </td>
                  <td className="p-4 border-b border-slate-100 text-right">
                    <button className="text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-indigo-50 transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCustomers.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No customers found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};