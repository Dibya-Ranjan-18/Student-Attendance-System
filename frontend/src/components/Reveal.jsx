import React from 'react';
import { motion } from 'framer-motion';

const Reveal = ({ 
    children, 
    width = "fit-content", 
    delay = 0, 
    duration = 0.5,
    y = 20,
    x = 0,
    scale = 1,
    staggerChildren = 0
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: y, x: x, scale: scale }}
            whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                duration: duration,
                delay: delay,
                ease: [0.21, 0.47, 0.32, 0.98], // Custom premium ease
                staggerChildren: staggerChildren
            }}
            style={{ width }}
        >
            {children}
        </motion.div>
    );
};

export const RevealList = ({ children, delay = 0, interval = 0.1, width = "fit-content" }) => {
    return (
        <>
            {React.Children.map(children, (child, i) => (
                <Reveal delay={delay + (i * interval)} width={width}>
                    {child}
                </Reveal>
            ))}
        </>
    );
};

export default Reveal;
