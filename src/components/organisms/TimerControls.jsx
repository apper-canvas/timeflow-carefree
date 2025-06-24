import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import CategoryPill from '@/components/molecules/CategoryPill';
import Text from '@/components/atoms/Text';
import ApperIcon from '@/components/ApperIcon';
import { timeEntryService } from '@/services/api/timeEntryService';
import { categoryService } from '@/services/api/categoryService';

const TimerControls = ({ 
  activeTimer, 
  onTimerStart, 
  onTimerStop,
  className = '' 
}) => {
  const [activityName, setActivityName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const result = await categoryService.getAll();
      setCategories(result);
      if (result.length > 0 && !selectedCategory) {
        setSelectedCategory(result[0]);
}
    } catch (error) {
      console.error('Database error loading categories:', error);
      toast.error('Failed to load categories from database');
    }
  };

  const handleStartTimer = async () => {
    if (!activityName.trim()) {
      toast.error('Please enter an activity name');
      return;
    }

    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }

    setIsStarting(true);
    try {
      const entry = await timeEntryService.startTimer(
        activityName.trim(), 
        selectedCategory.name
      );
      onTimerStart(entry);
toast.success('Timer started!');
    } catch (error) {
      console.error('Database error starting timer:', error);
      toast.error('Failed to start timer. Please check your database connection.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopTimer = async () => {
    setLoading(true);
    try {
      const entry = await timeEntryService.stopTimer();
      onTimerStop(entry);
      setActivityName('');
toast.success('Timer stopped and logged!');
    } catch (error) {
      console.error('Database error stopping timer:', error);
      toast.error('Failed to stop timer. Please check your database connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className={`bg-white rounded-xl border border-surface-200 p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        {!activeTimer ? (
          <motion.div
            key="start-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="text-center">
              <ApperIcon 
                name="Play" 
                size={48} 
                className="text-surface-300 mx-auto mb-4" 
              />
              <Text size="lg" weight="medium" color="muted">
                What are you working on?
              </Text>
            </div>

            <Input
              label="Activity Name"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="e.g., Client meeting, Code review, Design work..."
              className="text-center"
              required
              onKeyPress={(e) => {
                if (e.key === 'Enter' && activityName.trim() && selectedCategory) {
                  handleStartTimer();
                }
              }}
            />

            <div className="space-y-3">
              <Text size="sm" weight="medium" color="default">
                Category
              </Text>
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
                  <CategoryPill
                    key={category.Id}
                    category={category}
                    isSelected={selectedCategory?.Id === category.Id}
                    onClick={() => setSelectedCategory(category)}
                    size="md"
                  />
                ))}
              </div>
            </div>

            <div className="text-center">
              <Button
                variant="accent"
                size="xl"
                icon="Play"
                onClick={handleStartTimer}
                disabled={!activityName.trim() || !selectedCategory || isStarting}
                className="min-w-[200px]"
              >
                {isStarting ? 'Starting...' : 'Start Timer'}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="stop-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-center space-y-6"
          >
            <div className="flex items-center justify-center gap-3">
              <motion.div
                className="w-4 h-4 bg-accent-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <Text size="lg" weight="medium" color="accent">
                Timer Running
              </Text>
            </div>

            <div className="space-y-2">
              <Text size="xl" weight="semibold" color="default">
                {activeTimer.activityName}
              </Text>
              
              {selectedCategory && (
                <div className="flex items-center justify-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: 
                      categories.find(c => c.name === activeTimer.category)?.color || '#6B7280' 
                    }}
                  />
                  <Text size="sm" color="muted">
                    {categories.find(c => c.name === activeTimer.category)?.displayName || activeTimer.category}
                  </Text>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="lg"
              icon="Square"
              onClick={handleStopTimer}
              disabled={loading}
              className="min-w-[160px] border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
            >
              {loading ? 'Stopping...' : 'Stop Timer'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TimerControls;