import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, BarChart3, TrendingUp, MessageSquare, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

const Navigation = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  
  const navItems = [
    { 
      path: '/', 
      label: 'Dashboard', 
      icon: BarChart3,
      match: (pathname) => pathname === '/' || pathname === '/dashboard'
    },
    { 
      path: '/lead-qualifier', 
      label: 'Lead Qualifier', 
      icon: TrendingUp,
      match: (pathname) => pathname.startsWith('/lead-qualifier')
    },
    { 
      path: '/customer-support', 
      label: 'Customer Support', 
      icon: MessageSquare,
      match: (pathname) => pathname.startsWith('/customer-support')
    },
    { 
      path: '/supply-chain', 
      label: 'Supply Chain', 
      icon: Package,
      match: (pathname) => pathname.startsWith('/supply-chain')
    },
  ];

  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link 
          to="/" 
          className="navbar-brand"
          style={{ textDecoration: 'none' }}
        >
          AI Agent Platform
        </Link>
        
        <div className="navbar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.match(location.pathname);
            
            return (
              <motion.div key={item.path} whileHover={{ y: -1 }} whileTap={{ y: 0 }}>
                <Link
                  to={item.path}
                  className={`navbar-link ${isActive ? 'active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
        
        <div className="navbar-end cluster-3">
          <div 
            className="last-updated"
            style={{
              fontSize: '0.75rem',
              color: 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)'
            }}
          >
            <span>Last updated:</span>
            <span style={{ fontWeight: '500' }}>{currentTime}</span>
          </div>
          
          <motion.button
            className="theme-toggle"
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon size={16} />
            ) : (
              <Sun size={16} />
            )}
          </motion.button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;