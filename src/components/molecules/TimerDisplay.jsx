import { motion } from 'framer-motion';
import Text from '@/components/atoms/Text';

const TimerDisplay = ({ 
  time, 
  isActive = false, 
  activityName = '',
  className = '' 
}) => {
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const secs = Math.floor((time % 1) * 60);
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      className={`text-center ${className}`}
      animate={isActive ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
    >
      <Text
        variant="display"
        size="6xl"
        weight="bold"
        color={isActive ? 'accent' : 'default'}
        className="tabular-nums leading-none"
      >
        {formatTime(time)}
      </Text>
      
      {activityName && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <Text
            size="lg"
            color="muted"
            className="truncate max-w-md mx-auto"
          >
            {activityName}
          </Text>
        </motion.div>
      )}
      
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2"
        >
          <div className="flex items-center justify-center gap-2">
            <motion.div
              className="w-2 h-2 bg-accent-500 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <Text size="sm" color="accent" weight="medium">
              Recording
            </Text>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TimerDisplay;