import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { useKeyDown } from '../../hooks';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnOverlay?: boolean;
}

export function Modal({
  isOpen, onClose, title, description, size = 'md', children, footer, closeOnOverlay = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useKeyDown('Escape', onClose, isOpen);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      contentRef.current?.focus();
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => { if (closeOnOverlay && e.target === overlayRef.current) onClose(); },
    [closeOnOverlay, onClose]
  );

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
      role="dialog" aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-desc' : undefined}
    >
      <div
        ref={contentRef} tabIndex={-1}
        className={clsx(
          'w-full bg-nothing-grey-900 border border-nothing-grey-800 shadow-2xl animate-scale-in',
          'max-h-[90vh] flex flex-col', sizes[size]
        )}
      >
        {(title || description) && (
          <div className="px-6 pt-6 pb-4 border-b border-nothing-grey-800 relative">
            {title && <h2 id="modal-title" className="text-sm font-mono font-bold text-nothing-white">{title}</h2>}
            {description && <p id="modal-desc" className="mt-1 text-xs font-mono text-nothing-grey-500">{description}</p>}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 text-nothing-grey-500 hover:text-nothing-white transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-nothing-grey-800 flex justify-end gap-3">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
}
