import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  MessageSquare, 
  Package, 
  TrendingUp,
  Activity,
  CheckCircle,
  AlertTriangle,
  Target,
  Headphones,
  Truck
} from 'lucide-react';

import StatCard from '../components/StatCard';
import Card from '../components/Card';
import { LoadingEmptyState, ErrorEmptyState } from '../components/EmptyState';
import { fetchDashboardMetrics } from '../services/api';
// Removed unused import
import { useLeadsStore } from '../store/leadsSlice';
import { useTicketsStore } from '../store/ticketsSlice';
import { useInventoryStore } from '../store/inventorySlice';
import { useOrchestrationStore } from '../store/orchestrationSlice';
import { leadAgent } from '../agents/leadAgent';
import { supportAgent } from '../agents/supportAgent';
import { supplyAgent } from '../agents/supplyAgent';

const Dashboard = () => {
  // Store hooks
  const leadsStore = useLeadsStore();
  const ticketsStore = useTicketsStore();
  const inventoryStore = useInventoryStore();
  const orchestrationStore = useOrchestrationStore();
  
  const { 
    data: metrics, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
    refetchInterval: false, // Disable auto-refetch for now
    retry: false, // Don't retry failed requests
    staleTime: 0, // Force fresh data
    cacheTime: 0, // Don't cache
  });
  
  // Initialize stores and agents on component mount
  useEffect(() => {
    console.log('🏗️ Dashboard useEffect running - initializing stores...');
    
    const initializeStores = async () => {
      try {
        console.log('💾 Hydrating stores...');
        await Promise.all([
          leadsStore.hydrate(),
          ticketsStore.hydrate(),
          inventoryStore.hydrate()
        ]);
        
        console.log('🤖 Starting agents...');
        // Start agents after stores are ready
        leadAgent.start();
        supportAgent.start();
        supplyAgent.start();
        
        console.log('✅ All stores and agents initialized');
      } catch (error) {
        console.error('❌ Failed to initialize stores:', error);
      }
    };
    
    initializeStores();
    
    return () => {
      console.log('🧹 Cleaning up agents...');
      // Cleanup agents
      try {
        leadAgent.stop();
        supportAgent.stop();
        supplyAgent.stop();
      } catch (error) {
        console.error('Error stopping agents:', error);
      }
    };
  }, []);

  // Debug logging
  console.log('📊 Dashboard render - isLoading:', isLoading, 'error:', error, 'metrics:', metrics);

  if (isLoading) {
    console.log('⏳ Dashboard showing loading state');
    return <LoadingEmptyState message="Loading dashboard metrics..." />;
  }

  if (error) {
    console.log('❌ Dashboard showing error state:', error);
    return <ErrorEmptyState error={error.message} onRetry={refetch} />;
  }

  if (!metrics) {
    console.log('⚠️ Dashboard - no metrics data');
    return <ErrorEmptyState error="No metrics data available" onRetry={refetch} />;
  }

  console.log('✅ Dashboard rendering with metrics');

  // Get live agent statistics
  const leadAgentStats = leadAgent.getStats();
  const supportAgentStats = supportAgent.getStats();
  const supplyAgentStats = supplyAgent.getStats();
  
  // AI Agents Status Data
  const agentStatus = [
    {
      name: 'Lead Qualifier',
      icon: Target,
      color: 'brand',
      status: leadAgentStats.active ? 'active' : 'inactive',
      metrics: {
        processed: leadAgentStats.processed,
        qualified: leadAgentStats.qualified,
        avgScore: leadAgentStats.avgScore
      }
    },
    {
      name: 'Customer Support',
      icon: Headphones,
      color: 'success',
      status: supportAgentStats.active ? 'active' : 'inactive',
      metrics: {
        resolved: supportAgentStats.resolved,
        avgTime: supportAgentStats.avgTime,
        satisfaction: supportAgentStats.satisfaction
      }
    },
    {
      name: 'Supply Chain',
      icon: Truck,
      color: 'warning',
      status: supplyAgentStats.active ? 'active' : 'inactive',
      metrics: {
        monitored: supplyAgentStats.monitored,
        alerts: supplyAgentStats.alerts,
        efficiency: supplyAgentStats.efficiency
      }
    }
  ];

  return (
    <motion.div 
      className="stack-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>AI Agent Platform Dashboard</h1>
        <p className="subtitle">Monitor your intelligent business automation agents</p>
      </motion.div>

      {/* KPI Cards Grid */}
      <div className="grid grid-4">
        <StatCard
          title="Total Leads"
          value={metrics.totalLeads}
          subtitle="New leads this month"
          trend={12}
          color="brand"
          icon={Users}
          delay={0.1}
        />
        
        <StatCard
          title="Active Tickets"
          value={metrics.activeTickets}
          subtitle="Customer support requests"
          trend={-5}
          color="success"
          icon={MessageSquare}
          delay={0.2}
        />
        
        <StatCard
          title="Inventory Alerts"
          value={metrics.inventoryAlerts}
          subtitle="Items requiring attention"
          trend={8}
          color="warning"
          icon={Package}
          delay={0.3}
        />
        
        <StatCard
          title="Conversion Rate"
          value={`${metrics.conversionRate}%`}
          subtitle="Lead to customer conversion"
          trend={3}
          color="info"
          icon={TrendingUp}
          delay={0.4}
        />
      </div>

      {/* AI Agents Status */}
      <motion.div
        className="stack-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div>
          <h2>AI Agents Status</h2>
          <p className="subtitle">Real-time monitoring of your AI automation agents</p>
        </div>

        <div className="grid grid-3">
          {agentStatus.map((agent, index) => {
            const Icon = agent.icon;
            
            return (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + (index * 0.1) }}
              >
                <Card>
                  <div className="stack-4">
                    {/* Agent Header */}
                    <div className="flex items-center justify-between">
                      <div className="cluster-3">
                        <div 
                          style={{
                            padding: 'var(--space-2)',
                            borderRadius: 'var(--radius)',
                            backgroundColor: 'var(--bg-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Icon size={20} style={{ color: `var(--${agent.color})` }} />
                        </div>
                        
                        <div>
                          <h4 style={{ margin: 0 }}>{agent.name}</h4>
                          <div 
                            className="cluster-2"
                            style={{ 
                              alignItems: 'center',
                              marginTop: 'var(--space-1)'
                            }}
                          >
                            <div
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: agent.status === 'active' ? 'var(--success)' : 'var(--warning)'
                              }}
                            />
                            <span className="muted" style={{ textTransform: 'capitalize' }}>
                              {agent.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Activity size={16} style={{ color: 'var(--muted)' }} />
                    </div>

                    {/* Agent Metrics */}
                    <div className="grid grid-3" style={{ gap: 'var(--space-3)' }}>
                      {Object.entries(agent.metrics).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div 
                            style={{ 
                              fontSize: '1.5rem', 
                              fontWeight: '700',
                              color: `var(--${agent.color})`,
                              lineHeight: '1'
                            }}
                          >
                            {value}
                            {key === 'satisfaction' || key === 'efficiency' || key === 'avgScore' ? '%' : ''}
                          </div>
                          <div className="muted" style={{ textTransform: 'capitalize', marginTop: 'var(--space-1)' }}>
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        className="stack-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <h3>Recent Activity</h3>
        
        <Card>
          <div className="stack-4">
            {orchestrationStore.getRecentEvents(5).map((event, index) => {
              let icon = Activity;
              let color = 'info';
              let title = event.type;
              let subtitle = `Source: ${event.source}`;
              
              // Map event types to UI elements
              switch (event.type) {
                case 'lead.qualified':
                  icon = CheckCircle;
                  color = 'success';
                  title = 'Lead qualified successfully';
                  subtitle = `${event.payload.leadName} - Score: ${event.payload.score}/100`;
                  break;
                case 'ticket.escalated':
                  icon = AlertTriangle;
                  color = 'warning';
                  title = 'Support ticket escalated';
                  subtitle = `Ticket ${event.payload.ticketId} escalated to Tier-2`;
                  break;
                case 'supply.alert':
                  icon = Package;
                  color = 'danger';
                  title = 'Inventory alert triggered';
                  subtitle = `${event.payload.itemName} - ${event.payload.daysOfSupply} days remaining`;
                  break;
                case 'order.generated':
                  icon = Truck;
                  color = 'info';
                  title = 'Purchase order generated';
                  subtitle = `${event.payload.quantity} units of ${event.payload.itemName}`;
                  break;
                default:
                  subtitle = JSON.stringify(event.payload).substring(0, 50) + '...';
              }
              
              const Icon = icon;
              const timeAgo = new Date(event.timestamp).toLocaleString();
              
              return (
                <motion.div
                  key={event.id}
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.9 + (index * 0.1) }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: `var(--${color})`
                    }}
                  />
                  
                  <Icon size={16} style={{ color: `var(--${color})` }} />
                  
                  <div className="flex-1">
                    <div className="subtle font-medium">{title}</div>
                    <div className="muted">{subtitle}</div>
                  </div>
                  
                  <div className="muted" style={{ fontSize: '0.75rem' }}>
                    {timeAgo}
                  </div>
                </motion.div>
              );
            })}
            
            {orchestrationStore.events.length === 0 && (
              <div className="text-center muted" style={{ padding: 'var(--space-8)' }}>
                No recent activity. Agents are monitoring for events...
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;