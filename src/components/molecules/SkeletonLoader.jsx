import { motion } from 'framer-motion';

const SkeletonLoader = ({ count = 3, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {[...Array(count)].map((_, index) => (
        <motion.div
          key={index}
          className="bg-white border border-surface-200 rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <div className="animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-surface-200 rounded-full" />
              <div className="h-4 bg-surface-200 rounded w-3/4" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-3 bg-surface-200 rounded w-24" />
              <div className="h-3 bg-surface-200 rounded w-16" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SkeletonLoader;