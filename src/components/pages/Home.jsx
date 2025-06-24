import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Text from '@/components/atoms/Text';
import Button from '@/components/atoms/Button';
import TimerDisplay from '@/components/molecules/TimerDisplay';
import ProgressRing from '@/components/molecules/ProgressRing';
import DailySummaryCard from '@/components/molecules/DailySummaryCard';
import TimerControls from '@/components/organisms/TimerControls';
import TodaysActivities from '@/components/organisms/TodaysActivities';
import ManualEntryModal from '@/components/organisms/ManualEntryModal';
import { timeEntryService } from '@/services/api/timeEntryService';
import { categoryService } from '@/services/api/categoryService';

const Home = () => {
  const [activeTimer, setActiveTimer] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [dailySummary, setDailySummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    let interval;
    
    if (activeTimer) {
      interval = setInterval(() => {
        const startTime = new Date(activeTimer.startTime);
        const now = new Date();
        const elapsed = (now - startTime) / (1000 * 60); // minutes
        setCurrentTime(elapsed);
      }, 1000);
    } else {
      setCurrentTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer]);

  const loadInitialData = async () => {
    try {
      const [timerResult, summaryResult, categoriesResult] = await Promise.all([
        timeEntryService.getActiveTimer(),
        timeEntryService.getDailySummary(),
        categoryService.getAll()
      ]);

      if (timerResult) {
        setActiveTimer(timerResult);
        const startTime = new Date(timerResult.startTime);
        const now = new Date();
        const elapsed = (now - startTime) / (1000 * 60);
        setCurrentTime(elapsed);
      }

      setDailySummary(summaryResult);
setCategories(categoriesResult);
    } catch (error) {
      console.error('Database connection error:', error);
      toast.error('Failed to connect to database. Please check your connection.');
    }
  };

  const handleTimerStart = (entry) => {
    setActiveTimer(entry);
    setCurrentTime(0);
  };

  const handleTimerStop = (entry) => {
    setActiveTimer(null);
    setCurrentTime(0);
    refreshData();
  };

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
    loadDailySummary();
  };

  const loadDailySummary = async () => {
    try {
      const result = await timeEntryService.getDailySummary();
      setDailySummary(result);
    } catch (error) {
      console.error('Failed to load daily summary:', error);
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setShowManualEntry(true);
  };

  const handleManualEntryClose = () => {
    setShowManualEntry(false);
    setEditingEntry(null);
  };

  const handleManualEntrySave = () => {
    refreshData();
  };

  // Calculate progress ring percentage (assuming 8-hour workday target)
  const targetMinutes = 8 * 60; // 8 hours
  const progressPercentage = dailySummary ? Math.min((dailySummary.totalMinutes / targetMinutes) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Text
            size="3xl"
            weight="bold"
            color="primary"
            variant="display"
            className="mb-2"
          >
            TimeFlow
          </Text>
          <Text color="muted" size="lg">
            Track your time, boost your productivity
          </Text>
        </motion.div>

        {/* Main Timer Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timer Display */}
          <motion.div
            className="lg:col-span-2 bg-white rounded-xl border border-surface-200 p-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <TimerDisplay
              time={currentTime}
              isActive={!!activeTimer}
              activityName={activeTimer?.activityName}
              className="mb-8"
            />

            {dailySummary && (
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <ProgressRing
                  progress={progressPercentage}
                  size={120}
                  strokeWidth={8}
                  color="#10B981"
                  backgroundColor="#E5E7EB"
                >
                  <div className="text-center">
                    <Text size="lg" weight="bold" color="accent">
                      {Math.round(progressPercentage)}%
                    </Text>
                    <Text size="xs" color="muted">
                      of 8h goal
                    </Text>
                  </div>
                </ProgressRing>
              </motion.div>
            )}
          </motion.div>

          {/* Daily Summary */}
          <div className="space-y-6">
            <DailySummaryCard
              summary={dailySummary || { totalMinutes: 0, categoryBreakdown: {} }}
              categories={categories}
            />
            
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Button
                variant="outline"
                icon="Plus"
                onClick={() => setShowManualEntry(true)}
                className="w-full"
              >
                Add Manual Entry
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Timer Controls */}
        <TimerControls
          activeTimer={activeTimer}
          onTimerStart={handleTimerStart}
          onTimerStop={handleTimerStop}
        />

        {/* Today's Activities */}
        <TodaysActivities
          refreshTrigger={refreshTrigger}
          onEditEntry={handleEditEntry}
        />

        {/* Manual Entry Modal */}
        <ManualEntryModal
          isOpen={showManualEntry}
          onClose={handleManualEntryClose}
          onSave={handleManualEntrySave}
          editingEntry={editingEntry}
        />
      </div>
    </div>
  );
};

export default Home;