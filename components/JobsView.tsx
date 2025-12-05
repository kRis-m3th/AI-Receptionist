import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Truck, CheckCircle2, Clock, Plus, Search, MessageSquare, Mail, User, X, AlertCircle, ArrowRight } from 'lucide-react';
import { Job, Worker, Customer } from '../types';
import { getAllJobs, getAllWorkers, getAllCustomers, addJob, updateJob, generateId } from '../services/dbService';

export const JobsView: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newJob, setNewJob] = useState<Partial<Job>>({
        status: 'Pending',
        priority: 'Medium',
        type: 'Installation',
        date: new Date().toISOString().split('T')[0]
    });
    const [dispatchMethod, setDispatchMethod] = useState<'sms' | 'email' | 'none'>('sms');

    useEffect(() => {
        const loadData = () => {
            setJobs(getAllJobs());
            setWorkers(getAllWorkers());
            setCustomers(getAllCustomers());
        };
        loadData();
    }, []);

    const showNotification = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleCreateJob = (e: React.FormEvent) => {
        e.preventDefault();
        
        const selectedCustomer = customers.find(c => c.id === newJob.customerId);
        
        const job: Job = {
            id: generateId(),
            customerId: newJob.customerId || '',
            workerId: newJob.workerId,
            title: newJob.title || 'Service Call',
            description: newJob.description || '',
            type: newJob.type as any,
            status: newJob.workerId ? 'Dispatched' : 'Pending',
            date: newJob.date || new Date().toISOString().split('T')[0],
            location: selectedCustomer?.address ? `${selectedCustomer.address.street}, ${selectedCustomer.address.city}` : 'Remote',
            priority: newJob.priority as any
        };

        addJob(job);
        setJobs(getAllJobs());

        if (newJob.workerId && dispatchMethod !== 'none') {
            const worker = workers.find(w => w.id === newJob.workerId);
            if (worker) {
                const method = dispatchMethod === 'sms' ? 'SMS' : 'Email';
                const contact = dispatchMethod === 'sms' ? worker.phone : worker.email;
                showNotification(`Job created & dispatched via ${method} to ${contact}`);
            }
        } else {
            showNotification('Job created successfully.');
        }
        
        setIsModalOpen(false);
        setNewJob({ status: 'Pending', priority: 'Medium', type: 'Installation', date: new Date().toISOString().split('T')[0] });
    };

    const handleStatusUpdate = (jobId: string, status: Job['status']) => {
        const job = jobs.find(j => j.id === jobId);
        if (job) {
            updateJob({ ...job, status });
            setJobs(getAllJobs());
        }
    };

    // Filter jobs
    const filteredJobs = jobs.filter(j => 
        j.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Pending': return 'bg-slate-100 text-slate-600 border-slate-200';
            case 'Dispatched': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'In Progress': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'Completed': return 'bg-green-50 text-green-600 border-green-200';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch(priority) {
            case 'High': return 'text-red-600 bg-red-50';
            case 'Medium': return 'text-amber-600 bg-amber-50';
            case 'Low': return 'text-green-600 bg-green-50';
            default: return 'text-slate-600';
        }
    };

    // Kanban Columns
    const columns: {title: string, status: Job['status']}[] = [
        { title: 'Unassigned / Pending', status: 'Pending' },
        { title: 'Dispatched', status: 'Dispatched' },
        { title: 'In Progress', status: 'In Progress' },
        { title: 'Completed', status: 'Completed' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 relative h-full">
            {notification && (
                <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl animate-in fade-in slide-in-from-right-4 flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-green-400" />
                    {notification}
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Job Allocation & Dispatch</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage field operations and assign tasks to workers.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors flex items-center gap-2"
                >
                    <Plus size={18} /> Create Job
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Truck size={24} /></div>
                    <div>
                        <p className="text-sm text-slate-500">Active Jobs</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{jobs.filter(j => j.status === 'Dispatched' || j.status === 'In Progress').length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><AlertCircle size={24} /></div>
                    <div>
                        <p className="text-sm text-slate-500">Unassigned</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{jobs.filter(j => j.status === 'Pending').length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg"><CheckCircle2 size={24} /></div>
                    <div>
                        <p className="text-sm text-slate-500">Completed Today</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{jobs.filter(j => j.status === 'Completed' && j.date === new Date().toISOString().split('T')[0]).length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg"><User size={24} /></div>
                    <div>
                        <p className="text-sm text-slate-500">Workers Active</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{workers.filter(w => w.status === 'On Job').length}/{workers.length}</p>
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex gap-6 overflow-x-auto pb-6 min-h-[500px]">
                {columns.map(col => (
                    <div key={col.status} className="flex-1 min-w-[300px] flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                             <h3 className="font-bold text-slate-700 dark:text-slate-200 uppercase text-xs tracking-wider flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${col.status === 'Pending' ? 'bg-slate-400' : col.status === 'Dispatched' ? 'bg-blue-500' : col.status === 'In Progress' ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                                {col.title}
                             </h3>
                             <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                                {filteredJobs.filter(j => j.status === col.status).length}
                             </span>
                        </div>

                        <div className="flex-1 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl p-2 space-y-3">
                            {filteredJobs.filter(j => j.status === col.status).map(job => {
                                const worker = workers.find(w => w.id === job.workerId);
                                const customer = customers.find(c => c.id === job.customerId);
                                
                                return (
                                    <div key={job.id} className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${getPriorityColor(job.priority)}`}>
                                                {job.priority}
                                            </span>
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Clock size={10} /> {job.date}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{job.title}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{job.description}</p>
                                        
                                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mb-3">
                                            <MapPin size={12} className="text-slate-400" />
                                            <span className="truncate">{job.location}</span>
                                        </div>

                                        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between">
                                            {worker ? (
                                                <div className="flex items-center gap-2">
                                                    <img src={worker.avatarUrl} alt={worker.name} className="w-6 h-6 rounded-full border border-slate-200" />
                                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{worker.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Unassigned</span>
                                            )}

                                            {/* Action Buttons */}
                                            {col.status === 'Pending' && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(job.id, 'Dispatched')}
                                                    className="p-1.5 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors"
                                                    title="Mark as Dispatched"
                                                >
                                                    <ArrowRight size={14} />
                                                </button>
                                            )}
                                            {col.status === 'Dispatched' && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(job.id, 'In Progress')}
                                                    className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                                    title="Start Job"
                                                >
                                                    <ArrowRight size={14} />
                                                </button>
                                            )}
                                            {col.status === 'In Progress' && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(job.id, 'Completed')}
                                                    className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                                                    title="Complete Job"
                                                >
                                                    <CheckCircle2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* CREATE JOB MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create New Job</h2>
                            <button onClick={() => setIsModalOpen(false)}><X className="text-slate-400" size={24} /></button>
                        </div>
                        <form onSubmit={handleCreateJob} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                                <input 
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    placeholder="e.g. Server Maintenance"
                                    value={newJob.title}
                                    onChange={e => setNewJob({...newJob, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Customer</label>
                                <select 
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    value={newJob.customerId || ''}
                                    onChange={e => setNewJob({...newJob, customerId: e.target.value})}
                                >
                                    <option value="">Select Customer...</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                                    <select 
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        value={newJob.type}
                                        onChange={e => setNewJob({...newJob, type: e.target.value as any})}
                                    >
                                        <option value="Installation">Installation</option>
                                        <option value="Repair">Repair</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Consultation">Consultation</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                                    <select 
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        value={newJob.priority}
                                        onChange={e => setNewJob({...newJob, priority: e.target.value as any})}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description / Instructions</label>
                                <textarea 
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    rows={3}
                                    value={newJob.description}
                                    onChange={e => setNewJob({...newJob, description: e.target.value})}
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Allocation & Dispatch</h3>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assign Worker</label>
                                    <select 
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        value={newJob.workerId || ''}
                                        onChange={e => setNewJob({...newJob, workerId: e.target.value})}
                                    >
                                        <option value="">Unassigned (Pending)</option>
                                        {workers.map(w => (
                                            <option key={w.id} value={w.id}>{w.name} - {w.role}</option>
                                        ))}
                                    </select>
                                </div>

                                {newJob.workerId && (
                                    <div className="mt-4 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                        <p className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400 mb-2">Notify Worker via:</p>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="dispatch" 
                                                    checked={dispatchMethod === 'sms'}
                                                    onChange={() => setDispatchMethod('sms')}
                                                    className="text-indigo-600 focus:ring-indigo-500" 
                                                />
                                                <span className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1"><MessageSquare size={14}/> SMS</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="dispatch" 
                                                    checked={dispatchMethod === 'email'}
                                                    onChange={() => setDispatchMethod('email')}
                                                    className="text-indigo-600 focus:ring-indigo-500" 
                                                />
                                                <span className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1"><Mail size={14}/> Email</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="dispatch" 
                                                    checked={dispatchMethod === 'none'}
                                                    onChange={() => setDispatchMethod('none')}
                                                    className="text-indigo-600 focus:ring-indigo-500" 
                                                />
                                                <span className="text-sm text-slate-700 dark:text-slate-300">Don't Notify</span>
                                            </label>
                                        </div>
                                        {dispatchMethod !== 'none' && (
                                            <div className="mt-2 text-xs text-slate-500 italic">
                                                Preview: "New Job: {newJob.title} at {newJob.date}. Details sent to your app."
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700">Save & Dispatch</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};