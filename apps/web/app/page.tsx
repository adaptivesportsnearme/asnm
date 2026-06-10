import { readFileSync } from "node:fs";
import path from "node:path";

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
    <div className="flex min-h-screen flex-col bg-white text-zinc-900">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-6 py-16">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
            Adaptive Sports Near Me
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Find adaptive sports programs near you.
          </h1>
        </header>

        <p className="text-lg leading-relaxed text-zinc-700">
          A free, open directory of adaptive sports programs across the United
          States — no login, no paywall, honest about how fresh every listing
          is.
        </p>

        <p>
          <a
            href="programs/"
            className="inline-block rounded-md bg-orange-600 px-6 py-3 text-lg font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2"
          >
            Search the directory →
          </a>
        </p>

        <dl className="grid grid-cols-2 gap-6 rounded-lg border border-zinc-200 p-6">
          <div>
            <dt className="text-sm text-zinc-600">Programs catalogued</dt>
            <dd className="text-3xl font-bold">
              {meta.programs.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-600">Sources combined</dt>
            <dd className="text-3xl font-bold">{meta.sources}</dd>
          </div>
        </dl>

        <p className="text-zinc-700">
          Run a program, or want to know the moment we launch?{" "}
          <a
            className="font-semibold text-orange-700 underline underline-offset-4 hover:text-orange-900"
            href="mailto:hello@adapttolife.org?subject=Adaptive%20Sports%20Near%20Me"
          >
            Email us
          </a>{" "}
          — a real person reads every message.
        </p>
      </main>

      <footer className="border-t border-zinc-200">
        <div className="mx-auto flex w-full max-w-2xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-6 text-sm text-zinc-600">
          <span>
            A project of <span className="font-medium">Adapt To Life</span> —
            100% to the community.
          </span>
          <a
            className="underline underline-offset-4 hover:text-zinc-900"
            href="https://github.com/adaptivesportsnearme/asnm"
          >
            Open source (MIT)
          </a>
          <span>Data: CC BY 4.0 · updated {updated}</span>
        </div>
      </footer>
    </div>
  );
}
