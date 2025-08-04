import { intentClassifier } from './nlp/intentClassifier.js';
import { knowledgeBase } from './nlp/knowledgeBase.js';

export class SupportAgent {
  constructor() {
    this.name = 'Customer Support Agent';
    this.version = '2.0.0';
    this.capabilities = ['advanced_nlu', 'contextual_responses', 'intent_classification', 'entity_extraction', 'escalation_detection'];
    this.isActive = false;
    this.processedTickets = 0;
    this.resolvedTickets = 0;
    
    // Initialize NLU components
    this.intentClassifier = intentClassifier;
    this.knowledgeBase = knowledgeBase;
  }

  /**
   * Start the agent
   */
  start() {
    this.isActive = true;
    console.log('Support Agent started');
  }

  /**
   * Stop the agent
   */
  stop() {
    this.isActive = false;
    console.log('Support Agent stopped');
  }

  /**
   * Get agent statistics
   * @returns {Object} Agent stats
   */
  getStats() {
    return {
      active: this.isActive,
      processed: this.processedTickets,
      resolved: this.resolvedTickets,
      avgTime: '2.4h',
      satisfaction: 4.2
    };
  }

  async draftSupportReply(ticketData) {
    // Increment processed counter
    this.processedTickets++;
    
    // Simulate AI processing time
    await this.simulateProcessing(1500);
    
    // Analyze ticket content
    const analysis = this.analyzeTicket(ticketData);
    
    // Generate response
    const response = this.generateResponse(ticketData, analysis);
    
    return {
      ticketId: ticketData.id,
      suggestedResponse: response,
      confidence: analysis.confidence,
      category: ticketData.category,
      sentiment: analysis.sentiment,
      urgency: analysis.urgency,
      escalationNeeded: analysis.escalationNeeded,
      nextSteps: analysis.nextSteps,
      tags: this.generateTags(ticketData, analysis)
    };
  }

  analyzeTicket(ticketData) {
    const message = ticketData.message || '';
    
    // Use NLU pipeline for advanced analysis
    const intentResult = this.intentClassifier.classifyIntent(message);
    const entities = this.intentClassifier.extractEntities(message);
    const urgency = this.intentClassifier.analyzeUrgency(message, ticketData.priority);
    
    return {
      intent: intentResult.primaryIntent,
      confidence: intentResult.confidence,
      entities: entities,
      sentiment: this.analyzeSentiment(message),
      urgency: urgency,
      escalationNeeded: this.knowledgeBase.shouldEscalate(intentResult.primaryIntent, message, ticketData.priority),
      nextSteps: this.generateContextualNextSteps(intentResult.primaryIntent, entities),
      keyTopics: this.extractKeyTopics(message),
      allIntentScores: intentResult.allScores
    };
  }

  analyzeSentiment(message) {
    // Simple sentiment analysis based on keywords
    const positiveWords = ['thank', 'please', 'appreciate', 'great', 'good', 'excellent'];
    const negativeWords = ['urgent', 'critical', 'broken', 'frustrated', 'angry', 'terrible', 'awful'];
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    positiveWords.forEach(word => {
      if (message.includes(word)) positiveScore++;
    });
    
    negativeWords.forEach(word => {
      if (message.includes(word)) negativeScore++;
    });
    
    if (negativeScore > positiveScore) return 'negative';
    if (positiveScore > negativeScore) return 'positive';
    return 'neutral';
  }

  analyzeUrgency(ticketData) {
    // Determine urgency based on priority and content
    let urgency = ticketData.priority === 'High' ? 'high' : 'medium';
    
    const urgentKeywords = ['urgent', 'critical', 'emergency', 'immediately', 'asap'];
    const message = ticketData.message.toLowerCase();
    
    if (urgentKeywords.some(keyword => message.includes(keyword))) {
      urgency = 'high';
    }
    
    return urgency;
  }

  calculateConfidence(ticketData) {
    // Base confidence on category and content clarity
    let confidence = 0.7;
    
    if (ticketData.category === 'Technical') confidence += 0.1;
    if (ticketData.category === 'Billing') confidence += 0.15;
    if (ticketData.message.length > 100) confidence += 0.1;
    
    return Math.min(confidence, 0.95);
  }

  shouldEscalate(ticketData, message) {
    // Escalation logic
    if (ticketData.priority === 'High') return true;
    if (message.includes('urgent') || message.includes('critical')) return true;
    if (ticketData.category === 'Technical' && message.includes('down')) return true;
    
    return false;
  }

  generateContextualNextSteps(intent, entities) {
    const solution = this.knowledgeBase.getSolution(intent);
    const steps = [];
    
    // Add intent-specific follow-up actions
    if (solution.followUpActions) {
      steps.push(...solution.followUpActions);
    }
    
    // Add entity-specific steps
    if (entities.email) {
      steps.push('Send confirmation email to provided address');
    }
    if (entities.errorCode) {
      steps.push(`Research error code: ${entities.errorCode[0]}`);
    }
    if (entities.browser) {
      steps.push(`Test with ${entities.browser[0]} browser compatibility`);
    }
    
    // Default follow-up
    steps.push('Follow up within 24 hours to confirm resolution');
    
    return steps;
  }

