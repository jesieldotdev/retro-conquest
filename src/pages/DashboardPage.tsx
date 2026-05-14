import {
  Trophy, Star, Flame, TrendingUp, Gamepad2,
  Clock, Award, Zap, Medal, ChevronRight, Lock, AlertCircle, Radio,
} from 'lucide-react';
import { useUserSummary, useRecentAchievements, useUserRank, useAchievementOfWeek, useRecentlyPlayed } from '../hooks/useRA';
import { useAuth } from '../context/AuthContext';
import { getImageUrl, getBadgeUrl, getUserAvatarUrl } from '../api/ra';
import { ProgressRing } from '../components/ui/ProgressRing';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-4 rounded-xl bg-ra-red/10 border border-ra-red/30 text-ra-red text-sm">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = 'text-ra-accent' }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="glass-card p-4 flex items-start gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color.replace('text-', 'bg-')}/15`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="min-w-0">
        <div className="text-ra-text text-xs uppercase tracking-wide mb-0.5">{label}</div>
        <div className="text-white text-xl font-bold leading-none truncate">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {sub && <div className="text-ra-text text-xs mt-1 truncate">{sub}</div>}
      </div>
    </div>
  );
}

function AchievementItem({ ach }: { ach: any }) {
  const isHardcore = ach.HardcoreMode === 1 || ach.HardcoreAchieved === 1;
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-ra-border/30 transition-colors group">
      <div className="relative flex-shrink-0">
        <img
          src={getBadgeUrl(ach.BadgeName)}
          alt={ach.Title}
          className="w-10 h-10 rounded-lg object-cover border border-ra-border"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        {isHardcore && (
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-ra-gold rounded-full flex items-center justify-center">
            <Zap className="w-2 h-2 text-ra-darker" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-xs font-medium truncate">{ach.Title}</div>
        <div className="text-ra-text text-xs truncate">{ach.GameTitle || ach.Description}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-ra-gold text-xs font-semibold">+{ach.Points}</span>
          {(ach.Date || ach.DateAwarded) && (
            <span className="text-ra-text/50 text-xs">
              {formatDistanceToNow(new Date(ach.Date || ach.DateAwarded), { addSuffix: true })}
            </span>
          )}
        </div>
      </div>
      {isHardcore && <Badge variant="gold"><Zap className="w-2.5 h-2.5" />HC</Badge>}
    </div>
  );
}

function GameProgressCard({ game }: { game: any }) {
  const numAchieved = Number(game.NumAchieved ?? 0);
  const numPossible = Number(game.NumPossibleAchievements ?? 0);
  const numHardcore = Number(game.NumAchievedHardcore ?? 0);
  const pct = numPossible > 0 ? Math.round((numAchieved / numPossible) * 100) : 0;
  const hcPct = numPossible > 0 ? Math.round((numHardcore / numPossible) * 100) : 0;

  return (
    <Link to={`/games/${game.GameID}`} className="glass-card-hover p-3 flex gap-3 game-card-hover cursor-pointer block">
      <img
        src={getImageUrl(game.ImageIcon)}
        alt={game.Title}
        className="w-12 h-12 rounded-xl object-cover border border-ra-border flex-shrink-0"
        onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${game.Title[0]}&background=141628&color=4F6EF7`; }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <div className="text-white text-xs font-semibold truncate">{game.Title}</div>
          <span className="text-ra-text text-xs flex-shrink-0 hidden sm:block">{game.ConsoleName}</span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <ProgressRing value={pct} size={30} strokeWidth={3} color={pct === 100 ? '#22C55E' : '#4F6EF7'} label={`${pct}%`} />
          <div className="flex-1">
            <div className="flex justify-between text-xs text-ra-text mb-0.5">
              <span>{numAchieved}/{numPossible}</span>
              {hcPct > 0 && <span className="text-ra-gold">{hcPct}% HC</span>}
            </div>
            <div className="progress-bar">
              <div className="progress-fill bg-ra-accent" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function DashboardPage() {
  const { username } = useAuth();
  const { data: summary, isLoading: sumLoading, isError: sumError, error: sumErr } = useUserSummary(8);
  const { data: recentGames, isLoading: gamesLoading } = useRecentlyPlayed(8);
  const { data: recentAchs, isLoading: achsLoading, isError: achsError } = useRecentAchievements(60 * 24 * 7);
  const { data: rank } = useUserRank();
  const { data: aotw } = useAchievementOfWeek();

  const richPresence = summary?.RichPresenceMsg;
  const currentGame = recentGames?.[0] ?? summary?.RecentlyPlayed?.[0];
  const lastPlayedMs = currentGame?.LastPlayed ? Date.now() - new Date(currentGame.LastPlayed).getTime() : Infinity;
  const isPlayingNow = !!currentGame && lastPlayedMs < 1000 * 60 * 15;

  const hcPoints = summary?.TotalPoints ?? 0;
  const scPoints = summary?.TotalSoftcorePoints ?? 0;
  const isHardcoreUser = hcPoints > 0;
  const primaryPoints = isHardcoreUser ? hcPoints : scPoints;
  const primaryPointsLabel = isHardcoreUser ? 'HC Points' : 'SC Points';
  const rankNum = rank?.Rank != null ? Number(rank.Rank) : 0;
  const hasRank = rankNum > 0;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Welcome back, <span className="text-gradient-gold">{username}</span>
          </h1>
          <p className="text-ra-text text-sm mt-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-ra-green rounded-full animate-pulse flex-shrink-0" />
            <span className="truncate">{richPresence || 'Ready to conquer achievements'}</span>
          </p>
        </div>
        {hasRank && (
          <div className="glass-card px-3 py-2 flex items-center gap-2 self-start">
            <Medal className="w-4 h-4 text-ra-gold" />
            <span className="text-white font-bold">#{rankNum.toLocaleString()}</span>
            <span className="text-ra-text text-xs">global</span>
          </div>
        )}
      </div>

      {/* Error states */}
      {sumError && (
        <ErrorBox message={`Failed to load profile: ${(sumErr as any)?.message ?? 'Check your username and API key'}`} />
      )}
      {achsError && (
        <ErrorBox message="Failed to load recent achievements" />
      )}

      {/* Now playing */}
      {currentGame && (
        <Link
          to={`/games/${currentGame.GameID}`}
          className={clsx(
            'glass-card-hover p-4 flex items-center gap-4 group',
            isPlayingNow && 'border-ra-green/40 shadow-[0_0_24px_-12px_rgba(34,197,94,0.5)]',
          )}
        >
          <img
            src={getImageUrl(currentGame.ImageIcon)}
            alt={currentGame.Title}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-ra-border flex-shrink-0"
            onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${currentGame.Title[0]}&background=141628&color=4F6EF7`; }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              {isPlayingNow ? (
                <>
                  <span className="relative flex w-2 h-2 flex-shrink-0">
                    <span className="absolute inline-flex w-full h-full bg-ra-green rounded-full opacity-75 animate-ping" />
                    <span className="relative inline-flex w-2 h-2 bg-ra-green rounded-full" />
                  </span>
                  <span className="text-ra-green text-xs font-semibold uppercase tracking-wide">Playing now</span>
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 text-ra-text/60" />
                  <span className="text-ra-text text-xs uppercase tracking-wide">Last played</span>
                </>
              )}
              <span className="text-ra-text/50 text-xs">•</span>
              <span className="text-ra-text text-xs truncate">{currentGame.ConsoleName}</span>
            </div>
            <div className="text-white font-bold text-base sm:text-lg truncate">{currentGame.Title}</div>
            <div className="text-ra-text text-xs mt-0.5 flex items-center gap-1.5 truncate">
              {isPlayingNow && <Radio className="w-3 h-3 text-ra-green flex-shrink-0" />}
              <span className="truncate">{richPresence || (currentGame.LastPlayed && formatDistanceToNow(new Date(currentGame.LastPlayed), { addSuffix: true }))}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-ra-text/40 flex-shrink-0 group-hover:text-ra-accent transition-colors" />
        </Link>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {sumLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
        ) : (
          <>
            <StatCard
              icon={Flame}
              label={primaryPointsLabel}
              value={primaryPoints}
              sub={isHardcoreUser ? `${(summary?.TotalTruePoints ?? 0).toLocaleString()} true` : 'softcore'}
              color="text-ra-gold"
            />
            <StatCard icon={Trophy} label="Achievements" value={recentAchs?.length ? `${recentAchs.length}+` : 0} sub="recent unlocks" color="text-ra-purple" />
            <StatCard icon={Gamepad2} label="Games" value={summary?.RecentlyPlayed?.length ?? 0} sub="recently active" color="text-ra-accent" />
            <StatCard
              icon={TrendingUp}
              label="Rank"
              value={hasRank ? `#${rankNum.toLocaleString()}` : '—'}
              sub={hasRank ? `of ${summary?.TotalRanked?.toLocaleString() ?? '?'}` : 'softcore unranked'}
              color="text-ra-green"
            />
          </>
        )}
      </div>

      {/* User hero */}
      {summary && (
        <div className="glass-card overflow-hidden">
          <div className="h-16 sm:h-24 relative" style={{
            background: 'linear-gradient(135deg, #1a1f4e 0%, #0d0f1a 50%, #1a1030 100%)',
          }}>
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(79,110,247,0.4) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(168,85,247,0.3) 0%, transparent 60%)',
            }} />
          </div>
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-5 -mt-8 sm:-mt-10 mb-3 sm:mb-5">
              <img
                src={getUserAvatarUrl(username)}
                alt={username}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-4 border-ra-darker object-cover flex-shrink-0"
                onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${username}&background=4F6EF7&color=fff&size=80`; }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-lg sm:text-xl font-bold text-white">{username}</div>
                {summary.Motto && <span className="text-ra-text text-sm italic">"{summary.Motto}"</span>}
              </div>
              <div className="flex items-center gap-3 sm:mb-2">
                <div className="text-center">
                  <div className="text-white font-bold">{primaryPoints.toLocaleString()}</div>
                  <div className="text-ra-text text-xs">{isHardcoreUser ? 'HC Points' : 'SC Points'}</div>
                </div>
                {isHardcoreUser ? (
                  <>
                    <div className="w-px h-8 bg-ra-border" />
                    <div className="text-center">
                      <div className="text-white font-bold">{summary.TotalTruePoints.toLocaleString()}</div>
                      <div className="text-ra-text text-xs">True Pts</div>
                    </div>
                  </>
                ) : null}
                {hasRank && (
                  <>
                    <div className="w-px h-8 bg-ra-border" />
                    <div className="text-center">
                      <div className="text-white font-bold">#{rankNum.toLocaleString()}</div>
                      <div className="text-ra-text text-xs">Rank</div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-ra-text text-xs">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Member since {new Date(summary.MemberSince).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent games */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold flex items-center gap-2 text-sm sm:text-base">
              <Gamepad2 className="w-4 h-4 text-ra-accent" />
              Recently Played
            </h2>
            <Link to="/games" className="text-ra-accent text-xs hover:text-blue-300 flex items-center gap-1 transition-colors">
              All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {gamesLoading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
          ) : (
            <div className="space-y-2">
              {recentGames?.slice(0, 6).map(game => (
                <GameProgressCard key={game.GameID} game={game} />
              ))}
              {!recentGames?.length && (
                <div className="text-center py-8 text-ra-text text-sm">No games found</div>
              )}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Achievement of the Week */}
          {aotw && (
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-ra-gold" />
                <h3 className="text-white font-semibold text-sm">Achievement of Week</h3>
              </div>
              <div className="flex gap-3">
                <img
                  src={getBadgeUrl(aotw.Achievement.BadgeName)}
                  alt={aotw.Achievement.Title}
                  className="w-12 h-12 rounded-xl border border-ra-border flex-shrink-0 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold truncate">{aotw.Achievement.Title}</div>
                  <div className="text-ra-text text-xs truncate">{aotw.Achievement.GameTitle}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="gold">{aotw.Achievement.Points} pts</Badge>
                    <span className="text-ra-text text-xs">{aotw.UnlocksCount} unlocks</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent achievements */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-ra-purple" />
                Recent Unlocks
              </h3>
              <Link to="/achievements" className="text-ra-accent text-xs hover:text-blue-300 flex items-center gap-1 transition-colors">
                All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {achsLoading ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
            ) : (
              <div className="space-y-0.5">
                {recentAchs?.slice(0, 8).map((ach, i) => (
                  <AchievementItem key={`${ach.AchievementID}-${i}`} ach={ach} />
                ))}
                {!recentAchs?.length && !achsLoading && (
                  <div className="text-center py-6 text-ra-text">
                    <Lock className="w-7 h-7 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No recent achievements</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
