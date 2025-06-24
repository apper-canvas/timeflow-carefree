import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const CategoryPill = ({ 
  category, 
  isSelected = false, 
  onClick,
  size = 'md'
}) => {
  const sizes = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  return (
    <motion.button
      className={`
        inline-flex items-center gap-2 rounded-full font-medium transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        ${sizes[size]}
        ${isSelected 
          ? 'text-white shadow-md' 
          : 'text-surface-700 bg-white border border-surface-200 hover:bg-surface-50'
        }
      `}
      style={{
        backgroundColor: isSelected ? category.color : undefined,
        borderColor: isSelected ? category.color : undefined
      }}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      <ApperIcon 
        name={category.icon} 
        size={iconSizes[size]} 
      />
      <span>{category.displayName}</span>
    </motion.button>
  );
};

export default CategoryPill;