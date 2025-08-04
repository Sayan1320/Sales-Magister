import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  title, 
  meta, 
  actions, 
  className = '', 
  animated = true, 
  delay = 0,
  ...props 
}) => {
  const CardComponent = animated ? motion.div : 'div';
  const animationProps = animated ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, delay },
    whileHover: { y: -2, transition: { duration: 0.2 } }
  } : {};

  return (
    <CardComponent 
      className={`card ${className}`}
      {...animationProps}
      {...props}
    >
      {(title || meta || actions) && (
        <div className="card-header">
          <div className="flex-1">
            {title && <h3 className="card-title">{title}</h3>}
            {meta && <div className="card-meta">{meta}</div>}
          </div>
          {actions && (
            <div className="card-actions cluster-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {children && (
        <div className="card-content">
          {children}
        </div>
      )}
    </CardComponent>
  );
};

export default Card;