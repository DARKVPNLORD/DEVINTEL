import { useEffect, useState } from 'react';
import { Card, Badge, Button, Skeleton } from '../components/primitives';
import { useToast } from '../components/primitives';
import { githubService } from '../services/data.service';
import type { Repository } from '../types';
import { clsx } from 'clsx';

export function RepositoriesPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'original' | 'forked'>('all');
  const [search, setSearch] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    loadRepos();
  }, []);

  const loadRepos = async () => {
    setLoading(true);
    try {
      const data = await githubService.getRepos();
      setRepos(data);
    } catch {
      addToast('Failed to load repositories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await githubService.syncAll();
      addToast(`Synced ${result.repositories} repositories`, 'success');
      await loadRepos();
    } catch {
      addToast('Sync failed', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const filtered = repos
    .filter((r) => {
      if (filter === 'original') return !r.is_fork;
      if (filter === 'forked') return r.is_fork;
      return true;
    })
    .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton width="200px" height="32px" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><Skeleton height="120px" /></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Repositories</h1>
          <p className="text-sm text-surface-500 mt-1">{repos.length} repositories synced</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleSync} isLoading={syncing}>
          Sync from GitHub
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <input
          type="text"
          placeholder="Search repositories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base w-full sm:w-64"
        />
        <div className="flex items-center gap-2">
          {(['all', 'original', 'forked'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                filter === f
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                  : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800'
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Repo grid */}
      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <svg className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <p className="text-surface-500 mb-4">
            {repos.length === 0 ? 'No repositories found. Sync your GitHub account to get started.' : 'No matching repositories.'}
          </p>
          {repos.length === 0 && (
            <Button variant="primary" size="sm" onClick={handleSync} isLoading={syncing}>
              Sync Now
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((repo) => (
            <Card key={repo.id} hoverable className="flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline truncate block"
                  >
                    {repo.name}
                  </a>
                </div>
                {repo.is_private && <Badge variant="warning">Private</Badge>}
                {repo.is_fork && <Badge>Fork</Badge>}
              </div>

              {repo.description && (
                <p className="text-xs text-surface-500 mb-3 line-clamp-2">{repo.description}</p>
              )}

              <div className="mt-auto pt-3 border-t border-surface-100 dark:border-surface-800">
                <div className="flex items-center gap-4 text-xs text-surface-500">
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                      {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    {repo.stars_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    {repo.forks_count}
                  </span>
                </div>

                {repo.topics && repo.topics.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {repo.topics.slice(0, 4).map((topic: string) => (
                      <Badge key={topic} variant="brand" size="sm">{topic}</Badge>
                    ))}
                    {repo.topics.length > 4 && (
                      <Badge size="sm">+{repo.topics.length - 4}</Badge>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
