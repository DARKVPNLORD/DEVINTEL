import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, className, children, disabled, ...rest }, ref) => {
    const { ...props } = rest;

    const variants = {
      primary: 'bg-nothing-white text-nothing-black hover:bg-nothing-grey-200 active:bg-nothing-grey-300',
      secondary: 'bg-nothing-grey-800 text-nothing-grey-200 border border-nothing-grey-700 hover:bg-nothing-grey-700 hover:text-nothing-white',
      ghost: 'text-nothing-grey-400 hover:text-nothing-white hover:bg-nothing-grey-800',
      danger: 'bg-nothing-red text-white hover:bg-red-700 active:bg-red-800',
      outline: 'border border-nothing-grey-600 text-nothing-grey-300 hover:border-nothing-white hover:text-nothing-white',
    };

    const sizes = {
      sm: 'h-8 px-3 text-[11px]',
      md: 'h-10 px-5 text-sm',
      lg: 'h-12 px-7 text-sm',
    };

    return (
      <button
        ref={ref}
        className={clsx('btn-base font-medium tracking-wide uppercase', variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="w-4 h-4 border border-current border-t-transparent animate-spin" />
        ) : leftIcon}
        {children}
        {rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
