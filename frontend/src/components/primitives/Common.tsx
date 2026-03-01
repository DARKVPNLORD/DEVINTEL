import { clsx } from 'clsx';

// ============================================================
// BADGE — Nothing-style: minimal, uppercase, sharp
// ============================================================
export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const variants = {
    default: 'border-nothing-grey-600 text-nothing-grey-300',
    success: 'border-emerald-500/40 text-emerald-400',
    warning: 'border-yellow-500/40 text-yellow-400',
    danger: 'border-nothing-red/40 text-nothing-red',
    info: 'border-nothing-red/40 text-nothing-red',
    brand: 'border-nothing-red/40 text-nothing-red',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-3 py-1',
  };

  return (
    <span className={clsx(
      'inline-flex items-center font-mono font-medium uppercase tracking-wider border',
      variants[variant],
      sizes[size]
    )}>
      {children}
    </span>
  );
}

// ============================================================
// AVATAR — Nothing-style: geometric, sharp borders
// ============================================================
export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Avatar({ src, alt, name, size = 'md' }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-base',
  };

  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={clsx('object-cover border border-nothing-grey-700', sizes[size])}
      />
    );
  }

  return (
    <div
      className={clsx(
        'flex items-center justify-center font-mono font-bold',
        'bg-nothing-grey-800 border border-nothing-grey-700 text-nothing-grey-300',
        sizes[size]
      )}
      aria-label={name || 'Avatar'}
    >
      {initials || '?'}
    </div>
  );
}

// ============================================================
// CARD — Nothing-style: sharp edges, subtle border, dark
// ============================================================
export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export function Card({ children, className, padding = 'md', hoverable }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div className={clsx(
      hoverable ? 'card-hover' : 'card',
      paddings[padding],
      className
    )}>
      {children}
    </div>
  );
}

// ============================================================
// SPINNER — Nothing-style: minimal dot-circle
// ============================================================
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };

  return (
    <div className={clsx('relative', sizes[size], className)} role="status" aria-label="Loading">
      <div className="absolute inset-0 border border-nothing-grey-700 animate-spin" style={{ animationDuration: '1.2s' }}>
        <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-1 h-1 bg-nothing-red" />
      </div>
    </div>
  );
}

// ============================================================
// SKELETON — Nothing-style: subtle pulse, sharp
// ============================================================
export interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

export function Skeleton({ width, height = '1rem', className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-nothing-grey-800',
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
