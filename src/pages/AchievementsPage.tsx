import { useState, useMemo } from 'react';
import { Search, Trophy, Zap, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRecentAchievements } from '../hooks/useRA';
import { getBadgeUrl } from '../api/ra';
import { Skeleton } from '../components/ui/Skeleton';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';

type HcFilter = 'all' | 'hardcore' | 'softcore';

export function AchievementsPage() {
  const [search, setSearch] = useState('');
  const [filterHc, setFilterHc] = useState<HcFilter>('all');
  const { data: achievements, isLoading, isError } = useRecentAchievements(60 * 24 * 30);

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

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {[...Array(10)].map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {filtered.map((ach, idx) => (
              <div
                key={`${ach.AchievementID}-${idx}`}
                className="glass-card-hover overflow-hidden flex flex-col group"
              >
                <div className="relative aspect-square bg-ra-darker overflow-hidden">
                  <img
                    src={getBadgeUrl(ach.BadgeName)}
                    alt={ach.Title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={e => {
                      const img = e.target as HTMLImageElement;
                      img.onerror = null;
                      img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ach.Title[0] || '?')}&background=141628&color=A855F7&size=128`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ra-darker via-transparent to-transparent" />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-ra-darker/80 backdrop-blur-sm rounded-lg px-2 py-1 border border-ra-border/60">
                    <Trophy className="w-3 h-3 text-ra-gold" />
                    <span className="text-ra-gold font-bold text-xs">{ach.Points}</span>
                  </div>
                  {ach.HardcoreMode === 1 ? (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-ra-gold/90 rounded-lg px-1.5 py-0.5 shadow-glow-gold">
                      <Zap className="w-3 h-3 text-ra-darker" />
                      <span className="text-ra-darker font-bold text-[10px]">HC</span>
                    </div>
                  ) : (
                    <div className="absolute top-2 left-2 bg-ra-border/80 backdrop-blur-sm rounded-lg px-1.5 py-0.5 border border-ra-border/60">
                      <span className="text-ra-text font-bold text-[10px]">SC</span>
                    </div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <div className="text-white text-sm font-semibold line-clamp-1" title={ach.Title}>{ach.Title}</div>
                  <div className="text-ra-text text-xs mt-1 line-clamp-2 flex-1" title={ach.Description}>{ach.Description}</div>
                  <div className="mt-2 pt-2 border-t border-ra-border/40">
                    <div className="text-ra-text text-xs line-clamp-1" title={ach.GameTitle}>{ach.GameTitle}</div>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className="text-ra-text/60 text-[10px] line-clamp-1">{ach.ConsoleName}</span>
                      {ach.Date && (
                        <span className="text-ra-text/60 text-[10px] flex-shrink-0">
                          {formatDistanceToNow(new Date(ach.Date), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {!filtered.length && (
            <div className="text-center py-12 text-ra-text">
              <Lock className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No achievements found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
