// API service wrappers for React Query
import { seedLeads } from '../data/leads';
import { seedTickets } from '../data/tickets';
import { seedInventory } from '../data/inventory';
import { 
  conversionRate, 
  avgLeadScore, 
  slaCompliance, 
  avgHandleTime, 
  backlog, 
  fillRate, 
  inventoryValue,
  defaultSlaPolicy 
} from './calculations';

// Fallback data stores (used when MSW is not available)
let fallbackLeads = [...seedLeads];
let fallbackTickets = [...seedTickets];
let fallbackInventory = [...seedInventory];

// MSW availability check removed as it's not currently used

// Dashboard APIs
export const fetchDashboardMetrics = async () => {
  console.log('🚀 fetchDashboardMetrics called');
  
  try {
    // Since we don't have a real backend, directly return fallback metrics
    // This avoids the fetch timeout issue that was causing the loading to hang
    console.log('📊 Calculating metrics with fallback data...');
    
    const metrics = {
      totalLeads: fallbackLeads.length,
      activeTickets: backlog(fallbackTickets),
      inventoryAlerts: fallbackInventory.filter(item => item.status === 'critical').length,
      conversionRate: conversionRate(fallbackLeads),
      avgLeadScore: avgLeadScore(fallbackLeads),
      slaCompliance: slaCompliance(fallbackTickets, defaultSlaPolicy),
      avgHandleTime: avgHandleTime(fallbackTickets),
      fillRate: fillRate(fallbackInventory),
      inventoryValue: inventoryValue(fallbackInventory)
    };
    
    console.log('✅ Metrics calculated successfully:', metrics);
    return metrics;
  } catch (error) {
    console.error('❌ Error calculating metrics:', error);
    throw error;
  }
};

// Lead APIs
export const fetchLeads = async () => {
  console.warn('Using fallback leads data (no backend available)');
  return fallbackLeads;
};

export const qualifyLead = async ({ leadId, leadData }) => {
  try {
    const response = await fetch(`/api/leads/${leadId}/qualify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to qualify lead');
    }
    
    return response.json();
  } catch (error) {
    // Fallback qualification logic
    console.warn('Using fallback lead qualification');
    const { leadScore } = await import('./calculations');
    const score = leadScore(leadData);
    const decision = score >= 70 ? 'QUALIFY' : score >= 40 ? 'NURTURE' : 'DROP';
    
    return {
      score,
      decision,
      reasons: [`Qualified with score: ${score}`]
    };
  }
};

// Ticket APIs
export const fetchTickets = async () => {
  console.warn('Using fallback tickets data (no backend available)');
  return fallbackTickets;
};

export const generateTicketReply = async ({ ticketId, ticketData }) => {
  try {
    const response = await fetch(`/api/tickets/${ticketId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticketData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate ticket reply');
    }
    
    return response.json();
  } catch (error) {
    // Use advanced AI response generation with NLU pipeline
    console.warn('Using advanced AI ticket reply generation');
    
    const { supportAgent } = await import('../agents/supportAgent');
    return await supportAgent.draftSupportReply(ticketData);
  }
};

export const sendTicketReply = async ({ ticketId, message, ticketData }) => {
  try {
    const response = await fetch(`/api/tickets/${ticketId}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, ticketData }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send ticket reply');
    }
    
    return response.json();
  } catch (error) {
    // Fallback - simulate sending
    console.warn('Using fallback ticket reply sending');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      ticketId,
      sentAt: new Date().toISOString()
    };
  }
};

// Inventory APIs
export const fetchInventory = async () => {
  console.warn('Using fallback inventory data (no backend available)');
  return fallbackInventory;
};

export const analyzeInventoryItem = async ({ sku, itemData }) => {
  try {
    const response = await fetch(`/api/inventory/${sku}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to analyze inventory item');
    }
    
    return response.json();
  } catch (error) {
    console.warn('Using fallback inventory analysis');
    const { daysOfSupply, reorderNeeded } = await import('./calculations');
    
    return {
      daysOfSupply: daysOfSupply(itemData),
      needsReorder: reorderNeeded(itemData),
      recommendations: [
        {
          action: 'Stock Analysis Complete',
          reason: 'Basic inventory analysis performed',
          priority: 'medium'
        }
      ]
    };
  }
};

export const generateOrder = async ({ sku, itemData }) => {
  try {
    const response = await fetch(`/api/inventory/${sku}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate order');
    }
    
    return response.json();
  } catch (error) {
    console.warn('Using fallback order generation');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const quantity = Math.max(
      itemData.reorderPoint * 2 - itemData.stock,
      itemData.dailyDemand * (itemData.supplierETA_days || 14)
    );
    
    return {
      success: true,
      orderId: `ORD-${Date.now()}`,
      sku,
      quantity,
      estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'submitted'
    };
  }
};

// React Query key factories
export const queryKeys = {
  dashboard: () => ['dashboard'],
  metrics: () => ['dashboard', 'metrics'],
  
  leads: () => ['leads'],
  lead: (id) => ['leads', 'detail', id],
  
  tickets: () => ['tickets'],
  ticket: (id) => ['tickets', 'detail', id],
  
  inventory: () => ['inventory'],
  inventoryItem: (id) => ['inventory', 'detail', id],
};