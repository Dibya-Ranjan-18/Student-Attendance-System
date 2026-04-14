import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingOverlay = ({ isVisible }) => {
    const [statusIndex, setStatusIndex] = useState(0);
    const statuses = [
        "Initializing Security Matrix",
        "Synchronizing Attendance Data",
        "Verifying Geofence Bounds",
        "Encrypting Session Identity",
        "Optimizing Database Query"
    ];

    useEffect(() => {
        if (isVisible) {
            const interval = setInterval(() => {
                setStatusIndex((prev) => (prev + 1) % statuses.length);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [isVisible]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/40 backdrop-blur-md overflow-hidden"
                >
                    <div className="relative flex flex-col items-center">
                        {/* Orbital Spinning System */}
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                            {/* Outer Ring - Slow */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full border border-dashed border-primary-500/20"
                            />
                            
                            {/* Middle Ring - Reverse */}
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-2 rounded-full border-2 border-dotted border-primary-500/40"
                            />

                            {/* Inner Ring - Fast with Gap */}
                            <motion.div
                                animate={{ rotate: 360 }}                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-4 rounded-full border-4 border-primary-500 border-t-transparent shadow-[0_0_20px_rgba(14,165,233,0.4)]"
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingOverlay;

