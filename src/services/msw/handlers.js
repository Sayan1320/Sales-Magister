import { http, HttpResponse } from 'msw';
import { seedLeads } from '../../data/leads';
import { seedTickets } from '../../data/tickets';
import { seedInventory } from '../../data/inventory';
import { 
  leadScore, 
  conversionRate, 
  avgLeadScore,
  slaCompliance,
  avgHandleTime,
  backlog,
  fillRate,
  inventoryValue,
  defaultSlaPolicy
} from '../calculations';

// In-memory data stores (simulating database)
let leadsData = [...seedLeads];
let ticketsData = [...seedTickets];
let inventoryData = [...seedInventory];

// Add some processed leads for demo
leadsData.forEach((lead, index) => {
  if (index < 8) {
    lead.score = leadScore(lead);
    if (index < 4) lead.stage = 'qualified';
    if (index < 2) lead.stage = 'won';
  }
});

export const handlers = [
  // Dashboard metrics endpoint
  http.get('/api/metrics', () => {
    const metrics = {
      totalLeads: leadsData.length,
      activeTickets: backlog(ticketsData),
      inventoryAlerts: inventoryData.filter(item => item.status === 'critical').length,
      conversionRate: conversionRate(leadsData),
      avgLeadScore: avgLeadScore(leadsData),
      slaCompliance: slaCompliance(ticketsData, defaultSlaPolicy),
      avgHandleTime: avgHandleTime(ticketsData),
      fillRate: fillRate(inventoryData),
      inventoryValue: inventoryValue(inventoryData)
    };
    
    return HttpResponse.json(metrics);
  }),

  // Leads endpoints
  http.get('/api/leads', () => {
    return HttpResponse.json(leadsData);
  }),

  http.post('/api/leads/:id/qualify', ({ params }) => {
    const { id } = params;
    const lead = leadsData.find(l => l.id === id);
    
    if (!lead) {
      return HttpResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    
    // Calculate score and update lead
    const score = leadScore(lead);
    lead.score = score;
    lead.lastActivityISO = new Date().toISOString();
    
    // Determine stage transition
    if (score >= 70 && lead.stage === 'new') {
      lead.stage = 'qualified';
    } else if (score >= 85 && lead.stage === 'qualified') {
      lead.stage = 'won';
    }
    
    const decision = score >= 70 ? 'QUALIFY' : score >= 40 ? 'NURTURE' : 'DROP';
    const reasons = generateQualificationReasons(lead, score);
    
    return HttpResponse.json({
      score,
      decision,
      reasons,
      stage: lead.stage
    });
  }),

  // Tickets endpoints
  http.get('/api/tickets', () => {
    return HttpResponse.json(ticketsData);
  }),

  http.post('/api/tickets/:id/reply', ({ params }) => {
    const { id } = params;
    const ticket = ticketsData.find(t => t.id === id);
    
    if (!ticket) {
      return HttpResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    
    // Generate AI response based on category
    const suggestedResponse = generateTicketResponse(ticket);
    
    return HttpResponse.json({
      suggestedResponse,
      confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      templates: getResponseTemplates(ticket.category)
    });
  }),

  http.post('/api/tickets/:id/send', ({ params }) => {
    const { id } = params;
    const ticket = ticketsData.find(t => t.id === id);
    
    if (!ticket) {
      return HttpResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    
    // Update ticket status
    ticket.status = 'resolved';
    ticket.resolvedAtISO = new Date().toISOString();
    if (!ticket.firstResponseAtISO) {
      ticket.firstResponseAtISO = new Date().toISOString();
    }
    
    return HttpResponse.json({
      success: true,
      ticketId: id,
      sentAt: new Date().toISOString()
    });
  }),

  // Inventory endpoints
  http.get('/api/inventory', () => {
    return HttpResponse.json(inventoryData);
  }),

  http.post('/api/inventory/:sku/analyze', ({ params }) => {
    const { sku } = params;
    const item = inventoryData.find(i => i.sku === sku);
    
    if (!item) {
      return HttpResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    const analysis = generateInventoryAnalysis(item);
    
    return HttpResponse.json(analysis);
  }),

  http.post('/api/inventory/:sku/order', async ({ params, request }) => {
    const { sku } = params;
    const body = await request.json();
    const { quantity } = body || {};
    const item = inventoryData.find(i => i.sku === sku);
    
    if (!item) {
      return HttpResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    const orderQuantity = quantity || Math.max(
      item.reorderPoint * 2 - item.stock,
      item.dailyDemand * item.supplierETA_days
    );
    
    const order = {
      orderId: `PO-${Date.now()}`,
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
    
    return HttpResponse.json(order);
  }),

  // Agent status endpoints
  http.get('/api/agents/status', () => {
    return HttpResponse.json({
      leadAgent: {
        active: true,
        processed: Math.floor(Math.random() * 50) + 20,
        qualified: Math.floor(Math.random() * 20) + 8,
        avgScore: Math.floor(Math.random() * 30) + 60
      },
      supportAgent: {
        active: true,
        resolved: Math.floor(Math.random() * 40) + 25,
        avgTime: '2.4h',
        satisfaction: Math.floor(Math.random() * 10) + 90
      },
      supplyAgent: {
        active: true,
        monitored: inventoryData.length,
        alerts: inventoryData.filter(i => i.status === 'critical' || i.status === 'low').length,
        efficiency: Math.floor(Math.random() * 20) + 80
      }
    });
  }),

  // Orchestrator events endpoint
  http.post('/api/orchestrator/events', async ({ request }) => {
    const event = await request.json();
    
    // Log event for debugging
    console.log('Orchestrator event received:', event);
    
    return HttpResponse.json({
      success: true,
      eventId: `evt_${Date.now()}`,
      timestamp: new Date().toISOString()
    });
  }),
];

// Helper functions
function generateQualificationReasons(lead, score) {
  const reasons = [];
  
  if (lead.budget === '$250K+') {
    reasons.push('High budget potential indicates strong purchasing power');
  } else if (lead.budget === '$100K-250K') {
    reasons.push('Good budget range for our solutions');
  }
  
  if (lead.intent === 'high') {
    reasons.push('High purchase intent signals immediate buying opportunity');
  }
  
  if (lead.source === 'referral') {
    reasons.push('Referral source typically indicates higher conversion rates');
  }
  
  if (score < 40) {
    reasons.push('Low overall score suggests need for further nurturing');
  } else if (score >= 70) {
    reasons.push('Strong overall profile meets qualification criteria');
  }
  
  return reasons.length > 0 ? reasons : ['Standard qualification assessment completed'];
}

function generateTicketResponse(ticket) {
  const responses = {
    'Technical': `Thank you for contacting CRM Cloud support. I've reviewed your technical issue and found a solution. Please try the following steps: 1) Clear your browser cache, 2) Disable browser extensions, 3) Try accessing from an incognito window. If the issue persists, I'll escalate this to our technical team.`,
    'Billing': `I apologize for the billing confusion. I've reviewed your account and can see the discrepancy. I'm processing a correction and you should see the adjustment within 2-3 business days. I'll send you a confirmation email with the details.`,
    'General': `Thank you for reaching out to CRM Cloud support. I've reviewed your inquiry and I'm here to help. Based on your description, I recommend checking our knowledge base article on this topic. I've also scheduled a follow-up to ensure your issue is fully resolved.`,
    'Feature Request': `Thank you for your feature suggestion! This is valuable feedback that I'll forward to our product team. Feature requests are reviewed quarterly and prioritized based on customer impact. I'll keep you updated on the status of this request.`,
    'Bug Report': `Thank you for reporting this bug. I've logged this issue in our system with ID ${ticket.id}. Our development team will investigate and provide a fix. I'll keep you updated on the progress and notify you when a resolution is available.`
  };
  
  return responses[ticket.category] || responses['General'];
}

function getResponseTemplates(category) {
  const templates = {
    'Technical': ['Clear cache and cookies', 'Check browser compatibility', 'Update software'],
    'Billing': ['Review account charges', 'Process refund', 'Update payment method'],
    'General': ['Check knowledge base', 'Schedule follow-up', 'Escalate to specialist'],
    'Feature Request': ['Log feature request', 'Provide timeline estimate', 'Offer alternatives'],
    'Bug Report': ['Create bug ticket', 'Provide workaround', 'Schedule fix']
  };
  
  return templates[category] || templates['General'];
}

function generateInventoryAnalysis(item) {
  const daysOfSupply = Math.max(0, Math.floor(item.stock / Math.max(1, item.dailyDemand)));
  const needsReorder = item.stock <= item.reorderPoint;
  
  const recommendations = [];
  
  if (needsReorder) {
    recommendations.push({
      action: 'Generate Purchase Order',
      reason: `Stock level (${item.stock}) is below reorder point (${item.reorderPoint})`,
      priority: item.status === 'critical' ? 'high' : 'medium'
    });
  }
  
  if (daysOfSupply < 7) {
    recommendations.push({
      action: 'Expedite Delivery',
      reason: `Only ${daysOfSupply} days of supply remaining`,
      priority: 'high'
    });
  }
  
  if (item.backorders > 0) {
    recommendations.push({
      action: 'Customer Communication',
      reason: `${item.backorders} units backordered`,
      priority: 'medium'
    });
  }
  
  return {
    daysOfSupply,
    needsReorder,
    recommendations,
    riskLevel: item.status === 'critical' ? 'critical' : item.status === 'low' ? 'medium' : 'low',
    supplier: item.supplier,
    leadTime: item.supplierETA_days,
    unitCost: item.unitCost,
    lastOrderDate: item.lastOrderDate
  };
}