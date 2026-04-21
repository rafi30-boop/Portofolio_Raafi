import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }) => {
  const getVariantStyle = () => {
    switch(variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, var(--primary-600), var(--secondary-600))',
          color: 'white'
        };
      case 'secondary':
        return {
          background: 'var(--gray-200)',
          color: 'var(--gray-800)'
        };
      case 'danger':
        return {
          background: 'var(--danger)',
          color: 'white'
        };
      default:
        return {
          background: 'linear-gradient(135deg, var(--primary-600), var(--secondary-600))',
          color: 'white'
        };
    }
  };
  
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${className}`}
      style={{
        ...getVariantStyle(),
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    >
      {children}
    </motion.button>
  );
};

export default Button;