import type { Metadata } from "next";
import Link from "next/link";
import DirectorySearch from "./search";

export const metadata: Metadata = {
  title: "Program directory — Adaptive Sports Near Me",
  description:
    "Search 2,095+ adaptive sports programs across the United States. Free, open, no login.",
};

export default function ProgramsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900">
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <nav className="mb-6 text-sm">
          <Link
            className="text-zinc-600 underline underline-offset-4 hover:text-zinc-900"
            href="/"
          >
            ← Adaptive Sports Near Me
          </Link>
        </nav>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Program directory
        </h1>
        <p className="mb-8 text-zinc-700">
          Every listing shows how fresh its information is — honestly. Badges
          improve as our verification agents re-check each program.
        </p>
        <DirectorySearch />
      </main>
      <footer className="border-t border-zinc-200">
        <div className="mx-auto w-full max-w-3xl px-6 py-6 text-sm text-zinc-600">
          A project of Adapt To Life · Data: CC BY 4.0 ·{" "}
          <a
            className="underline underline-offset-4"
            href="https://github.com/adaptivesportsnearme/asnm"
          >
            Open source
          </a>
        </div>
      </footer>
    </div>
  );
}
