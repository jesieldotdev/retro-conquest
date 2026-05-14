import { useState, type ReactNode } from 'react';
import { Menu, Trophy } from 'lucide-react';
import { Sidebar } from './Sidebar';

export function Layout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-ra-darker">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-ra-dark border-b border-ra-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-ra-card border border-ra-border text-ra-text hover:text-white hover:border-ra-accent/40 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-ra-accent/20 border border-ra-accent/30 flex items-center justify-center">
              <Trophy className="w-3.5 h-3.5 text-ra-gold" />
            </div>
            <span className="text-white font-bold text-sm">RetroConquest</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
