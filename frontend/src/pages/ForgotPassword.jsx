import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ShieldCheck, ArrowLeft, KeyRound, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { useNotification } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import Reveal from '../components/Reveal';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { addNotification } = useNotification();
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('forgot-password/send-otp/', { email });
            addNotification("Verification code sent to your email", "success");
            setStep(2);
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to send OTP';
            setError(msg);
            addNotification(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('forgot-password/verify-otp/', { email, otp });
            addNotification("Code authenticated successfully", "success");
            setStep(3);
        } catch (err) {
            const msg = err.response?.data?.error || 'Invalid OTP';
            setError(msg);
            addNotification(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post('forgot-password/reset-password/', { email, password: newPassword });
            addNotification("Security key updated successfully", "success");
            setSuccess('Secure password updated successfully.');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            const msg = err.response?.data?.error || 'Reset failed';
            setError(msg);
            addNotification(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    const stepVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] bg-primary-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] bg-blue-600/5 rounded-full blur-[100px]"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="max-w-md w-full relative z-10"
            >
                <div className="glass-card shadow-2xl relative overflow-hidden p-6 md:p-10">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
                        <KeyRound size={120} className="text-white" />
                    </div>
                    
                    <div className="text-center mb-10 relative z-10">
                        <Reveal>
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-3xl ${success ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary-500/10 text-primary-500'} mb-6 border border-white/5 shadow-inner`}>
                                {success ? <CheckCircle2 size={32} /> : <ShieldCheck size={32} />}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter mb-2">Account Recovery</h1>
                            <p className="text-primary-500 text-[10px] uppercase tracking-[0.3em] font-black opacity-80">
                                {step === 1 && 'Step 01: Verify Email'}
                                {step === 2 && 'Step 02: Authenticate'}
                                {step === 3 && 'Step 03: Reset Access'}
                                {success && 'Access Restored'}
                            </p>
                        </Reveal>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    {success && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold text-center shadow-lg shadow-emerald-500/10"
                        >
                            {success} Redirecting to secure portal...
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        {!success && (
                            <div className="relative">
                                {step === 1 && (
                                    <motion.form 
                                        key="step1"
                                        variants={stepVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        onSubmit={handleSendOTP} 
                                        className="space-y-6"
                                    >
                                        <Reveal delay={0.1} width="100%">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Academic Email</label>
                                                <div className="relative group">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary-500 transition-colors" size={18} />
                                                    <input
                                                        type="email"
                                                        required
                                                        className="w-full glass-input pl-11 h-14"
                                                        placeholder="name@university.edu"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </Reveal>
                                        <Reveal delay={0.2} width="100%">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full glass-button-primary h-14"
                                            >
                                                {loading ? <Loader2 className="animate-spin" /> : <>Send Verification Code <ChevronRight size={18} /></>}
                                            </button>
                                        </Reveal>
                                    </motion.form>
                                )}

                                {step === 2 && (
                                    <motion.form 
                                        key="step2"
                                        variants={stepVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        onSubmit={handleVerifyOTP} 
                                        className="space-y-6"
                                    >
                                        <Reveal delay={0.1} width="100%">
                                            <div className="space-y-2 text-center">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">6-Digit Identity Code</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full glass-input h-16 text-center text-3xl tracking-[0.5em] font-mono focus:border-primary-500/50"
                                                    placeholder="000000"
                                                    maxLength={6}
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                />
                                                <p className="text-[9px] text-slate-500 mt-4 uppercase tracking-widest font-bold">Code transmitted to your node</p>
                                            </div>
                                        </Reveal>
                                        <Reveal delay={0.2} width="100%">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full glass-button-primary h-14"
                                            >
                                                {loading ? <Loader2 className="animate-spin" /> : <>Verify Identity <ShieldCheck size={18} /></>}
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => setStep(1)}
                                                className="w-full mt-6 text-slate-500 hover:text-primary-500 text-[10px] font-black uppercase tracking-widest transition-colors"
                                            >
                                                Correction Required? Change Email
                                            </button>
                                        </Reveal>
                                    </motion.form>
                                )}

                                {step === 3 && (
                                    <motion.form 
                                        key="step3"
                                        variants={stepVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        onSubmit={handleResetPassword} 
                                        className="space-y-6"
                                    >
                                        <div className="space-y-5">
                                            <Reveal delay={0.1} width="100%">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">New Security Key</label>
                                                    <input
                                                        type="password"
                                                        required
                                                        className="w-full glass-input h-14"
                                                        placeholder="••••••••"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                    />
                                                </div>
                                            </Reveal>
                                            <Reveal delay={0.2} width="100%">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirm Matrix Entry</label>
                                                    <input
                                                        type="password"
                                                        required
                                                        className="w-full glass-input h-14"
                                                        placeholder="••••••••"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                    />
                                                </div>
                                            </Reveal>
                                        </div>
                                        <Reveal delay={0.3} width="100%">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl md:rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest h-14 mt-4"
                                            >
                                                {loading ? <Loader2 className="animate-spin" /> : 'Finalize Encryption Update'}
                                            </button>
                                        </Reveal>
                                    </motion.form>
                                )}
                            </div>
                        )}
                    </AnimatePresence>

                    <Reveal delay={0.5}>
                        <div className="mt-10 pt-8 border-t border-white/5 text-center">
                            <Link to="/login" className="inline-flex items-center gap-3 text-slate-500 hover:text-primary-500 font-black text-[10px] uppercase tracking-[0.2em] transition-all group">
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Base Entry
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
