import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  iconPosition = 'left',
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
    secondary: 'bg-primary-100 hover:bg-primary-200 text-primary-700 focus:ring-primary-500',
    accent: 'bg-accent-500 hover:bg-accent-600 text-white focus:ring-accent-400',
    outline: 'border border-surface-300 bg-white hover:bg-surface-50 text-surface-700 focus:ring-primary-500',
    ghost: 'text-surface-600 hover:text-surface-900 hover:bg-surface-100 focus:ring-primary-500',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : 'cursor-pointer';

  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`;

  const renderIcon = () => {
    if (!icon) return null;
    const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : size === 'xl' ? 24 : 18;
    return <ApperIcon name={icon} size={iconSize} />;
  };

  const content = (
    <>
      {icon && iconPosition === 'left' && (
        <span className={children ? 'mr-2' : ''}>
          {renderIcon()}
        </span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className={children ? 'ml-2' : ''}>
          {renderIcon()}
        </span>
      )}
    </>
  );

  if (disabled) {
    return (
      <button
        type={type}
        disabled
        className={buttonClasses}
        {...props}
      >
        {content}
      </button>
    );
  }

  return (
    <motion.button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {content}
    </motion.button>
  );
};

export default Button;