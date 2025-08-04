import { nanoid } from 'nanoid';
import { subDays } from 'date-fns';

/**
 * Lead data model and seed data
 * @typedef {Object} Lead
 * @property {string} id - Unique identifier
 * @property {string} name - Lead's full name
 * @property {string} email - Contact email
 * @property {string} company - Company name
 * @property {string} source - Lead source (referral, event, website, ad)
 * @property {string} budget - Budget range
 * @property {string} intent - Purchase intent level (high, medium, low)
 * @property {string} lastActivityISO - ISO date of last activity
 * @property {number} score - Lead score (0-100)
 * @property {string} stage - Current stage (new, contacted, qualified, won, lost)
 * @property {string} phone - Phone number
 * @property {string} createdAt - ISO date when lead was created
 */

const sources = ['referral', 'event', 'website', 'ad'];
const budgets = ['$10K-50K', '$50K-100K', '$100K-250K', '$250K+'];
const intents = ['high', 'medium', 'low'];
const stages = ['new', 'contacted', 'qualified', 'won', 'lost'];
const companies = [
  'TechCorp Inc', 'Digital Solutions Ltd', 'Innovation Labs', 'Future Systems',
  'Smart Business Co', 'Enterprise Tech', 'Cloud Dynamics', 'DataFlow Inc',
  'Nexus Solutions', 'Quantum Corp', 'Velocity Systems', 'Synergy Labs'
];
const names = [
  'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Kim',
  'Jessica Taylor', 'Robert Wilson', 'Amanda Davis', 'Christopher Lee',
  'Lisa Thompson', 'Kevin Brown', 'Maria Garcia', 'James Anderson'
];

/**
 * Generate mock lead data
 * @returns {Lead[]} Array of lead objects
 */
export const generateLeads = () => {
  const leads = [];
  
  for (let i = 0; i < 24; i++) {
    const name = names[i % names.length];
    const company = companies[i % companies.length];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const lastActivity = subDays(new Date(), Math.floor(Math.random() * 30));
    const createdAt = subDays(lastActivity, Math.floor(Math.random() * 10));
    
    const lead = {
      id: nanoid(),
      name: `${name} ${i > 11 ? 'Jr.' : ''}`,
      email: `${name.toLowerCase().replace(' ', '.')}@${company.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      company,
      source,
      budget: budgets[Math.floor(Math.random() * budgets.length)],
      intent: intents[Math.floor(Math.random() * intents.length)],
      lastActivityISO: lastActivity.toISOString(),
      score: Math.floor(Math.random() * 100),
      stage: stages[Math.floor(Math.random() * stages.length)],
      phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      createdAt: createdAt.toISOString()
    };
    
    leads.push(lead);
  }
  
  return leads;
};

/**
 * Initial seed data for leads
 */
export const seedLeads = generateLeads();

/**
 * Get lead by ID
 * @param {string} id - Lead ID
 * @returns {Lead|undefined} Found lead or undefined
 */
export const getLeadById = (id) => seedLeads.find(lead => lead.id === id);

/**
 * Get leads by stage
 * @param {string} stage - Stage to filter by
 * @returns {Lead[]} Filtered leads
 */
export const getLeadsByStage = (stage) => seedLeads.filter(lead => lead.stage === stage);

/**
 * Get leads by source
 * @param {string} source - Source to filter by
 * @returns {Lead[]} Filtered leads
 */
export const getLeadsBySource = (source) => seedLeads.filter(lead => lead.source === source);