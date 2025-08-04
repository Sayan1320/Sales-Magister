import { differenceInDays, differenceInMinutes, parseISO } from 'date-fns';

/**
 * Lead scoring and metrics calculations
 */

/**
 * Calculate lead score based on weighted factors
 * @param {Object} lead - Lead object
 * @returns {number} Normalized score 0-100
 */
export const leadScore = (lead) => {
  if (!lead) return 0;
  
  // Budget weight: 0.35
  const budgetScores = {
    '$10K-50K': 25,
    '$50K-100K': 50, 
    '$100K-250K': 75,
    '$250K+': 100
  };
  const budgetScore = budgetScores[lead.budget] || 0;
  
  // Intent weight: 0.35
  const intentScores = {
    'low': 20,
    'medium': 60,
    'high': 100
  };
  const intentScore = intentScores[lead.intent] || 0;
  
  // Recency weight: 0.2 (days since last activity)
  const daysSinceActivity = differenceInDays(new Date(), parseISO(lead.lastActivityISO));
  const recencyScore = Math.max(0, 100 - (daysSinceActivity * 3)); // Decreases 3 points per day
  
  // Source quality weight: 0.1
  const sourceScores = {
    'referral': 100,
    'event': 75,
    'website': 50,
    'ad': 25
  };
  const sourceScore = sourceScores[lead.source] || 0;
  
  const totalScore = (budgetScore * 0.35) + (intentScore * 0.35) + (recencyScore * 0.2) + (sourceScore * 0.1);
  return Math.round(Math.min(100, Math.max(0, totalScore)));
};

/**
 * Calculate conversion rate
 * @param {Array} leads - Array of leads
 * @returns {number} Conversion rate as percentage
 */
export const conversionRate = (leads) => {
  if (!leads || leads.length === 0) return 0;
  const wonLeads = leads.filter(lead => lead.stage === 'won').length;
  return Math.round((wonLeads / leads.length) * 100 * 10) / 10; // One decimal place
};

/**
 * Calculate average lead score
 * @param {Array} leads - Array of leads
 * @returns {number} Average score
 */
export const avgLeadScore = (leads) => {
  if (!leads || leads.length === 0) return 0;
  const totalScore = leads.reduce((sum, lead) => sum + leadScore(lead), 0);
  return Math.round(totalScore / leads.length);
};

/**
 * Group leads by age buckets
 * @param {Array} leads - Array of leads
 * @returns {Object} Age buckets with counts
 */
export const agingBuckets = (leads) => {
  if (!leads) return { '0-7': 0, '8-30': 0, '31+': 0 };
  
  const buckets = { '0-7': 0, '8-30': 0, '31+': 0 };
  
  leads.forEach(lead => {
    const daysSinceCreated = differenceInDays(new Date(), parseISO(lead.createdAt));
    if (daysSinceCreated <= 7) {
      buckets['0-7']++;
    } else if (daysSinceCreated <= 30) {
      buckets['8-30']++;
    } else {
      buckets['31+']++;
    }
  });
  
  return buckets;
};

/**
 * Support ticket metrics calculations
 */

/**
 * Calculate first response time in minutes
 * @param {Object} ticket - Ticket object
 * @returns {number|null} Minutes to first response or null
 */
export const firstResponseTime = (ticket) => {
  if (!ticket || !ticket.firstResponseAtISO) return null;
  return differenceInMinutes(parseISO(ticket.firstResponseAtISO), parseISO(ticket.createdAtISO));
};

/**
 * Calculate resolution time in minutes
 * @param {Object} ticket - Ticket object
 * @returns {number|null} Minutes to resolution or null
 */
export const resolutionTime = (ticket) => {
  if (!ticket || !ticket.resolvedAtISO) return null;
  return differenceInMinutes(parseISO(ticket.resolvedAtISO), parseISO(ticket.createdAtISO));
};

/**
 * Check if ticket breached SLA
 * @param {Object} ticket - Ticket object
 * @param {Object} policy - SLA policy
 * @returns {boolean} True if breached
 */
export const slaBreached = (ticket, policy) => {
  if (!ticket || !policy) return false;
  
  const firstResponse = firstResponseTime(ticket);
  if (firstResponse && firstResponse > policy.firstResponseMins) {
    return true;
  }
  
  const resolution = resolutionTime(ticket);
  const resolutionLimit = policy.resolutionMinsByPriority[ticket.priority];
  if (resolution && resolutionLimit && resolution > resolutionLimit) {
    return true;
  }
  
  return false;
};

/**
 * Calculate SLA compliance percentage
 * @param {Array} tickets - Array of tickets
 * @param {Object} policy - SLA policy
 * @returns {number} Compliance percentage
 */
export const slaCompliance = (tickets, policy) => {
  if (!tickets || tickets.length === 0) return 100;
  
  const breachedCount = tickets.filter(ticket => slaBreached(ticket, policy)).length;
  return Math.round(((tickets.length - breachedCount) / tickets.length) * 100);
};

