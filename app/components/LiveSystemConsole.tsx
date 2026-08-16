"use client";

import { useEffect, useState } from "react";
import { siteIdentity } from "@/lib/site";

type Repo = { id: number; name: string; language: string | null; pushed_at: string; html_url: string };
type GitHubUser = { public_repos: number; followers: number };

function relativeTime(date: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000));
  return days === 0 ? "today" : `${days}d ago`;
}

export default function LiveSystemConsole() {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [latency, setLatency] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const startedAt = performance.now();
    Promise.all([
      fetch(`https://api.github.com/users/${siteIdentity.githubUsername}`, { signal: controller.signal }),
      fetch(`https://api.github.com/users/${siteIdentity.githubUsername}/repos?sort=pushed&per_page=3`, { signal: controller.signal }),
    ])
      .then(async ([userResponse, reposResponse]) => {
        if (!userResponse.ok || !reposResponse.ok) throw new Error("GitHub API request failed");
        setLatency(Math.round(performance.now() - startedAt));
        setUser(await userResponse.json());
        setRepos(await reposResponse.json());
      })
      .catch(() => setError(true));
    return () => controller.abort();
  }, []);

  return (
    <section className="bg-background px-6 py-24 text-ink md:py-32" aria-labelledby="system-console-title">
      <div className="mx-auto max-w-[1200px]">
        <p className="text-xs uppercase tracking-[0.3em] text-caption">Live telemetry</p>
        <h2 id="system-console-title" className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">System console</h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="card">
            <div className="flex items-center gap-2 text-sm text-body"><span className={`h-2.5 w-2.5 rounded-full ${error ? "bg-rose-400" : "bg-accent"}`} /> GitHub API {error ? "unavailable" : "online"}</div>
            <dl className="mt-8 grid grid-cols-2 gap-5">
              <div><dt className="text-xs uppercase tracking-widest text-caption">Public repos</dt><dd className="mt-2 text-3xl font-semibold text-ink">{user?.public_repos ?? "—"}</dd></div>
              <div><dt className="text-xs uppercase tracking-widest text-caption">Followers</dt><dd className="mt-2 text-3xl font-semibold text-ink">{user?.followers ?? "—"}</dd></div>
            </dl>
            <div className="mt-8 border-t border-line pt-5"><span className="text-xs uppercase tracking-widest text-caption">Round-trip time</span><p className="mt-2 font-mono text-xl text-accent">{latency === null ? "measuring…" : `${latency} ms`}</p></div>
          </div>
          <div className="card">
            <h3 className="text-xl font-semibold">Recently pushed repositories</h3>
            <ul className="mt-5 divide-y divide-line">
              {repos.map((repo) => <li key={repo.id} className="py-4 first:pt-0"><a href={repo.html_url} target="_blank" rel="noreferrer noopener" className="font-medium hover:text-accent">{repo.name}<span className="sr-only"> (opens GitHub in a new tab)</span></a><p className="mt-1 text-sm text-body">{repo.language ?? "Unspecified"} · pushed {relativeTime(repo.pushed_at)}</p></li>)}
              {!error && repos.length === 0 && <li className="py-4 text-sm text-caption">Loading repository activity…</li>}
              {error && <li className="py-4 text-sm text-rose-300">GitHub telemetry could not be loaded right now.</li>}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
