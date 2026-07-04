"use client";
import { useState } from "react";
import { ChevronDown, Wind } from "lucide-react";

const DATASETS = [
  { name: "customers",   strategy: "replace",     c: "#6366F1" },
  { name: "orders",      strategy: "incremental", c: "#8B5CF6" },
  { name: "products",    strategy: "replace",     c: "#3B82F6" },
  { name: "sessions",    strategy: "replace",     c: "#0EA5E9" },
  { name: "employees",   strategy: "replace",     c: "#14B8A6" },
  { name: "events",      strategy: "incremental", c: "#A855F7" },
  { name: "order_items", strategy: "replace",     c: "#6366F1" },
  { name: "reviews",     strategy: "incremental", c: "#EC4899" },
];

const TASKS = [
  { name: "discover",        c: "#6366F1" },
  { name: "validate_schema", c: "#22D3EE" },
  { name: "quality_check",   c: "#10B981" },
  { name: "ingest",          c: "#8B5CF6" },
];

export default function AirflowSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[#04060d]" />
      <div className="absolute right-0 top-1/2 w-[700px] h-[700px] bg-teal-600/4 rounded-full blur-[120px] -translate-y-1/2" />

      <div className="relative max-w-[1380px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <Wind size={16} className="text-teal-400" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-teal-400">Apache Airflow 2.9</div>
                <div className="text-[11px] text-[#334155]">localhost:8080 · admin/admin</div>
              </div>
            </div>

            <h2 className="f-head text-[38px] md:text-[48px] font-bold text-white leading-[1.1] tracking-[-0.025em] mb-5">
              Dynamic DAGs.{" "}
              <span className="g-text-green">Zero edits.</span>
            </h2>
            <p className="text-[#94A3B8] text-[15px] leading-relaxed mb-6">
              Every entry in <code className="text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded f-mono text-[12px]">datasets.yaml</code> automatically
              becomes a 4-task group inside <code className="text-teal-300 bg-teal-500/10 px-1.5 py-0.5 rounded f-mono text-[12px]">openingest_dynamic_pipeline</code>.
              Add a dataset to YAML — the DAG updates. No DAG code to touch.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                ["8", "datasets"],
                ["4", "tasks / dataset"],
                ["32", "total tasks"],
                ["@daily", "schedule"],
              ].map(([v, l]) => (
                <div key={l} className="panel rounded-xl px-4 py-3">
                  <div className="f-head text-[22px] font-bold text-white">{v}</div>
                  <div className="text-[11px] text-[#475569] mt-0.5">{l}</div>
                </div>
              ))}
            </div>

            <div className="panel-raised rounded-xl p-4 f-mono text-[12px] text-[#94A3B8] leading-relaxed">
              <div className="text-[#475569] mb-2"># Task group structure per dataset:</div>
              <div><span className="text-[#6366F1]">discover</span><span className="text-[#334155]"> → </span><span className="text-[#22D3EE]">validate_schema</span><span className="text-[#334155]"> → </span><span className="text-[#10B981]">quality_check</span><span className="text-[#334155]"> → </span><span className="text-[#8B5CF6]">ingest</span></div>
            </div>
          </div>

          {/* Right: DAG view */}
          <div className="panel-glow rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div>
                <div className="text-[12px] text-white font-semibold f-head">openingest_dynamic_pipeline</div>
                <div className="text-[11px] text-[#334155] f-mono mt-0.5">schedule: @daily (cron: 0 0 * * *)</div>
              </div>
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                running
              </span>
            </div>

            <div className="px-4 py-4">
              {/* start */}
              <div className="flex justify-center mb-3">
                <div className="panel rounded-lg px-4 py-2 text-[11px] text-[#64748B] f-mono border-white/8">
                  ● start
                </div>
              </div>

              {/* Dataset groups */}
              <div className="space-y-1 mb-3">
                {DATASETS.map((ds, i) => (
                  <div key={ds.name}>
                    <button
                      onClick={() => setOpen(open === i ? null : i)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all
                      ${open === i ? "border-white/10 bg-white/4" : "border-transparent hover:border-white/6 hover:bg-white/2"}`}
                    >
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: ds.c }} />
                      <span className="f-mono text-[12px] text-[#94A3B8] flex-1 text-left">{ds.name}</span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ color: ds.c, background: `${ds.c}15`, border: `1px solid ${ds.c}25` }}>
                        {ds.strategy}
                      </span>
                      <ChevronDown size={11} className={`text-[#334155] transition-transform ${open === i ? "rotate-180" : ""}`} />
                    </button>
                    {open === i && (
                      <div className="flex items-center gap-1 px-5 py-2 mt-0.5 ml-5 rounded-lg border border-white/5 bg-[#04060d]/60">
                        {TASKS.map((t, ti) => (
                          <div key={t.name} className="flex items-center gap-1">
                            <span className="f-mono text-[10px] px-2 py-1 rounded border"
                              style={{ color: t.c, borderColor: `${t.c}25`, background: `${t.c}10` }}>
                              {t.name}
                            </span>
                            {ti < TASKS.length - 1 && <span className="text-[#1E293B] text-[10px]">›</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* pipeline_report + end */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-px h-3 connector" />
                <div className="panel rounded-lg px-4 py-2 text-[11px] text-[#F59E0B] f-mono border-yellow-500/15">
                  pipeline_report
                </div>
                <div className="w-px h-3 connector" />
                <div className="panel rounded-lg px-4 py-2 text-[11px] text-[#64748B] f-mono border-white/8">
                  ● end
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/5 bg-white/1 flex justify-between text-[11px] text-[#334155] f-mono">
              <span>8 datasets · 32 tasks</span>
              <span>cron: 0 0 * * *</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
