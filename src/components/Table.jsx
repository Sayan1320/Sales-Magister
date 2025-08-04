import React from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';

// Main Table component
const Table = ({ 
  children,
  variant = 'default',
  stickyHeader = false,
  className = '',
  ...props 
}) => {
  const variants = {
    default: {},
    compact: { '--table-padding': 'var(--space-2) var(--space-3)' },
    spacious: { '--table-padding': 'var(--space-4) var(--space-6)' }
  };

  return (
    <div 
      className={`table-container ${className}`}
      style={{
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        backgroundColor: 'var(--bg)'
      }}
    >
      <table 
        className={`table ${variant} ${stickyHeader ? 'sticky-header' : ''}`}
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          ...variants[variant]
        }}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

// Table Head component
export const THead = ({ children, className = '', ...props }) => (
  <thead 
    className={`table-head ${className}`}
    style={{
      backgroundColor: 'var(--bg-secondary)',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}
    {...props}
  >
    {children}
  </thead>
);

// Table Body component  
export const TBody = ({ children, className = '', ...props }) => (
  <tbody className={`table-body ${className}`} {...props}>
    {children}
  </tbody>
);

// Table Row component
export const TRow = ({ 
  children, 
  clickable = false,
  selected = false,
  onClick,
  animated = true,
  className = '',
  ...props 
}) => {
  const RowComponent = animated ? motion.tr : 'tr';
  const animationProps = animated ? {
    whileHover: clickable ? { backgroundColor: 'var(--bg-secondary)' } : {},
    transition: { duration: 0.2 }
  } : {};

  return (
    <RowComponent
      className={`table-row ${clickable ? 'clickable' : ''} ${selected ? 'selected' : ''} ${className}`}
      onClick={clickable ? onClick : undefined}
      style={{
        borderBottom: '1px solid var(--border)',
        backgroundColor: selected ? 'var(--brand-light)' : 'transparent',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'var(--transition)'
      }}
      {...animationProps}
      {...props}
    >
      {children}
    </RowComponent>
  );
};

// Table Cell component
export const TCell = ({ 
  children, 
  header = false,
  sortable = false,
  sortDirection,
  onSort,
  align = 'left',
  width,
  className = '',
  ...props 
}) => {
  const Component = header ? 'th' : 'td';
  
  const cellStyle = {
    padding: 'var(--table-padding, var(--space-3) var(--space-4))',
    textAlign: align,
    fontWeight: header ? '600' : '400',
    fontSize: header ? '0.875rem' : '0.875rem',
    color: header ? 'var(--text)' : 'var(--text)',
    width: width,
    verticalAlign: 'middle'
  };

  if (sortable && header) {
    return (
      <Component
        className={`table-cell sortable ${className}`}
        style={{
          ...cellStyle,
          cursor: 'pointer',
          userSelect: 'none',
          position: 'relative'
        }}
        onClick={onSort}
        {...props}
      >
        <div className="cluster-2">
          {children}
          <div style={{ display: 'flex', flexDirection: 'column', opacity: 0.5 }}>
            <ChevronUp 
              size={12} 
              style={{ 
                color: sortDirection === 'asc' ? 'var(--brand)' : 'currentColor',
                opacity: sortDirection === 'asc' ? 1 : 0.5
              }} 
            />
            <ChevronDown 
              size={12} 
              style={{ 
                color: sortDirection === 'desc' ? 'var(--brand)' : 'currentColor',
                opacity: sortDirection === 'desc' ? 1 : 0.5,
                marginTop: '-2px'
              }} 
            />
          </div>
        </div>
      </Component>
    );
  }

  return (
    <Component
      className={`table-cell ${className}`}
      style={cellStyle}
      {...props}
    >
      {children}
    </Component>
  );
};

// Table utilities
export const TableActions = ({ children, className = '', ...props }) => (
  <div 
    className={`table-actions cluster-2 ${className}`}
    style={{ justifyContent: 'flex-end' }}
    {...props}
  >
    {children}
  </div>
);

export const TableEmpty = ({ children, colSpan, ...props }) => (
  <TRow>
    <TCell colSpan={colSpan} align="center" style={{ padding: 'var(--space-12)' }}>
      {children}
    </TCell>
  </TRow>
);

export default Table;