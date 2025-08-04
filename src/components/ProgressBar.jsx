import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ 
  value = 0, 
  max = 100, 
  variant = 'brand',
  size = 'md',
  showLabel = false,
  animated = true,
  className = '',
  ...props 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  // Color thresholds for stock levels
  const getVariantFromPercentage = (percent) => {
    if (percent < 20) return 'danger';
    if (percent < 50) return 'warning';
    return 'success';
  };
  
  const actualVariant = variant === 'auto' ? getVariantFromPercentage(percentage) : variant;
  
  const variants = {
    brand: 'var(--brand)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    danger: 'var(--danger)',
    info: 'var(--info)'
  };

  const sizes = {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px'
  };

  const trackStyle = {
    width: '100%',
    height: sizes[size],
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
    position: 'relative'
  };

  const fillStyle = {
    height: '100%',
    backgroundColor: variants[actualVariant],
    borderRadius: 'var(--radius-full)',
    transition: animated ? 'width 0.5s ease-out' : 'none',
    width: `${percentage}%`,
    position: 'relative'
  };

  return (
    <div className={`progress-container ${className}`} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="subtle">{value} / {max}</span>
          <span className="muted">{Math.round(percentage)}%</span>
        </div>
      )}
      
      <div style={trackStyle}>
        {animated ? (
          <motion.div
            style={fillStyle}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        ) : (
          <div style={fillStyle} />
        )}
        
        {/* Animated stripes for loading effect */}
        {animated && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `linear-gradient(
                45deg,
                rgba(255, 255, 255, 0.2) 25%,
                transparent 25%,
                transparent 50%,
                rgba(255, 255, 255, 0.2) 50%,
                rgba(255, 255, 255, 0.2) 75%,
                transparent 75%,
                transparent
              )`,
              backgroundSize: '1rem 1rem',
              animation: 'progress-stripes 1s linear infinite',
              width: `${percentage}%`
            }}
          />
        )}
      </div>
      
      <style jsx>{`
        @keyframes progress-stripes {
          0% {
            background-position: 1rem 0;
          }
          100% {
            background-position: 0 0;
          }
        }
      `}</style>
    </div>
  );
};

// Stock-specific progress bar
export const StockProgressBar = ({ current, max, ...props }) => {
  return (
    <ProgressBar 
      value={current} 
      max={max} 
      variant="auto"
      showLabel={true}
      {...props} 
    />
  );
};

export default ProgressBar;