import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { seedLeads } from '../data/leads';
import { leadScore } from '../services/calculations';

/**
 * Leads slice for Zustand store
 */
export const useLeadsStore = create((set, get) => ({
  // State
  leads: [],
  loading: false,
  error: null,
  
  // Actions
  setLeads: (leads) => set({ leads }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  // Hydrate from API or seed data
  hydrate: async () => {
    set({ loading: true, error: null });
    try {
      // In a real app, this would fetch from API
      const leads = [...seedLeads];
      set({ leads, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  // Add new lead
  addLead: (leadData) => {
    const newLead = {
      id: nanoid(),
      createdAt: new Date().toISOString(),
      lastActivityISO: new Date().toISOString(),
      score: 0,
      stage: 'new',
      ...leadData
    };
    
    // Calculate initial score
    newLead.score = leadScore(newLead);
    
    set(state => ({
      leads: [...state.leads, newLead]
    }));
    
    return newLead;
  },
  
  // Update lead
  updateLead: (id, updates) => {
    set(state => ({
      leads: state.leads.map(lead => 
        lead.id === id 
          ? { ...lead, ...updates, lastActivityISO: new Date().toISOString() }
          : lead
      )
    }));
  },
  
  // Qualify lead (updates score and potentially stage)
  qualifyLead: async (id) => {
    const { leads, updateLead } = get();
    const lead = leads.find(l => l.id === id);
    
    if (!lead) return null;
    
    // Recalculate score
    const newScore = leadScore(lead);
    let newStage = lead.stage;
    
    // Stage transition logic
    if (newScore >= 70 && lead.stage === 'new') {
      newStage = 'qualified';
    } else if (newScore >= 85 && lead.stage === 'qualified') {
      newStage = 'won';
    }
    
    const updates = {
      score: newScore,
      stage: newStage,
      lastActivityISO: new Date().toISOString()
    };
    
    updateLead(id, updates);
    
    // Return qualification result
    return {
      score: newScore,
      decision: newScore >= 70 ? 'QUALIFY' : newScore >= 40 ? 'NURTURE' : 'DROP',
      reasons: generateQualificationReasons(lead, newScore)
    };
  },
  
  // Delete lead
  deleteLead: (id) => {
    set(state => ({
      leads: state.leads.filter(lead => lead.id !== id)
    }));
  },
  
  // Get lead by ID
  getLeadById: (id) => {
    const { leads } = get();
    return leads.find(lead => lead.id === id);
  },
  
  // Get leads by stage
  getLeadsByStage: (stage) => {
    const { leads } = get();
    return leads.filter(lead => lead.stage === stage);
  }
}));

/**
 * Generate qualification reasons based on lead data
 * @param {Object} lead - Lead object
 * @param {number} score - Calculated score
 * @returns {string[]} Array of reasons
 */
function generateQualificationReasons(lead, score) {
  const reasons = [];
  
  if (lead.budget === '$250K+') {
    reasons.push('High budget potential indicates strong purchasing power');
  } else if (lead.budget === '$100K-250K') {
    reasons.push('Good budget range for our solutions');
  }
  
  if (lead.intent === 'high') {
    reasons.push('High purchase intent signals immediate buying opportunity');
  } else if (lead.intent === 'medium') {
    reasons.push('Medium intent suggests active evaluation phase');
  }
  
  if (lead.source === 'referral') {
    reasons.push('Referral source typically indicates higher conversion rates');
  } else if (lead.source === 'event') {
    reasons.push('Event leads often have immediate interest and timeline');
  }
  
  if (score < 40) {
    reasons.push('Low overall score suggests need for further nurturing');
  } else if (score >= 70) {
    reasons.push('Strong overall profile meets qualification criteria');
  }
  
  return reasons.length > 0 ? reasons : ['Standard qualification assessment completed'];
}