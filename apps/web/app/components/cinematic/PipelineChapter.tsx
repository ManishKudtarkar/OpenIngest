"use client";
import { useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ChevronRight } from "lucide-react";

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const STEPS = [
  { n: "01", label: "Source",              src: "data/raw/ or source: block",         desc: "CSV, Parquet, S3, MongoDB, Salesforce — or any of the 17 connectors.",          accent: "#64748B" },
  { n: "02", label: "Dataset Discovery",   src: "core/discovery.py",                  desc: "Reads datasets.yaml and builds Dataset objects automatically. Zero changes needed when adding new sources.", accent: "#6366F1" },
  { n: "03", label: "Schema Validation",   src: "core/validation.py",                 desc: "Required columns verified. Missing or extra fields caught. Pipeline halts early on failure.", accent: "#22D3EE" },
  { n: "04", label: "Data Quality Engine", src: "core/quality.py",                    desc: "Non-null, unique, range, regex, and custom df.eval() rules. 0–100% quality score every run.", accent: "#10B981" },
  { n: "05", label: "Transform Engine",    src: "core/transform.py",                  desc: "rename → cast → filter → derive → aggregate → python. Six declarative YAML steps.", accent: "#F59E0B" },
  { n: "06", label: "Ingestion Engine",    src: "core/ingestion.py",                  desc: "replace / append / incremental. Incremental = watermark + SHA-256 hash CDC + upsert.", accent: "#8B5CF6" },
  { n: "07", label: "PostgreSQL Staging",  src: "utils/db.py",                        desc: "Tables auto-created from inferred types. No SQL. No migrations.", accent: "#3B82F6" },
  { n: "08", label: "Metadata Logger",     src: "utils/metadata_logger.py",           desc: "Writes run ID, status, duration, rows, quality scores to pipeline_runs.", accent: "#F59E0B" },
  { n: "09", label: "Airflow DAG",         src: "dags/openingest_dynamic_pipeline",   desc: "Every dataset → discover → validate_schema → quality_check → ingest. Auto-generated.", accent: "#EF4444" },
];

export default function PipelineChapter() {
  const [active, setActive] = useState<number | null>(null);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id="pipeline" ref={ref} className="relative py-32 overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute inset-0 bg-[#080c18]" />
        <div className="absolute inset-0 dot-grid opacity-15" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="chapter-num absolute -left-6 top-1/2 -translate-y-1/2 opacity-[0.03]">02</div>
      </motion.div>

      <div className="wrap relative z-10">
        {/* header */}
        <FadeUp>
          <div className="chapter-label mb-8 flex items-center gap-3">
            <span className="w-8 h-px bg-cyan-500/40" />
            <span>Chapter 02</span>
            <span className="text-[#1E293B]">/</span>
            <span className="text-[#334155]">How It Works</span>
          </div>
        </FadeUp>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* left: steps */}
          <div>
            <FadeUp delay={0.05}>
              <h2 className="f-head font-bold leading-[1.06] tracking-[-0.03em] text-[clamp(28px,4vw,48px)] text-white mb-4">
                Nine stages.<br/>
                <span className="g-text">Every run.</span>
              </h2>
              <p className="text-[#475569] text-[14px] leading-relaxed mb-10">
                Click any stage to see what it does and which file handles it.
              </p>
            </FadeUp>

            <div className="flex flex-col">
              {STEPS.map((step, i) => {
                const on = active === i;
                return (
                  <FadeUp key={step.n} delay={0.05 + i * 0.04}>
                    <div>
                      <button
                        onClick={() => setActive(on ? null : i)}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border text-left transition-all duration-200
                          ${on ? "border-white/10 bg-white/3" : "border-transparent hover:border-white/5 hover:bg-white/2"}`}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[11px] f-head font-bold transition-all"
                          style={{
                            background: on ? `${step.accent}18` : "rgba(255,255,255,0.03)",
                            border: `1px solid ${on ? step.accent + "30" : "rgba(255,255,255,0.07)"}`,
                            color: on ? step.accent : "#334155",
                          }}
                        >
                          {step.n}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-[13px] font-semibold f-head transition-colors ${on ? "text-white" : "text-[#64748B]"}`}>
                            {step.label}
                          </div>
                          <div className="text-[10.5px] text-[#1E293B] f-mono mt-0.5 truncate">{step.src}</div>
                        </div>
                        <ChevronRight size={12} className={`text-[#1E293B] transition-transform shrink-0 ${on ? "rotate-90 text-[#475569]" : ""}`} />
                      </button>

                      {on && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div
                            className="mx-2 px-5 py-3 rounded-b-xl border-x border-b border-white/5 text-[12.5px] text-[#94A3B8] leading-relaxed -mt-1"
                            style={{ background: `${step.accent}06` }}
                          >
                            {step.desc}
                          </div>
                        </motion.div>
                      )}

                      {i < STEPS.length - 1 && (
                        <div className="ml-6 w-px h-4 connector" />
                      )}
                    </div>
                  </FadeUp>
                );
              })}
            </div>
          </div>

          {/* right: sticky diagram */}
          <div className="lg:sticky lg:top-28">
            <FadeUp delay={0.15}>
              <div className="glass-glow rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5">
                  <div className="text-[10.5px] text-[#334155] f-mono uppercase tracking-widest">
                    openingest_dynamic_pipeline
                  </div>
                </div>
                <div className="px-4 py-4 space-y-1">
                  {STEPS.map((step, i) => (
                    <motion.button
                      key={step.n}
                      onClick={() => setActive(active === i ? null : i)}
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.15 }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
                        ${active === i ? "bg-white/5" : "hover:bg-white/2"}`}
                    >
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                        style={{ background: `${step.accent}18` }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: step.accent }} />
                      </div>
                      <span className={`text-[12px] f-head flex-1 ${active === i ? "text-white" : "text-[#475569]"}`}>
                        {step.label}
                      </span>
                      {i < STEPS.length - 1 && (
                        <span className="text-[10px] text-[#1E293B]">↓</span>
                      )}
                    </motion.button>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-white/5 bg-white/[0.01]">
                  <span className="text-[10px] text-[#1E293B] f-mono">
                    {active !== null ? STEPS[active].src : "click any stage"}
                  </span>
                </div>
              </div>
            </FadeUp>

            {/* YAML snippet */}
            <FadeUp delay={0.25} className="mt-4">
              <div className="glass rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-white/5 flex justify-between items-center">
                  <span className="text-[10.5px] text-[#334155] f-mono">configs/datasets.yaml</span>
                  <span className="tag text-[9px] text-indigo-400 border-indigo-500/20 bg-indigo-500/6">zero Python</span>
                </div>
                <div className="px-5 py-4 f-mono text-[11.5px] leading-[1.9]">
                  <div className="text-[#6366F1] font-bold">customers:</div>
                  <div><span className="text-[#94A3B8]">  file: </span><span className="text-[#34D399]">customers.csv</span></div>
                  <div><span className="text-[#94A3B8]">  staging_table: </span><span className="text-[#34D399]">stg_customers</span></div>
                  <div><span className="text-[#94A3B8]">  load_strategy: </span><span className="text-[#FBBF24]">replace</span></div>
                  <div><span className="text-[#94A3B8]">  primary_key:</span></div>
                  <div><span className="text-[#94A3B8]">    - </span><span className="text-[#34D399]">customer_id</span></div>
                  <div className="text-[#1E293B] mt-2"># That&apos;s it. OpenIngest does the rest.</div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
