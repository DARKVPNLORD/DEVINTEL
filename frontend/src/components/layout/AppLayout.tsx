import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { clsx } from 'clsx';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useMediaQuery } from '../../hooks';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-nothing-black">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
      <Navbar sidebarCollapsed={collapsed} />

      <main
        className={clsx(
          'pt-14 min-h-screen transition-all duration-500 ease-out',
          collapsed ? 'pl-16' : 'pl-56'
        )}
      >
        <div className="p-8 max-w-[1400px] mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
