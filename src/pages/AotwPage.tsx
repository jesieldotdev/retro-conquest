import { Star, Trophy, Users, Zap, Calendar, Clock } from 'lucide-react';
import { useAchievementOfWeek } from '../hooks/useRA';
import { getBadgeUrl, getUserAvatarUrl } from '../api/ra';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { formatDistanceToNow, format } from 'date-fns';

export function AotwPage() {
  const { data: aotw, isLoading } = useAchievementOfWeek();

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

  const { Achievement: ach, StartAt, TotalPlayers, Unlocks, UnlocksCount, UnlocksHardcoreCount } = aotw;
  const hcPct = UnlocksCount > 0 ? Math.round((UnlocksHardcoreCount / UnlocksCount) * 100) : 0;

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
              src={getBadgeUrl(ach.BadgeName)}
              alt={ach.Title}
              className="w-28 h-28 rounded-2xl object-cover border-2 border-ra-gold/30 shadow-glow-gold animate-float"
            />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-ra-gold rounded-full flex items-center justify-center shadow-glow-gold">
              <Star className="w-4 h-4 text-ra-darker" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="gold"><Star className="w-3 h-3" />Achievement of Week</Badge>
                  <Badge variant="blue">{ach.ConsoleName}</Badge>
                </div>
                <h2 className="text-white text-2xl font-bold">{ach.Title}</h2>
                <div className="text-ra-text text-sm mt-1">{ach.GameTitle}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-ra-gold text-3xl font-bold">{ach.Points}</div>
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
                  <span>{unlock.RAPoints.toLocaleString()} pts</span>
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
