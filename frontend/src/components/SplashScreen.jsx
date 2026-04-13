import React, { useState, useEffect } from 'react';

const SplashScreen = ({ onComplete }) => {
    const [isLogoVisible, setIsLogoVisible] = useState(true);
    const [isOpening, setIsOpening] = useState(false);

    useEffect(() => {
        // Step 1: Show Logo
        const logoTimer = setTimeout(() => {
            setIsLogoVisible(false);
            
            // Step 2: Start Opening Shutter
            const openTimer = setTimeout(() => {
                setIsOpening(true);
                
                // Step 3: Complete and Unmount
                const completeTimer = setTimeout(() => {
                    if (onComplete) onComplete();
                }, 1000);
                return () => clearTimeout(completeTimer);
            }, 400); // Brief pause after logo fades
            
            return () => clearTimeout(openTimer);
        }, 2000);

        return () => clearTimeout(logoTimer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[20000] pointer-events-none flex">
            {/* Shutter Panels for the Reveal */}
            <div className={`flex-1 bg-[#020617] transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] relative border-right border-white/5 ${isOpening ? '-translate-x-full' : 'translate-x-0'}`}>
                <div className="absolute inset-0 bg-primary-600/5 blur-[120px] opacity-20" />
            </div>
            <div className={`flex-1 bg-[#020617] transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] relative border-left border-white/5 ${isOpening ? 'translate-x-full' : 'translate-x-0'}`}>
                <div className="absolute inset-0 bg-primary-600/5 blur-[120px] opacity-20" />
            </div>

            {/* Centered Logo (Fades before shutters open) */}
            <div className={`absolute inset-0 flex items-center justify-center z-20 transition-all duration-700 ${isLogoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-110 blur-xl'}`}>
                <div className="flex flex-col items-center gap-8 splash-reveal">
                    <div className="w-24 h-24 bg-primary-600 rounded-[2.25rem] flex items-center justify-center text-white font-black text-5xl shadow-2xl logo-glow border border-white/10">
                        T
                    </div>
                    <div className="flex flex-col items-center">
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">
                            Tap2Present
                        </h1>
                        <div className="h-1 w-12 bg-primary-500 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.5)]" />
                    </div>
                </div>
            </div>

            {/* Ambient Background Scans */}
            <div className={`absolute inset-0 pointer-events-none opacity-10 transition-opacity duration-1000 ${isOpening ? 'opacity-0' : 'opacity-10'}`}>
                {[...Array(5)].map((_, i) => (
                    <div 
                        key={i}
                        className="w-full h-[1px] bg-primary-500/30 absolute animate-pulse" 
                        style={{ top: `${(i + 1) * 20}%`, animationDelay: `${i * 0.2}s` }}
                    />
                ))}
            </div>
        </div>
    );
};

export default SplashScreen;
