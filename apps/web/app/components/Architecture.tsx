"use client";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

const PIPELINE = [
  { label: "CSV / Raw Files", src: "data/raw/", desc: "Source CSV files land here. OpenIngest scans this directory automatically.", accent: "#64748B" },
  { label: "Dataset Discovery", src: "core/discovery.py", desc: "Detects every file in data/raw/ and builds Dataset objects from config. No manual registration step.", accent: "#6366F1" },
  { label: "Config Registration", src: "configs/datasets.yaml", desc: "One YAML file defines everything: load strategy, required columns, primary keys, quality rules, watermarks.", accent: "#8B5CF6" },
  { label: "Schema Validation", src: "core/validation.py", desc: "Required columns must exist. Missing or extra columns are reported. Pipeline halts here if validation fails.", accent: "#22D3EE" },
  { label: "Data Quality Engine", src: "core/quality.py", desc: "Runs non_null, unique, and range checks. Produces a 0–100% quality score per dataset. PASS required to proceed.", accent: "#10B981" },
  { label: "Ingestion Engine", src: "core/ingestion.py", desc: "Three strategies: replace (truncate+reload), append (insert only), incremental (watermark + SHA-256 hash CDC + upsert).", accent: "#A855F7" },
  { label: "PostgreSQL Staging", src: "utils/db.py", desc: "Tables auto-created from inferred types. Eight staging tables: stg_customers, stg_orders, stg_products, and more.", accent: "#3B82F6" },
  { label: "Metadata Logger", src: "utils/metadata_logger.py", desc: "Records run ID, status, duration, rows loaded, per-dataset breakdown. Stored in pipeline_runs and pipeline_dataset_runs.", accent: "#F59E0B" },
  { label: "Execution Report", src: "core/reporting.py", desc: "Summarises datasets found, processed, rows loaded, duration, and status. View with openingest report.", accent: "#F97316" },
  { label: "Airflow Task Factory", src: "core/airflow/task_factory.py", desc: "Generates one task group per dataset — discover → validate_schema → quality_check → ingest. All inside openingest_dynamic_pipeline.", accent: "#14B8A6" },
  { label: "Apache Airflow", src: "dags/openingest_dynamic_dag.py", desc: "Runs the full pipeline on @daily schedule. UI at localhost:8080. No DAG edits needed when datasets change.", accent: "#EF4444" },
];

export default function Architecture() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="architecture" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[#080c18]" />
      <div className="absolute inset-0 dot-grid opacity-30" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

      <div className="relative max-w-[1380px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 tag text-cyan-400 border-cyan-500/25 bg-cyan-500/8 mb-5">
            End-to-end pipeline
          </div>
          <h2 className="f-head text-[42px] md:text-[52px] font-bold text-white leading-[1.1] tracking-[-0.025em] mb-5">
            How it works.
          </h2>
          <p className="text-[#94A3B8] text-[16px]">
            Click any stage — see the source file and what it does.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Pipeline flow */}
          <div className="flex flex-col items-center gap-0">
            {PIPELINE.map((node, i) => {
              const on = active === i;
              return (
                <div key={node.label} className="w-full flex flex-col items-center">
                  <button
                    onClick={() => setActive(on ? null : i)}
                    className={`w-full rounded-xl px-4 py-3.5 flex items-center gap-4 transition-all duration-200 text-left border
                    ${on
                        ? "border-white/12 bg-white/4"
                        : "border-transparent hover:border-white/6 hover:bg-white/2"
                      }`}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px] f-head font-bold"
                      style={{
                        background: on ? `${node.accent}18` : "rgba(255,255,255,0.04)",
                        border: `1px solid ${on ? node.accent + "30" : "rgba(255,255,255,0.07)"}`,
                        color: on ? node.accent : "#475569",
                      }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[13px] font-semibold f-head transition-colors ${on ? "text-white" : "text-[#94A3B8]"}`}>
                        {node.label}
                      </div>
                      <div className="text-[11px] text-[#334155] f-mono mt-0.5 truncate">{node.src}</div>
                    </div>
                    <ChevronRight size={13}
                      className={`text-[#334155] transition-transform shrink-0 ${on ? "rotate-90 text-[#64748B]" : ""}`} />
                  </button>

                  {on && (
                    <div className="w-full mx-1 px-5 py-3.5 rounded-b-xl border-x border-b border-white/6 -mt-1.5 text-[13px] text-[#94A3B8] leading-relaxed"
                      style={{ background: `${node.accent}06` }}>
                      {node.desc}
                    </div>
                  )}

                  {i < PIPELINE.length - 1 && (
                    <div className="w-px h-5 connector" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: visual diagram */}
          <div className="lg:sticky lg:top-28 panel-raised rounded-2xl p-6 border border-white/8">
            <div className="text-[12px] text-[#475569] f-mono uppercase tracking-widest mb-5">
              openingest_dynamic_pipeline
            </div>
            <div className="space-y-1.5">
              {PIPELINE.map((node, i) => (
                <button
                  key={node.label}
                  onClick={() => setActive(active === i ? null : i)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left
                  ${active === i ? "bg-white/6" : "hover:bg-white/3"}`}
                >
                  <div className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                    style={{ background: `${node.accent}20` }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: node.accent }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-[12.5px] f-head ${active === i ? "text-white" : "text-[#64748B]"}`}>
                      {node.label}
                    </span>
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <div className="text-[10px] text-[#1E293B]">↓</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
