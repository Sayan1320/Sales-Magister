# AI Agent Platform

A comprehensive React application demonstrating an innovative AI-driven multi-agent platform that automates core business tasks including lead qualification, customer support, and supply chain monitoring.

## 🚀 Features

### 🎯 Lead Qualification Agent
- **AI-Powered BANT Analysis**: Automatically analyzes Budget, Authority, Need, and Timeline
- **Intelligent Scoring**: Generates lead scores from 0-100 with confidence metrics
- **Smart Recommendations**: Provides next steps based on qualification results
- **Real-time Processing**: Live qualification with simulated AI processing delays

### 💬 Customer Support Agent
- **Automated Response Generation**: AI creates personalized customer responses
- **Sentiment Analysis**: Detects customer emotion and urgency levels
- **Escalation Detection**: Automatically identifies tickets requiring human intervention  
- **Multi-channel Support**: Handles tickets from email, chat, phone, and in-app channels

### 📦 Supply Chain Monitor Agent
- **Inventory Analysis**: Real-time stock level monitoring with predictive analytics
- **Risk Assessment**: Multi-factor risk scoring including lead times and supplier reliability
- **Demand Forecasting**: Seasonal adjustment and trend analysis
- **Automated Ordering**: One-click purchase order generation with cost optimization

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 with HashRouter for universal deployment
- **Styling**: Tailwind CSS with custom component library
- **State Management**: Zustand for lightweight global state
- **Data Fetching**: TanStack React Query for server state management
- **API Mocking**: MSW (Mock Service Worker) for realistic API simulation
- **Icons**: Lucide React for consistent iconography

### Project Structure
```
ai-agent-platform/
├── src/
│   ├── agents/           # AI agent implementations
│   │   ├── types.js      # Type definitions and classes
│   │   ├── leadAgent.js  # Lead qualification logic
│   │   ├── supportAgent.js # Customer support logic
│   │   ├── supplyAgent.js  # Supply chain logic
│   │   └── orchestrator.js # Central agent coordinator
│   ├── components/       # Reusable UI components
│   │   ├── StatCard.jsx  # Dashboard metrics cards
│   │   ├── Badge.jsx     # Status and priority indicators
│   │   ├── Table.jsx     # Data tables with sorting
│   │   └── EmptyState.jsx # Loading and error states  
│   ├── data/            # Mock data sets
│   │   ├── leads.js     # Sample lead data
│   │   ├── tickets.js   # Support ticket data
│   │   └── inventory.js # Inventory item data
│   ├── pages/           # Main application routes
│   │   ├── Dashboard.jsx    # Overview and metrics
│   │   ├── LeadQualifier.jsx # Lead qualification interface
│   │   ├── CustomerSupport.jsx # Ticket management
│   │   └── SupplyChain.jsx  # Inventory monitoring
│   ├── services/        # API layer
│   │   ├── api.js       # React Query wrappers
│   │   └── msw/         # Mock service worker setup
│   ├── store/          # Global state management
│   │   ├── metrics.js  # Dashboard metrics store
│   │   └── events.js   # Event bus for agent communication
│   └── App.jsx         # Main application component
```

## 🤖 AI Agent System

### Agent Orchestrator
The central orchestrator coordinates all AI agents and manages:
- **Event Distribution**: Routes events between agents and UI components
- **Metrics Updates**: Tracks performance across all agents
- **State Synchronization**: Keeps stores updated with agent results
- **Error Handling**: Provides resilient error recovery

### Agent Capabilities

#### Lead Qualifier Agent
- **BANT Framework**: Structured analysis of lead qualification criteria
- **Scoring Algorithm**: Multi-factor scoring with configurable weights  
- **Confidence Metrics**: Statistical confidence in qualification results
- **Recommendation Engine**: Context-aware next steps generation

#### Support Agent  
- **NLP Processing**: Text analysis for sentiment and intent detection
- **Template System**: Dynamic response generation with personalization
- **Priority Detection**: Automatic urgency and escalation assessment
- **Quality Scoring**: Response confidence and appropriateness metrics

#### Supply Chain Agent
- **Risk Modeling**: Multi-dimensional supply chain risk assessment
- **Demand Forecasting**: Seasonal trends and usage pattern analysis  
- **Optimization Engine**: EOQ calculations and cost optimization
- **Supplier Analytics**: Performance tracking and alternative sourcing

## 🎨 User Experience

### Design System
- **Clean Interface**: Minimal design focused on data clarity
- **Consistent Theming**: Unified color scheme and typography
- **Responsive Layout**: Mobile-first design with breakpoint optimization
- **Interactive Feedback**: Loading states, hover effects, and transitions

### Key Interactions
- **One-Click Actions**: Streamlined workflows for common tasks
- **Real-time Updates**: Live data updates without page refreshes  
- **Contextual Information**: Relevant data displayed at decision points
- **Progressive Disclosure**: Complex data revealed as needed

## 🚦 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn package manager

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd ai-agent-platform

# Install dependencies  
npm install

# Start development server
npm start
```

### Build for Production
```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

## 📊 Data Flow

### Agent Processing Pipeline
1. **User Action**: User selects item for analysis
2. **Orchestrator**: Routes request to appropriate agent
3. **AI Processing**: Agent analyzes data using business rules
4. **Result Generation**: Structured output with recommendations
5. **State Update**: Global metrics and event stores updated
6. **UI Refresh**: Components re-render with new data

