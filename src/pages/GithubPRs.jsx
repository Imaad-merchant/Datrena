import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { GitPullRequest, Clock, User, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export default function GithubPRs() {
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [githubUser, setGithubUser] = useState('');

  const fetchPRs = async () => {
    setLoading(true);
    setError(null);
    const res = await base44.functions.invoke('getGithubPRs', {});
    if (res.data.error) {
      setError(res.data.error);
    } else {
      setPrs(res.data.prs || []);
      setGithubUser(res.data.github_user || '');
    }
    setLoading(false);
  };

  useEffect(() => { fetchPRs(); }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <GitPullRequest className="w-7 h-7 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold">Pull Requests Awaiting Review</h1>
              {githubUser && <p className="text-gray-400 text-sm">@{githubUser}</p>}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPRs}
            disabled={loading}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6 text-red-300">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mr-3" />
            Fetching pull requests...
          </div>
        )}

        {/* Empty */}
        {!loading && !error && prs.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <GitPullRequest className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No pull requests awaiting review.</p>
          </div>
        )}

        {/* PR List */}
        {!loading && prs.length > 0 && (
          <div className="space-y-3">
            <p className="text-gray-400 text-sm mb-4">{prs.length} PR{prs.length !== 1 ? 's' : ''} awaiting review</p>
            {prs.map(pr => (
              <div key={pr.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-gray-500 text-xs font-mono">{pr.repo}</span>
                      <span className="text-gray-600">#</span>
                      <span className="text-gray-400 text-xs">#{pr.number}</span>
                      {pr.draft && <Badge variant="outline" className="text-xs border-yellow-700 text-yellow-400">Draft</Badge>}
                    </div>
                    <a
                      href={pr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-semibold hover:text-purple-300 transition-colors flex items-center gap-1 group"
                    >
                      {pr.title}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <img src={pr.author_avatar} alt={pr.author} className="w-4 h-4 rounded-full" />
                        {pr.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(pr.created_at), { addSuffix: true })}
                      </span>
                      {pr.requested_reviewers.length > 0 && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Reviewers: {pr.requested_reviewers.join(', ')}
                        </span>
                      )}
                    </div>

                    {pr.labels.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {pr.labels.map(label => (
                          <span
                            key={label.name}
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: `#${label.color}33`, color: `#${label.color}`, border: `1px solid #${label.color}66` }}
                          >
                            {label.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}