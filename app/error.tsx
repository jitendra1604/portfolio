"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The digest is what ties this render to the server log entry.
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[70vh] items-center bg-background px-6 py-24 text-ink">
      <div className="mx-auto w-full max-w-2xl text-center">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-caption">
          Something broke
        </p>
        <h1 className="mt-5 text-3xl font-bold tracking-tight md:text-4xl">
          This page failed to load.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-body">
          The error has been logged. Trying again usually works — if it
          doesn&rsquo;t, the rest of the site is still fine.
        </p>
        {error.digest && (
          <p className="mt-4 font-mono text-xs text-caption">
            Reference: {error.digest}
          </p>
        )}
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <button className="btn btn-primary" type="button" onClick={reset}>
            Try again
          </button>
          <Link className="btn btn-secondary" href="/#home">
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
