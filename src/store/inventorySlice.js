import { create } from 'zustand';
import { seedInventory } from '../data/inventory';
import { daysOfSupply, reorderNeeded } from '../services/calculations';

/**
 * Inventory slice for Zustand store
 */
export const useInventoryStore = create((set, get) => ({
  // State
  items: [],
  loading: false,
  error: null,
  
  // Actions
  setItems: (items) => set({ items }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  // Hydrate from API or seed data
  hydrate: async () => {
    set({ loading: true, error: null });
    try {
      const items = [...seedInventory];
      set({ items, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  // Update item stock
  updateItemStock: (sku, newStock) => {
    set(state => ({
      items: state.items.map(item => {
        if (item.sku === sku) {
          const updatedItem = { ...item, stock: newStock };
          
          // Update status based on new stock level
          let status = 'good';
          if (updatedItem.stock <= updatedItem.reorderPoint * 0.2) {
            status = 'critical';
          } else if (updatedItem.stock <= updatedItem.reorderPoint) {
            status = 'low';
          }
          
          return { ...updatedItem, status };
        }
        return item;
      })
    }));
    
    // Emit inventory change event
    const orchestrationStore = require('./orchestrationSlice').useOrchestrationStore;
    orchestrationStore.getState().addEvent({
      type: 'inventory.changed',
      payload: { sku, newStock },
      source: 'InventoryStore'
    });
  },
  
  // Receive inventory (increase stock)
  receiveInventory: (sku, quantity) => {
    const { items, updateItemStock } = get();
    const item = items.find(i => i.sku === sku);
    
    if (item) {
      const newStock = item.stock + quantity;
      updateItemStock(sku, newStock);
      
      return {
        success: true,
        message: `Received ${quantity} units of ${item.name}. New stock: ${newStock}`
      };
    }
    
    return {
      success: false,
      message: `Item with SKU ${sku} not found`
    };
  },
  
  // Consume inventory (decrease stock)
  consumeInventory: (sku, quantity) => {
    const { items, updateItemStock } = get();
    const item = items.find(i => i.sku === sku);
    
    if (item) {
      const newStock = Math.max(0, item.stock - quantity);
      updateItemStock(sku, newStock);
      
      // Check if this creates a supply alert
      if (reorderNeeded({ ...item, stock: newStock })) {
        get().raiseSupplyAlert(sku);
      }
      
      return {
        success: true,
        message: `Consumed ${quantity} units of ${item.name}. Remaining stock: ${newStock}`
      };
    }
    
    return {
      success: false,
      message: `Item with SKU ${sku} not found`
    };
  },
  
  // Raise supply alert
  raiseSupplyAlert: (sku) => {
    const { items } = get();
    const item = items.find(i => i.sku === sku);
    
    if (!item) return;
    
    // Emit supply alert event
    const orchestrationStore = require('./orchestrationSlice').useOrchestrationStore;
    orchestrationStore.getState().addEvent({
      type: 'supply.alert',
      payload: { 
        sku, 
        itemName: item.name,
        currentStock: item.stock,
        reorderPoint: item.reorderPoint,
        daysOfSupply: daysOfSupply(item)
      },
      source: 'InventoryStore'
    });
  },
  
  // Generate purchase order
  generateOrder: async (sku, quantity = null) => {
    const { items } = get();
    const item = items.find(i => i.sku === sku);
    
    if (!item) return null;
    
    // Calculate order quantity if not provided
    const orderQuantity = quantity || Math.max(
      item.reorderPoint * 2 - item.stock, // Bring to 2x reorder point
      item.dailyDemand * item.supplierETA_days // Cover lead time
    );
    
    const order = {
      id: `PO-${Date.now()}`,
      sku,
      itemName: item.name,
      quantity: orderQuantity,
      unitCost: item.unitCost,
      totalCost: orderQuantity * item.unitCost,
      supplier: item.supplier,
      expectedDelivery: new Date(Date.now() + item.supplierETA_days * 24 * 60 * 60 * 1000).toISOString(),
      status: 'submitted',
      createdAt: new Date().toISOString()
    };
    
    // Emit order generated event
    const orchestrationStore = require('./orchestrationSlice').useOrchestrationStore;
    orchestrationStore.getState().addEvent({
      type: 'order.generated',
      payload: order,
      source: 'InventoryStore'
    });
    
    return order;
  },
  
  // Get item by SKU
  getItemBySku: (sku) => {
    const { items } = get();
    return items.find(item => item.sku === sku);
  },
  
  // Get items by status
  getItemsByStatus: (status) => {
    const { items } = get();
    return items.filter(item => item.status === status);
  },
  
  // Get items needing reorder
  getItemsNeedingReorder: () => {
    const { items } = get();
    return items.filter(item => reorderNeeded(item));
  },
  
  // Get low stock items
  getLowStockItems: () => {
    const { items } = get();
    return items.filter(item => item.status === 'low' || item.status === 'critical');
  }
}));