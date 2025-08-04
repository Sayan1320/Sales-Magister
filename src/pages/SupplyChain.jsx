import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Package, 
  AlertTriangle, 
  ShoppingCart,
  Truck,
  BarChart3,
  Loader2,
  DollarSign,
  MapPin,
  Star,
  Clock,
  Zap
} from 'lucide-react';

import Tabs from '../components/Tabs';
import Card from '../components/Card';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import Table, { THead, TBody, TRow, TCell } from '../components/Table';
import { LoadingEmptyState, ErrorEmptyState, NoDataEmptyState } from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { fetchInventory, analyzeInventoryItem, generateOrder, queryKeys } from '../services/api';
import { orchestrator } from '../agents/orchestrator';

const SupplyChain = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  // Fetch inventory
  const { 
    data: inventory = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: queryKeys.inventory(),
    queryFn: fetchInventory
  });

  // Generate order mutation
  const generateOrderMutation = useMutation({
    mutationFn: generateOrder,
    onSuccess: (result) => {
      success(`Order generated for ${result.quantity} units of ${selectedItem?.name}!`, {
        title: 'Order Created'
      });
      queryClient.invalidateQueries(queryKeys.inventory());
    },
    onError: () => {
      showError('Failed to generate order. Please try again.', {
        title: 'Order Error'
      });
    }
  });

  // Filter inventory by tab
  const filteredInventory = React.useMemo(() => {
    if (activeTab === 'all') return inventory;
    if (activeTab === 'alerts') {
      return inventory.filter(item => 
        item.status === 'critical' || item.status === 'low'
      );
    }
    return inventory.filter(item => item.status === activeTab);
  }, [inventory, activeTab]);

  // Get tab counts
  const tabCounts = React.useMemo(() => {
    const counts = {
      all: inventory.length,
      alerts: inventory.filter(item => item.status === 'critical' || item.status === 'low').length,
      critical: inventory.filter(item => item.status === 'critical').length,
      low: inventory.filter(item => item.status === 'low').length
    };
    return counts;
  }, [inventory]);

  // Handle item analysis
  const handleAnalyzeItem = useCallback(async (item) => {
    setSelectedItem(item);
    setAnalysisResult(null);
    setIsAnalyzing(true);
    
    try {
      // Use orchestrator for analysis
      const orchestratorResult = await orchestrator.onInventorySelected(item);
      
      // Also call API for consistency
      const response = await analyzeInventoryItem({ 
        sku: item.sku, 
        itemData: item 
      });
      
      setAnalysisResult({
        ...response,
        ...orchestratorResult
      });
      
      success('Analysis completed successfully!');
    } catch (err) {
      showError('Failed to analyze item. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [success, showError]);

  // Handle generate order
  const handleGenerateOrder = useCallback(() => {
    if (!selectedItem) return;
    
    generateOrderMutation.mutate({
      sku: selectedItem.sku,
      itemData: selectedItem
    });
  }, [selectedItem, generateOrderMutation]);

  // Get stock status
  const getStockStatus = (item) => {
    const percentage = (item.currentStock / item.maxStock) * 100;
    if (percentage < 20) return { variant: 'danger', label: 'Critical' };
    if (percentage < 50) return { variant: 'warning', label: 'Low' };
    return { variant: 'success', label: 'Good' };
  };

  const tabs = [
    { id: 'all', label: 'All Items', count: tabCounts.all },
    { id: 'alerts', label: 'Alerts', count: tabCounts.alerts },
    { id: 'critical', label: 'Critical', count: tabCounts.critical },
    { id: 'low', label: 'Low Stock', count: tabCounts.low }
  ];

  if (error) {
    return <ErrorEmptyState error={error.message} />;
  }

  return (
    <motion.div
      className="stack-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Supply Chain Monitor</h1>
        <p className="subtitle">AI-powered inventory management and supply chain optimization</p>
      </motion.div>

      {/* Tabs */}
      <Tabs 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Two-column layout */}
      <div className="grid grid-2" style={{ gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Left Panel - Inventory Table */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card 
            title={`Inventory (${filteredInventory.length} items)`}
            style={{ height: '700px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <LoadingEmptyState message="Loading inventory..." />
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <NoDataEmptyState type="inventory items" />
              </div>
            ) : (
              <div style={{ flex: 1, overflow: 'auto' }}>
                <Table variant="compact">
                  <THead>
                    <TRow>
                      <TCell header>Item</TCell>
                      <TCell header>SKU</TCell>
                      <TCell header>Category</TCell>
                      <TCell header>Stock</TCell>
                      <TCell header>Status</TCell>
                      <TCell header>Action</TCell>
                    </TRow>
                  </THead>
                  <TBody>
                    <AnimatePresence>
                      {filteredInventory.map((item, index) => {
                        const stockStatus = getStockStatus(item);
                        
                        return (
                          <TRow
                            key={item.id}
                            clickable
                            selected={selectedItem?.id === item.id}
                            onClick={() => handleAnalyzeItem(item)}
                            animated
                          >
                            <TCell>
                              <div className="stack-1">
                                <div className="font-medium">{item.name}</div>
                                <div className="muted">{item.subcategory}</div>
                              </div>
                            </TCell>
                            
                            <TCell>
                              <code className="muted">{item.sku}</code>
                            </TCell>
                            
                            <TCell>
                              <Badge variant="neutral" size="xs">
                                {item.category}
                              </Badge>
                            </TCell>
                            
                            <TCell>
                              <div className="stack-2">
                                <div className="flex items-center justify-between">
                                  <span className="subtle">{item.currentStock}</span>
                                  <span className="muted">/ {item.maxStock}</span>
                                </div>
                                <ProgressBar
                                  value={item.currentStock}
                                  max={item.maxStock}
                                  variant="auto"
                                  size="sm"
                                  animated={false}
                                />
                              </div>
                            </TCell>
                            
                            <TCell>
                              <Badge 
                                variant={stockStatus.variant} 
                                size="xs"
                              >
                                {stockStatus.label}
                              </Badge>
                            </TCell>
                            
                            <TCell>
                              <motion.button
                                className="btn btn-primary btn-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAnalyzeItem(item);
                                }}
                                disabled={isAnalyzing && selectedItem?.id === item.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {isAnalyzing && selectedItem?.id === item.id ? (
                                  <>
                                    <Loader2 size={12} className="animate-spin" />
                                    Analyzing...
                                  </>
                                ) : (
                                  <>
                                    <BarChart3 size={12} />
                                    Analyze
                                  </>
                                )}
                              </motion.button>
                            </TCell>
                          </TRow>
                        );
                      })}
                    </AnimatePresence>
                  </TBody>
                </Table>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Right Panel - Analysis */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {!selectedItem ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card style={{ height: '700px' }}>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center stack-4">
                      <Package size={48} style={{ color: 'var(--muted)', margin: '0 auto' }} />
                      <div>
                        <h3>Select an Item</h3>
                        <p className="subtle">Choose an inventory item to view detailed analysis and recommendations</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key={selectedItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  title="Item Analysis"
                  style={{ height: '700px', overflow: 'auto' }}
                >
                  <div className="stack-6">
                    {/* Item Info */}
                    <div className="stack-4">
                      <div>
                        <h3>{selectedItem.name}</h3>
                        <div className="cluster-2">
                          <Package size={16} />
                          <span className="subtle">{selectedItem.sku}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-2" style={{ gap: 'var(--space-3)' }}>
                        <div className="cluster-2">
                          <Truck size={14} style={{ color: 'var(--muted)' }} />
                          <span className="muted">{selectedItem.supplier}</span>
                        </div>
                        <div className="cluster-2">
                          <Clock size={14} style={{ color: 'var(--muted)' }} />
                          <span className="muted">{selectedItem.leadTime} days</span>
                        </div>
                        <div className="cluster-2">
                          <DollarSign size={14} style={{ color: 'var(--muted)' }} />
                          <span className="muted">${selectedItem.unitCost}</span>
                        </div>
                        <div className="cluster-2">
                          <MapPin size={14} style={{ color: 'var(--muted)' }} />
                          <span className="muted">{selectedItem.location}</span>
                        </div>
                      </div>

                      <div>
                        <h4>Current Stock Level</h4>
                        <ProgressBar
                          value={selectedItem.currentStock}
                          max={selectedItem.maxStock}
                          variant="auto"
                          showLabel={true}
                          animated={true}
                        />
                      </div>
                    </div>

                    {/* Analysis Results */}
                    {analysisResult && (
                      <motion.div
                        className="stack-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        {/* AI Recommendations */}
                        <div>
                          <h4 className="cluster-2">
                            <Zap size={16} style={{ color: 'var(--brand)' }} />
                            AI Recommendations
                          </h4>
                          <div className="stack-3">
                            {analysisResult.recommendations?.map((rec, index) => (
                              <motion.div
                                key={index}
                                className="flex gap-3 p-3"
                                style={{
                                  backgroundColor: 'var(--bg-secondary)',
                                  borderRadius: 'var(--radius)',
                                  border: '1px solid var(--border)'
                                }}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                              >
                                <div
                                  style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: rec.priority === 'high' ? 'var(--danger)' : 
                                                   rec.priority === 'medium' ? 'var(--warning)' : 'var(--info)',
                                    marginTop: '6px',
                                    flexShrink: 0
                                  }}
                                />
                                <div className="flex-1">
                                  <div className="subtle font-medium">{rec.action}</div>
                                  <div className="muted">{rec.reason}</div>
                                </div>
                              </motion.div>
                            )) || [
                              <div key="default" className="flex gap-3 p-3" style={{
                                backgroundColor: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)'
                              }}>
                                <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />
                                <div>
                                  <div className="subtle font-medium">Reorder Required</div>
                                  <div className="muted">Stock level is below reorder point</div>
                                </div>
                              </div>
                            ]}
                          </div>
                        </div>

                        {/* Generate Order Button */}
                        {(selectedItem.status === 'critical' || selectedItem.status === 'low') && (
                          <motion.button
                            className="btn btn-warning w-full cluster-2"
                            style={{
                              backgroundColor: 'var(--warning)',
                              color: 'white'
                            }}
                            onClick={handleGenerateOrder}
                            disabled={generateOrderMutation.isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                          >
                            {generateOrderMutation.isLoading ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                Generating Order...
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={16} />
                                GENERATE ORDER
                              </>
                            )}
                          </motion.button>
                        )}

                        {/* Historical Data */}
                        <div>
                          <h4>Historical Data</h4>
                          <div 
                            className="grid grid-3"
                            style={{
                              gap: 'var(--space-3)',
                              padding: 'var(--space-3)',
                              backgroundColor: 'var(--bg-secondary)',
                              borderRadius: 'var(--radius)'
                            }}
                          >
                            <div className="text-center">
                              <div style={{ 
                                fontSize: '1.25rem', 
                                fontWeight: '600',
                                color: 'var(--brand)'
                              }}>
                                {selectedItem.avgMonthlyUsage}
                              </div>
                              <div className="muted">Avg Monthly</div>
                            </div>
                            
                            <div className="text-center">
                              <div style={{ 
                                fontSize: '1.25rem', 
                                fontWeight: '600',
                                color: 'var(--info)'
                              }}>
                                {selectedItem.peakSeason}
                              </div>
                              <div className="muted">Peak Season</div>
                            </div>
                            
                            <div className="text-center">
                              <div style={{ 
                                fontSize: '1.25rem', 
                                fontWeight: '600',
                                color: 'var(--success)'
                              }}>
                                {selectedItem.turnoverRate}x
                              </div>
                              <div className="muted">Turnover Rate</div>
                            </div>
                          </div>
                        </div>

                        {/* Supplier Performance */}
                        <div>
                          <h4>Supplier Performance</h4>
                          <div className="stack-3">
                            <div className="flex items-center justify-between">
                              <span className="subtle">Quality Rating</span>
                              <div className="cluster-2">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <Star
                                      key={star}
                                      size={14}
                                      style={{
                                        color: star <= selectedItem.qualityRating ? 'var(--warning)' : 'var(--border)',
                                        fill: star <= selectedItem.qualityRating ? 'var(--warning)' : 'transparent'
                                      }}
                                    />
                                  ))}
                                </div>
                                <span className="muted">{selectedItem.qualityRating}/5</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="subtle">Defect Rate</span>
                              <span className={`font-medium ${selectedItem.defectRate < 0.05 ? 'text-success' : 'text-warning'}`}>
                                {(selectedItem.defectRate * 100).toFixed(2)}%
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="subtle">Last Order</span>
                              <span className="muted">
                                {new Date(selectedItem.lastOrderDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Loading State */}
                    {isAnalyzing && (
                      <motion.div
                        className="text-center stack-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--brand)', margin: '0 auto' }} />
                        <div>
                          <div className="subtle">Analyzing inventory data...</div>
                          <div className="muted">Generating AI recommendations</div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SupplyChain;