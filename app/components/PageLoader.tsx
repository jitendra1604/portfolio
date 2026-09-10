type PageLoaderProps = {
  /** Shown under the dial, and announced to screen readers. */
  label?: string;
};

/**
 * Blocking loader for route segments that take real time to resolve
 * (Notion-backed blog pages, mostly).
 *
 * Deliberately not the brand mark: at loader size the circuit artwork is
 * illegible and its node pulses are invisible, which read as a static image.
 * The centre is the bare JL monogram (the logo letterforms with the circuit
 * traces stripped out), used as a CSS mask so a specular band can travel
 * across the real glyph rather than across text. Four independent motions —
 * orbiting head with a comet arc, the monogram sweep, a breathing halo and a
 * shuttling rail — so it never looks frozen at any instant.
 */
export default function PageLoader({ label = "Loading" }: PageLoaderProps) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="page-loader-dial">
        <span className="page-loader-track" />
        <span className="page-loader-comet" />
        <span className="page-loader-orbit" />
        <span className="page-loader-halo" />
        <span className="page-loader-monogram" aria-hidden="true" />
      </div>

      <div className="page-loader-meta">
        <div className="page-loader-rail">
          <i />
        </div>
        <p className="page-loader-label">
          {label}
          <span className="page-loader-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </p>
      </div>
    </div>
  );
}
