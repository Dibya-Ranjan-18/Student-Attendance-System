import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    GraduationCap, Mail, Phone,
    Building, LayoutDashboard, ChevronRight, 
    ChevronLeft, Loader2, ShieldCheck, User, CheckCircle2
} from 'lucide-react';
import api from '../api/axios';
import { useNotification } from '../context/NotificationContext';
import CustomSelect from '../components/CustomSelect';
import { jwtDecode } from 'jwt-decode';
import { GoogleLogin } from '@react-oauth/google';
import Reveal from '../components/Reveal';

const Register = () => {
    const [step, setStep] = useState(0); // 0: Google Verify, 1: Profile, 2: Academic
    const [loading, setLoading] = useState(false);
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
            
            setFormData(prev => ({
                ...prev,
                first_name: decoded.given_name || '',
                last_name: decoded.family_name || '',
                email: decoded.email || '',
                google_token: token
            }));
            
            setStep(1);
            addNotification("Identity verified via Google", "success");
        } catch {
            addNotification("Verification processing failed", "error");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Ensure registration_no and full_name are sent correctly (matching backend expectation)
        const submissionData = {
            ...formData,
            registration_no: formData.username, // the field used for Reg ID in state
            full_name: `${formData.first_name} ${formData.last_name}`.trim()
        };
        try {
            await api.post('register/', submissionData);
            setSuccess(true);
            addNotification("Registration submitted! Pending admin approval.", "success");
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || "Registration failed. Check details.";
            addNotification(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

    const nextStep = () => { setDirection(1); setStep(prev => prev + 1); };
    const prevStep = () => { setDirection(-1); setStep(prev => prev - 1); };

    const stepVariants = {
        enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
        center: { opacity: 1, x: 0 },
        exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
                {/* Live Mesh Background Blobs */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <motion.div animate={{ x: [0, 40, 0], y: [0, 60, 0], scale: [1, 1.3, 1] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute -top-[10%] left-[10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[140px] will-change-transform" />
                    <motion.div animate={{ x: [0, -60, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-[30%] -right-[15%] w-[45%] h-[45%] bg-primary-500/15 rounded-full blur-[120px] will-change-transform" />
                    <motion.div animate={{ x: [0, -30, 0], y: [0, -50, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} className="absolute bottom-[0%] left-[15%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[130px] will-change-transform" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] contrast-125 brightness-110 pointer-events-none" />
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-[500px] glass-card text-center p-12 relative z-10"
                >
                    <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight mb-3">
                        Request <span className="text-emerald-500">sent</span>
                    </h2>
                    <p className="text-[10px] font-bold tracking-[0.3em] text-emerald-500/80 mb-6">Access Request Submitted</p>
                    <p className="text-slate-400 mb-10 leading-relaxed font-medium text-sm">Your registration has been submitted and is pending admin approval.</p>
                    <button onClick={() => navigate('/login')} className="w-full glass-button-primary h-14">
                        Back to login
                    </button>
                </motion.div>
                <style dangerouslySetInnerHTML={{ __html: glassStyles }} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative">

            <div className="w-full max-w-xl relative z-10">
            <Reveal width="100%" y={-20} delay={0.1}>
                <div className="mb-8 flex justify-between px-2">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-2 group text-center">
                            <motion.div 
                                animate={{ scale: step === i ? [1, 1.15, 1] : 1, backgroundColor: step >= i ? '#2563eb' : '#0f172a' }}
                                transition={{ duration: 0.4, ease: 'easeInOut' }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border border-slate-800`}
                            >
                                {step > i ? <ShieldCheck size={16} /> : i + 1}
                            </motion.div>
                            <span className={`text-[8px] font-bold tracking-widest transition-colors duration-300 ${step >= i ? 'text-blue-500' : 'text-slate-600'}`}>
                                {i === 0 ? 'Identity' : i === 1 ? 'Profile' : 'Academic'}
                            </span>
                        </div>
                    ))}
                </div>
            </Reveal>

            <Reveal width="100%" y={30} delay={0.2}>
                <motion.div 
                    whileHover={{ y: -3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="glass-card shadow-2xl relative glass-hover overflow-hidden"
                >
                    <AnimatePresence mode="wait" custom={direction}>
                    {step === 0 && (
                        <motion.div
                            key="step-0"
                            custom={direction}
                            variants={stepVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
                            className="text-center py-8 md:py-12 px-6 md:px-10"
                        >
                            <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20 shadow-sm">
                                <ShieldCheck className="text-blue-500" size={40} />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight mb-2">
                                Identity <span className="text-blue-500">Verification</span>
                            </h1>
                            <p className="text-[10px] font-bold tracking-[0.3em] text-blue-500/80 mb-2">Step 01 · Auth Gateway</p>
                            <p className="text-slate-400 text-xs md:text-sm max-w-xs mx-auto mb-10 font-medium">Please verify your institutional identity first.</p>

                            <div className="flex justify-center transition-transform active:scale-95 px-4">
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

                            <div className="mt-10 pt-8 border-t border-slate-800">
                                <Link to="/login" className="text-[10px] font-bold tracking-widest text-slate-500 hover:text-blue-500 transition-colors">
                                    Return to login
                                </Link>
                            </div>
                        </motion.div>
                    )}
                    {step === 1 && (
                        <motion.form
                            key="step-1"
                            custom={direction}
                            variants={stepVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
                            onSubmit={(e) => { e.preventDefault(); nextStep(); }}
                            className="space-y-5 p-6 md:p-10"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                                    Personal <span className="text-blue-500">profile</span>
                                </h2>
                                <p className="text-[10px] font-bold text-blue-500/80 tracking-[0.3em] mt-2">Step 02 · Identity Data</p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold tracking-[0.2em] text-slate-500 ml-1 opacity-70">First name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                        <input className="w-full glass-input has-icon" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold tracking-[0.2em] text-slate-500 ml-1 opacity-70">Last name</label>
                                    <input className="w-full glass-input" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} required />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold tracking-[0.2em] text-slate-500 ml-1 opacity-70">Email access key</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 z-10 pointer-events-none" size={18} />
                                    <input className="w-full glass-input has-icon opacity-60 cursor-not-allowed overflow-hidden text-ellipsis" value={formData.email} readOnly />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold tracking-[0.2em] text-slate-500 ml-1 opacity-70">Reg number</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        className="w-full glass-input [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        placeholder="e.g. 2201304025"
                                        value={formData.username}
                                        onChange={e => setFormData({...formData, username: e.target.value.replace(/\D/g, '')})}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold tracking-[0.2em] text-slate-500 ml-1 opacity-70">Password</label>
                                    <input type="password" className="w-full glass-input" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2 mt-2">
                                <button type="button" onClick={prevStep} className="flex-none w-16 bg-slate-800/60 hover:bg-slate-800 text-slate-400 h-14 rounded-xl font-bold text-[10px] tracking-widest transition-all border border-slate-700/50 flex items-center justify-center gap-1">
                                    <ChevronLeft size={16} /> Back
                                </button>
                                <button type="submit" className="flex-1 glass-button-primary h-14 font-bold whitespace-nowrap">
                                    Next step <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.form>
                    )}
                    {step === 2 && (
                        <motion.form
                            key="step-2"
                            custom={direction}
                            variants={stepVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
                            onSubmit={handleSubmit}
                            className="space-y-5 p-6 md:p-10"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                                    Academic <span className="text-emerald-500">details</span>
                                </h2>
                                <p className="text-[10px] font-bold text-emerald-500/80 tracking-[0.3em] mt-2">Step 03 · Final Data</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold tracking-[0.2em] text-slate-500 ml-1 opacity-70">Contact number</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                        <input className="w-full glass-input has-icon" placeholder="+91 XXXXX XXXXX" value={formData.phone_no} onChange={e => setFormData({...formData, phone_no: e.target.value})} required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold tracking-[0.2em] text-slate-500 ml-1 opacity-70">Domain</label>
                                        <CustomSelect options={academicData.domains} value={formData.domain} onChange={v => setFormData({...formData, domain: v})} placeholder="Search Domains" icon={GraduationCap} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold tracking-[0.2em] text-slate-500 ml-1 opacity-70">Branch</label>
                                        <CustomSelect options={academicData.branches} value={formData.branch} onChange={v => setFormData({...formData, branch: v})} placeholder="Search Branch" icon={Building} />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold tracking-[0.2em] text-slate-500 ml-1 opacity-70">Assigned semester</label>
                                    <CustomSelect options={academicData.semesters} value={formData.semester} onChange={v => setFormData({...formData, semester: v})} placeholder="Select Active Term" icon={LayoutDashboard} />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={prevStep} className="flex-none w-16 bg-slate-800/60 hover:bg-slate-800 text-slate-400 h-14 rounded-xl font-bold text-[10px] tracking-widest transition-all border border-slate-700/50 flex items-center justify-center gap-1">
                                    <ChevronLeft size={16} /> Back
                                </button>
                                <button type="submit" disabled={loading} className="flex-1 glass-button-primary h-14 font-bold whitespace-nowrap">
                                    {loading ? <Loader2 className="animate-spin" /> : 'Request access'}
                                </button>
                            </div>
                        </motion.form>
                    )}
                    </AnimatePresence>
                </motion.div>
            </Reveal>

                <div className="text-center mt-8">
                    <Link to="/login" className="text-[10px] font-bold text-slate-600 hover:text-blue-500 tracking-[0.3em] transition-colors">
                        Already enrolled? <span className="text-slate-500">Sign in</span>
                    </Link>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: glassStyles }} />
        </div>
    );
};

const glassStyles = `
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
    .glass-input {
        background: rgba(15, 23, 42, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 0.875rem;
        padding-top: 1rem;
        padding-right: 1rem;
        padding-bottom: 1rem;
        padding-left: 1rem;
        color: white;
        transition: all 0.3s ease;
        width: 100%;
        height: 3.25rem;
    }
    .glass-input.has-icon {
        padding-left: 3rem !important;
    }
    .glass-input:focus {
        background: rgba(15, 23, 42, 0.6);
        border-color: #3b82f6;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        outline: none;
    }
`;

export default Register;
