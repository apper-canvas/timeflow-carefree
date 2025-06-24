import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Text from '@/components/atoms/Text';
import Button from '@/components/atoms/Button';

const TimeEntryCard = ({ 
  entry, 
  category, 
  onEdit, 
  onDelete,
  className = '' 
}) => {
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTime = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  return (
    <motion.div
      className={`bg-white border border-surface-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: category?.color || '#6B7280' }}
            />
            <Text 
              weight="medium" 
              className="truncate"
            >
              {entry.activityName}
            </Text>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-surface-500">
            <div className="flex items-center gap-1">
              <ApperIcon name="Clock" size={14} />
              <span>
                {formatTime(entry.startTime)} - {entry.endTime ? formatTime(entry.endTime) : 'Now'}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <ApperIcon name="Timer" size={14} />
              <span className="font-medium text-surface-700">
                {formatDuration(entry.duration)}
              </span>
            </div>
          </div>
          
          {category && (
            <div className="flex items-center gap-1 mt-2">
              <ApperIcon name={category.icon} size={14} />
              <Text size="sm" color="muted">
                {category.displayName}
              </Text>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 ml-4">
          <Button
            variant="ghost"
            size="sm"
            icon="Edit"
            onClick={() => onEdit(entry)}
            className="text-surface-400 hover:text-surface-600"
          />
          <Button
            variant="ghost"
            size="sm"
            icon="Trash2"
            onClick={() => onDelete(entry)}
            className="text-surface-400 hover:text-red-600"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TimeEntryCard;