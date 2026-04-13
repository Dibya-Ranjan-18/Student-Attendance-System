import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    UserPlus, GraduationCap, Mail, Phone, BookOpen, 
    Building, LayoutDashboard, Globe, ChevronRight, 
    ChevronLeft, Loader2, ShieldCheck, User, CheckCircle2
} from 'lucide-react';
import api from '../api/axios';
import { useNotification } from '../context/NotificationContext';
import CustomSelect from '../components/CustomSelect';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';
import Reveal from '../components/Reveal';

const Register = () => {
    const [step, setStep] = useState(0); // 0: Google Verify, 1: Profile, 2: Academic
    const [loading, setLoading] = useState(false);
    const [googleToken, setGoogleToken] = useState(null);
    const [success, setSuccess] = useState(false);
    
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', phone_no: '',
        registration_no: '', domain: '', branch: '', semester: '',
        username: '', password: ''
    });

    const [academicData, setAcademicData] = useState({ domains: [], branches: [], semesters: [] });
    const { addNotification } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAcademic = async () => {
            try {
                const [d, b, s] = await Promise.all([
                    api.get('domains/'), api.get('branches/'), api.get('semesters/')
                ]);
                setAcademicData({ domains: d.data, branches: b.data, semesters: s.data });
            } catch (err) { console.error("Data fetch error", err); }
        };
        fetchAcademic();
    }, []);

    const handleGoogleSuccess = (credentialResponse) => {
        try {
            const token = credentialResponse.credential;
            const decoded = jwtDecode(token);
            setGoogleToken(token);
            
            // Auto-fill from Google
            setFormData(prev => ({
                ...prev,
                first_name: decoded.given_name || '',
                last_name: decoded.family_name || '',
                email: decoded.email || '',
                google_token: token
            }));
            
            setStep(1);
            addNotification("Identity verified via Google", "success");
        } catch (err) {
            addNotification("Verification processing failed", "error");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('requests/', formData);
            setSuccess(true);
            addNotification("Registration submitted! Pending admin approval.", "success");
        } catch (err) {
            const msg = Object.values(err.response?.data || {}).join(' ') || "Registration failed. Check details.";
            addNotification(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const stepVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-[500px] glass-card text-center p-12"
                >
                    <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/10">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tighter mb-4">Request Sent</h2>
                    <p className="text-slate-400 mb-10 leading-relaxed font-medium">Your registration request has been submitted to the administrator. You will be able to login once your account is approved.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full glass-button-primary h-14"
                    >
                        Back to Login Portal
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-primary-600/5 rounded-full blur-[100px]"
                ></motion.div>
                <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-emerald-600/10 rounded-full blur-[100px]"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="w-full max-w-xl relative z-10"
            >
                {/* Progress Bar */}
                <div className="mb-8 flex justify-between px-2">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-2 group">
                            <motion.div 
                                animate={{ 
                                    scale: step === i ? 1.2 : 1,
                                    backgroundColor: step >= i ? 'var(--color-primary-500)' : 'rgba(255,255,255,0.05)'
                                }}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all border border-white/5"
                            >
                                {step > i ? <ShieldCheck size={16} /> : i + 1}
                            </motion.div>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${step >= i ? 'text-primary-400' : 'text-slate-600'}`}>
                                {i === 0 ? 'Identity' : i === 1 ? 'Profile' : 'Academic'}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="glass-card shadow-2xl relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {step === 0 ? (
                            <motion.div 
                                key="step0"
                                variants={stepVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="text-center py-6 md:py-10"
                            >
                                <Reveal>
                                    <div className="w-20 h-20 bg-primary-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary-500/20 shadow-inner">
                                        <ShieldCheck className="text-primary-500" size={40} />
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter mb-3">Identity Verification</h1>
                                    <p className="text-slate-400 text-xs md:text-sm max-w-xs mx-auto mb-10 leading-relaxed font-medium">To maintain a secure academic environment, please verify your institutional identity first.</p>
                                </Reveal>

                                <Reveal delay={0.2} width="100%">
                                    <div className="flex justify-center transition-transform hover:scale-[1.02] active:scale-95 px-4">
                                        <GoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={() => addNotification("Google access denied", "error")}
                                            theme="filled_black"
                                            shape="pill"
                                            size="large"
                                            text="continue_with"
                                            width="100%"
                                        />
                                    </div>
                                </Reveal>

                                <Reveal delay={0.4}>
                                    <div className="mt-10 pt-8 border-t border-white/5">
                                        <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary-500 transition-colors">Already registered? Return to Base</Link>
                                    </div>
                                </Reveal>
                            </motion.div>
                        ) : step === 1 ? (
                            <motion.form 
                                key="step1"
                                variants={stepVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                onSubmit={(e) => { e.preventDefault(); nextStep(); }} 
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">Profile Matrix</h2>
                                    <p className="text-[10px] text-primary-500 font-black uppercase tracking-[0.2em] mt-1">Refining Personal Identity</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <Reveal delay={0.1} width="100%">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">First Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary-500 transition-colors" size={18} />
                                                <input className="w-full glass-input pl-11" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required />
                                            </div>
                                        </div>
                                    </Reveal>
                                    <Reveal delay={0.2} width="100%">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Last Name</label>
                                            <input className="w-full glass-input" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} required />
                                        </div>
                                    </Reveal>
                                </div>

                                <Reveal delay={0.3} width="100%">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Verified Node (Email)</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                            <input className="w-full glass-input pl-11 opacity-60 cursor-not-allowed" value={formData.email} readOnly />
                                        </div>
                                    </div>
                                </Reveal>

                                <div className="grid grid-cols-2 gap-4">
                                    <Reveal delay={0.4} width="100%">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Login ID (Reg No)</label>
                                            <input className="w-full glass-input" placeholder="ID-2024" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
                                        </div>
                                    </Reveal>
                                    <Reveal delay={0.5} width="100%">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Secure Password</label>
                                            <input type="password" className="w-full glass-input" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                                        </div>
                                    </Reveal>
                                </div>

                                <Reveal delay={0.6} width="100%">
                                    <button type="submit" className="w-full glass-button-primary h-14 mt-4">
                                        Construct Academic Node <ChevronRight size={18} />
                                    </button>
                                </Reveal>
                            </motion.form>
                        ) : (
                            <motion.form 
                                key="step2"
                                variants={stepVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                onSubmit={handleSubmit} 
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">Academic Setup</h2>
                                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em] mt-1">Finalizing Domain & Branch</p>
                                </div>
                                
                                <div className="space-y-4">
                                    <Reveal delay={0.1} width="100%">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Contact Number</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary-500 transition-colors" size={18} />
                                                <input className="w-full glass-input pl-11" placeholder="+91 XXXXX XXXXX" value={formData.phone_no} onChange={e => setFormData({...formData, phone_no: e.target.value})} required />
                                            </div>
                                        </div>
                                    </Reveal>

                                    <Reveal delay={0.2} width="100%">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Domain</label>
                                                <CustomSelect options={academicData.domains} value={formData.domain} onChange={v => setFormData({...formData, domain: v})} placeholder="Search Domains" icon={GraduationCap} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Branch</label>
                                                <CustomSelect options={academicData.branches} value={formData.branch} onChange={v => setFormData({...formData, branch: v})} placeholder="Search Branch" icon={Building} />
                                            </div>
                                        </div>
                                    </Reveal>

                                    <Reveal delay={0.3} width="100%">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Assigned Semester</label>
                                            <CustomSelect options={academicData.semesters} value={formData.semester} onChange={v => setFormData({...formData, semester: v})} placeholder="Select Active Term" icon={LayoutDashboard} />
                                        </div>
                                    </Reveal>
                                </div>

                                <Reveal delay={0.4} width="100%">
                                    <div className="flex gap-4 pt-4">
                                        <button type="button" onClick={prevStep} className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 py-4 rounded-xl md:rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                                            <ChevronLeft size={18} className="inline" /> Back
                                        </button>
                                        <button type="submit" disabled={loading} className="flex-[2] glass-button-primary h-14">
                                            {loading ? <Loader2 className="animate-spin" /> : 'Finalize Encryption & Request Access'}
                                        </button>
                                    </div>
                                </Reveal>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
