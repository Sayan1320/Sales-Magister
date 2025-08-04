import React from 'react';
import { 
  Card, 
  CardContent, 
  CardActionArea,
  Typography, 
  Box, 
  Chip,
  Avatar,
  Stack
} from '@mui/material';
import { Circle } from '@mui/icons-material';

const AgentCard = ({ agentName, status, metrics, icon, onClick }) => {
  const statusColors = {
    active: '#4caf50',
    inactive: '#9e9e9e',
    error: '#f44336'
  };

  return (
    <Card 
      elevation={2}
      sx={{ 
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        }
      }}
    >
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{ 
                bgcolor: status === 'active' ? 'primary.light' : 'grey.300',
                mr: 2,
                width: 48,
                height: 48
              }}
            >
              <Typography variant="h6">{icon}</Typography>
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div">
                {agentName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <Circle 
                  sx={{ 
                    fontSize: 12, 
                    color: statusColors[status] || statusColors.inactive,
                    mr: 0.5
                  }} 
                />
                <Typography variant="body2" color="textSecondary">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Stack spacing={1.5}>
            {Object.entries(metrics).map(([key, value]) => (
              <Box 
                key={key} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Typography variant="body2" color="textSecondary">
                  {key}:
                </Typography>
                <Chip 
                  label={value} 
                  size="small" 
                  color={status === 'active' ? 'primary' : 'default'}
                  variant="outlined"
                />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default AgentCard;