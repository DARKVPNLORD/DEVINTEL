import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftAddon, rightAddon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-[11px] font-mono uppercase tracking-widest text-nothing-grey-400 mb-2">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftAddon && (
            <span className="absolute left-4 text-nothing-grey-500 pointer-events-none">
              {leftAddon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'input-base',
              leftAddon && 'pl-11',
              rightAddon && 'pr-11',
              error && 'border-nothing-red focus:border-nothing-red',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightAddon && (
            <span className="absolute right-4 text-nothing-grey-500">
              {rightAddon}
            </span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-[11px] text-nothing-red font-mono">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-[11px] text-nothing-grey-500 font-mono">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
