import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { useKeyDown } from '../../hooks';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, title, position = 'right', size = 'md', children }: DrawerProps) {
  useKeyDown('Escape', onClose, isOpen);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = { sm: 'w-72', md: 'w-96', lg: 'w-[480px]' };
  const positionClasses = position === 'right' ? 'right-0 animate-slideLeft' : 'left-0 animate-slideRight';

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className={clsx(
          'fixed top-0 bottom-0 bg-nothing-grey-900 border-l border-nothing-grey-800 shadow-2xl flex flex-col',
          sizes[size], positionClasses
        )}
        role="dialog" aria-modal="true" aria-label={title}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-nothing-grey-800">
          {title && <h2 className="text-sm font-mono font-bold text-nothing-white">{title}</h2>}
          <button onClick={onClose} className="p-1 text-nothing-grey-500 hover:text-nothing-white transition-colors" aria-label="Close">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
