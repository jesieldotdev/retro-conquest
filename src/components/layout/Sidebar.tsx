import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Gamepad2, Trophy, Star, BarChart3,
  Users, LogOut, Trophy as TrophyIcon, Flame, ChevronRight, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUserSummary } from '../../hooks/useRA';
import { getUserAvatarUrl } from '../../api/ra';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/games', icon: Gamepad2, label: 'Games' },
  { to: '/achievements', icon: Trophy, label: 'Achievements' },
  { to: '/progress', icon: BarChart3, label: 'Progress' },
  { to: '/leaderboard', icon: Users, label: 'Leaderboard' },
  { to: '/aotw', icon: Star, label: 'Ach. of Week' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const { username, logout } = useAuth();
  const { data: summary } = useUserSummary();

  const handleNav = () => {
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={clsx(
        'fixed top-0 left-0 h-full w-64 flex flex-col bg-ra-dark z-40 transition-transform duration-300',
        'lg:relative lg:translate-x-0 lg:z-auto',
        open ? 'translate-x-0' : '-translate-x-full',
      )}>
        {/* Logo */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-ra-accent/20 border border-ra-accent/30 flex items-center justify-center flex-shrink-0">
              <TrophyIcon className="w-5 h-5 text-ra-gold" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-none">RetroConquest</div>
              <div className="text-ra-text text-xs mt-0.5">RA Dashboard</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-ra-border/60 text-ra-text hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User info */}
        {summary && (() => {
          const hc = summary.TotalPoints ?? 0;
          const sc = summary.TotalSoftcorePoints ?? 0;
          const points = hc > 0 ? hc : sc;
          const isHc = hc > 0;
          return (
            <div className="p-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-ra-card">
                <div className="relative flex-shrink-0">
                  <img
                    src={getUserAvatarUrl(username)}
                    alt={username}
                    className="w-10 h-10 rounded-xl object-cover border border-ra-border"
                    onError={e => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${username}&background=4F6EF7&color=fff`;
                    }}
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-ra-green rounded-full border-2 border-ra-dark" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold truncate">{username}</div>
                  <div className={clsx('flex items-center gap-1 text-xs', isHc ? 'text-ra-gold' : 'text-ra-text')}>
                    <Flame className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{points.toLocaleString()} {isHc ? 'pts' : 'SC pts'}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-ra-text/40 flex-shrink-0" />
              </div>
            </div>
          );
        })()}

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={handleNav}
              className={clsx('nav-item', location.pathname === to && 'active')}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3">
          <button
            onClick={logout}
            className="nav-item w-full text-ra-red/70 hover:text-ra-red hover:bg-ra-red/10"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
