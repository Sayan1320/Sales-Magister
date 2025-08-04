import { create } from 'zustand';

export const useEventStore = create((set, get) => ({
  // Event listeners registry
  listeners: {},
  
  // Event history for debugging
  eventHistory: [],
  maxHistorySize: 100,
  
  // Actions
  emit: (type, payload) => {
    const event = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      id: Date.now() + Math.random()
    };
    
    // Add to history
    set((state) => ({
      eventHistory: [
        event,
        ...state.eventHistory.slice(0, state.maxHistorySize - 1)
      ]
    }));
    
    // Notify listeners
    const { listeners } = get();
    if (listeners[type]) {
      listeners[type].forEach(callback => {
        try {
          callback(payload, event);
        } catch (error) {
          console.error(`Error in event listener for ${type}:`, error);
        }
      });
    }
  },
  
  on: (type, callback) => {
    set((state) => ({
      listeners: {
        ...state.listeners,
        [type]: [...(state.listeners[type] || []), callback]
      }
    }));
    
    // Return unsubscribe function
    return () => {
      set((state) => ({
        listeners: {
          ...state.listeners,
          [type]: (state.listeners[type] || []).filter(cb => cb !== callback)
        }
      }));
    };
  },
  
  off: (type, callback) => {
    set((state) => ({
      listeners: {
        ...state.listeners,
        [type]: callback 
          ? (state.listeners[type] || []).filter(cb => cb !== callback)
          : []
      }
    }));
  },
  
  // Clear all listeners
  clearListeners: () => set({ listeners: {} }),
  
  // Clear event history
  clearHistory: () => set({ eventHistory: [] }),
  
  // Get events by type
  getEventsByType: (type) => {
    return get().eventHistory.filter(event => event.type === type);
  },
  
  // Get recent events
  getRecentEvents: (count = 10) => {
    return get().eventHistory.slice(0, count);
  }
}));