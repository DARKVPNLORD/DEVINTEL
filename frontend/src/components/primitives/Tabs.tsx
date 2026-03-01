import { useState } from 'react';
import { clsx } from 'clsx';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  onChange?: (id: string) => void;
  variant?: 'line' | 'pill';
}

export function Tabs({ items, defaultTab, onChange, variant = 'line' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id);

  const handleTabChange = (id: string) => { setActiveTab(id); onChange?.(id); };

  const activeContent = items.find((item) => item.id === activeTab)?.content;

  return (
    <div>
      <div className={clsx('flex gap-0', variant === 'line' && 'border-b border-nothing-grey-800')} role="tablist">
        {items.map((item) => (
          <button
            key={item.id} role="tab"
            aria-selected={activeTab === item.id}
            aria-controls={`tabpanel-${item.id}`}
            disabled={item.disabled}
            onClick={() => handleTabChange(item.id)}
            className={clsx(
              'inline-flex items-center gap-2 px-4 py-2.5 text-[10px] font-mono uppercase tracking-[0.15em] transition-all',
              item.disabled && 'opacity-50 cursor-not-allowed',
              variant === 'line' && [
                '-mb-px border-b-2',
                activeTab === item.id ? 'border-nothing-red text-nothing-white' : 'border-transparent text-nothing-grey-500 hover:text-nothing-grey-300',
              ],
              variant === 'pill' && [
                activeTab === item.id ? 'bg-nothing-white text-nothing-black' : 'text-nothing-grey-500 hover:bg-nothing-grey-800',
              ]
            )}
          >
            {item.icon}{item.label}
          </button>
        ))}
      </div>
      <div id={`tabpanel-${activeTab}`} role="tabpanel" className="mt-4 animate-fade-in">{activeContent}</div>
    </div>
  );
}
