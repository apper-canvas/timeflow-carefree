import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Text from '@/components/atoms/Text';
import Button from '@/components/atoms/Button';

const ErrorState = ({ 
  message = 'Something went wrong',
  onRetry,
  className = ''
}) => {
  return (
    <motion.div
      className={`text-center py-12 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ApperIcon 
        name="AlertCircle" 
        size={64} 
        className="text-red-300 mx-auto mb-4" 
      />
      
      <Text size="lg" weight="medium" color="error" className="mb-2">
        Oops! Something went wrong
      </Text>
      
      <Text size="sm" color="muted" className="mb-6 max-w-md mx-auto">
        {message}
      </Text>
      
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          icon="RefreshCw"
        >
          Try Again
        </Button>
      )}
    </motion.div>
  );
};

export default ErrorState;