import { useState, useRef } from 'react';
import { clsx } from 'clsx';
import { useClickOutside } from '../../hooks';

export interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  onSelect: (value: string) => void;
  align?: 'left' | 'right';
}

export function Dropdown({ trigger, items, onSelect, align = 'left' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setIsOpen(false));

  const handleSelect = (item: DropdownItem) => {
    if (item.disabled) return;
    onSelect(item.value);
    setIsOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">{trigger}</div>
      {isOpen && (
        <div
          className={clsx(
            'absolute z-40 mt-1 min-w-[180px] py-1 border shadow-lg',
            'bg-nothing-grey-900 border-nothing-grey-800',
            'animate-scale-in origin-top',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          role="menu"
        >
          {items.map((item) => (
            <button
              key={item.value}
              onClick={() => handleSelect(item)}
              disabled={item.disabled}
              className={clsx(
                'w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-left transition-colors',
                item.danger
                  ? 'text-nothing-red hover:bg-nothing-red/10'
                  : 'text-nothing-grey-300 hover:bg-nothing-grey-800 hover:text-nothing-white',
                item.disabled && 'opacity-50 cursor-not-allowed'
              )}
              role="menuitem"
            >
              {item.icon && <span className="w-4 h-4">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
