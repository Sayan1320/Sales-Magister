import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'medium', color = 'primary', text = '' }) => {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const colors = {
    primary: 'border-primary border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent',
    success: 'border-success border-t-transparent',
    warning: 'border-warning border-t-transparent',
    danger: 'border-danger border-t-transparent'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        className={`${sizes[size]} border-2 rounded-full ${colors[color]}`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      {text && (
        <motion.p
          className="mt-2 text-sm text-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

// Pulse loader for skeleton states
export const PulseLoader = ({ className = '' }) => (
  <motion.div
    className={`bg-gray-200 rounded ${className}`}
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
);

// Dots loader
export const DotsLoader = ({ color = 'primary' }) => {
  const dotColors = {
    primary: 'bg-primary',
    gray: 'bg-gray-400',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger'
  };

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`w-2 h-2 rounded-full ${dotColors[color]}`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );
};

// Progress bar
export const ProgressBar = ({ progress = 0, animated = true, color = 'primary' }) => {
  const colors = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger'
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <motion.div
        className={`h-full ${colors[color]} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: animated ? 0.5 : 0 }}
      />
    </div>
  );
};

export default LoadingSpinner;