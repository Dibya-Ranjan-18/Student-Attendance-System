import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
    LayoutDashboard, MapPin, Calendar, TrendingUp, History, 
    User, LogOut, Menu, X, ShieldCheck, ShieldAlert, 
    CheckCircle, XCircle, AlertTriangle, ArrowRight, BookOpen, Info,
    Mail, Phone, Cpu, Globe, Building, GraduationCap
} from 'lucide-react';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
    CartesianGrid, Tooltip, PieChart, Pie, Cell 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '../context/LoadingContext';
import CustomSelect from '../components/CustomSelect';
import LoadingOverlay from '../components/LoadingOverlay';
import Reveal, { RevealList } from '../components/Reveal';
import logo from '../assets/logo.png';



const sectionVariants = {
    initial: { 
        opacity: 0, 
        clipPath: 'inset(10% 0 10% 0)', 
        scale: 1.02, 
        filter: 'blur(10px)' 
    },
    animate: { 
        opacity: 1, 
        clipPath: 'inset(0% 0 0% 0)', 
        scale: 1, 
        filter: 'blur(0px)' 
    },
    exit: { 
        opacity: 0, 
        clipPath: 'inset(10% 0 10% 0)', 
        scale: 0.98, 
        filter: 'blur(5px)',
        transition: { duration: 0.3 } 
    },
    transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] 
    }
};


const containerVariants = {
    animate: {
        transition: {
            staggerChildren: 0.06
        }
    }
};

