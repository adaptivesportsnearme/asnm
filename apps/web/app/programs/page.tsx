import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import DirectorySearch from "./search";

export const metadata: Metadata = {
  title: "Program directory — Adaptive Sports Near Me",
  description:
    "Search 2,095+ adaptive sports programs across the United States. Free, open, no login.",
};

export default function ProgramsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Program directory
        </h1>
        <p className="mb-8 text-ink-soft">
          Every listing shows how fresh its information is — honestly. Badges
          improve as our verification agents re-check each program.
        </p>
        <Suspense>
          <DirectorySearch />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