### Event System
- **Centralized Events**: All agent activities flow through event store
- **Loose Coupling**: Agents communicate via events, not direct calls
- **Debugging Support**: Full event history for troubleshooting
- **Extensibility**: Easy to add new agents and event types

## 🔧 Configuration

### Environment Variables
- `NODE_ENV`: Controls MSW activation (development only)
- `REACT_APP_API_BASE`: API base URL (for future backend integration)

### Customization Points
- **Agent Logic**: Modify scoring algorithms in agent files
- **UI Themes**: Update Tailwind config for brand colors
- **Data Models**: Extend type definitions for new data fields
- **Business Rules**: Adjust thresholds and criteria in agent implementations

## 🧪 Testing Strategy

### Mock Data
- **Realistic Datasets**: Hand-crafted data reflecting real business scenarios
- **Edge Cases**: Data includes boundary conditions and error states
- **Relationships**: Cross-referenced data between leads, tickets, and inventory

### API Simulation
- **Network Delays**: Realistic response times for different operations
- **Error Scenarios**: Occasional failures to test error handling
- **State Persistence**: Changes persist during session for realistic UX

## 🎯 Demo Scenarios

### Lead Qualification Flow
1. Navigate to Lead Qualifier page
2. Select "Emma Davis" (high-value lead)
3. Click "QUALIFY" to see AI analysis
4. Review 91/100 score with HIGH PRIORITY classification
5. Examine BANT breakdown and next steps

### Customer Support Flow  
1. Go to Customer Support page
2. Select ticket #101 (login issue)
3. Watch AI generate personalized response
4. Edit response if needed and send reply
5. See ticket status update to resolved

### Supply Chain Flow
1. Visit Supply Chain page  
2. Switch to "Alerts" tab to see critical items
3. Select "Control Module CM3" (critical stock)
4. Click "Analyze Supply Chain" for AI recommendations
5. Generate emergency order with orange button

## 🚀 Future Enhancements

### Planned Features
- **Real Backend Integration**: Replace MSW with actual API endpoints
- **Advanced Analytics**: Historical trends and predictive modeling  
- **Multi-tenant Support**: Isolated data for multiple organizations
- **Workflow Automation**: Trigger-based automated actions
- **Integration APIs**: Connect with CRM, ERP, and other business systems

### Extensibility
- **Plugin Architecture**: Modular agent system for easy expansion
- **Custom Agents**: Framework for domain-specific AI agents
- **Webhook Support**: Integration with external systems and notifications
- **Advanced UI**: Charts, graphs, and data visualization components

## 🎮 Live Demo Instructions

### How to See the Multi-Agent System in Action

1. **Start the Application**
   ```bash
   npm start
   ```
   The app will start at `http://localhost:3000` with agents automatically initializing.

2. **Dashboard Overview** 
   - Navigate to the Dashboard to see live KPI metrics and AI agent status
   - Watch the "Recent Activity" section for real-time agent events
   - All three agents (Lead Qualifier, Customer Support, Supply Chain) will show as "active"

3. **Lead Qualification Demo**
   ```
   Dashboard → Lead Qualifier → Select any lead → Click "QUALIFY"
   ```
   - **What happens**: LeadAgent calculates score, updates stage, emits lead.qualified event
   - **Watch for**: Score calculation, decision (QUALIFY/NURTURE/DROP), stage transitions
   - **Live feedback**: Dashboard activity feed shows "Lead qualified successfully"

4. **Customer Support Demo**
   ```  
   Dashboard → Customer Support → Select a ticket → Click "Generate Reply"
   ```
   - **What happens**: SupportAgent generates AI response, checks SLA compliance
   - **Watch for**: AI-generated response, escalation logic for high priority tickets
   - **Live feedback**: Dashboard shows ticket processing events

5. **Supply Chain Demo**
   ```
   Dashboard → Supply Chain → Click "Analyze" on low stock item → Generate Order
   ```
   - **What happens**: SupplyAgent calculates risk, generates recommendations
   - **Watch for**: Days of supply calculation, reorder recommendations, risk scoring
   - **Live feedback**: Dashboard shows "Purchase order generated" events

6. **Orchestration in Action**
   - **Events Flow**: All agent actions create events in the orchestration system
   - **Task Queue**: Events trigger automated tasks (demo scheduling, escalations, alerts)
   - **Cross-Communication**: Supply alerts automatically create support tickets
   - **Real-time Updates**: Dashboard metrics update as agents process data

### Key Features to Test

- **Event Bus**: Watch the Dashboard activity feed update in real-time
- **Agent Statistics**: Each agent card shows live processing metrics
- **State Management**: Data persists across page navigation using Zustand stores
- **API Mocking**: MSW provides realistic delays and occasional simulated failures
- **Responsive Design**: Try resizing the browser window to see mobile layouts

### Expected Behavior

- **Agents Auto-Start**: All agents initialize when Dashboard loads
- **Live Metrics**: KPIs update every 30 seconds
- **Event Logging**: All actions appear in Dashboard activity feed
- **Graceful Fallbacks**: If MSW fails, app uses in-memory data stores
- **Toast Notifications**: Important actions trigger user notifications

### Troubleshooting

- **Blank Dashboard**: Agents may still be initializing - wait 2-3 seconds
- **No Events**: Try qualifying a lead or generating a support reply to create activity
- **404 Errors**: MSW worker may not be loaded - refresh the page once

---

Built with ❤️ using React, Zustand, MSW, and modern multi-agent architecture patterns.