import React from 'react';
import { motion } from 'framer-motion';

const ScoreGauge = ({ score, size = 120, strokeWidth = 8, animated = true }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(Math.max(score, 0), 100);
  
  // Color based on score
  const getColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--info)';
    if (score >= 40) return 'var(--warning)';
    return 'var(--danger)';
  };

  const color = getColor(percentage);

  return (
    <div 
      className="score-gauge"
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? circumference : circumference - (percentage / 100) * circumference}
          animate={animated ? { strokeDashoffset: circumference - (percentage / 100) * circumference } : {}}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      
      {/* Score text */}
      <motion.div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        initial={animated ? { scale: 0 } : {}}
        animate={animated ? { scale: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div
          style={{
            fontSize: `${size * 0.25}px`,
            fontWeight: '700',
            color: color,
            lineHeight: '1'
          }}
        >
          {Math.round(percentage)}
        </div>
        <div
          style={{
            fontSize: `${size * 0.08}px`,
            color: 'var(--text-secondary)',
            marginTop: '2px'
          }}
        >
          SCORE
        </div>
      </motion.div>
    </div>
  );
};

export default ScoreGauge;