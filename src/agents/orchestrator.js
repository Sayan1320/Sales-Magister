import { leadAgent } from './leadAgent.js';
import { supportAgent } from './supportAgent.js';
import { supplyAgent } from './supplyAgent.js';
import { EventType } from './types.js';
import { useMetricsStore } from '../store/metrics.js';
import { useEventStore } from '../store/events.js';

export class AgentOrchestrator {
  constructor() {
    // Use singleton agent instances
    this.leadAgent = leadAgent;
    this.supportAgent = supportAgent;
    this.supplyAgent = supplyAgent;
    
    // Agent registry
    this.agents = {
      leadQualifier: this.leadAgent,
      customerSupport: this.supportAgent,
      supplyChain: this.supplyAgent
    };
    
    // Processing queues
    this.processingQueues = {
      leads: [],
      tickets: [],
      inventory: []
    };
    
    // Configuration
    this.config = {
      maxConcurrentProcessing: 3,
      retryAttempts: 3,
      retryDelay: 1000
    };
    
    this.isInitialized = false;
  }

  // Initialize the orchestrator
  async initialize() {
    if (this.isInitialized) return;
    
    console.log('🤖 Initializing AI Agent Orchestrator...');
    
    // Initialize event listeners
    this.setupEventListeners();
    
    // Initialize metrics
    await this.initializeMetrics();
    
    this.isInitialized = true;
    console.log('✅ AI Agent Orchestrator initialized successfully');
  }

  setupEventListeners() {
    const eventStore = useEventStore.getState();
    
    // Listen for metric updates
    eventStore.on(EventType.METRICS_UPDATED, (payload) => {
      console.log('📊 Metrics updated:', payload);
    });
    
    // Listen for lead qualification events
    eventStore.on(EventType.LEAD_QUALIFIED, (payload) => {
      console.log('🎯 Lead qualified:', payload);
      this.updateLeadMetrics();
    });
    
    // Listen for ticket resolution events
    eventStore.on(EventType.TICKET_RESOLVED, (payload) => {
      console.log('💬 Ticket resolved:', payload);
      this.updateTicketMetrics();
    });
    
    // Listen for inventory events
    eventStore.on(EventType.INVENTORY_ANALYZED, (payload) => {
      console.log('📦 Inventory analyzed:', payload);
    });
  }

  async initializeMetrics() {
    const metricsStore = useMetricsStore.getState();
    metricsStore.setLoading(true);
    
    try {
      // Fetch initial metrics from API
      const response = await fetch('/api/metrics');
      const metrics = await response.json();
      
      metricsStore.setMetrics(metrics);
      
      // Emit metrics updated event
      const eventStore = useEventStore.getState();
      eventStore.emit(EventType.METRICS_UPDATED, metrics);
      
    } catch (error) {
      console.error('Failed to initialize metrics:', error);
      metricsStore.setError('Failed to load metrics');
    } finally {
      metricsStore.setLoading(false);
    }
  }

  // Lead qualification workflow
  async onNewLead(leadData) {
    console.log('🎯 Processing new lead:', leadData.id);
    
    const eventStore = useEventStore.getState();
    
    try {
      // Emit processing start event
      eventStore.emit('lead_processing_started', { leadId: leadData.id });
      
      // Qualify the lead using the AI agent
      const qualificationResult = await this.leadAgent.qualifyLead(leadData);
      
      // Update metrics based on qualification result
      if (qualificationResult.score >= 60) {
        this.updateLeadMetrics('qualified');
        eventStore.emit(EventType.LEAD_QUALIFIED, {
          leadId: leadData.id,
          score: qualificationResult.score,
          recommendation: qualificationResult.recommendation
        });
      } else {
        eventStore.emit(EventType.LEAD_UNQUALIFIED, {
          leadId: leadData.id,
          score: qualificationResult.score,
          reason: qualificationResult.recommendation
        });
      }
      
      // Emit processing complete event
      eventStore.emit('lead_processing_completed', {
        leadId: leadData.id,
        result: qualificationResult
      });
      
      return qualificationResult;
      
    } catch (error) {
      console.error('Lead qualification failed:', error);
      eventStore.emit('lead_processing_failed', {
        leadId: leadData.id,
        error: error.message
      });
      throw error;
    }
  }

