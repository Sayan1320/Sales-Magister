import { useInventoryStore } from '../store/inventorySlice';
import { useOrchestrationStore } from '../store/orchestrationSlice';
import { daysOfSupply, reorderNeeded, supplyRiskScore } from '../services/calculations';

/**
 * Supply Agent - Monitors inventory levels and manages supply chain alerts
 */
export class SupplyAgent {
  constructor() {
    this.name = 'supplyAgent';
    this.isActive = false;
    this.eventHandlers = new Map();
    this.monitoringInterval = null;
    this.setupEventHandlers();
  }
  
  /**
   * Setup event handlers for inventory-related events
   */
  setupEventHandlers() {
    this.eventHandlers.set('inventory.changed', this.handleInventoryChanged.bind(this));
    this.eventHandlers.set('inventory.tick', this.handleInventoryTick.bind(this));
  }
  
  /**
   * Handle inventory changed event
   * @param {Object} event - Event object
   */
  async handleInventoryChanged(event) {
    const { sku } = event.payload;
    const inventoryStore = useInventoryStore.getState();
    const item = inventoryStore.inventory.find(i => i.sku === sku);
    
    if (!item) return;
    
    // Check if item needs reordering
    if (reorderNeeded(item)) {
      inventoryStore.raiseSupplyAlert(sku);
    }
  }
  
  /**
   * Handle periodic inventory tick
   */
  async handleInventoryTick() {
    this.performInventoryCheck();
  }
  
  /**
   * Start the agent
   */
  start() {
    this.isActive = true;
    console.log('Supply Agent started');
    
    // Start periodic monitoring
    this.monitoringInterval = setInterval(() => {
      if (this.isActive) {
        this.performInventoryCheck();
      }
    }, 30000); // Check every 30 seconds
  }
  
  /**
   * Stop the agent
   */
  stop() {
    this.isActive = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log('Supply Agent stopped');
  }
  
  /**
   * Perform comprehensive inventory check
   */
  performInventoryCheck() {
    const inventoryStore = useInventoryStore.getState();
    const items = inventoryStore.inventory;
    
    let alertsGenerated = 0;
    
    items.forEach(item => {
      // Check reorder needs
      if (reorderNeeded(item)) {
        const riskScore = supplyRiskScore(item);
        
        // Only generate alert for high-risk items to avoid spam
        if (riskScore >= 60) {
          inventoryStore.raiseSupplyAlert(item.sku);
          alertsGenerated++;
        }
      }
    });
    
    if (alertsGenerated > 0) {
      console.log(`Supply Agent generated ${alertsGenerated} alerts`);
    }
  }
  
  /**
   * Analyze inventory item
   * @param {Object} item - Inventory item
   * @returns {Object} Analysis result
   */
  async analyzeInventory(item) {
    if (!item) return null;
    
    const dos = daysOfSupply(item);
    const riskScore = supplyRiskScore(item);
    const needsReorder = reorderNeeded(item);
    
    // Generate recommendations
    const recommendations = [];
    
    if (needsReorder) {
      recommendations.push({
        action: 'Generate Purchase Order',
        reason: `Stock level (${item.currentStock}) is below reorder point (${item.reorderPoint})`,
        priority: riskScore > 80 ? 'high' : 'medium'
      });
    }
    
    if (dos < 7) {
      recommendations.push({
        action: 'Expedite Delivery',
        reason: `Only ${dos} days of supply remaining`,
        priority: 'high'
      });
    }
    
    if (item.backorders && item.backorders > 0) {
      recommendations.push({
        action: 'Customer Communication',
        reason: `${item.backorders} units backordered`,
        priority: 'medium'
      });
    }
    
    if (riskScore < 30 && !needsReorder) {
      recommendations.push({
        action: 'Stock Level Optimal',
        reason: 'Current stock levels are within acceptable range',
        priority: 'low'
      });
    }
    
    return {
      daysOfSupply: dos,
      riskScore,
      riskLevel: riskScore > 80 ? 'critical' : riskScore > 60 ? 'high' : riskScore > 30 ? 'medium' : 'low',
      needsReorder,
      recommendations,
      orderRecommendation: needsReorder ? {
        recommended: true,
        quantity: Math.max(
          item.reorderPoint * 2 - item.currentStock,
          item.dailyDemand * item.supplierETA_days
        ),
        urgency: riskScore > 80 ? 'urgent' : 'normal'
      } : null
    };
  }
  
  /**
   * Get agent statistics
   * @returns {Object} Agent stats
   */
  getStats() {
    const inventoryStore = useInventoryStore.getState();
    const items = inventoryStore.items || []; // Fix: use 'items' property and provide fallback
    const lowStockItems = items.filter(item => item.status === 'critical' || item.status === 'low');
    
    return {
      active: this.isActive,
      processed: items.length,
      monitored: items.length,
      alerts: lowStockItems.length,
      efficiency: Math.round((1 - (lowStockItems.length / Math.max(items.length, 1))) * 100)
    };
  }
}

// Export singleton instance
export const supplyAgent = new SupplyAgent();