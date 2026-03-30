import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('github');

    // Get authenticated user's login
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'Datrena-App' }
    });
    const ghUser = await userRes.json();

    // Get all repos
    const reposRes = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'Datrena-App' }
    });
    const repos = await reposRes.json();

    if (!Array.isArray(repos)) {
      return Response.json({ error: 'Failed to fetch repos', details: repos }, { status: 500 });
    }

    // Fetch open PRs awaiting review for each repo
    const allPRs = [];
    for (const repo of repos.slice(0, 20)) { // limit to 20 repos
      const prsRes = await fetch(
        `https://api.github.com/repos/${repo.full_name}/pulls?state=open&per_page=50`,
        { headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'Datrena-App' } }
      );
      const prs = await prsRes.json();
      if (!Array.isArray(prs)) continue;

      for (const pr of prs) {
        // Check review requests
        const reviewsRes = await fetch(
          `https://api.github.com/repos/${repo.full_name}/pulls/${pr.number}/requested_reviewers`,
          { headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'Datrena-App' } }
        );
        const reviewers = await reviewsRes.json();
        const hasReviewRequested = reviewers.users?.length > 0 || reviewers.teams?.length > 0;

        if (hasReviewRequested) {
          allPRs.push({
            id: pr.id,
            number: pr.number,
            title: pr.title,
            url: pr.html_url,
            repo: repo.full_name,
            author: pr.user.login,
            author_avatar: pr.user.avatar_url,
            created_at: pr.created_at,
            updated_at: pr.updated_at,
            draft: pr.draft,
            requested_reviewers: reviewers.users?.map(u => u.login) || [],
            requested_teams: reviewers.teams?.map(t => t.name) || [],
            labels: pr.labels?.map(l => ({ name: l.name, color: l.color })) || [],
          });
        }
      }
    }

    return Response.json({ prs: allPRs, github_user: ghUser.login });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});