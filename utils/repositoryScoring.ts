import type { RepositoryUsage, UsageCategory } from '@/types/dashboard';

interface RepoData {
  name: string;
  stargazers_count: number;
  language: string | null;
  fork?: boolean;
  forks_count?: number;
  updated_at?: string;
  size?: number;
  open_issues_count?: number;
}

interface CommitData {
  repository: {
    name: string;
    primaryLanguage: { name: string } | null;
  };
  contributions: { totalCount: number };
}

export function categorizeRepositories(
  username: string,
  repos: RepoData[],
  commitData: CommitData[]
): RepositoryUsage[] {
  const commitMap = new Map<string, number>();
  commitData.forEach((cd) => {
    if (cd.repository?.name) {
      commitMap.set(cd.repository.name, cd.contributions.totalCount);
    }
  });

  const now = Date.now();
  const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
  const SIX_MONTHS_MS = 6 * ONE_MONTH_MS;

  return repos.map((repo) => {
    const commitsCount = commitMap.get(repo.name) || 0;
    const updatedAt = repo.updated_at ? new Date(repo.updated_at).getTime() : 0;
    const timeSinceUpdate = now - updatedAt;

    let activityScore = 0;

    // 1. Commit volume (highly weighted if recent)
    activityScore += Math.min(commitsCount * 2, 50);

    // 2. Recency of updates
    if (timeSinceUpdate < ONE_MONTH_MS) {
      activityScore += 30;
    } else if (timeSinceUpdate < SIX_MONTHS_MS) {
      activityScore += 15;
    } else {
      activityScore += 5;
    }

    // 3. Stars and forks
    activityScore += Math.min(repo.stargazers_count * 5, 20);
    activityScore += Math.min((repo.forks_count || 0) * 2, 10);

    // 4. Issues
    activityScore += Math.min((repo.open_issues_count || 0) * 1, 10);

    // 5. Penalize tiny or empty repos
    if (repo.size && repo.size < 50 && commitsCount === 0) {
      activityScore -= 20;
    }

    // Categorization
    let usageCategory: UsageCategory = 'Possibly unused/test';
    if (activityScore >= 60) {
      usageCategory = 'Highly active';
    } else if (activityScore >= 30) {
      usageCategory = 'Moderately active';
    } else if (activityScore >= 10 || commitsCount > 0) {
      usageCategory = 'Low-activity';
    }

    return {
      name: repo.name,
      description: null, // Since GitHubRepo in REST doesn't carry description in our sanitizeRepo by default, but wait, maybe we should?
      stargazerCount: repo.stargazers_count,
      forkCount: repo.forks_count || 0,
      url: `https://github.com/${username}/${repo.name}`,
      primaryLanguage: repo.language ? { name: repo.language, color: '' } : null,
      commitsCount,
      size: repo.size || 0,
      openIssues: repo.open_issues_count || 0,
      updatedAt: repo.updated_at || '',
      activityScore,
      usageCategory,
    };
  }).sort((a, b) => b.activityScore - a.activityScore);
}
