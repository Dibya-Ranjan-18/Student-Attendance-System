import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const CustomSelect = ({ 
    options = [], 
    value, 
    onChange, 
    placeholder = "Select option...", 
    label,
    icon: Icon,
    name,
    required = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => String(opt.id) === String(value));

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt => 
        opt.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (option) => {
        if (name) {
            onChange({
                target: {
                    name,
                    value: option.id
                }
            });
        } else {
            onChange(option.id);
        }
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
            )}
            
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-slate-800/50 border-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all outline-none ${
                    isOpen ? 'border-primary-500 ring-2 ring-primary-500/10' : 'border-slate-800/50 hover:border-slate-700'
                }`}
            >
                <div className="flex items-center gap-3 truncate">
                    {Icon && <Icon size={18} className={selectedOption ? 'text-primary-500' : 'text-slate-500'} />}
                    <span className={selectedOption ? 'text-white' : 'text-slate-500'}>
                        {selectedOption ? selectedOption.name : placeholder}
                    </span>
                </div>
                <ChevronDown 
                    size={18} 
                    className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-500' : ''}`} 
                />
            </button>

            {isOpen && (
                <div className="absolute z-[100] left-0 right-0 mt-2 bg-slate-900 border-2 border-slate-700/50 rounded-xl shadow-2xl overflow-hidden backdrop-blur-2xl">
                    {options.length > 8 && (
                        <div className="p-2 border-b border-slate-800">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 outline-none focus:border-primary-500/50"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}

                    <div 
                        className="max-h-[180px] overflow-y-auto custom-scrollbar p-1"
                    >
                        {filteredOptions.length > 0 ? (
                            <div className="flex flex-col">
                                {filteredOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-between group mb-0.5 last:mb-0 ${
                                            String(value) === String(option.id)
                                            ? 'bg-primary-600 text-white'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    >
                                        <span className="truncate">{option.name}</span>
                                        {String(value) === String(option.id) && (
                                            <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-slate-600">
                                <p className="text-xs font-bold uppercase tracking-widest">No Results</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
