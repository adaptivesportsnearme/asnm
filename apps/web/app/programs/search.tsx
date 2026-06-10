"use client";

import { useEffect, useMemo, useState } from "react";

type Program = {
  id: string;
  name: string;
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

// Honest-staleness badge (spec §6): freshness decays from the last successful automated check.
// Most entries start life never-checked — we say so instead of pretending.
function badge(p: Program): { label: string; cls: string } {
  if (p.freshness == null)
    return {
      label: "Not yet re-checked",
      cls: "border-zinc-300 bg-zinc-100 text-zinc-700",
    };
  if (p.freshness >= 70)
    return {
      label: `Recently verified · ${p.freshness}%`,
      cls: "border-green-300 bg-green-50 text-green-800",
    };
  if (p.freshness >= 30)
    return {
      label: `Verified a while ago · ${p.freshness}%`,
      cls: "border-amber-300 bg-amber-50 text-amber-800",
    };
  return {
    label: `Needs re-check · ${p.freshness}%`,
    cls: "border-red-300 bg-red-50 text-red-800",
  };
}

export default function DirectorySearch() {
  const [programs, setPrograms] = useState<Program[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState("");
  const [stateFilter, setStateFilter] = useState("");

  useEffect(() => {
    fetch(`${BASE}/data/programs.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setPrograms)
      .catch(() => setFailed(true));
  }, []);

  const states = useMemo(
    () =>
      programs
        ? [
            ...new Set(
              programs
                .map((p) => p.state)
                .filter((s): s is string => !!s && s.trim() !== ""),
            ),
          ].sort()
        : [],
    [programs],
  );

  const results = useMemo(() => {
    if (!programs) return [];
    const needle = q.trim().toLowerCase();
    return programs.filter(
      (p) =>
        (!stateFilter || p.state === stateFilter) &&
        (!needle ||
          [p.name, p.city, p.state, p.zip, p.type].some((v) =>
            v?.toLowerCase().includes(needle),
          )),
    );
  }, [programs, q, stateFilter]);

  if (failed)
    return (
      <p role="alert" className="text-red-700">
        The program list failed to load. Please refresh, or email{" "}
        <a className="underline" href="mailto:hello@adapttolife.org">
          hello@adapttolife.org
        </a>
        .
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
            placeholder="Name, city, state, or zip"
            autoComplete="off"
            className="w-full rounded-md border border-zinc-300 px-4 py-3 text-base focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600/30"
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
            className="rounded-md border border-zinc-300 px-3 py-3 text-base focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600/30"
          >
            <option value="">All states</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p aria-live="polite" className="text-sm text-zinc-600">
        {programs === null
          ? "Loading 2,095 programs…"
          : `${results.length.toLocaleString()} program${results.length === 1 ? "" : "s"} found` +
            (results.length > DISPLAY_CAP
              ? ` — showing the first ${DISPLAY_CAP}, refine your search to narrow down`
              : "")}
      </p>

      <ul className="flex flex-col gap-3">
        {results.slice(0, DISPLAY_CAP).map((p) => {
          const b = badge(p);
          const where = [p.city, p.state].filter(Boolean).join(", ");
          return (
            <li key={p.id}>
              <details className="group rounded-lg border border-zinc-200 open:border-zinc-400">
                <summary className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 marker:content-none">
                  <span className="font-semibold">{p.name}</span>
                  {where && <span className="text-zinc-600">{where}</span>}
                  <span
                    className={`ml-auto rounded-full border px-2 py-0.5 text-xs ${b.cls}`}
                  >
                    {b.label}
                  </span>
                </summary>
                <div className="flex flex-col gap-2 border-t border-zinc-200 px-4 py-3 text-sm">
                  {p.website ? (
                    <p>
                      <a
                        className="font-medium text-orange-700 underline underline-offset-4 hover:text-orange-900"
                        href={p.website}
                        rel="noopener"
                      >
                        Visit website
                      </a>
                    </p>
                  ) : (
                    <p className="text-zinc-600">
                      No website on file yet — our verification agents are
                      working on it.
                    </p>
                  )}
                  {p.type && (
                    <p className="text-zinc-700">Type: {p.type}</p>
                  )}
                  {p.sources && p.sources.length > 0 && (
                    <p className="text-zinc-600">
                      Listed by: {p.sources.join(", ")}
                    </p>
                  )}
                  <p className="text-zinc-600">
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
