import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center bg-background px-6 py-24 text-ink">
      <div className="mx-auto w-full max-w-2xl text-center">
        <p className="font-mono text-6xl font-semibold tracking-tight text-accent md:text-8xl">
          404
        </p>
        <h1 className="mt-6 text-3xl font-bold tracking-tight md:text-4xl">
          That page doesn&rsquo;t exist.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-body">
          It may have moved, or the link may be from an older deploy. Here&rsquo;s
          where people usually meant to go.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link className="btn btn-primary" href="/#projects">
            See the work
          </Link>
          <Link className="btn btn-secondary" href="/blog">
            Read the blog
          </Link>
          <Link className="btn btn-secondary" href="/#home">
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}
