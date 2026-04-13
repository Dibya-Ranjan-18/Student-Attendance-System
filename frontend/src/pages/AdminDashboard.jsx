import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import {
    LayoutDashboard, Users, UserPlus, GraduationCap, MapPin, Map,
    LogOut, Search, Trash2, Check, X, FileDown, TrendingUp,
    Users2, ArrowUpRight, ArrowDownRight, Filter, Calendar,
    ShieldAlert, ShieldCheck, Menu, Library, Pencil, BookOpen,
    Building, Globe, ChevronDown, Clock, FileText, User, Mail
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import Reveal from '../components/Reveal';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import CustomSelect from '../components/CustomSelect';
import CustomDatePicker from '../components/CustomDatePicker';
import CustomTimePicker from '../components/CustomTimePicker';


const AdminDashboard = () => {
    const { addNotification, confirm } = useNotification();
    const { logout } = useAuth();
    const [stats, setStats] = useState({ total_students: 0, present_today: 0, avg_attendance: 0, active_geofences: 0, individual_stats: [], daily_stats: [] });
    const location = useLocation();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        const fetchStats = async () => {
            try {
                const response = await api.get('students/analytics/');
                setStats(response.data);
            } catch {
                console.error("Failed to fetch statistics");
            }
        };
        fetchStats();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const NavItem = ({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to;
        return (
            <motion.div
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
                <Link
                    to={to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-black transition-all duration-300 relative group ${isActive
                            ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/30 border border-primary-500/50'
                            : 'text-slate-400 hover:bg-slate-800/40 hover:text-white border border-transparent'
                        }`}
                >
                    <Icon size={20} strokeWidth={2.5} className={isActive ? "text-white" : "text-slate-500 group-hover:text-primary-400 transition-colors"} />
                    <span className="tracking-tight text-xs sm:text-sm uppercase tracking-[0.1em]">{label}</span>
                    {isActive && (
                        <motion.div
                            layoutId="activeNav"
                            className="absolute left-[-1rem] w-1.5 h-8 bg-primary-500 rounded-r-full shadow-[0_0_15px_rgba(14,165,233,0.5)]"
                        />
                    )}
                </Link>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen text-slate-100 flex font-sans relative z-10">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-lg shrink-0">T</div>
                    <span className="font-black text-lg sm:text-xl tracking-tighter truncate">Tap2Present</span>
                </div>
                {!isMobileMenuOpen && (
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-300 hover:text-white shrink-0">
                        <Menu size={26} />
                    </button>
                )}
            </div>

            {/* Sidebar / Mobile Menu */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-[100] w-72 glass-sidebar p-6 flex flex-col lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto transition-transform duration-300
                    ${isLargeScreen ? 'translate-x-0' : (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full')}
                `}
            >
                <div className="flex items-center justify-between lg:block mb-10 mt-4 px-2">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-600 rounded-[1.25rem] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary-600/20">T</div>
                        <div>
                            <h2 className="font-black text-xl tracking-tighter leading-none text-white">Tap2Present</h2>
                            <p className="text-[9px] text-primary-500 font-black uppercase tracking-[0.2em] mt-1">Admin Portal</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="lg:hidden p-3 -mr-2 text-slate-400 hover:text-white transition-colors z-[110] cursor-pointer"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem to="/admin/requests" icon={UserPlus} label="Student Requests" />
                    <NavItem to="/admin/students" icon={Users} label="Manage Students" />
                    <NavItem to="/admin/academic" icon={GraduationCap} label="Academic Setup" />
                    <NavItem to="/admin/attendance" icon={Calendar} label="Daily Attendance" />
                    <NavItem to="/admin/holidays" icon={ShieldAlert} label="Holiday Setup" />
                    <NavItem to="/admin/location" icon={MapPin} label="Geofencing" />
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-800 space-y-2">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-rose-500 hover:bg-rose-500/10 transition-colors duration-200"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Overlay for Mobile */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Main Content Area */}
            <main className="flex-1 lg:p-10 p-4 sm:p-6 pt-24 lg:pt-10 max-w-[1600px] mx-auto w-full">
                <Routes>
                    <Route path="overview" element={<Overview stats={stats} />} />
                    <Route path="requests" element={<Requests />} />
                    <Route path="students" element={<Students />} />
                    <Route path="academic" element={<Academic />} />
                    <Route path="attendance" element={<DailyAttendance />} />
                    <Route path="holidays" element={<Holidays />} />
                    <Route path="location" element={<LocationSetup />} />
                    <Route path="/" element={<Overview stats={stats} />} />
                </Routes>
            </main>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color, delay = 0 }) => (
    <Reveal delay={delay} width="100%">
        <div className="glass-card p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 hover:border-primary-500/30 transition-all shadow-xl hover:shadow-primary-500/10 cursor-default relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className={`p-3 sm:p-4 rounded-2xl ${color} shrink-0 shadow-lg relative z-10 border border-white/5`}>
                <Icon size={20} className="text-white sm:size-[24px]" />
            </div>
            <div className="min-w-0 relative z-10">
                <h3 className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] truncate mb-0.5 sm:mb-1 opacity-70">{title}</h3>
                <p className="text-xl sm:text-3xl font-black text-white tracking-tighter">{value}</p>
            </div>
        </div>
    </Reveal>
);

const Overview = ({ stats }) => {
    const { addNotification } = useNotification();
    const handleDownload = async () => {
        try {
            const response = await api.get('attendance/download_excel/', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'attendance_report.xlsx');
            document.body.appendChild(link);
            link.click();
        } catch {
            addNotification("Failed to download report", "error");
        }
    };

    return (
        <div className="space-y-8">
            <Reveal>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-3xl font-black tracking-tighter">Dashboard Overview</h1>
                        <p className="text-slate-400 text-[10px] md:text-sm mt-1">Real-time attendance metrics and analytics</p>
                    </div>
                    <button
                        onClick={handleDownload}
                        className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2.5 md:px-5 md:py-3 rounded-xl font-black text-[11px] md:text-sm transition-all shadow-lg shadow-primary-600/20 active:scale-[0.98]"
                    >
                        <FileDown size={16} /> Export Report
                    </button>
                </div>
            </Reveal>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <StatCard title="Total Students" value={stats.total_students} icon={Users2} color="bg-indigo-600" delay={0.1} />
                <StatCard title="Present Today" value={stats.present_today} icon={UserPlus} color="bg-emerald-600" delay={0.2} />
                <StatCard title="Avg Attendance" value={`${stats.avg_attendance}%`} icon={TrendingUp} color="bg-primary-600" delay={0.3} />
                <StatCard title="Geofences" value={stats.active_geofences} icon={MapPin} color="bg-amber-600" delay={0.4} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-8 rounded-[2.5rem]">
                    <h3 className="text-lg font-black mb-6 uppercase tracking-tight">Attendance Trends</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.daily_stats}>
                                <defs>
                                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Area type="monotone" dataKey="present" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-6 md:p-8 rounded-[2.5rem]">
                    <h3 className="text-sm font-black mb-6 flex items-center gap-2 uppercase tracking-widest text-slate-400">
                        <TrendingUp size={18} className="text-primary-500" />
                        Risk Indicators (&lt;85%)
                    </h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {stats.low_attendance_alerts?.length > 0 ? (
                            stats.low_attendance_alerts.map((alert, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl hover:bg-rose-500/10 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 font-black group-hover:bg-rose-500/20 transition-all shadow-inner">
                                            {alert.name[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-100 text-sm">{alert.name}</p>
                                            <p className="text-[10px] text-rose-400 font-bold uppercase tracking-tight mt-0.5 truncate max-w-[150px]">{alert.details}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <ShieldAlert size={18} className="text-rose-500 flex-shrink-0" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 opacity-30 text-center grayscale">
                                <ShieldCheck size={48} className="text-emerald-500 mb-4" />
                                <h4 className="text-slate-200 font-black uppercase tracking-tighter text-xl">Perfect Standing</h4>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">No attendance risks detected</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Requests = () => {
    const { addNotification } = useNotification();
    const [requests, setRequests] = useState([]);
    const fetchRequests = async () => {
        try {
            const response = await api.get('requests/');
            setRequests(response.data.results || response.data);
        } catch { console.error("Failed to fetch requests"); }
    };
    useEffect(() => { fetchRequests(); }, []);

    const handleAction = async (id, action) => {
        try {
            await api.post(`requests/${id}/${action}/`);
            addNotification(`Successfully ${action}ed student request`, "success");
            fetchRequests();
        } catch { addNotification("Failed to " + action, "error"); }
    };

    return (
        <div className="space-y-6">
            <Reveal>
                <h1 className="text-xl md:text-3xl font-black tracking-tighter text-center sm:text-left">Access Requests</h1>
            </Reveal>

            <div className="space-y-4">
                {requests.length > 0 ? requests.map((req, idx) => (
                    <Reveal key={req.id} delay={idx * 0.1} width="100%">
                        <div className="glass-card rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 transition-all hover:border-primary-500/30 group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-primary-500 font-bold shadow-inner">
                                    {req.full_name?.[0] || 'S'}
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="font-bold text-white group-hover:text-primary-400 transition-colors truncate">{req.full_name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{req.registration_no}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                        <span className="text-[10px] text-primary-500/70 font-bold uppercase">{req.branch_name}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-3 border-t border-slate-800/50 pt-4 md:border-0 md:pt-0">
                                <p className="md:hidden text-[10px] text-slate-500 font-mono uppercase italic">Requested: {new Date(req.created_at).toLocaleDateString()}</p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleAction(req.id, 'approve')}
                                        className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(req.id, 'reject')}
                                        className="px-4 py-2 bg-rose-500/10 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                                    >
                                        Reject
                                    </button>
                            </div>
                        </div>
                    </div>
                </Reveal>
                )) : (
                    <div className="py-20 text-center bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[3rem] opacity-30">
                        <h3 className="text-xl font-bold text-slate-400 uppercase tracking-tighter">Queue Clear</h3>
                        <p className="text-xs text-slate-500 mt-2">No pending registration requests at this time.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const Students = () => {
    const { addNotification, confirm } = useNotification();
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');
    const [editingStudent, setEditingStudent] = useState(null);
    const [studentStats, setStudentStats] = useState([]);
    const [statsLoading, setStatsLoading] = useState(false);
    const [academicData, setAcademicData] = useState({ domains: [], branches: [], semesters: [] });

    const fetchStudents = async () => {
        try {
            const response = await api.get('students/');
            setStudents(response.data.results || response.data);
        } catch { console.error("Failed to fetch students"); }
    };

    const fetchAcademic = async () => {
        try {
            const [d, b, s] = await Promise.all([
                api.get('domains/'), api.get('branches/'), api.get('semesters/')
            ]);
            setAcademicData({ domains: d.data, branches: b.data, semesters: s.data });
        } catch { console.error("Failed to fetch academic data"); }
    };

    useEffect(() => {
        fetchStudents();
        fetchAcademic();
    }, []);

    useEffect(() => {
        if (editingStudent && editingStudent.id) {
            const fetchStudentStats = async () => {
                setStatsLoading(true);
                try {
                    const response = await api.get(`students/${editingStudent.id}/subject_stats/`);
                    setStudentStats(response.data);
                } catch { console.error("Failed to fetch student subject stats"); }
                setStatsLoading(false);
            };
            fetchStudentStats();
        } else {
            setStudentStats([]);
        }
    }, [editingStudent]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`students/${editingStudent.id}/`, editingStudent);
            addNotification("Student profile updated successfully", "success");
            setEditingStudent(null);
            fetchStudents();
        } catch { addNotification("Failed to update student", "error"); }
    };

    const deleteStudent = async (id) => {
        if (await confirm("Delete Student Profile", "Are you sure you want to permanently erase this student's entire account and history? This cannot be reversed.")) {
            try {
                await api.delete(`students/${id}/`);
                addNotification("Student profile permanently deleted", "success");
                fetchStudents();
            } catch { addNotification("Failed to delete student", "error"); }
        }
    };

    const filtered = students.filter(s => {
        const name = `${s.user_details?.first_name || ''} ${s.user_details?.last_name || ''}`.toLowerCase();
        const reg = (s.registration_no || '').toLowerCase();
        const query = search.toLowerCase();
        return name.includes(query) || reg.includes(query);
    });

    return (
        <div className="space-y-6">
            <Reveal>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-xl md:text-3xl font-black tracking-tighter">Student Database</h1>
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm w-full sm:w-80 focus:ring-2 focus:ring-primary-500/50 transition-all outline-none font-bold"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </Reveal>

            <div className="space-y-4">
                {filtered.length > 0 ? filtered.map((s, idx) => (
                    <Reveal key={s.id} delay={idx * 0.05} width="100%">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-8 hover:border-primary-500/30 transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary-600/10 text-primary-500 flex items-center justify-center font-black text-lg shadow-inner">
                                        {s.user_details?.first_name?.[0] || 'S'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="font-bold text-white group-hover:text-primary-400 transition-colors truncate text-lg">{s.user_details?.first_name} {s.user_details?.last_name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-black">{s.registration_no}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                            <span className="text-[10px] text-primary-500/70 font-black uppercase tracking-tight truncate">{s.branch_name}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-3 border-t border-slate-800/50 pt-4 md:border-0 md:pt-0">
                                    <div className="md:hidden">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{s.domain_name} • {s.semester_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setEditingStudent(s)} className="p-2.5 text-primary-400 bg-primary-400/5 hover:bg-primary-500/10 rounded-lg" title="Edit Student Profile">
                                            <Pencil size={18} />
                                        </button>
                                        <button onClick={() => deleteStudent(s.id)} className="p-2.5 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 rounded-lg">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden md:flex items-center gap-4 mt-6 pt-6 border-t border-slate-800/50 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-slate-700" /> {s.domain_name}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                                <span>{s.semester_name}</span>
                            </div>
                        </div>
                    </Reveal>
                )) : (
                    <div className="py-20 text-center bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[3rem] opacity-30">
                        <Users size={64} className="mx-auto mb-4 text-slate-600" />
                        <h3 className="text-xl font-bold text-slate-400 uppercase tracking-tighter">Database Empty</h3>
                        <p className="text-xs text-slate-500 mt-2">No students matched your search criteria.</p>
                    </div>
                )}
            </div>

            {editingStudent && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-3 md:p-4">
                    <form onSubmit={handleUpdate} className="bg-slate-900 border border-slate-800 rounded-[2rem] md:rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden">
                        <div className="p-5 md:p-8 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">Access Matrix</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Edit Student Academic Node</p>
                            </div>
                            <button type="button" onClick={() => setEditingStudent(null)} className="p-2 text-slate-500 hover:text-white transition-colors bg-slate-800 rounded-xl"><X size={20} /></button>
                        </div>

                        <div className="p-5 md:p-8 space-y-8 max-h-[60vh] md:max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                                    <User size={14} /> Primary Identity
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="group relative">
                                        <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1.5 ml-1">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary-500 transition-colors" size={16} />
                                            <input
                                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-sm text-white font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 outline-none transition-all"
                                                value={editingStudent.first_name || editingStudent.user_details?.first_name || ''}
                                                onChange={e => setEditingStudent({ ...editingStudent, first_name: e.target.value })}
                                                placeholder="Enter full name"
                                            />
                                        </div>
                                    </div>
                                    <div className="group relative">
                                        <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1.5 ml-1">Account Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary-500 transition-colors" size={16} />
                                            <input
                                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-sm text-white font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 outline-none transition-all"
                                                value={editingStudent.email || editingStudent.user_details?.email || ''}
                                                onChange={e => setEditingStudent({ ...editingStudent, email: e.target.value })}
                                                placeholder="student@example.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                                    <GraduationCap size={14} /> Academic Configuration
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1.5 ml-1">Registration No</label>
                                        <input
                                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white font-mono font-black focus:border-amber-500/50 outline-none transition-all"
                                            value={editingStudent.registration_no}
                                            onChange={e => setEditingStudent({ ...editingStudent, registration_no: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1.5 ml-1">Phone Number</label>
                                        <input
                                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-amber-500/50 outline-none transition-all"
                                            value={editingStudent.phone_no}
                                            onChange={e => setEditingStudent({ ...editingStudent, phone_no: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1.5 ml-1">Academic Domain</label>
                                        <CustomSelect options={academicData.domains} value={editingStudent.domain} onChange={val => setEditingStudent({ ...editingStudent, domain: val })} placeholder="Select Domain" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1.5 ml-1">Academic Branch</label>
                                        <CustomSelect options={academicData.branches} value={editingStudent.branch} onChange={val => setEditingStudent({ ...editingStudent, branch: val })} placeholder="Select Branch" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1.5 ml-1">Current Semester</label>
                                        <CustomSelect options={academicData.semesters} value={editingStudent.semester} onChange={val => setEditingStudent({ ...editingStudent, semester: val })} placeholder="Select Semester" />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-800/50 pt-8 mt-2">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                                    <TrendingUp size={14} className="text-emerald-500" /> Subject Performance Matrix
                                </h4>
                                <div className="space-y-3">
                                    {statsLoading ? (
                                        <div className="flex flex-col items-center justify-center py-10 gap-3">
                                            <p className="text-xs text-slate-500 font-medium">Fetching Records...</p>
                                        </div>
                                    ) : studentStats.length > 0 ? (
                                        studentStats.map(stat => (
                                            <div key={stat.subject_id} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30 group hover:border-primary-500/30 transition-all">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-xs font-bold text-slate-200">{stat.subject_name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${stat.percentage < 75 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                            {stat.percentage}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-1000 ${stat.percentage < 75 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'}`}
                                                        style={{ width: `${stat.percentage}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between mt-2.5">
                                                    <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{stat.present} Present / {stat.total} Total Sessions</p>
                                                    {stat.percentage < 75 && <span className="text-[9px] text-rose-400 font-bold flex items-center gap-1"><ShieldAlert size={10} /> Needs Attention</span>}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-12 bg-slate-800/20 border-2 border-dashed border-slate-800 rounded-[2rem] text-center">
                                            <ShieldAlert size={32} className="mx-auto text-slate-700 mb-3" />
                                            <p className="text-sm text-slate-500 font-medium select-none">No subject-wise records found.</p>
                                            <p className="text-[10px] text-slate-600 mt-1 max-w-[200px] mx-auto leading-relaxed">Ensure the student has a Branch and Semester assigned correctly.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 sm:p-8 bg-slate-800/30 border-t border-slate-800 flex gap-3 sm:gap-4">
                            <button type="button" onClick={() => setEditingStudent(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 py-3.5 sm:py-4 rounded-2xl font-bold transition-all text-xs sm:text-sm active:scale-95">Cancel</button>
                            <button type="submit" className="flex-[2] bg-primary-600 hover:bg-primary-500 text-white py-3.5 sm:py-4 rounded-2xl font-black transition-all shadow-xl shadow-primary-600/20 active:scale-95 text-xs sm:text-sm">Apply Changes</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

const ManagementCard = ({ title, endpoint, items, onRefresh, icon: Icon, themeColor = 'blue' }) => {
    const { addNotification, confirm } = useNotification();
    const [newItem, setNewItem] = useState('');
    const [search, setSearch] = useState('');

    const themeMap = {
        blue: { bg: 'bg-blue-600', text: 'text-blue-500', light: 'bg-blue-500/10', border: 'border-blue-500/20', gradient: 'from-blue-600/20 to-transparent' },
        indigo: { bg: 'bg-indigo-600', text: 'text-indigo-500', light: 'bg-indigo-500/10', border: 'border-indigo-500/20', gradient: 'from-indigo-600/20 to-transparent' },
        amber: { bg: 'bg-amber-600', text: 'text-amber-500', light: 'bg-amber-500/10', border: 'border-amber-500/20', gradient: 'from-amber-600/20 to-transparent' },
        emerald: { bg: 'bg-emerald-600', text: 'text-emerald-500', light: 'bg-emerald-500/10', border: 'border-emerald-500/20', gradient: 'from-emerald-600/20 to-transparent' },
    };

    const theme = themeMap[themeColor] || themeMap.blue;

    const handleAdd = async () => {
        if (!newItem.trim()) return;
        try {
            await api.post(`${endpoint}/`, { name: newItem });
            addNotification(`${title} added successfully`, "success");
            setNewItem('');
            onRefresh();
        } catch { addNotification("Failed to add " + title, "error"); }
    };

    const handleDelete = async (id) => {
        if (await confirm(`Delete ${title}`, `Are you sure you want to permanently remove this ${title.toLowerCase()}? This action cannot be undone.`)) {
            try {
                await api.delete(`${endpoint}/${id}/`);
                addNotification(`${title} removed successfully`, "success");
                onRefresh();
            } catch { addNotification("Failed to delete " + title, "error"); }
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Reveal width="100%">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl transition-all hover:border-slate-700/50 group">
                <div className={`p-4 md:px-8 md:py-6 flex items-center justify-between border-b border-slate-800 relative overflow-hidden bg-gradient-to-r ${theme.gradient}`}>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className={`p-1.5 sm:p-3 rounded-2xl ${theme.light} ${theme.text} shadow-inner`}>
                            <Icon size={14} className="sm:size-[20px]" />
                        </div>
                        <div>
                            <h3 className="font-black text-xs sm:text-xl uppercase tracking-tighter text-white">{title}s</h3>
                            <p className={`text-[7px] sm:text-[10px] font-black uppercase tracking-[0.2em] ${theme.text} opacity-70`}>{items.length} Entries</p>
                        </div>
                    </div>
                    <div className="relative group/search z-10 hidden sm:block">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/search:text-primary-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter..."
                            className="bg-slate-950/50 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs w-32 focus:w-48 focus:border-primary-500/50 transition-all outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-4 md:p-8 flex-1 flex flex-col gap-4 md:gap-6">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder={`New ${title.toLowerCase()}...`}
                            className="bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-[10px] sm:text-sm flex-1 outline-none focus:border-primary-500/50 transition-all font-bold placeholder:text-slate-600"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                        />
                        <button onClick={handleAdd} className={`bg-primary-600 hover:bg-primary-500 text-white p-2 sm:p-4 rounded-xl sm:rounded-2xl transition-all shadow-xl shadow-primary-600/20 active:scale-95 flex items-center justify-center min-w-[38px] sm:min-w-[56px] ${theme.text}`}>
                            <Check size={16} className="sm:size-[24px]" />
                        </button>
                    </div>

                    <div className="space-y-2 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar min-h-[120px]">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className="p-2 sm:p-4 bg-slate-800/20 border border-slate-800 rounded-xl sm:rounded-2xl text-[10px] sm:text-[13px] text-slate-300 flex items-center justify-between hover:bg-slate-800/40 hover:border-slate-700 transition-all group/item shadow-sm"
                            >
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${theme.bg} opacity-40`} />
                                    <span className="font-bold tracking-tight">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-slate-500 hover:text-rose-500 transition-colors p-2 sm:p-2.5 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:border-rose-500/30 flex items-center justify-center"
                                        title="Remove Entry"
                                    >
                                        <Trash2 size={12} className="sm:size-[14px]" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filteredItems.length === 0 && search && (
                            <div className="text-center py-8 opacity-40">
                                <p className="text-xs font-bold uppercase tracking-widest">No Matches</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            </Reveal>
            );
};

const Academic = () => {
    const [data, setData] = useState({domains: [], subjects: [], branches: [], semesters: [], locations: [] });
    const fetchData = async () => {
        try {
            const [d, sub, b, s, l] = await Promise.all([
            api.get('domains/'),
            api.get('subjects/'),
            api.get('branches/'),
            api.get('semesters/'),
            api.get('locations/')
            ]);
            setData({domains: d.data, subjects: sub.data, branches: b.data, semesters: s.data, locations: l.data });
        } catch {console.error("Failed to fetch academic data"); }
    };
    useEffect(() => {fetchData(); }, []);

            return (
            <div className="space-y-6 md:space-y-8 pb-20">
                <Reveal>
                    <div className="flex flex-col gap-1 md:gap-2">
                        <h1 className="text-xl md:text-3xl font-black tracking-tighter">Academic Configuration</h1>
                        <p className="text-slate-400 text-[10px] md:text-sm">Manage educational domains, branches, semesters and subjects.</p>
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ManagementCard title="Domain" endpoint="domains" items={data.domains} onRefresh={fetchData} icon={GraduationCap} themeColor="blue" />
                    <ManagementCard title="Branch" endpoint="branches" items={data.branches} onRefresh={fetchData} icon={Users} themeColor="indigo" />
                    <ManagementCard title="Semester" endpoint="semesters" items={data.semesters} onRefresh={fetchData} icon={LayoutDashboard} themeColor="amber" />
                    <SubjectManagement items={data.subjects} locations={data.locations} onRefresh={fetchData} />
                </div>
            </div>
            );
};

            const SubjectManagement = ({items, locations, onRefresh}) => {
    const {addNotification, confirm} = useNotification();
            const [newName, setNewName] = useState('');
            const [newTotal, setNewTotal] = useState(60);
            const [search, setSearch] = useState('');
            const [editingSubject, setEditingSubject] = useState(null);

    const handleAdd = async () => {
        if (!newName.trim()) return;
            try {
                await api.post('subjects/', { name: newName, total_students: newTotal });
            addNotification("New subject added successfully", "success");
            setNewName('');
            onRefresh();
        } catch {addNotification("Failed to add subject", "error"); }
    };

    const handleUpdate = async () => {
        if (!editingSubject.name.trim()) return;
            try {
                await api.put(`subjects/${editingSubject.id}/`, editingSubject);
            addNotification("Subject updated successfully", "success");
            setEditingSubject(null);
            onRefresh();
        } catch {addNotification("Failed to update subject", "error"); }
    };

    const deleteSubject = async (id) => {
        if (await confirm("Delete Subject", "Ensure this subject is no longer needed before proceeding. This will remove all associated metrics.")) {
            try {
                await api.delete(`subjects/${id}/`);
            addNotification("Subject deleted successfully", "success");
            onRefresh();
            } catch {addNotification("Failed to delete subject", "error"); }
        }
    };

    const filteredItems = items.filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase())
            );

            return (
            <Reveal width="100%">
                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl transition-all hover:border-slate-700/50 group h-full">
                    <div className={`p-6 sm:px-8 sm:py-6 flex items-center justify-between border-b border-slate-800 relative overflow-hidden bg-gradient-to-r from-emerald-600/20 to-transparent`}>
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="p-1.5 sm:p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-inner">
                                <Library size={14} className="sm:size-[20px]" />
                            </div>
                            <div>
                                <h3 className="font-black text-xs sm:text-xl uppercase tracking-tighter text-white">Subjects</h3>
                                <p className="text-[7px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 opacity-70">{items.length} Courses</p>
                            </div>
                        </div>
                        <div className="relative group/search z-10 hidden sm:block">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/search:text-emerald-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Filter..."
                                className="bg-slate-950/50 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs w-32 focus:w-48 focus:border-emerald-500/50 transition-all outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-4 md:p-8 space-y-4 md:space-y-6 flex-1 flex flex-col">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 p-4 md:p-6 bg-slate-800/30 rounded-[1.5rem] md:rounded-[2rem] border border-slate-800/50">
                            <div className="space-y-2">
                                <label className="text-[8px] md:text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Title</label>
                                <input
                                    type="text"
                                    placeholder="Course Name..."
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 md:py-3 text-[10px] md:text-sm font-bold outline-none focus:border-emerald-500/50 transition-all"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[8px] md:text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Quota</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 md:py-3 text-[10px] md:text-sm font-bold outline-none focus:border-emerald-500/50 transition-all"
                                        value={newTotal}
                                        onChange={(e) => setNewTotal(e.target.value)}
                                    />
                                    <button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 md:px-6 rounded-xl md:rounded-2xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95">
                                        <Check size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                            {filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-3 md:p-5 bg-slate-800/20 border border-slate-800 rounded-xl md:rounded-2xl flex flex-col gap-3 group/item hover:bg-slate-800/40 hover:border-slate-700 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500/10 rounded-lg md:rounded-xl flex items-center justify-center text-emerald-500 shadow-inner group-hover/item:scale-110 transition-transform">
                                                <BookOpen size={14} className="md:size-[18px]" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-xs md:text-base text-slate-200 truncate leading-tight">{item.name}</h4>
                                                <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Capacity: {item.total_students} Students</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setEditingSubject(item)} className="p-2 md:p-2.5 text-slate-400 hover:text-emerald-500 bg-slate-800/40 rounded-xl border border-slate-700/50 transition-all">
                                                <Pencil size={12} className="md:size-[14px]" />
                                            </button>
                                            <button onClick={() => deleteSubject(item.id)} className="p-2 md:p-2.5 text-slate-400 hover:text-rose-500 bg-slate-800/40 rounded-xl border border-slate-700/50 transition-all">
                                                <Trash2 size={12} className="md:size-[14px]" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {editingSubject && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-md shadow-2xl p-8">
                                <h3 className="text-xl font-bold mb-6 text-white uppercase tracking-tighter">Edit Subject</h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Title</label>
                                        <input
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-emerald-400/50 transition-all"
                                            value={editingSubject.name}
                                            onChange={e => setEditingSubject({ ...editingSubject, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Capacity</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-emerald-400/50 transition-all"
                                            value={editingSubject.total_students}
                                            onChange={e => setEditingSubject({ ...editingSubject, total_students: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button onClick={() => setEditingSubject(null)} className="flex-1 bg-slate-800 py-4 rounded-2xl font-bold text-slate-400">Cancel</button>
                                        <button onClick={handleUpdate} className="flex-1 bg-emerald-600 py-4 rounded-2xl font-black text-white shadow-xl shadow-emerald-600/20">Save</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Reveal>
            );
};

// Placeholder components for other views
const DailyAttendance = () => {
    const {addNotification, confirm} = useNotification();
                const [attendance, setAttendance] = useState([]);
                const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
                const [domain, setDomain] = useState('');
                const [branch, setBranch] = useState('');
                const [semester, setSemester] = useState('');
                const [subject, setSubject] = useState('');
                const [academicData, setAcademicData] = useState({domains: [], branches: [], semesters: [], subjects: [] });

    const fetchAttendance = async () => {
        try {
            const response = await api.get('attendance/admin_history/', {
                    params: {date, domain, branch, semester, subject}
            });
                setAttendance(response.data);
        } catch {console.error("Failed to fetch attendance"); }
    };

    const fetchAcademic = async () => {
        try {
            const [d, b, s, sub] = await Promise.all([
                api.get('domains/'), api.get('branches/'), api.get('semesters/'), api.get('subjects/')
                ]);
                setAcademicData({domains: d.data, branches: b.data, semesters: s.data, subjects: sub.data });
        } catch {console.error("Failed to fetch academic data"); }
    };

    useEffect(() => {fetchAcademic(); }, []);
    useEffect(() => {fetchAttendance(); }, [date, domain, branch, semester, subject]);

    const handleUpdate = async (id, status) => {
        try {
                    await api.patch(`attendance/${id}/`, { status });
                addNotification("Status updated successfully", "success");
                fetchAttendance();
        } catch {addNotification("Update failed", "error"); }
    };

                return (
                <div className="space-y-8 pb-10">
                    <Reveal>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h1 className="text-xl md:text-3xl font-black tracking-tighter">Attendance Ledger</h1>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase text-primary-500 bg-primary-500/10 px-3 py-1.5 rounded-lg border border-primary-500/20 shadow-sm flex items-center gap-1.5 animation-pulse">
                                    <Clock size={12} /> Live Journal
                                </span>
                            </div>
                        </div>
                    </Reveal>

                    <div className="glass-card p-4 sm:p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] space-y-6 md:space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Timeline</label>
                                <CustomDatePicker value={date} onChange={setDate} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Domain</label>
                                <CustomSelect
                                    options={academicData.domains}
                                    value={domain}
                                    onChange={v => setDomain(v)}
                                    placeholder="All Domains"
                                    icon={Globe}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Branch</label>
                                <CustomSelect
                                    options={academicData.branches}
                                    value={branch}
                                    onChange={v => setBranch(v)}
                                    placeholder="All Branches"
                                    icon={Building}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Semester</label>
                                <CustomSelect
                                    options={academicData.semesters}
                                    value={semester}
                                    onChange={v => setSemester(v)}
                                    placeholder="All Terms"
                                    icon={LayoutDashboard}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Subject</label>
                                <CustomSelect
                                    options={academicData.subjects}
                                    value={subject}
                                    onChange={v => setSubject(v)}
                                    placeholder="All Subjects"
                                    icon={BookOpen}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {attendance.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                                    {attendance.map((att, idx) => (
                                        <Reveal key={att.id} delay={idx * 0.05} width="100%">
                                            <div className="p-4 md:p-6 bg-slate-900/50 border border-slate-800 rounded-[1.5rem] md:rounded-[2rem] hover:border-slate-700/50 transition-all group relative overflow-hidden">
                                                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-10 -mr-16 -mt-16 transition-all ${att.status === 'present' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                <div className="flex items-start justify-between relative z-10">
                                                    <div className="flex gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${att.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                            {att.student_name?.[0] || 'S'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="font-bold text-white group-hover:text-primary-400 transition-colors truncate">{att.student_name}</h4>
                                                            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-0.5">{att.registration_no}</p>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">{att.subject_name}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-3 shrink-0">
                                                        <div className="text-right">
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Status</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`w-1.5 h-1.5 rounded-full ${att.status === 'present' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                                <span className={`text-[11px] font-black uppercase tracking-widest ${att.status === 'present' ? 'text-emerald-500' : 'text-rose-500'}`}>{att.status}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleUpdate(att.id, att.status === 'present' ? 'absent' : 'present')} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all text-slate-400 hover:text-white">
                                                                <Pencil size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Reveal>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-24 text-center bg-slate-900 border-2 border-dashed border-slate-800 rounded-[3rem] opacity-30 flex flex-col items-center justify-center gap-4">
                                    <FileText size={48} className="text-slate-600 mb-2" />
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-400 uppercase tracking-tighter">No Logs Found</h3>
                                        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Adjust your filters to locate required participation records.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                );
};

const Holidays = () => {
    const {addNotification, confirm} = useNotification();
                const [holidays, setHolidays] = useState([]);
                const [reason, setReason] = useState('');
                const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
                const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchHolidays = async () => {
        try {
            const response = await api.get('holidays/');
                setHolidays(response.data);
        } catch {console.error("Failed to fetch holidays"); }
    };

    useEffect(() => {fetchHolidays(); }, []);

    const handleAdd = async (e) => {
                    e.preventDefault();
                try {
                    await api.post('holidays/', { reason, start_date: startDate, end_date: endDate });
                addNotification("Institutional holiday logged", "success");
                setReason('');
                fetchHolidays();
        } catch {addNotification("Failed to add holiday", "error"); }
    };

    const handleDelete = async (id) => {
        if (await confirm("Delete Holiday Log", "Are you sure you want to remove this holiday entry? This might affect attendance metrics for the selected period.")) {
            try {
                    await api.delete(`holidays/${id}/`);
                addNotification("Holiday entry erased", "success");
                fetchHolidays();
            } catch {addNotification("Failed to delete holiday", "error"); }
        }
    };

                return (
                <div className="space-y-8">
                    <Reveal>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h1 className="text-xl md:text-3xl font-black tracking-tighter">Calendar Configuration</h1>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 shadow-sm flex items-center gap-1.5">
                                    <Calendar size={12} /> Institutional Ops
                                </span>
                            </div>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="glass-card p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] h-fit sticky top-10">
                            <h3 className="text-lg font-black mb-6 uppercase tracking-tight flex items-center gap-3"><Calendar className="text-amber-500" /> Log Closure</h3>
                            <form onSubmit={handleAdd} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Event Reason</label>
                                    <input
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-amber-500/50 outline-none transition-all"
                                        placeholder="Public Holiday, Event, etc..."
                                        value={reason}
                                        onChange={e => setReason(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Commences</label>
                                        <CustomDatePicker value={startDate} onChange={setStartDate} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Concludes</label>
                                        <CustomDatePicker value={endDate} onChange={setEndDate} />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white py-4 rounded-xl md:rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-amber-600/20 active:scale-[0.98]">
                                    Broadcast Institutional Holiday
                                </button>
                            </form>
                        </div>

                        <div className="lg:col-span-2 space-y-4">
                            {holidays.length > 0 ? holidays.sort((a, b) => new Date(b.start_date) - new Date(a.start_date)).map((h, idx) => (
                                <Reveal key={h.id} delay={idx * 0.05} width="100%">
                                    <div className="p-5 md:p-8 bg-slate-900/50 border border-slate-800 rounded-[2rem] hover:border-slate-700/50 transition-all group flex items-start justify-between gap-6">
                                        <div className="flex gap-4 md:gap-6">
                                            <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-[1.25rem] flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                                                <Calendar size={28} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-black text-white text-lg md:text-xl uppercase tracking-tight truncate">{h.reason}</h4>
                                                <div className="flex flex-wrap items-center gap-y-2 gap-x-3 mt-2">
                                                    <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px] md:text-xs">
                                                        <Clock size={12} className="text-amber-500/50" />
                                                        <span className="font-bold text-slate-300">{new Date(h.start_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                    {h.start_date !== h.end_date && (
                                                        <>
                                                            <div className="w-1 h-1 rounded-full bg-slate-800"></div>
                                                            <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px] md:text-xs">
                                                                <span className="text-slate-600 lowercase font-bold mr-1">to</span>
                                                                <span className="font-bold text-slate-300">{new Date(h.end_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(h.id)}
                                            className="p-3 bg-slate-800 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 rounded-xl border border-slate-700 transition-all shrink-0"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </Reveal>
                            )) : (
                                <div className="py-24 text-center bg-slate-900 border-2 border-dashed border-slate-800 rounded-[3rem] opacity-30 flex flex-col items-center justify-center">
                                    <Calendar size={64} className="text-slate-600 mb-4" />
                                    <h3 className="text-xl font-bold text-slate-400 uppercase tracking-tighter">Academic Year Active</h3>
                                    <p className="text-xs text-slate-500 mt-2">No institution-wide closures found in records.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                );
};

const LocationSetup = () => {
    const {addNotification, confirm} = useNotification();
                const [locations, setLocations] = useState([]);
                const [newLocation, setNewLocation] = useState({name: '', latitude: '', longitude: '', radius: 200, start_time: '08:00', end_time: '17:00' });
                const [stats, setStats] = useState({total_geofences: 0, active_zones: 0 });

    const fetchLocations = async () => {
        try {
            const response = await api.get('locations/');
                setLocations(response.data);
                setStats({
                    total_geofences: response.data.length,
                active_zones: response.data.length
            });
        } catch {console.error("Failed to fetch locations"); }
    };

    useEffect(() => {fetchLocations(); }, []);

    const handleAdd = async (e) => {
                    e.preventDefault();
                try {
                    await api.post('locations/', newLocation);
                addNotification("Satellite geofence initialized", "success");
                setNewLocation({name: '', latitude: '', longitude: '', radius: 200, start_time: '08:00', end_time: '17:00' });
                fetchLocations();
        } catch (err) {addNotification(err.response?.data?.error || "Matrix alignment failure", "error"); }
    };

    const handleDelete = async (id) => {
        if (await confirm("Decommission Geofence", "Are you sure you want to deactivate and remove this location coordinate? All associated geofencing protocols will terminate.")) {
            try {
                    await api.delete(`locations/${id}/`);
                addNotification("Geofence decommissioned", "success");
                fetchLocations();
            } catch {addNotification("Failed to delete location", "error"); }
        }
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
                    addNotification("Geolocation is not supported by your browser.", "error");
                return;
        }
                addNotification("Triangulating coordinates...", "info");
        navigator.geolocation.getCurrentPosition((pos) => {
                    setNewLocation({ ...newLocation, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) });
                addNotification("Coordinates synced from satellite", "success");
        }, () => addNotification("Signal lost. Enable GPS access.", "error"));
    };

                return (
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-5">
                            <h1 className="text-xl md:text-3xl font-black tracking-tighter">Geofencing Control</h1>
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-primary-600/10 border border-primary-500/20 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary-500">Grid Secure</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Form column */}
                        <div className="lg:col-span-1 glass-card p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] h-fit sticky top-10 flex flex-col gap-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <div className="relative z-10">
                                <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3"><MapPin className="text-primary-500" /> New Geofence</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Initialize spatial boundaries</p>
                            </div>

                            <form onSubmit={handleAdd} className="space-y-5 relative z-10">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Location Alias</label>
                                    <input className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-primary-500/50 outline-none transition-all placeholder:text-slate-700" placeholder="e.g. Main Auditorium" value={newLocation.name} onChange={e => setNewLocation({ ...newLocation, name: e.target.value })} required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Latitude</label>
                                        <input className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white font-mono focus:border-primary-500/50 outline-none" value={newLocation.latitude} onChange={e => setNewLocation({ ...newLocation, latitude: e.target.value })} required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Longitude</label>
                                        <input className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white font-mono focus:border-primary-500/50 outline-none" value={newLocation.longitude} onChange={e => setNewLocation({ ...newLocation, longitude: e.target.value })} required />
                                    </div>
                                </div>

                                <button type="button" onClick={getCurrentLocation} className="w-full flex items-center justify-center gap-2 text-[10px] font-black text-primary-500 uppercase tracking-widest hover:text-white transition-colors bg-primary-500/5 py-3 rounded-xl border border-primary-500/10 hover:bg-primary-500/20 active:scale-95">
                                    <Map size={14} /> Get Current Coordinates
                                </button>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Boundary Radius (Meters)</label>
                                    <input type="number" className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-primary-500/50 outline-none" value={newLocation.radius} onChange={e => setNewLocation({ ...newLocation, radius: e.target.value })} required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Active From</label>
                                        <CustomTimePicker value={newLocation.start_time} onChange={val => setNewLocation({ ...newLocation, start_time: val })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Active Until</label>
                                        <CustomTimePicker value={newLocation.end_time} onChange={val => setNewLocation({ ...newLocation, end_time: val })} />
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white py-4 rounded-xl md:rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-primary-600/20 active:scale-[0.98]">
                                    Establish Geofence
                                </button>
                            </form>
                        </div>

                        {/* List column */}
                        <div className="lg:col-span-2 space-y-4">
                            {locations.length > 0 ? locations.map((loc, idx) => (
                                <Reveal key={loc.id} delay={idx * 0.05} width="100%">
                                    <div className="p-6 md:p-8 bg-slate-900/50 border border-slate-800 rounded-[2rem] md:rounded-[3rem] transition-all hover:border-slate-700 group relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="flex items-start gap-4 md:gap-6 relative z-10">
                                            <div className="w-14 h-14 bg-primary-600/10 text-primary-500 rounded-2xl flex items-center justify-center shadow-inner shrink-0 group-hover:rotate-12 transition-all">
                                                <MapPin size={28} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-black text-white text-lg md:text-xl uppercase tracking-tight truncate group-hover:text-primary-400 transition-colors">{loc.name}</h4>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                                                    <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[9px] md:text-[11px] font-bold">
                                                        <span className="text-slate-700">COORD:</span> {loc.latitude}, {loc.longitude}
                                                    </div>
                                                    <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-800"></div>
                                                    <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[9px] md:text-[11px] font-bold">
                                                        <span className="text-slate-700">RADIUS:</span> {loc.radius}M
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2.5 mt-3">
                                                    <span className="px-2 py-0.5 bg-slate-800 rounded-md text-[8px] md:text-[10px] font-black text-slate-400 border border-slate-700/50 flex items-center gap-1.5">
                                                        <Clock size={12} className="text-primary-500/50" /> {loc.start_time?.slice(0, 5)} - {loc.end_time?.slice(0, 5)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end relative z-10 border-t border-slate-800/50 pt-4 sm:border-0 sm:pt-0">
                                            <button onClick={() => handleDelete(loc.id)} className="p-3 md:p-4 bg-slate-800 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 rounded-xl border border-slate-700 transition-all shadow-md active:scale-95">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </Reveal>
                            )) : (
                                <div className="py-24 text-center bg-slate-900 border-2 border-dashed border-slate-800 rounded-[3rem] opacity-30 flex flex-col items-center justify-center">
                                    <MapPin size={64} className="text-slate-600 mb-4" />
                                    <h3 className="text-xl font-bold text-slate-400 uppercase tracking-tighter">No Active Zones</h3>
                                    <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">Define your campus coordinates to enable satellite-verified attendance.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                );
};

                export default AdminDashboard;
