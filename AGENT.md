# AGENT.md

## Purpose

This repository is a full-stack personal portfolio site for Jeet, a senior full stack developer. Despite the "portfolio" label, it has real server-side logic — a Nodemailer contact endpoint and a filesystem-backed MDX blog — not just static marketing pages.

There was previously an AI chat widget (`app/components/ai/Chatbot.tsx`, `app/api/chat/route.ts`, `src/lib/embeddings.ts`) that answered questions grounded in portfolio content via OpenAI. It was deliberately removed (decided not needed for this portfolio) — don't reintroduce it without being asked.

A different, unrelated live chat feature was added later — see "Live chat" under Architecture. It's human-to-human (a visitor talks directly to Jeet), not AI-backed.

Use this file as working context for future edits. It describes the current folder structure, architecture, conventions, and guardrails so changes stay consistent with the existing codebase.

## Project Snapshot

- Framework: Next.js `16.1.6` (App Router, Turbopack)
- React: `19.2.3`
- Language: TypeScript with `strict: true`
- Styling: Tailwind CSS v4 via `@import "tailwindcss"` in `app/globals.css`
- Animation: GSAP with `ScrollTrigger`
- Package manager: `npm` with `package-lock.json` (do not add a `yarn.lock`/`pnpm-lock.yaml` alongside it)
- Node version: pinned via `.nvmrc` to `20`; `package.json` engines requires `>=20.9.0`. Run `nvm use` before installing/building if your shell defaults to an older Node.
- Dev server: `npm run dev` on port `3004`

## Folder Structure

```text
.
├── app/
│   ├── api/
│   │   ├── chat-live/
│   │   │   ├── create-room/route.ts # POST — rate-limited; generates a roomId, fires owner notifications
│   │   │   └── token/route.ts       # POST — mints a room-scoped Ably token for visitor or admin role
│   │   └── contact/route.ts       # POST — rate-limited, honeypot-protected contact form handler
│   ├── blog/
│   │   ├── page.tsx                # blog index, reads content/blog/*.mdx
│   │   └── [slug]/page.tsx         # MDX post renderer via next-mdx-remote/rsc
│   ├── chat-live/
│   │   └── admin/[roomId]/         # page.tsx + AdminChatClient.tsx — owner-only join UI, noindex'd
│   ├── components/
│   │   ├── chat-live/
│   │   │   └── ChatLiveLauncher.tsx # visitor-facing "Chat with me" launcher + panel
│   │   ├── sections/                # one component per landing-page section
│   │   │   ├── HeroSection.tsx
│   │   │   ├── AboutSection.tsx
│   │   │   ├── ProjectsSection.tsx
│   │   │   ├── BuildingInPublicSection.tsx
│   │   │   ├── HowIBuildSection.tsx
│   │   │   ├── ExperienceSection.tsx
│   │   │   └── ContactSection.tsx
│   │   ├── AgencyCursor.tsx        # custom cursor (the only cursor system currently mounted)
│   │   ├── ArchitectureDiagram.tsx
│   │   ├── Header.tsx
│   │   ├── JsonLd.tsx              # structured-data <script> injector
│   │   ├── LiveSystemConsole.tsx   # client-side GitHub API telemetry widget
│   │   ├── Loader.tsx
│   │   └── SectionSkeleton.tsx     # loading fallback for dynamic() sections
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── robots.ts                   # dynamic, includes blog posts via siteUrl; disallows /chat-live/admin
│   └── sitemap.ts                  # dynamic, includes blog posts via getAllPosts()
├── content/
│   └── blog/*.mdx                  # frontmatter: title, date, tag, description
├── public/
│   └── jeet-logo.png, profile.png, favicons, etc.
├── src/
│   ├── data/
│   │   ├── menu.json                # nav items
│   │   ├── portfolio.json           # single content source (see Data Standards)
│   │   └── apps.ts                  # "building in public" app list, currently empty
│   ├── hooks/
│   │   ├── useGsap.ts
│   │   └── useAblyChatRoom.ts       # shared realtime hook, used by both launcher and admin UI
│   ├── lib/
│   │   ├── ably.ts                  # isAblyConfigured, mintChatToken — room-scoped token minting
│   │   ├── chat-notify.ts           # Telegram + CallMeBot owner notifications
│   │   ├── rate-limit.ts            # createRateLimiter factory, shared by contact + chat-live routes
│   │   ├── contact.ts               # submitContactMessage — validation + send
│   │   ├── blog.ts                  # gray-matter MDX frontmatter parsing, fs-based
│   │   ├── mailer.ts                # Nodemailer transport + HTML-escaped templates
│   │   ├── portfolio.ts             # typed accessor over portfolio.json
│   │   ├── site.ts                  # siteUrl, siteIdentity, flagshipProjectSlugs
│   │   └── gsap.ts                  # shared GSAP registration
│   └── types/
│       └── portfolio.ts             # PortfolioData, ContactPayload/Response types
├── eslint.config.mjs
├── next.config.ts                   # security headers (CSP, X-Frame-Options, etc.) + turbopack root pin
├── package.json
├── postcss.config.mjs
├── README.md                        # still default create-next-app boilerplate, not accurate
└── tsconfig.json
```

