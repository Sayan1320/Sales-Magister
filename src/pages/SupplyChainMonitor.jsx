import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Button,
  LinearProgress,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  IconButton,
  Fade
} from '@mui/material';
import {
  Inventory,
  Warning,
  TrendingDown,
  LocalShipping,
  Analytics,
  ShoppingCart,
  Refresh,
  CheckCircle
} from '@mui/icons-material';
import { fetchInventory, checkSupplyChain, generateOrder } from '../services/apiService';

const SupplyChainMonitor = () => {
  const [inventory, setInventory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState(0); // 0 = inventory, 1 = alerts
  const [loading, setLoading] = useState(true);
  const [generatingOrder, setGeneratingOrder] = useState(false);

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    setLoading(true);
    try {
      const inventoryData = await fetchInventory();
      setInventory(inventoryData);
      
      const lowStockItems = inventoryData.filter(item => 
        item.currentStock <= item.reorderPoint
      );
      setAlerts(lowStockItems);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeItem = async (item) => {
    setIsAnalyzing(true);
    setSelectedItem(item);
    setRecommendations([]);
    
    try {
      const analysis = await checkSupplyChain(item.id);
      setRecommendations(analysis.recommendations);
    } catch (error) {
      console.error('Error analyzing supply chain:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateOrder = async (item, quantity) => {
    setGeneratingOrder(true);
    try {
      await generateOrder(item.id, quantity);
      loadInventoryData();
      // In a real app, you'd show a success message
    } catch (error) {
      console.error('Error generating order:', error);
    } finally {
      setGeneratingOrder(false);
    }
  };

  const getStockStatus = (current, reorder) => {
    const percentage = (current / reorder) * 100;
    if (percentage <= 50) return { color: 'error', text: 'Critical' };
    if (percentage <= 100) return { color: 'warning', text: 'Low' };
    return { color: 'success', text: 'Healthy' };
  };

  const StockLevelIndicator = ({ current, reorder }) => {
    const percentage = Math.min((current / reorder) * 100, 100);
    const status = getStockStatus(current, reorder);
    
    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption">
            {current} / {reorder} units
          </Typography>
          <Chip 
            label={status.text} 
            size="small" 
            color={status.color}
          />
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={percentage} 
          color={status.color}
          sx={{ height: 8, borderRadius: 1 }}
        />
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 2 }}>
        Supply Chain Monitor Agent
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        AI-powered inventory management and supply chain optimization
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={viewMode} onChange={(e, v) => setViewMode(v)}>
          <Tab 
            label="Inventory Overview" 
            icon={<Inventory />} 
            iconPosition="start"
          />
          <Tab 
            label={
              <Badge badgeContent={alerts.length} color="error">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Warning sx={{ mr: 1 }} />
                  Alerts
                </Box>
              </Badge>
            }
          />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  {viewMode === 0 ? 'Inventory Items' : 'Low Stock Alerts'}
                </Typography>
                <IconButton onClick={loadInventoryData} size="small">
                  <Refresh />
                </IconButton>
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>SKU</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Stock Level</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(viewMode === 0 ? inventory : alerts).map((item) => (
                        <TableRow 
                          key={item.id}
                          hover
                          selected={selectedItem?.id === item.id}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {item.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {item.sku}
                            </Typography>
                          </TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell sx={{ minWidth: 200 }}>
                            <StockLevelIndicator 
                              current={item.currentStock} 
                              reorder={item.reorderPoint}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Analytics />}
                              onClick={() => handleAnalyzeItem(item)}
                              disabled={isAnalyzing && selectedItem?.id === item.id}
                            >
                              Analyze
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Supply Chain Analysis
              </Typography>
              
              {selectedItem ? (
                <Box>
                  <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" gutterBottom>
                      {selectedItem.name}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">
                          Supplier
                        </Typography>
                        <Typography variant="body2">
                          {selectedItem.supplier}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">
                          Lead Time
                        </Typography>
                        <Typography variant="body2">
                          {selectedItem.leadTime} days
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">
                          Unit Cost
                        </Typography>
                        <Typography variant="body2">
                          ${selectedItem.unitCost}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">
                          Last Order
                        </Typography>
                        <Typography variant="body2">
                          {new Date(selectedItem.lastOrderDate).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  {isAnalyzing ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress sx={{ mb: 2 }} />
                      <Typography color="textSecondary">
                        AI Agent is analyzing supply chain data...
                      </Typography>
                    </Box>
                  ) : recommendations.length > 0 && (
                    <Fade in={true}>
                      <Box>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <AlertTitle>AI Recommendations</AlertTitle>
                        </Alert>
                        
                        <List>
                          {recommendations.map((rec, index) => (
                            <ListItem key={index} sx={{ pl: 0 }}>
                              <ListItemIcon>
                                {rec.type === 'reorder' ? (
                                  <ShoppingCart color={rec.urgency === 'critical' ? 'error' : 'warning'} />
                                ) : (
                                  <TrendingDown color="info" />
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={rec.message}
                                secondary={
                                  rec.type === 'reorder' && (
                                    <Button
                                      variant="contained"
                                      size="small"
                                      color={rec.urgency === 'critical' ? 'error' : 'warning'}
                                      startIcon={<LocalShipping />}
                                      onClick={() => handleGenerateOrder(selectedItem, rec.quantity)}
                                      disabled={generatingOrder}
                                      sx={{ mt: 1 }}
                                    >
                                      Generate Order for {rec.quantity} units
                                    </Button>
                                  )
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Fade>
                  )}

                  <Paper sx={{ p: 2, mt: 2, bgcolor: 'info.light' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Historical Data
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="textSecondary">
                          Average Monthly Usage: {selectedItem.avgMonthlyUsage} units
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="textSecondary">
                          Peak Season: {selectedItem.peakSeason}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="textSecondary">
                          Turnover Rate: {selectedItem.turnoverRate}x per year
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                  <Inventory sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                  <Typography>
                    Select an inventory item to view supply chain analysis
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SupplyChainMonitor;