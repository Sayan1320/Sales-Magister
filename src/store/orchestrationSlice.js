import { create } from 'zustand';
import { nanoid } from 'nanoid';

/**
 * Orchestration slice for event bus and task queue
 */
export const useOrchestrationStore = create((set, get) => ({
  // State
  events: [],
  tasks: [],
  agents: {
    leadAgent: { active: false, processed: 0 },
    supportAgent: { active: false, processed: 0 },
    supplyAgent: { active: false, processed: 0 }
  },
  
  // Event bus methods
  addEvent: (eventData) => {
    const event = {
      id: nanoid(),
      timestamp: new Date().toISOString(),
      ...eventData
    };
    
    set(state => ({
      events: [...state.events, event]
    }));
    
    // Process event immediately
    get().processEvent(event);
    
    return event;
  },
  
  // Process individual event
  processEvent: (event) => {
    const { addTask } = get();
    
    // Route events to appropriate handlers
    switch (event.type) {
      case 'lead.qualified':
        addTask({
          type: 'schedule_demo',
          payload: event.payload,
          priority: 'medium',
          source: 'LeadAgent'
        });
        break;
        
      case 'ticket.escalated':
        addTask({
          type: 'reassign_ticket',
          payload: { ...event.payload, newAssignee: 'Tier-2' },
          priority: 'high',
          source: 'SupportAgent'
        });
        break;
        
      case 'supply.alert':
        // Create support ticket for fulfillment risk
        addTask({
          type: 'create_fulfillment_ticket',
          payload: event.payload,
          priority: 'high',
          source: 'SupplyAgent'
        });
        
        // Notify UI with toast
        addTask({
          type: 'show_toast',
          payload: {
            type: 'warning',
            title: 'Supply Alert',
            message: `${event.payload.itemName} is running low (${event.payload.daysOfSupply} days remaining)`
          },
          priority: 'immediate',
          source: 'SupplyAgent'
        });
        break;
        
      case 'order.generated':
        addTask({
          type: 'show_toast',
          payload: {
            type: 'success',
            title: 'Order Generated',
            message: `Purchase order created for ${event.payload.quantity} units of ${event.payload.itemName}`
          },
          priority: 'immediate',
          source: 'InventoryStore'
        });
        break;
        
      default:
        // No action needed for unhandled event types
        console.log('Unhandled event type:', event.type);
        break;
    }
  },
  
  // Task queue methods
  addTask: (taskData) => {
    const task = {
      id: nanoid(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      priority: 'medium',
      ...taskData
    };
    
    set(state => ({
      tasks: [...state.tasks, task].sort((a, b) => {
        const priorities = { immediate: 3, high: 2, medium: 1, low: 0 };
        return priorities[b.priority] - priorities[a.priority];
      })
    }));
    
    return task;
  },
  
  // Process next task in queue
  processNextTask: async () => {
    const { tasks } = get();
    const pendingTask = tasks.find(task => task.status === 'pending');
    
    if (!pendingTask) return null;
    
    // Mark task as processing
    set(state => ({
      tasks: state.tasks.map(task => 
        task.id === pendingTask.id 
          ? { ...task, status: 'processing', startedAt: new Date().toISOString() }
          : task
      )
    }));
    
    try {
      // Execute task based on type
      await get().executeTask(pendingTask);
      
      // Mark task as completed
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === pendingTask.id 
            ? { ...task, status: 'completed', completedAt: new Date().toISOString() }
            : task
        )
      }));
      
      return { success: true, task: pendingTask };
    } catch (error) {
      // Mark task as failed
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === pendingTask.id 
            ? { ...task, status: 'failed', error: error.message, failedAt: new Date().toISOString() }
            : task
        )
      }));
      
      return { success: false, task: pendingTask, error };
    }
  },
  
  // Execute specific task
  executeTask: async (task) => {
    switch (task.type) {
      case 'schedule_demo':
        // Simulate demo scheduling
        console.log('Demo scheduled for lead:', task.payload);
        break;
        
      case 'reassign_ticket':
        // Update ticket assignment
        const ticketsStore = require('./ticketsSlice').useTicketsStore;
        ticketsStore.getState().updateTicket(task.payload.ticketId, {
          assignee: task.payload.newAssignee
        });
        break;
        
      case 'create_fulfillment_ticket':
        // Create support ticket for supply issue
        const ticketsStore2 = require('./ticketsSlice').useTicketsStore;
        ticketsStore2.getState().addTicket({
          subject: `Fulfillment Risk: ${task.payload.itemName}`,
          priority: 'High',
          category: 'General',
          customerName: 'System Generated',
          customerEmail: 'system@crmcloud.com',
          message: `Supply alert for ${task.payload.itemName} (SKU: ${task.payload.sku}). Current stock: ${task.payload.currentStock}, Days of supply: ${task.payload.daysOfSupply}`,
          assignee: 'Supply Chain Team'
        });
        break;
        
      case 'show_toast':
        // This would be handled by the UI toast system
        console.log('Toast notification:', task.payload);
        break;
        
      default:
        console.log('Unknown task type:', task.type);
    }
  },
  
  // Agent status methods
  updateAgentStatus: (agentName, updates) => {
    set(state => ({
      agents: {
        ...state.agents,
        [agentName]: {
          ...state.agents[agentName],
          ...updates
        }
      }
    }));
  },
  
  // Start agent
  startAgent: (agentName) => {
    get().updateAgentStatus(agentName, { 
      active: true, 
      startedAt: new Date().toISOString() 
    });
  },
  
  // Stop agent
  stopAgent: (agentName) => {
    get().updateAgentStatus(agentName, { 
      active: false, 
      stoppedAt: new Date().toISOString() 
    });
  },
  
  // Get recent events
  getRecentEvents: (limit = 10) => {
    const { events } = get();
    return events
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  },
  
  // Get pending tasks
  getPendingTasks: () => {
    const { tasks } = get();
    return tasks.filter(task => task.status === 'pending');
  },
  
  // Clear old events and completed tasks
  cleanup: () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    set(state => ({
      events: state.events.filter(event => 
        new Date(event.timestamp) > oneDayAgo
      ),
      tasks: state.tasks.filter(task => 
        task.status === 'pending' || 
        task.status === 'processing' || 
        new Date(task.createdAt) > oneDayAgo
      )
    }));
  }
}));