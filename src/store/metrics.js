import { create } from 'zustand';

export const useMetricsStore = create((set, get) => ({
  // Dashboard metrics
  metrics: {
    totalLeads: 0,
    activeTickets: 0,
    inventoryAlerts: 0,
    conversionRate: 0
  },
  
  // Loading states
  loading: false,
  error: null,
  
  // Actions
  setMetrics: (metrics) => set({ metrics, error: null }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error, loading: false }),
  
  // Update individual metrics
  updateMetric: (key, value) => set((state) => ({
    metrics: {
      ...state.metrics,
      [key]: value
    }
  })),
  
  // Increment/decrement helpers
  incrementMetric: (key, amount = 1) => set((state) => ({
    metrics: {
      ...state.metrics,
      [key]: state.metrics[key] + amount
    }
  })),
  
  decrementMetric: (key, amount = 1) => set((state) => ({
    metrics: {
      ...state.metrics,
      [key]: Math.max(0, state.metrics[key] - amount)
    }
  })),
  
  // Reset metrics
  resetMetrics: () => set({
    metrics: {
      totalLeads: 0,
      activeTickets: 0,
      inventoryAlerts: 0,
      conversionRate: 0
    },
    error: null
  }),
  
  // Calculate conversion rate
  calculateConversionRate: (qualified, total) => {
    const rate = total > 0 ? ((qualified / total) * 100) : 0;
    set((state) => ({
      metrics: {
        ...state.metrics,
        conversionRate: parseFloat(rate.toFixed(1))
      }
    }));
  }
}));