import { SelectHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-[10px] font-mono uppercase tracking-[0.15em] text-nothing-grey-500 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref} id={inputId}
          className={clsx(
            'input-base appearance-none cursor-pointer',
            'bg-[url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%23525252%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")]',
            'bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10',
            error && 'border-nothing-red focus:border-nothing-red',
            className
          )}
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>
          ))}
        </select>
        {error && <p role="alert" className="mt-1.5 text-[10px] font-mono text-nothing-red">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
