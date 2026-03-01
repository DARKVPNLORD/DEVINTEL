import { clsx } from 'clsx';

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
}

export function Table<T extends Record<string, any>>({
  columns, data, keyExtractor, emptyMessage = 'No data available', isLoading, onRowClick,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="border border-nothing-grey-800 overflow-hidden">
        <div className="animate-pulse">
          <div className="h-10 bg-nothing-grey-800/50" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 border-t border-nothing-grey-800 flex items-center px-4 gap-4">
              {columns.map((_, ci) => (<div key={ci} className="h-3 bg-nothing-grey-800 flex-1" />))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-nothing-grey-800 overflow-hidden overflow-x-auto">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="border-b border-nothing-grey-800 bg-nothing-grey-900/50">
            {columns.map((col) => (
              <th key={col.key}
                className={clsx(
                  'px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-nothing-grey-500 font-medium',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right',
                  !col.align && 'text-left'
                )}
                style={{ width: col.width }}
              >{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-nothing-grey-500">{emptyMessage}</td></tr>
          ) : (
            data.map((row) => (
              <tr key={keyExtractor(row)} onClick={() => onRowClick?.(row)}
                className={clsx(
                  'border-b border-nothing-grey-800/50 last:border-0',
                  'hover:bg-nothing-grey-800/30 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col) => (
                  <td key={col.key}
                    className={clsx('px-4 py-3 text-nothing-grey-300',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right'
                    )}
                  >{col.render ? col.render(row) : row[col.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
