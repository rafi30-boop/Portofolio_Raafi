import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={hover ? { y: -5 } : {}}
      className={`card ${hover ? 'card-hover' : ''} ${className}`}
      style={{ height: className.includes('h-full') ? '100%' : 'auto' }}
    >
      {children}
    </motion.div>
  );
};

export default Card;