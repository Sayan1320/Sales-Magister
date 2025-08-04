/**
 * Intent Classification & NLU Pipeline for Customer Support
 * Lightweight, deterministic approach using regex + keyword scoring + slot filling
 */

export class IntentClassifier {
  constructor() {
    // Intent patterns with keywords and regex
    this.intentPatterns = {
      'login_issue': {
        keywords: ['login', 'signin', 'sign in', 'password', 'authentication', 'access', 'locked out', 'forgot password'],
        regexPatterns: [
          /can't log(?:in|\ in)|cannot log(?:in|\ in)/i,
          /password (?:not working|incorrect|wrong)/i,
          /(?:forgot|forgotten|lost) (?:my )?password/i,
          /account (?:locked|blocked|suspended)/i
        ],
        weight: 1.2
      },
      'billing_issue': {
        keywords: ['billing', 'payment', 'charge', 'invoice', 'refund', 'subscription', 'credit card', 'overcharged'],
        regexPatterns: [
          /(?:wrong|incorrect|unexpected) (?:charge|billing|amount)/i,
          /(?:refund|money back|return)/i,
          /subscription (?:cancelled|canceled|stopped)/i,
          /payment (?:failed|declined|not working)/i
        ],
        weight: 1.1
      },
      'feature_request': {
        keywords: ['feature', 'functionality', 'add', 'improvement', 'enhance', 'suggestion', 'would like', 'need'],
        regexPatterns: [
          /(?:can you|could you|please) add/i,
          /(?:feature request|new feature)/i,
          /would (?:like|love) to (?:see|have)/i,
          /suggestion for improvement/i
        ],
        weight: 1.0
      },
      'bug_report': {
        keywords: ['bug', 'error', 'broken', 'not working', 'issue', 'problem', 'crash', 'freeze'],
        regexPatterns: [
          /(?:error|bug|problem) (?:with|in|on)/i,
          /(?:not working|broken|crashed)/i,
          /(?:getting (?:an )?error|receiving (?:an )?error)/i,
          /(?:page|app|system) (?:frozen|hanging|stuck)/i
        ],
        weight: 1.3
      },
      'integration_issue': {
        keywords: ['integration', 'api', 'webhook', 'sync', 'connection', 'third party', 'export', 'import'],
        regexPatterns: [
          /(?:api|integration) (?:not working|failing|broken)/i,
          /(?:sync|synchronization) (?:issue|problem|not working)/i,
          /(?:webhook|connection) (?:failed|timeout|error)/i,
          /(?:export|import) (?:not working|failing)/i
        ],
        weight: 1.1
      },
      'performance_issue': {
        keywords: ['slow', 'performance', 'loading', 'timeout', 'lag', 'speed', 'response time'],
        regexPatterns: [
          /(?:very|too|really) slow/i,
          /(?:loading|takes) (?:forever|too long|a long time)/i,
          /(?:performance|speed) (?:issue|problem)/i,
          /(?:timeout|timed out)/i
        ],
        weight: 1.2
      }
    };

    // Entity patterns for slot filling
    this.entityPatterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      url: /https?:\/\/[^\s]+/g,
      errorCode: /(?:error|code)\s*[:=#]?\s*([A-Z0-9_-]+)/gi,
      version: /(?:version|ver|v)\.?\s*(\d+(?:\.\d+)*)/gi,
      browser: /(?:chrome|firefox|safari|edge|internet explorer|ie)\s*(\d+)?/gi,
      os: /(?:windows|mac|linux|android|ios)\s*(\d+(?:\.\d+)*)?/gi
    };
  }

  /**
   * Classify intent from ticket message
   * @param {string} message - Ticket message
   * @returns {Object} Classification result
   */
  classifyIntent(message) {
    const scores = {};
    const lowerMessage = message.toLowerCase();

    // Score each intent
    Object.entries(this.intentPatterns).forEach(([intent, pattern]) => {
      let score = 0;

      // Keyword matching
      pattern.keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = (lowerMessage.match(regex) || []).length;
        score += matches * 1.0;
      });

      // Regex pattern matching
      pattern.regexPatterns.forEach(regex => {
        if (regex.test(message)) {
          score += 2.0;
        }
      });

      // Apply weight
      scores[intent] = score * pattern.weight;
    });

    // Get top intent
    const sortedIntents = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .filter(([,score]) => score > 0);

    return {
      primaryIntent: sortedIntents[0]?.[0] || 'general',
      confidence: sortedIntents[0]?.[1] || 0,
      allScores: scores
    };
  }

  /**
   * Extract entities from message
   * @param {string} message - Ticket message  
   * @returns {Object} Extracted entities
   */
  extractEntities(message) {
    const entities = {};

    Object.entries(this.entityPatterns).forEach(([entityType, pattern]) => {
      const matches = message.match(pattern);
      if (matches) {
        entities[entityType] = matches;
      }
    });

    return entities;
  }

  /**
   * Analyze message urgency based on keywords and patterns
   * @param {string} message - Ticket message
   * @param {string} priority - Ticket priority
   * @returns {string} Urgency level
   */
  analyzeUrgency(message, priority) {
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'critical', 'emergency', 'production down', 'can\'t work'];
    const moderateKeywords = ['soon', 'important', 'blocking', 'affecting users'];

    const lowerMessage = message.toLowerCase();
    
    // Check for urgent indicators
    if (urgentKeywords.some(keyword => lowerMessage.includes(keyword)) || priority === 'High') {
      return 'high';
    }
    
    // Check for moderate indicators
    if (moderateKeywords.some(keyword => lowerMessage.includes(keyword)) || priority === 'Medium') {
      return 'medium';
    }

    return 'low';
  }
}

export const intentClassifier = new IntentClassifier();