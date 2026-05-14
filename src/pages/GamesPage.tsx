import { useState, useMemo } from 'react';
import { Search, CheckCircle2, Clock, Gamepad2, ChevronRight, Zap, Star, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRecentlyPlayed } from '../hooks/useRA';
import { getImageUrl } from '../api/ra';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ProgressRing } from '../components/ui/ProgressRing';
import { clsx } from 'clsx';

type FilterType = 'all' | 'completed' | 'in-progress' | 'hardcore';

export function GamesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<'recent' | 'pct' | 'title'>('recent');

  const { data: recentGames, isLoading, isError } = useRecentlyPlayed(100);

  const allGames = useMemo(() => recentGames ?? [], [recentGames]);

  const filtered = useMemo(() => {
    let games = [...allGames];
    if (search) {
      const q = search.toLowerCase();
      games = games.filter(g =>
        g.Title.toLowerCase().includes(q) || g.ConsoleName.toLowerCase().includes(q)
      );
    }
    if (filter === 'completed') {
      games = games.filter(g => Number(g.NumAchieved) === Number(g.NumPossibleAchievements) && Number(g.NumPossibleAchievements) > 0);
    } else if (filter === 'in-progress') {
      games = games.filter(g => Number(g.NumAchieved) > 0 && Number(g.NumAchieved) < Number(g.NumPossibleAchievements));
    } else if (filter === 'hardcore') {
      games = games.filter(g => Number(g.NumAchievedHardcore) > 0);
    }
    if (sort === 'pct') {
      games.sort((a, b) => {
        const pa = Number(a.NumPossibleAchievements) ? Number(a.NumAchieved) / Number(a.NumPossibleAchievements) : 0;
        const pb = Number(b.NumPossibleAchievements) ? Number(b.NumAchieved) / Number(b.NumPossibleAchievements) : 0;
        return pb - pa;
      });
    } else if (sort === 'title') {
      games.sort((a, b) => a.Title.localeCompare(b.Title));
    }
    return games;
  }, [allGames, search, filter, sort]);

  const stats = useMemo(() => {
    if (!allGames.length) return null;
    return {
      total: allGames.length,
      mastered: allGames.filter(g => Number(g.NumAchieved) === Number(g.NumPossibleAchievements) && Number(g.NumPossibleAchievements) > 0).length,
      inProg: allGames.filter(g => Number(g.NumAchieved) > 0 && Number(g.NumAchieved) < Number(g.NumPossibleAchievements)).length,
      hc: allGames.filter(g => Number(g.NumAchievedHardcore) > 0).length,
    };
  }, [allGames]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-ra-accent" />
          My Games
        </h1>
        <p className="text-ra-text text-sm mt-1">Track your progress across all games</p>
      </div>

      {isError && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-ra-red/10 border border-ra-red/30 text-ra-red text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Failed to load games. Check your credentials.
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, icon: Gamepad2, color: 'text-ra-accent' },
            { label: 'Mastered', value: stats.mastered, icon: CheckCircle2, color: 'text-ra-green' },
            { label: 'In Progress', value: stats.inProg, icon: Clock, color: 'text-ra-gold' },
            { label: 'Hardcore', value: stats.hc, icon: Zap, color: 'text-ra-purple' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass-card p-3 sm:p-4 flex items-center gap-3">
              <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
              <div>
                <div className="text-white font-bold text-lg sm:text-xl">{value}</div>
                <div className="text-ra-text text-xs">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ra-text/50" />
          <input
            type="text"
            placeholder="Search games..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-ra-card border border-ra-border rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-ra-text/40 focus:outline-none focus:border-ra-accent/60 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 bg-ra-card border border-ra-border rounded-xl p-1 overflow-x-auto scrollbar-hide">
            {(['all', 'completed', 'in-progress', 'hardcore'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                  filter === f ? 'bg-ra-accent text-white' : 'text-ra-text hover:text-white hover:bg-ra-border/60'
                )}
              >
                {f.replace('-', ' ')}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as any)}
            className="bg-ra-card border border-ra-border rounded-xl px-3 py-2 text-ra-text text-sm focus:outline-none focus:border-ra-accent/60 flex-shrink-0"
          >
            <option value="recent">Recent</option>
            <option value="pct">% Done</option>
            <option value="title">A-Z</option>
          </select>
        </div>
      </div>

      {/* Games grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(game => {
            const numAchieved = Number(game.NumAchieved ?? 0);
            const numPossible = Number(game.NumPossibleAchievements ?? 0);
            const numHardcore = Number(game.NumAchievedHardcore ?? 0);
            const pct = numPossible ? Math.round((numAchieved / numPossible) * 100) : 0;
            const hcPct = numPossible ? Math.round((numHardcore / numPossible) * 100) : 0;
            const mastered = pct === 100;

            return (
              <Link
                key={game.GameID}
                to={`/games/${game.GameID}`}
                className={clsx('glass-card-hover p-3 sm:p-4 flex gap-3 game-card-hover', mastered && 'border-ra-green/30')}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={getImageUrl(game.ImageIcon)}
                    alt={game.Title}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-ra-border"
                    onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${game.Title[0]}&background=141628&color=4F6EF7&size=64`; }}
                  />
                  {mastered && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-ra-green rounded-full flex items-center justify-center shadow-glow-green">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <div className="text-white text-sm font-semibold truncate">{game.Title}</div>
                    <ChevronRight className="w-4 h-4 text-ra-text/30 flex-shrink-0 mt-0.5" />
                  </div>
                  <div className="text-ra-text text-xs mb-2">{game.ConsoleName}</div>
                  <div className="flex items-center gap-2">
                    <ProgressRing value={pct} size={30} strokeWidth={3} color={mastered ? '#22C55E' : '#4F6EF7'} label={`${pct}%`} />
                    <div className="flex-1">
                      <div className="text-xs text-ra-text mb-1">
                        {numAchieved}/{numPossible}
                        {hcPct > 0 && <span className="text-ra-gold ml-1.5">{hcPct}% HC</span>}
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill bg-ra-accent" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {mastered && <Badge variant="green"><Star className="w-2.5 h-2.5" />Mastered</Badge>}
                    {hcPct === 100 && <Badge variant="gold"><Zap className="w-2.5 h-2.5" />HC</Badge>}
                  </div>
                </div>
              </Link>
            );
          })}
          {!filtered.length && !isLoading && (
            <div className="col-span-full text-center py-12 text-ra-text">
              <Gamepad2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No games found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
