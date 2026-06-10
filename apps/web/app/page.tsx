import { readFileSync } from "node:fs";
import path from "node:path";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

type Meta = {
  programs: number;
  states: number;
  sources: number;
  generatedAt: string;
};

export default function Home() {
  const meta: Meta = JSON.parse(
    readFileSync(path.join(process.cwd(), "public/data/meta.json"), "utf8"),
  );
  const updated = new Date(meta.generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-6 py-20">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Find adaptive sports programs near you.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
            The front door to adaptive sports. Discover programs, learn the
            game, and get playing — free, open, no login.
          </p>
        </header>

        <form
          action="programs/"
          method="get"
          className="mx-auto flex w-full max-w-xl gap-2"
        >
          <label htmlFor="hero-q" className="sr-only">
            Search by name, city, state, or zip
          </label>
          <input
            id="hero-q"
            name="q"
            type="search"
            placeholder="City, state, zip, or sport"
            autoComplete="off"
            className="w-full rounded-full border border-card-border bg-card px-6 py-4 text-base shadow-[var(--shadow-card)] focus:border-ink focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-primary px-6 py-4 font-semibold text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-gold"
          >
            Search
          </button>
        </form>

        <dl className="mx-auto grid w-full max-w-xl grid-cols-3 gap-4">
          {[
            [meta.programs.toLocaleString(), "Programs listed"],
            ["50", "States covered"],
            [String(meta.sources), "Sources combined"],
          ].map(([num, label]) => (
            <div
              key={label}
              className="rounded-(--radius-card) border border-card-border bg-card p-4 text-center shadow-[var(--shadow-card)]"
            >
              <dd className="text-2xl font-bold">{num}</dd>
              <dt className="mt-1 text-xs text-ink-soft">{label}</dt>
            </div>
          ))}
        </dl>

        <p className="text-center text-sm text-ink-soft">
          Every listing shows how fresh its information is — honestly. Updated{" "}
          {updated}.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
