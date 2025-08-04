import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MessageSquare, 
  Send, 
  RefreshCw, 
  User, 
  Clock, 
  Sparkles,
  Loader2,
  Copy,
  FileText,
  CheckSquare,
  Square,
  Mail,
  Calendar,
  Tag
} from 'lucide-react';

import Tabs from '../components/Tabs';
import Card from '../components/Card';
import Badge, { StatusBadge, PriorityBadge } from '../components/Badge';
import { LoadingEmptyState, ErrorEmptyState, NoDataEmptyState } from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { fetchTickets, generateTicketReply, sendTicketReply, queryKeys } from '../services/api';
import { orchestrator } from '../agents/orchestrator';

const CustomerSupport = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [aiDraft, setAiDraft] = useState('');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [nextSteps, setNextSteps] = useState([]);
  
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  // Fetch tickets
  const { 
    data: tickets = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: queryKeys.tickets(),
    queryFn: fetchTickets
  });

  // Send reply mutation
  const sendReplyMutation = useMutation({
    mutationFn: sendTicketReply,
    onSuccess: () => {
      success('Reply sent successfully!', {
        title: 'Ticket Updated'
      });
      setAiDraft('');
      setSelectedTicket(prev => ({ ...prev, status: 'in_progress' }));
      queryClient.invalidateQueries(queryKeys.tickets());
    },
    onError: () => {
      showError('Failed to send reply. Please try again.', {
        title: 'Send Error'
      });
    }
  });

  // Filter tickets by tab
  const filteredTickets = React.useMemo(() => {
    if (activeTab === 'all') return tickets;
    return tickets.filter(ticket => ticket.status === activeTab);
  }, [tickets, activeTab]);

  // Get tab counts
  const tabCounts = React.useMemo(() => {
    const counts = tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      acc.all = (acc.all || 0) + 1;
      return acc;
    }, {});
    return counts;
  }, [tickets]);

  // Generate AI draft
  const handleGenerateDraft = useCallback(async (ticket) => {
    if (!ticket) return;
    
    setIsGeneratingDraft(true);
    try {
      // Use orchestrator to generate draft
      const result = await orchestrator.onTicketOpened(ticket);
      
      // Also call API for consistency
      const response = await generateTicketReply({ ticketId: ticket.id, ticketData: ticket });
      
      setAiDraft(response.suggestedResponse || result.suggestedResponse);
      
      // Set recommended next steps
      setNextSteps([
        { id: 1, text: 'Follow up with customer within 24 hours', completed: false },
        { id: 2, text: 'Update internal knowledge base if new issue', completed: false },
        { id: 3, text: 'Check for similar open tickets', completed: false },
        { id: 4, text: 'Escalate to technical team if needed', completed: false }
      ]);
      
      success('AI response generated successfully!');
    } catch (err) {
      showError('Failed to generate AI response. Please try again.');
    } finally {
      setIsGeneratingDraft(false);
    }
  }, [success, showError]);

  // Handle ticket selection
  const handleTicketSelect = useCallback((ticket) => {
    setSelectedTicket(ticket);
    setAiDraft('');
    setNextSteps([]);
    
    // Auto-generate draft for new selection
    if (ticket) {
      handleGenerateDraft(ticket);
    }
  }, [handleGenerateDraft]);

  // Copy to clipboard
  const handleCopyDraft = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(aiDraft);
      success('Response copied to clipboard!');
    } catch (err) {
      showError('Failed to copy to clipboard');
    }
  }, [aiDraft, success, showError]);

  // Send reply
  const handleSendReply = useCallback(() => {
    if (!selectedTicket || !aiDraft.trim()) return;
    
    sendReplyMutation.mutate({
      ticketId: selectedTicket.id,
      message: aiDraft,
      ticketData: selectedTicket
    });
  }, [selectedTicket, aiDraft, sendReplyMutation]);

  // Toggle next step
  const toggleNextStep = useCallback((stepId) => {
    setNextSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    );
  }, []);

  // Avatar component
  const Avatar = ({ name, size = 32 }) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: 'var(--brand-light)',
          color: 'var(--brand)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${size * 0.4}px`,
          fontWeight: '600'
        }}
      >
        {initials}
      </div>
    );
  };

  const tabs = [
    { id: 'all', label: 'All', count: tabCounts.all || 0 },
    { id: 'open', label: 'Open', count: tabCounts.open || 0 },
    { id: 'in_progress', label: 'In Progress', count: tabCounts.in_progress || 0 },
    { id: 'resolved', label: 'Resolved', count: tabCounts.resolved || 0 }
  ];

  if (error) {
    return <ErrorEmptyState error={error.message} />;
  }

  return (
    <motion.div
      className="stack-6"
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
        <h1>Customer Support</h1>
        <p className="subtitle">AI-powered customer support ticket management</p>
      </motion.div>

      {/* Tabs */}
      <Tabs 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Two-column layout */}
      <div className="grid grid-2" style={{ gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Left Panel - Tickets List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card 
            title={`Tickets (${filteredTickets.length})`}
            style={{ height: '700px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <LoadingEmptyState message="Loading tickets..." />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <NoDataEmptyState type="tickets" />
              </div>
            ) : (
              <div style={{ flex: 1, overflow: 'auto' }} className="stack-2">
                <AnimatePresence>
                  {filteredTickets.map((ticket, index) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => handleTicketSelect(ticket)}
                      style={{
                        padding: 'var(--space-4)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        backgroundColor: selectedTicket?.id === ticket.id ? 'var(--brand-light)' : 'var(--bg)'
                      }}
                      whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
                    >
                      <div className="flex gap-3">
                        <Avatar name={ticket.customerName} />
                        
                        <div className="flex-1 stack-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 style={{ margin: 0, marginBottom: 'var(--space-1)' }}>
                                {ticket.subject}
                              </h4>
                              <div className="cluster-2">
                                <span className="subtle">{ticket.customerName}</span>
                                <span className="muted">•</span>
                                <span className="muted">{ticket.customerEmail}</span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <PriorityBadge priority={ticket.priority} size="xs" />
                              <StatusBadge status={ticket.status} size="xs" />
                            </div>
                          </div>
                          
                          <div className="cluster-3">
                            <div className="cluster-2">
                              <Tag size={12} style={{ color: 'var(--muted)' }} />
                              <Badge variant="neutral" size="xs">{ticket.category}</Badge>
                            </div>
                            
                            <div className="cluster-2">
                              <Clock size={12} style={{ color: 'var(--muted)' }} />
                              <span className="muted">
                                {new Date(ticket.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          <p className="muted" style={{ 
                            margin: 0, 
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {ticket.message}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Right Panel - Ticket Details & AI Response */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {!selectedTicket ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card style={{ height: '700px' }}>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center stack-4">
                      <MessageSquare size={48} style={{ color: 'var(--muted)', margin: '0 auto' }} />
                      <div>
                        <h3>Select a Ticket</h3>
                        <p className="subtle">Choose a ticket from the list to view details and generate AI responses</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key={selectedTicket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  title="Ticket Details & AI Response"
                  style={{ height: '700px', overflow: 'auto' }}
                >
                  <div className="stack-6">
                    {/* Ticket Meta */}
                    <div className="stack-4">
                      <div>
                        <h3>{selectedTicket.subject}</h3>
                        <div className="cluster-3">
                          <PriorityBadge priority={selectedTicket.priority} />
                          <StatusBadge status={selectedTicket.status} />
                          <Badge variant="neutral">#{selectedTicket.id}</Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-2" style={{ gap: 'var(--space-3)' }}>
                        <div className="cluster-2">
                          <User size={14} style={{ color: 'var(--muted)' }} />
                          <span className="muted">{selectedTicket.customerName}</span>
                        </div>
                        <div className="cluster-2">
                          <Mail size={14} style={{ color: 'var(--muted)' }} />
                          <span className="muted">{selectedTicket.customerEmail}</span>
                        </div>
                        <div className="cluster-2">
                          <Tag size={14} style={{ color: 'var(--muted)' }} />
                          <span className="muted">{selectedTicket.category}</span>
                        </div>
                        <div className="cluster-2">
                          <Calendar size={14} style={{ color: 'var(--muted)' }} />
                          <span className="muted">
                            {new Date(selectedTicket.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h4>Customer Message</h4>
                        <p className="subtle" style={{ 
                          padding: 'var(--space-3)',
                          backgroundColor: 'var(--bg-secondary)',
                          borderRadius: 'var(--radius)',
                          margin: 0
                        }}>
                          {selectedTicket.message}
                        </p>
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="stack-4">
                      <div className="flex items-center justify-between">
                        <h4 className="cluster-2">
                          <Sparkles size={16} style={{ color: 'var(--brand)' }} />
                          AI Generated Response
                        </h4>
                        
                        <motion.button
                          className="btn btn-ghost btn-sm cluster-2"
                          onClick={() => handleGenerateDraft(selectedTicket)}
                          disabled={isGeneratingDraft}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isGeneratingDraft ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <RefreshCw size={14} />
                          )}
                          Regenerate
                        </motion.button>
                      </div>
                      
                      <div style={{ position: 'relative' }}>
                        <textarea
                          value={aiDraft}
                          onChange={(e) => setAiDraft(e.target.value)}
                          placeholder={isGeneratingDraft ? "Generating AI response..." : "AI response will appear here..."}
                          disabled={isGeneratingDraft}
                          style={{
                            width: '100%',
                            minHeight: '150px',
                            padding: 'var(--space-3)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            backgroundColor: 'var(--bg)',
                            color: 'var(--text)',
                            fontSize: '0.875rem',
                            lineHeight: '1.5',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                          }}
                        />
                        
                        {isGeneratingDraft && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 'var(--space-2)',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            <Loader2 size={20} className="animate-spin" />
                            Generating response...
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <motion.button
                          className="btn btn-secondary btn-sm cluster-2"
                          onClick={handleCopyDraft}
                          disabled={!aiDraft.trim()}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Copy size={14} />
                          Copy
                        </motion.button>
                        
                        <motion.button
                          className="btn btn-ghost btn-sm cluster-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FileText size={14} />
                          Insert Template
                        </motion.button>
                        
                        <motion.button
                          className="btn btn-primary cluster-2 flex-1"
                          onClick={handleSendReply}
                          disabled={!aiDraft.trim() || sendReplyMutation.isLoading}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {sendReplyMutation.isLoading ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send size={16} />
                              Send Reply
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>

                    {/* Recommended Next Steps */}
                    {nextSteps.length > 0 && (
                      <div className="stack-3">
                        <h4>Recommended Next Steps</h4>
                        <div className="stack-2">
                          {nextSteps.map(step => (
                            <motion.div
                              key={step.id}
                              className="flex items-center gap-3 cursor-pointer"
                              onClick={() => toggleNextStep(step.id)}
                              whileHover={{ x: 2 }}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: step.id * 0.1 }}
                            >
                              {step.completed ? (
                                <CheckSquare size={16} style={{ color: 'var(--success)' }} />
                              ) : (
                                <Square size={16} style={{ color: 'var(--muted)' }} />
                              )}
                              <span 
                                className={step.completed ? 'muted' : 'subtle'}
                                style={{ 
                                  textDecoration: step.completed ? 'line-through' : 'none',
                                  flex: 1
                                }}
                              >
                                {step.text}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CustomerSupport;