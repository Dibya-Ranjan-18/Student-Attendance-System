import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { LogIn, Lock, User, Eye, EyeOff, Loader2, Globe } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Background decoration with parallax motion */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-600/10 rounded-full blur-[120px]"
        ></motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
          className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"
        ></motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="w-full max-w-[480px] relative z-10"
      >
        <div className="glass-card shadow-2xl border-white/5">
          <Reveal>
            <div className="text-center mb-10">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-600/20 cursor-pointer"
              >
                <LogIn className="text-white" size={32} />
              </motion.div>
              <h1 className="text-3xl font-black text-white tracking-tighter sm:text-4xl">Welcome Back</h1>
              <p className="text-slate-400 mt-2 font-medium">Please enter your details to sign in</p>
            </div>
          </Reveal>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Reveal delay={0.1}>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Registration No</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors">
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
            </Reveal>

            <Reveal delay={0.2}>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Secure Password</label>
                  <Link to="/forgot-password" size="sm" className="text-[11px] font-black text-primary-500 hover:text-primary-400 uppercase tracking-tighter transition-colors">Forgot Password?</Link>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors">
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
            </Reveal>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-xl text-xs font-bold text-center"
              >
                {error}
              </motion.div>
            )}

            <Reveal delay={0.3}>
              <button
                type="submit"
                disabled={loading}
                className="w-full glass-button-primary disabled:opacity-50 disabled:cursor-not-allowed group h-14"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span className="relative z-10">Sign In to Dashboard</span>
                    <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </Reveal>
          </form>

          <Reveal delay={0.4}>
            <div className="mt-10 flex flex-col gap-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black">
                  <span className="bg-[#0f172a] px-4 text-slate-500">Security Access Only</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-center transition-transform hover:scale-[1.02] active:scale-95">
                  <GoogleLogin
                    onSuccess={credentialResponse => {
                      googleLogin(credentialResponse.credential);
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
                
                <Link to="/register" className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl border border-white/10 transition-all text-sm group active:scale-95">
                  <Globe size={18} className="text-primary-500 group-hover:rotate-12 transition-transform" />
                  No Account? Request Access
                </Link>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.6}>
          <p className="text-center mt-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
            Powered by <span className="text-slate-400">Tap2Present Engine v2.0</span>
          </p>
        </Reveal>
      </motion.div>
    </div>
  );
};

export default Login;
