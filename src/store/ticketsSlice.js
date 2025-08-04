import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { seedTickets } from '../data/tickets';

/**
 * Tickets slice for Zustand store
 */
export const useTicketsStore = create((set, get) => ({
  // State
  tickets: [],
  loading: false,
  error: null,
  
  // Actions
  setTickets: (tickets) => set({ tickets }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  // Hydrate from API or seed data
  hydrate: async () => {
    set({ loading: true, error: null });
    try {
      const tickets = [...seedTickets];
      set({ tickets, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  // Add new ticket
  addTicket: (ticketData) => {
    const newTicket = {
      id: `TCK-${nanoid(8).toUpperCase()}`,
      createdAtISO: new Date().toISOString(),
      status: 'open',
      priority: 'Medium',
      ...ticketData
    };
    
    set(state => ({
      tickets: [...state.tickets, newTicket]
    }));
    
    return newTicket;
  },
  
  // Update ticket
  updateTicket: (id, updates) => {
    set(state => ({
      tickets: state.tickets.map(ticket => 
        ticket.id === id ? { ...ticket, ...updates } : ticket
      )
    }));
  },
  
  // Record first response
  recordFirstResponse: (ticketId) => {
    const updates = {
      firstResponseAtISO: new Date().toISOString(),
      status: 'in_progress'
    };
    
    get().updateTicket(ticketId, updates);
  },
  
  // Resolve ticket
  resolveTicket: (ticketId, csat = null) => {
    const updates = {
      resolvedAtISO: new Date().toISOString(),
      status: 'resolved',
      ...(csat && { csat })
    };
    
    get().updateTicket(ticketId, updates);
  },
  
  // Escalate ticket
  escalateTicket: (ticketId) => {
    const updates = {
      priority: 'High',
      assignee: 'Tier-2 Support',
      status: 'in_progress'
    };
    
    get().updateTicket(ticketId, updates);
    
    // Emit escalation event
    const orchestrationStore = require('./orchestrationSlice').useOrchestrationStore;
    orchestrationStore.getState().addEvent({
      type: 'ticket.escalated',
      payload: { ticketId },
      source: 'TicketsStore'
    });
  },
  
  // Generate AI response for ticket
  generateResponse: async (ticketId) => {
    const { tickets } = get();
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (!ticket) return null;
    
    // Simulate AI response generation
    const responses = {
      'Technical': `Thank you for contacting CRM Cloud support. I've reviewed your technical issue and found a solution. Please try the following steps: 1) Clear your browser cache, 2) Disable browser extensions, 3) Try accessing from an incognito window. If the issue persists, I'll escalate this to our technical team.`,
      'Billing': `I apologize for the billing confusion. I've reviewed your account and can see the discrepancy. I'm processing a correction and you should see the adjustment within 2-3 business days. I'll send you a confirmation email with the details.`,
      'General': `Thank you for reaching out to CRM Cloud support. I've reviewed your inquiry and I'm here to help. Based on your description, I recommend checking our knowledge base article on this topic. I've also scheduled a follow-up to ensure your issue is fully resolved.`,
      'Feature Request': `Thank you for your feature suggestion! This is valuable feedback that I'll forward to our product team. Feature requests are reviewed quarterly and prioritized based on customer impact. I'll keep you updated on the status of this request.`,
      'Bug Report': `Thank you for reporting this bug. I've logged this issue in our system with ID ${ticket.id}. Our development team will investigate and provide a fix. I'll keep you updated on the progress and notify you when a resolution is available.`
    };
    
    return responses[ticket.category] || responses['General'];
  },
  
  // Delete ticket
  deleteTicket: (id) => {
    set(state => ({
      tickets: state.tickets.filter(ticket => ticket.id !== id)
    }));
  },
  
  // Get ticket by ID
  getTicketById: (id) => {
    const { tickets } = get();
    return tickets.find(ticket => ticket.id === id);
  },
  
  // Get tickets by status
  getTicketsByStatus: (status) => {
    const { tickets } = get();
    return tickets.filter(ticket => ticket.status === status);
  },
  
  // Get tickets by priority
  getTicketsByPriority: (priority) => {
    const { tickets } = get();
    return tickets.filter(ticket => ticket.priority === priority);
  }
}));