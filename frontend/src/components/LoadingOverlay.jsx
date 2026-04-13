import React from 'react';
import { ShieldCheck } from 'lucide-react';

const LoadingOverlay = ({ isVisible }) => {
    return (
        <div className={`fixed inset-0 z-[10000] flex items-center justify-center transition-all duration-700 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none delay-300'}`}>
            {/* Immersive Backdrop with its own blur transition */}
            <div className={`absolute inset-0 bg-slate-950/80 backdrop-blur-2xl transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} />
            
            {/* Animated Background Elements for the Loader */}
            <div className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Central Loader Container with scaling entry/exit */}
            <div className={`relative z-10 flex flex-col items-center justify-center transition-all duration-700 cubic-bezier(0.23, 1, 0.32, 1) ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
                <div className="relative w-32 h-32 flex items-center justify-center">
                    {/* Outer Rotating Ring */}
                    <div className="absolute inset-0 border-t-2 border-r-2 border-transparent border-t-primary-500 border-r-primary-500/30 rounded-full animate-spin-slow" />
                    
                    {/* Middle Pulsing Halo */}
                    <div className="absolute inset-4 border border-white/5 rounded-full animate-ping opacity-20" />
                    
                    {/* Inner Spinning Ring (Counter-clockwise) */}
                    <div className="absolute inset-8 border-b-2 border-l-2 border-transparent border-b-emerald-500 border-l-emerald-500/30 rounded-full animate-spin-reverse" />

                    {/* Central Icon */}
                    <div className="relative w-12 h-12 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center text-primary-500 shadow-2xl">
                        <ShieldCheck size={28} className="animate-pulse" />
                        <div className="absolute -inset-2 bg-primary-500/20 blur-lg rounded-full animate-pulse opacity-50" />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes spin-reverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 3s linear infinite;
                }
                .animate-spin-reverse {
                    animation: spin-reverse 2s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default LoadingOverlay;
