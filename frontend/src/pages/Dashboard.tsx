import { useEffect, useState } from 'react';
import { Card, Badge, Skeleton, Button } from '../components/primitives';
import { useToast } from '../components/primitives';
import { RadarChart, LineChart, ActivityHeatmap, DonutChart } from '../components/charts';
import { analyticsService, githubService, usersService } from '../services/data.service';
import type { DashboardData, IntelligenceMetrics, UserStats } from '../types';
import { clsx } from 'clsx';

// ─── Score Card ──────────────────────────────────────────────
function ScoreCard({
  label,
  score,
  icon,
  color,
}: {
  label: string;
  score: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card className="flex items-center gap-4">
      <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-surface-500 dark:text-surface-400 truncate">{label}</p>
        <p className="text-2xl font-bold text-surface-900 dark:text-white">{score.toFixed(0)}</p>
      </div>
      <div className="w-16 h-2 rounded-full bg-surface-100 dark:bg-surface-700 overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-1000', color.replace('bg-', 'bg-').replace('/10', ''))}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </Card>
  );
}

// ─── Stats Card ──────────────────────────────────────────────
function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-surface-900 dark:text-white">{value}</p>
      <p className="text-xs text-surface-500 mt-1">{label}</p>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────
export function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [_metrics, setMetrics] = useState<IntelligenceMetrics | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dash, met, st] = await Promise.allSettled([
        analyticsService.getDashboard(),
        githubService.getMetrics(),
        usersService.getStats(),
      ]);
      if (dash.status === 'fulfilled') setDashboard(dash.value);
      if (met.status === 'fulfilled') setMetrics(met.value);
      if (st.status === 'fulfilled') setStats(st.value);
    } catch {
      addToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await githubService.syncAll();
      addToast(`Synced ${result.repositories} repos, ${result.commits} commits, ${result.pullRequests} PRs`, 'success');
      await loadData();
    } catch {
      addToast('Sync failed. Check your GitHub connection.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleComputeScore = async () => {
    try {
      await analyticsService.computeScore();
      addToast('DevScore recalculated!', 'success');
      await loadData();
    } catch {
      addToast('Score computation failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton width="200px" height="32px" />
          <Skeleton width="120px" height="36px" rounded="lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><Skeleton height="60px" /></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><Skeleton height="280px" /></Card>
          <Card><Skeleton height="280px" /></Card>
        </div>
      </div>
    );
  }

  const currentScore = dashboard?.currentScore;
  const langColors = ['#6366f1', '#06b6d4', '#f59e0b', '#ef4444', '#22c55e', '#8b5cf6', '#ec4899', '#14b8a6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-surface-500 mt-1">Your developer intelligence overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={handleComputeScore}>
            Recalculate Score
          </Button>
          <Button variant="primary" size="sm" onClick={handleSync} isLoading={syncing}>
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sync GitHub
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <Card padding="lg">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            <StatItem label="Repositories" value={stats.total_repos} />
            <StatItem label="Commits" value={stats.total_commits.toLocaleString()} />
            <StatItem label="Pull Requests" value={stats.total_prs} />
            <StatItem label="Skills" value={stats.total_skills} />
            <StatItem label="DevScore" value={stats.latest_dev_score?.toFixed(0) || '—'} />
            <StatItem label="Member since" value={new Date(stats.member_since).getFullYear().toString()} />
          </div>
        </Card>
      )}

      {/* Score breakdown cards */}
      {currentScore && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <ScoreCard
            label="Consistency"
            score={currentScore.consistency_score}
            color="bg-emerald-500/10"
            icon={<svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <ScoreCard
            label="Technical Depth"
            score={currentScore.technical_depth_score}
            color="bg-blue-500/10"
            icon={<svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>}
          />
          <ScoreCard
            label="Collaboration"
            score={currentScore.collaboration_score}
            color="bg-purple-500/10"
            icon={<svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          />
          <ScoreCard
            label="Skill Relevance"
            score={currentScore.skill_relevance_score}
            color="bg-amber-500/10"
            icon={<svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
          />
          <ScoreCard
            label="Growth Velocity"
            score={currentScore.growth_velocity_score}
            color="bg-rose-500/10"
            icon={<svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          />
        </div>
      )}

      {/* Composite Score + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Composite Score */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Composite DevScore</h3>
            {currentScore && (
              <Badge variant="brand" size="md">{currentScore.composite_score.toFixed(1)} / 100</Badge>
            )}
          </div>
          {currentScore ? (
            <div className="flex items-center justify-center">
              <RadarChart
                data={[
                  { label: 'Consistency', value: currentScore.consistency_score },
                  { label: 'Tech Depth', value: currentScore.technical_depth_score },
                  { label: 'Collaboration', value: currentScore.collaboration_score },
                  { label: 'Skill Relevance', value: currentScore.skill_relevance_score },
                  { label: 'Growth', value: currentScore.growth_velocity_score },
                ]}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-surface-500">
              <p className="text-sm">No score data yet</p>
              <Button variant="secondary" size="sm" className="mt-3" onClick={handleComputeScore}>
                Compute Now
              </Button>
            </div>
          )}
        </Card>

        {/* Score Trend */}
        <Card>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">Score Trend</h3>
          {dashboard?.scoreTrend && dashboard.scoreTrend.length > 1 ? (
            <LineChart
              data={dashboard.scoreTrend.map((t: { date: string; composite_score: number }) => ({
                label: new Date(t.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
                value: t.composite_score,
              }))}
              height={260}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-surface-500 text-sm">
              Not enough data points for a trend yet
            </div>
          )}
        </Card>
      </div>

      {/* Activity Heatmap */}
      <Card>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Activity Heatmap</h3>
        <ActivityHeatmap data={dashboard?.activityHeatmap || []} />
      </Card>

      {/* Languages + Skill Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Languages */}
        <Card>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">Top Languages</h3>
          {dashboard?.topLanguages && dashboard.topLanguages.length > 0 ? (
            <div className="flex items-center gap-8">
              <DonutChart
                data={dashboard.topLanguages.slice(0, 6).map((l: { language: string; percentage: number }, i: number) => ({
                  label: l.language,
                  value: l.percentage,
                  color: langColors[i % langColors.length],
                }))}  
                size={160}
                thickness={24}
                centerValue={dashboard.topLanguages.length.toString()}
                centerLabel="Languages"
              />
              <div className="flex-1 space-y-3">
                {dashboard.topLanguages.slice(0, 6).map((lang: { language: string; percentage: number }, i: number) => (
                  <div key={lang.language} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: langColors[i % langColors.length] }} />
                    <span className="text-sm text-surface-700 dark:text-surface-300 flex-1">{lang.language}</span>
                    <span className="text-sm font-medium text-surface-900 dark:text-white">{lang.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-sm text-surface-500">
              Sync your GitHub to see language data
            </div>
          )}
        </Card>

        {/* Skill Gaps */}
        <Card>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">Skill Gaps</h3>
          {dashboard?.skillGaps && dashboard.skillGaps.length > 0 ? (
            <div className="space-y-4">
              {dashboard.skillGaps.slice(0, 6).map((gap: { skill: string; current_level: number; required_level: number; gap: number }) => (
                <div key={gap.skill}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-surface-700 dark:text-surface-300">{gap.skill}</span>
                    <span className="text-surface-500">
                      {gap.current_level}/{gap.required_level}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-100 dark:bg-surface-700 overflow-hidden">
                    <div
                      className={clsx(
                        'h-full rounded-full transition-all duration-500',
                        gap.gap > 3 ? 'bg-red-500' : gap.gap > 1 ? 'bg-amber-500' : 'bg-emerald-500'
                      )}
                      style={{ width: `${(gap.current_level / gap.required_level) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-sm text-surface-500">
              Set a career target to see skill gaps
            </div>
          )}
        </Card>
      </div>

      {/* Recent Activity */}
      {dashboard?.recentActivity && dashboard.recentActivity.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {dashboard.recentActivity.slice(0, 8).map((activity: { action: string; timestamp: string; metadata: Record<string, any> }, i: number) => (
              <div
                key={i}
                className="flex items-center gap-4 py-2 border-b border-surface-100 dark:border-surface-800 last:border-0"
              >
                <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                <span className="text-sm text-surface-700 dark:text-surface-300 flex-1">{activity.action}</span>
                <span className="text-xs text-surface-400">
                  {new Date(activity.timestamp).toLocaleDateString('en', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
