import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ShieldCheck, ArrowLeft, KeyRound, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { useNotification } from '../context/NotificationContext';

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


    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative">

            <div className="max-w-md w-full relative z-10">
                <motion.div 
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="glass-card shadow-2xl relative overflow-hidden p-8 md:p-12 glass-hover"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
                        <KeyRound size={120} className="text-white" />
                    </div>
                    
                    <div className="text-center mb-10 relative z-10">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-3xl ${success ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'} mb-6 border border-slate-800 shadow-sm`}>
                            {success ? <CheckCircle2 size={32} /> : <ShieldCheck size={32} />}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight mb-2">Password <span className="text-blue-500">recovery</span></h1>
                        <p className="text-blue-500 text-[10px] tracking-[0.3em] font-bold opacity-80">
                            {step === 1 && 'Step 01: Verify email'}
                            {step === 2 && 'Step 02: Authenticate'}
                            {step === 3 && 'Step 03: Reset password'}
                            {success && 'Access restored'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold text-center">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold text-center shadow-md">
                            {success} Redirecting...
                        </div>
                    )}

                    {!success && (
                        <div className="relative">
                            {step === 1 && (
                                <form onSubmit={handleSendOTP} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold tracking-[0.2em] text-slate-500 ml-1 opacity-70">Email Access Key</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
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
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full glass-button-primary h-14"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <>Send code <ChevronRight size={18} /></>}
                                    </button>
                                </form>
                            )}

                            {step === 2 && (
                                <form onSubmit={handleVerifyOTP} className="space-y-6">
                                    <div className="space-y-2 text-center">
                                        <label className="text-[10px] font-bold tracking-[0.2em] text-slate-500 opacity-70">Security Auth Code</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full glass-input h-16 text-center text-3xl tracking-[0.5em] font-mono focus:border-blue-500"
                                            placeholder="000000"
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full glass-button-primary h-14"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <>Verify <ShieldCheck size={18} /></>}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setStep(1)}
                                        className="w-full mt-6 text-slate-500 hover:text-blue-500 text-[10px] font-bold tracking-widest transition-colors"
                                    >
                                        Incorrect email?
                                    </button>
                                </form>
                            )}

                            {step === 3 && (
                                <form onSubmit={handleResetPassword} className="space-y-6">
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold tracking-[0.2em] text-slate-500 ml-1 opacity-70">New Security Key</label>
                                            <input
                                                type="password"
                                                required
                                                className="w-full glass-input h-14"
                                                placeholder="••••••••"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold tracking-[0.2em] text-slate-500 ml-1 opacity-70">Confirm Security Key</label>
                                            <input
                                                type="password"
                                                required
                                                className="w-full glass-input h-14"
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-[10px] tracking-widest h-14 mt-4"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : 'Update password'}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    <div className="mt-10 pt-8 border-t border-slate-800 text-center">
                        <Link to="/login" className="inline-flex items-center gap-3 text-slate-500 hover:text-blue-500 font-bold text-[10px] tracking-widest transition-all group">
                            <ArrowLeft size={16} /> Back to login
                        </Link>
                    </div>
                </motion.div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
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
                    border-radius: 1rem;
                    padding: 1.1rem 1.1rem 1.1rem 3.2rem;
                    color: white;
                    transition: all 0.3s ease;
                    width: 100%;
                }
                .glass-input:focus {
                    background: rgba(15, 23, 42, 0.6);
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                    outline: none;
                }
            `}} />
        </div>
    );
};

export default ForgotPassword;
