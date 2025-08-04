import React from 'react';
import { motion } from 'framer-motion';

const AnimatedButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  loading = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'button font-medium rounded-lg transition-all duration-200 inline-flex items-center justify-center';
  
  const variants = {
    primary: 'button bg-primary text-white hover:bg-primary-hover',
    secondary: 'button-secondary bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white',
    success: 'button-success bg-success text-white hover:bg-green-700',
    warning: 'button-warning bg-warning text-white hover:bg-orange-700',
    danger: 'button-danger bg-danger text-white hover:bg-red-700',
    ghost: 'bg-transparent text-primary hover:bg-gray-100'
  };

  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  const buttonClasses = `
    ${baseClasses}
    ${variants[variant] || variants.primary}
    ${sizes[size] || sizes.medium}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `.trim();

  return (
    <motion.button
      className={buttonClasses}
      onClick={disabled ? undefined : onClick}
      disabled={disabled || loading}
      whileHover={disabled ? {} : { 
        scale: 1.02,
        y: -1,
        transition: { duration: 0.2 }
      }}
      whileTap={disabled ? {} : { 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {loading && (
        <motion.div
          className="mr-2"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
        </motion.div>
      )}
      {children}
    </motion.button>
  );
};

export default AnimatedButton;