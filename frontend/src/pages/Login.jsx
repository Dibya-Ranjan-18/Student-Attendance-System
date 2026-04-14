import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { LogIn, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import Reveal from '../components/Reveal';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { login, googleLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(formData.username, formData.password);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative">

      <div className="w-full max-w-[480px] relative z-10">
        <Reveal width="100%">
          <motion.div 
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="glass-card shadow-2xl border-white/5 px-5 py-7 sm:p-10 md:p-12 glass-hover"
          >
              <Reveal delay={0.2} width="100%">
                <div className="text-center mb-6 md:mb-10">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-md shadow-blue-500/20 transition-transform hover:scale-105 duration-300">
                    <LogIn className="text-white" size={24} />
                  </div>
                  <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight leading-tight">Welcome <span className="text-blue-500">back</span></h1>
                  <p className="text-slate-400 mt-1 md:mt-2 text-[10px] md:text-sm uppercase tracking-[0.2em] font-bold opacity-70">Enter your details to sign in</p>
                </div>
              </Reveal>

              <Reveal delay={0.4} width="100%">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold tracking-[0.2em] text-slate-500 ml-1 opacity-70">Registration Number</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                        <User size={20} />
                      </div>
                      <input
                        type="text"
                        placeholder="Enter your ID"
                        className="w-full glass-input pl-12"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-bold tracking-[0.2em] text-slate-500 opacity-70 ml-1">Password</label>
                      <Link to="/forgot-password" className="text-[10px] font-bold text-blue-500 hover:text-blue-400 tracking-wider transition-colors">Forgot password?</Link>
                    </div>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                        <Lock size={20} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full glass-input pl-12"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-xl text-xs font-bold text-center animate-in zoom-in-95 duration-200">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full glass-button-primary disabled:opacity-50 disabled:cursor-not-allowed group h-12 md:h-14"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <span className="relative z-10 font-black">Sign in</span>
                        <LogIn size={18} className="transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>
              </Reveal>

              <Reveal delay={0.6} width="100%">
                <div className="mt-10 flex flex-col gap-6">
                  <div className="relative">
                    <div className="relative flex justify-center text-[10px] tracking-[0.2em] font-bold">
                      <span className="px-4 text-slate-500 uppercase">login with google</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-center transition-transform active:scale-95">
                      <GoogleLogin
                        onSuccess={async credentialResponse => {
                          try {
                            await googleLogin(credentialResponse.credential);
                          } catch (err) {
                            setError(err.response?.data?.error || "Google Login failed");
                          }
                        }}
                        onError={() => {
                          setError("Google Login Failed");
                        }}
                        theme="filled_black"
                        shape="pill"
                        size="large"
                        text="continue_with"
                        width="100%"
                      />
                    </div>
                    
                    <div className="text-center">
                      <Link to="/register" className="text-[11px] font-bold text-slate-500 hover:text-blue-400 tracking-[0.15em] transition-colors duration-200">
                        No account? <span className="text-blue-500 hover:text-blue-400">Request access</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
          </motion.div>
        </Reveal>

        <Reveal delay={0.8} y={10} width="100%">
          <p className="text-center mt-10 text-[10px] font-bold tracking-[0.5em] text-slate-600">
            Powered by <span className="text-slate-400">Tap2Present Engine v2.0</span>
          </p>
        </Reveal>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
                .glass-card { 
                    background: transparent !important; 
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
                    padding: 0.9rem 1.1rem 0.9rem 3.2rem;
                    color: white;
                    transition: all 0.3s ease;
                    width: 100%;
                    font-size: 0.875rem;
                }
                @media (min-width: 640px) {
                    .glass-input {
                        padding: 1.1rem 1.1rem 1.1rem 3.2rem;
                        font-size: 1rem;
                    }
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

export default Login;
