import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { 
    LayoutDashboard, Users, UserPlus, GraduationCap, MapPin, Map,
    LogOut, Search, Trash2, Check, X, FileDown, TrendingUp,
    Users2, Calendar, Clock, Filter, FileText, ArrowUpRight, ArrowDownRight,
    ShieldAlert, ShieldCheck, Menu, Library, Pencil, BookOpen, 
    Building, Globe, ChevronDown, User, Mail, Download
} from 'lucide-react';
import { 
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import CustomSelect from '../components/CustomSelect';
import CustomDatePicker from '../components/CustomDatePicker';
import CustomTimePicker from '../components/CustomTimePicker';
import logo from '../assets/logo.png';

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
            } catch (err) {
                console.error("Failed to fetch statistics", err);
            }
        };
        fetchStats();

        return () => window.removeEventListener('resize', handleResize);
    }, []);


    return (
        <div className="min-h-screen text-slate-100 flex font-sans overflow-hidden relative">

            <div className="relative z-10 flex w-full h-screen overflow-hidden">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-[100] bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shrink-0">
                        <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="font-bold text-lg sm:text-xl tracking-tight flex items-baseline text-white italic">TAP<span className="text-2xl sm:text-3xl font-bold not-italic">2</span><span className="text-primary-500 font-bold">PRESENT</span></span>

                </div>
                {!isMobileMenuOpen && (
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-300 hover:text-white shrink-0">
                        <Menu size={26} />
                    </button>
                )}
            </div>

            {/* Sidebar / Mobile Menu */}
            <motion.aside 
                initial="closed"
                animate={isLargeScreen ? "open" : (isMobileMenuOpen ? "open" : "closed")}
                variants={sidebarVariants}
                className={`
                    fixed inset-y-0 left-0 z-[110] w-72 p-6 flex flex-col lg:static overflow-y-auto
                `}
                style={{ 
                    background: 'rgba(8, 12, 28, 0.75)',
                    backdropFilter: 'blur(64px) saturate(250%) brightness(0.85)',
                    WebkitBackdropFilter: 'blur(64px) saturate(250%) brightness(0.85)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '4px 0 60px rgba(0, 0, 0, 0.6)'
                }}
            >
                <div className="flex items-center justify-between lg:block mb-10 mt-4 px-2">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[1.25rem] overflow-hidden shrink-0">
                            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h2 className="font-bold text-xl tracking-tight leading-none text-white flex items-baseline italic">TAP<span className="text-3xl font-bold not-italic">2</span><span className="text-primary-500 font-bold">PRESENT</span></h2>
                            <p className="text-[9px] text-primary-500 font-bold mt-1">Admin Portal</p>

                        </div>
                    </div>
                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="lg:hidden p-3 -mr-2 text-slate-400 hover:text-white transition-colors z-[120] cursor-pointer"
                    >
                        <X size={24} />
                    </motion.button>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" location={location} setIsMobileMenuOpen={setIsMobileMenuOpen} />
                    <NavItem to="/admin/requests" icon={UserPlus} label="Student Requests" location={location} setIsMobileMenuOpen={setIsMobileMenuOpen} />
                    <NavItem to="/admin/students" icon={Users} label="Manage Students" location={location} setIsMobileMenuOpen={setIsMobileMenuOpen} />
                    <NavItem to="/admin/academic" icon={GraduationCap} label="Academic Setup" location={location} setIsMobileMenuOpen={setIsMobileMenuOpen} />
                    <NavItem to="/admin/attendance" icon={Calendar} label="Daily Attendance" location={location} setIsMobileMenuOpen={setIsMobileMenuOpen} />
                    <NavItem to="/admin/holidays" icon={ShieldAlert} label="Holiday Setup" location={location} setIsMobileMenuOpen={setIsMobileMenuOpen} />
                    <NavItem to="/admin/location" icon={MapPin} label="Geofencing" location={location} setIsMobileMenuOpen={setIsMobileMenuOpen} />
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-800 space-y-2">
                    <motion.button 
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        onClick={logout} 
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-rose-500 hover:bg-rose-500/10 transition-colors duration-200"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </motion.button>
                </div>
            </motion.aside>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-xl"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 lg:p-10 p-3.5 sm:p-6 pt-24 lg:pt-10 overflow-y-auto w-full relative z-10 custom-scrollbar">
                <div className="w-full h-full">
                    <AnimatePresence mode="wait">
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
                    </AnimatePresence>
                </div>
            </main>
            </div>
        </div>
    );
};

