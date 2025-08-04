// API Service - Simulates backend API calls for the AI Agent Platform

// Dashboard APIs
export const fetchDashboardStats = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    totalLeads: 156,
    activeTickets: 23,
    inventoryAlerts: 7,
    conversionRate: 24.5
  };
};

export const fetchAgentStatus = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return [
    {
      id: 'lead-qualifier',
      name: 'Lead Qualifier',
      status: 'active',
      path: 'lead-qualifier',
      icon: '🎯',
      metrics: {
        'Leads Processed': 45,
        'Avg Score': 72,
        'Conversion Rate': '24%'
      }
    },
    {
      id: 'customer-support',
      name: 'Customer Support',
      status: 'active',
      path: 'customer-support',
      icon: '💬',
      metrics: {
        'Tickets Resolved': 89,
        'Avg Response Time': '2.3 min',
        'Satisfaction': '94%'
      }
    },
    {
      id: 'supply-chain',
      name: 'Supply Chain Monitor',
      status: 'active',
      path: 'supply-chain-monitor',
      icon: '📦',
      metrics: {
        'Items Monitored': 234,
        'Alerts Active': 7,
        'Orders Generated': 12
      }
    }
  ];
};

// Lead Qualifier APIs
export const fetchLeads = async () => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const leads = [
    {
      id: 1,
      name: 'John Smith',
      company: 'Tech Corp',
      email: 'john@techcorp.com',
      source: 'Website',
      status: 'new',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      company: 'Innovation Inc',
      email: 'sarah@innovation.com',
      source: 'LinkedIn',
      status: 'new',
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Michael Chen',
      company: 'Global Solutions',
      email: 'michael@globalsol.com',
      source: 'Referral',
      status: 'contacted',
      createdAt: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Emma Davis',
      company: 'StartUp Pro',
      email: 'emma@startuppro.com',
      source: 'Trade Show',
      status: 'new',
      createdAt: new Date().toISOString()
    }
  ];
  
  return leads;
};

export const qualifyLead = async (leadId) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate AI qualification process
  const scores = {
    1: { score: 85, budget: 'High', authority: 'Decision Maker', need: 'Urgent', timeline: '1-2 months' },
    2: { score: 72, budget: 'Medium', authority: 'Influencer', need: 'Moderate', timeline: '3-6 months' },
    3: { score: 45, budget: 'Low', authority: 'End User', need: 'Low', timeline: '6+ months' },
    4: { score: 91, budget: 'High', authority: 'Decision Maker', need: 'Critical', timeline: 'Immediate' }
  };
  
  const leadScore = scores[leadId] || { score: 60, budget: 'Medium', authority: 'Unknown', need: 'Moderate', timeline: '3-6 months' };
  
  return {
    leadId,
    leadName: `Lead #${leadId}`,
    score: leadScore.score,
    budgetFit: leadScore.budget,
    authority: leadScore.authority,
    need: leadScore.need,
    timeline: leadScore.timeline,
    recommendation: leadScore.score >= 80 ? 
      'High priority lead - recommend immediate follow-up' : 
      leadScore.score >= 60 ? 
      'Moderate priority - nurture campaign recommended' : 
      'Low priority - add to long-term nurture sequence',
    nextSteps: leadScore.score >= 80 ? 
      ['Schedule demo call', 'Send pricing information', 'Connect with sales team'] :
      ['Add to email nurture campaign', 'Send educational content', 'Schedule follow-up in 30 days']
  };
};

// Customer Support APIs
export const fetchTickets = async () => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return [
    {
      id: 101,
      subject: 'Cannot login to account',
      customerName: 'Alice Brown',
      customerEmail: 'alice@example.com',
      category: 'Technical',
      priority: 'high',
      status: 'open',
      message: 'I have been trying to login to my account for the past hour but keep getting an error message. I have tried resetting my password but still cannot access my account. This is urgent as I need to access important documents.',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 102,
      subject: 'Billing question',
      customerName: 'Bob Wilson',
      customerEmail: 'bob@example.com',
      category: 'Billing',
      priority: 'medium',
      status: 'open',
      message: 'I noticed a charge on my account that I do not recognize. The amount is $49.99 and it was charged on March 15th. Can you please help me understand what this charge is for?',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 103,
      subject: 'Feature request',
      customerName: 'Carol Martinez',
      customerEmail: 'carol@example.com',
      category: 'Feature Request',
      priority: 'low',
      status: 'open',
      message: 'It would be great if you could add a dark mode option to the application. I work late hours and the bright screen is hard on my eyes.',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 104,
      subject: 'Account upgrade',
      customerName: 'David Lee',
      customerEmail: 'david@example.com',
      category: 'Sales',
      priority: 'medium',
      status: 'resolved',
      message: 'I would like to upgrade my account to the premium plan. Can you help me with the process?',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    }
  ];
};

