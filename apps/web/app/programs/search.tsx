"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapPinIcon } from "@/components/icons";

type Program = {
  id: string;
  name: string;
  sport: string;
  type: string | null;
  website: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  quality: string | null;
  verification: string;
  freshness: number | null;
  lastChecked: string | null;
  sources: string[] | null;
};

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const DISPLAY_CAP = 200;
const CHIP_COUNT = 8;

// Honest-staleness badge (spec §6): freshness decays from the last successful automated check.
function badge(p: Program): { label: string; cls: string } {
  if (p.freshness == null)
    return { label: "Not yet re-checked", cls: "border-card-border bg-surface text-ink-soft" };
  if (p.freshness >= 70)
    return {
      label: `Recently verified · ${p.freshness}%`,
      cls: "border-success/30 bg-success-light text-success",
    };
  if (p.freshness >= 30)
    return {
      label: `Verified a while ago · ${p.freshness}%`,
      cls: "border-gold-muted bg-gold-light text-ink",
    };
  return { label: `Needs re-check · ${p.freshness}%`, cls: "border-danger/30 bg-danger-light text-danger" };
}

export default function DirectorySearch() {
  const searchParams = useSearchParams();
  const [programs, setPrograms] = useState<Program[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [stateFilter, setStateFilter] = useState("");
  const [sportFilter, setSportFilter] = useState(searchParams.get("sport") ?? "");

  useEffect(() => {
    fetch(`${BASE}/data/programs.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setPrograms)
      .catch(() => setFailed(true));
  }, []);

  const states = useMemo(
    () =>
      programs
        ? [...new Set(programs.map((p) => p.state).filter((s): s is string => !!s && s.trim() !== ""))].sort()
        : [],
    [programs],
  );

  const topSports = useMemo(() => {
    if (!programs) return [];
    const counts = new Map<string, number>();
    for (const p of programs)
      if (p.sport !== "Multi-Sport") counts.set(p.sport, (counts.get(p.sport) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, CHIP_COUNT).map(([s]) => s);
  }, [programs]);

  const results = useMemo(() => {
    if (!programs) return [];
    const needle = q.trim().toLowerCase();
    return programs.filter(
      (p) =>
        (!stateFilter || p.state === stateFilter) &&
        (!sportFilter || p.sport === sportFilter) &&
        (!needle ||
          [p.name, p.city, p.state, p.zip, p.sport].some((v) => v?.toLowerCase().includes(needle))),
    );
  }, [programs, q, stateFilter, sportFilter]);

  if (failed)
    return (
      <p role="alert" className="text-danger">
        The program list failed to load. Please refresh, or email{" "}
        <a className="underline" href="mailto:hello@adapttolife.org">hello@adapttolife.org</a>.
      </p>
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="q" className="mb-1 block text-sm font-medium">
            Search programs
          </label>
          <input
            id="q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, city, state, zip, or sport"
            autoComplete="off"
            className="w-full rounded-xl border border-card-border bg-card px-4 py-3 text-base transition-all focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
          />
        </div>
        <div>
          <label htmlFor="state" className="mb-1 block text-sm font-medium">
            State
          </label>
          <select
            id="state"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="rounded-xl border border-card-border bg-card px-3 py-3 text-base focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
          >
            <option value="">All states</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {topSports.length > 0 && (
        <div role="group" aria-label="Filter by sport" className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSportFilter("")}
            aria-pressed={sportFilter === ""}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              sportFilter === ""
                ? "border-ink bg-primary text-white"
                : "border-card-border bg-surface text-ink-soft hover:text-ink"
            }`}
          >
            All sports
          </button>
          {topSports.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSportFilter(sportFilter === s ? "" : s)}
              aria-pressed={sportFilter === s}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                sportFilter === s
                  ? "border-ink bg-primary text-white"
                  : "border-card-border bg-surface text-ink-soft hover:text-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <p aria-live="polite" className="text-sm text-ink-soft">
        {programs === null
          ? "Loading 2,095 programs…"
          : `${results.length.toLocaleString()} program${results.length === 1 ? "" : "s"} found` +
            (results.length > DISPLAY_CAP
              ? ` — showing the first ${DISPLAY_CAP}, refine your search to narrow down`
              : "")}
      </p>

      <ul className="grid gap-4 sm:grid-cols-2">
        {results.slice(0, DISPLAY_CAP).map((p) => {
          const b = badge(p);
          const where = [p.city, p.state].filter(Boolean).join(", ");
          return (
            <li key={p.id}>
              <details className="group h-full overflow-hidden rounded-2xl border border-card-border bg-card shadow-[var(--shadow-card)] transition-all duration-200 open:shadow-[var(--shadow-card-md)] hover:shadow-[var(--shadow-card-md)]">
                <summary className="cursor-pointer p-5 marker:content-none">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <span className="inline-flex items-center rounded-lg bg-surface px-2.5 py-1 text-xs font-medium text-ink-soft">
                      {p.sport}
                    </span>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${b.cls}`}>
                      {b.label}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold leading-tight">{p.name}</h3>
                  {where && (
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-ink-soft">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{where}</span>
                    </div>
                  )}
                </summary>
                <div className="border-t border-card-border bg-surface px-5 py-4 text-sm">
                  {p.website ? (
                    <p>
                      <a
                        className="font-medium text-info underline underline-offset-4 hover:text-ink"
                        href={p.website}
                        rel="noopener"
                      >
                        Visit website
                      </a>
                    </p>
                  ) : (
                    <p className="text-ink-soft">
                      No website on file yet — our verification agents are working on it.
                    </p>
                  )}
                  {p.sources && p.sources.length > 0 && (
                    <p className="mt-2 text-ink-soft">Listed by: {p.sources.join(", ")}</p>
                  )}
                  <p className="mt-2 text-ink-soft">
                    {p.lastChecked
                      ? `Last automated check: ${new Date(p.lastChecked).toLocaleDateString()}`
                      : "Not yet re-checked by our agents. Spot something out of date? "}
                    {!p.lastChecked && (
                      <a
                        className="underline"
                        href={`mailto:hello@adapttolife.org?subject=Update%20for%20${encodeURIComponent(p.name)}`}
                      >
                        Tell us
                      </a>
                    )}
                  </p>
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
