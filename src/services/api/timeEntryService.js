// Apper SDK will be loaded via CDN
let apper = null;

// Initialize Apper SDK when available
const initializeApperSDK = async () => {
  if (apper) return apper;
  
  try {
    if (!window.ApperSDK && window.loadApperSDK) {
      await window.loadApperSDK();
    }
    
    if (window.ApperSDK) {
      apper = new window.ApperSDK({
        projectId: import.meta.env.VITE_APPER_PROJECT_ID,
publicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      return apper;
    } else {
      throw new Error('ApperSDK not available');
    }
  } catch (error) {
    console.error('Failed to initialize Apper SDK:', error);
    throw error;
  }
};

// Table names
const TIME_ENTRIES_TABLE = 'timeEntries';
const ACTIVE_TIMER_TABLE = 'activeTimer';

const timeEntryService = {
  // Get all time entries
// Get all time entries
  async getTimeEntries(limit = 50) {
    await initializeApperSDK();
    try {
      if (!apper) throw new Error('Apper SDK not initialized');
      const response = await apper.table(TIME_ENTRIES_TABLE).select('*').limit(limit);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching time entries:', error);
      return [];
    }
  },

  // Get time entries for a specific date
  async getTimeEntriesByDate(date) {
    await initializeApperSDK();
    try {
      if (!apper) throw new Error('Apper SDK not initialized');
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const response = await apper.table(TIME_ENTRIES_TABLE)
        .select('*')
        .gte('startTime', startOfDay.toISOString())
        .lte('startTime', endOfDay.toISOString());
      return response.data || [];
    } catch (error) {
      console.error('Error fetching time entries by date:', error);
      return [];
    }
  },

  // Get today's entries
  async getTodaysEntries() {
    await initializeApperSDK();
    try {
      if (!apper) throw new Error('Apper SDK not initialized');
      const today = new Date();
      return await this.getTimeEntriesByDate(today);
    } catch (error) {
      console.error('Error fetching today\'s entries:', error);
      return [];
    }
  },

  // Create a new time entry
  async createTimeEntry(timeEntry) {
    await initializeApperSDK();
    try {
      if (!apper) throw new Error('Apper SDK not initialized');
      const response = await apper.table(TIME_ENTRIES_TABLE).insert([{
        ...timeEntry,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]);
      return response.data?.[0] || null;
    } catch (error) {
      console.error('Error creating time entry:', error);
      return null;
    }
  },

  // Update a time entry
  async updateTimeEntry(id, updates) {
    await initializeApperSDK();
    try {
      if (!apper) throw new Error('Apper SDK not initialized');
      const response = await apper.table(TIME_ENTRIES_TABLE)
        .update({
          ...updates,
          updatedAt: new Date().toISOString()
        })
        .eq('id', id);
      return response.data?.[0] || null;
    } catch (error) {
      console.error('Error updating time entry:', error);
      return null;
    }
  },

  // Delete a time entry
  async deleteTimeEntry(id) {
    await initializeApperSDK();
    try {
      if (!apper) throw new Error('Apper SDK not initialized');
      const response = await apper.table(TIME_ENTRIES_TABLE)
        .delete()
        .eq('id', id);
      return response.error ? false : true;
    } catch (error) {
      console.error('Error deleting time entry:', error);
      return false;
    }
  },

  // Get active timer
  async getActiveTimer() {
    await initializeApperSDK();
    try {
      if (!apper) throw new Error('Apper SDK not initialized');
      const response = await apper.table(ACTIVE_TIMER_TABLE)
        .select('*')
        .limit(1);
      return response.data?.[0] || null;
    } catch (error) {
      console.error('Error fetching active timer:', error);
      return null;
    }
  },

  // Start timer
  async startTimer(categoryId, description = '') {
    await initializeApperSDK();
    try {
      if (!apper) throw new Error('Apper SDK not initialized');
      // First, stop any existing timer
      await this.stopTimer();
      
      const timerData = {
        id: crypto.randomUUID(),
        categoryId,
        description,
        startTime: new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString()
      };

      // Save to active timer table
      const response = await apper.table(ACTIVE_TIMER_TABLE).insert([timerData]);
      return response.data?.[0] || null;
    } catch (error) {
      console.error('Error starting timer:', error);
      return null;
    }
  },

  // Stop timer
  async stopTimer() {
    await initializeApperSDK();
    try {
      if (!apper) throw new Error('Apper SDK not initialized');
      // Get current active timer
      const activeTimer = await this.getActiveTimer();
      if (!activeTimer) return null;

      // Calculate duration
      const endTime = new Date();
      const startTime = new Date(activeTimer.startTime);
      const duration = Math.round((endTime - startTime) / (1000 * 60)); // minutes

      const completedEntry = {
        ...activeTimer,
        endTime: endTime.toISOString(),
        duration,
        isActive: false,
        updatedAt: new Date().toISOString()
      };

      // Save to time entries table
      await apper.table(TIME_ENTRIES_TABLE).insert([completedEntry]);

      // Clear active timer table
      await apper.table(ACTIVE_TIMER_TABLE).delete().eq('id', activeTimer.id);

      return completedEntry;
    } catch (error) {
      console.error('Error stopping timer:', error);
      return null;
    }
  },

  // Get daily summary
  async getDailySummary(date = new Date()) {
    try {
      const entries = await this.getTimeEntriesByDate(date);
      
      const completedEntries = entries.filter(entry => !entry.isActive && entry.duration);
      const totalMinutes = completedEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
      
      const categoryBreakdown = completedEntries.reduce((acc, entry) => {
        const category = entry.category || entry.categoryId || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += entry.duration || 0;
        return acc;
      }, {});

      return {
        date: new Date(date).toDateString(),
        totalMinutes,
        categoryBreakdown,
        entryCount: completedEntries.length
      };
    } catch (error) {
      console.error('Error getting daily summary:', error);
      return {
        date: new Date(date).toDateString(),
        totalMinutes: 0,
        categoryBreakdown: {},
        entryCount: 0
      };
    }
  }

export default timeEntryService;