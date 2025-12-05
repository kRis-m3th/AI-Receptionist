import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Video, Phone, Plus, User, CheckCircle2, XCircle, MoreHorizontal, Filter, Search, X, ChevronLeft, ChevronRight, Maximize2, Minimize2, Mail } from 'lucide-react';
import { Appointment, Customer } from '../types';
import { getAllAppointments, addAppointment, updateAppointment, getAllCustomers, generateId, deleteAppointment, sendOutboundEmail } from '../services/dbService';

export const AppointmentsView: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filter, setFilter] = useState<'all' | 'Scheduled' | 'Completed' | 'Cancelled'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAppt, setNewAppt] = useState<Partial<Appointment>>({
        type: 'Video',
        duration: 30,
        status: 'Scheduled',
        date: new Date().toISOString().split('T')[0],
        sendReminder: true // Default to true
    });
    
    // Notification for sent email
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        // Poll for new appointments (e.g. from AI)
        const load = () => {
            setAppointments(getAllAppointments());
            setCustomers(getAllCustomers());
        };
        load();
        const interval = setInterval(load, 3000);
        return () => clearInterval(interval);
    }, []);

    const showNotification = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const customer = customers.find(c => c.id === newAppt.customerId);
        
        const appointment: Appointment = {
            id: generateId(),
            customerId: newAppt.customerId || '',
            customerName: customer ? customer.name : 'Unknown',
            title: newAppt.title || 'Meeting',
            date: newAppt.date || new Date().toISOString().split('T')[0],
            time: newAppt.time || '09:00',
            duration: newAppt.duration || 30,
            type: newAppt.type as any,
            status: 'Scheduled',
            notes: newAppt.notes,
            sendReminder: newAppt.sendReminder
        };
        
        const updated = addAppointment(appointment);
        setAppointments(updated);

        // Send Email Reminder if enabled
        if (newAppt.sendReminder && customer && customer.email) {
            const subject = `Appointment Confirmation: ${appointment.title}`;
            const content = `Hi ${customer.name},\n\nThis is a confirmation for your upcoming appointment.\n\nType: ${appointment.type}\nDate: ${appointment.date}\nTime: ${appointment.time}\nDuration: ${appointment.duration} mins\n\nPlease let us know if you need to reschedule.\n\nBest,\nNexusAI Team`;
            
            sendOutboundEmail(customer.email, customer.name, subject, content);
            showNotification(`Appointment saved & reminder sent to ${customer.email}`);
        } else {
            showNotification("Appointment saved.");
        }

        setIsModalOpen(false);
        setNewAppt({ type: 'Video', duration: 30, status: 'Scheduled', date: new Date().toISOString().split('T')[0], sendReminder: true });
    };

    const handleStatusChange = (id: string, newStatus: Appointment['status']) => {
        const appt = appointments.find(a => a.id === id);
        if (appt) {
            const updated = updateAppointment({ ...appt, status: newStatus });
            setAppointments(updated);
        }
    };

    const handleDelete = (id: string) => {
        if(window.confirm('Are you sure you want to cancel and remove this appointment?')) {
            const updated = deleteAppointment(id);
            setAppointments(updated);
        }
    }

    const filteredAppointments = appointments.filter(a => {
        const matchesFilter = filter === 'all' || a.status === filter;
        const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              a.customerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = selectedDate ? a.date === selectedDate : true;
        
        return matchesFilter && matchesSearch && matchesDate;
    }).sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Scheduled': return 'bg-indigo-100 text-indigo-700';
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            case 'No Show': return 'bg-amber-100 text-amber-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getTypeIcon = (type: string) => {
        switch(type) {
            case 'Video': return <Video size={16} />;
            case 'Phone': return <Phone size={16} />;
            case 'In-Person': return <MapPin size={16} />;
            default: return <Clock size={16} />;
        }
    };

    // --- CALENDAR LOGIC ---
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
        return { days, firstDay };
    };

    const { days: totalDays, firstDay: startDayIndex } = getDaysInMonth(currentDate);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const changeMonth = (delta: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
        setSelectedDate(null);
    };

    const handleDateClick = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (selectedDate === dateStr) {
            setSelectedDate(null); // Deselect
        } else {
            setSelectedDate(dateStr);
        }
    };

    const renderCalendarGrid = () => {
        const days = [];
        // Empty slots for days before start of month
        for (let i = 0; i < startDayIndex; i++) {
            days.push(<div key={`empty-${i}`} className="h-full bg-slate-50/50 dark:bg-slate-800/30 border-r border-b border-slate-100 dark:border-slate-800"></div>);
        }

        // Days of month
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const isSelected = selectedDate === dateStr;
            const dayAppts = appointments.filter(a => a.date === dateStr);
            const hasAppts = dayAppts.length > 0;

            days.push(
                <div 
                    key={day} 
                    onClick={() => handleDateClick(day)}
                    className={`
                        relative border-r border-b border-slate-100 dark:border-slate-800 p-2 cursor-pointer transition-colors group
                        ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-inset ring-2 ring-indigo-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900'}
                        ${isCalendarExpanded ? 'min-h-[100px]' : 'h-24'}
                    `}
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                            isToday ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                            {day}
                        </span>
                        {hasAppts && !isCalendarExpanded && (
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                        )}
                    </div>
                    
                    {/* Expanded View Events */}
                    <div className="mt-2 space-y-1">
                        {dayAppts.slice(0, isCalendarExpanded ? 5 : 2).map((appt) => (
                            <div 
                                key={appt.id} 
                                className={`text-[10px] px-1.5 py-0.5 rounded truncate border ${
                                    appt.status === 'Scheduled' 
                                    ? 'bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300' 
                                    : 'bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-800 dark:border-slate-700'
                                }`}
                            >
                                {appt.time} {appt.customerName.split(' ')[0]}
                            </div>
                        ))}
                        {dayAppts.length > (isCalendarExpanded ? 5 : 2) && (
                            <div className="text-[10px] text-slate-400 pl-1">
                                +{dayAppts.length - (isCalendarExpanded ? 5 : 2)} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return days;
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 relative">
            
            {/* Notification Toast */}
            {notification && (
                <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl animate-in fade-in slide-in-from-right-4 flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-green-400" />
                    {notification}
                </div>
            )}

            {/* --- HEADER --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Appointments</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your schedule and customer meetings.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors flex items-center gap-2"
                >
                    <Plus size={18} /> New Appointment
                </button>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
                
                {/* --- CALENDAR WIDGET --- */}
                <div className={`transition-all duration-500 ease-in-out ${isCalendarExpanded ? 'xl:w-full' : 'xl:w-2/3'}`}>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
                        {/* Calendar Header */}
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-4">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <CalendarIcon size={20} className="text-indigo-600" />
                                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </h2>
                                <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-l-lg border-r border-slate-200 dark:border-slate-700">
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-r-lg">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
                                className="text-slate-400 hover:text-indigo-600 p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title={isCalendarExpanded ? "Collapse View" : "Expand View"}
                            >
                                {isCalendarExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="flex-1 min-h-[400px] flex flex-col">
                            {/* Days Header */}
                            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            {/* Days Grid */}
                            <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                                {renderCalendarGrid()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SIDE LIST / AGENDA --- */}
                <div className={`flex flex-col gap-6 ${isCalendarExpanded ? 'hidden' : 'xl:w-1/3'}`}>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Upcoming</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                {appointments.filter(a => a.status === 'Scheduled').length}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Today</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                {appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length}
                            </p>
                        </div>
                    </div>

                    {/* Filter & List */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 flex flex-col">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-slate-900 dark:text-white">
                                    {selectedDate ? `Agenda: ${selectedDate}` : 'All Appointments'}
                                </h3>
                                {selectedDate && (
                                    <button onClick={() => setSelectedDate(null)} className="text-xs text-indigo-600 hover:underline">Clear Filter</button>
                                )}
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input 
                                    type="text" 
                                    placeholder="Quick search..." 
                                    className="w-full pl-9 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 max-h-[500px]">
                            {filteredAppointments.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 text-sm">
                                    No appointments found for this period.
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredAppointments.map((appt) => (
                                        <div key={appt.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{appt.title}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${getStatusColor(appt.status)}`}>
                                                    {appt.status}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-2">
                                                <span className="flex items-center gap-1"><CalendarIcon size={10} /> {appt.date}</span>
                                                <span className="flex items-center gap-1"><Clock size={10} /> {appt.time}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                                    <User size={10} /> {appt.customerName}
                                                </span>
                                                {appt.status === 'Scheduled' && (
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => handleStatusChange(appt.id, 'Completed')}
                                                            className="p-1 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded"
                                                            title="Complete"
                                                        >
                                                            <CheckCircle2 size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleStatusChange(appt.id, 'Cancelled')}
                                                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                            title="Cancel"
                                                        >
                                                            <XCircle size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- NEW APPOINTMENT MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Schedule Appointment</h2>
                            <button onClick={() => setIsModalOpen(false)}><X className="text-slate-400" size={24} /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                                <input 
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    placeholder="e.g. Initial Consultation"
                                    value={newAppt.title || ''}
                                    onChange={e => setNewAppt({...newAppt, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Customer</label>
                                <select 
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    value={newAppt.customerId || ''}
                                    onChange={e => setNewAppt({...newAppt, customerId: e.target.value})}
                                >
                                    <option value="">Select a customer...</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                                    <input 
                                        required
                                        type="date"
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        value={newAppt.date || ''}
                                        onChange={e => setNewAppt({...newAppt, date: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time</label>
                                    <input 
                                        required
                                        type="time"
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        value={newAppt.time || ''}
                                        onChange={e => setNewAppt({...newAppt, time: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                                    <select 
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        value={newAppt.type}
                                        onChange={e => setNewAppt({...newAppt, type: e.target.value as any})}
                                    >
                                        <option value="Video">Video Call</option>
                                        <option value="Phone">Phone Call</option>
                                        <option value="In-Person">In-Person</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duration (mins)</label>
                                    <select 
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        value={newAppt.duration}
                                        onChange={e => setNewAppt({...newAppt, duration: Number(e.target.value)})}
                                    >
                                        <option value="15">15 min</option>
                                        <option value="30">30 min</option>
                                        <option value="45">45 min</option>
                                        <option value="60">1 hour</option>
                                        <option value="90">1.5 hours</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                                <textarea 
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    rows={3}
                                    placeholder="Agenda or details..."
                                    value={newAppt.notes || ''}
                                    onChange={e => setNewAppt({...newAppt, notes: e.target.value})}
                                />
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 flex items-center gap-3 border border-slate-100 dark:border-slate-700">
                                <input 
                                    type="checkbox"
                                    id="sendReminder"
                                    checked={newAppt.sendReminder}
                                    onChange={(e) => setNewAppt({...newAppt, sendReminder: e.target.checked})}
                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="sendReminder" className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer select-none">
                                    <Mail size={16} className="text-slate-400" />
                                    Send Email Reminder to Customer
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700">Schedule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};