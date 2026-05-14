import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { TrendingUp, Trophy, Star, Gamepad2, Zap, CheckCircle2 } from 'lucide-react';
import { useUserSummary, useRecentAchievements } from '../hooks/useRA';
import { Skeleton } from '../components/ui/Skeleton';
import { ProgressRing } from '../components/ui/ProgressRing';
import { format, subDays, eachDayOfInterval } from 'date-fns';

const COLORS = ['#4F6EF7', '#A855F7', '#22C55E', '#F5C518', '#F97316', '#EF4444'];

export function ProgressPage() {
  const { data: summary, isLoading: sumLoading } = useUserSummary(50);
  const { data: recentAchs, isLoading: achsLoading } = useRecentAchievements(200);

  const loading = sumLoading || achsLoading;

  const activityData = useMemo(() => {
    if (!recentAchs?.length) return [];
    const last30 = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
    return last30.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayAchs = recentAchs.filter(a => a.Date?.startsWith(dayStr));
      return {
        date: format(day, 'MM/dd'),
        points: dayAchs.reduce((s, a) => s + a.Points, 0),
        count: dayAchs.length,
      };
    });
  }, [recentAchs]);

  const consoleData = useMemo(() => {
    if (!summary?.RecentlyPlayed) return [];
    const map: Record<string, number> = {};
    for (const g of summary.RecentlyPlayed) {
      map[g.ConsoleName] = (map[g.ConsoleName] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
  }, [summary]);

  const dayOfWeekData = useMemo(() => {
    if (!recentAchs?.length) return [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const map: Record<number, number> = {};
    for (const ach of recentAchs) {
      if (!ach.Date) continue;
      const d = new Date(ach.Date).getDay();
      map[d] = (map[d] || 0) + ach.Points;
    }
    return days.map((name, i) => ({ name, points: map[i] || 0 }));
  }, [recentAchs]);

  const completionDist = useMemo(() => {
    if (!summary?.RecentlyPlayed) return [];
    const buckets = [
      { label: '0%', min: 0, max: 0, count: 0 },
      { label: '1-25%', min: 1, max: 25, count: 0 },
      { label: '26-50%', min: 26, max: 50, count: 0 },
      { label: '51-75%', min: 51, max: 75, count: 0 },
      { label: '76-99%', min: 76, max: 99, count: 0 },
      { label: '100%', min: 100, max: 100, count: 0 },
    ];
    for (const g of summary.RecentlyPlayed) {
      const pct = g.NumPossibleAchievements ? (g.NumAchieved / g.NumPossibleAchievements) * 100 : 0;
      for (const b of buckets) {
        if (pct >= b.min && pct <= b.max) { b.count++; break; }
      }
    }
    return buckets;
  }, [summary]);

  const stats = useMemo(() => {
    const games = summary?.RecentlyPlayed ?? [];
    const mastered = games.filter(g => g.NumAchieved === g.NumPossibleAchievements && g.NumPossibleAchievements > 0).length;
    const totalAchs = recentAchs?.length ?? 0;
    const hcAchs = recentAchs?.filter(a => a.HardcoreMode === 1).length ?? 0;
    const hcPts = recentAchs?.filter(a => a.HardcoreMode === 1).reduce((s, a) => s + a.Points, 0) ?? 0;
    return { mastered, totalAchs, hcAchs, hcPts, total: games.length };
  }, [summary, recentAchs]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass-card p-2.5 text-xs">
        <div className="text-white font-medium mb-1">{label}</div>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-white font-medium">{p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-ra-accent" />
          Progress & Stats
        </h1>
        <p className="text-ra-text text-sm mt-1">Your gaming activity and completion analytics</p>
      </div>

      {/* Key stats */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass-card p-3 sm:p-5 flex items-center gap-3">
            <ProgressRing
              value={stats.total ? (stats.mastered / stats.total) * 100 : 0}
              size={48}
              strokeWidth={5}
              color="#22C55E"
              label={`${stats.mastered}`}
            />
            <div>
              <div className="text-white font-bold text-sm">Mastered</div>
              <div className="text-ra-text text-xs">of {stats.total} games</div>
            </div>
          </div>
          <div className="glass-card p-3 sm:p-5 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-ra-gold/20 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-6 h-6 text-ra-gold" />
            </div>
            <div>
              <div className="text-white font-bold text-xl">{stats.totalAchs}</div>
              <div className="text-ra-text text-xs">Recent unlocks</div>
            </div>
          </div>
          <div className="glass-card p-3 sm:p-5 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-ra-purple/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-ra-purple" />
            </div>
            <div>
              <div className="text-white font-bold text-xl">{stats.hcAchs}</div>
              <div className="text-ra-text text-xs">Hardcore unlocks</div>
            </div>
          </div>
          <div className="glass-card p-3 sm:p-5 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-ra-accent/20 flex items-center justify-center flex-shrink-0">
              <Star className="w-6 h-6 text-ra-accent" />
            </div>
            <div>
              <div className="text-white font-bold text-xl">{stats.hcPts.toLocaleString()}</div>
              <div className="text-ra-text text-xs">HC points</div>
            </div>
          </div>
        </div>
      )}

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 glass-card p-4 sm:p-5">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-ra-accent" />
            Points — Last 30 Days
          </h3>
          {loading ? <Skeleton className="h-40 sm:h-48" /> : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="pointsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F6EF7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4F6EF7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2240" />
                <XAxis dataKey="date" tick={{ fill: '#A0A8C8', fontSize: 9 }} tickLine={false} axisLine={false} interval={6} />
                <YAxis tick={{ fill: '#A0A8C8', fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="points" name="Points" stroke="#4F6EF7" fill="url(#pointsGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass-card p-4 sm:p-5">
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-ra-accent" />
            By Console
          </h3>
          {loading ? <Skeleton className="h-48" /> : (
            <div>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={consoleData} cx="50%" cy="50%" innerRadius={28} outerRadius={50} paddingAngle={3} dataKey="value">
                    {consoleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {consoleData.slice(0, 5).map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-ra-text truncate max-w-[120px]">{d.name}</span>
                    </div>
                    <span className="text-white font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="glass-card p-4 sm:p-5">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-ra-gold" />
            Activity by Day
          </h3>
          {loading ? <Skeleton className="h-44" /> : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={dayOfWeekData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2240" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#A0A8C8', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#A0A8C8', fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="points" name="Points" radius={[4, 4, 0, 0]}>
                  {dayOfWeekData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass-card p-4 sm:p-5">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-ra-green" />
            Completion Distribution
          </h3>
          {loading ? <Skeleton className="h-44" /> : (
            <div className="space-y-3 pt-1">
              {completionDist.map((b, i) => {
                const max = completionDist.reduce((m, x) => Math.max(m, x.count), 0);
                return (
                  <div key={b.label} className="flex items-center gap-3">
                    <span className="text-ra-text text-xs w-12 text-right flex-shrink-0">{b.label}</span>
                    <div className="flex-1 progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${max ? (b.count / max) * 100 : 0}%`, background: COLORS[i % COLORS.length] }}
                      />
                    </div>
                    <span className="text-white text-xs font-medium w-5 text-right">{b.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
