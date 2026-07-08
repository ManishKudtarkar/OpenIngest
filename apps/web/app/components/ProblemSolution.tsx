import { X, Check, ArrowRight } from "lucide-react";

const BEFORE = [
  "New CSV → write a new ingestion script",
  "Manually write SQL DDL for every staging table",
  "Schema changes break pipelines silently",
  "Quality issues discovered downstream, too late",
  "Airflow DAG needs editing for every new dataset",
  "No metadata — no run history, no quality scores",
  "Watermarks tracked in code comments (or not at all)",
];

const AFTER = [
  "New CSV → add one YAML entry, done",
  "Tables auto-created from inferred column types",
  "Schema validation blocks bad data before load",
  "Quality engine scores every dataset every run",
  "New YAML entry auto-generates a DAG task group",
  "Full metadata per run: ID, rows, quality, duration",
  "Watermark state persisted automatically between runs",
];

export default function ProblemSolution() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#04060d] via-[#06090f] to-[#04060d]" />

      <div className="section-container">

        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="f-head text-[36px] md:text-[46px] font-bold text-white leading-[1.1] tracking-[-0.025em] mb-4">
            The old way is expensive.{" "}
            <span className="g-text">This is the fix.</span>
          </h2>
          <p className="text-[#64748B] text-[15px] max-w-md mx-auto">
            Every team builds the same ingestion layer from scratch.
            OpenIngest makes it a one-time config problem.
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">

          {/* Before */}
          <div className="panel rounded-2xl p-7 relative overflow-hidden" style={{ borderColor: "rgba(244,63,94,0.12)" }}>
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(244,63,94,0.04),transparent_50%)]" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <X size={14} className="text-rose-400" />
                </div>
                <div>
                  <div className="f-head font-bold text-white text-[14px]">Without OpenIngest</div>
                  <div className="text-[11px] text-rose-500/60 mt-0.5">Script per dataset. No standards.</div>
                </div>
              </div>
              <ul className="space-y-3">
                {BEFORE.map(s => (
                  <li key={s} className="flex gap-3 text-[13px] text-[#475569] leading-snug">
                    <X size={12} className="text-rose-500/40 mt-0.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center px-2">
            <div className="flex flex-col items-center gap-3">
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
              <div className="w-9 h-9 rounded-full border border-white/10 bg-white/4 flex items-center justify-center">
                <ArrowRight size={14} className="text-[#475569]" />
              </div>
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
            </div>
          </div>

          {/* After */}
          <div className="panel rounded-2xl p-7 relative overflow-hidden" style={{ borderColor: "rgba(16,185,129,0.15)" }}>
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.04),transparent_50%)]" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check size={14} className="text-emerald-400" />
                </div>
                <div>
                  <div className="f-head font-bold text-white text-[14px]">With OpenIngest</div>
                  <div className="text-[11px] text-emerald-500/60 mt-0.5">Config-driven. Zero repetition.</div>
                </div>
              </div>
              <ul className="space-y-3">
                {AFTER.map(s => (
                  <li key={s} className="flex gap-3 text-[13px] text-[#CBD5E1] leading-snug">
                    <Check size={12} className="text-emerald-400/70 mt-0.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
