import Link from "next/link";
import Image from "next/image";
import menu from "@/data/menu.json";
import { siteIdentity } from "@/lib/site";

/**
 * Site footer.
 *
 * Every page used to stop dead at its last section — no nav, no socials, no
 * feed, nothing telling a reader where they'd landed. This is the second
 * navigation surface: the one people look for after they've finished reading.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface text-body">
      <div className="mx-auto max-w-[1200px] px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr] md:gap-8">
          <div>
            <Link href="/#home" aria-label="Go to home" className="inline-block">
              <Image
                src="/brand/jeetlabs-lockup-dark.svg"
                alt="JeetLabs"
                width={481}
                height={100}
                className="h-8 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-[38ch] text-sm text-caption">
              {siteIdentity.jobTitle} — React, Next.js, Node.js, AWS.
            </p>
          </div>

          <nav aria-label="Site">
            <h2 className="text-[11px] uppercase tracking-[0.18em] text-caption">Site</h2>
            <ul className="mt-4 space-y-2.5">
              {menu.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="text-sm text-body transition-colors hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Elsewhere">
            <h2 className="text-[11px] uppercase tracking-[0.18em] text-caption">Elsewhere</h2>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a
                  href={`mailto:${siteIdentity.email}`}
                  className="text-sm text-body transition-colors hover:text-accent"
                >
                  Email
                </a>
              </li>
              <li>
                <a
                  href={siteIdentity.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-body transition-colors hover:text-accent"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={siteIdentity.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-body transition-colors hover:text-accent"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="/blog/rss.xml"
                  className="text-sm text-body transition-colors hover:text-accent"
                >
                  RSS feed
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-caption sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteIdentity.fullName}
          </p>
          <p>Built with Next.js · Deployed on Vercel</p>
        </div>
      </div>
    </footer>
  );
}
