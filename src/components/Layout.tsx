import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useProgress } from '../store/progress';
import { Menu, X } from 'lucide-react';

export function Layout() {
  const { sidebarOpen, toggleSidebar } = useProgress();

  return (
    <div className="flex h-screen overflow-hidden bg-void">
      {/* Mobile sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-50 rounded-lg bg-surface-light/90 p-2 backdrop-blur
                   text-slate-400 hover:text-white transition-colors lg:hidden"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-out
                    lg:relative lg:translate-x-0 ${
                      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
      >
        <Sidebar />
      </div>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
