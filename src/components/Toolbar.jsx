import React from 'react';
import { Search } from 'lucide-react';

const Toolbar = ({ 
  children,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  actions,
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={`toolbar ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 'var(--space-6)',
        flexWrap: 'wrap'
      }}
      {...props}
    >
      <div className="toolbar-left cluster">
        {onSearchChange && (
          <div className="search-input" style={{ position: 'relative', minWidth: '250px' }}>
            <Search 
              size={16} 
              style={{
                position: 'absolute',
                left: 'var(--space-3)',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--muted)'
              }}
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="input"
              style={{
                paddingLeft: 'var(--space-10)'
              }}
            />
          </div>
        )}
        
        {filters && (
          <div className="toolbar-filters cluster-2">
            {filters}
          </div>
        )}
        
        {children}
      </div>
      
      {actions && (
        <div className="toolbar-actions cluster-2">
          {actions}
        </div>
      )}
    </div>
  );
};

// Filter chip component
export const FilterChip = ({ 
  active = false, 
  children, 
  onClick, 
  count,
  ...props 
}) => {
  return (
    <button
      className={`filter-chip ${active ? 'active' : ''}`}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        padding: 'var(--space-2) var(--space-3)',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--border)',
        backgroundColor: active ? 'var(--brand-light)' : 'var(--bg)',
        color: active ? 'var(--brand)' : 'var(--text-secondary)',
        fontSize: '0.875rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'var(--transition)',
        whiteSpace: 'nowrap'
      }}
      {...props}
    >
      {children}
      {typeof count === 'number' && (
        <span
          style={{
            backgroundColor: active ? 'var(--brand)' : 'var(--bg-secondary)',
            color: active ? 'white' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-full)',
            padding: '2px 6px',
            fontSize: '0.75rem',
            lineHeight: '1',
            minWidth: '18px',
            textAlign: 'center'
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
};

// Sort dropdown component
export const SortDropdown = ({ 
  value, 
  onChange, 
  options = [],
  ...props 
}) => {
  return (
    <div className="sort-dropdown" style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
        style={{
          paddingRight: 'var(--space-8)',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><polyline points='6,9 12,15 18,9'/></svg>")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right var(--space-3) center',
          backgroundSize: '16px'
        }}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Toolbar;