# Jeet — Portfolio

A dark-theme developer portfolio built with the Next.js App Router and GSAP
scroll animations.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **TypeScript** (strict)
- **Tailwind CSS v4** with a token-based design system (`app/globals.css`)
- **GSAP** + ScrollTrigger for entrance/scroll animations

## Requirements

- **Node.js ≥ 20.9** (Next 16 requirement). A `.nvmrc` is included:

  ```bash
  nvm use      # selects Node 20
  ```

## Getting started

```bash
nvm use
npm install
cp .env.example .env.local   # optional: add SMTP creds for the contact form
npm run dev
```

Open [http://localhost:3004](http://localhost:3004).

## Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the dev server on port 3004    |
| `npm run build` | Production build                     |
| `npm start`     | Run the production build             |
| `npm run lint`  | ESLint                               |

## Environment variables

See [`.env.example`](./.env.example). All are optional in development.

| Variable                  | Purpose                                                        |
| ------------------------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`    | Canonical URL for metadata, OpenGraph, robots, and sitemap     |
| `SMTP_HOST` / `SMTP_PORT` | SMTP server (default `smtp.gmail.com` / `465`)                 |
| `SMTP_USER` / `SMTP_PASS` | SMTP login — for Gmail use an **App Password**                 |
| `CONTACT_TO`              | Where contact messages are delivered (default `SMTP_USER`)     |

> **Contact form:** with SMTP set, `/api/contact` emails submissions via
> Nodemailer (Node.js runtime). Without it, submissions are validated and
> logged only. On Vercel, add these in Project → Settings → Environment
> Variables.

## Project structure

```
app/
  api/               # contact route handler
  components/        # UI; sections/ holds the page sections
  layout.tsx         # fonts, metadata/SEO
  page.tsx           # composes the single-page sections
  robots.ts          # robots.txt
  sitemap.ts         # sitemap.xml
src/
  data/              # portfolio.json — single source of truth for all content
  hooks/useGsap.ts   # scoped GSAP setup with cleanup
  lib/               # contact, mailer, portfolio data transforms
  types/             # shared TypeScript types
```

## Editing content

All copy, projects, and experience live in
[`src/data/portfolio.json`](./src/data/portfolio.json). Navigation lives in
[`src/data/menu.json`](./src/data/menu.json); keep its `href` values in sync with
the section `id`s.

## Notes

- The contact form (`/api/contact`) emails submissions over SMTP when the
  `SMTP_*` env vars are set; otherwise it validates and logs only.
- Custom cursor and animations are disabled for coarse pointers and respect
  `prefers-reduced-motion`.
