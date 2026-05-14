import { useState, useMemo } from 'react';
import { Search, Trophy, Zap, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRecentAchievements } from '../hooks/useRA';
import { getBadgeUrl } from '../api/ra';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';

type HcFilter = 'all' | 'hardcore' | 'softcore';

export function AchievementsPage() {
  const [search, setSearch] = useState('');
  const [filterHc, setFilterHc] = useState<HcFilter>('all');
  const { data: achievements, isLoading, isError } = useRecentAchievements(200);

  const filtered = useMemo(() => {
    if (!achievements) return [];
    let list = [...achievements];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.Title.toLowerCase().includes(q) ||
        a.GameTitle.toLowerCase().includes(q) ||
        a.Description.toLowerCase().includes(q)
      );
    }
    if (filterHc === 'hardcore') list = list.filter(a => a.HardcoreMode === 1);
    if (filterHc === 'softcore') list = list.filter(a => a.HardcoreMode === 0);
    return list;
  }, [achievements, search, filterHc]);

  const totalPoints = useMemo(() => filtered.reduce((s, a) => s + a.Points, 0), [filtered]);
  const hcCount = useMemo(() => filtered.filter(a => a.HardcoreMode === 1).length, [filtered]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-ra-gold" />
          Achievements
        </h1>
        <p className="text-ra-text text-sm mt-1">Your recent achievement unlocks</p>
      </div>

      {isError && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-ra-red/10 border border-ra-red/30 text-ra-red text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Failed to load achievements. Check your credentials.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-ra-green flex-shrink-0" />
          <div>
            <div className="text-white font-bold text-lg sm:text-xl">{filtered.length}</div>
            <div className="text-ra-text text-xs">Unlocked</div>
          </div>
        </div>
        <div className="glass-card p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-ra-gold flex-shrink-0" />
          <div>
            <div className="text-white font-bold text-lg sm:text-xl">{totalPoints.toLocaleString()}</div>
            <div className="text-ra-text text-xs">Points</div>
          </div>
        </div>
        <div className="glass-card p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-ra-purple flex-shrink-0" />
          <div>
            <div className="text-white font-bold text-lg sm:text-xl">{hcCount}</div>
            <div className="text-ra-text text-xs">Hardcore</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ra-text/50" />
          <input
            type="text"
            placeholder="Search achievements or games..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-ra-card border border-ra-border rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-ra-text/40 focus:outline-none focus:border-ra-accent/60 text-sm"
          />
        </div>
        <div className="flex items-center gap-1 bg-ra-card border border-ra-border rounded-xl p-1 self-start">
          {(['all', 'hardcore', 'softcore'] as HcFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilterHc(f)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize',
                filterHc === f ? 'bg-ra-accent text-white' : 'text-ra-text hover:text-white hover:bg-ra-border/60'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">{[...Array(10)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((ach, idx) => (
            <div
              key={`${ach.AchievementID}-${idx}`}
              className="glass-card-hover flex items-center gap-3 p-3 sm:p-4"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={ach.BadgeURL || getBadgeUrl(ach.BadgeName)}
                  alt={ach.Title}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-ra-border"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                {ach.HardcoreMode === 1 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-ra-gold rounded-full flex items-center justify-center shadow-glow-gold">
                    <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-ra-darker" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-white text-sm font-semibold line-clamp-1">{ach.Title}</div>
                    <div className="text-ra-text text-xs mt-0.5 line-clamp-1 hidden sm:block">{ach.Description}</div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-ra-gold font-bold text-sm">+{ach.Points}</div>
                    <div className="text-ra-text/50 text-xs">pts</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-ra-text text-xs truncate max-w-32 sm:max-w-none">{ach.GameTitle}</span>
                  <span className="text-ra-text/40 text-xs hidden sm:inline">•</span>
                  <span className="text-ra-text text-xs hidden sm:inline">{ach.ConsoleName}</span>
                  <span className="text-ra-text/40 text-xs">•</span>
                  {ach.Date && (
                    <span className="text-ra-text/60 text-xs">
                      {formatDistanceToNow(new Date(ach.Date), { addSuffix: true })}
                    </span>
                  )}
                  {ach.HardcoreMode === 1
                    ? <Badge variant="gold"><Zap className="w-2.5 h-2.5" />HC</Badge>
                    : <Badge variant="gray">SC</Badge>
                  }
                </div>
              </div>
            </div>
          ))}
          {!filtered.length && (
            <div className="text-center py-12 text-ra-text">
              <Lock className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No achievements found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