const itemVariants = {
    initial: { opacity: 0, y: 12, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
};

const sidebarVariants = {
    open: { 
        x: 0,
        visibility: "visible",
        transition: { 
            type: "spring",
            damping: 28,
            stiffness: 250,
            mass: 1,
            restDelta: 0.001
        }
    },
    closed: { 
        x: "-100%",
        transitionEnd: { 
            visibility: "hidden" 
        },
        transition: { 
            type: "tween",
            duration: 0.3,
            ease: "easeInOut"
        }
    }
};

// Navigation Item Component
const NavItem = ({ to, icon: Icon, label, setIsMobileMenuOpen }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <motion.div 
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="group"
        >
            <Link 
                to={to}
                onClick={() => { setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-200 ${
                    isActive 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30 border border-primary-500/50' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border border-transparent hover:border-slate-700/50'
                }`}
            >
                <Icon size={20} strokeWidth={2.5} className={`transition-colors duration-200 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-200"}`} />
                <span className="tracking-tight text-sm">{label}</span>
            </Link>
        </motion.div>
    );
};

// Sub-Views
const OverviewView = ({ subjectStats, overallStats, attendance, holidays, user }) => {
    const navigate = useNavigate();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return { text: 'Good Morning', emoji: '☀️' };
        if (hour >= 12 && hour < 17) return { text: 'Good Afternoon', emoji: '⛅' };
        if (hour >= 17 && hour < 21) return { text: 'Good Evening', emoji: '🌆' };
        return { text: 'Good Night', emoji: '🌙' };
    };

    const greeting = getGreeting();

    return (
        <motion.div 
            variants={sectionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-8"
        >
        <Reveal width="100%">
            {/* Greeting Section */}
            <div className="px-1 py-2">
                <div className="flex flex-col gap-1.5">
                    <motion.p
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-slate-500 uppercase flex items-center gap-2"
                    >
                        <span>{greeting.emoji}</span>
                        <span>{greeting.text}</span>
                    </motion.p>

                    <motion.h1
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
                        className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight"
                    >
                        <span className="text-primary-500">{user?.first_name || 'Student'}</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                        className="text-slate-400 text-xs sm:text-sm font-medium mt-0.5 italic"
                    >
                        &ldquo;Be consistent in marking attendance, so you can be consistent in your life.&rdquo;
                    </motion.p>
                </div>
            </div>
        </Reveal>


        <Reveal width="100%">
            <div className="space-y-3">
                {subjectStats.filter(s => s.percentage < 85).map(s => (
                    <div key={s.subject_id} className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 text-rose-500 animate-pulse">
                        <ShieldAlert size={20} className="shrink-0" />
                        <p className="text-[11px] font-bold tracking-tight">
                            Your attendance in <span className="underline decoration-2">{s.subject_name}</span> is below 85%. Attend class daily to maintain attendance!
                        </p>
                    </div>
                ))}
            </div>
        </Reveal>


        <Reveal delay={0.1} width="100%">
            <motion.div 
                variants={containerVariants}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                {/* ... cards ... */}
                <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.01 }} 
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="glass-card p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary-600/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary-600/10 transition-colors"></div>
                    <p className="text-slate-500 text-[9px] font-bold tracking-widest mb-1">Overall Percentage</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">{overallStats.percentage}%</h3>
                    <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
                        <div className={`h-full ${overallStats.percentage < 85 ? 'bg-rose-500' : 'bg-primary-600'}`} style={{ width: `${overallStats.percentage}%` }}></div>
                    </div>
                </motion.div>
                
                <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.01 }} 
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="glass-card p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-600/10 transition-all"></div>
                    <p className="text-slate-500 text-[9px] font-bold tracking-widest mb-1">Total Present</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">{overallStats.present}</h3>
                    <p className="text-[10px] text-slate-500 font-medium mt-1">Sessions Attended</p>
                </motion.div>

                <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.02 }} 
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="glass-card p-4 rounded-[1.5rem] flex items-center justify-center cursor-pointer group" 
                    style={{ isolation: 'isolate' }}
                    onClick={() => navigate('/student/mark')}
                >
                    <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-br from-primary-600/0 to-primary-600/0 group-hover:from-primary-600/5 group-hover:to-primary-400/5 transition-all duration-500 pointer-events-none" />
                    <div className="absolute inset-0 rounded-[1.5rem] border border-transparent group-hover:border-primary-500/30 transition-all duration-500 pointer-events-none" />
                    <div className="text-center relative z-10">
                        <motion.div 
                            whileHover={{ scale: 1.12, rotate: -4 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="w-14 h-14 bg-primary-600 text-white rounded-[1.25rem] flex items-center justify-center mx-auto mb-3 shadow-xl shadow-primary-600/20"
                        >
                            <MapPin size={28} />
                        </motion.div>
                        <span className="text-[11px] font-bold tracking-[0.2em] text-primary-500 group-hover:text-primary-400 transition-colors duration-500">Quick Mark</span>
                    </div>
                </motion.div>
            </motion.div>
        </Reveal>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-stretch">
            <Reveal delay={0.2} width="100%">
                <div className="glass-card p-5 md:p-8 rounded-[2rem] h-full flex flex-col">
                    <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 text-white tracking-tight">Recent Activity</h3>
                    <motion.div 
                        variants={containerVariants} 
                        initial="initial" 
                        animate="animate" 
                        className="space-y-4 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar flex-grow"
                    >
                        {attendance.slice(0, 15).map((att, i) => (
                            <div key={i} className="flex items-center justify-between p-3 md:p-4 bg-slate-800/30 rounded-xl md:rounded-2xl border border-slate-800/50 hover:bg-slate-800/50 transition-all group">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className={`p-1.5 md:p-2 rounded-lg md:rounded-xl ${att.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                        {att.status === 'present' ? <CheckCircle size={16} className="md:size-[18px]" /> : <XCircle size={16} className="md:size-[18px]" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm md:text-base text-slate-200 truncate">{att.subject_name}</p>
                                        <p className="text-[9px] md:text-xs text-slate-500 font-mono mt-0.5">{new Date(att.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`text-[9px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl shrink-0 ${att.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {att.status}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </Reveal>

            <Reveal delay={0.3} width="100%">
                <div className="glass-card p-5 md:p-8 rounded-[2rem] h-full flex flex-col">
                    <h3 className="text-lg font-bold mb-6 text-white tracking-tight">Upcoming Holidays</h3>
                    <motion.div 
                        variants={containerVariants} 
                        initial="initial" 
                        animate="animate" 
                        className="space-y-4 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar flex-grow"
                    >
                        {holidays.filter(h => new Date(h.end_date) >= new Date().setHours(0,0,0,0)).length > 0 ? 
                            holidays
                            .filter(h => new Date(h.end_date) >= new Date().setHours(0,0,0,0))
                            .sort((a,b) => new Date(a.start_date) - new Date(b.start_date))
                            .map(h => (
                            <motion.div variants={itemVariants} key={h.id} className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center gap-4 hover:bg-amber-500/10 transition-all">
                                <div className="text-amber-500">
                                    <Calendar size={24} />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-sm text-slate-200 truncate">{h.reason}</p>
                                    <p className="text-[10px] text-amber-500/60 font-mono font-bold">
                                        {new Date(h.start_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                        {h.start_date !== h.end_date && (
                                            <> <span className="text-amber-500/40 font-sans mx-1">to</span> {new Date(h.end_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</>
                                        )}
                                    </p>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="text-center py-10 opacity-30">
                                <Calendar size={40} className="mx-auto mb-3" />
                                <p className="text-sm">No upcoming holidays</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </Reveal>
        </div>
    </motion.div>
    );
};

const MarkView = ({ marking, selectedSubject, setSelectedSubject, subjects, markAttendance, message }) => (
    <motion.div 
        variants={sectionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-md mx-auto space-y-4 pt-2 lg:pt-0"
    >
        <Reveal width="100%">
            <div className="text-center px-4">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Attendance <span className="text-primary-500">Check-In</span></h1>

                <p className="text-slate-500 text-[9px] sm:text-[10px] mt-1">Verified geofencing entry</p>
            </div>
        </Reveal>

        <Reveal delay={0.1} width="100%">
            <div className="glass-card p-5 md:p-6 rounded-[2.5rem] shadow-2xl relative">
                <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 to-emerald-500"></div>
                </div>
                
                <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center py-2">
                        <motion.div 
                            animate={marking ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all duration-500 ${marking ? 'bg-primary-600/10 text-primary-500 outline outline-4 outline-primary-500/20' : 'bg-slate-800 text-slate-500 cursor-pointer'}`}>
                            {marking && (
                                <motion.div 
                                    animate={{ y: [0, 64, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute top-0 left-0 right-0 h-0.5 bg-primary-500/80 shadow-[0_0_20px_rgba(14,165,233,1)] z-10"
                                />
                            )}
                            <MapPin size={32} className="sm:size-[36px]" />
                        </motion.div>
                        <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] text-slate-500 mt-4 opacity-70">Secure Location Verify</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <CustomSelect
                                options={subjects}
                                value={selectedSubject}
                                onChange={setSelectedSubject}
                                placeholder="Choose session..."
                                label="Active Subject"
                                icon={BookOpen}
                            />
                        </div>

                        <button 
                            onClick={markAttendance}
                            disabled={marking}
                            className={`w-full py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm tracking-wider transition-all flex items-center justify-center gap-2 ${
                                marking 
                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                                : 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/20 active:scale-[0.98]'
                            }`}
                        >
                            {marking ? 'Processing...' : 'Verify & Mark Attendance'}
                            {!marking && <ArrowRight size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        </Reveal>

        {message.text && (
            <Reveal delay={0.2} width="100%">
                <div className={`p-6 rounded-[2rem] border-2 flex items-start gap-4 animate-in slide-in-from-top-4 duration-300 ${
                    message.type === 'error' ? 'bg-rose-500/5 border-rose-500/20 text-rose-400' :
                    message.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' :
                    message.type === 'info' ? 'bg-blue-500/5 border-blue-500/20 text-blue-400' :
                    'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                }`}>
                    <div className={`p-2 rounded-xl shrink-0 ${
                        message.type === 'error' ? 'bg-rose-500 text-white' :
                        message.type === 'warning' ? 'bg-amber-500 text-white' :
                        message.type === 'info' ? 'bg-blue-500 text-white' :
                        'bg-emerald-500 text-white'
                    }`}>
                        {message.type === 'error' ? <XCircle size={20} /> : 
                        message.type === 'warning' ? <AlertTriangle size={20} /> :
                        message.type === 'info' ? <Info size={20} /> : <CheckCircle size={20} />}
                    </div>
                    <p className="text-sm font-bold leading-normal mt-1.5">{message.text}</p>
                </div>
            </Reveal>
        )}
    </motion.div>
);


const HistoryView = ({ attendance }) => (
    <motion.div 
        variants={sectionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-8"
    >
        <Reveal width="100%">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Attendance <span className="text-primary-500">History</span></h1>

                </div>
            </div>
        </Reveal>

        <RevealList delay={0.1} width="100%">

            {attendance.length > 0 ? attendance.map((att, i) => (
                <div key={i} className="glass-card rounded-xl md:rounded-[2rem] p-3 md:px-6 md:py-4 hover:bg-slate-800/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-4 group">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className={`w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 ${att.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            <BookOpen size={16} className="md:size-[18px]" />
                        </div>
                        <div className="overflow-hidden min-w-0">
                            <span className="font-bold text-white group-hover:text-primary-400 transition-colors block text-xs md:text-base truncate">{att.subject_name}</span>
                            <span className="md:hidden text-[9px] text-slate-500 font-mono font-bold tracking-widest mt-0.5 block">{new Date(att.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    <div className="hidden md:block font-medium">
                        <span className="text-slate-200 block text-sm">{new Date(att.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                        <span className="text-slate-500 text-[9px] font-mono mt-0.5 block">{att.time?.slice(0, 5) || '--:--'}</span>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 md:gap-5 border-t border-slate-800/50 pt-2.5 md:border-0 md:pt-0">
                        <div className="md:hidden">
                            <span className="text-slate-500 text-[9px] font-mono font-bold tracking-tight">{att.time?.slice(0, 5) || '--:--'}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 md:px-3.5 md:py-1 rounded-lg md:rounded-full text-[8px] md:text-[9px] font-bold tracking-widest ${
                            att.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                            {att.status}
                        </span>
                    </div>
                </div>
            )) : (
                <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-[3rem] opacity-30 flex flex-col items-center">
                    <History size={48} className="text-slate-500 mb-4" />
                    <p className="text-sm text-slate-400 font-medium">No participation records yet</p>
                </div>
            )}
        </RevealList>
    </motion.div>
);


const StatsView = ({ subjectStats }) => (
    <motion.div 
        variants={sectionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-8"
    >
        <Reveal width="100%">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Performance <span className="text-primary-500">Matrix</span></h1>

                    <p className="text-slate-400 text-xs md:text-sm mt-1">Detailed subject-wise participation analytics</p>
                </div>
            </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <RevealList delay={0.1} interval={0.08} width="100%">
                {subjectStats.map(s => (
                    <motion.div whileHover={{ scale: 1.01 }} key={s.subject_id} className={`group glass-card p-3.5 md:p-4 rounded-[1.25rem] md:rounded-[1.5rem] transition-all ${s.percentage < 85 ? 'border-rose-500/30' : 'hover:border-primary-500/40'}`}>
                        <div className="flex justify-between items-start mb-2 md:mb-3">
                            <div className="min-w-0">
                                <h4 className="text-xs md:text-sm font-bold text-white group-hover:text-primary-400 transition-colors leading-tight truncate">{s.subject_name}</h4>
                                <p className="text-[7px] md:text-[8px] text-slate-500 font-bold tracking-widest mt-0.5">Min: 85%</p>
                            </div>
                            <div className={`px-2 py-0.5 md:px-2 md:py-1 rounded-lg font-bold text-[10px] md:text-xs shrink-0 ${s.percentage < 85 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                {s.percentage}%
                            </div>
                        </div>

                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mb-2 md:mb-3">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${s.percentage < 85 ? 'bg-rose-500' : 'bg-primary-500'}`} 
                                style={{ width: `${s.percentage}%` }}
                            ></div>
                        </div>

                        <div className="flex items-center justify-between text-[8px] md:text-[9px] font-bold tracking-wider text-slate-500">
                            <div className="flex gap-2.5 md:gap-4">
                                <span>P: {s.present}</span>
                                <span className="opacity-40">|</span>
                                <span>T: {s.total}</span>
                            </div>
                            {s.percentage < 85 ? (
                                <span className="text-rose-500 flex items-center gap-1"><ShieldAlert size={9} className="md:size-[11px]" /> Critical</span>
                            ) : (
                                <span className="text-emerald-500 flex items-center gap-1"><ShieldCheck size={9} className="md:size-[11px]" /> Secure</span>
                            )}
                        </div>
                        
                        {s.percentage < 85 && (
                            <div className="mt-6 pt-6 border-t border-rose-500/10">
                                <p className="text-[10px] text-rose-400 font-bold leading-relaxed italic">
                                    "Your attendance in {s.subject_name} is below 85%. Attend class daily to maintain attendance!"
                                </p>
                            </div>
                        )}
                    </motion.div>
                ))}
            </RevealList>
        </div>
    </motion.div>

);

const ProfileView = ({ user, setIsMobileMenuOpen }) => (
    <motion.div 
        variants={sectionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-4xl mx-auto space-y-6 md:space-y-8"
    >
        <Reveal width="100%">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold tracking-tight text-white">Student <span className="text-primary-500">Profile</span></h1>

                    <p className="text-slate-400 text-[10px] md:text-sm mt-1">Your registered academic and personal information</p>
                </div>
                <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-500 font-bold text-[10px] tracking-widest self-start md:self-auto">
                    <ShieldCheck size={14} className="md:size-[16px]" /> Verified Profile
                </div>
            </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
            {/* Personal Details */}
            <Reveal delay={0.1} width="100%">
                <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 space-y-5 md:space-y-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary-600/10 transition-all"></div>
                    <div className="flex items-center gap-3 pb-3 md:pb-4 border-b border-slate-800 relative z-10">
                        <div className="p-1.5 md:p-2 bg-primary-600/10 rounded-lg text-primary-500">
                            <User size={18} className="md:size-[20px]" />
                        </div>
                        <h3 className="font-bold text-base md:text-lg tracking-tight text-white">Identity Matrix</h3>
                    </div>
                    
                    <div className="space-y-5 md:space-y-6 relative z-10">
                        <div>
                            <p className="text-[9px] md:text-[10px] text-slate-500 font-bold tracking-[0.2em] mb-1.5 opacity-60">Full Name</p>
                            <p className="text-white font-bold text-lg md:text-xl tracking-tight leading-tight">{user.first_name} {user.last_name}</p>
                        </div>
                        <div>
                            <p className="text-[9px] md:text-[10px] text-slate-500 font-bold tracking-[0.2em] mb-1.5 opacity-60">Identity / Registration No</p>
                            <div className="inline-block px-3 py-1 bg-slate-800 rounded-lg border border-slate-700">
                                <p className="text-white font-mono text-base md:text-lg font-bold text-primary-400 tracking-widest">{user.username}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                            <div className="p-3 md:p-4 bg-slate-800/40 rounded-xl md:rounded-2xl border border-slate-800 hover:border-slate-700 transition-all" >
                                <p className="text-[8px] md:text-[9px] text-slate-500 font-bold tracking-widest mb-1.5 flex items-center gap-1.5"><Mail size={10} className="text-primary-500 md:size-[12px]" /> Web Email</p>
                                <p className="text-slate-200 text-[11px] md:text-xs font-bold truncate">{user.email}</p>
                            </div>
                            <div className="p-3 md:p-4 bg-slate-800/40 rounded-xl md:rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
                                <p className="text-[8px] md:text-[9px] text-slate-500 font-bold tracking-widest mb-1.5 flex items-center gap-1.5"><Phone size={10} className="text-primary-500 md:size-[12px]" /> Phone Contact</p>
                                <p className="text-slate-200 text-[11px] md:text-xs font-bold">{user.profile?.phone_no || 'Not Linked'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Reveal>

            {/* Academic Info */}
            <Reveal delay={0.2} width="100%">
                <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 space-y-5 md:space-y-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-all"></div>
                    <div className="flex items-center gap-3 pb-3 md:pb-4 border-b border-slate-800 relative z-10">
                        <div className="p-1.5 md:p-2 bg-amber-500/10 rounded-lg text-amber-500">
                            <GraduationCap size={18} className="md:size-[20px]" />
                        </div>
                        <h3 className="font-bold text-base md:text-lg tracking-tight text-white">Academic Status</h3>
                    </div>

                    <div className="space-y-5 md:space-y-6 relative z-10">
                        <div className="flex items-center gap-3 md:gap-4 p-4 md:p-5 bg-slate-800/30 rounded-xl md:rounded-2xl border border-slate-800 shadow-inner group-hover:border-slate-700 transition-all">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-600/10 rounded-lg md:rounded-xl flex items-center justify-center text-primary-500 shrink-0 shadow-lg">
                                <Building size={20} className="md:size-[24px]" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] md:text-[10px] text-slate-500 font-bold tracking-widest opacity-60">Enrolled Branch / Stream</p>
                                <p className="text-white font-bold text-base md:text-lg tracking-tight truncate leading-tight">{user.profile?.branch_name || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                            <div className="flex items-center gap-3 p-3 md:p-4 bg-slate-800/30 rounded-xl border border-slate-800">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-500/10 rounded-lg md:rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                                    <Globe size={16} className="md:size-[20px]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[8px] md:text-[9px] text-slate-500 font-bold tracking-widest mb-0.5 opacity-60 leading-none">Domain</p>
                                    <p className="text-white font-bold text-xs md:text-sm tracking-tight truncate">{user.profile?.domain_name || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 md:p-4 bg-slate-800/30 rounded-xl border border-slate-800">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-500/10 rounded-lg md:rounded-xl flex items-center justify-center text-indigo-500 shrink-0">
                                    <LayoutDashboard size={16} className="md:size-[20px]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[8px] md:text-[9px] text-slate-500 font-bold tracking-widest mb-0.5 opacity-60 leading-none">Semester</p>
                                    <p className="text-white font-bold text-xs md:text-sm tracking-tight truncate">{user.profile?.semester_name || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Reveal>
        </div>

        <Reveal delay={0.3} width="100%">
            <div className="bg-primary-600/5 border border-primary-600/10 p-5 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-primary-600 rounded-xl text-white shadow-lg shadow-primary-600/20">
                    <Info size={18} />
                </div>
                <div>
                    <p className="text-xs font-bold text-white mb-1">Standard Security Protocol</p>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Your profile information is strictly managed by the academic administration. To update any details like mobile number or branch, please visit the HOD/Admin office with valid proof.</p>
                </div>
            </div>
        </Reveal>
    </motion.div>

);

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const { addNotification } = useNotification();
    const { setIsLoading } = useLoading();
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
    const [overallStats, setOverallStats] = useState({ present: 0, absent: 0, percentage: 0 });


    useEffect(() => {
        const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        const fetchAllData = async () => {
            setIsLoading(true);
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

                // Calculate overall stats from subject stats
                const totalPresent = statsRes.data.reduce((acc, s) => acc + s.present, 0);
                const totalSessions = statsRes.data.reduce((acc, s) => acc + s.total, 0);
                const perc = totalSessions > 0 ? (totalPresent / totalSessions * 100) : 0;
                
                setOverallStats({
                    present: totalPresent,
                    total: totalSessions,
                    percentage: Math.round(perc)
                });

                // Check for consecutive absence warnings — group by UNIQUE DATES first.
                // History has multiple records per day (one per subject), so we must
                // deduplicate by date before checking. A "day" counts as absent only
                // if every record on that date is absent (student didn't attend anything).
                const threeDaysAgo = new Date();
                threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                threeDaysAgo.setHours(0, 0, 0, 0);

                // Build a map: date → [ statuses ]
                const dateStatusMap = {};
                for (const rec of attRes.data) {
                    if (!dateStatusMap[rec.date]) dateStatusMap[rec.date] = [];
                    dateStatusMap[rec.date].push(rec.status);
                }

                // Sort unique dates descending, keep only ones within last 3 days
                const recentDates = Object.keys(dateStatusMap)
                    .filter(d => new Date(d) >= threeDaysAgo)
                    .sort((a, b) => new Date(b) - new Date(a));

                // A day is "fully absent" when no present record exists for that day
                const fullyAbsent = (d) => !dateStatusMap[d].includes('present');

                if (recentDates.length >= 2 && fullyAbsent(recentDates[0]) && fullyAbsent(recentDates[1])) {
                    setMessage({ text: "You've been absent for 2 consecutive days. Attend regularly!", type: 'warning' });
                }
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setIsLoading(false);
            }
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
            setMessage({ text: 'Geolocation is not supported by your browser.', type: 'error' });
            setMarking(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const response = await api.post('attendance/mark_attendance/', {
                    latitude, longitude, subject_id: selectedSubject, 
                    class_name: subjects.find(s => s.id === parseInt(selectedSubject))?.name || 'Academic Class'
                });
                
                setMessage({ text: response.data.message, type: 'success' });
                // Re-fetch data to update UI
                const statsUpdate = await api.get('attendance/my_subject_stats/');
                // Re-calculate overall stats
                const totalPresent = statsUpdate.data.reduce((acc, s) => acc + s.present, 0);
                const totalSessions = statsUpdate.data.reduce((acc, s) => acc + s.total, 0);
                const perc = totalSessions > 0 ? (totalPresent / totalSessions * 100) : 0;
                setOverallStats({
                    present: totalPresent,
                    total: totalSessions,
                    percentage: Math.round(perc)
                });

                const attUpdate = await api.get('attendance/student_history/');
                setAttendance(attUpdate.data);
            } catch (err) {
                const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Location out of bounds or unauthorized.';
                setMessage({ text: errorMsg, type: 'error' });
            } finally {
                setMarking(false);
            }
        }, (err) => {
            setMessage({ text: 'Location access denied. Please enable GPS and try again.', type: 'error' });
            setMarking(false);
        }, { enableHighAccuracy: true, timeout: 10000 });
    };

    return (
        <div className="min-h-screen text-slate-100 flex font-sans overflow-hidden relative">

            <div className="relative z-10 flex w-full h-screen overflow-hidden">

            {/* Mobile Header Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between">
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

            <motion.aside 
                initial="closed"
                animate={isLargeScreen ? "open" : (isMobileMenuOpen ? "open" : "closed")}
                variants={sidebarVariants}
                style={{ transform: "translateZ(0)", willChange: "transform" }}
                className={`
                    fixed inset-y-0 left-0 z-[100] w-72 glass-sidebar p-6 flex flex-col lg:static overflow-y-auto
                `}
            >
                <div className="flex items-center justify-between lg:block mb-10 mt-4 px-2">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[1.25rem] overflow-hidden shrink-0">
                            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                    <div>
                        <h2 className="font-bold text-xl tracking-tight leading-none text-white flex items-baseline italic">TAP<span className="text-3xl not-italic">2</span><span className="text-primary-500">PRESENT</span></h2>




                        <p className="text-[9px] text-primary-500 font-bold mt-1">Student Portal</p>

                    </div>
                </div>
                <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="lg:hidden p-3 -mr-2 text-slate-400 hover:text-white transition-colors z-[110] cursor-pointer"
                >
                    <X size={24} />
                </motion.button>
                </div>

                <Link 
                    to="/student/profile"
                    onClick={() => { setIsMobileMenuOpen(false); }}
                    className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 mb-8 flex items-center gap-3 cursor-pointer hover:bg-slate-800/60 hover:border-primary-500/30 transition-all group/sidebar-profile"
                >
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-primary-500 font-black group-hover/sidebar-profile:scale-105 transition-transform">
                        {user?.first_name?.[0] || 'S'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white truncate leading-tight">{user?.first_name} {user?.last_name}</p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">{user?.username}</p>
                    </div>
                </Link>

                <nav className="flex-1 space-y-2">
                    <NavItem to="/student/overview" icon={LayoutDashboard} label="Dashboard" setIsMobileMenuOpen={setIsMobileMenuOpen} />
                    <NavItem to="/student/mark" icon={MapPin} label="Mark Attendance" setIsMobileMenuOpen={setIsMobileMenuOpen} />
                    <NavItem to="/student/history" icon={History} label="Attendance History" setIsMobileMenuOpen={setIsMobileMenuOpen} />
                    <NavItem to="/student/stats" icon={TrendingUp} label="Subject Analytics" setIsMobileMenuOpen={setIsMobileMenuOpen} />
                    <NavItem to="/student/profile" icon={User} label="My Profile" setIsMobileMenuOpen={setIsMobileMenuOpen} />
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
                        <span className="tracking-tight text-sm">Sign Out</span>
                    </motion.button>
                </div>
            </motion.aside>

            {/* Main Content Overlay for Mobile */}
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
            <main className="flex-1 lg:p-10 p-4 sm:p-6 pt-20 lg:pt-10 overflow-y-auto w-full relative z-10 custom-scrollbar">
                <div className="w-full h-full">
                    <AnimatePresence mode="wait">
                    <Routes>
                        <Route path="overview" element={<OverviewView subjectStats={subjectStats} overallStats={overallStats} attendance={attendance} holidays={holidays} user={user} />} />
                        <Route path="mark" element={<MarkView marking={marking} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} subjects={subjects} markAttendance={markAttendance} message={message} />} />
                        <Route path="history" element={<HistoryView attendance={attendance} />} />
                        <Route path="stats" element={<StatsView subjectStats={subjectStats} />} />
                        <Route path="profile" element={<ProfileView user={user} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />
                        <Route path="/" element={<OverviewView subjectStats={subjectStats} overallStats={overallStats} attendance={attendance} holidays={holidays} user={user} />} />
                    </Routes>
                </AnimatePresence>
                </div>
            </main>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                .glass-card { 
                    background: rgba(15, 23, 42, 0.15) !important; 
                    backdrop-filter: blur(40px) saturate(180%) !important; 
                    border: 1px solid rgba(255, 255, 255, 0.08) !important; 
                    transition: border-color 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.5s cubic-bezier(0.23, 1, 0.32, 1), background 0.5s cubic-bezier(0.23, 1, 0.32, 1) !important; 
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
                    z-index: 0;
                }
                .glass-card:hover { 
                    background: rgba(20, 30, 55, 0.28) !important;
                    border-color: rgba(14, 165, 233, 0.18) !important; 
                    box-shadow: 0 20px 60px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(14, 165, 233, 0.07) !important; 
                }
                .glass-sidebar {
                    background: rgba(8, 12, 28, 0.75) !important;
                    backdrop-filter: blur(64px) saturate(250%) brightness(0.85) !important;
                    -webkit-backdrop-filter: blur(64px) saturate(250%) brightness(0.85) !important;
                    border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
                    box-shadow: 4px 0 60px rgba(0, 0, 0, 0.6) !important;
                }
            `}} />
        </div>
    );
};

export default StudentDashboard;
