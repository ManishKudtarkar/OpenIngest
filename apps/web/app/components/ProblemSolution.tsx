import { X, Check } from "lucide-react";

const BEFORE = [
  "Write a custom Python script per data source",
  "Manually create database tables with SQL",
  "Bad data silently loads — no schema check",
  "No quality checks — nulls and dupes slip through",
  "Edit the Airflow DAG every time a dataset changes",
  "Zero visibility into rows, timing, or quality",
  "Manually track watermarks for incremental loads",
];

const AFTER = [
  "Drop file into data/raw/ — auto-discovered",
  "Tables created from config — zero SQL",
  "Schema validation fails fast before data moves",
  "Quality engine scores every dataset every run",
  "New YAML entry → DAG task group appears in Airflow",
  "Full metadata: run ID, rows, duration, quality score",
  "Watermarks persisted automatically in DB state table",
];

export default function ProblemSolution() {
  return (
    <section className="relative py-24">
      <div className="absolute inset-0">
        <div className="absolute inset-y-0 inset-x-0 bg-gradient-to-b from-[#04060d] via-[#080c18]/50 to-[#04060d]" />
      </div>
      <div className="relative max-w-[1380px] mx-auto px-6 lg:px-12">

        <div className="text-center mb-16">
          <h2 className="f-head text-[38px] md:text-[48px] font-bold text-white leading-[1.1] tracking-[-0.025em] mb-4">
            The old way is broken.{" "}
            <span className="g-text">This is the fix.</span>
          </h2>
          <p className="text-[#94A3B8] text-[16px] max-w-lg mx-auto">
            Every team reinvents the same ingestion pipeline. OpenIngest solves it once.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Before */}
          <div className="panel rounded-2xl p-7 border-rose-500/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <X size={15} className="text-rose-400" />
              </div>
              <h3 className="f-head font-semibold text-white">Without OpenIngest</h3>
            </div>
            <ul className="space-y-3">
              {BEFORE.map(s => (
                <li key={s} className="flex gap-3 text-[13px] text-[#475569] leading-snug">
                  <X size={13} className="text-rose-500/50 mt-0.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* After */}
          <div className="panel rounded-2xl p-7 border-emerald-500/15 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Check size={15} className="text-emerald-400" />
              </div>
              <h3 className="f-head font-semibold text-white">With OpenIngest</h3>
            </div>
            <ul className="space-y-3">
              {AFTER.map(s => (
                <li key={s} className="flex gap-3 text-[13px] text-[#CBD5E1] leading-snug">
                  <Check size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
