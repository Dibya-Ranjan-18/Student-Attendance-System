import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search } from 'lucide-react';

const CustomSelect = ({ 
    options = [], 
    value, 
    onChange, 
    placeholder = "Select option...", 
    label,
    icon: Icon,
    name,
    required = false,
    onAddNew = null
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dropdownStyle, setDropdownStyle] = useState({});
    const containerRef = useRef(null);
    const buttonRef = useRef(null);
    const dropdownElRef = useRef(null);
    const rafRef = useRef(null);

    const selectedOption = options.find(opt => String(opt.id) === String(value));

    const getPosition = () => {
        if (!buttonRef.current) return null;
        const rect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropHeight = Math.min(260, window.innerHeight * 0.4);
        const showAbove = spaceBelow < dropHeight && spaceAbove > spaceBelow;
        return {
            position: 'fixed',
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            maxHeight: `${Math.min(dropHeight, showAbove ? spaceAbove - 8 : spaceBelow - 8)}px`,
            ...(showAbove
                ? { bottom: `${window.innerHeight - rect.top + 8}px`, top: 'auto' }
                : { top: `${rect.bottom + 8}px`, bottom: 'auto' }),
            zIndex: 99999,
            overflow: 'hidden',
            borderRadius: '1.5rem',
        };
    };

    const calculatePosition = () => {
        const pos = getPosition();
        if (pos) setDropdownStyle(pos);
    };

    // Direct DOM update on scroll - bypasses React state for zero lag
    const updatePositionDirect = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            if (!dropdownElRef.current) return;
            const pos = getPosition();
            if (!pos) return;
            Object.assign(dropdownElRef.current.style, pos);
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current && !containerRef.current.contains(event.target) &&
                !event.target.closest('[data-custom-select-dropdown]')
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        // Set initial position via React state for first render
        calculatePosition();

        // Then track position every frame directly on the DOM — no React state lag
        let animFrameId;
        const trackPosition = () => {
            if (dropdownElRef.current && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                const dropHeight = Math.min(260, window.innerHeight * 0.4);
                const showAbove = spaceBelow < dropHeight && spaceAbove > spaceBelow;
                const maxH = Math.min(dropHeight, showAbove ? spaceAbove - 8 : spaceBelow - 8);

                const el = dropdownElRef.current;
                el.style.left = `${rect.left}px`;
                el.style.width = `${rect.width}px`;
                el.style.maxHeight = `${maxH}px`;
                if (showAbove) {
                    el.style.top = 'auto';
                    el.style.bottom = `${window.innerHeight - rect.top + 8}px`;
                } else {
                    el.style.bottom = 'auto';
                    el.style.top = `${rect.bottom + 8}px`;
                }
            }
            animFrameId = requestAnimationFrame(trackPosition);
        };
        animFrameId = requestAnimationFrame(trackPosition);

        return () => cancelAnimationFrame(animFrameId);
    }, [isOpen]);

    const handleToggle = () => {
        if (!isOpen) calculatePosition();
        setIsOpen(prev => !prev);
    };

    const filteredOptions = options.filter(opt => 
        opt.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (option) => {
        if (name) {
            onChange({ target: { name, value: option.id } });
        } else {
            onChange(option.id);
        }
        setIsOpen(false);
        setSearchQuery('');
    };

    const dropdown = isOpen ? (
        <div
            ref={dropdownElRef}
            data-custom-select-dropdown=""
            className="glass-card border border-white/10 shadow-2xl flex flex-col"
            style={{ ...dropdownStyle }}
        >
            {options.length > 8 && (
                <div className="p-3 border-b border-white/5 bg-white/5 backdrop-blur-md shrink-0">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full glass-input bg-white/10 pl-10 pr-3 py-2.5 text-xs outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>
            )}
            <div className="overflow-y-auto custom-scrollbar p-2 flex-1">
                {filteredOptions.length > 0 ? (
                    <div className="flex flex-col gap-1">
                        {filteredOptions.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); handleSelect(option); }}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between transition-all ${
                                    String(value) === String(option.id)
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <span className="truncate">{option.name}</span>
                                {String(value) === String(option.id) && (
                                    <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white] flex-shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="py-6 text-center flex flex-col items-center gap-3">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] opacity-40">No options found</p>
                        {onAddNew && (
                            <button
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); setIsOpen(false); onAddNew(); }}
                                className="px-4 py-2.5 bg-primary-600/20 border border-primary-500/30 text-primary-400 rounded-xl text-xs font-bold hover:bg-primary-600/30 transition-all flex items-center gap-2"
                            >
                                <span className="text-lg leading-none">+</span> Add Subject First
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    ) : null;

    return (
        <div className="relative w-full" ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
            )}
            
            <button
                ref={buttonRef}
                type="button"
                onClick={handleToggle}
                className={`w-full flex items-center justify-between glass-input bg-white/5 border rounded-2xl px-4 md:px-5 py-2.5 md:py-3.5 text-xs md:text-sm transition-all outline-none ${
                    isOpen ? 'border-primary-500/50 ring-4 ring-primary-500/10' : 'border-white/10 hover:border-white/20'
                }`}
            >
                <div className="flex items-center gap-2 md:gap-3 truncate">
                    {Icon && <Icon size={16} className={selectedOption ? 'text-primary-500' : 'text-slate-500'} />}
                    <span className={`font-bold ${selectedOption ? 'text-white' : 'text-slate-300'}`}>
                        {selectedOption ? selectedOption.name : placeholder}
                    </span>
                </div>
                <ChevronDown 
                    size={16} 
                    className={`text-slate-500 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-primary-500' : ''}`} 
                />
            </button>

            {createPortal(dropdown, document.body)}
        </div>
    );
};

export default CustomSelect;
