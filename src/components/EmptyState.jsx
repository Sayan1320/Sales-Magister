import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Search, Inbox, Database } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon = Inbox,
  title = "No data available", 
  description = "", 
  action,
  actionLabel = "Try Again",
  className = '',
  animated = true
}) => {
  const EmptyComponent = animated ? motion.div : 'div';
  const animationProps = animated ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  } : {};

  return (
    <EmptyComponent 
      className={`empty-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12) var(--space-6)',
        textAlign: 'center'
      }}
      {...animationProps}
    >
      <motion.div 
        style={{
          padding: 'var(--space-4)',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-full)',
          marginBottom: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        initial={animated ? { scale: 0 } : {}}
        animate={animated ? { scale: 1 } : {}}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Icon size={32} style={{ color: 'var(--muted)' }} />
      </motion.div>
      
      <motion.h3 
        style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: 'var(--text)',
          margin: '0 0 var(--space-2) 0'
        }}
        initial={animated ? { opacity: 0 } : {}}
        animate={animated ? { opacity: 1 } : {}}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {title}
      </motion.h3>
      
      {description && (
        <motion.p 
          style={{
            color: 'var(--text-secondary)',
            margin: '0 0 var(--space-6) 0',
            maxWidth: '24rem'
          }}
          initial={animated ? { opacity: 0 } : {}}
          animate={animated ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          {description}
        </motion.p>
      )}
      
      {action && (
        <motion.div
          initial={animated ? { opacity: 0, y: 10 } : {}}
          animate={animated ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          {typeof action === 'function' ? (
            <button className="btn btn-primary cluster-2" onClick={action}>
              <RefreshCw size={16} />
              {actionLabel}
            </button>
          ) : (
            action
          )}
        </motion.div>
      )}
    </EmptyComponent>
  );
};

// Pre-configured empty states
export const NoDataEmptyState = ({ type = 'items', onRefresh, ...props }) => (
  <EmptyState
    icon={Database}
    title={`No ${type} found`}
    description={`There are currently no ${type} to display.`}
    action={onRefresh}
    actionLabel="Refresh"
    {...props}
  />
);

export const NoSearchResultsEmptyState = ({ query, onClear, ...props }) => (
  <EmptyState
    icon={Search}
    title="No results found"
    description={query ? `No results found for "${query}". Try adjusting your search.` : "Try adjusting your search criteria."}
    action={onClear}
    actionLabel="Clear Search"
    {...props}
  />
);

export const LoadingEmptyState = ({ message = 'Loading...', ...props }) => (
  <EmptyState
    icon={() => (
      <div 
        className="animate-spin"
        style={{
          width: '32px',
          height: '32px',
          border: '3px solid var(--bg-secondary)',
          borderTop: '3px solid var(--brand)',
          borderRadius: '50%'
        }}
      />
    )}
    title="Loading"
    description={message}
    animated={false}
    {...props}
  />
);

export const ErrorEmptyState = ({ error, onRetry, ...props }) => (
  <EmptyState
    icon={AlertCircle}
    title="Something went wrong"
    description={error || 'An unexpected error occurred. Please try again.'}
    action={onRetry}
    actionLabel="Try Again"
    {...props}
  />
);

export default EmptyState;