import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Text from '@/components/atoms/Text';
import Button from '@/components/atoms/Button';

const EmptyState = ({ 
  icon = 'Clock',
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <motion.div
      className={`text-center py-12 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <ApperIcon 
          name={icon} 
          size={64} 
          className="text-surface-300 mx-auto mb-4" 
        />
      </motion.div>
      
      <Text size="lg" weight="medium" color="muted" className="mb-2">
        {title}
      </Text>
      
      {description && (
        <Text size="sm" color="light" className="mb-6 max-w-md mx-auto">
          {description}
        </Text>
      )}
      
      {actionLabel && onAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Button
            variant="primary"
            onClick={onAction}
            icon="Plus"
          >
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;