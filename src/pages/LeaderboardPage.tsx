import { useMemo, useState } from 'react';
import { Crown, Medal, Trophy, TrendingUp, Users, AlertCircle, Gamepad2, Globe } from 'lucide-react';
import { useTopTenUsers, useUserRank, useRecentlyPlayed, useGameRank } from '../hooks/useRA';
import { useAuth } from '../context/AuthContext';
import { getUserAvatarUrl, getImageUrl } from '../api/ra';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';

const rankConfig: Record<number, { icon: React.ElementType; color: string; bg: string }> = {
  1: { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-400/15 border-yellow-400/30' },
  2: { icon: Medal, color: 'text-slate-300', bg: 'bg-slate-300/15 border-slate-300/30' },
  3: { icon: Medal, color: 'text-amber-600', bg: 'bg-amber-600/15 border-amber-600/30' },
};

type Tab = 'global' | 'game';

export function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>('global');
  const { data: topTen, isLoading, isError } = useTopTenUsers();
  const { data: userRank } = useUserRank();
  const { data: recentGames } = useRecentlyPlayed(50);
  const { username } = useAuth();

  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [gameSearch, setGameSearch] = useState('');

  const gameOptions = useMemo(() => {
    if (!recentGames) return [];
    const q = gameSearch.trim().toLowerCase();
    return q ? recentGames.filter(g => g.Title.toLowerCase().includes(q)) : recentGames;
  }, [recentGames, gameSearch]);

  const selectedGame = recentGames?.find(g => g.GameID === selectedGameId) ?? null;
  const { data: gameRank, isLoading: gameRankLoading, isError: gameRankError } = useGameRank(selectedGameId);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-ra-accent" />
          Leaderboard
        </h1>
        <p className="text-ra-text text-sm mt-1">Top RetroAchievements players</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-ra-card border border-ra-border rounded-xl p-1 self-start w-fit">
        <button
          onClick={() => setTab('global')}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            tab === 'global' ? 'bg-ra-accent text-white' : 'text-ra-text hover:text-white hover:bg-ra-border/60',
          )}
        >
          <Globe className="w-3.5 h-3.5" /> Global
        </button>
        <button
          onClick={() => setTab('game')}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            tab === 'game' ? 'bg-ra-accent text-white' : 'text-ra-text hover:text-white hover:bg-ra-border/60',
          )}
        >
          <Gamepad2 className="w-3.5 h-3.5" /> Per game
        </button>
      </div>

      {tab === 'global' && isError && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-ra-red/10 border border-ra-red/30 text-ra-red text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Failed to load leaderboard. Check your credentials.
        </div>
      )}

      {tab === 'global' && (<>
      {/* Your rank */}
      {userRank && (
        <div className="glass-card p-4 sm:p-5 border-ra-accent/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-ra-accent/20 border border-ra-accent/30 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-ra-accent" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm sm:text-base">Your Global Rank</div>
                <div className="text-ra-text text-xs sm:text-sm">{username}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white text-2xl sm:text-3xl font-bold">#{parseInt(userRank.Rank).toLocaleString()}</div>
              <div className="flex items-center gap-2 sm:gap-3 mt-1">
                <div className="text-center">
                  <div className="text-ra-gold font-semibold text-sm">{userRank.Score.toLocaleString()}</div>
                  <div className="text-ra-text text-xs">HC pts</div>
                </div>
                <div className="w-px h-6 sm:h-8 bg-ra-border" />
                <div className="text-center">
                  <div className="text-ra-text font-semibold text-sm">{userRank.SoftcoreScore.toLocaleString()}</div>
                  <div className="text-ra-text text-xs">SC pts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top 10 */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-ra-border flex items-center gap-2">
          <Trophy className="w-4 h-4 text-ra-gold" />
          <h2 className="text-white font-semibold text-sm">Top 10 Players</h2>
        </div>
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : (
          <div className="divide-y divide-ra-border/50">
            {topTen?.map((player, idx) => {
              const rank = idx + 1;
              const rc = rankConfig[rank];
              const isMe = player.UserName.toLowerCase() === username.toLowerCase();
              return (
                <div
                  key={player.UserName}
                  className={clsx(
                    'flex items-center gap-3 sm:gap-4 p-3 sm:p-4 transition-colors',
                    isMe ? 'bg-ra-accent/10 border-l-2 border-ra-accent' : 'hover:bg-ra-border/20',
                  )}
                >
                  <div className={clsx(
                    'w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center flex-shrink-0',
                    rc ? rc.bg : 'bg-ra-border/30 border-ra-border',
                  )}>
                    {rc ? (
                      <rc.icon className={clsx('w-4 h-4 sm:w-5 sm:h-5', rc.color)} />
                    ) : (
                      <span className="text-ra-text font-bold text-sm">#{rank}</span>
                    )}
                  </div>
                  <img
                    src={getUserAvatarUrl(player.UserName)}
                    alt={player.UserName}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-ra-border flex-shrink-0"
                    onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${player.UserName[0]}&background=141628&color=4F6EF7`; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-sm">{player.UserName}</span>
                      {isMe && <Badge variant="blue">You</Badge>}
                      {rank <= 3 && (
                        <Badge variant={rank === 1 ? 'gold' : rank === 2 ? 'gray' : 'orange'}>
                          Top {rank}
                        </Badge>
                      )}
                    </div>
                    <div className="text-ra-text text-xs mt-0.5 hidden sm:block">
                      {player.TotalTruePoints.toLocaleString()} true pts
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-white font-bold text-sm sm:text-base">{player.TotalPoints.toLocaleString()}</div>
                    <div className="text-ra-text text-xs">pts</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </>)}

      {tab === 'game' && (
        <div className="space-y-4">
          {/* Game picker */}
          <div className="glass-card p-3 sm:p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-ra-accent flex-shrink-0" />
              <input
                type="text"
                placeholder="Search your recent games..."
                value={gameSearch}
                onChange={e => setGameSearch(e.target.value)}
                className="flex-1 bg-ra-darker border border-ra-border rounded-lg px-3 py-2 text-white placeholder-ra-text/40 focus:outline-none focus:border-ra-accent/60 text-sm"
              />
            </div>
            {!recentGames?.length ? (
              <div className="text-ra-text text-sm text-center py-2">No recent games found.</div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                {gameOptions.slice(0, 30).map(g => (
                  <button
                    key={g.GameID}
                    onClick={() => setSelectedGameId(g.GameID)}
                    className={clsx(
                      'flex items-center gap-2 px-2 py-1.5 rounded-lg border text-xs transition-all',
                      selectedGameId === g.GameID
                        ? 'bg-ra-accent/20 border-ra-accent text-white'
                        : 'bg-ra-darker border-ra-border text-ra-text hover:text-white hover:border-ra-accent/40',
                    )}
                    title={g.Title}
                  >
                    <img
                      src={getImageUrl(g.ImageIcon)}
                      alt=""
                      className="w-5 h-5 rounded object-cover flex-shrink-0"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <span className="max-w-[180px] truncate">{g.Title}</span>
                  </button>
                ))}
                {!gameOptions.length && (
                  <div className="text-ra-text text-xs">No matches.</div>
                )}
              </div>
            )}
          </div>

          {/* Selected game leaderboard */}
          {!selectedGameId ? (
            <div className="glass-card p-8 text-center text-ra-text text-sm">
              Pick a game above to see its top players.
            </div>
          ) : gameRankError ? (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-ra-red/10 border border-ra-red/30 text-ra-red text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Failed to load game leaderboard.
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-ra-border flex items-center gap-3">
                {selectedGame && (
                  <img
                    src={getImageUrl(selectedGame.ImageIcon)}
                    alt={selectedGame.Title}
                    className="w-8 h-8 rounded-lg object-cover border border-ra-border flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-semibold text-sm truncate">
                    {selectedGame?.Title ?? `Game #${selectedGameId}`}
                  </h2>
                  {selectedGame && (
                    <div className="text-ra-text text-xs">{selectedGame.ConsoleName}</div>
                  )}
                </div>
              </div>
              {gameRankLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : !gameRank?.length ? (
                <div className="p-8 text-center text-ra-text text-sm">No players ranked yet.</div>
              ) : (
                <div className="divide-y divide-ra-border/50">
                  {gameRank.slice(0, 20).map((p, idx) => {
                    const rank = idx + 1;
                    const rc = rankConfig[rank];
                    const isMe = p.User?.toLowerCase() === username.toLowerCase();
                    return (
                      <div
                        key={`${p.User}-${idx}`}
                        className={clsx(
                          'flex items-center gap-3 sm:gap-4 p-3 sm:p-4 transition-colors',
                          isMe ? 'bg-ra-accent/10 border-l-2 border-ra-accent' : 'hover:bg-ra-border/20',
                        )}
                      >
                        <div className={clsx(
                          'w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center flex-shrink-0',
                          rc ? rc.bg : 'bg-ra-border/30 border-ra-border',
                        )}>
                          {rc ? (
                            <rc.icon className={clsx('w-4 h-4 sm:w-5 sm:h-5', rc.color)} />
                          ) : (
                            <span className="text-ra-text font-bold text-sm">#{rank}</span>
                          )}
                        </div>
                        <img
                          src={getUserAvatarUrl(p.User)}
                          alt={p.User}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-ra-border flex-shrink-0"
                          onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${p.User?.[0] ?? '?'}&background=141628&color=4F6EF7`; }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-semibold text-sm truncate">{p.User}</span>
                            {isMe && <Badge variant="blue">You</Badge>}
                          </div>
                          {p.LastAward && (
                            <div className="text-ra-text/60 text-xs mt-0.5">
                              last unlock {formatDistanceToNow(new Date(p.LastAward), { addSuffix: true })}
                            </div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-white font-bold text-sm sm:text-base">{p.TotalScore?.toLocaleString() ?? 0}</div>
                          <div className="text-ra-text text-xs">{p.NumAchievements ?? 0} ach</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