  // Ticket processing workflow
  async onTicketOpened(ticketData) {
    console.log('💬 Processing new ticket:', ticketData.id);
    
    const eventStore = useEventStore.getState();
    
    try {
      // Emit processing start event
      eventStore.emit('ticket_processing_started', { ticketId: ticketData.id });
      
      // Generate response using AI agent
      const supportReply = await this.supportAgent.draftSupportReply(ticketData);
      
      // Check if escalation is needed
      if (supportReply.escalationNeeded) {
        eventStore.emit('ticket_escalation_required', {
          ticketId: ticketData.id,
          reason: 'AI detected escalation needed'
        });
      }
      
      // Emit processing complete event
      eventStore.emit('ticket_processing_completed', {
        ticketId: ticketData.id,
        reply: supportReply
      });
      
      return supportReply;
      
    } catch (error) {
      console.error('Ticket processing failed:', error);
      eventStore.emit('ticket_processing_failed', {
        ticketId: ticketData.id,
        error: error.message
      });
      throw error;
    }
  }

  // Send ticket reply workflow
  async onTicketReply(ticketId, response) {
    console.log('💬 Sending ticket reply:', ticketId);
    
    const eventStore = useEventStore.getState();
    
    try {
      // Send the response (simulate API call)
      await this.simulateApiCall('/api/tickets/' + ticketId + '/reply', {
        method: 'POST',
        body: JSON.stringify({ response })
      });
      
      // Update metrics
      this.updateTicketMetrics('resolved');
      
      // Emit events
      eventStore.emit(EventType.TICKET_REPLIED, { ticketId, response });
      eventStore.emit(EventType.TICKET_RESOLVED, { ticketId });
      
      return { success: true, ticketId };
      
    } catch (error) {
      console.error('Failed to send ticket reply:', error);
      throw error;
    }
  }

  // Inventory analysis workflow
  async onInventorySelected(itemData) {
    console.log('📦 Analyzing inventory item:', itemData.id);
    
    const eventStore = useEventStore.getState();
    
    try {
      // Emit processing start event
      eventStore.emit('inventory_processing_started', { itemId: itemData.id });
      
      // Analyze using supply chain agent
      const analysis = await this.supplyAgent.analyzeInventory(itemData);
      
      // Check for critical alerts
      if (analysis.riskLevel === 'critical') {
        eventStore.emit('inventory_critical_alert', {
          itemId: itemData.id,
          itemName: itemData.name,
          currentStock: itemData.currentStock,
          reorderPoint: itemData.reorderPoint
        });
      }
      
      // Check if order should be generated
      if (analysis.orderRecommendation && analysis.orderRecommendation.recommended) {
        eventStore.emit('order_recommended', {
          itemId: itemData.id,
          recommendation: analysis.orderRecommendation
        });
      }
      
      // Emit analysis complete event
      eventStore.emit(EventType.INVENTORY_ANALYZED, {
        itemId: itemData.id,
        analysis
      });
      
      return analysis;
      
    } catch (error) {
      console.error('Inventory analysis failed:', error);
      eventStore.emit('inventory_processing_failed', {
        itemId: itemData.id,
        error: error.message
      });
      throw error;
    }
  }

  // Generate order workflow
  async onOrderGeneration(itemId, quantity) {
    console.log('📦 Generating order for item:', itemId);
    
    const eventStore = useEventStore.getState();
    
    try {
      // Generate order (simulate API call)
      const orderResult = await this.simulateApiCall('/api/inventory/' + itemId + '/order', {
        method: 'POST',
        body: JSON.stringify({ quantity })
      });
      
      // Update inventory metrics
      this.updateInventoryMetrics('order_generated');
      
      // Emit order generated event
      eventStore.emit(EventType.ORDER_GENERATED, {
        itemId,
        quantity,
        orderId: orderResult.orderId,
        estimatedDelivery: orderResult.estimatedDelivery
      });
      
      return orderResult;
      
    } catch (error) {
      console.error('Order generation failed:', error);
      throw error;
    }
  }

  // Metric update helpers
  updateLeadMetrics(action = 'processed') {
    const metricsStore = useMetricsStore.getState();
    
    if (action === 'qualified') {
      // Recalculate conversion rate
      const currentLeads = metricsStore.metrics.totalLeads;
      // This is simplified - in real app, you'd track qualified leads separately
      metricsStore.calculateConversionRate(Math.floor(currentLeads * 0.3), currentLeads);
    }
    
    // Emit metrics updated event
    const eventStore = useEventStore.getState();
    eventStore.emit(EventType.METRICS_UPDATED, {
      type: 'leads',
      action,
      metrics: metricsStore.metrics
    });
  }

