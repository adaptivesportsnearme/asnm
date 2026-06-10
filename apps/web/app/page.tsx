import { readFileSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { SearchIcon, ArrowRightIcon } from "@/components/icons";

type Meta = { programs: number; states: number; sources: number; generatedAt: string };
type Program = { sport: string; freshness: number | null };

const SPORT_EMOJI: Record<string, string> = {
  "Wheelchair Basketball": "🏀",
  "Sled Hockey": "🏒",
  "Adaptive Skiing": "⛷️",
  "Adaptive Rowing": "🚣",
  "Track & Field": "🏃",
  "Adaptive Sailing": "⛵",
  "Wheelchair Tennis": "🎾",
  "Adaptive Cycling": "🚴",
  Equestrian: "🐴",
  Archery: "🏹",
  "Adaptive Swimming": "🏊",
  Running: "👟",
  "Wheelchair Rugby": "🏉",
  "Adaptive Golf": "⛳",
  "Adaptive Climbing": "🧗",
  Boccia: "🎯",
  "Sitting Volleyball": "🏐",
  "Adaptive Fishing": "🎣",
  "Adaptive Surfing": "🏄",
  "Adaptive Dance": "💃",
};

function loadData() {
  const pub = (f: string) => path.join(process.cwd(), "public/data", f);
  const meta: Meta = JSON.parse(readFileSync(pub("meta.json"), "utf8"));
  const programs: Program[] = JSON.parse(readFileSync(pub("programs.json"), "utf8"));
  const counts = new Map<string, number>();
  for (const p of programs)
    if (p.sport !== "Multi-Sport") counts.set(p.sport, (counts.get(p.sport) ?? 0) + 1);
  const topSports = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const verified = programs.filter((p) => p.freshness != null && p.freshness >= 70).length;
  return { meta, topSports, sportCount: counts.size, verified };
}

export default function Home() {
  const { meta, topSports, sportCount, verified } = loadData();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero — ported from reference Index.tsx */}
        <section className="overflow-hidden border-b border-card-border bg-card">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-card-border bg-surface px-3 py-1 text-xs font-medium text-ink-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                {meta.programs.toLocaleString()} programs across all 50 states
              </div>
              <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
                Find adaptive sports programs near you
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft md:text-xl">
                The front door to adaptive sports. Discover programs, learn the
                game, and get playing.
              </p>

              <form action="programs/" method="get" className="mt-8 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />
                  <label htmlFor="hero-q" className="sr-only">
                    Search by city, state, zip, or sport
                  </label>
                  <input
                    id="hero-q"
                    name="q"
                    type="text"
                    placeholder="Enter city, state, or zip code"
                    autoComplete="off"
                    className="w-full rounded-xl border border-card-border bg-card py-4 pl-12 pr-4 text-base transition-all focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
                  />
                </div>
                <button
                  type="submit"
                  className="whitespace-nowrap rounded-xl bg-primary px-8 py-4 text-base font-semibold text-white transition-all hover:bg-primary-hover active:scale-[0.98]"
                >
                  Search Programs
                </button>
              </form>

              <div className="mt-10 flex items-stretch divide-x divide-card-border">
                {[
                  [meta.programs.toLocaleString(), "Programs listed"],
                  ["50", "States covered"],
                  [`${sportCount}+`, "Sports available"],
                ].map(([num, label], i) => (
                  <div key={label} className={i === 0 ? "pr-6 md:pr-8" : i === 1 ? "px-6 md:px-8" : "pl-6 md:pl-8"}>
                    <div className="text-2xl font-bold md:text-3xl">{num}</div>
                    <div className="mt-1 text-xs text-ink-soft md:text-sm">{label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-10 border-t border-card-border pt-8 text-sm text-ink-soft">
                Built from {meta.sources} sources, including Move United, NWBA,
                Challenged Athletes Foundation, and U.S. Paralympics.
              </div>
            </div>

            <div className="relative hidden lg:block">
              <Image
                src="/hero-athlete.jpg"
                alt="A young wheelchair basketball athlete lining up a shot with a coach courtside"
                width={1100}
                height={733}
                priority
                className="rounded-2xl border border-card-border object-cover shadow-[var(--shadow-card-md)]"
              />
              <div className="absolute bottom-4 left-4 rounded-xl border border-card-border bg-card/95 px-4 py-3 shadow-[var(--shadow-card-md)]">
                <div className="text-sm font-semibold">{verified} programs verified</div>
                <div className="text-xs text-ink-soft">by automated checks, this week</div>
              </div>
            </div>
          </div>
        </section>

        {/* Browse by sport — reference CategoryGrid, real counts */}
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Browse by sport</h2>
              <p className="mt-2 text-ink-soft">Real program counts, straight from the directory.</p>
            </div>
            <Link
              className="hidden items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink sm:inline-flex"
              href="/programs/"
            >
              View all programs <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {topSports.map(([sport, count]) => (
              <li key={sport}>
                <Link
                  href={`/programs/?sport=${encodeURIComponent(sport)}`}
                  className="flex flex-col items-center rounded-2xl border border-card-border bg-card p-5 text-center shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-md)]"
                >
                  <span aria-hidden="true" className="text-3xl">
                    {SPORT_EMOJI[sport] ?? "🌟"}
                  </span>
                  <span className="mt-3 font-semibold">{sport}</span>
                  <span className="mt-1 text-xs text-ink-soft">{count} programs</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section className="border-y border-card-border bg-card">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
            <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">
              How it works
            </h2>
            <ol className="mx-auto mt-10 grid max-w-4xl gap-8 sm:grid-cols-3">
              {[
                ["Search", "Enter your city, state, or zip — or browse by sport. No account needed."],
                ["Check the badge", "Every listing shows how fresh its information is. We tell you what we know and what we don't."],
                ["Get playing", "Contact the program directly. Equipment and first-timer details are right on the listing."],
              ].map(([title, body], i) => (
                <li key={title} className="text-center">
                  <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gold-light font-bold text-ink">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Mission CTA — ported from reference */}
        <section className="relative overflow-hidden bg-primary py-20 md:py-24">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(0 0% 100% / 0.08), transparent 70%)",
            }}
          />
          <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-white/50">
                Our mission
              </p>
              <h2 className="mb-5 text-balance text-3xl font-bold tracking-tight text-white md:text-4xl">
                The path from diagnosis to the playing field is broken.
              </h2>
              <p className="mb-10 text-lg leading-relaxed text-white/70">
                For millions of Americans with physical disabilities, finding a
                way back to sport shouldn&apos;t take months of phone calls.
                We&apos;re building the definitive open directory so every
                athlete can find their place.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/programs/"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-ink transition-colors hover:bg-white/90"
                >
                  Start Searching <ArrowRightIcon className="h-5 w-5" />
                </Link>
                <a
                  href="https://adapttolife.org"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white transition-colors hover:bg-white/20"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
