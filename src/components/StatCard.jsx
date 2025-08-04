import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  color = 'brand', 
  loading = false,
  icon: Icon,
  delay = 0,
  className = ''
}) => {
  const colorClasses = {
    brand: 'text-brand',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    info: 'text-info'
  };

  if (loading) {
    return (
      <motion.div 
        className={`card ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay }}
      >
        <div className="animate-pulse stack-3">
          <div style={{ height: '1rem', background: 'var(--border)', borderRadius: 'var(--radius)' }}></div>
          <div style={{ height: '2rem', background: 'var(--border)', borderRadius: 'var(--radius)', width: '60%' }}></div>
          <div style={{ height: '0.75rem', background: 'var(--border)', borderRadius: 'var(--radius)', width: '40%' }}></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`card ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ 
        y: -4,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      style={{ cursor: 'pointer' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 stack-2">
          <motion.div 
            className="subtle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: delay + 0.1 }}
          >
            {title}
          </motion.div>
          
          <motion.div 
            className={`${colorClasses[color]} font-bold`}
            style={{ fontSize: '2rem', lineHeight: '1' }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: delay + 0.2 }}
          >
            {value}
          </motion.div>
          
          {subtitle && (
            <motion.div 
              className="muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: delay + 0.3 }}
            >
              {subtitle}
            </motion.div>
          )}
          
          {typeof trend === 'number' && (
            <motion.div 
              className="cluster-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: delay + 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.2 }}
              >
                {trend > 0 ? (
                  <TrendingUp size={16} style={{ color: 'var(--success)' }} />
                ) : (
                  <TrendingDown size={16} style={{ color: 'var(--danger)' }} />
                )}
              </motion.div>
              <span 
                className="subtle font-medium"
                style={{ color: trend > 0 ? 'var(--success)' : 'var(--danger)' }}
              >
                {Math.abs(trend)}%
              </span>
              <span className="muted">vs last month</span>
            </motion.div>
          )}
        </div>
        
        {Icon && (
          <motion.div 
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: delay + 0.1 }}
            whileHover={{ rotate: 5, scale: 1.1 }}
          >
            <Icon size={24} className={colorClasses[color]} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;