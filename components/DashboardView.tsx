import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Users, Phone, Mail, DollarSign, CheckCircle2, Circle, Bell, Plus, Trash2, ArrowRight, User, AlertCircle, MessageSquare } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_DATA } from '../constants';
import { StatCardProps, Task, CallLog, Customer } from '../types';
import { getAllTasks, addTask, updateTask, deleteTask, generateId, getAllCalls, getAllCustomers } from '../services/dbService';

const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${trend === 'up' ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
        {icon}
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2">
      {trend === 'up' ? <ArrowUpRight size={16} className="text-green-600 dark:text-green-400" /> : <ArrowDownRight size={16} className="text-red-600 dark:text-red-400" />}
      <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{change}</span>
      <span className="text-sm text-slate-400 dark:text-slate-500">vs last month</span>
    </div>
  </div>
);

// --- Task List Component ---
const TaskListWidget: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskText, setNewTaskText] = useState('');

    useEffect(() => {
        loadTasks();
        // Set up a small poller to refresh if tasks change elsewhere (e.g. via notification clear)
        const interval = setInterval(loadTasks, 2000);
        return () => clearInterval(interval);
    }, []);

    const loadTasks = () => {
        setTasks(getAllTasks());
    };

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskText.trim()) return;

        const newTask: Task = {
            id: generateId(),
            text: newTaskText,
            completed: false,
            reminder: false
        };
        const updated = addTask(newTask);
        setTasks(updated);
        setNewTaskText('');
    };

    const toggleComplete = (task: Task) => {
        const updated = updateTask({ ...task, completed: !task.completed });
        setTasks(updated);
    };

    const toggleReminder = (task: Task) => {
        const updated = updateTask({ ...task, reminder: !task.reminder });
        setTasks(updated);
    };

    const handleDelete = (id: string) => {
        const updated = deleteTask(id);
        setTasks(updated);
    };

    // Sort: Active first, then completed. Active tasks sorted by reminder status.
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.completed === b.completed) return (b.reminder ? 1 : 0) - (a.reminder ? 1 : 0);
        return (a.completed ? 1 : 0) - (b.completed ? 1 : 0);
    });

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors flex flex-col h-full min-h-[350px]">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                <span>My Tasks</span>
                <span className="text-xs font-normal bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">
                    {tasks.filter(t => !t.completed).length} Pending
                </span>
            </h2>

            <div className="flex-1 overflow-y-auto space-y-2 mb-4 max-h-[250px] pr-2 custom-scrollbar">
                {sortedTasks.length === 0 && (
                    <div className="text-center text-slate-400 py-8 text-sm">No tasks yet. Add one below!</div>
                )}
                {sortedTasks.map((task) => (
                    <div key={task.id} className="group flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <button 
                            onClick={() => toggleComplete(task)}
                            className={`flex-shrink-0 ${task.completed ? 'text-green-500' : 'text-slate-300 hover:text-indigo-500'}`}
                        >
                            {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>
                        
                        <span className={`flex-1 text-sm ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                            {task.text}
                        </span>

                        <button 
                            onClick={() => toggleReminder(task)}
                            title={task.reminder ? "Remove Reminder" : "Set Reminder (Shows in Top Bar)"}
                            className={`p-1.5 rounded-full transition-colors ${
                                task.reminder 
                                ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' 
                                : 'text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-500'
                            }`}
                        >
                            <Bell size={14} fill={task.reminder ? "currentColor" : "none"} />
                        </button>
                        
                        <button 
                            onClick={() => handleDelete(task.id)}
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>

            <form onSubmit={handleAddTask} className="mt-auto relative">
                <input 
                    type="text" 
                    placeholder="Add a new task..." 
                    className="w-full pl-4 pr-10 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                />
                <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 p-1 rounded-md transition-colors"
                >
                    <Plus size={16} />
                </button>
            </form>
        </div>
    );
};

// --- Full Width AI Action Center ---
const ActionCenter: React.FC = () => {
    const [calls, setCalls] = useState<CallLog[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);

    useEffect(() => {
        // Load calls and customers to link data
        const load = () => {
            setCalls(getAllCalls());
            setCustomers(getAllCustomers());
        };
        load();
        // Poll for updates
        const interval = setInterval(load, 5000);
        return () => clearInterval(interval);
    }, []);

    const getCustomerName = (id?: string) => {
        if (!id) return null;
        return customers.find(c => c.id === id);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Phone size={20} className="text-indigo-600" /> 
                        Recent AI Interactions & Action Items
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Review recent calls, unanswered queries, and suggested follow-ups.
                    </p>
                </div>
                <button className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1">
                    View All Logs <ArrowRight size={16} />
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800/30 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                        <tr>
                            <th className="p-4 border-b border-slate-200 dark:border-slate-800 w-48">Caller / Customer</th>
                            <th className="p-4 border-b border-slate-200 dark:border-slate-800 w-32">Status</th>
                            <th className="p-4 border-b border-slate-200 dark:border-slate-800">Inquiry / Query</th>
                            <th className="p-4 border-b border-slate-200 dark:border-slate-800">AI Action / Summary</th>
                            <th className="p-4 border-b border-slate-200 dark:border-slate-800 w-64">Required Follow-up</th>
                            <th className="p-4 border-b border-slate-200 dark:border-slate-800 w-32 text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {calls.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-500">
                                    No recent interactions found.
                                </td>
                            </tr>
                        ) : (
                            calls.slice(0, 5).map(call => {
                                const customer = getCustomerName(call.customerId);
                                return (
                                    <tr key={call.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="p-4 align-top">
                                            {customer ? (
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1">
                                                        <User size={12} className="text-indigo-500" /> {customer.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{customer.company}</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{call.caller}</p>
                                                    <p className="text-xs text-slate-400 italic">Unknown Caller</p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 align-top">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                call.status === 'Missed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                call.status === 'Voicemail' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            }`}>
                                                {call.status}
                                            </span>
                                        </td>
                                        <td className="p-4 align-top">
                                            {call.query ? (
                                                <div className="flex items-start gap-2">
                                                    <div className="mt-0.5 text-slate-400"><MessageSquare size={14} /></div>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{call.query}"</p>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 align-top">
                                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{call.summary}</p>
                                        </td>
                                        <td className="p-4 align-top">
                                            {call.followUpAction ? (
                                                <div className="flex items-start gap-2 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded border border-indigo-100 dark:border-indigo-900/30">
                                                    <AlertCircle size={14} className="text-indigo-600 mt-0.5 shrink-0" />
                                                    <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">{call.followUpAction}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 size={12} /> Resolved</span>
                                            )}
                                        </td>
                                        <td className="p-4 align-top text-right text-xs text-slate-500 font-mono">
                                            {call.date}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            {calls.length > 5 && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                    Showing 5 most recent interactions
                </div>
            )}
        </div>
    );
};

export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Export Report</button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">New Campaign</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Calls Handled" value="1,284" change="+12.5%" trend="up" icon={<Phone size={20} />} />
        <StatCard title="Emails Automated" value="8,492" change="+23.1%" trend="up" icon={<Mail size={20} />} />
        <StatCard title="Active Leads" value="432" change="-2.4%" trend="down" icon={<Users size={20} />} />
        <StatCard title="Est. Revenue Saved" value="$14.2k" change="+8.2%" trend="up" icon={<DollarSign size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Interaction Volume</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  itemStyle={{ color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="calls" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCalls)" />
                <Area type="monotone" dataKey="emails" stroke="#94a3b8" strokeWidth={3} fillOpacity={0} fill="transparent" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: To-Do List */}
        <div className="flex flex-col h-full">
            <TaskListWidget />
        </div>
      </div>

      {/* Full Width Action Center */}
      <div className="w-full">
         <ActionCenter />
      </div>
    </div>
  );
};