import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Target,
  DollarSign,
  Loader2,
  Mail,
  Building,
  Globe,
  Phone,
  FileText
} from 'lucide-react';

import Toolbar, { FilterChip, SortDropdown } from '../components/Toolbar';
import Card from '../components/Card';
import Badge from '../components/Badge';
import ScoreGauge from '../components/ScoreGauge';
import { LoadingEmptyState, ErrorEmptyState, NoDataEmptyState, NoSearchResultsEmptyState } from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { fetchLeads, qualifyLead, queryKeys } from '../services/api';
import { orchestrator } from '../agents/orchestrator';

const LeadQualifier = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedLead, setSelectedLead] = useState(null);
  const [qualificationResult, setQualificationResult] = useState(null);
  
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  // Fetch leads
  const { 
    data: leads = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: queryKeys.leads(),
    queryFn: fetchLeads
  });

  // Qualify lead mutation
  const qualifyMutation = useMutation({
    mutationFn: qualifyLead,
    onSuccess: (result) => {
      setQualificationResult(result);
      success('Lead qualified successfully!', {
        title: 'Qualification Complete'
      });
      queryClient.invalidateQueries(queryKeys.leads());
    },
    onError: (error) => {
      showError('Failed to qualify lead. Please try again.', {
        title: 'Qualification Error'
      });
    }
  });

  // Filter and search leads
  const filteredLeads = React.useMemo(() => {
    let filtered = leads;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(query) ||
        lead.company.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.source.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === selectedFilter);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'company':
          return a.company.localeCompare(b.company);
        case 'source':
          return a.source.localeCompare(b.source);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    return filtered;
  }, [leads, searchQuery, selectedFilter, sortBy]);

  // Handle lead qualification
  const handleQualifyLead = useCallback(async (lead) => {
    setSelectedLead(lead);
    setQualificationResult(null);
    
    try {
      // First run the orchestrator's qualification
      await orchestrator.onNewLead(lead);
      
      // Then run the API mutation
      qualifyMutation.mutate({
        leadId: lead.id,
        leadData: lead
      });
    } catch (err) {
      showError('Failed to qualify lead. Please try again.');
    }
  }, [qualifyMutation, showError]);

  // Get filter counts
  const filterCounts = React.useMemo(() => {
    const counts = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      acc.all = (acc.all || 0) + 1;
      return acc;
    }, {});
    return counts;
  }, [leads]);

  // Sort options
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'company', label: 'Company' },
    { value: 'source', label: 'Source' },
    { value: 'created', label: 'Date Added' }
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (filteredLeads.length === 0) return;
      
      const currentIndex = selectedLead ? filteredLeads.findIndex(l => l.id === selectedLead.id) : -1;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = currentIndex < filteredLeads.length - 1 ? currentIndex + 1 : 0;
          setSelectedLead(filteredLeads[nextIndex]);
          break;
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredLeads.length - 1;
          setSelectedLead(filteredLeads[prevIndex]);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedLead) {
            handleQualifyLead(selectedLead);
          }
          break;
        default:
          // No action needed for other keys
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredLeads, selectedLead, handleQualifyLead]);

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
        <h1>Lead Qualifier</h1>
        <p className="subtitle">AI-powered lead qualification and scoring</p>
      </motion.div>

      {/* Toolbar */}
      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search leads by name, company, or email..."
        filters={
          <>
            <FilterChip
              active={selectedFilter === 'all'}
              onClick={() => setSelectedFilter('all')}
              count={filterCounts.all || 0}
            >
              All
            </FilterChip>
            <FilterChip
              active={selectedFilter === 'new'}
              onClick={() => setSelectedFilter('new')}
              count={filterCounts.new || 0}
            >
              New
            </FilterChip>
            <FilterChip
              active={selectedFilter === 'contacted'}
              onClick={() => setSelectedFilter('contacted')}
              count={filterCounts.contacted || 0}
            >
              Contacted
            </FilterChip>
            <FilterChip
              active={selectedFilter === 'qualified'}
              onClick={() => setSelectedFilter('qualified')}
              count={filterCounts.qualified || 0}
            >
              Qualified
            </FilterChip>
          </>
        }
        actions={
          <SortDropdown
            value={sortBy}
            onChange={setSortBy}
            options={sortOptions}
          />
        }
      />

      {/* Two-column layout */}
      <div className="grid grid-2" style={{ gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Left Panel - Leads List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card 
            title={`Leads (${filteredLeads.length})`}
            className="leads-list"
            style={{ height: '600px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <LoadingEmptyState message="Loading leads..." />
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                {searchQuery ? (
                  <NoSearchResultsEmptyState 
                    query={searchQuery} 
                    onClear={() => setSearchQuery('')} 
                  />
                ) : (
                  <NoDataEmptyState type="leads" />
                )}
              </div>
            ) : (
              <div style={{ flex: 1, overflow: 'auto' }} className="stack-2">
                <AnimatePresence>
                  {filteredLeads.map((lead, index) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => setSelectedLead(lead)}
                      style={{
                        padding: 'var(--space-4)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        backgroundColor: selectedLead?.id === lead.id ? 'var(--brand-light)' : 'var(--bg)'
                      }}
                      whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 stack-2">
                          <div className="flex items-center justify-between">
                            <h4 style={{ margin: 0 }}>{lead.name}</h4>
                            <Badge variant={lead.status === 'new' ? 'info' : lead.status === 'qualified' ? 'success' : 'neutral'}>
                              {lead.status}
                            </Badge>
                          </div>
                          
                          <div className="cluster-2">
                            <Building size={14} style={{ color: 'var(--muted)' }} />
                            <span className="subtle">{lead.company}</span>
                          </div>
                          
                          <div className="cluster-2">
                            <Mail size={14} style={{ color: 'var(--muted)' }} />
                            <span className="muted">{lead.email}</span>
                          </div>
                          
                          <div className="cluster-2">
                            <Globe size={14} style={{ color: 'var(--muted)' }} />
                            <span className="muted">{lead.source}</span>
                          </div>
                        </div>
                        
                        <motion.button
                          className="btn btn-primary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQualifyLead(lead);
                          }}
                          disabled={qualifyMutation.isLoading}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {qualifyMutation.isLoading && selectedLead?.id === lead.id ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Qualifying...
                            </>
                          ) : (
                            <>
                              <Target size={14} />
                              QUALIFY
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Right Panel - Lead Analysis */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {!selectedLead ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card style={{ height: '600px' }}>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center stack-4">
                      <Target size={48} style={{ color: 'var(--muted)', margin: '0 auto' }} />
                      <div>
                        <h3>Select a Lead</h3>
                        <p className="subtle">Choose a lead from the list to view qualification analysis</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key={selectedLead.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  title="Lead Analysis"
                  style={{ height: '600px', overflow: 'auto' }}
                >
                  <div className="stack-6">
                    {/* Lead Info */}
                    <div className="stack-4">
                      <div>
                        <h3>{selectedLead.name}</h3>
                        <div className="cluster-2">
                          <Building size={16} />
                          <span className="subtle">{selectedLead.company}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-2" style={{ gap: 'var(--space-3)' }}>
                        <div className="cluster-2">
                          <Mail size={14} style={{ color: 'var(--muted)' }} />
                          <span className="muted">{selectedLead.email}</span>
                        </div>
                        <div className="cluster-2">
                          <Phone size={14} style={{ color: 'var(--muted)' }} />
                          <span className="muted">{selectedLead.phone}</span>
                        </div>
                        <div className="cluster-2">
                          <Globe size={14} style={{ color: 'var(--muted)' }} />
                          <span className="muted">{selectedLead.source}</span>
                        </div>
                        <div className="cluster-2">
                          <DollarSign size={14} style={{ color: 'var(--muted)' }} />
                          <span className="muted">{selectedLead.budget}</span>
                        </div>
                      </div>
                    </div>

                    {/* Qualification Results */}
                    {qualificationResult && (
                      <motion.div
                        className="stack-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        {/* Score Gauge */}
                        <div className="text-center">
                          <ScoreGauge score={qualificationResult.score} />
                        </div>

                        {/* Decision */}
                        <div className="text-center">
                          <Badge
                            variant={
                              qualificationResult.decision === 'QUALIFY' ? 'success' :
                              qualificationResult.decision === 'NURTURE' ? 'warning' : 'danger'
                            }
                            size="md"
                          >
                            {qualificationResult.decision}
                          </Badge>
                        </div>

                        {/* Reasons */}
                        <div>
                          <h4>Qualification Reasons</h4>
                          <ul className="stack-2" style={{ margin: 0, paddingLeft: 'var(--space-4)' }}>
                            {qualificationResult.reasons.map((reason, index) => (
                              <motion.li
                                key={index}
                                className="subtle"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                              >
                                {reason}
                              </motion.li>
                            ))}
                          </ul>
                        </div>

                        {/* Action */}
                        <motion.button
                          className="btn btn-secondary w-full cluster-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            success('Onboarding ticket created for qualified lead!');
                          }}
                        >
                          <FileText size={16} />
                          Create Onboarding Ticket
                        </motion.button>
                      </motion.div>
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

export default LeadQualifier;