const NavItem = ({ to, icon: Icon, label, location, setIsMobileMenuOpen }) => {
    const isActive = location.pathname === to;
    return (
        <motion.div
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
        >
            <Link 
                to={to} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-colors duration-200 ${
                    isActive 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30 grow border border-primary-500/50' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent'
                }`}
            >
                <Icon size={20} strokeWidth={2.5} className={isActive ? "text-white" : "text-slate-500 group-hover:text-white transition-colors"} />
                <span className="tracking-tight text-xs sm:text-sm">{label}</span>
            </Link>
        </motion.div>
    );
};

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div 
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="glass-card rounded-[2rem] p-3.5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 hover:border-white/20 transition-all shadow-xl hover:shadow-primary-500/5 cursor-default relative overflow-hidden group"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]"></div>
        <div className={`p-2 sm:p-3 rounded-xl ${color} shrink-0 shadow-lg relative z-10`}>
            <Icon size={14} className="text-white sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0 relative z-10">
            <h3 className="text-slate-500 text-[8px] sm:text-xs font-bold tracking-[0.1em] truncate mb-0.5 sm:mb-1">{title}</h3>
            <p className="text-lg sm:text-2xl font-bold text-white tracking-tight">{value}</p>
        </div>
    </motion.div>
);

const sectionVariants = {
    initial: { 
        opacity: 0, 
        clipPath: 'inset(5% 0 5% 0)', 
        scale: 1.01, 
        filter: 'blur(8px)' 
    },
    animate: { 
        opacity: 1, 
        clipPath: 'inset(0% 0 0% 0)', 
        scale: 1, 
        filter: 'blur(0px)' 
    },
    exit: { 
        opacity: 0, 
        clipPath: 'inset(5% 0 5% 0)', 
        scale: 0.99, 
        filter: 'blur(4px)',
        transition: { duration: 0.3 } 
    },
    transition: { 
        duration: 0.6, 
        ease: [0.16, 1, 0.3, 1] 
    }
};

const sidebarVariants = {
    open: { 
        x: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    },
    closed: { 
        x: "-100%",
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
};

const Overview = ({ stats }) => {

    return (
        <motion.div 
            {...sectionVariants}
            className="space-y-6 md:space-y-8"
        >
            <div>
                <h1 className="text-xl md:text-3xl font-bold tracking-tight text-white flex items-baseline gap-2">Dashboard <span className="text-primary-500">Overview</span></h1>
                <p className="text-slate-400 text-[10px] md:text-sm mt-0.5">Real-time attendance metrics and analytics</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <StatCard title="Total Students" value={stats.total_students} icon={Users2} color="bg-indigo-600" />
                <StatCard title="Present Today" value={stats.present_today} icon={UserPlus} color="bg-emerald-600" />
                <StatCard title="Avg Attendance" value={`${stats.avg_attendance}%`} icon={TrendingUp} color="bg-primary-600" />
                <StatCard title="Geofences" value={stats.active_geofences} icon={MapPin} color="bg-amber-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                <div className="glass-card p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem]">
                    <h3 className="text-lg font-bold mb-6 tracking-tight">Attendance Trends</h3>
                    <div className="h-[220px] md:h-[300px] mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.daily_stats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#64748b" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    dy={10}
                                    minTickGap={20}
                                />
                                <YAxis 
                                    stroke="#64748b" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    dx={-5}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                                        backdropFilter: 'blur(8px)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                                        borderRadius: '16px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                                    }}
                                    itemStyle={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 'bold' } }
                                    labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px', fontWeight: 'bold' } }
                                    cursor={{ stroke: '#334155', strokeWidth: 1 }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="present" 
                                    stroke="#0ea5e9" 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#colorPresent)" 
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem]">
                    <h3 className="text-sm font-bold mb-6 flex items-center gap-2 tracking-widest text-slate-400">
                        <TrendingUp size={18} className="text-primary-500" />
                        Attendance Warning (&lt;85%)
                    </h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {stats.low_attendance_alerts?.length > 0 ? (
                            stats.low_attendance_alerts.map((alert, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl hover:bg-amber-500/10 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold group-hover:bg-amber-500/20 transition-all shadow-inner">
                                            {alert.name[0]}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-slate-100 text-xs md:text-sm truncate">{alert.name}</p>
                                            <p className="text-[9px] md:text-[10px] text-amber-500/70 font-bold uppercase tracking-tight mt-0.5 truncate">{alert.details}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <ShieldAlert size={18} className="text-amber-500 flex-shrink-0" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 opacity-30 text-center grayscale">
                                <ShieldCheck size={48} className="text-emerald-500 mb-4" />
                                <h4 className="text-slate-200 font-bold tracking-tighter text-xl">Perfect Standing</h4>
                                <p className="text-[10px] text-slate-400 mt-1 font-bold tracking-widest">No attendance risks detected</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const Requests = () => {
    const { addNotification } = useNotification();
    const [requests, setRequests] = useState([]);
    const fetchRequests = async () => {
        try {
            const response = await api.get('requests/');
            setRequests(response.data.results || response.data);
        } catch (err) { console.error("Failed to fetch requests", err); }
    };
    useEffect(() => { fetchRequests(); }, []);

    const handleAction = async (id, action) => {
        try {
            await api.post(`requests/${id}/${action}/`);
            addNotification(`Successfully ${action}ed student request`, "success");
            fetchRequests();
        } catch (err) { addNotification("Failed to " + action, "error"); }
    };

    return (
        <motion.div {...sectionVariants} className="space-y-6">
            <h1 className="text-xl md:text-3xl font-bold tracking-tight text-center sm:text-left text-white">Access <span className="text-primary-500">Requests</span></h1>

            
            <div className="space-y-4">
                {requests.length > 0 ? requests.map(req => (
                    <div key={req.id} className="glass-card rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 transition-all hover:border-primary-500/30 group">
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
                                    className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
                                >
                                    Approve
                                </button>
                                <button 
                                    onClick={() => handleAction(req.id, 'reject')} 
                                    className="px-4 py-2 bg-rose-500/10 text-rose-500 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="py-20 text-center glass-card bg-slate-900/10 border-2 border-dashed border-slate-800/50 rounded-[3rem] opacity-50">
                        <h3 className="text-xl font-bold text-slate-400 uppercase tracking-tighter">Queue Clear</h3>
                        <p className="text-xs text-slate-500 mt-2 font-bold tracking-widest">No pending registration requests at this time.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const Students = () => {
    const { addNotification, confirm } = useNotification();
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');
    const [editingStudent, setEditingStudent] = useState(null);
    const [studentStats, setStudentStats] = useState([]);
    const [filterDomain, setFilterDomain] = useState(null);
    const [filterBranch, setFilterBranch] = useState(null);
    const [filterSemester, setFilterSemester] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);
    const [academicData, setAcademicData] = useState({ domains: [], branches: [], semesters: [] });

    const fetchStudents = async () => {
        try {
            const response = await api.get('students/');
            setStudents(response.data.results || response.data);
        } catch (err) { console.error("Failed to fetch students", err); }
    };

    const fetchAcademic = async () => {
        try {
            const [d, b, s] = await Promise.all([
                api.get('domains/'), api.get('branches/'), api.get('semesters/')
            ]);
            setAcademicData({ domains: d.data, branches: b.data, semesters: s.data });
        } catch (err) { console.error(err); }
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
                } catch (err) { console.error("Failed to fetch student subject stats", err); }
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
        } catch (err) { addNotification("Failed to update student", "error"); }
    };

    const deleteStudent = async (id) => {
        if (await confirm("Delete Student Profile", "Are you sure you want to permanently erase this student's entire account and history? This cannot be reversed.")) {
            try {
                await api.delete(`students/${id}/`);
                addNotification("Student profile permanently deleted", "success");
                fetchStudents();
            } catch (err) { addNotification("Failed to delete student", "error"); }
        }
    };

    const filtered = students.filter(s => {
        const name = `${s.user_details?.first_name || ''} ${s.user_details?.last_name || ''}`.toLowerCase();
        const reg = (s.registration_no || '').toLowerCase();
        const query = search.toLowerCase();
        const matchSearch = name.includes(query) || reg.includes(query);
        const matchDomain   = !filterDomain   || s.domain   === filterDomain;
        const matchBranch   = !filterBranch   || s.branch   === filterBranch;
        const matchSemester = !filterSemester || s.semester === filterSemester;
        return matchSearch && matchDomain && matchBranch && matchSemester;
    });

    const handleExport = async () => {
        setExporting(true);
        try {
            const params = new URLSearchParams();
            if (filterDomain)   params.append('domain',   filterDomain);
            if (filterBranch)   params.append('branch',   filterBranch);
            if (filterSemester) params.append('semester', filterSemester);
            const response = await api.get(`students/export_students/?${params.toString()}`, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const date = new Date();
            const ds = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
            link.setAttribute('download', `students_${ds}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            addNotification('Student report downloaded!', 'success');
        } catch {
            addNotification('Failed to export. Try again.', 'error');
        } finally {
            setExporting(false);
        }
    };

    return (
        <motion.div {...sectionVariants} className="space-y-6">
            <AnimatePresence mode="wait">
                {editingStudent ? (
                    /* ===== FULL PAGE EDIT VIEW ===== */
                    <motion.form
                        key="edit-view"
                        onSubmit={handleUpdate}
                        className="space-y-8"
                        initial={{ opacity: 0, x: 60 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 60 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-xl md:text-3xl font-bold tracking-tight text-white">Edit <span className="text-primary-500">Student Profile</span></h1>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mt-1">Editing: {editingStudent.user_details?.first_name} {editingStudent.user_details?.last_name}</p>
                            </div>
                        <div className="hidden sm:flex gap-3">
                            <button type="button" onClick={() => setEditingStudent(null)} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl font-bold transition-all text-sm border border-white/5">Cancel</button>
                            <button type="submit" className="glass-button-primary px-8">Save Changes</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left - Edit Fields */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="glass-card border border-white/5 rounded-[2rem] p-6 md:p-8">
                                <h4 className="text-[11px] font-bold text-primary-400 tracking-[0.3em] flex items-center gap-3 mb-6 uppercase"><User size={15} /> Primary Identity</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="group">
                                        <label className="text-[11px] text-slate-300 font-bold block mb-2 ml-1 tracking-wider">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors z-10" size={16} />
                                            <input className="w-full glass-input pl-11 pr-4 py-3.5 text-sm rounded-2xl" value={editingStudent.first_name || editingStudent.user_details?.first_name || ''} onChange={e => setEditingStudent({...editingStudent, first_name: e.target.value})} placeholder="Enter full name" />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="text-[11px] text-slate-300 font-bold block mb-2 ml-1 tracking-wider">Account Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors z-10" size={16} />
                                            <input className="w-full glass-input pl-11 pr-4 py-3.5 text-sm rounded-2xl" value={editingStudent.email || editingStudent.user_details?.email || ''} onChange={e => setEditingStudent({...editingStudent, email: e.target.value})} placeholder="student@example.com" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card border border-white/5 rounded-[2rem] p-6 md:p-8">
                                <h4 className="text-[11px] font-bold text-amber-400 tracking-[0.3em] flex items-center gap-3 mb-6 uppercase"><GraduationCap size={15} /> Academic Configuration</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-[11px] text-slate-300 font-bold block mb-2 ml-1 tracking-wider">Registration No</label>
                                        <input className="w-full glass-input px-4 py-3.5 text-sm font-mono rounded-2xl" value={editingStudent.registration_no || ''} onChange={e => setEditingStudent({...editingStudent, registration_no: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-slate-300 font-bold block mb-2 ml-1 tracking-wider">Phone Number</label>
                                        <input className="w-full glass-input px-4 py-3.5 text-sm rounded-2xl" value={editingStudent.phone_no || ''} onChange={e => setEditingStudent({...editingStudent, phone_no: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-slate-300 font-bold block mb-2 ml-1 tracking-wider">Academic Domain</label>
                                        <CustomSelect options={academicData.domains} value={editingStudent.domain} onChange={val => setEditingStudent({...editingStudent, domain: val})} placeholder="Select Domain" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-slate-300 font-bold block mb-2 ml-1 tracking-wider">Academic Branch</label>
                                        <CustomSelect options={academicData.branches} value={editingStudent.branch} onChange={val => setEditingStudent({...editingStudent, branch: val})} placeholder="Select Branch" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-[11px] text-slate-300 font-bold block mb-2 ml-1 tracking-wider">Current Semester</label>
                                        <CustomSelect options={academicData.semesters} value={editingStudent.semester} onChange={val => setEditingStudent({...editingStudent, semester: val})} placeholder="Select Semester" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right - Performance */}
                        <div className="glass-card border border-white/5 rounded-[2rem] p-6 md:p-8">
                            <h4 className="text-[11px] font-bold text-emerald-400 tracking-[0.3em] flex items-center gap-3 mb-6 uppercase"><TrendingUp size={15} /> Performance Matrix</h4>
                            <div className="space-y-4">
                                {statsLoading ? (
                                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                                        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase animate-pulse">Analyzing...</p>
                                    </div>
                                ) : studentStats.length > 0 ? studentStats.map(stat => (
                                    <div key={stat.subject_id} className="p-4 rounded-2xl border border-white/5 bg-white/5 hover:border-primary-500/30 transition-all">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-bold text-white">{stat.subject_name}</span>
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${stat.percentage < 75 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{stat.percentage}%</span>
                                        </div>
                                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                            <div className={`h-full ${stat.percentage < 75 ? 'bg-gradient-to-r from-rose-600 to-rose-400' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'}`} style={{ width: `${stat.percentage}%` }} />
                                        </div>
                                        <p className="text-[9px] text-slate-600 font-mono font-bold tracking-widest uppercase mt-2">{stat.present}/{stat.total} sessions</p>
                                    </div>
                                )) : (
                                    <div className="py-10 text-center opacity-40">
                                        <ShieldAlert size={28} className="mx-auto text-slate-600 mb-2" />
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No Data Found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 pb-8 border-t border-white/5 justify-center">
                        <button type="button" onClick={() => setEditingStudent(null)} className="px-5 py-2 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl font-bold transition-all text-xs border border-white/5">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition-all text-xs shadow-lg shadow-primary-600/20 active:scale-95">Save Changes</button>
                    </div>
                    </motion.form>
                ) : (
                    /* ===== LIST VIEW ===== */
                    <motion.div
                        key="list-view"
                        className="space-y-6"
                        initial={{ opacity: 0, x: -60 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -60 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold tracking-tight text-white">Student <span className="text-primary-500">Database</span></h1>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em] mt-0.5">{filtered.length} of {students.length} students</p>
                        </div>
                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[11px] md:text-sm transition-all shadow-lg active:scale-95 ${
                                exporting ? 'bg-slate-700 cursor-not-allowed opacity-70 text-slate-400' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                            }`}
                        >
                            {exporting
                                ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Exporting...</>
                                : <><Download size={15} /> Export Students</>
                            }
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="glass-card rounded-2xl p-4 border border-white/5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Filter size={12} /> Filter Students</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="text-[10px] text-slate-400 font-bold block mb-1.5 ml-1">Domain</label>
                                <CustomSelect
                                    options={[{ id: null, name: 'All Domains' }, ...academicData.domains]}
                                    value={filterDomain}
                                    onChange={setFilterDomain}
                                    placeholder="All Domains"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-400 font-bold block mb-1.5 ml-1">Branch</label>
                                <CustomSelect
                                    options={[{ id: null, name: 'All Branches' }, ...academicData.branches]}
                                    value={filterBranch}
                                    onChange={setFilterBranch}
                                    placeholder="All Branches"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-400 font-bold block mb-1.5 ml-1">Semester</label>
                                <CustomSelect
                                    options={[{ id: null, name: 'All Semesters' }, ...academicData.semesters]}
                                    value={filterSemester}
                                    onChange={setFilterSemester}
                                    placeholder="All Semesters"
                                />
                            </div>
                        </div>
                        {(filterDomain || filterBranch || filterSemester) && (
                            <button
                                onClick={() => { setFilterDomain(null); setFilterBranch(null); setFilterSemester(null); }}
                                className="mt-3 text-[10px] font-bold text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
                            >
                                <X size={12} /> Clear All Filters
                            </button>
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative w-full rounded-2xl overflow-hidden">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10" size={18} />
                        <input type="text" placeholder="Search by name or registration number..." className="w-full glass-input pl-12 pr-4 py-3.5 text-sm outline-none rounded-2xl" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="space-y-4">
                        {filtered.length > 0 ? filtered.map(s => (
                            <div key={s.id} className="glass-card border border-white/5 rounded-[2rem] p-4 md:p-8 hover:border-primary-500/30 transition-all group">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary-600/10 text-primary-500 flex items-center justify-center font-bold text-lg">{s.user_details?.first_name?.[0] || 'S'}</div>
                                        <div>
                                            <h3 className="font-bold text-white group-hover:text-primary-400 transition-colors text-lg">{s.user_details?.first_name} {s.user_details?.last_name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-slate-500 font-mono tracking-widest font-bold">{s.registration_no}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                                <span className="text-[10px] text-primary-500/70 font-bold">{s.branch_name}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setEditingStudent(s)} className="p-2.5 text-primary-400 bg-primary-400/5 hover:bg-primary-500/20 rounded-xl transition-all" title="Edit Student Profile"><Pencil size={18} /></button>
                                        <button onClick={() => deleteStudent(s.id)} className="p-2.5 text-rose-500 bg-rose-500/5 hover:bg-rose-500/20 rounded-xl transition-all"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                                <div className="hidden md:flex items-center gap-4 mt-6 pt-6 border-t border-white/5 text-[10px] text-slate-500 font-bold tracking-widest">
                                    <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-slate-700" /> {s.domain_name}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                                    <span>{s.semester_name}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center glass-card bg-white/5 border-2 border-dashed border-white/5 rounded-[3rem] opacity-50">
                                <Users size={64} className="mx-auto mb-4 text-slate-600" />
                                <h3 className="text-xl font-bold text-slate-400 tracking-tighter">Database Empty</h3>
                                <p className="text-xs text-slate-500 mt-2 font-bold tracking-widest uppercase opacity-60">No students matched your search.</p>
                            </div>
                        )}
                    </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
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
        } catch (err) { addNotification("Failed to add " + title, "error"); }
    };

    const handleDelete = async (id) => {
        if (await confirm(`Delete ${title}`, `Are you sure you want to permanently remove this ${title.toLowerCase()}? This action cannot be undone.`)) {
            try {
                await api.delete(`${endpoint}/${id}/`);
                addNotification(`${title} removed successfully`, "success");
                onRefresh();
            } catch (err) { addNotification("Failed to delete " + title, "error"); }
        }
    };

    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl transition-all hover:border-slate-700/50 group">
            <div className={`p-4 md:px-8 md:py-6 flex items-center justify-between border-b border-slate-800 relative overflow-hidden bg-gradient-to-r ${theme.gradient}`}>
                <div className="flex items-center gap-4 relative z-10">
                    <div className={`p-1.5 sm:p-3 rounded-2xl ${theme.light} ${theme.text} shadow-inner`}>
                        <Icon size={14} className="sm:size-[20px]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-xs sm:text-xl tracking-tighter text-white">{title}s</h3>
                        <p className={`text-[7px] sm:text-[10px] font-bold tracking-[0.2em] ${theme.text} opacity-70`}>{items.length} Entries</p>
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

                <div className="space-y-2 overflow-y-auto max-h-[450px] pr-2 custom-scrollbar min-h-[120px]">
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item, idx) => (
                            <motion.div 
                                key={item.id}
                                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: idx * 0.03 }}
                                className="p-2 sm:p-4 bg-slate-800/20 border border-slate-800 rounded-xl sm:rounded-2xl text-[10px] sm:text-[13px] text-slate-300 flex items-center justify-between hover:bg-slate-800/40 hover:border-slate-700 transition-all group/item shadow-sm"
                            >
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${theme.bg} opacity-40`} />
                                    <span className="font-bold tracking-tight">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <motion.button 
                                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(244, 63, 94, 0.15)' }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleDelete(item.id)} 
                                        className="text-slate-500 hover:text-rose-500 transition-colors p-2 sm:p-2.5 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:border-rose-500/30 flex items-center justify-center"
                                        title="Remove Entry"
                                    >
                                        <Trash2 size={12} className="sm:size-[14px]" />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {filteredItems.length === 0 && search && (
                        <div className="text-center py-8 opacity-40">
                             <p className="text-xs font-bold tracking-widest">No Matches</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Academic = () => {
    const [data, setData] = useState({ domains: [], subjects: [], branches: [], semesters: [] });
    const fetchData = React.useCallback(async () => {
        try {
            const [d, sub, b, s] = await Promise.all([
                api.get('domains/'),
                api.get('subjects/'),
                api.get('branches/'),
                api.get('semesters/')
            ]);
            setData({ domains: d.data, subjects: sub.data, branches: b.data, semesters: s.data });
        } catch (err) { console.error("Failed to fetch academic data", err); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    return (
        <motion.div {...sectionVariants} className="space-y-6 md:space-y-8 pb-20">
            <div className="flex flex-col gap-1 md:gap-2">
                <h1 className="text-xl md:text-3xl font-bold tracking-tight text-white">Academic <span className="text-primary-500">Configuration</span></h1>

                <p className="text-slate-400 text-[10px] md:text-sm">Manage educational domains, branches, semesters and subjects.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ManagementCard title="Domain" endpoint="domains" items={data.domains} onRefresh={fetchData} icon={GraduationCap} themeColor="blue" />
                <ManagementCard title="Branch" endpoint="branches" items={data.branches} onRefresh={fetchData} icon={Users} themeColor="indigo" />
                <ManagementCard title="Semester" endpoint="semesters" items={data.semesters} onRefresh={fetchData} icon={LayoutDashboard} themeColor="amber" />
                <SubjectManagement items={data.subjects} onRefresh={fetchData} />
            </div>
        </motion.div>
    );
};

const SubjectManagement = ({ items, onRefresh }) => {
    const { addNotification, confirm } = useNotification();
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
        } catch (err) { addNotification("Failed to add subject", "error"); }
    };

    const handleUpdate = async () => {
        if (!editingSubject.name.trim()) return;
        try {
            await api.put(`subjects/${editingSubject.id}/`, editingSubject);
            addNotification("Subject updated successfully", "success");
            setEditingSubject(null);
            onRefresh();
        } catch (err) { addNotification("Failed to update subject", "error"); }
    };

    const deleteSubject = async (id) => {
        if (await confirm("Delete Subject", "Ensure this subject is no longer needed before proceeding. This will remove all associated metrics.")) {
            try {
                await api.delete(`subjects/${id}/`);
                addNotification("Subject deleted successfully", "success");
                onRefresh();
            } catch (err) { addNotification("Failed to delete subject", "error"); }
        }
    };

    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl transition-all hover:border-slate-700/50 group">
            <div className={`p-6 sm:px-8 sm:py-6 flex items-center justify-between border-b border-slate-800 relative overflow-hidden bg-gradient-to-r from-emerald-600/20 to-transparent`}>
                <div className="flex items-center gap-3 relative z-10">
                    <div className={`p-1.5 sm:p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-inner`}>
                        <Library size={14} className="sm:size-[20px]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-xs sm:text-xl tracking-tighter text-white">Subjects</h3>
                        <p className="text-[7px] sm:text-[10px] font-bold tracking-[0.2em] font-bold opacity-70">{items.length} Modules</p>
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

            <div className="p-4 sm:p-8 flex-1 flex flex-col gap-6">
                {!editingSubject ? (
                    <div className="space-y-3 sm:space-y-4">
                        <input 
                            type="text" 
                            placeholder="Course name (e.g. Advanced AI)..." 
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm outline-none focus:border-emerald-500/50 transition-all text-white font-bold"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <div className="flex-1 flex items-center bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl px-4 py-2.5 sm:px-5 sm:py-4">
                                <span className="text-[8px] sm:text-[10px] text-slate-500 uppercase font-bold mr-2 tracking-widest leading-none">Students:</span>
                                <input 
                                    type="number" 
                                    className="bg-transparent text-xs sm:text-sm text-white w-full outline-none font-bold"
                                    value={newTotal}
                                    onChange={(e) => setNewTotal(parseInt(e.target.value))}
                                />
                            </div>
                            <button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 sm:px-8 rounded-xl sm:rounded-2xl transition-all shadow-xl shadow-emerald-600/20 active:scale-95 font-bold uppercase tracking-widest text-[10px] sm:text-xs">
                                Create
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 p-6 bg-emerald-600/5 border border-emerald-500/20 rounded-3xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-2">
                             <p className="text-[10px] font-bold uppercase text-emerald-500 tracking-[0.2em]">Editing Module</p>
                             <button onClick={() => setEditingSubject(null)}><X size={16} className="text-slate-500 hover:text-white" /></button>
                        </div>
                        <input 
                            type="text" 
                            className="w-full bg-slate-800 border border-emerald-500/50 rounded-xl px-4 py-3 text-sm outline-none text-white font-bold"
                            value={editingSubject.name}
                            onChange={(e) => setEditingSubject({...editingSubject, name: e.target.value})}
                        />
                        <div className="flex gap-2">
                            <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 flex items-center">
                                <span className="text-[10px] text-slate-500 uppercase font-bold mr-2">Students:</span>
                                <input 
                                    type="number" 
                                    className="bg-transparent w-full text-sm text-white font-bold outline-none"
                                    value={editingSubject.total_students}
                                    onChange={(e) => setEditingSubject({...editingSubject, total_students: parseInt(e.target.value)})}
                                />
                            </div>
                            <button onClick={handleUpdate} className="bg-emerald-600 px-6 py-3 rounded-xl text-[10px] font-bold text-white hover:bg-emerald-500 transition-all uppercase tracking-widest shadow-lg shadow-emerald-600/20">Apply</button>
                        </div>
                    </div>
                )}

                <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar min-h-[120px]">
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item, idx) => (
                            <motion.div 
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.03 }}
                                className="p-5 bg-slate-800/20 border border-slate-800 rounded-[1.5rem] flex flex-col gap-3 hover:bg-slate-800/40 hover:border-slate-700 transition-all group/item shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <BookOpen size={14} />
                                        </div>
                                        <span className="font-bold text-slate-100 tracking-tight">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 transition-all duration-300">
                                        <button 
                                            onClick={() => setEditingSubject(item)} 
                                            className="p-2 text-primary-400 bg-primary-400/5 hover:bg-primary-400/20 rounded-xl transition-all" 
                                            title="Edit Course"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button 
                                            onClick={() => deleteSubject(item.id)} 
                                            className="p-2 text-rose-500 bg-rose-500/5 hover:bg-rose-500/20 rounded-xl transition-all"
                                            title="Delete Course"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                        <span>Class Strength</span>
                                        <span>{item.total_students} Total Students</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            className="h-full bg-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {filteredItems.length === 0 && (
                        <div className="py-12 bg-slate-800/10 border border-dashed border-slate-800 rounded-[2rem] text-center opacity-30">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">No modules found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
;


const DailyAttendance = () => {
    const { addNotification } = useNotification();
    const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'monthly'
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA')); // en-CA gives YYYY-MM-DD
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    
    const [filters, setFilters] = useState({ subject: '', branch: '', semester: '', domain: '' });
    const [academicData, setAcademicData] = useState({ subjects: [], branches: [], semesters: [], domains: [] });
    const [reportData, setReportData] = useState({ 
        date: '',
        is_holiday: false,
        holiday_reason: '',
        summary: {}, 
        subject_summaries: [], 
        present_records: [], 
        absent_records: [] 
    });
    const [monthlyData, setMonthlyData] = useState({ dates: [], report: [], holidays: {} });
    const [loading, setLoading] = useState(false);
    const dateRef = useRef(null);

    const fetchAcademic = React.useCallback(async () => {
        try {
            const [sub, b, s, d] = await Promise.all([
                api.get('subjects/'), api.get('branches/'), api.get('semesters/'), api.get('domains/')
            ]);
            setAcademicData({ subjects: sub.data, branches: b.data, semesters: s.data, domains: d.data });
        } catch (err) { console.error(err); }
    }, []);

    const fetchReport = React.useCallback(async () => {
        setLoading(true);
        try {
            if (viewMode === 'daily') {
                const params = new URLSearchParams();
                if (selectedDate) params.append('date', selectedDate);
                if (filters.subject) params.append('subject', filters.subject);
                if (filters.branch) params.append('branch', filters.branch);
                if (filters.semester) params.append('semester', filters.semester);
                if (filters.domain) params.append('domain', filters.domain);
                
                const response = await api.get(`attendance/daily_report/?${params.toString()}`);
                setReportData(response.data);
            } else {
                if (!filters.subject) {
                    setMonthlyData({ dates: [], report: [], holidays: {} });
                    setLoading(false);
                    return;
                }
                const params = new URLSearchParams({ 
                    month: currentMonth, 
                    year: currentYear, 
                    subject: filters.subject 
                });
                if (filters.branch) params.append('branch', filters.branch);
                const response = await api.get(`attendance/monthly_report/?${params.toString()}`);
                setMonthlyData(response.data);
            }
        } catch (err) { console.error("Failed to fetch report", err); }
        setLoading(false);
    }, [viewMode, selectedDate, filters, currentMonth, currentYear]);

    useEffect(() => { fetchAcademic(); }, [fetchAcademic]);
    useEffect(() => { fetchReport(); }, [fetchReport]);

    const downloadExcel = async () => {
        const params = new URLSearchParams();
        if (viewMode === 'monthly') {
            params.append('mode', 'monthly');
            params.append('month', currentMonth);
            params.append('year', currentYear);
            params.append('subject', filters.subject);
        } else {
            params.append('mode', 'daily');
            params.append('date', selectedDate);
            if (filters.subject) params.append('subject', filters.subject);
        }
        
        try {
            const response = await api.get(`attendance/download_excel/?${params.toString()}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Attendance_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed", err);
            addNotification("Failed to download Excel file. Please ensure you are logged in.", "error");
        }
    };

    const [togglingId, setTogglingId] = React.useState(null);

    const toggleStatus = async (studentId, currentStatus, subjectId) => {
        const nextStatus = currentStatus === 'present' ? 'absent' : 'present';
        const targetSubject = filters.subject || subjectId;

        if (!targetSubject) {
            addNotification("Please select a subject filter first before toggling attendance.", "info");
            return;
        }

        setTogglingId(studentId);
        try {
            await api.post('attendance/manual_update/', {
                student_id: studentId,
                status: nextStatus,
                date: selectedDate,
                subject_id: targetSubject
            });
            addNotification(
                nextStatus === 'present' ? '✓ Marked Present successfully' : '✗ Marked Absent successfully',
                nextStatus === 'present' ? 'success' : 'info'
            );
            fetchReport();
        } catch (err) {
            addNotification(err.response?.data?.error || "Failed to update attendance", "error");
        } finally {
            setTogglingId(null);
        }
    };
    const deleteRecord = async (id) => {
        if (await confirm("Delete Record", "Remove this individual attendance entry from the database?")) {
            try {
                await api.delete(`attendance/${id}/`);
                addNotification("Attendance record deleted", "success");
                fetchReport();
            } catch (err) { addNotification("Delete failed", "error"); }
        }
    };

    return (
        <motion.div {...sectionVariants} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800 self-start">
                    <button onClick={() => setViewMode('daily')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'daily' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-slate-400 hover:text-white'}`}>Daily View</button>
                    <button onClick={() => setViewMode('monthly')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'monthly' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-slate-400 hover:text-white'}`}>Monthly View</button>
                </div>

                <div className="flex items-center gap-3">
                    {viewMode === 'daily' ? (
                        <CustomDatePicker 
                            value={selectedDate} 
                            onChange={setSelectedDate} 
                        />
                    ) : (
                        <div className="flex items-center gap-2">
                             <CustomSelect
                                options={Array.from({length: 12}, (_, i) => ({ id: i + 1, name: new Date(0, i).toLocaleString('default', {month: 'long'}) }))}
                                value={currentMonth}
                                onChange={setCurrentMonth}
                                placeholder="Select Month"
                             />
                             <CustomSelect
                                options={[2024, 2025, 2026].map(y => ({ id: y, name: String(y) }))}
                                value={currentYear}
                                onChange={setCurrentYear}
                                placeholder="Select Year"
                             />
                        </div>
                    )}
                    <button onClick={downloadExcel} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-primary-500 hover:bg-slate-800 transition-all" title="Download Excel">
                        <FileDown size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900 p-3.5 rounded-3xl border border-slate-800 shadow-lg">
                <CustomSelect
                    options={[{ id: '', name: viewMode === 'monthly' ? "Select Subject*" : "All Subjects" }, ...academicData.subjects]}
                    value={filters.subject}
                    onChange={(val) => setFilters({...filters, subject: val})}
                    placeholder={viewMode === 'monthly' ? "Select Subject*" : "All Subjects"}
                    icon={BookOpen}
                />
                <CustomSelect
                    options={[{ id: '', name: "All Branches" }, ...academicData.branches]}
                    value={filters.branch}
                    onChange={(val) => setFilters({...filters, branch: val})}
                    placeholder="All Branches"
                    icon={Building}
                />
                <CustomSelect
                    options={[{ id: '', name: "All Semesters" }, ...academicData.semesters]}
                    value={filters.semester}
                    onChange={(val) => setFilters({...filters, semester: val})}
                    placeholder="All Semesters"
                    icon={LayoutDashboard}
                />
                <CustomSelect
                    options={[{ id: '', name: "All Domains" }, ...academicData.domains]}
                    value={filters.domain}
                    onChange={(val) => setFilters({...filters, domain: val})}
                    placeholder="All Domains"
                    icon={Globe}
                />
            </div>

            <div className="bg-primary-600/10 border border-primary-600/20 p-4 rounded-2xl flex items-center gap-3 text-[11px] text-primary-400 font-medium shadow-sm">
                <ShieldCheck size={16} />
                <p>Note: Students with less than 85% attendance in the selected subject are highlighted in <b>Red</b>.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-[10px] font-bold text-slate-500 tracking-[0.2em] px-2 uppercase">Subject Summary</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                    {reportData.subject_summaries?.map(sub => (
                        <div 
                            key={sub.id} 
                            onClick={() => setFilters({...filters, subject: sub.id})}
                            className={`p-4 md:p-5 rounded-2xl md:rounded-3xl border transition-all cursor-pointer group ${filters.subject === sub.id ? 'bg-primary-600/20 border-primary-500 shadow-lg shadow-primary-500/10' : sub.percentage < 85 ? 'bg-rose-500/5 border-rose-500/20' : 'glass-card border-white/5 hover:border-white/20'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] md:text-xs font-bold truncate pr-2 ${filters.subject === sub.id ? 'text-primary-400' : sub.percentage < 85 ? 'text-rose-400' : 'text-slate-300'}`}>{sub.name}</span>
                                <span className={`text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-lg ${sub.percentage < 85 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{sub.percentage}%</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <span className="text-lg md:text-xl font-bold text-white leading-none">{sub.present}<span className="text-[10px] md:text-sm text-slate-500 font-medium">/{sub.total_capacity}</span></span>
                                <div className="w-16 md:w-20 h-1 md:h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full ${sub.percentage < 85 ? 'bg-rose-500' : 'bg-primary-500'}`} style={{ width: `${sub.percentage}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>

                <div className="lg:col-span-3">
                    {viewMode === 'daily' ? (
                        <div className="space-y-6">
                            {/* Attendance Lists Split */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Present Students List */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <h3 className="text-[10px] font-bold text-emerald-500 tracking-[0.2em] flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            Present Now ({reportData.present_records?.length || 0})
                                        </h3>
                                    </div>
                                    <div className="space-y-4">
                                        {reportData.present_records?.length > 0 ? reportData.present_records.map(record => (
                                            <div key={record.id} className="glass-card border border-white/5 rounded-2xl p-4 md:p-5 hover:border-emerald-500/30 transition-all group">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-[10px] shrink-0">
                                                            {record.student_name?.[0]}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="text-xs md:text-sm font-bold tracking-tight leading-none truncate text-white">{record.student_name}</h4>
                                                            <p className="text-[8px] md:text-[9px] text-slate-500 font-mono uppercase tracking-widest mt-1 opacity-60 truncate">{record.registration_no}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <div className="text-right mr-1">
                                                            <p className="text-[10px] font-bold text-emerald-400/80">{record.time}</p>
                                                            <p className="text-[7px] text-slate-500 font-bold uppercase mt-0.5 truncate max-w-[70px]">{record.subject_name}</p>
                                                        </div>
                                                        {!reportData.is_holiday && (
                                                            <button
                                                                onClick={() => toggleStatus(record.id, 'present', record.subject_id)}
                                                                disabled={togglingId === record.id}
                                                                title="Mark as Absent"
                                                                className="p-2 text-rose-400 bg-rose-500/5 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                                            >
                                                                {togglingId === record.id
                                                                    ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                                    : <X size={14} />
                                                                }
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="py-12 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-[2rem]">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">No Check-ins Yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Absent Students List */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <h3 className="text-[10px] font-bold text-rose-500 tracking-[0.2em] flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-rose-500" />
                                            Absent Students ({reportData.absent_records?.length || 0})
                                        </h3>
                                        {reportData.absent_records?.length > 0 && (
                                            <button 
                                                onClick={() => downloadExcel('absent')}
                                                className="text-[9px] font-bold text-primary-400 hover:text-primary-300 flex items-center gap-1.5 transition-colors uppercase tracking-widest"
                                            >
                                                <Download size={12} /> Export List
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        {reportData.absent_records?.length > 0 ? reportData.absent_records.map(record => (
                                            <div key={record.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 md:p-4 hover:border-rose-500/30 transition-all group shadow-sm opacity-80 hover:opacity-100">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-[10px]">
                                                            {record.student_name?.[0]}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="text-xs md:text-sm font-bold tracking-tight leading-none truncate text-rose-400">{record.student_name}</h4>
                                                            <p className="text-[8px] md:text-[9px] text-slate-500 font-mono uppercase tracking-widest mt-1 opacity-60 truncate">{record.registration_no}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {!reportData.is_holiday && (
                                                            <button 
                                                                onClick={() => toggleStatus(record.id, 'absent', record.subject_id)} 
                                                                disabled={togglingId === record.id}
                                                                title="Mark as Present"
                                                                className="p-2 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                                            >
                                                                {togglingId === record.id
                                                                    ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                                    : <Check size={14} />
                                                                }
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="py-12 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-[2rem]">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">All Cleared</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                            {!filters.subject ? (
                                <div className="py-24 text-center text-slate-500 font-bold uppercase tracking-[0.2em] opacity-40">Select subject frequency node</div>
                            ) : (
                                <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 backdrop-blur-md">
                                        <tr>
                                            <th className="px-3 md:px-6 py-4 md:py-5 text-[9px] md:text-[10px] font-bold text-slate-400 sticky left-0 glass-sidebar z-10 border-r border-white/5 uppercase tracking-widest min-w-[100px] md:min-w-[180px]">Student Matrix</th>
                                            {monthlyData.dates.map(d => (
                                                <th key={d} className={`px-2 py-4 text-[9px] font-bold min-w-[32px] text-center border-r border-slate-800/50 ${monthlyData.holidays[d] ? 'bg-rose-500/10 text-rose-400' : 'text-slate-500'}`}>
                                                    {d.split('-').pop()}
                                                </th>
                                            ))}
                                            <th className="px-4 py-4 text-[10px] font-bold uppercase text-primary-500 text-center">Total</th>
                                            <th className="px-4 py-4 text-[10px] font-bold uppercase text-primary-500 text-center">%</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {monthlyData.report.map(row => (
                                            <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="px-3 md:px-4 py-3 md:py-4 sticky left-0 bg-slate-900 z-10 border-r border-slate-800 max-w-[100px] md:max-w-none">
                                                    <p className="text-[10px] md:text-[11px] font-bold text-white whitespace-nowrap truncate">{row.name}</p>
                                                    <p className="text-[7px] md:text-[8px] text-slate-500 font-mono uppercase font-bold truncate">{row.reg_no}</p>
                                                </td>
                                                {monthlyData.dates.map(d => {
                                                    const status = row.attendance[d];
                                                    return (
                                                        <td key={d} className={`px-2 py-4 text-center border-r border-slate-800/50 text-[10px] font-bold ${status === 'P' ? 'text-emerald-500' : status === 'H' ? 'text-rose-400 bg-rose-500/5' : 'text-slate-700'}`}>
                                                            {status}
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-4 py-4 text-center font-bold text-white text-xs">{row.total_present}</td>
                                                <td className={`px-4 py-4 text-center font-bold text-xs ${row.percentage < 75 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                    {row.percentage}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const Holidays = () => {
    const { addNotification, confirm } = useNotification();
    const [holidays, setHolidays] = useState([]);
    const [newHoliday, setNewHoliday] = useState({ start_date: '', end_date: '', reason: '' });

    const fetchHolidays = React.useCallback(async () => {
        try {
            const response = await api.get('holidays/');
            setHolidays(response.data);
        } catch (err) { console.error("Failed to fetch holidays", err); }
    }, []);

    useEffect(() => { fetchHolidays(); }, [fetchHolidays]);

    const handleAdd = async () => {
        if (!newHoliday.start_date || !newHoliday.end_date || !newHoliday.reason) return;
        try {
            await api.post('holidays/', newHoliday);
            addNotification("Holiday added successfully", "success");
            setNewHoliday({ start_date: '', end_date: '', reason: '' });
            fetchHolidays();
        } catch (err) { addNotification("Failed to add holiday", "error"); }
    };

    const deleteHoliday = async (id) => {
        if (await confirm("Revoke Holiday", "Are you sure you want to remove this academic closure?")) {
            await api.delete(`holidays/${id}/`);
            fetchHolidays();
        }
    };

    return (
        <motion.div {...sectionVariants} className="space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold tracking-tight text-white mb-2">Academic <span className="text-primary-500">Holidays</span></h1>
                    <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] opacity-60">Synchronizing Campus Closure Protocol</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1">
                    <div className="glass-card shadow-2xl p-8 md:p-10 rounded-[2.5rem] border border-white/5">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Calendar size={18} className="text-primary-500" />
                            Register Closure
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <CustomDatePicker 
                                    label="Start Date" 
                                    value={newHoliday.start_date} 
                                    onChange={(val) => setNewHoliday({...newHoliday, start_date: val})} 
                                />
                                <CustomDatePicker 
                                    label="End Date" 
                                    value={newHoliday.end_date} 
                                    onChange={(val) => setNewHoliday({...newHoliday, end_date: val})} 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1.5 ml-1">Reason / Event Name</label>
                                <input type="text" placeholder="e.g. Diwali Break" className="w-full bg-slate-800 border-slate-700 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-primary-500/50 transition-all" value={newHoliday.reason} onChange={(e) => setNewHoliday({...newHoliday, reason: e.target.value})} />
                            </div>
                            <button onClick={handleAdd} className="w-full bg-primary-600 hover:bg-primary-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary-600/20 transition-all active:scale-95 transform mt-4">Add To Schedule</button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {holidays.length > 0 ? holidays.map(h => (
                            <div key={h.id} className="glass-card border border-white/5 rounded-[2.5rem] p-6 md:p-8 flex items-center justify-between group hover:border-primary-500/30 transition-all shadow-2xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-primary-600/10 rounded-2xl flex items-center justify-center text-primary-500 shadow-inner">
                                        <Calendar size={28} />
                                    </div>
                                    <div>
                                        <p className="text-base font-bold text-white group-hover:text-primary-400 transition-colors tracking-tight">{h.reason}</p>
                                        <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-[0.2em] opacity-60">
                                            {h.start_date === h.end_date 
                                                ? new Date(h.start_date).toLocaleDateString('en-GB')
                                                : `${new Date(h.start_date).toLocaleDateString('en-GB', {day:'2-digit', month:'short'})} - ${new Date(h.end_date).toLocaleDateString('en-GB', {day:'2-digit', month:'short'})}`
                                            }
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => deleteHoliday(h.id)} className="p-3 text-rose-500 bg-rose-500/5 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-lg active:scale-95 group/btn">
                                    <Trash2 size={20} className="group-hover/btn:rotate-12 transition-transform" />
                                </button>
                            </div>
                        )) : (
                            <div className="col-span-full py-24 text-center glass-card bg-white/5 border-2 border-dashed border-white/5 rounded-[3rem] opacity-30">
                                <Calendar size={48} className="mx-auto mb-4 text-slate-600" />
                                <h3 className="text-xl font-bold text-slate-400 uppercase tracking-tighter">No Holidays Slated</h3>
                                <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest opacity-60">Add campus closures to ensure perfect attendance metrics.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
;

const LocationSetup = () => {
    const { addNotification, confirm } = useNotification();
    const [locations, setLocations] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [editingLoc, setEditingLoc] = useState({ 
        name: '', latitude: 0, longitude: 0, radius: 100, is_active: true, 
        subject: '', start_time: '00:00', end_time: '00:00', 
        days_of_week: '0,1,2,3,4,5' 
    });
    const [isAdding, setIsAdding] = useState(false);
    const [detecting, setDetecting] = useState(false);

    const fetchData = React.useCallback(async () => {
        try {
            const [locRes, subRes] = await Promise.all([
                api.get('locations/'),
                api.get('subjects/')
            ]);
            setLocations(locRes.data);
            setSubjects(subRes.data);
            if (locRes.data.length === 0) setIsAdding(true);
        } catch (err) { console.error("Failed to fetch data", err); }
    }, []);
    useEffect(() => { fetchData(); }, [fetchData]);

    const detectLocation = () => {
        setDetecting(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setEditingLoc({ ...editingLoc, latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                setDetecting(false);
                addNotification("Location coordinates captured", "success");
            },
            () => { 
                addNotification("Location access denied", "error"); 
                setDetecting(false); 
            }
        );
    };

    const handleSave = async () => {
        // Validate all required fields
        if (!editingLoc.name?.trim()) {
            return addNotification("Zone name is required.", "error");
        }
        if (!editingLoc.latitude || editingLoc.latitude === 0) {
            return addNotification("Latitude is required. Use 'Detect' or enter manually.", "error");
        }
        if (!editingLoc.longitude || editingLoc.longitude === 0) {
            return addNotification("Longitude is required. Use 'Detect' or enter manually.", "error");
        }
        if (!editingLoc.subject) {
            return addNotification("Please assign a subject to this geofence.", "error");
        }
        if (!editingLoc.start_time) {
            return addNotification("Start time is required.", "error");
        }
        if (!editingLoc.end_time) {
            return addNotification("End time is required.", "error");
        }
        if (!editingLoc.days_of_week || editingLoc.days_of_week === '') {
            return addNotification("Please select at least one day of the week.", "error");
        }
        try {
            const dataToSave = {
                ...editingLoc,
                subject: editingLoc.subject,
                start_time: editingLoc.start_time,
                end_time: editingLoc.end_time
            };
            if (editingLoc.id) await api.put(`locations/${editingLoc.id}/`, dataToSave);
            else await api.post('locations/', dataToSave);
            setIsAdding(false);
            setEditingLoc({ name: '', latitude: 0, longitude: 0, radius: 100, is_active: true, subject: '', start_time: '', end_time: '', days_of_week: '0,1,2,3,4,5' });
            addNotification("Geofence session saved successfully", "success");
            fetchData();
        } catch (err) { addNotification("Failed to save geofence session", "error"); }
    };

    const toggleDay = (day) => {
        const days = editingLoc.days_of_week.split(',').filter(d => d !== '');
        let newDays;
        if (days.includes(day.toString())) {
            newDays = days.filter(d => d !== day.toString());
        } else {
            newDays = [...days, day.toString()].sort();
        }
        setEditingLoc({ ...editingLoc, days_of_week: newDays.join(',') });
    };

    const toggleStatus = async (loc) => {
        try {
            await api.patch(`locations/${loc.id}/`, { is_active: !loc.is_active });
            addNotification(`Geofence ${!loc.is_active ? 'Activated' : 'Deactivated'}`, "info");
            fetchData();
        } catch (err) { addNotification("Failed to update status", "error"); }
    };

    const deleteLoc = async (id) => {
        if (await confirm("Remove Geofence", "Deleting this security zone will prevent location-based attendance in this area.")) {
            try {
                await api.delete(`locations/${id}/`);
                addNotification("Geofence removed successfully", "success");
                fetchData();
            } catch (err) { addNotification("Failed to delete geofence", "error"); }
        }
    };

    return (
        <motion.div {...sectionVariants} className="space-y-8 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl md:text-4xl font-bold tracking-tight text-white">College <span className="text-primary-500">Geofencing</span></h1>
                    <p className="text-slate-400 text-[10px] md:text-sm mt-1">Define authorized zones for attendance marking</p>
                </div>
                {!isAdding && (
                    <button 
                        onClick={() => setIsAdding(true)} 
                        className="bg-primary-600 hover:bg-primary-500 text-white px-5 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold shadow-xl shadow-primary-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto text-xs md:text-base"
                    >
                        <MapPin size={18} className="md:size-[20px]" /> Add New Zone
                    </button>
                )}
            </div>

            <AnimatePresence>
            {isAdding && (
                <motion.div
                    key="geofence-form"
                    initial={{ opacity: 0, y: -24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="glass-card border border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-10 shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-6 md:mb-8">
                        <h3 className="text-lg md:text-xl font-bold">{editingLoc.id ? 'Edit' : 'Configure New'} Geofence</h3>
                        <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white"><X size={20} className="md:size-[24px]"/></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] md:text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] block mb-2 ml-1 opacity-60">Internal Name <span className="text-rose-500">*</span></label>
                                <input type="text" placeholder="e.g. Main Campus Block" className="w-full glass-input px-4 md:px-5 py-3 md:py-4 text-xs md:text-sm rounded-2xl" value={editingLoc.name} onChange={(e) => setEditingLoc({...editingLoc, name: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] block mb-2.5 ml-1 opacity-60">Latitude <span className="text-rose-500">*</span></label>
                                    <input type="number" step="any" className="w-full glass-input px-5 py-4 text-sm font-mono rounded-2xl" value={editingLoc.latitude} onChange={(e) => setEditingLoc({...editingLoc, latitude: parseFloat(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] block mb-2.5 ml-1 opacity-60">Longitude <span className="text-rose-500">*</span></label>
                                    <input type="number" step="any" className="w-full glass-input px-5 py-4 text-sm font-mono rounded-2xl" value={editingLoc.longitude} onChange={(e) => setEditingLoc({...editingLoc, longitude: parseFloat(e.target.value)})} />
                                </div>
                            </div>
                            <button 
                                onClick={detectLocation}
                                disabled={detecting}
                                className="w-full bg-slate-800 border border-slate-700 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-primary-400 hover:bg-slate-700 transition-all text-xs"
                            >
                                <MapPin size={16} /> {detecting ? 'Detecting...' : 'Detect My Current Coordinates'}
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Radius (Meters)</label>
                                <div className="flex items-center gap-3">
                                    <input type="range" min="10" max="1000" step="10" className="flex-1 accent-primary-600 h-1.5" value={editingLoc.radius} onChange={(e) => setEditingLoc({...editingLoc, radius: parseInt(e.target.value)})} />
                                    <span className="bg-primary-600/10 text-primary-500 px-3 py-1.5 rounded-xl font-bold min-w-[70px] text-center text-xs">{editingLoc.radius}m</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1.5 ml-1">Assign Subject <span className="text-rose-500">*</span></label>
                                    <CustomSelect 
                                        options={subjects} 
                                        value={editingLoc.subject} 
                                        onChange={val => setEditingLoc({...editingLoc, subject: val})} 
                                        placeholder="Select Subject..." 
                                        icon={BookOpen}
                                        onAddNew={() => { setIsAdding(false); addNotification("Please add a Subject in the Academic section first.", "info"); }}
                                    />
                                </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                     <CustomTimePicker 
                                         label="Start Time"
                                         required={true}
                                         value={editingLoc.start_time} 
                                         onChange={val => setEditingLoc({...editingLoc, start_time: val})} 
                                     />
                                     <CustomTimePicker 
                                         label="End Time"
                                         required={true}
                                         value={editingLoc.end_time} 
                                         onChange={val => setEditingLoc({...editingLoc, end_time: val})} 
                                     />
                                 </div>
                            </div>
                            <div className="pt-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-3">Repeats On <span className="text-rose-500">*</span></label>
                                <div className="flex items-center justify-between gap-1 md:gap-2 max-w-full overflow-hidden">
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                                        const isSelected = editingLoc.days_of_week.split(',').includes(idx.toString());
                                        return (
                                            <button 
                                                key={idx}
                                                type="button"
                                                onClick={() => toggleDay(idx)}
                                                className={`w-[32px] h-[32px] md:w-9 md:h-9 rounded-xl font-bold text-[10px] md:text-xs transition-all flex items-center justify-center shrink-0 ${
                                                    isSelected 
                                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' 
                                                    : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                                                }`}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="pt-4 space-y-3">
                                <button onClick={handleSave} className="w-full bg-primary-600 hover:bg-primary-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary-600/20 active:scale-95 transition-all">
                                    {editingLoc.id ? 'Update Geofence' : 'Activate Geofence'}
                                </button>
                                <button onClick={() => setIsAdding(false)} className="w-full glass-card bg-slate-800/20 text-slate-400 py-4 rounded-2xl font-bold hover:text-white transition-all">Cancel</button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {locations.map(loc => (
                    <div key={loc.id} className={`group glass-card border border-slate-800/50 rounded-[2rem] p-6 transition-all hover:border-primary-500/30 ${!loc.is_active ? 'opacity-60 grayscale' : ''}`}>
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-primary-600/10 text-primary-500 rounded-2xl md:rounded-[1.25rem] flex items-center justify-center shrink-0">
                                    <Map size={28} className="md:w-8 md:h-8" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-bold text-base md:text-lg text-white group-hover:text-primary-400 transition-colors truncate">{loc.name}</h4>
                                    <p className="text-[10px] md:text-xs text-slate-500 font-mono tracking-tighter truncate">{loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}</p>
                                    {loc.subject && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="bg-primary-500/20 text-primary-400 text-[8px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-widest border border-primary-500/30">
                                                {subjects.find(s => s.id === loc.subject)?.name || 'Linked Subject'}
                                            </span>
                                             <span className="text-[10px] md:text-sm text-slate-400 font-bold flex items-center gap-1.5">
                                                <Clock size={12} className="md:size-[14px]" />
                                                {loc.start_time ? loc.start_time.slice(0,5) : "00:00"} - {loc.end_time ? loc.end_time.slice(0,5) : "00:00"}
                                             </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => {setEditingLoc(loc); setIsAdding(true);}} className="p-2 text-slate-500 hover:text-primary-400 transition-all">
                                    <Pencil size={20} />
                                </button>
                                <button onClick={() => deleteLoc(loc.id)} className="p-2 text-slate-500 hover:text-rose-500 transition-all">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={16} className="text-primary-500" />
                                <span className="text-sm font-bold text-slate-300">{loc.radius}m Security Zone</span>
                            </div>
                            <button 
                                onClick={() => toggleStatus(loc)}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                                    loc.is_active ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                                }`}
                            >
                                {loc.is_active ? 'Active' : 'Offline'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {locations.length === 0 && !isAdding && (
                <div className="py-20 text-center glass-card bg-slate-900/10 border-2 border-dashed border-slate-800/50 rounded-[3rem]">
                    <div className="w-20 h-20 bg-slate-800 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Map size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-400">No Geofences Configured</h3>
                    <p className="text-sm text-slate-500 mt-2">Active areas are required for students to mark attendance.</p>
                </div>
            )}
        </motion.div>
    );
};

export default AdminDashboard;

const globalStyles = `
    .glass-card { 
        background: rgba(15, 23, 42, 0.15) !important; 
        backdrop-filter: blur(40px) saturate(180%) !important; 
        border: 1px solid rgba(255, 255, 255, 0.08) !important; 
        transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1) !important; 
        position: relative; 
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37) !important;
    }
    .glass-card::before { 
        content: ""; 
        position: absolute; 
        inset: 0; 
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), transparent); 
        pointer-events: none; 
        border-radius: inherit !important; 
    }
    .glass-hover:hover { 
        background: rgba(30, 41, 59, 0.25) !important; 
        border-color: rgba(255, 255, 255, 0.15) !important; 
        box-shadow: 0 24px 64px -12px rgba(0, 0, 0, 0.5) !important; 
    }
    .glass-sidebar {
        background: rgba(15, 23, 42, 0.3) !important;
        backdrop-filter: blur(20px) saturate(180%) !important;
        border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
    }
`;

// Wrap export with style injection if needed, or just include it in the main component
// Choosing to inject at the top level of the component for simplicity in this specific setup
// Let's add it to the main AdminDashboard return instead
