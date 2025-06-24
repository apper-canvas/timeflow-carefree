import timeEntriesData from '@/services/mockData/timeEntries.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let timeEntries = [...timeEntriesData];
let activeTimer = null;

export const timeEntryService = {
  async getAll() {
    await delay(300);
    return [...timeEntries];
  },

  async getById(id) {
    await delay(200);
    const entry = timeEntries.find(entry => entry.Id === parseInt(id, 10));
    return entry ? { ...entry } : null;
  },

  async getTodaysEntries() {
    await delay(300);
    const today = new Date().toDateString();
    return timeEntries
      .filter(entry => {
        const entryDate = new Date(entry.startTime).toDateString();
        return entryDate === today;
      })
      .map(entry => ({ ...entry }));
  },

  async getActiveTimer() {
    await delay(100);
    return activeTimer ? { ...activeTimer } : null;
  },

  async startTimer(activityName, category) {
    await delay(200);
    
    // Stop any existing active timer
    if (activeTimer) {
      await this.stopTimer();
    }

    const newEntry = {
      Id: Math.max(...timeEntries.map(e => e.Id), 0) + 1,
      activityName,
      category,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      isActive: true
    };

    timeEntries.push(newEntry);
    activeTimer = { ...newEntry };
    
    return { ...newEntry };
  },

  async stopTimer() {
    await delay(200);
    
    if (!activeTimer) {
      throw new Error('No active timer to stop');
    }

    const endTime = new Date();
    const startTime = new Date(activeTimer.startTime);
    const duration = Math.round((endTime - startTime) / (1000 * 60)); // Duration in minutes

    const updatedEntry = {
      ...activeTimer,
      endTime: endTime.toISOString(),
      duration,
      isActive: false
    };

    // Update in timeEntries array
    const index = timeEntries.findIndex(entry => entry.Id === activeTimer.Id);
    if (index !== -1) {
      timeEntries[index] = updatedEntry;
    }

    activeTimer = null;
    return { ...updatedEntry };
  },

  async create(entryData) {
    await delay(300);
    
    const newEntry = {
      Id: Math.max(...timeEntries.map(e => e.Id), 0) + 1,
      ...entryData,
      isActive: false
    };

    // Calculate duration if both start and end times provided
    if (entryData.startTime && entryData.endTime) {
      const start = new Date(entryData.startTime);
      const end = new Date(entryData.endTime);
      newEntry.duration = Math.round((end - start) / (1000 * 60));
    }

    timeEntries.push(newEntry);
    return { ...newEntry };
  },

  async update(id, updates) {
    await delay(300);
    
    const index = timeEntries.findIndex(entry => entry.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Time entry not found');
    }

    const updatedEntry = {
      ...timeEntries[index],
      ...updates,
      Id: timeEntries[index].Id // Prevent ID modification
    };

    // Recalculate duration if start or end time changed
    if (updates.startTime || updates.endTime) {
      const start = new Date(updatedEntry.startTime);
      const end = new Date(updatedEntry.endTime);
      updatedEntry.duration = Math.round((end - start) / (1000 * 60));
    }

    timeEntries[index] = updatedEntry;
    
    // Update active timer if it's the one being updated
    if (activeTimer && activeTimer.Id === parseInt(id, 10)) {
      activeTimer = { ...updatedEntry };
    }
    
    return { ...updatedEntry };
  },

  async delete(id) {
    await delay(200);
    
    const index = timeEntries.findIndex(entry => entry.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Time entry not found');
    }

    const deletedEntry = timeEntries[index];
    timeEntries.splice(index, 1);
    
    // Clear active timer if it's the one being deleted
    if (activeTimer && activeTimer.Id === parseInt(id, 10)) {
      activeTimer = null;
    }
    
    return { ...deletedEntry };
  },

  async getDailySummary(date = new Date()) {
    await delay(300);
    
    const targetDate = new Date(date).toDateString();
    const dayEntries = timeEntries.filter(entry => {
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
  }
};

export default timeEntryService;