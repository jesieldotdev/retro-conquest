import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Zap, Star, Users, Lock, CheckCircle2, ExternalLink, Crown, Medal } from 'lucide-react';
import { useGameProgress, useGameRank } from '../hooks/useRA';
import { getImageUrl, getBadgeUrl, getUserAvatarUrl } from '../api/ra';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/Badge';
import { ProgressRing } from '../components/ui/ProgressRing';
import { Skeleton } from '../components/ui/Skeleton';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';

function AchievementCard({ ach, earned, earnedHc }: { ach: any; earned: boolean; earnedHc: boolean }) {
  const rarityLabel = ach.TrueRatio >= 100 ? 'Ultra Rare'
    : ach.TrueRatio >= 50 ? 'Very Rare'
    : ach.TrueRatio >= 25 ? 'Rare'
    : ach.TrueRatio >= 10 ? 'Uncommon'
    : 'Common';

  const rarityColor = ach.TrueRatio >= 100 ? 'text-ra-orange'
    : ach.TrueRatio >= 50 ? 'text-ra-purple'
    : ach.TrueRatio >= 25 ? 'text-ra-accent'
    : ach.TrueRatio >= 10 ? 'text-ra-green'
    : 'text-ra-text';

  return (
    <div className={clsx(
      'flex gap-3 p-3 rounded-xl border transition-all duration-200',
      earned
        ? 'bg-ra-card border-ra-border hover:border-ra-accent/30'
        : 'bg-ra-darker/50 border-ra-border/50 opacity-60'
    )}>
      <div className="relative flex-shrink-0">
        <img
          src={getBadgeUrl(ach.BadgeName, !earned)}
          alt={ach.Title}
          className={clsx('w-12 h-12 rounded-xl object-cover border border-ra-border', !earned && 'grayscale')}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        {earnedHc && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-ra-gold rounded-full flex items-center justify-center">
            <Zap className="w-2.5 h-2.5 text-ra-darker" />
          </div>
        )}
        {!earned && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="w-4 h-4 text-ra-text/60" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="text-white text-sm font-medium">{ach.Title}</div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-ra-gold text-xs font-bold">{ach.Points}</span>
            <Trophy className="w-3 h-3 text-ra-gold" />
          </div>
        </div>
        <div className="text-ra-text text-xs mt-0.5 line-clamp-2">{ach.Description}</div>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={clsx('text-xs font-medium', rarityColor)}>{rarityLabel}</span>
          <span className="text-ra-text/40 text-xs">•</span>
          <span className="text-ra-text text-xs">{ach.NumAwarded?.toLocaleString() ?? 0} earned</span>
          {ach.TrueRatio > ach.Points && (
            <>
              <span className="text-ra-text/40 text-xs">•</span>
              <span className="text-ra-purple text-xs">{ach.TrueRatio} true pts</span>
            </>
          )}
          {earned && ach.DateEarned && (
            <>
              <span className="text-ra-text/40 text-xs">•</span>
              <span className="text-ra-green text-xs">
                {formatDistanceToNow(new Date(ach.DateEarned), { addSuffix: true })}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function GameDetailPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const id = gameId ? parseInt(gameId) : null;
  const { data: game, isLoading } = useGameProgress(id);
  const { data: gameRank, isLoading: rankLoading } = useGameRank(id);
  const { username } = useAuth();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-96">
        <Trophy className="w-16 h-16 text-ra-text/20 mb-4" />
        <p className="text-ra-text text-lg">Game not found</p>
        <Link to="/games" className="mt-4 text-ra-accent hover:text-blue-300 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Games
        </Link>
      </div>
    );
  }

  const achievements = Object.values(game.Achievements || {});
  const earned = achievements.filter(a => a.DateEarned);
  const earnedHc = achievements.filter(a => a.DateEarnedHardcore);
  const pct = parseFloat(game.UserCompletion) || 0;
  const hcPct = parseFloat(game.UserCompletionHardcore) || 0;
  const isMastered = pct >= 100;

  const sortedAchs = [...achievements].sort((a, b) => {
    const aEarned = a.DateEarned ? 1 : 0;
    const bEarned = b.DateEarned ? 1 : 0;
    if (aEarned !== bEarned) return bEarned - aEarned;
    return a.DisplayOrder - b.DisplayOrder;
  });

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <Link to="/games" className="inline-flex items-center gap-2 text-ra-text hover:text-white text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Games
      </Link>

      {/* Hero */}
      <div className="glass-card overflow-hidden">
        <div className="relative h-48 overflow-hidden">
          {game.ImageTitle && (
            <img
              src={getImageUrl(game.ImageTitle)}
              alt={game.Title}
              className="w-full h-full object-cover opacity-40"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ra-card via-ra-card/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-5">
            <img
              src={getImageUrl(game.ImageBoxArt || game.ImageIcon)}
              alt={game.Title}
              className="w-24 h-24 rounded-xl object-cover border-2 border-ra-border shadow-card flex-shrink-0"
              onError={e => { (e.target as HTMLImageElement).src = getImageUrl(game.ImageIcon); }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant="blue">{game.ConsoleName}</Badge>
                {game.Genre && <Badge variant="purple">{game.Genre}</Badge>}
                {isMastered && <Badge variant="green"><CheckCircle2 className="w-3 h-3" />Mastered</Badge>}
                {hcPct >= 100 && <Badge variant="gold"><Zap className="w-3 h-3" />HC Master</Badge>}
              </div>
              <h1 className="text-white text-2xl font-bold truncate">{game.Title}</h1>
              <div className="flex items-center gap-3 text-ra-text text-xs mt-1 flex-wrap">
                {game.Developer && <span>Dev: {game.Developer}</span>}
                {game.Publisher && <span>Pub: {game.Publisher}</span>}
                {game.Released && <span>{game.Released}</span>}
              </div>
            </div>
            <a
              href={`https://retroachievements.org/game/${game.ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-ra-accent/20 border border-ra-accent/30 text-ra-accent text-xs hover:bg-ra-accent/30 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> RA Page
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 flex items-center gap-4">
          <ProgressRing value={pct} size={56} strokeWidth={5} color={isMastered ? '#22C55E' : '#4F6EF7'} label={`${Math.round(pct)}%`} />
          <div>
            <div className="text-ra-text text-xs">Completion</div>
            <div className="text-white font-bold">{earned.length}/{achievements.length}</div>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <ProgressRing value={hcPct} size={56} strokeWidth={5} color="#F5C518" label={`${Math.round(hcPct)}%`} />
          <div>
            <div className="text-ra-text text-xs">Hardcore</div>
            <div className="text-white font-bold">{earnedHc.length}/{achievements.length}</div>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-ra-purple/20 flex items-center justify-center">
            <Star className="w-7 h-7 text-ra-purple" />
          </div>
          <div>
            <div className="text-ra-text text-xs">Your Points</div>
            <div className="text-white font-bold">{game.NumAwardedToUser ? achievements.filter(a => a.DateEarned).reduce((s, a) => s + a.Points, 0).toLocaleString() : 0}</div>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-ra-green/20 flex items-center justify-center">
            <Users className="w-7 h-7 text-ra-green" />
          </div>
          <div>
            <div className="text-ra-text text-xs">Total Players</div>
            <div className="text-white font-bold">{game.NumDistinctPlayersCasual?.toLocaleString() ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Top players for this game */}
      <div>
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Crown className="w-4 h-4 text-ra-gold" />
          Top Players
          {gameRank && <span className="text-ra-text font-normal text-sm">({gameRank.length})</span>}
        </h2>
        {rankLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
        ) : !gameRank?.length ? (
          <div className="glass-card p-6 text-center text-ra-text text-sm">No players ranked yet.</div>
        ) : (
          <div className="glass-card divide-y divide-ra-border/50 overflow-hidden">
            {gameRank.slice(0, 10).map((p, idx) => {
              const rank = idx + 1;
              const rankIcon = rank === 1 ? Crown : rank <= 3 ? Medal : null;
              const rankColor = rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-slate-300' : rank === 3 ? 'text-amber-600' : 'text-ra-text';
              const isMe = p.User?.toLowerCase() === username.toLowerCase();
              return (
                <div
                  key={`${p.User}-${idx}`}
                  className={clsx(
                    'flex items-center gap-3 p-3 transition-colors',
                    isMe ? 'bg-ra-accent/10 border-l-2 border-ra-accent' : 'hover:bg-ra-border/20',
                  )}
                >
                  <div className="w-8 flex items-center justify-center flex-shrink-0">
                    {rankIcon ? (
                      <span className={clsx('flex items-center justify-center', rankColor)}>
                        {(() => { const Icon = rankIcon; return <Icon className="w-4 h-4" />; })()}
                      </span>
                    ) : (
                      <span className="text-ra-text font-bold text-sm">#{rank}</span>
                    )}
                  </div>
                  <img
                    src={getUserAvatarUrl(p.User)}
                    alt={p.User}
                    className="w-9 h-9 rounded-xl object-cover border border-ra-border flex-shrink-0"
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
                    <div className="text-white font-bold text-sm">{p.TotalScore?.toLocaleString() ?? 0}</div>
                    <div className="text-ra-text text-xs">{p.NumAchievements ?? 0} ach</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Achievements list */}
      <div>
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-ra-gold" />
          Achievements
          <span className="text-ra-text font-normal text-sm">({earned.length}/{achievements.length} earned)</span>
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {sortedAchs.map(ach => (
            <AchievementCard
              key={ach.ID}
              ach={ach}
              earned={!!ach.DateEarned}
              earnedHc={!!ach.DateEarnedHardcore}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
