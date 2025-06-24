import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import Text from '@/components/atoms/Text';
import TimeEntryCard from '@/components/molecules/TimeEntryCard';
import EmptyState from '@/components/molecules/EmptyState';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import { timeEntryService } from '@/services/api/timeEntryService';
import { categoryService } from '@/services/api/categoryService';

const TodaysActivities = ({ 
  refreshTrigger = 0,
  onEditEntry,
  className = '' 
}) => {
  const [entries, setEntries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [entriesResult, categoriesResult] = await Promise.all([
        timeEntryService.getTodaysEntries(),
        categoryService.getAll()
      ]);
      
      setEntries(entriesResult);
      setCategories(categoriesResult);
    } catch (err) {
      setError(err.message || 'Failed to load activities');
      toast.error('Failed to load today\'s activities');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entry) => {
    if (!window.confirm('Are you sure you want to delete this time entry?')) {
      return;
    }

    try {
      await timeEntryService.delete(entry.Id);
      setEntries(prev => prev.filter(e => e.Id !== entry.Id));
      toast.success('Time entry deleted');
    } catch (error) {
      toast.error('Failed to delete time entry');
    }
  };

  const getCategoryForEntry = (entry) => {
    return categories.find(cat => cat.name === entry.category);
  };

  if (loading) {
    return (
      <div className={className}>
        <Text size="lg" weight="semibold" className="mb-4">
          Today's Activities
        </Text>
        <SkeletonLoader count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Text size="lg" weight="semibold" className="mb-4">
          Today's Activities
        </Text>
        <ErrorState 
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  const completedEntries = entries.filter(entry => !entry.isActive);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <Text size="lg" weight="semibold">
          Today's Activities
        </Text>
        <Text size="sm" color="muted">
          {completedEntries.length} {completedEntries.length === 1 ? 'entry' : 'entries'}
        </Text>
      </div>

      {completedEntries.length === 0 ? (
        <EmptyState
          icon="Clock"
          title="No activities logged yet"
          description="Start tracking your time to see your daily activities here"
          className="py-8"
        />
      ) : (
        <div className="space-y-3">
          {completedEntries.map((entry, index) => (
            <motion.div
              key={entry.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <TimeEntryCard
                entry={entry}
                category={getCategoryForEntry(entry)}
                onEdit={onEditEntry}
                onDelete={handleDeleteEntry}
              />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default TodaysActivities;