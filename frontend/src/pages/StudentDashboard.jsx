import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, MapPin, Calendar, TrendingUp, History, 
    User, LogOut, Menu, X, ShieldCheck, ShieldAlert, 
    CheckCircle, XCircle, AlertTriangle, ArrowRight, BookOpen, Info,
    Mail, Phone, Globe, Building, GraduationCap
} from 'lucide-react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Reveal from '../components/Reveal';
import CustomSelect from '../components/CustomSelect';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
    
    // Core Data States
    const [attendance, setAttendance] = useState([]);
    const [subjectStats, setSubjectStats] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [holidays, setHolidays] = useState([]);
    
    // Functional States
    const [selectedSubject, setSelectedSubject] = useState('');
    const [marking, setMarking] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [overallStats, setOverallStats] = useState({ present: 0, total: 0, percentage: 0 });

    useEffect(() => {
        const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        const fetchAllData = async () => {
            try {
                const [attRes, subRes, statsRes, holRes] = await Promise.all([
                    api.get('attendance/student_history/'),
                    api.get('subjects/'),
                    api.get('attendance/my_subject_stats/'),
                    api.get('holidays/')
                ]);

                setAttendance(attRes.data);
                setSubjects(subRes.data);
                setSubjectStats(statsRes.data);
                setHolidays(holRes.data);

                const totalPresent = statsRes.data.reduce((acc, s) => acc + s.present, 0);
                const totalSessions = statsRes.data.reduce((acc, s) => acc + s.total, 0);
                const perc = totalSessions > 0 ? (totalPresent / totalSessions * 100) : 0;
                
                setOverallStats({
                    present: totalPresent,
                    total: totalSessions,
                    percentage: Math.round(perc)
                });
            } catch (err) { console.error(err); }
        };
        fetchAllData();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const markAttendance = async () => {
        if (!selectedSubject) {
            setMessage({ text: 'Please select the subject for this session', type: 'error' });
            return;
        }
        setMarking(true);
        setMessage({ text: 'Verifying location...', type: 'info' });

        if (!navigator.geolocation) {
            setMessage({ text: 'Geolocation is not supported by terminal', type: 'error' });
            setMarking(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const response = await api.post('attendance/mark_attendance/', {
                    latitude, longitude, subject_id: selectedSubject, 
                    class_name: subjects.find(s => s.id === parseInt(selectedSubject))?.name || 'Class'
                });
                setMessage({ text: response.data.message, type: 'success' });
                // Refresh logic
            } catch (err) {
                setMessage({ text: err.response?.data?.error || 'Verification failed', type: 'error' });
            } finally { setMarking(false); }
        }, () => {
            setMessage({ text: 'Signal lost. Enable GPS', type: 'error' });
            setMarking(false);
        });
    };

    const NavItem = (props) => {
        const { icon: Icon, label, to } = props;
        const isActive = location.pathname === `/student${to === '/' ? '' : to}`;
        return (
            <motion.div whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }}>
                <Link to={`/student${to}`} onClick={() => setIsMobileMenuOpen(false)} className={`nav-item ${isActive ? 'active' : ''}`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{label}</span>
                    {isActive && <motion.div layoutId="activeNavStudent" className="active-indicator" />}
                </Link>
            </motion.div>
        );
    };

    const OverviewView = () => (
        <div className="space-y-10">
            <Reveal>
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-white">Academic <span className="text-primary-500">Pulse</span></h1>
                    <p className="text-slate-400 font-medium tracking-tight">Welcome back, {user.first_name}. Your participation matrix is live.</p>
                </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Reveal delay={0.1}>
                    <div className="stat-card bg-primary-600/10 border-primary-600/20 text-white">
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Attendance Score</p>
                                <h3 className="text-4xl font-black">{overallStats.percentage}%</h3>
                             </div>
                             <div className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><TrendingUp size={24} /></div>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full mt-6 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${overallStats.percentage}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className={`h-full ${overallStats.percentage < 85 ? 'bg-rose-500' : 'bg-primary-500'}`} />
                        </div>
                        <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Min. Requirement: 85%</p>
                    </div>
                </Reveal>
                <Reveal delay={0.2}>
                    <div className="stat-card bg-emerald-600/10 border-emerald-600/20 text-white">
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Presence Logic</p>
                                <h3 className="text-4xl font-black">{overallStats.present}</h3>
                             </div>
                             <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><User size={24} /></div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 mt-6 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                            Verified Terminal Sessions
                        </p>
                    </div>
                </Reveal>
                <Reveal delay={0.3}>
                    <Link to="/student/mark" className="stat-card group bg-slate-900 border-slate-800 flex flex-col items-center justify-center text-center hover:border-primary-500 transition-all shadow-2xl">
                        <div className="w-16 h-16 bg-primary-600 rounded-[1.5rem] flex items-center justify-center text-white mb-4 shadow-xl shadow-primary-600/20 group-hover:scale-110 transition-transform">
                            <MapPin size={32} />
                        </div>
                        <span className="font-black uppercase text-xs tracking-[0.2em] text-primary-500">Quick Mark</span>
                        <p className="text-[9px] font-bold text-slate-600 mt-1">Satellite Verification</p>
                    </Link>
                </Reveal>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Reveal delay={0.4}>
                    <div className="glass-card p-8 space-y-6 text-white text-md">
                        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                             <History className="text-primary-500" /> Interaction Log
                        </h3>
                        <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
                            {attendance.slice(0, 15).map((att, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 hover:bg-slate-900 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${att.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                            {att.status === 'present' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-white group-hover:text-primary-400 transition-colors truncate">{att.subject_name}</p>
                                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{new Date(att.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest ${att.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                        {att.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Reveal>

                <Reveal delay={0.5}>
                    <div className="glass-card p-8 space-y-6 text-white text-md">
                        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                             <Calendar className="text-amber-500" /> Holiday Protocol
                        </h3>
                        <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
                            {holidays.filter(h => new Date(h.end_date) >= new Date().setHours(0,0,0,0)).length > 0 ? 
                                holidays.filter(h => new Date(h.end_date) >= new Date().setHours(0,0,0,0)).map(h => (
                                <div key={h.id} className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center gap-5 hover:bg-amber-500/10 transition-all">
                                    <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg"><Calendar size={24} /></div>
                                    <div className="min-w-0">
                                        <p className="font-black text-white uppercase tracking-tight truncate">{h.reason}</p>
                                        <p className="text-[10px] text-amber-500 font-black tracking-widest mt-1 uppercase">
                                            {new Date(h.start_date).toLocaleDateString()} to {new Date(h.end_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-20 opacity-30">
                                    <ShieldCheck size={48} className="mx-auto mb-4" />
                                    <p className="text-sm font-black uppercase tracking-widest">Sky clear • No holidays</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Reveal>
            </div>
            
            <Reveal delay={0.6}>
               <div className="glass-card p-8 text-md text-white">
                  <h3 className="text-xl font-black uppercase tracking-tight mb-8">Performance Matrix</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {subjectStats.map(s => (
                          <div key={s.subject_id} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl hover:border-primary-500 transition-all group">
                              <div className="flex justify-between items-start mb-6">
                                  <div className="min-w-0">
                                      <h4 className="font-bold text-white group-hover:text-primary-400 transition-colors truncate">{s.subject_name}</h4>
                                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-1">Min Level: 85%</p>
                                  </div>
                                  <span className={`px-2.5 py-1 rounded-lg font-black text-[10px] ${s.percentage < 85 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                      {s.percentage}%
                                  </span>
                              </div>
                              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${s.percentage}%` }} className={`h-full ${s.percentage < 85 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                              </div>
                          </div>
                      ))}
                  </div>
               </div>
            </Reveal>
        </div>
    );

    const MarkView = () => (
        <Reveal width="100%">
            <div className="max-w-md mx-auto space-y-6 pt-10 text-white text-md">
                <div className="text-center">
                    <h1 className="text-3xl font-black tracking-tighter">Terminal Mark</h1>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] mt-2">Verified Geofencing Interface</p>
                </div>

                <div className="glass-card p-8 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 to-emerald-500" />
                    <div className="flex flex-col items-center py-4">
                        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-700 ${marking ? 'bg-primary-600/10 text-primary-500 scale-110 shadow-[0_0_30px_rgba(14,165,233,0.3)]' : 'bg-slate-900 text-slate-700'}`}>
                            {marking ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><MapPin size={40} /></motion.div> : <MapPin size={40} />}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Academic Session</label>
                             <CustomSelect options={subjects} value={selectedSubject} onChange={setSelectedSubject} placeholder="Select Subject..." icon={BookOpen} />
                        </div>
                        <button onClick={markAttendance} disabled={marking} className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${marking ? 'bg-slate-800 text-slate-600' : 'bg-primary-600 text-white shadow-xl shadow-primary-600/20 active:scale-95'}`}>
                            {marking ? 'Synchronizing...' : 'Initialize Signature'}
                        </button>
                    </div>
                </div>

                {message.text && (
                    <div className={`p-6 rounded-[2.5rem] border flex items-start gap-4 ${message.type === 'error' ? 'bg-rose-500/5 border-rose-500/20 text-rose-500' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'}`}>
                        <div className={`p-2 rounded-xl text-white ${message.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                             {message.type === 'error' ? <XCircle size={20} /> : <CheckCircle size={20} />}
                        </div>
                        <p className="font-bold text-sm leading-relaxed mt-1.5">{message.text}</p>
                    </div>
                )}
            </div>
        </Reveal>
    );

    const HistoryView = () => (
        <div className="space-y-10 text-white text-md">
            <Reveal>
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-black">History Ledger</h1>
                    <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Chronological participation journal</p>
                </div>
            </Reveal>

            <div className="space-y-4">
                {attendance.map((att, i) => (
                    <Reveal key={i} delay={i * 0.02}>
                        <div className="glass-card p-4 hover:bg-slate-900/50 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${att.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {att.subject_name?.[0]}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg group-hover:text-primary-400 transition-colors uppercase tracking-tight">{att.subject_name}</h4>
                                    <p className="text-[10px] text-slate-500 font-mono tracking-widest">{new Date(att.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <span className={`px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] ${att.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {att.status}
                            </span>
                        </div>
                    </Reveal>
                ))}
            </div>
        </div>
    );

    const StatsView = () => (
        <div className="space-y-10 text-white">
            <Reveal>
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-black">Performance Analytics</h1>
                    <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Deep metrics by subject</p>
                </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {subjectStats.map((s, i) => (
                    <Reveal key={i} delay={i * 0.1}>
                        <div className="glass-card p-8 group hover:border-primary-500 transition-all">
                             <h4 className="font-black text-xl mb-1 uppercase tracking-tighter truncate">{s.subject_name}</h4>
                             <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-8">Course Logic Segment</p>
                             
                             <div className="flex items-end gap-3 mb-4">
                                 <span className="text-5xl font-black tracking-tighter">{s.percentage}%</span>
                                 <span className="text-[10px] font-black uppercase text-slate-600 mb-2 tracking-widest">Efficiency</span>
                             </div>

                             <div className="h-2 bg-slate-900 rounded-full overflow-hidden mb-8">
                                 <motion.div initial={{ width: 0 }} animate={{ width: `${s.percentage}%` }} transition={{ duration: 1.2, delay: 0.5 }} className={`h-full ${s.percentage < 85 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'bg-primary-600 shadow-[0_0_10px_rgba(14,165,233,0.3)]'}`} />
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Present</p>
                                    <p className="text-xl font-black text-emerald-500">{s.present}</p>
                                </div>
                                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total</p>
                                    <p className="text-xl font-black text-slate-400">{s.total}</p>
                                </div>
                             </div>
                        </div>
                    </Reveal>
                ))}
            </div>
        </div>
    );

    const ProfileView = () => (
        <div className="max-w-4xl mx-auto space-y-10 text-white">
            <Reveal>
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tighter">Identity Profile</h1>
                    <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Registered Terminal Credentials</p>
                </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Reveal delay={0.2}>
                    <div className="glass-card p-8 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-[80px] -mr-16 -mt-16" />
                        <div className="flex items-center gap-4 border-b border-slate-800 pb-6 relative z-10 text-md">
                            <div className="w-14 h-14 bg-primary-600/10 text-primary-500 rounded-2xl flex items-center justify-center"><User size={28} /></div>
                            <h3 className="font-black text-xl uppercase tracking-tighter">Core Identity</h3>
                        </div>
                        <div className="space-y-6 relative z-10 text-md">
                            <div><p className="label">Full Name</p><p className="val text-xl font-black">{user.first_name} {user.last_name}</p></div>
                            <div><p className="label">Registration No</p><p className="val-pill inline-block px-4 py-1.5 bg-slate-900 border border-slate-800 text-primary-500 font-mono font-black rounded-xl text-lg tracking-widest">{user.username}</p></div>
                            <div><p className="label">Network Email</p><p className="val text-slate-400 font-bold">{user.email}</p></div>
                        </div>
                    </div>
                </Reveal>
                <Reveal delay={0.4}>
                    <div className="glass-card p-8 space-y-8 text-md">
                        <div className="flex items-center gap-4 border-b border-slate-800 pb-6 text-md text-white">
                            <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center"><Building size={28} /></div>
                            <h3 className="font-black text-xl uppercase tracking-tighter">Academic Node</h3>
                        </div>
                        <div className="space-y-6">
                            <div><p className="label">Branch Name</p><p className="val font-black uppercase tracking-tight">{user.profile?.branch_name || 'N/A'}</p></div>
                            <div><p className="label">Research Domain</p><p className="val font-black uppercase tracking-tight">{user.profile?.domain_name || 'N/A'}</p></div>
                            <div><p className="label">Current Term</p><p className="val font-black uppercase tracking-tight">{user.profile?.semester_name || 'N/A'}</p></div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen text-slate-100 flex font-sans relative z-10 bg-slate-950">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-black text-xl">T</div>
                    <span className="font-black text-xl tracking-tighter">Tap2Present</span>
                </div>
                {!isMobileMenuOpen && <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-300"><Menu size={26} /></button>}
            </div>

            <aside className={`fixed inset-y-0 left-0 z-[100] w-72 bg-slate-900 border-r border-slate-800 p-6 flex flex-col lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto ${isLargeScreen ? 'translate-x-0' : (isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full')} transition-transform duration-500 ease-out`}>
                <div className="flex items-center justify-between lg:block mb-10 mt-4 px-2">
                    <div className="flex items-center gap-4 text-white">
                        <div className="w-12 h-12 bg-primary-600 rounded-[1.25rem] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary-600/20">T</div>
                        <div><h2 className="font-black text-xl tracking-tighter leading-none">Tap2Present</h2><p className="text-[9px] text-primary-500 font-black uppercase tracking-[0.2em] mt-1">Student Terminal</p></div>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-3 -mr-2 text-slate-400"><X size={24} /></button>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link to="/student/profile" onClick={() => setIsMobileMenuOpen(false)} className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 mb-8 flex items-center gap-3 cursor-pointer group hover:border-primary-500/40 transition-all">
                        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-primary-500 font-black group-hover:scale-110 transition-transform">{user?.first_name?.[0]}</div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate leading-tight">{user?.first_name} {user?.last_name}</p>
                            <p className="text-[10px] text-slate-500 font-mono truncate uppercase">{user?.username}</p>
                        </div>
                    </Link>
                </motion.div>

                <nav className="flex-1 space-y-2">
                    <NavItem to="/overview" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem to="/mark" icon={MapPin} label="Check-In" />
                    <NavItem to="/history" icon={History} label="Journal" />
                    <NavItem to="/stats" icon={TrendingUp} label="Matrix" />
                    <NavItem to="/profile" icon={User} label="Identity" />
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-800">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-rose-500 hover:bg-rose-500/10 transition-all duration-300">
                        <LogOut size={20} /><span className="tracking-tight text-sm uppercase">Sign Out Terminal</span>
                    </button>
                </div>
            </aside>

            {isMobileMenuOpen && <div className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />}

            <main className="flex-1 lg:p-10 p-6 pt-24 lg:pt-10 w-full max-w-7xl mx-auto overflow-hidden">
                <Routes>
                    <Route path="overview" element={<OverviewView />} />
                    <Route path="mark" element={<MarkView />} />
                    <Route path="history" element={<HistoryView />} />
                    <Route path="stats" element={<StatsView />} />
                    <Route path="profile" element={<ProfileView />} />
                    <Route path="/" element={<OverviewView />} />
                </Routes>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                .glass-card { background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(12px); border-radius: 2.5rem; border: 1px solid rgba(255, 255, 255, 0.05); }
                .nav-item { width: 100%; display: flex; align-items: center; gap: 0.75rem; padding: 1rem; border-radius: 1.25rem; font-weight: 700; transition: all 0.3s; position: relative; color: #94a3b8; border: 1px solid transparent; }
                .nav-item:hover { background: rgba(30, 41, 59, 0.5); color: #fff; }
                .nav-item.active { background: #0ea5e9; color: #fff; box-shadow: 0 10px 15px -3px rgba(14, 165, 233, 0.3); border: 1px solid rgba(14, 165, 233, 0.5); }
                .nav-item span { font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.1em; }
                .active-indicator { position: absolute; left: -1rem; width: 0.375rem; height: 2rem; background: #0ea5e9; border-top-right-radius: 9999px; border-bottom-right-radius: 9999px; box-shadow: 0 0 15px rgba(14, 165, 233, 0.5); }
                
                .stat-card { padding: 2rem; border-radius: 2.5rem; border: 1px solid transparent; transition: all 0.3s; }
                .label { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; color: #64748b; margin-bottom: 0.5rem; }
            `}} />
        </div>
    );
};

export default StudentDashboard;