  updateTicketMetrics(action = 'processed') {
    const metricsStore = useMetricsStore.getState();
    
    if (action === 'resolved') {
      metricsStore.decrementMetric('activeTickets');
    }
    
    // Emit metrics updated event
    const eventStore = useEventStore.getState();
    eventStore.emit(EventType.METRICS_UPDATED, {
      type: 'tickets',
      action,
      metrics: metricsStore.metrics
    });
  }

  updateInventoryMetrics(action = 'analyzed') {
    const metricsStore = useMetricsStore.getState();
    
    if (action === 'order_generated') {
      // In a real app, this might decrease inventory alerts
      // For demo, we'll keep it simple
    }
    
    // Emit metrics updated event
    const eventStore = useEventStore.getState();
    eventStore.emit(EventType.METRICS_UPDATED, {
      type: 'inventory',
      action,
      metrics: metricsStore.metrics
    });
  }

  // Batch processing capabilities
  async processBatch(type, items, maxConcurrent = 3) {
    console.log(`🔄 Processing batch of ${items.length} ${type} items`);
    
    const results = [];
    const errors = [];
    
    // Process items in batches
    for (let i = 0; i < items.length; i += maxConcurrent) {
      const batch = items.slice(i, i + maxConcurrent);
      
      const batchPromises = batch.map(async (item) => {
        try {
          let result;
          switch (type) {
            case 'leads':
              result = await this.onNewLead(item);
              break;
            case 'tickets':
              result = await this.onTicketOpened(item);
              break;
            case 'inventory':
              result = await this.onInventorySelected(item);
              break;
            default:
              throw new Error(`Unknown batch type: ${type}`);
          }
          return { success: true, item: item.id, result };
        } catch (error) {
          return { success: false, item: item.id, error: error.message };
        }
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            results.push(result.value);
          } else {
            errors.push(result.value);
          }
        } else {
          errors.push({ success: false, error: result.reason.message });
        }
      });
    }
    
    console.log(`✅ Batch processing complete: ${results.length} successful, ${errors.length} failed`);
    
    return { results, errors };
  }

  // Agent health monitoring
  getAgentStatus() {
    return {
      leadQualifier: {
        name: this.leadAgent.name,
        version: this.leadAgent.version,
        status: 'active',
        capabilities: this.leadAgent.capabilities,
        metrics: {
          processed: 0, // In real app, track this
          avgProcessingTime: '1.2s',
          successRate: '98%'
        }
      },
      customerSupport: {
        name: this.supportAgent.name,
        version: this.supportAgent.version,
        status: 'active',
        capabilities: this.supportAgent.capabilities,
        metrics: {
          processed: 0,
          avgProcessingTime: '1.8s',
          successRate: '96%'
        }
      },
      supplyChain: {
        name: this.supplyAgent.name,
        version: this.supplyAgent.version,
        status: 'active',
        capabilities: this.supplyAgent.capabilities,
        metrics: {
          processed: 0,
          avgProcessingTime: '1.5s',
          successRate: '99%'
        }
      }
    };
  }

  // Configuration management
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 Orchestrator configuration updated:', this.config);
  }

  // Utility methods
  async simulateApiCall(url, options = {}) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
    
    // Simulate occasional failures for demo
    if (Math.random() < 0.02) { // 2% failure rate
      throw new Error('Simulated API failure');
    }
    
    // Return mock response
    return {
      success: true,
      timestamp: new Date().toISOString(),
      orderId: 'ORD-' + Date.now(),
      estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  // Cleanup and shutdown
  async shutdown() {
    console.log('🛑 Shutting down AI Agent Orchestrator...');
    
    // Clear event listeners
    const eventStore = useEventStore.getState();
    eventStore.clearListeners();
    
    // Clear processing queues
    this.processingQueues = {
      leads: [],
      tickets: [],
      inventory: []
    };
    
    this.isInitialized = false;
    console.log('✅ AI Agent Orchestrator shutdown complete');
  }
}

// Create singleton instance
export const orchestrator = new AgentOrchestrator();