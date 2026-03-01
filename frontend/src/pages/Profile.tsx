import { useState, useEffect } from 'react';
import { Card, Avatar, Badge, Skeleton } from '../components/primitives';
import { useToast } from '../components/primitives';
import { useAuthStore } from '../context/auth.store';
import { usersService, analyticsService } from '../services/data.service';
import type { UserStats, CareerTarget } from '../types';

export function ProfilePage() {
  const { user } = useAuthStore();
  const { addToast } = useToast();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [targets, setTargets] = useState<CareerTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<{ name: string; category: string; proficiency_level: number }[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [st, tg, sk] = await Promise.allSettled([
        usersService.getStats(),
        analyticsService.getTargets(),
        analyticsService.getSkills(),
      ]);
      if (st.status === 'fulfilled') setStats(st.value);
      if (tg.status === 'fulfilled') setTargets(tg.value);
      if (sk.status === 'fulfilled') setSkills(sk.value);
    } catch {
      addToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="flex items-center gap-6">
          <Skeleton width="80px" height="80px" rounded="full" />
          <div className="space-y-2">
            <Skeleton width="160px" height="24px" />
            <Skeleton width="120px" height="16px" />
          </div>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card><Skeleton height="200px" /></Card>
          <Card><Skeleton height="200px" /></Card>
        </div>
      </div>
    );
  }

  // Group skills by category
  const skillsByCategory = skills.reduce<Record<string, typeof skills>>((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Profile</h1>

      {/* User card */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar src={user?.avatar_url} name={user?.display_name || user?.username} size="xl" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-surface-900 dark:text-white">
              {user?.display_name || user?.username}
            </h2>
            <p className="text-sm text-surface-500">@{user?.username}</p>
            {user?.bio && (
              <p className="text-sm text-surface-600 dark:text-surface-400 mt-2">{user.bio}</p>
            )}
            {user?.location && (
              <p className="text-xs text-surface-400 mt-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {user.location}
              </p>
            )}
          </div>
          {stats && (
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-xl font-bold text-surface-900 dark:text-white">{stats.total_repos}</p>
                <p className="text-xs text-surface-500">Repos</p>
              </div>
              <div>
                <p className="text-xl font-bold text-surface-900 dark:text-white">{stats.total_commits}</p>
                <p className="text-xs text-surface-500">Commits</p>
              </div>
              <div>
                <p className="text-xl font-bold text-surface-900 dark:text-white">{stats.latest_dev_score?.toFixed(0) || '—'}</p>
                <p className="text-xs text-surface-500">DevScore</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills */}
        <Card>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Skills</h3>
          {Object.keys(skillsByCategory).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(skillsByCategory).map(([category, catSkills]) => (
                <div key={category}>
                  <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {catSkills.map((skill) => (
                      <Badge key={skill.name} variant="brand">{skill.name}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-surface-500">No skills detected yet. Sync GitHub or upload a resume.</p>
          )}
        </Card>

        {/* Career Targets */}
        <Card>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Career Targets</h3>
          {targets.length > 0 ? (
            <div className="space-y-4">
              {targets.map((target) => (
                <div key={target.id} className="p-4 rounded-lg bg-surface-50 dark:bg-surface-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-surface-900 dark:text-white">{target.role_title}</h4>
                    <Badge variant={target.is_active ? 'success' : 'default'}>
                      {target.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {target.required_skills.slice(0, 6).map((skill: string) => (
                      <Badge key={skill} size="sm">{skill}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-surface-500">No career targets set. Add one from the Settings page.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
