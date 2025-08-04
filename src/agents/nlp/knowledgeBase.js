/**
 * Knowledge Base for Customer Support
 * Contains solutions, troubleshooting steps, and response templates
 */

export class KnowledgeBase {
  constructor() {
    this.solutions = {
      'login_issue': {
        commonCauses: [
          'Incorrect password',
          'Account locked after multiple failed attempts',
          'Browser cookies/cache issues',
          'Two-factor authentication problems'
        ],
        troubleshootingSteps: [
          'Try resetting your password using the "Forgot Password" link',
          'Clear your browser cache and cookies',
          'Try logging in from an incognito/private browsing window',
          'Check if your account is locked (wait 15 minutes and try again)',
          'Verify your two-factor authentication device is working',
          'Try a different browser or device'
        ],
        escalationTriggers: ['account locked for >24 hours', 'SSO integration issues'],
        followUpActions: ['password reset email sent', 'account unlock scheduled', 'MFA reset initiated']
      },
      'billing_issue': {
        commonCauses: [
          'Subscription tier changes',
          'Proration calculations',
          'Payment method failures',
          'Tax rate changes'
        ],
        troubleshootingSteps: [
          'Review your recent subscription changes in account settings',
          'Check if any add-ons were purchased or cancelled',
          'Verify your payment method is up to date',
          'Look for any prorated charges due to plan changes',
          'Check if tax rates changed in your location'
        ],
        escalationTriggers: ['disputes over charges', 'refund requests >$500'],
        followUpActions: ['billing adjustment processed', 'refund initiated', 'payment method updated']
      },
      'feature_request': {
        commonResponses: [
          'Thank you for this valuable feedback',
          'This suggestion aligns with our product roadmap',
          'We\'ll consider this for future development',
          'This has been added to our feature request backlog'
        ],
        evaluationCriteria: [
          'Customer impact and demand',
          'Technical feasibility',
          'Resource requirements',
          'Strategic alignment'
        ],
        followUpActions: ['logged in product backlog', 'forwarded to product team', 'added to user research list']
      },
      'bug_report': {
        informationNeeded: [
          'Steps to reproduce the issue',
          'Expected vs actual behavior',
          'Browser and version',
          'Operating system',
          'Any error messages'
        ],
        troubleshootingSteps: [
          'Try refreshing the page',
          'Clear browser cache and cookies',
          'Disable browser extensions temporarily',
          'Try a different browser',
          'Check if the issue persists on different devices'
        ],
        escalationTriggers: ['affects multiple users', 'data loss', 'security implications'],
        followUpActions: ['bug report created', 'assigned to development team', 'workaround provided']
      },
      'integration_issue': {
        commonCauses: [
          'API key authentication failures',
          'Rate limiting',
          'Data format mismatches',
          'Webhook endpoint issues'
        ],
        troubleshootingSteps: [
          'Verify your API credentials are correct and active',
          'Check API rate limits and usage',
          'Validate data formats match our API documentation',
          'Test webhook endpoints are accessible and responding',
          'Review integration logs for specific error messages'
        ],
        escalationTriggers: ['enterprise integration failures', 'data sync issues'],
        followUpActions: ['API credentials reset', 'rate limits adjusted', 'technical documentation provided']
      },
      'performance_issue': {
        commonCauses: [
          'Large datasets',
          'Network connectivity',
          'Browser performance',
          'Server load'
        ],
        troubleshootingSteps: [
          'Try reducing the amount of data displayed per page',
          'Check your internet connection speed',
          'Close other browser tabs and applications',
          'Try during off-peak hours',
          'Clear browser cache to improve loading times'
        ],
        escalationTriggers: ['system-wide slowdowns', 'timeout errors affecting business operations'],
        followUpActions: ['performance monitoring enabled', 'server optimization scheduled', 'caching improvements deployed']
      }
    };

    this.responseTemplates = {
      acknowledgment: [
        "Thank you for contacting us about {issue_type}",
        "I understand you're experiencing {issue_type}",
        "I've reviewed your {issue_type} and I'm here to help"
      ],
      investigation: [
        "I've investigated your account and identified the following",
        "Based on my analysis of your {issue_type}",
        "After reviewing your case, here's what I found"
      ],
      solution: [
        "Here's how we can resolve this issue",
        "I recommend the following steps",
        "Let's try these troubleshooting steps"
      ],
      followUp: [
        "I'll follow up within {timeframe} to ensure this is resolved",
        "Please let me know if these steps resolve your issue",
        "I'm here if you need any additional assistance"
      ]
    };
  }

  /**
   * Get solution information for an intent
   * @param {string} intent - Classified intent
   * @returns {Object} Solution information
   */
  getSolution(intent) {
    return this.solutions[intent] || this.solutions['general'] || {};
  }

  /**
   * Get appropriate response template
   * @param {string} section - Template section (acknowledgment, investigation, etc.)
   * @returns {string} Template string
   */
  getTemplate(section) {
    const templates = this.responseTemplates[section] || [];
    return templates[Math.floor(Math.random() * templates.length)] || '';
  }

  /**
   * Check if issue should be escalated
   * @param {string} intent - Issue intent
   * @param {string} message - Ticket message
   * @param {string} priority - Ticket priority
   * @returns {boolean} Should escalate
   */
  shouldEscalate(intent, message, priority) {
    const solution = this.getSolution(intent);
    if (!solution.escalationTriggers) return false;

    const lowerMessage = message.toLowerCase();
    
    return solution.escalationTriggers.some(trigger => 
      lowerMessage.includes(trigger.toLowerCase())
    ) || priority === 'High';
  }
}

export const knowledgeBase = new KnowledgeBase();