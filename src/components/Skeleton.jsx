import React from 'react';

const Skeleton = ({ 
  width = '100%', 
  height = '1rem', 
  variant = 'rectangular',
  className = '',
  animated = true,
  ...props 
}) => {
  const variants = {
    text: {
      height: '1rem',
      borderRadius: 'var(--radius-sm)'
    },
    title: {
      height: '1.5rem',
      borderRadius: 'var(--radius-sm)'
    },
    rectangular: {
      borderRadius: 'var(--radius)'
    },
    circular: {
      borderRadius: '50%',
      width: height
    },
    avatar: {
      borderRadius: '50%',
      width: '2.5rem',
      height: '2.5rem'
    }
  };

  const baseStyle = {
    backgroundColor: 'var(--bg-secondary)',
    width,
    height,
    display: 'inline-block',
    ...variants[variant]
  };

  const animatedStyle = animated ? {
    ...baseStyle,
    backgroundImage: `linear-gradient(90deg, 
      var(--bg-secondary) 25%, 
      var(--border) 50%, 
      var(--bg-secondary) 75%)`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite'
  } : baseStyle;

  return (
    <>
      <div 
        className={`skeleton ${className}`}
        style={animatedStyle}
        {...props}
      />
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </>
  );
};

// Pre-configured skeleton components
export const SkeletonText = ({ lines = 3, ...props }) => (
  <div className="stack-2">
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton 
        key={i}
        variant="text" 
        width={i === lines - 1 ? '60%' : '100%'}
        {...props}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ ...props }) => (
  <div className="card stack-3">
    <Skeleton variant="title" width="40%" />
    <SkeletonText lines={2} />
    <div className="cluster-2">
      <Skeleton width="80px" height="32px" />
      <Skeleton width="60px" height="32px" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4, ...props }) => (
  <div className="stack-3">
    {/* Header */}
    <div className="flex gap-4">
      {Array.from({ length: columns }, (_, i) => (
        <Skeleton key={i} variant="text" width="120px" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4">
        {Array.from({ length: columns }, (_, colIndex) => (
          <Skeleton 
            key={colIndex} 
            variant="text" 
            width={colIndex === 0 ? "150px" : "100px"} 
          />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonAvatar = ({ size = '2.5rem', ...props }) => (
  <Skeleton variant="circular" width={size} height={size} {...props} />
);

export default Skeleton;