'use client';

import { useState } from 'react';
import type { RepositoryUsage, UsageCategory } from '@/types/dashboard';
import { ChevronDown, ChevronUp, Github, Star, GitFork, CircleDot, Activity } from 'lucide-react';

interface RepositoryUsageComparisonProps {
  repos?: RepositoryUsage[];
}

const categoryColors: Record<UsageCategory, string> = {
  'Highly active': 'border-emerald-500 text-emerald-600 dark:text-emerald-400',
  'Moderately active': 'border-blue-500 text-blue-600 dark:text-blue-400',
  'Low-activity': 'border-yellow-500 text-yellow-600 dark:text-yellow-400',
  'Possibly unused/test': 'border-gray-500 text-gray-500 dark:text-gray-400',
};

const categoryDescriptions: Record<UsageCategory, string> = {
  'Highly active': 'High commit volume, recent updates, or significant community engagement.',
  'Moderately active': 'Consistent but lower commit volume or moderate engagement.',
  'Low-activity': 'Rarely updated or minimal activity over a long period.',
  'Possibly unused/test': 'Tiny repositories with zero commits or very old unmaintained forks.',
};

export default function RepositoryUsageComparison({ repos }: RepositoryUsageComparisonProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Highly active': true,
    'Moderately active': true,
    'Low-activity': false,
    'Possibly unused/test': false,
  });

  if (!repos || repos.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto mt-6">
        <div className="p-5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm text-center">
          <p className="text-sm text-muted-foreground">No repositories found for analysis.</p>
        </div>
      </div>
    );
  }

  const groupedRepos = repos.reduce((acc, repo) => {
    if (!acc[repo.usageCategory]) {
      acc[repo.usageCategory] = [];
    }
    acc[repo.usageCategory].push(repo);
    return acc;
  }, {} as Record<UsageCategory, RepositoryUsage[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const categories: UsageCategory[] = [
    'Highly active',
    'Moderately active',
    'Low-activity',
    'Possibly unused/test',
  ];

  const formatSize = (kb: number) => {
    if (kb < 1024) return `${kb} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-6">
      <div className="p-5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm">
        <div className="flex items-center justify-start space-x-2 mb-2">
          <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-foreground">Repository Usage Analysis</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          Repositories categorized by actual usage metrics (recent commits, stars, issues, and size).
        </p>

        <div className="flex flex-col gap-4">
          {categories.map((category) => {
            const categoryRepos = groupedRepos[category] || [];
            if (categoryRepos.length === 0) return null;

            const isExpanded = expandedCategories[category];

            return (
              <div
                key={category}
                className={`border-l-4 rounded-r-xl border-y border-r border-y-gray-200 border-r-gray-200 dark:border-y-neutral-800 dark:border-r-neutral-800 bg-gray-50/30 dark:bg-neutral-900/10 overflow-hidden ${categoryColors[category].split(' ')[0]}`}
              >
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-100/50 dark:hover:bg-neutral-800/30 transition-colors"
                >
                  <div className="flex flex-col items-start text-left">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${categoryColors[category].split(' ').slice(1).join(' ')}`}>
                        {category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-neutral-800 text-xs font-medium text-gray-700 dark:text-gray-300">
                        {categoryRepos.length}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      {categoryDescriptions[category]}
                    </span>
                  </div>
                  <div className="text-gray-400 ml-4 flex-shrink-0">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 border-t border-gray-100 dark:border-neutral-800 mt-2 pt-4">
                    {categoryRepos.map((repo) => (
                      <a
                        key={repo.name}
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col gap-2 p-3 rounded-lg border border-gray-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-950 hover:border-gray-300 dark:hover:border-neutral-700 transition-all group"
                      >
                        <div className="flex items-start justify-between min-w-0">
                          <h4 className="font-semibold text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" title={repo.name}>
                            {repo.name}
                          </h4>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 ml-2 flex-shrink-0" title="Usage Score">
                            Score: {Math.round(repo.activityScore)}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-auto pt-2 text-[11px] text-muted-foreground">
                          {repo.primaryLanguage && (
                            <div className="flex items-center gap-1 min-w-0">
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: repo.primaryLanguage.color }}
                              />
                              <span className="truncate">{repo.primaryLanguage.name}</span>
                            </div>
                          )}
                          
                          {repo.commitsCount > 0 && (
                            <div className="flex items-center gap-1" title="Commits in analyzed period">
                              <Activity size={12} className="text-indigo-500" />
                              <span>{repo.commitsCount} commits</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <Star size={12} />
                            <span>{repo.stargazerCount}</span>
                          </div>
                          
                          {repo.forkCount > 0 && (
                            <div className="flex items-center gap-1">
                              <GitFork size={12} />
                              <span>{repo.forkCount}</span>
                            </div>
                          )}

                          {repo.openIssues > 0 && (
                            <div className="flex items-center gap-1">
                              <CircleDot size={12} className="text-emerald-500" />
                              <span>{repo.openIssues}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1 w-full mt-1">
                            <span className="text-[10px] text-gray-400" suppressHydrationWarning>
                              Updated {new Date(repo.updatedAt).toLocaleDateString()} • {formatSize(repo.size)}
                            </span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
