import Link from "next/link";

// Header/footer ported from the reference design (coldcrippy/accessible-play
// Header.tsx / Footer.tsx) — sticky header, plain wordmark, pill CTA.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-card-border bg-card">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-base font-semibold tracking-tight">
          Adaptive Sports Near Me
        </Link>
        <nav aria-label="Main" className="flex items-center gap-4 sm:gap-8">
          <Link
            className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            href="/programs/"
          >
            Discover
          </Link>
          <a
            className="hidden text-sm font-medium text-ink-soft transition-colors hover:text-ink sm:inline"
            href="https://adapttolife.org"
          >
            About
          </a>
          <a
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            href="mailto:hello@adapttolife.org?subject=List%20my%20program%20on%20Adaptive%20Sports%20Near%20Me"
          >
            List Your Program
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-card-border bg-card">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-soft">
          <span className="font-semibold text-ink">Adaptive Sports Near Me</span>
          <span>
            A project of <span className="font-medium text-ink">Adapt To Life</span> — 100% to
            the community.
          </span>
          <a
            className="underline underline-offset-4 hover:text-ink"
            href="https://github.com/adaptivesportsnearme/asnm"
          >
            Open source (MIT)
          </a>
          <span>Data: CC BY 4.0</span>
          <a
            className="underline underline-offset-4 hover:text-ink"
            href="mailto:hello@adapttolife.org"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
