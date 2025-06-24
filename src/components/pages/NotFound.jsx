import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Text from '@/components/atoms/Text';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ApperIcon 
            name="Clock" 
            size={96} 
            className="text-surface-300 mx-auto mb-6" 
          />
        </motion.div>
        
        <Text size="4xl" weight="bold" color="primary" className="mb-4">
          404
        </Text>
        
        <Text size="xl" weight="semibold" className="mb-2">
          Time not found
        </Text>
        
        <Text color="muted" className="mb-8">
          Looks like you've wandered off the clock. Let's get you back to tracking your time.
        </Text>
        
        <Button
          variant="primary"
          icon="Home"
          onClick={() => navigate('/')}
        >
          Back to TimeFlow
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;