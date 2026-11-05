export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
}

export interface PublishResult {
  repoUrl: string;
  repoFullName: string;
  pagesDeployUrl: string;
}

export const validateGitHubToken = async (token: string): Promise<GitHubUser> => {
  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token.trim()}`, Accept: 'application/vnd.github+json' }
  });
  if (!res.ok) throw new Error('Invalid GitHub token');
  const d = await res.json();
  return { login: d.login, name: d.name || d.login, avatar_url: d.avatar_url };
};

export const publishRepository = async (): Promise<PublishResult> => {
  throw new Error('Already published to GitHub repository.');
};