export const processTicket = async (ticketId) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const responses = {
    101: {
      suggestedResponse: `Dear Alice,

Thank you for reaching out to us. I understand how frustrating it must be to not be able to access your account, especially when you need important documents.

I'd be happy to help you resolve this issue immediately. Here's what I can do for you:

1. I've initiated a password reset link to your email address (alice@example.com). Please check your inbox and spam folder.
2. If you don't receive the email within 5 minutes, I can manually reset your password and provide you with temporary credentials.
3. As an alternative, I can assist you in retrieving your documents through our support channel if needed urgently.

To help me better assist you, could you please confirm:
- The email address associated with your account
- Any error messages you're seeing (exact wording helps)
- The browser and device you're using

I'm standing by to help and will ensure you regain access to your account as quickly as possible.

Best regards,
Customer Support Team`
    },
    102: {
      suggestedResponse: `Dear Bob,

Thank you for contacting us about the unrecognized charge on your account.

I've looked into your billing history and found that the $49.99 charge on March 15th is for your monthly subscription renewal. This is your regular monthly fee for the Professional plan.

Here's a breakdown of the charge:
- Service: Professional Plan Subscription
- Billing Period: March 15 - April 14
- Amount: $49.99
- Payment Method: Card ending in ****

If you'd like to:
- View detailed invoices, you can access them in your account settings under "Billing History"
- Change your subscription plan or billing frequency
- Update your payment method

I'd be happy to assist you with any of these options. Please let me know if you have any other questions about your billing.

Best regards,
Customer Support Team`
    },
    103: {
      suggestedResponse: `Dear Carol,

Thank you for your feature suggestion! We really appreciate customers like you who take the time to help us improve our product.

I'm happy to inform you that a dark mode feature is actually on our development roadmap. Many users have requested this feature, and we understand its importance for reducing eye strain during extended use.

Here's what I can share:
- Our development team is actively working on implementing dark mode
- Expected release: Q2 2024
- It will include automatic switching based on system preferences and manual toggle options

In the meantime, here are some tips that might help:
- Try using your browser's dark mode or reader mode
- Adjust your screen brightness and use blue light filters
- Consider browser extensions that can apply dark themes to websites

I've added your request to our feature request tracker, which helps our team prioritize development based on user demand. You'll receive an email notification once this feature is released.

Thank you again for your valuable feedback!

Best regards,
Customer Support Team`
    }
  };
  
  return responses[ticketId] || {
    suggestedResponse: 'Thank you for contacting support. I would be happy to help you with your inquiry. Could you please provide more details about your specific issue so I can assist you better?'
  };
};

export const sendResponse = async (ticketId, response) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, ticketId, status: 'resolved' };
};

// Supply Chain APIs
export const fetchInventory = async () => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return [
    {
      id: 'INV001',
      name: 'Widget Pro X1',
      sku: 'WPX1-2024',
      category: 'Electronics',
      currentStock: 45,
      reorderPoint: 100,
      supplier: 'TechSupply Co',
      leadTime: 14,
      unitCost: 25.99,
      lastOrderDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      avgMonthlyUsage: 150,
      peakSeason: 'Q4',
      turnoverRate: 12
    },
    {
      id: 'INV002',
      name: 'Smart Sensor A2',
      sku: 'SSA2-2024',
      category: 'Sensors',
      currentStock: 234,
      reorderPoint: 200,
      supplier: 'Global Parts Inc',
      leadTime: 7,
      unitCost: 15.50,
      lastOrderDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      avgMonthlyUsage: 300,
      peakSeason: 'Q3',
      turnoverRate: 18
    },
    {
      id: 'INV003',
      name: 'Battery Pack B500',
      sku: 'BPB500-2024',
      category: 'Power',
      currentStock: 78,
      reorderPoint: 150,
      supplier: 'PowerTech Solutions',
      leadTime: 21,
      unitCost: 45.00,
      lastOrderDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      avgMonthlyUsage: 100,
      peakSeason: 'Q2',
      turnoverRate: 8
    },
    {
      id: 'INV004',
      name: 'Control Module CM3',
      sku: 'CM3-2024',
      category: 'Controllers',
      currentStock: 12,
      reorderPoint: 50,
      supplier: 'Precision Parts Ltd',
      leadTime: 28,
      unitCost: 125.00,
      lastOrderDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      avgMonthlyUsage: 40,
      peakSeason: 'Q1',
      turnoverRate: 6
    },
    {
      id: 'INV005',
      name: 'Display Unit DU7',
      sku: 'DU7-2024',
      category: 'Displays',
      currentStock: 156,
      reorderPoint: 100,
      supplier: 'Visual Tech Corp',
      leadTime: 10,
      unitCost: 89.99,
      lastOrderDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      avgMonthlyUsage: 120,
      peakSeason: 'Q4',
      turnoverRate: 10
    }
  ];
};

export const checkSupplyChain = async (itemId) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const recommendations = {
    'INV001': [
      {
        type: 'reorder',
        message: 'Critical stock level detected. Current stock is 55% below reorder point.',
        quantity: 200,
        urgency: 'high'
      },
      {
        type: 'optimization',
        message: 'Consider negotiating bulk discount with supplier for orders above 500 units.',
        potential_savings: '12%'
      }
    ],
    'INV002': [
      {
        type: 'optimization',
        message: 'Stock levels are healthy. No immediate action required.',
        status: 'good'
      }
    ],
    'INV003': [
      {
        type: 'reorder',
        message: 'Stock approaching reorder point. Consider placing order within 7 days.',
        quantity: 150,
        urgency: 'medium'
      }
    ],
    'INV004': [
      {
        type: 'reorder',
        message: 'Emergency reorder required! Stock critically low with long lead time.',
        quantity: 100,
        urgency: 'critical'
      },
      {
        type: 'optimization',
        message: 'Recommend finding alternative supplier with shorter lead time.',
        potential_improvement: 'Reduce lead time by 40%'
      }
    ],
    'INV005': [
      {
        type: 'optimization',
        message: 'Optimal stock levels maintained. Consider seasonal adjustment for Q4 peak.',
        status: 'excellent'
      }
    ]
  };
  
  return {
    itemId,
    recommendations: recommendations[itemId] || [{
      type: 'optimization',
      message: 'No specific recommendations at this time.',
      status: 'normal'
    }]
  };
};

export const generateOrder = async (itemId, quantity) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    orderId: `PO-${Date.now()}`,
    itemId,
    quantity,
    estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'submitted'
  };
};