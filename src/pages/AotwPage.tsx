import { Star, Trophy, Users, Zap, Calendar, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useAchievementOfWeek } from '../hooks/useRA';
import { getBadgeUrl, getUserAvatarUrl } from '../api/ra';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { formatDistanceToNow, format } from 'date-fns';

export function AotwPage() {
  const { data: aotw, isLoading, isError, error, refetch, isFetching } = useAchievementOfWeek();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-2xl" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    const status = (error as any)?.response?.status;
    const message = (error as any)?.message ?? 'Unknown error';
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="glass-card p-6 text-center space-y-3">
          <AlertCircle className="w-10 h-10 mx-auto text-ra-red" />
          <div>
            <h2 className="text-white font-semibold">Couldn't load Achievement of the Week</h2>
            <p className="text-ra-text text-sm mt-1">
              The RetroAchievements API returned{status ? ` ${status}` : ' an error'} for this request.
              {status === 500 && ' This endpoint occasionally fails on their side — try again in a few minutes.'}
            </p>
            <p className="text-ra-text/60 text-xs mt-2 font-mono break-all">{message}</p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-ra-accent/20 text-ra-accent text-sm font-medium hover:bg-ra-accent/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={isFetching ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />
            {isFetching ? 'Retrying...' : 'Try again'}
          </button>
        </div>
      </div>
    );
  }

  if (!aotw) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-center text-ra-text">
          <Star className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">No Achievement of the Week available</p>
        </div>
      </div>
    );
  }

  const { Achievement: ach, Game, Console, StartAt, TotalPlayers, Unlocks, UnlocksCount, UnlocksHardcoreCount } = aotw;
  const hcPct = UnlocksCount > 0 ? Math.round((UnlocksHardcoreCount / UnlocksCount) * 100) : 0;
  const gameTitle = Game?.Title ?? ach.GameTitle ?? '';
  const consoleName = Console?.Title ?? ach.ConsoleName ?? '';
  const points = typeof ach.Points === 'string' ? parseInt(ach.Points) || 0 : ach.Points;
  const badgeName = ach.BadgeName ?? String(ach.ID);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Star className="w-6 h-6 text-ra-gold" />
          Achievement of the Week
        </h1>
        <p className="text-ra-text text-sm mt-1 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          Week of {format(new Date(StartAt), 'MMMM d, yyyy')}
        </p>
      </div>

      {/* Featured achievement */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 flex gap-6 items-start">
          <div className="relative flex-shrink-0">
            <img
              src={getBadgeUrl(badgeName)}
              alt={ach.Title}
              className="w-28 h-28 rounded-2xl object-cover border-2 border-ra-gold/30 shadow-glow-gold animate-float"
              onError={e => {
                const img = e.target as HTMLImageElement;
                img.onerror = null;
                img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ach.Title[0] || '?')}&background=141628&color=F5C518&size=128`;
              }}
            />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-ra-gold rounded-full flex items-center justify-center shadow-glow-gold">
              <Star className="w-4 h-4 text-ra-darker" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="gold"><Star className="w-3 h-3" />Achievement of Week</Badge>
                  {consoleName && <Badge variant="blue">{consoleName}</Badge>}
                </div>
                <h2 className="text-white text-2xl font-bold">{ach.Title}</h2>
                {gameTitle && <div className="text-ra-text text-sm mt-1">{gameTitle}</div>}
                {ach.Description && <div className="text-ra-text text-sm mt-2 italic">"{ach.Description}"</div>}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-ra-gold text-3xl font-bold">{points}</div>
                <div className="text-ra-text text-xs">points</div>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6 mt-5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-ra-accent" />
                <div>
                  <div className="text-white font-bold">{UnlocksCount.toLocaleString()}</div>
                  <div className="text-ra-text text-xs">Unlocks</div>
                </div>
              </div>
              <div className="w-px h-8 bg-ra-border" />
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-ra-gold" />
                <div>
                  <div className="text-white font-bold">{UnlocksHardcoreCount.toLocaleString()}</div>
                  <div className="text-ra-text text-xs">Hardcore ({hcPct}%)</div>
                </div>
              </div>
              <div className="w-px h-8 bg-ra-border" />
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-ra-purple" />
                <div>
                  <div className="text-white font-bold">{TotalPlayers?.toLocaleString() ?? '?'}</div>
                  <div className="text-ra-text text-xs">Total players</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent unlocks */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-ra-border flex items-center gap-2">
          <Clock className="w-4 h-4 text-ra-accent" />
          <h3 className="text-white font-semibold text-sm">Recent Unlocks</h3>
          <span className="text-ra-text text-xs ml-auto">{Unlocks?.length ?? 0} shown</span>
        </div>
        <div className="divide-y divide-ra-border/50">
          {Unlocks?.slice(0, 20).map((unlock, idx) => (
            <div key={`${unlock.User}-${idx}`} className="flex items-center gap-4 p-4 hover:bg-ra-border/20 transition-colors">
              <img
                src={getUserAvatarUrl(unlock.User)}
                alt={unlock.User}
                className="w-9 h-9 rounded-xl object-cover border border-ra-border flex-shrink-0"
                onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${unlock.User[0]}&background=141628&color=4F6EF7`; }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">{unlock.User}</span>
                  {unlock.HardcoreMode === 1 && (
                    <Badge variant="gold"><Zap className="w-2.5 h-2.5" />HC</Badge>
                  )}
                </div>
                <div className="text-ra-text text-xs mt-0.5 flex items-center gap-1.5">
                  <span>{(unlock.RAPoints ?? unlock.RASoftcorePoints ?? 0).toLocaleString()} pts</span>
                  <span className="text-ra-text/40">•</span>
                  <span>{formatDistanceToNow(new Date(unlock.DateAwarded), { addSuffix: true })}</span>
                </div>
              </div>
              <div className="text-xs text-ra-text/50 flex-shrink-0">
                {format(new Date(unlock.DateAwarded), 'MMM d')}
              </div>
            </div>
          ))}
          {(!Unlocks || Unlocks.length === 0) && (
            <div className="p-8 text-center text-ra-text">
              <Trophy className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No unlocks yet this week</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