  generateAcknowledgment(intent, urgency) {
    const urgencyPrefix = urgency === 'high' ? 'I understand this is urgent. ' : '';
    
    const acknowledgments = {
      'login_issue': `${urgencyPrefix}Thank you for reporting this login issue. I'll help you regain access to your account quickly.`,
      'billing_issue': `${urgencyPrefix}I apologize for the billing confusion. Let me review your account and resolve this billing matter.`,
      'bug_report': `${urgencyPrefix}Thank you for reporting this bug. I'll investigate this issue and work on a solution.`,
      'feature_request': `Thank you for this valuable feature suggestion. I'll ensure it reaches our product team.`,
      'integration_issue': `${urgencyPrefix}I understand integration issues can be disruptive. Let me help you get this connection working properly.`,
      'performance_issue': `${urgencyPrefix}I see you're experiencing performance issues. Let's work together to improve your experience.`
    };
    
    return acknowledgments[intent] || `${urgencyPrefix}Thank you for contacting us. I'm here to help resolve your issue.`;
  }

  generateInvestigationSection(entities) {
    let investigation = 'Based on my analysis:';
    
    if (entities.errorCode) {
      investigation += `\n• I found error code "${entities.errorCode[0]}" which indicates a specific system issue`;
    }
    if (entities.browser) {
      investigation += `\n• You're using ${entities.browser[0]}, which helps me provide targeted solutions`;
    }
    if (entities.version) {
      investigation += `\n• Version ${entities.version[0]} information helps me understand the context`;
    }
    if (entities.url) {
      investigation += `\n• I've noted the specific URL mentioned for targeted troubleshooting`;
    }
    
    return investigation;
  }

  generateContextualFollowUp(intent, urgency, priority) {
    const timeframes = {
      'high': '2 hours',
      'medium': '24 hours', 
      'low': '48 hours'
    };
    
    const timeframe = timeframes[urgency] || '24 hours';
    
    const followUps = {
      'login_issue': `If these steps don't resolve your login issue, I'll escalate to our authentication team. I'll follow up within ${timeframe} to ensure you can access your account.`,
      'billing_issue': `I'll process any necessary billing adjustments and send you a confirmation email. Please allow 2-3 business days for changes to appear, and contact me if you have any questions.`,
      'bug_report': `I've logged this bug in our tracking system. Our development team will investigate, and I'll keep you updated on the progress. You can expect an update within ${timeframe}.`,
      'feature_request': `Your suggestion has been forwarded to our product team and added to our feature request backlog. We review these quarterly and prioritize based on customer feedback and business impact.`,
      'integration_issue': `If the troubleshooting steps don't resolve the integration, I'll connect you with our technical integration team. I'll follow up within ${timeframe} to ensure everything is working properly.`,
      'performance_issue': `If you continue experiencing performance issues after trying these steps, please let me know. I'll monitor your account and follow up within ${timeframe} to confirm the improvements.`
    };
    
    return followUps[intent] || `I'll follow up within ${timeframe} to ensure your issue is fully resolved.`;
  }

  extractKeyTopics(message) {
    const topics = [];
    
    if (message.includes('login') || message.includes('password')) topics.push('authentication');
    if (message.includes('billing') || message.includes('payment')) topics.push('billing');
    if (message.includes('feature') || message.includes('function')) topics.push('feature');
    if (message.includes('bug') || message.includes('error')) topics.push('bug');
    
    return topics;
  }

  generateResponse(ticketData, analysis) {
    const customerName = ticketData.customerName || 'Valued Customer';
    const intent = analysis.intent;
    const solution = this.knowledgeBase.getSolution(intent);
    
    let response = `Dear ${customerName},\n\n`;
    
    // Contextual acknowledgment based on intent
    response += this.generateAcknowledgment(intent, analysis.urgency) + '\n\n';
    
    // Add investigation findings if entities were extracted
    if (Object.keys(analysis.entities).length > 0) {
      response += this.generateInvestigationSection(analysis.entities) + '\n\n';
    }
    
    // Generate specific troubleshooting steps based on intent
    if (solution.troubleshootingSteps) {
      response += 'Here\'s how we can resolve this:\n\n';
      solution.troubleshootingSteps.slice(0, 4).forEach((step, index) => {
        response += `${index + 1}. ${step}\n`;
      });
      response += '\n';
    }
    
    // Add escalation notice if needed
    if (analysis.escalationNeeded) {
      response += '🚨 **Priority Escalation**: Due to the urgency of this issue, I\'m escalating this to our senior support team. You can expect a response within 2 hours.\n\n';
    }
    
    // Context-aware follow-up based on intent and urgency
    response += this.generateContextualFollowUp(intent, analysis.urgency, ticketData.priority);
    
    // Add technical details
    response += `\n\n---\n`;
    response += `Ticket ID: ${ticketData.id}\n`;
    response += `Classification: ${intent} (${Math.round(analysis.confidence * 100)}% confidence)\n`;
    response += `Priority: ${ticketData.priority} | Urgency: ${analysis.urgency}\n`;
    if (analysis.entities.errorCode) {
      response += `Error Code: ${analysis.entities.errorCode[0]}\n`;
    }
    response += `\nBest regards,\nCRM Cloud Support Team`;
    
    return response;
  }

  generateTags(ticketData, analysis) {
    const tags = [ticketData.category.toLowerCase().replace(' ', '_')];
    
    // Add priority tag
    tags.push(`priority_${ticketData.priority.toLowerCase()}`);
    
    // Add sentiment tag
    if (analysis.sentiment !== 'neutral') {
      tags.push(`sentiment_${analysis.sentiment}`);
    }
    
    // Add urgency tag
    if (analysis.urgency === 'high') {
      tags.push('urgent');
    }
    
    // Add escalation tag
    if (analysis.escalationNeeded) {
      tags.push('escalated');
    }
    
    // Add topic-based tags
    tags.push(...analysis.keyTopics);
    
    return tags;
  }

  async simulateProcessing(ms = 1500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const supportAgent = new SupportAgent();