import React from 'react';
import { motion } from 'framer-motion';

const Tabs = ({ tabs, activeTab, onTabChange, className = '' }) => {
  return (
    <div className={`tabs ${className}`}>
      <div 
        className="tabs-nav"
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          marginBottom: 'var(--space-4)'
        }}
      >
        {tabs.map(tab => (
          <motion.button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: activeTab === tab.id ? 'var(--brand)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--brand)' : '2px solid transparent',
              transition: 'var(--transition)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}
            whileHover={{ 
              color: 'var(--brand)',
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            {tab.label}
            {typeof tab.count === 'number' && (
              <span
                style={{
                  backgroundColor: activeTab === tab.id ? 'var(--brand)' : 'var(--bg-secondary)',
                  color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-full)',
                  padding: '2px 6px',
                  fontSize: '0.75rem',
                  lineHeight: '1',
                  minWidth: '18px',
                  textAlign: 'center'
                }}
              >
                {tab.count}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;