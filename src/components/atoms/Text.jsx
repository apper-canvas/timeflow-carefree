const Text = ({ 
  children, 
  variant = 'body', 
  size = 'base', 
  weight = 'normal',
  color = 'default',
  className = '',
  as: Component = 'p',
  ...props 
}) => {
  const variants = {
    display: 'font-display',
    heading: 'font-heading',
    body: 'font-sans'
  };

  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl'
  };

  const weights = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const colors = {
    default: 'text-surface-900',
    muted: 'text-surface-600',
    light: 'text-surface-500',
    white: 'text-white',
    primary: 'text-primary-600',
    accent: 'text-accent-500',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  };

  const classes = `${variants[variant]} ${sizes[size]} ${weights[weight]} ${colors[color]} ${className}`;

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

export default Text;