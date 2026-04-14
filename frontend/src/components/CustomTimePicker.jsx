import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomTimePicker = ({ 
    value, 
    onChange, 
    label,
    required = false,
    placeholder = "-- : --"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Parse current value (HH:MM or HH:MM:SS)
    const [h, m] = (value && typeof value === 'string') ? value.split(':') : ["00", "00"];
    const displayValue = value ? `${h}:${m}` : placeholder;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

    const handleSelect = (newH, newM) => {
        const hVal = newH !== null ? newH : (h || "00");
        const mVal = newM !== null ? newM : (m || "00");
        onChange(`${hVal}:${mVal}`);
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {label && (
                <label className="block text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1.5 ml-1">
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
            )}
            
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-slate-800/50 border-2 rounded-xl px-3 md:px-4 py-2.5 md:py-3.5 text-xs md:text-sm font-bold transition-all outline-none cursor-pointer ${
                    isOpen ? 'border-primary-500 ring-2 ring-primary-500/10' : 'border-slate-800/50 hover:border-slate-700'
                }`}
            >
                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                    <Clock size={18} className={value ? 'text-primary-500' : 'text-slate-400'} />
                    <span className={`text-sm md:text-base font-bold ${value ? 'text-white font-mono' : 'text-slate-500'}`}>
                        {displayValue}
                    </span>
                </div>
                <ChevronDown 
                    size={16} 
                    className={`text-slate-500 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-primary-500' : ''}`} 
                />
            </button>
 
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute z-[110] left-1/2 md:left-auto md:right-0 -translate-x-1/2 md:translate-x-0 w-[200px] md:w-[240px] mt-2 bg-slate-900 border-2 border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl flex h-64"
                    >
                        {/* Hours Column */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar border-r border-slate-800/50 py-1">
                            <p className="text-[7px] md:text-[8px] font-black uppercase text-primary-500/70 px-4 py-2 sticky top-0 bg-slate-900/80 backdrop-blur-md z-10 tracking-[0.2em] text-center">Hour</p>
                            <div className="px-1.5">
                                {hours.map(hour => (
                                    <button
                                        key={hour}
                                        type="button"
                                        onClick={() => handleSelect(hour, null)}
                                        className={`w-full text-center px-4 py-2 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer mb-0.5 last:mb-0 ${
                                            h === hour
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    >
                                        {hour}
                                    </button>
                                ))}
                            </div>
                        </div>
 
                        {/* Minutes Column */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar py-1">
                            <p className="text-[7px] md:text-[8px] font-black uppercase text-primary-500/70 px-4 py-2 sticky top-0 bg-slate-900/80 backdrop-blur-md z-10 tracking-[0.2em] text-center">Min</p>
                            <div className="px-1.5">
                                {minutes.map(min => (
                                    <button
                                        key={min}
                                        type="button"
                                        onClick={() => handleSelect(null, min)}
                                        className={`w-full text-center px-4 py-2 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer mb-0.5 last:mb-0 ${
                                            m === min
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    >
                                        {min}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomTimePicker;
