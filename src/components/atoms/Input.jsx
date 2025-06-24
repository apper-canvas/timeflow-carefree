import { forwardRef } from 'react';

const Input = forwardRef(({ 
  label,
  error,
  hint,
  type = 'text',
  className = '',
  required = false,
  ...props 
}, ref) => {
  const inputClasses = `
    w-full px-3 py-2 border rounded-lg text-sm
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
    transition-colors duration-150
    ${error 
      ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-400' 
      : 'border-surface-300 bg-white text-surface-900 placeholder-surface-400 hover:border-surface-400'
    }
    ${className}
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-surface-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {hint && !error && (
        <p className="text-sm text-surface-500">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;