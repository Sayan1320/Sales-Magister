import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const DashboardCard = ({ title, value, subtitle, trend, color = '#2196f3', loading = false }) => {
  return (
    <Card 
      elevation={2}
      sx={{ 
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        }
      }}
    >
      {loading && (
        <LinearProgress 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0,
            borderRadius: '4px 4px 0 0'
          }} 
        />
      )}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          backgroundColor: color,
          borderRadius: '4px 4px 0 0'
        }}
      />
      <CardContent sx={{ pt: 3 }}>
        <Typography color="textSecondary" gutterBottom variant="body2">
          {title}
        </Typography>
        <Typography variant="h3" component="div" sx={{ color, fontWeight: 'bold', my: 1 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            {subtitle}
          </Typography>
        )}
        {trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            {trend > 0 ? (
              <TrendingUp sx={{ color: '#4caf50', mr: 0.5 }} />
            ) : (
              <TrendingDown sx={{ color: '#f44336', mr: 0.5 }} />
            )}
            <Typography
              variant="body2"
              sx={{ 
                color: trend > 0 ? '#4caf50' : '#f44336',
                fontWeight: 'medium'
              }}
            >
              {Math.abs(trend)}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;