import React from 'react';
import { motion } from 'framer-motion';

const Badge = ({ 
  children, 
  variant = 'neutral', 
  size = 'sm',
  animated = false,
  className = '',
  ...props 
}) => {
  const variants = {
    neutral: {
      backgroundColor: 'var(--bg-secondary)',
      color: 'var(--text-secondary)',
      borderColor: 'var(--border)'
    },
    success: {
      backgroundColor: 'var(--success-light)',
      color: 'var(--success)',
      borderColor: 'var(--success)'
    },
    warning: {
      backgroundColor: 'var(--warning-light)',
      color: 'var(--warning)',
      borderColor: 'var(--warning)'
    },
    danger: {
      backgroundColor: 'var(--danger-light)',
      color: 'var(--danger)',
      borderColor: 'var(--danger)'
    },
    info: {
      backgroundColor: 'var(--info-light)',
      color: 'var(--info)',
      borderColor: 'var(--info)'
    },
    brand: {
      backgroundColor: 'var(--brand-light)',
      color: 'var(--brand)',
      borderColor: 'var(--brand)'
    }
  };

  const sizes = {
    xs: {
      padding: 'var(--space-1) var(--space-2)',
      fontSize: '0.625rem',
      fontWeight: '500'
    },
    sm: {
      padding: 'var(--space-1) var(--space-3)',
      fontSize: '0.75rem',
      fontWeight: '500'
    },
    md: {
      padding: 'var(--space-2) var(--space-3)',
      fontSize: '0.875rem',
      fontWeight: '500'
    }
  };

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    borderRadius: 'var(--radius-full)',
    border: '1px solid',
    whiteSpace: 'nowrap',
    transition: 'var(--transition)',
    ...variants[variant],
    ...sizes[size]
  };

  const BadgeComponent = animated ? motion.span : 'span';
  const animationProps = animated ? {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.2 },
    whileHover: { scale: 1.05 }
  } : {};

  return (
    <BadgeComponent 
      className={className}
      style={badgeStyle}
      {...animationProps}
      {...props}
    >
      {children}
    </BadgeComponent>
  );
};

// Status-specific badge components
export const StatusBadge = ({ status, ...props }) => {
  const statusMap = {
    active: { variant: 'success', children: 'Active' },
    inactive: { variant: 'neutral', children: 'Inactive' },
    pending: { variant: 'warning', children: 'Pending' },
    error: { variant: 'danger', children: 'Error' },
    completed: { variant: 'success', children: 'Completed' },
    draft: { variant: 'neutral', children: 'Draft' },
    published: { variant: 'brand', children: 'Published' }
  };

  const config = statusMap[status] || { variant: 'neutral', children: status };
  
  return <Badge {...config} {...props} />;
};

export const PriorityBadge = ({ priority, ...props }) => {
  const priorityMap = {
    low: { variant: 'info', children: 'Low' },
    medium: { variant: 'warning', children: 'Medium' }, 
    high: { variant: 'danger', children: 'High' },
    urgent: { variant: 'danger', children: 'Urgent' }
  };

  const config = priorityMap[priority] || { variant: 'neutral', children: priority };
  
  return <Badge {...config} {...props} />;
};

export default Badge;