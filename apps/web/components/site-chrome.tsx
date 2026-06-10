import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-card-border bg-card">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-8 gap-y-2 px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Adaptive Sports <span className="text-gold">Near Me</span>
        </Link>
        <nav aria-label="Main" className="ml-auto">
          <ul className="flex flex-wrap items-center gap-6 text-sm font-medium">
            <li>
              <Link
                className="text-ink-soft transition-colors hover:text-ink"
                href="/programs/"
              >
                Discover
              </Link>
            </li>
            <li>
              <a
                className="text-ink-soft transition-colors hover:text-ink"
                href="https://adapttolife.org"
              >
                About
              </a>
            </li>
            <li>
              <a
                className="rounded-full bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-hover"
                href="mailto:hello@adapttolife.org?subject=List%20my%20program%20on%20Adaptive%20Sports%20Near%20Me"
              >
                List Your Program
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-card-border bg-card">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-6 text-sm text-ink-soft">
        <span>
          A project of <span className="font-medium text-ink">Adapt To Life</span>{" "}
          — 100% to the community.
        </span>
        <a
          className="underline underline-offset-4 hover:text-ink"
          href="https://github.com/adaptivesportsnearme/asnm"
        >
          Open source (MIT)
        </a>
        <span>Data: CC BY 4.0</span>
      </div>
    </footer>
  );
}
