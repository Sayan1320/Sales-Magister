import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import components
import Navigation from './components/Navigation';
import { ToastProvider } from './components/Toast';

// Import pages
import Dashboard from './pages/Dashboard';
import LeadQualifier from './pages/LeadQualifier';
import CustomerSupport from './pages/CustomerSupport';
import SupplyChain from './pages/SupplyChain';

// Import orchestrator
import { orchestrator } from './agents/orchestrator';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});



function AppContent() {
  useEffect(() => {
    // Initialize the orchestrator when the app starts
    const initializeOrchestrator = async () => {
      try {
        await orchestrator.initialize();
      } catch (error) {
        console.error('Failed to initialize orchestrator:', error);
      }
    };

    initializeOrchestrator();

    // Cleanup on unmount
    return () => {
      orchestrator.shutdown();
    };
  }, []);

  return (
    <div className="page">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navigation />
      <main id="main-content" className="page-content" role="main">
        <div className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lead-qualifier" element={<LeadQualifier />} />
            <Route path="/customer-support" element={<CustomerSupport />} />
            <Route path="/supply-chain" element={<SupplyChain />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router>
          <AppContent />
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;