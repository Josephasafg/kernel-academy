import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useProgress } from '../store/progress';
import { Menu, X } from 'lucide-react';

export function Layout() {
  const { sidebarOpen, toggleSidebar } = useProgress();

  return (
    <div className="flex h-screen overflow-hidden bg-wine">
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-50 border border-wine-glow/50 bg-wine-deep/90 p-2
                   text-parchment-dim transition-colors hover:text-parchment lg:hidden"
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <div
        className={`fixed inset-y-0 left-0 z-40 w-[288px] transform transition-transform duration-300 ease-out
                    lg:relative lg:translate-x-0 ${
                      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
      >
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-wine-deep/80 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
