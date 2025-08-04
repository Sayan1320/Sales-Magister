// Type definitions and enums for the AI agent platform

export const LeadStatus = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  UNQUALIFIED: 'unqualified',
  NURTURE: 'nurture',
  CONVERTED: 'converted'
};

export const TicketStatus = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

export const TicketPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const InventoryStatus = {
  HEALTHY: 'healthy',
  LOW: 'low',
  CRITICAL: 'critical',
  OUT_OF_STOCK: 'out_of_stock'
};

export const AgentType = {
  LEAD_QUALIFIER: 'lead_qualifier',
  SUPPORT_AGENT: 'support_agent',
  SUPPLY_CHAIN: 'supply_chain'
};

export const EventType = {
  LEAD_QUALIFIED: 'lead_qualified',
  LEAD_UNQUALIFIED: 'lead_unqualified',
  TICKET_REPLIED: 'ticket_replied',
  TICKET_RESOLVED: 'ticket_resolved',
  INVENTORY_ANALYZED: 'inventory_analyzed',
  ORDER_GENERATED: 'order_generated',
  METRICS_UPDATED: 'metrics_updated'
};

// Lead type definition
export class Lead {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.company = data.company;
    this.email = data.email;
    this.phone = data.phone;
    this.source = data.source;
    this.status = data.status || LeadStatus.NEW;
    this.budget = data.budget;
    this.industry = data.industry;
    this.companySize = data.companySize;
    this.role = data.role;
    this.interests = data.interests || [];
    this.lastContact = data.lastContact;
    this.notes = data.notes;
    this.createdAt = data.createdAt;
    this.score = data.score;
    this.qualificationData = data.qualificationData;
  }
  
  isQualified() {
    return this.score && this.score >= 60;
  }
  
  getPriorityLevel() {
    if (!this.score) return 'unknown';
    if (this.score >= 80) return 'high';
    if (this.score >= 60) return 'medium';
    return 'low';
  }
}

// Ticket type definition
export class Ticket {
  constructor(data) {
    this.id = data.id;
    this.subject = data.subject;
    this.customerName = data.customerName;
    this.customerEmail = data.customerEmail;
    this.customerId = data.customerId;
    this.category = data.category;
    this.subcategory = data.subcategory;
    this.priority = data.priority || TicketPriority.MEDIUM;
    this.status = data.status || TicketStatus.OPEN;
    this.channel = data.channel;
    this.message = data.message;
    this.attachments = data.attachments || [];
    this.tags = data.tags || [];
    this.assignedTo = data.assignedTo;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.responseTime = data.responseTime;
    this.resolutionTime = data.resolutionTime;
    this.customerSatisfaction = data.customerSatisfaction;
    this.history = data.history || [];
  }
  
  isOpen() {
    return this.status === TicketStatus.OPEN || this.status === TicketStatus.IN_PROGRESS;
  }
  
  getAgeInHours() {
    return Math.floor((new Date() - new Date(this.createdAt)) / (1000 * 60 * 60));
  }
  
  getSeverityScore() {
    const priorityScores = {
      [TicketPriority.LOW]: 1,
      [TicketPriority.MEDIUM]: 2,
      [TicketPriority.HIGH]: 3,
      [TicketPriority.CRITICAL]: 4
    };
    
    const ageBonus = Math.min(this.getAgeInHours() / 24, 2); // Max 2 points for age
    return priorityScores[this.priority] + ageBonus;
  }
}

// InventoryItem type definition
export class InventoryItem {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.sku = data.sku;
    this.category = data.category;
    this.subcategory = data.subcategory;
    this.currentStock = data.currentStock;
    this.reorderPoint = data.reorderPoint;
    this.reorderQuantity = data.reorderQuantity;
    this.maxStock = data.maxStock;
    this.minStock = data.minStock;
    this.unitCost = data.unitCost;
    this.sellingPrice = data.sellingPrice;
    this.supplier = data.supplier;
    this.supplierCode = data.supplierCode;
    this.leadTime = data.leadTime;
    this.lastOrderDate = data.lastOrderDate;
    this.lastOrderQuantity = data.lastOrderQuantity;
    this.lastReceivedDate = data.lastReceivedDate;
    this.avgMonthlyUsage = data.avgMonthlyUsage;
    this.avgDailyUsage = data.avgDailyUsage;
    this.peakSeason = data.peakSeason;
    this.turnoverRate = data.turnoverRate;
    this.warehouse = data.warehouse;
    this.location = data.location;
    this.status = data.status;
    this.qualityRating = data.qualityRating;
    this.defectRate = data.defectRate;
    this.stockValue = data.stockValue;
    this.forecastedDemand = data.forecastedDemand || {};
    this.historicalData = data.historicalData || [];
  }
  
  getStockStatus() {
    if (this.currentStock <= 0) return InventoryStatus.OUT_OF_STOCK;
    if (this.currentStock <= this.reorderPoint * 0.5) return InventoryStatus.CRITICAL;
    if (this.currentStock <= this.reorderPoint) return InventoryStatus.LOW;
    return InventoryStatus.HEALTHY;
  }
  
  getStockPercentage() {
    return Math.min((this.currentStock / this.reorderPoint) * 100, 100);
  }
  
  getDaysUntilStockout() {
    if (this.avgDailyUsage <= 0) return Infinity;
    return Math.floor(this.currentStock / this.avgDailyUsage);
  }
  
  needsReorder() {
    return this.currentStock <= this.reorderPoint;
  }
  
  isCritical() {
    return this.getStockStatus() === InventoryStatus.CRITICAL;
  }
}

// Agent result types
export class QualificationResult {
  constructor(data) {
    this.leadId = data.leadId;
    this.score = data.score;
    this.budgetFit = data.budgetFit;
    this.authority = data.authority;
    this.need = data.need;
    this.timeline = data.timeline;
    this.recommendation = data.recommendation;
    this.nextSteps = data.nextSteps || [];
    this.confidence = data.confidence || 0.8;
    this.reasoning = data.reasoning || '';
  }
}

export class SupportReply {
  constructor(data) {
    this.ticketId = data.ticketId;
    this.suggestedResponse = data.suggestedResponse;
    this.confidence = data.confidence || 0.8;
    this.category = data.category;
    this.sentiment = data.sentiment || 'neutral';
    this.urgency = data.urgency || 'medium';
    this.escalationNeeded = data.escalationNeeded || false;
    this.tags = data.tags || [];
  }
}

export class InventoryAnalysis {
  constructor(data) {
    this.itemId = data.itemId;
    this.recommendations = data.recommendations || [];
    this.riskLevel = data.riskLevel || 'low';
    this.suggestedActions = data.suggestedActions || [];
    this.orderRecommendation = data.orderRecommendation;
    this.costImpact = data.costImpact;
    this.alternativeSuppliers = data.alternativeSuppliers || [];
  }
}