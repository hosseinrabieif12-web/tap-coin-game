import { getProjectTextFiles } from './githubProjectFiles';
import goldenCoinImg from '../assets/images/golden_coin_master_1793884056000.jpg';
import tapBannerImg from '../assets/images/tap_coin_banner_1793884055895.jpg';

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

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const validateGitHubToken = async (token: string): Promise<GitHubUser> => {
  const cleanToken = token.trim();
  if (!cleanToken) {
    throw new Error('Please enter your GitHub token');
  }

  const res = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (res.status === 401) {
    throw new Error('Invalid GitHub token. Please verify your token and ensure it has "repo" scope.');
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `GitHub error (${res.status})`);
  }

  const data = await res.json();
  return {
    login: data.login,
    name: data.name || data.login,
    avatar_url: data.avatar_url,
  };
};

export const publishRepository = async (
  token: string,
  repoName: string,
  isPrivate: boolean,
  onProgress: (step: string, percent: number) => void
): Promise<PublishResult> => {
  const cleanToken = token.trim();
  const cleanRepoName = repoName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');

  if (!cleanRepoName) {
    throw new Error('Please enter a valid repository name');
  }

  // 1. Verify User
  onProgress('Authenticating with GitHub...', 15);
  const user = await validateGitHubToken(cleanToken);

  const headers = {
    Authorization: `Bearer ${cleanToken}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  // 2. Check or create repository
  onProgress(`Setting up repository "${cleanRepoName}"...`, 30);
  let repoExists = false;
  const checkRes = await fetch(`https://api.github.com/repos/${user.login}/${cleanRepoName}`, {
    headers,
  });

  if (checkRes.ok) {
    repoExists = true;
  } else if (checkRes.status === 404) {
    // Create new repo
    const createRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: cleanRepoName,
        description: '🪙 TAP COIN - Modern Gold Mining Web Game (Cloudflare Pages Ready)',
        private: isPrivate,
        auto_init: true,
      }),
    });

    if (!createRes.ok) {
      const errData = await createRes.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to create GitHub repository');
    }

    // Give GitHub 1.8s to initialize default main branch
    await new Promise((r) => setTimeout(r, 1800));
  } else {
    const errData = await checkRes.json().catch(() => ({}));
    throw new Error(errData.message || 'Error checking repository');
  }

  // 3. Get latest commit SHA on main (or master)
  onProgress('Fetching branch references...', 45);
  let parentCommitSha: string | null = null;
  let baseTreeSha: string | null = null;
  let branchName = 'main';

  const refRes = await fetch(`https://api.github.com/repos/${user.login}/${cleanRepoName}/git/ref/heads/main`, {
    headers,
  });

  if (refRes.ok) {
    const refData = await refRes.json();
    parentCommitSha = refData.object.sha;

    // Fetch commit to get tree SHA
    const commitRes = await fetch(`https://api.github.com/repos/${user.login}/${cleanRepoName}/git/commits/${parentCommitSha}`, {
      headers,
    });
    if (commitRes.ok) {
      const commitData = await commitRes.json();
      baseTreeSha = commitData.tree.sha;
    }
  } else {
    // Try master
    const masterRes = await fetch(`https://api.github.com/repos/${user.login}/${cleanRepoName}/git/ref/heads/master`, {
      headers,
    });
    if (masterRes.ok) {
      branchName = 'master';
      const refData = await masterRes.json();
      parentCommitSha = refData.object.sha;
      const commitRes = await fetch(`https://api.github.com/repos/${user.login}/${cleanRepoName}/git/commits/${parentCommitSha}`, {
        headers,
      });
      if (commitRes.ok) {
        const commitData = await commitRes.json();
        baseTreeSha = commitData.tree.sha;
      }
    }
  }

  // 4. Prepare text files and images
  onProgress('Packaging source code and binary assets...', 60);
  const textFiles = getProjectTextFiles();

  type TreeItem = {
    path: string;
    mode: '100644';
    type: 'blob';
    content?: string;
    sha?: string;
  };

  const treeEntries: TreeItem[] = textFiles.map((file) => ({
    path: file.path,
    mode: '100644',
    type: 'blob',
    content: file.content,
  }));

  // Fetch images as base64 and create blobs
  try {
    const [coinBlobRes, bannerBlobRes] = await Promise.all([
      fetch(goldenCoinImg).then((r) => r.blob()),
      fetch(tapBannerImg).then((r) => r.blob()),
    ]);

    const [coinBase64, bannerBase64] = await Promise.all([
      blobToBase64(coinBlobRes),
      blobToBase64(bannerBlobRes),
    ]);

    // Create Git blobs for both images
    const [coinBlobResult, bannerBlobResult] = await Promise.all([
      fetch(`https://api.github.com/repos/${user.login}/${cleanRepoName}/git/blobs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content: coinBase64, encoding: 'base64' }),
      }).then((r) => r.json()),
      fetch(`https://api.github.com/repos/${user.login}/${cleanRepoName}/git/blobs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content: bannerBase64, encoding: 'base64' }),
      }).then((r) => r.json()),
    ]);

    if (coinBlobResult.sha) {
      treeEntries.push({
        path: 'src/assets/images/golden_coin_master_1793884056000.jpg',
        mode: '100644',
        type: 'blob',
        sha: coinBlobResult.sha,
      });
    }

    if (bannerBlobResult.sha) {
      treeEntries.push({
        path: 'src/assets/images/tap_coin_banner_1793884055895.jpg',
        mode: '100644',
        type: 'blob',
        sha: bannerBlobResult.sha,
      });
    }
  } catch (err) {
    console.warn('Could not bundle image blobs via fetch, proceeding with text files:', err);
  }

  // 5. Create Git Tree
  onProgress('Writing Git Tree...', 75);
  const treeBody: Record<string, unknown> = { tree: treeEntries };
  if (baseTreeSha) {
    treeBody.base_tree = baseTreeSha;
  }

  const treeRes = await fetch(`https://api.github.com/repos/${user.login}/${cleanRepoName}/git/trees`, {
    method: 'POST',
    headers,
    body: JSON.stringify(treeBody),
  });

  if (!treeRes.ok) {
    const errData = await treeRes.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to create Git tree');
  }

  const treeData = await treeRes.json();

  // 6. Create Commit
  onProgress('Creating commit on GitHub...', 85);
  const commitRes = await fetch(`https://api.github.com/repos/${user.login}/${cleanRepoName}/git/commits`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message: '🚀 Publish TAP COIN game (Cloudflare Pages Ready)',
      tree: treeData.sha,
      parents: parentCommitSha ? [parentCommitSha] : [],
    }),
  });

  if (!commitRes.ok) {
    const errData = await commitRes.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to create commit');
  }

  const commitData = await commitRes.json();

  // 7. Update branch reference
  onProgress('Updating main branch...', 95);
  const updateRefRes = await fetch(
    `https://api.github.com/repos/${user.login}/${cleanRepoName}/git/refs/heads/${branchName}`,
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        sha: commitData.sha,
        force: true,
      }),
    }
  );

  if (!updateRefRes.ok) {
    // If ref didn't exist, create it
    await fetch(`https://api.github.com/repos/${user.login}/${cleanRepoName}/git/refs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: commitData.sha,
      }),
    });
  }

  onProgress('Publication completed successfully!', 100);

  const repoUrl = `https://github.com/${user.login}/${cleanRepoName}`;
  const pagesDeployUrl = `https://dash.cloudflare.com/?to=/:account/pages/new`;

  return {
    repoUrl,
    repoFullName: `${user.login}/${cleanRepoName}`,
    pagesDeployUrl,
  };
};
