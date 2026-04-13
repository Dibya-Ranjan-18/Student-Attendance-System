import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomDatePicker = ({ 
    value, 
    onChange, 
    label, 
    placeholder = "Select Date" 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
    const dropdownRef = useRef(null);

    // Ensure viewDate is valid
    const safeViewDate = isNaN(viewDate.getTime()) ? new Date() : viewDate;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const generateDays = () => {
        const year = safeViewDate.getFullYear();
        const month = safeViewDate.getMonth();
        const days = [];
        const totalDays = daysInMonth(year, month);
        const startOffset = firstDayOfMonth(year, month);

        // Previous month padding
        const prevMonthDays = daysInMonth(year, month - 1);
        for (let i = startOffset - 1; i >= 0; i--) {
            days.push({ day: prevMonthDays - i, current: false, date: new Date(year, month - 1, prevMonthDays - i) });
        }

        // Current month
        for (let i = 1; i <= totalDays; i++) {
            days.push({ day: i, current: true, date: new Date(year, month, i) });
        }

        // Next month padding
        const remainingSlots = 42 - days.length;
        for (let i = 1; i <= remainingSlots; i++) {
            days.push({ day: i, current: false, date: new Date(year, month + 1, i) });
        }

        return days;
    };

    const handleMonthChange = (offset) => {
        const newDate = new Date(safeViewDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setViewDate(newDate);
    };

    const handleDateSelect = (date) => {
        // Format to YYYY-MM-DD to match the backend expectation
        const formattedDate = date.toLocaleDateString('en-CA');
        onChange(formattedDate);
        setIsOpen(false);
    };

    const isSelected = (date) => {
        if (!value) return false;
        const d1 = new Date(date);
        const d2 = new Date(value);
        return d1.getFullYear() === d2.getFullYear() && 
               d1.getMonth() === d2.getMonth() && 
               d1.getDate() === d2.getDate();
    };

    const isToday = (date) => {
        const today = new Date();
        const d = new Date(date);
        return d.getFullYear() === today.getFullYear() && 
               d.getMonth() === today.getMonth() && 
               d.getDate() === today.getDate();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {label && (
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">{label}</span>
            )}
            
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-slate-900 border border-slate-800 rounded-xl px-3 sm:px-4 py-2 text-white flex items-center gap-2 sm:gap-3 transition-all hover:bg-slate-800/50 hover:border-primary-500/30 ${isOpen ? 'border-primary-500 ring-4 ring-primary-500/10' : ''}`}
            >
                <div className="w-8 h-8 bg-primary-600/10 rounded-lg flex items-center justify-center text-primary-500 shrink-0">
                    <CalendarIcon size={16} className="sm:size-[18px]" />
                </div>
                <div className="flex flex-col leading-none text-left min-w-0 flex-1">
                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5 truncate">Date Range</span>
                    <div className="flex items-baseline gap-1 truncate">
                        <span className="text-xs sm:text-sm font-black text-white">
                            {value ? new Date(value).getDate() : '--'}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-bold text-primary-400 uppercase truncate">
                            {value ? new Date(value).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : placeholder}
                        </span>
                    </div>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute z-[110] mt-2 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl w-[280px] xs:w-[320px] left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 md:left-auto md:right-0"
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-slate-800 bg-slate-800/20 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-black text-white uppercase tracking-tight">
                                    {safeViewDate.toLocaleString('default', { month: 'long' })}
                                </span>
                                <span className="font-mono text-slate-500 font-bold">{safeViewDate.getFullYear()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => handleMonthChange(-1)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"><ChevronLeft size={18} /></button>
                                <button onClick={() => setViewDate(new Date())} className="text-[10px] font-black uppercase text-primary-500 px-2 py-1 hover:bg-primary-500/10 rounded-md transition-all">Today</button>
                                <button onClick={() => handleMonthChange(1)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"><ChevronRight size={18} /></button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="p-4 overflow-hidden relative min-h-[280px]">
                            <div className="grid grid-cols-7 mb-2 border-b border-slate-800/50 pb-2">
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                    <div key={day} className="text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {generateDays().map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleDateSelect(item.date)}
                                        className={`
                                            relative h-9 xs:h-10 w-full flex items-center justify-center rounded-xl text-xs font-bold transition-all group
                                            ${!item.current ? 'text-slate-700' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                                            ${isSelected(item.date) ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20 active:scale-95' : ''}
                                            ${isToday(item.date) && !isSelected(item.date) ? 'bg-primary-600/5 text-primary-400 border border-primary-500/20' : ''}
                                        `}
                                    >
                                        <span className="relative z-10">{item.day}</span>
                                        {isToday(item.date) && !isSelected(item.date) && (
                                            <div className="absolute bottom-1 w-1 h-1 bg-primary-500 rounded-full" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 bg-slate-950/50 flex items-center justify-between border-t border-slate-800">
                             <button onClick={() => setIsOpen(false)} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-rose-500 transition-colors">Close Picker</button>
                             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                <span className="w-2 h-2 rounded-full bg-primary-500" />
                                <span>Selected</span>
                             </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomDatePicker;