## Architecture

### App shell

- `app/layout.tsx` renders: `JsonLd` (Person/WebSite structured data), `Analytics` + `SpeedInsights` (Vercel), `RefinedAgencyCursor`, `Header`, then `<main className="pt-16">{children}</main>`, then `ChatLiveLauncher` — inside a `Suspense` boundary with `Loader` as fallback.
- Only one cursor system is mounted (`AgencyCursor.tsx`). Earlier duplicate cursor/hero experiments (`CustomCursor.tsx`, `Hero.tsx`, `HeroClient.tsx`, `ScrollSection.tsx`) have already been removed — don't recreate that overlap.

### Home page

- `app/page.tsx` composes landing sections. `HeroSection` is imported eagerly; every other section (`AboutSection`, `ProjectsSection`, `BuildingInPublicSection`, `HowIBuildSection`, `ExperienceSection`, `ContactSection`, `LiveSystemConsole`) is loaded via `next/dynamic` with a `SectionSkeleton` fallback.
- Order: Hero → About → Projects → BuildingInPublic → HowIBuild → Experience → Contact → LiveSystemConsole.

### Blog

- MDX files live in `content/blog/*.mdx` with frontmatter `title`, `date`, `tag`, `description`.
- `src/lib/blog.ts` reads them via Node `fs` + `gray-matter` (server-only — do not import from a client component).
- `app/blog/[slug]/page.tsx` renders MDX via `next-mdx-remote/rsc`'s `compileMDX`.
- `sitemap.ts` calls `getAllPosts()` to include every post; keep frontmatter dates valid ISO strings since they feed `lastModified`.

### API / backend

- `app/api/contact/route.ts`: forces `runtime = "nodejs"` (Nodemailer needs real TCP sockets, not Edge). Rate-limited via `src/lib/rate-limit.ts#createRateLimiter` (5 requests / 10 min) and a honeypot `website` field. Delegates validation + send to `src/lib/contact.ts#submitContactMessage`, which uses `src/lib/mailer.ts` (Nodemailer/SMTP) when `SMTP_USER`/`SMTP_PASS`/`CONTACT_TO` are configured, otherwise logs and still returns success.
- `src/lib/rate-limit.ts#createRateLimiter(windowMs, max)` is a shared in-memory, per-instance limiter factory used by `contact`, `chat-live/create-room`, and `chat-live/token`. Per-instance means it won't share state across serverless instances/regions — fine as basic abuse mitigation, not a hard guarantee.
- Mail behavior is env-gated (see `.env.example`) — the app must work with zero secrets configured (dev/local), degrading gracefully rather than throwing.

### Live chat

