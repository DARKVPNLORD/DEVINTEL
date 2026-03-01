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

  useEffect(() => { loadRepos(); }, []);

  const loadRepos = async () => {
    setLoading(true);
    try { const data = await githubService.getRepos(); setRepos(data); }
    catch { addToast('Failed to load repositories', 'error'); }
    finally { setLoading(false); }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await githubService.syncAll();
      addToast(`Synced ${result.repositories} repositories`, 'success');
      await loadRepos();
    } catch { addToast('Sync failed', 'error'); }
    finally { setSyncing(false); }
  };

  const filtered = repos
    .filter((r) => { if (filter === 'original') return !r.is_fork; if (filter === 'forked') return r.is_fork; return true; })
    .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton width="200px" height="28px" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (<Card key={i}><Skeleton height="100px" /></Card>))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-mono font-bold text-nothing-white tracking-tight">REPOSITORIES</h1>
          <p className="text-[11px] font-mono text-nothing-grey-500 mt-1 tracking-wide">{repos.length} repositories synced</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleSync} isLoading={syncing}>Sync GitHub</Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-base w-full sm:w-64" />
        <div className="flex items-center gap-1">
          {(['all', 'original', 'forked'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={clsx('px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.15em] transition-colors duration-200',
                filter === f ? 'text-nothing-white bg-nothing-grey-800' : 'text-nothing-grey-500 hover:text-nothing-grey-300'
              )}
            >{f}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-xs font-mono text-nothing-grey-500 mb-4">
            {repos.length === 0 ? 'No repositories found. Sync your GitHub account.' : 'No matching repositories.'}
          </p>
          {repos.length === 0 && <Button variant="primary" size="sm" onClick={handleSync} isLoading={syncing}>Sync Now</Button>}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((repo) => (
            <Card key={repo.id} hoverable className="flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-2">
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-mono text-nothing-white hover:text-nothing-red transition-colors truncate block">
                  {repo.name}
                </a>
                <div className="flex gap-1 flex-shrink-0">
                  {repo.is_private && <Badge variant="warning" size="sm">Private</Badge>}
                  {repo.is_fork && <Badge size="sm">Fork</Badge>}
                </div>
              </div>
              {repo.description && <p className="text-[10px] font-mono text-nothing-grey-500 mb-3 line-clamp-2">{repo.description}</p>}
              <div className="mt-auto pt-3 border-t border-nothing-grey-800">
                <div className="flex items-center gap-4 text-[10px] font-mono text-nothing-grey-500">
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-nothing-red" />
                      {repo.language}
                    </span>
                  )}
                  <span>{repo.stars_count} stars</span>
                  <span>{repo.forks_count} forks</span>
                </div>
                {repo.topics && repo.topics.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {repo.topics.slice(0, 4).map((topic: string) => (<Badge key={topic} size="sm">{topic}</Badge>))}
                    {repo.topics.length > 4 && <Badge size="sm">+{repo.topics.length - 4}</Badge>}
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
