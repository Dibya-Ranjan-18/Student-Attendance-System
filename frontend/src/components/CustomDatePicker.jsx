import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomDatePicker = ({ 
    value, 
    onChange, 
    label, 
    placeholder = "Select Date" 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
    const [dropdownStyle, setDropdownStyle] = useState({});
    const containerRef = useRef(null);
    const buttonRef = useRef(null);

    // Ensure viewDate is valid
    const safeViewDate = isNaN(viewDate.getTime()) ? new Date() : viewDate;

    const calculatePosition = () => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const dropWidth = window.innerWidth < 350 ? window.innerWidth - 32 : 320;
        
        let left = rect.left + (rect.width / 2) - (dropWidth / 2);
        
        // Boundaries
        if (left < 16) left = 16;
        if (left + dropWidth > window.innerWidth - 16) left = window.innerWidth - dropWidth - 16;

        setDropdownStyle({
            position: 'fixed',
            top: `${rect.bottom + 8}px`,
            left: `${left}px`,
            width: `${dropWidth}px`,
            zIndex: 9999
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current && !containerRef.current.contains(event.target) &&
                !event.target.closest('[data-datepicker-dropdown]')
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            calculatePosition();
            window.addEventListener('scroll', calculatePosition, { capture: true });
            window.addEventListener('resize', calculatePosition);
        }
        return () => {
            window.removeEventListener('scroll', calculatePosition, { capture: true });
            window.removeEventListener('resize', calculatePosition);
        };
    }, [isOpen]);

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

    const dropdownContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    data-datepicker-dropdown
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    style={dropdownStyle}
                    className="bg-slate-900 border border-slate-700 rounded-[2rem] shadow-2xl overflow-hidden backdrop-blur-2xl"
                >
                    {/* Header */}
                    <div className="p-4 md:p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-white uppercase tracking-tight text-sm md:text-base">
                                {safeViewDate.toLocaleString('default', { month: 'long' })}
                            </span>
                            <span className="font-mono text-slate-500 font-bold text-xs md:text-sm">{safeViewDate.getFullYear()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={(e) => { e.stopPropagation(); handleMonthChange(-1); }} className="p-1.5 md:p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"><ChevronLeft size={16} /></button>
                            <button onClick={(e) => { e.stopPropagation(); setViewDate(new Date()); }} className="text-[10px] font-bold uppercase text-primary-500 px-2 py-1 hover:bg-primary-500/10 rounded-md transition-all">Today</button>
                            <button onClick={(e) => { e.stopPropagation(); handleMonthChange(1); }} className="p-1.5 md:p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"><ChevronRight size={16} /></button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="p-3 md:p-4">
                        <div className="grid grid-cols-7 mb-2 border-b border-white/5 pb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                <div key={day} className="text-center text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-0.5 md:gap-1">
                            {generateDays().map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => { e.stopPropagation(); handleDateSelect(item.date); }}
                                    className={`
                                        relative h-8 md:h-10 w-full flex items-center justify-center rounded-xl text-[11px] md:text-xs font-bold transition-all group
                                        ${!item.current ? 'text-slate-700 opacity-40' : 'text-slate-300 hover:bg-white/10 hover:text-white'}
                                        ${isSelected(item.date) ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : ''}
                                        ${isToday(item.date) && !isSelected(item.date) ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : ''}
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
                    <div className="px-4 py-3 md:px-5 md:py-4 bg-white/5 flex items-center justify-between border-t border-white/5">
                         <button onClick={() => setIsOpen(false)} className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-rose-500 transition-colors">Close</button>
                         <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                            <span>Selected</span>
                         </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="w-full" ref={containerRef}>
            {label && (
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">{label}</span>
            )}
            
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full glass-input bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between transition-all hover:border-white/20 ${isOpen ? 'border-primary-500/50 ring-4 ring-primary-500/10' : ''}`}
            >
                <div className="flex items-center gap-3 truncate">
                    <CalendarIcon size={16} className={value ? 'text-primary-500' : 'text-slate-500'} />
                    <div className="flex flex-col text-left truncate">
                        <span className={`text-xs md:text-sm font-bold ${value ? 'text-white' : 'text-slate-400'}`}>
                            {value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : placeholder}
                        </span>
                    </div>
                </div>
                <ChevronDown 
                    size={16} 
                    className={`text-slate-500 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-primary-500' : ''}`} 
                />
            </button>

            {createPortal(dropdownContent, document.body)}
        </div>
    );
};

export default CustomDatePicker;
