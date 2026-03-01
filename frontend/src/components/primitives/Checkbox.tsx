import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <label htmlFor={inputId} className={clsx('flex items-start gap-3 cursor-pointer group', className)}>
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-surface-300 dark:border-surface-600
                     text-brand-600 focus:ring-2 focus:ring-brand-500/20 cursor-pointer
                     bg-white dark:bg-surface-800 transition-colors"
          {...props}
        />
        {(label || description) && (
          <div>
            {label && (
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300 group-hover:text-surface-900 dark:group-hover:text-surface-100">
                {label}
              </span>
            )}
            {description && (
              <p className="text-xs text-surface-500 mt-0.5">{description}</p>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// Radio
export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, className, id, ...props }, ref) => {
    const inputId = id || `radio-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <label htmlFor={inputId} className={clsx('flex items-center gap-3 cursor-pointer group', className)}>
        <input
          ref={ref}
          id={inputId}
          type="radio"
          className="h-4 w-4 border-surface-300 dark:border-surface-600 text-brand-600
                     focus:ring-2 focus:ring-brand-500/20 cursor-pointer
                     bg-white dark:bg-surface-800 transition-colors"
          {...props}
        />
        {label && (
          <span className="text-sm font-medium text-surface-700 dark:text-surface-300 group-hover:text-surface-900 dark:group-hover:text-surface-100">
            {label}
          </span>
        )}
      </label>
    );
  }
);

Radio.displayName = 'Radio';
