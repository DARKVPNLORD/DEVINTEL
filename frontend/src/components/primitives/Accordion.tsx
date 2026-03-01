import { useState } from 'react';
import { clsx } from 'clsx';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
}

export function Accordion({ items, allowMultiple = false, defaultOpen = [] }: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

  const toggle = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="border border-nothing-grey-800 divide-y divide-nothing-grey-800 overflow-hidden">
      {items.map((item) => {
        const isOpen = openItems.has(item.id);
        return (
          <div key={item.id}>
            <button
              onClick={() => toggle(item.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-xs font-mono text-nothing-grey-300 hover:bg-nothing-grey-800/50 transition-colors"
              aria-expanded={isOpen} aria-controls={`accordion-${item.id}`}
            >
              {item.title}
              <svg className={clsx('w-4 h-4 transition-transform text-nothing-grey-600', isOpen && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen && (
              <div id={`accordion-${item.id}`} className="px-4 pb-4 text-xs font-mono text-nothing-grey-400 animate-slideDown" role="region">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
