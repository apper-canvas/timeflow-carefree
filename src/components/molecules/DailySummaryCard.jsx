import { motion } from 'framer-motion';
import Text from '@/components/atoms/Text';
import ApperIcon from '@/components/ApperIcon';

const DailySummaryCard = ({ 
  summary, 
  categories = [],
  className = '' 
}) => {
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    }
    return `${mins}m`;
  };

  const getCategoryData = () => {
    return Object.entries(summary.categoryBreakdown || {}).map(([categoryName, minutes]) => {
      const category = categories.find(cat => cat.name === categoryName);
      const percentage = summary.totalMinutes > 0 ? (minutes / summary.totalMinutes) * 100 : 0;
      
      return {
        name: categoryName,
        displayName: category?.displayName || categoryName,
        color: category?.color || '#6B7280',
        icon: category?.icon || 'Circle',
        minutes,
        percentage
      };
    }).sort((a, b) => b.minutes - a.minutes);
  };

  const categoryData = getCategoryData();

  if (summary.totalMinutes === 0) {
    return (
      <motion.div
        className={`bg-surface-50 border border-surface-200 rounded-lg p-6 text-center ${className}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <ApperIcon name="Clock" size={48} className="text-surface-300 mx-auto mb-4" />
        <Text size="lg" weight="medium" color="muted">
          No time tracked today
        </Text>
        <Text size="sm" color="light" className="mt-2">
          Start a timer to begin tracking your activities
        </Text>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`bg-white border border-surface-200 rounded-lg p-6 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <Text size="3xl" weight="bold" color="primary" variant="display">
          {formatDuration(summary.totalMinutes)}
        </Text>
        <Text color="muted" className="mt-1">
          Total time tracked today
        </Text>
      </div>

      {categoryData.length > 0 && (
        <div className="space-y-4">
          <Text weight="medium" color="default">
            Time by Category
          </Text>
          
          <div className="space-y-3">
            {categoryData.map((category, index) => (
              <motion.div
                key={category.name}
                className="flex items-center justify-between"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="flex items-center gap-2">
                    <ApperIcon name={category.icon} size={16} />
                    <Text size="sm" color="default">
                      {category.displayName}
                    </Text>
                  </div>
                </div>
                
                <div className="text-right">
                  <Text size="sm" weight="medium">
                    {formatDuration(category.minutes)}
                  </Text>
                  <Text size="xs" color="light">
                    {Math.round(category.percentage)}%
                  </Text>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Progress bars */}
          <div className="space-y-2 mt-4">
            {categoryData.map((category, index) => (
              <motion.div
                key={`bar-${category.name}`}
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
              >
                <div className="flex-1 bg-surface-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: category.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${category.percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DailySummaryCard;