A visitor-initiated, human-to-human (not AI) live chat: a visitor clicks "Chat with me" (`ChatLiveLauncher`), a private room is created, and the owner gets pinged on Telegram + WhatsApp with a one-tap link to join and talk directly. No database — everything is ephemeral, living only in the realtime channel for the session.

- **Realtime transport**: [Ably](https://ably.com) (free tier). The browser connects to Ably directly — Vercel serverless functions only mint scoped auth tokens, never proxy the live socket traffic (Vercel's Hobby plan can't reliably hold a long-lived WebSocket for an ongoing chat session).
- **Security model** — no user-auth system; two capability-style secrets instead:
  - `roomId` (`crypto.randomUUID()`) is the visitor's bearer credential — unguessable, known only to that visitor and to the owner via the notification link.
  - `CHAT_ADMIN_SECRET` is the only proof of "this is the owner," checked with `crypto.timingSafeEqual` (hashed first, in `app/api/chat-live/token/route.ts`) so it's constant-time and never throws on a length mismatch.
  - Every Ably token is capability-restricted to exactly one channel (`chat:<roomId>`) via `src/lib/ably.ts#mintChatToken` — a token for one room cannot read/write any other room.
  - The admin join link embeds `?key=` for one-tap join; `AdminChatClient.tsx` strips it from the URL immediately after reading it (`router.replace`) so it doesn't linger in history.
- **Notifications**: `src/lib/chat-notify.ts#notifyNewChatRoom` fires Telegram + CallMeBot (WhatsApp) in parallel via `Promise.allSettled` and never throws — a flaky third-party notifier must never block room creation for the visitor. Falls back to a console log when neither is configured (dev).
- **Client**: `src/hooks/useAblyChatRoom.ts` is the one shared hook (connection lifecycle, presence, pub/sub, `authCallback`-driven token renewal) consumed by both `ChatLiveLauncher` (visitor) and `AdminChatClient` (owner) — don't duplicate Ably wiring in either component.
- Closing a room is client-driven only: the admin publishes a `closed` event on the channel it already holds a token for. There's no server-side room registry to flip a flag on (by design — nothing is persisted), so this is a soft, not hard-enforced, boundary.
- **CSP dependency**: Ably's browser SDK needs its hosts in `next.config.ts`'s `connect-src` (`*.ably.io`, `*.ably-realtime.com`, `*.ably.net`, `wss:` variants) or the connection is silently blocked with no obvious error. Telegram/CallMeBot are called server-side only and need no CSP entry.
- `app/chat-live/admin/[roomId]/` is `noindex, nofollow` and disallowed in `robots.ts` — never link it from anywhere public.

### Data layer

- Portfolio content is stored in `src/data/portfolio.json`, typed by `src/types/portfolio.ts` (`PortfolioData`), and accessed through `src/lib/portfolio.ts#portfolioData`.
- Note: `portfolio.json` still has a top-level `ai` field (`title`/`suggestedQuestions`/`systemPrompt`) left over from the removed chat feature. Nothing reads it anymore — safe to delete next time you're editing that file, or repurpose it.
- Navigation items are stored in `src/data/menu.json`.
- `src/data/apps.ts` holds the "building in public" app list (currently empty array — populate to have `BuildingInPublicSection` render cards).
- Preferred pattern for content edits: update JSON/`apps.ts` for copy/content; update components only when presentation or behavior changes.

### Animation layer

- GSAP is a first-class dependency. Shared registration lives in `src/lib/gsap.ts`; the main hook is `src/hooks/useGsap.ts`.
- Preferred pattern: keep GSAP logic inside client components, scope selectors to the component root (`gsap.utils.selector(scopeEl)`), revert GSAP context on cleanup.

## Path and Import Standards

- The TypeScript alias `@/*` maps to `src/*` **only** (see `tsconfig.json`). There is no alias for `app/`.
- Use `@/data/...`, `@/hooks/...`, `@/lib/...`, `@/types/...` for modules under `src/`.
- Components inside `app/` use **relative imports** for other `app/` modules (e.g. `../ArchitectureDiagram`, `../../components/JsonLd`). Do not write `@/app/...` — it will silently resolve to a nonexistent `src/app/...` path and fail the build.

## Styling Standards

- Global styles live in `app/globals.css`.
- Tailwind utilities are the primary styling approach.
- Visual direction is dark, minimal, motion-heavy, portfolio-oriented. Maintain it unless a task explicitly asks for a redesign.
- Keep section IDs aligned with navigation hrefs: `#home`, `#about`, `#projects`, `#experience`, `#contact` (check `src/data/menu.json` for the current authoritative list before adding a new section).

## Component Standards

- Default to server components when no client-only APIs are needed.
- Use `"use client"` only for interactive, animation-heavy, or browser-API-dependent components (GSAP, `fetch` in `useEffect`, etc.).
- Prefer small, section-focused components over one large page file; keep `app/page.tsx` a simple composition layer.
- New landing sections should follow the existing `dynamic()` + `SectionSkeleton` pattern in `app/page.tsx` unless there's a reason to load eagerly (like `HeroSection`).

## Environment Variables

See `.env.example` for the authoritative list. Everything is optional in dev — the app degrades gracefully:

- `NEXT_PUBLIC_SITE_URL` — used by `src/lib/site.ts#siteUrl`, metadata, robots/sitemap.
- `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`CONTACT_TO` — contact form email; without them, submissions validate and log only. `SMTP_USER` must be a real Gmail address the App Password was generated for (not a typo/placeholder) — a wrong `SMTP_USER` or a pasted-with-spaces `SMTP_PASS` both surface as a `535 Bad Credentials` error from Google, not a code bug. Double check `CONTACT_TO` matches the intended inbox — it's easy for this to silently diverge from the public contact email shown in `portfolio.json`.
- `ABLY_API_KEY` — live chat realtime; without it, `/api/chat-live/*` returns a graceful `503`.
- `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` and `CALLMEBOT_PHONE`/`CALLMEBOT_APIKEY` — owner notifications for live chat; each channel degrades independently (see `src/lib/chat-notify.ts`).
- `CHAT_ADMIN_SECRET` — gates the admin side of live chat; generate with `openssl rand -hex 32`, never a memorable password.

## Commands

- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Start production server: `npm run start`
- Lint: `npm run lint`

Note: dev server runs on port `3004`, not the Next.js default. Ensure Node is `>=20.9.0` (`nvm use` picks up `.nvmrc`) before installing or building.

## Editing Guidance For Future Agents

- Start by checking whether the requested change is content-only, visual-only, animation-only, or structural.
- Content-only: edit `src/data/portfolio.json`, `src/data/menu.json`, or `src/data/apps.ts`.
- Layout or behavior changes: edit the relevant section under `app/components/sections/`.
- Global shell changes: `app/layout.tsx`, `app/globals.css`, `app/components/Header.tsx`.
- GSAP reuse: prefer improving `src/hooks/useGsap.ts` over duplicating setup logic.
- Backend/API changes: routes live in `app/api/*/route.ts`; shared logic (mail) lives in `src/lib/`. Keep secrets server-side — never import `src/lib/mailer.ts` or `src/lib/contact.ts` from a client component.
- Avoid introducing a second parallel architecture. The current split is: routes/UI composition in `app/`, shared data/hooks/libs in `src/`.
- After `npm install`, verify `npm run build` still succeeds — this repo has previously broken from unpinned/missing dependencies (`gray-matter`, `next-mdx-remote`, `@vercel/speed-insights`) and bad `@/app/...` aliasing; both classes of mistake fail silently until build time.

## Definition Of Done For Changes

- The change fits the existing `app/` + `src/` split.
- Section links still scroll to the correct targets.
- GSAP side effects are cleaned up.
- Styling remains consistent with the current portfolio direction.
- `npm run build` and `npm run lint` both pass, or any remaining issue is explicitly called out.
- If a new npm dependency was added, confirm it's present in `package.json` (not just `node_modules`) and only one lockfile (`package-lock.json`) is present/updated.