/**
 * Calculate average handle time in hours
 * @param {Array} tickets - Array of resolved tickets
 * @returns {number} Average handle time in hours
 */
export const avgHandleTime = (tickets) => {
  if (!tickets || tickets.length === 0) return 0;
  
  const resolvedTickets = tickets.filter(ticket => ticket.resolvedAtISO);
  if (resolvedTickets.length === 0) return 0;
  
  const totalMinutes = resolvedTickets.reduce((sum, ticket) => {
    const time = resolutionTime(ticket);
    return sum + (time || 0);
  }, 0);
  
  return Math.round((totalMinutes / resolvedTickets.length / 60) * 10) / 10; // Hours with 1 decimal
};

/**
 * Get backlog count
 * @param {Array} tickets - Array of tickets
 * @returns {number} Number of unresolved tickets
 */
export const backlog = (tickets) => {
  if (!tickets) return 0;
  return tickets.filter(ticket => ticket.status !== 'resolved').length;
};

/**
 * Calculate average CSAT score
 * @param {Array} tickets - Array of tickets
 * @returns {number} Average CSAT score
 */
export const csatAverage = (tickets) => {
  if (!tickets || tickets.length === 0) return 0;
  
  const ticketsWithCsat = tickets.filter(ticket => ticket.csat);
  if (ticketsWithCsat.length === 0) return 0;
  
  const totalCsat = ticketsWithCsat.reduce((sum, ticket) => sum + ticket.csat, 0);
  return Math.round((totalCsat / ticketsWithCsat.length) * 10) / 10;
};

/**
 * Supply chain calculations
 */

/**
 * Calculate days of supply
 * @param {Object} item - Inventory item
 * @returns {number} Days of supply remaining
 */
export const daysOfSupply = (item) => {
  if (!item || !item.dailyDemand) return 0;
  const demand = Math.max(1, item.dailyDemand);
  return Math.round(item.stock / demand);
};

/**
 * Check if item needs reordering
 * @param {Object} item - Inventory item
 * @returns {boolean} True if reorder needed
 */
export const reorderNeeded = (item) => {
  if (!item) return false;
  return item.stock <= item.reorderPoint;
};

/**
 * Calculate fill rate across all items
 * @param {Array} items - Array of inventory items
 * @returns {number} Fill rate as percentage
 */
export const fillRate = (items) => {
  if (!items || items.length === 0) return 100;
  
  const totalBackorders = items.reduce((sum, item) => sum + (item.backorders || 0), 0);
  const totalDemand = items.reduce((sum, item) => sum + item.dailyDemand * 30, 0); // Monthly demand
  const totalFulfilled = totalDemand - totalBackorders;
  
  if (totalDemand === 0) return 100;
  return Math.round((totalFulfilled / totalDemand) * 100);
};

/**
 * Calculate total inventory value
 * @param {Array} items - Array of inventory items
 * @returns {number} Total inventory value
 */
export const inventoryValue = (items) => {
  if (!items || items.length === 0) return 0;
  return items.reduce((sum, item) => sum + (item.stock * item.unitCost), 0);
};

/**
 * Calculate inventory turnover rate
 * @param {Array} items - Array of inventory items
 * @returns {number} Turnover rate
 */
export const turnover = (items) => {
  if (!items || items.length === 0) return 0;
  
  const annualDemandValue = items.reduce((sum, item) => 
    sum + (item.dailyDemand * 365 * item.unitCost), 0);
  const avgInventoryValue = inventoryValue(items);
  
  if (avgInventoryValue === 0) return 0;
  return Math.round((annualDemandValue / avgInventoryValue) * 10) / 10;
};

/**
 * Calculate supply risk score for an item
 * @param {Object} item - Inventory item
 * @returns {number} Risk score 0-100 (higher is riskier)
 */
export const supplyRiskScore = (item) => {
  if (!item) return 0;
  
  let riskScore = 0;
  
  // Stock level risk (40% weight)
  const stockRatio = item.stock / item.reorderPoint;
  if (stockRatio <= 0.2) riskScore += 40;
  else if (stockRatio <= 0.5) riskScore += 30;
  else if (stockRatio <= 1) riskScore += 20;
  
  // Supplier ETA risk (30% weight)
  if (item.supplierETA_days > 20) riskScore += 30;
  else if (item.supplierETA_days > 10) riskScore += 20;
  else if (item.supplierETA_days > 5) riskScore += 10;
  
  // Backorder risk (30% weight)
  const backorderRatio = item.backorders / Math.max(1, item.dailyDemand * 7); // Week's demand
  if (backorderRatio > 2) riskScore += 30;
  else if (backorderRatio > 1) riskScore += 20;
  else if (backorderRatio > 0.5) riskScore += 10;
  
  return Math.min(100, riskScore);
};

/**
 * Default SLA policy
 */
export const defaultSlaPolicy = {
  firstResponseMins: 240, // 4 hours
  resolutionMinsByPriority: {
    'High': 480,    // 8 hours
    'Medium': 1440, // 24 hours
    'Low': 4320     // 72 hours
  }
};