import { useLeadsStore } from '../store/leadsSlice';
import { useOrchestrationStore } from '../store/orchestrationSlice';
import { leadScore } from '../services/calculations';

/**
 * Lead Agent - Handles lead qualification and scoring
 */
export class LeadAgent {
  constructor() {
    this.name = 'leadAgent';
    this.isActive = false;
    this.eventHandlers = new Map();
    this.setupEventHandlers();
  }
  
  /**
   * Setup event handlers for lead-related events
   */
  setupEventHandlers() {
    this.eventHandlers.set('lead.created', this.handleLeadCreated.bind(this));
    this.eventHandlers.set('lead.updated', this.handleLeadUpdated.bind(this));
  }
  
  /**
   * Handle lead created event
   * @param {Object} event - Event object
   */
  async handleLeadCreated(event) {
    const { leadId } = event.payload;
    const leadsStore = useLeadsStore.getState();
    const lead = leadsStore.leads.find(l => l.id === leadId);
    
    if (!lead) return;
    
    // Calculate initial score
    const score = leadScore(lead);
    
    // Update lead with calculated score
    leadsStore.updateLead(leadId, { score });
    
    // Check if lead qualifies
    if (score >= 70) {
      this.emitLeadQualified(lead, score);
    }
  }
  
  /**
   * Handle lead updated event
   * @param {Object} event - Event object
   */
  async handleLeadUpdated(event) {
    const { leadId } = event.payload;
    const leadsStore = useLeadsStore.getState();
    const lead = leadsStore.leads.find(l => l.id === leadId);
    
    if (!lead) return;
    
    // Recalculate score
    const newScore = leadScore(lead);
    const oldScore = lead.score || 0;
    
    // Update score if changed
    if (newScore !== oldScore) {
      leadsStore.updateLead(leadId, { score: newScore });
      
      // Check for qualification threshold
      if (newScore >= 70 && oldScore < 70) {
        this.emitLeadQualified(lead, newScore);
      }
    }
  }
  
  /**
   * Start the agent
   */
  start() {
    this.isActive = true;
    console.log('Lead Agent started');
  }
  
  /**
   * Stop the agent
   */
  stop() {
    this.isActive = false;
    console.log('Lead Agent stopped');
  }
  
  /**
   * Manually qualify a lead
   * @param {string|Object} leadIdOrData - Lead ID or lead data object
   * @returns {Object} Qualification result
   */
  async qualifyLead(leadIdOrData) {
    const leadsStore = useLeadsStore.getState();
    
    // Handle both leadId (string) and leadData (object)
    const leadId = typeof leadIdOrData === 'string' ? leadIdOrData : leadIdOrData.id;
    const result = await leadsStore.qualifyLead(leadId);
    
    if (result && result.decision === 'QUALIFY') {
      const lead = leadsStore.leads.find(l => l.id === leadId);
      if (lead) {
        this.emitLeadQualified(lead, result.score);
      }
    }
    
    return result;
  }
  
  /**
   * Emit lead qualified event
   * @param {Object} lead - Lead object
   * @param {number} score - Lead score
   */
  emitLeadQualified(lead, score) {
    const orchestrationStore = useOrchestrationStore.getState();
    
    orchestrationStore.emit('lead.qualified', {
      leadId: lead.id,
      leadName: lead.name,
      company: lead.company,
      score,
      qualificationTime: new Date().toISOString()
    }, this.name);
  }
  
  /**
   * Get agent statistics
   * @returns {Object} Agent stats
   */
  getStats() {
    const leadsStore = useLeadsStore.getState();
    const leads = leadsStore.leads;
    const qualifiedLeads = leads.filter(lead => lead.stage === 'Qualified' || lead.stage === 'Won');
    
    return {
      active: this.isActive,
      processed: leads.filter(l => l.score !== null).length,
      qualified: qualifiedLeads.length,
      avgScore: leads.length > 0 ? Math.round(leads.reduce((sum, lead) => sum + (lead.score || 0), 0) / leads.length) : 0
    };
  }
}

// Export singleton instance
export const leadAgent = new LeadAgent();