import { ApperSDK } from '@apper/web-sdk';

// Initialize Apper SDK
const apper = new ApperSDK({
  projectId: import.meta.env.VITE_APPER_PROJECT_ID,
  publicKey: import.meta.env.VITE_APPER_PUBLIC_KEY,
  cdnUrl: import.meta.env.VITE_APPER_SDK_CDN_URL
});

// Table names
const TIME_ENTRIES_TABLE = 'timeEntries';
const ACTIVE_TIMER_TABLE = 'activeTimer';

let activeTimer = null;

export const timeEntryService = {
  async getAll() {
    try {
      const result = await apper.database.query(TIME_ENTRIES_TABLE);
      return result.data || [];
    } catch (error) {
      throw new Error('Failed to fetch time entries from database');
    }
  },

  async getById(id) {
    try {
      const result = await apper.database.query(TIME_ENTRIES_TABLE, {
        where: { Id: parseInt(id, 10) }
      });
      return result.data?.[0] || null;
    } catch (error) {
      throw new Error('Failed to fetch time entry from database');
    }
  },

  async getTodaysEntries() {
    try {
      const today = new Date().toDateString();
      const result = await apper.database.query(TIME_ENTRIES_TABLE);
      const entries = result.data || [];
      
      return entries.filter(entry => {
        const entryDate = new Date(entry.startTime).toDateString();
        return entryDate === today;
      });
    } catch (error) {
      throw new Error('Failed to fetch today\'s entries from database');
    }
  },

  async getActiveTimer() {
    if (activeTimer) {
      return { ...activeTimer };
    }
    
    try {
      const result = await apper.database.query(ACTIVE_TIMER_TABLE);
      const timer = result.data?.[0] || null;
      activeTimer = timer;
      return timer ? { ...timer } : null;
    } catch (error) {
      throw new Error('Failed to fetch active timer from database');
    }
  },

  async startTimer(activityName, category) {
    try {
      // Stop any existing active timer
      if (activeTimer) {
        await this.stopTimer();
      }

      // Get next ID
      const allEntries = await this.getAll();
      const nextId = Math.max(...allEntries.map(e => e.Id), 0) + 1;

      const newEntry = {
        Id: nextId,
        activityName,
        category,
        startTime: new Date().toISOString(),
        endTime: null,
        duration: 0,
        isActive: true
      };

      // Save to time entries table
      await apper.database.insert(TIME_ENTRIES_TABLE, newEntry);

      // Save as active timer
      await apper.database.insert(ACTIVE_TIMER_TABLE, newEntry);
      
      activeTimer = { ...newEntry };
      return { ...newEntry };
    } catch (error) {
      throw new Error('Failed to start timer in database');
    }
  },

  async stopTimer() {
    if (!activeTimer) {
      throw new Error('No active timer to stop');
    }

    try {
      const endTime = new Date();
      const startTime = new Date(activeTimer.startTime);
      const duration = Math.round((endTime - startTime) / (1000 * 60));

      const updatedEntry = {
        ...activeTimer,
        endTime: endTime.toISOString(),
        duration,
        isActive: false
      };

      // Update in time entries table
      await apper.database.update(TIME_ENTRIES_TABLE, {
        where: { Id: activeTimer.Id },
        data: updatedEntry
      });

      // Clear active timer table
      await apper.database.delete(ACTIVE_TIMER_TABLE, {
        where: { Id: activeTimer.Id }
      });

      activeTimer = null;
      return { ...updatedEntry };
    } catch (error) {
      throw new Error('Failed to stop timer in database');
    }
  },

  async create(entryData) {
    try {
      // Get next ID
      const allEntries = await this.getAll();
      const nextId = Math.max(...allEntries.map(e => e.Id), 0) + 1;
      
      const newEntry = {
        Id: nextId,
        ...entryData,
        isActive: false
      };

      // Calculate duration if both start and end times provided
      if (entryData.startTime && entryData.endTime) {
        const start = new Date(entryData.startTime);
        const end = new Date(entryData.endTime);
        newEntry.duration = Math.round((end - start) / (1000 * 60));
      }

      await apper.database.insert(TIME_ENTRIES_TABLE, newEntry);
      return { ...newEntry };
    } catch (error) {
      throw new Error('Failed to create time entry in database');
    }
  },

  async update(id, updates) {
    try {
      const entryId = parseInt(id, 10);
      const existingEntry = await this.getById(entryId);
      
      if (!existingEntry) {
        throw new Error('Time entry not found');
      }

      const updatedEntry = {
        ...existingEntry,
        ...updates,
        Id: existingEntry.Id // Prevent ID modification
      };

      // Recalculate duration if start or end time changed
      if (updates.startTime || updates.endTime) {
        const start = new Date(updatedEntry.startTime);
        const end = new Date(updatedEntry.endTime);
        updatedEntry.duration = Math.round((end - start) / (1000 * 60));
      }

      await apper.database.update(TIME_ENTRIES_TABLE, {
        where: { Id: entryId },
        data: updatedEntry
      });
      
      // Update active timer if it's the one being updated
      if (activeTimer && activeTimer.Id === entryId) {
        activeTimer = { ...updatedEntry };
        await apper.database.update(ACTIVE_TIMER_TABLE, {
          where: { Id: entryId },
          data: updatedEntry
        });
      }
      
      return { ...updatedEntry };
    } catch (error) {
      throw new Error('Failed to update time entry in database');
    }
  },

  async delete(id) {
    try {
      const entryId = parseInt(id, 10);
      const existingEntry = await this.getById(entryId);
      
      if (!existingEntry) {
        throw new Error('Time entry not found');
      }

      await apper.database.delete(TIME_ENTRIES_TABLE, {
        where: { Id: entryId }
      });
      
      // Clear active timer if it's the one being deleted
      if (activeTimer && activeTimer.Id === entryId) {
        activeTimer = null;
        await apper.database.delete(ACTIVE_TIMER_TABLE, {
          where: { Id: entryId }
        });
      }
      
      return { ...existingEntry };
    } catch (error) {
      throw new Error('Failed to delete time entry from database');
    }
  },

  async getDailySummary(date = new Date()) {
    try {
      const targetDate = new Date(date).toDateString();
      const allEntries = await this.getAll();
      
      const dayEntries = allEntries.filter(entry => {
        const entryDate = new Date(entry.startTime).toDateString();
        return entryDate === targetDate && !entry.isActive;
      });

      const totalMinutes = dayEntries.reduce((sum, entry) => sum + entry.duration, 0);
      
      const categoryBreakdown = dayEntries.reduce((acc, entry) => {
        if (!acc[entry.category]) {
          acc[entry.category] = 0;
        }
        acc[entry.category] += entry.duration;
        return acc;
      }, {});

      return {
        date: targetDate,
        totalMinutes,
        categoryBreakdown,
        entryCount: dayEntries.length
      };
    } catch (error) {
      throw new Error('Failed to get daily summary from database');
    }
  }
};

export default timeEntryService;