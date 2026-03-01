import { useAuthStore } from '../../context/auth.store';
import { clsx } from 'clsx';

interface NavbarProps {
  sidebarCollapsed: boolean;
}

export function Navbar({ sidebarCollapsed }: NavbarProps) {
  const { user } = useAuthStore();

  return (
    <header
      className={clsx(
        'fixed top-0 right-0 h-14 z-30 flex items-center justify-between px-8',
        'bg-nothing-black/90 backdrop-blur-sm',
        'border-b border-nothing-grey-800',
        'transition-all duration-500 ease-out',
        sidebarCollapsed ? 'left-16' : 'left-56'
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-[13px] text-nothing-grey-400 font-mono">
          {user?.display_name || user?.username || 'user'}
        </span>
        <span className="w-1 h-1 bg-nothing-grey-700" />
        <span className="text-[13px] text-nothing-grey-600 font-mono">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1 border border-nothing-grey-800">
          <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono text-nothing-grey-500 uppercase tracking-wider">Online</span>
        </div>
      </div>
    </header>
  );
}
