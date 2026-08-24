"use client";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

const STEPS = [
  { n: "01", label: "Source",              src: "data/raw/ or source: block",       desc: "CSV, Parquet, S3, MongoDB, Salesforce — or any of the 17 connectors.",                   accent: "#64748B" },
  { n: "02", label: "Dataset Discovery",   src: "core/discovery.py",                desc: "Reads datasets.yaml and builds Dataset objects automatically. Zero code changes needed.", accent: "#6366F1" },
  { n: "03", label: "Schema Validation",   src: "core/validation.py",               desc: "Required columns verified. Missing/extra fields caught. Pipeline halts early on fail.",   accent: "#22D3EE" },
  { n: "04", label: "Data Quality Engine", src: "core/quality.py",                  desc: "Non-null, unique, range, regex, and df.eval() rules. 0–100% score every run.",          accent: "#10B981" },
  { n: "05", label: "Transform Engine",    src: "core/transform.py",                desc: "rename → cast → filter → derive → aggregate → python. Six YAML-declared steps.",        accent: "#F59E0B" },
  { n: "06", label: "Ingestion Engine",    src: "core/ingestion.py",                desc: "replace / append / incremental (watermark + SHA-256 hash CDC + upsert).",               accent: "#8B5CF6" },
  { n: "07", label: "PostgreSQL Staging",  src: "utils/db.py",                      desc: "Tables auto-created from inferred types. No SQL DDL. No migrations ever.",               accent: "#3B82F6" },
  { n: "08", label: "Metadata Logger",     src: "utils/metadata_logger.py",         desc: "Writes run ID, status, duration, rows, quality scores to pipeline_runs.",                accent: "#F59E0B" },
  { n: "09", label: "Airflow DAG",         src: "dags/openingest_dynamic_pipeline", desc: "Every dataset → discover → validate → quality → ingest. Auto-generated from YAML.",     accent: "#EF4444" },
];

export default function PipelineChapter() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section
      id="pipeline"
      style={{ background: "#02030a", position: "relative", overflow: "hidden", paddingTop: "clamp(5rem,9vw,8rem)", paddingBottom: "clamp(5rem,9vw,8rem)" }}
    >
      <div className="absolute inset-0 grid-bg" style={{ opacity: 0.3 }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(34,211,238,0.15),transparent)" }} />
      {/* bg number */}
      <div className="f-head absolute select-none pointer-events-none" style={{ left: "-1rem", top: "50%", transform: "translateY(-50%)", fontSize: "clamp(140px,22vw,260px)", fontWeight: 900, letterSpacing: "-0.06em", lineHeight: 1, color: "transparent", WebkitTextStroke: "1px rgba(99,102,241,0.05)" }}>02</div>

      <div className="site-pad relative z-10">
        <FadeUp>
          <span className="eyebrow" style={{ marginBottom: "2rem", display: "inline-flex" }}>Chapter 02 / How It Works</span>
        </FadeUp>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(2.5rem,5vw,5rem)", alignItems: "start" }}>
          {/* Left */}
          <div>
            <FadeUp delay={0.06}>
              <h2 className="f-head" style={{ fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.04em", fontSize: "clamp(2.4rem,5.5vw,4.2rem)", marginBottom: "1rem" }}>
                <span style={{ color: "#F1F5F9" }}>Nine stages.</span>
                <br />
                <span className="g-cyan">Every run.</span>
              </h2>
              <p style={{ color: "#475569", fontSize: 15, lineHeight: 1.75, marginBottom: "2.5rem" }}>
                Click any stage to see what it does and which file owns it.
              </p>
            </FadeUp>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {STEPS.map((step, i) => {
                const on = active === i;
                return (
                  <FadeUp key={step.n} delay={0.06 + i * 0.04}>
                    <div>
                      <button
                        onClick={() => setActive(on ? null : i)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          padding: "0.875rem 1rem",
                          borderRadius: "0.875rem",
                          border: `1px solid ${on ? "rgba(255,255,255,0.11)" : "transparent"}`,
                          background: on ? "rgba(255,255,255,0.035)" : "transparent",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all .2s",
                        }}
                        onMouseEnter={e => { if (!on) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.025)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)"; }}}
                        onMouseLeave={e => { if (!on) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "transparent"; }}}
                      >
                        {/* number badge */}
                        <div className="f-head" style={{
                          width: 36, height: 36, borderRadius: "0.6rem", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11.5, fontWeight: 700,
                          background: on ? `${step.accent}20` : "rgba(255,255,255,0.04)",
                          border: `1px solid ${on ? step.accent + "35" : "rgba(255,255,255,0.08)"}`,
                          color: on ? step.accent : "#334155",
                          transition: "all .2s",
                        }}>{step.n}</div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="f-head" style={{ fontSize: 13.5, fontWeight: 600, color: on ? "#F1F5F9" : "#64748B", transition: "color .2s" }}>{step.label}</div>
                          <div className="f-mono" style={{ fontSize: 10.5, color: "#1E293B", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{step.src}</div>
                        </div>

                        <span style={{ color: on ? "#64748B" : "#1E293B", transition: "transform .2s, color .2s", transform: on ? "rotate(90deg)" : "none", fontSize: 12 }}>›</span>
                      </button>

                      {on && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          transition={{ duration: 0.22 }}
                          style={{ overflow: "hidden" }}
                        >
                          <div style={{
                            margin: "0 0.5rem",
                            padding: "0.875rem 1.25rem",
                            borderRadius: "0 0 0.875rem 0.875rem",
                            border: `1px solid rgba(255,255,255,0.06)`,
                            borderTop: "none",
                            background: `${step.accent}08`,
                            fontSize: 13,
                            color: "#94A3B8",
                            lineHeight: 1.7,
                            marginTop: -2,
                          }}>
                            {step.desc}
                          </div>
                        </motion.div>
                      )}

                      {i < STEPS.length - 1 && (
                        <div className="connector-line" style={{ width: 1, height: 16, marginLeft: "1.875rem" }} />
                      )}
                    </div>
                  </FadeUp>
                );
              })}
            </div>
          </div>

          {/* Right sticky */}
          <div style={{ position: "sticky", top: "6rem" }}>
            <FadeUp delay={0.15}>
              {/* pipeline diagram */}
              <div style={{
                background: "rgba(6,8,16,0.8)",
                border: "1px solid rgba(99,102,241,0.20)",
                borderRadius: "1.25rem",
                overflow: "hidden",
                boxShadow: "0 0 80px rgba(99,102,241,0.07)",
              }}>
                <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span className="f-mono" style={{ fontSize: 10.5, color: "#334155", textTransform: "uppercase", letterSpacing: "0.12em" }}>openingest_dynamic_pipeline</span>
                </div>
                <div style={{ padding: "0.75rem" }}>
                  {STEPS.map((step, i) => (
                    <motion.button
                      key={step.n}
                      onClick={() => setActive(active === i ? null : i)}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.625rem 0.75rem",
                        borderRadius: "0.625rem",
                        background: active === i ? "rgba(255,255,255,0.05)" : "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        border: "none",
                      }}
                    >
                      <div style={{ width: 20, height: 20, borderRadius: "0.35rem", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${step.accent}20` }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: step.accent }} />
                      </div>
                      <span className="f-head" style={{ fontSize: 12.5, color: active === i ? "#F1F5F9" : "#475569", flex: 1 }}>{step.label}</span>
                      {i < STEPS.length - 1 && <span style={{ color: "#1E293B", fontSize: 10 }}>↓</span>}
                    </motion.button>
                  ))}
                </div>
                <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
                  <span className="f-mono" style={{ fontSize: 10, color: "#1E293B" }}>
                    {active !== null ? STEPS[active].src : "click any stage to inspect"}
                  </span>
                </div>
              </div>
            </FadeUp>

            {/* YAML card */}
            <FadeUp delay={0.25}>
              <div style={{ marginTop: "1rem", background: "rgba(6,8,16,0.75)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.25rem", overflow: "hidden" }}>
                <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="f-mono" style={{ fontSize: 10.5, color: "#334155" }}>configs/datasets.yaml</span>
                  <span className="tag" style={{ color: "#818CF8", borderColor: "rgba(99,102,241,0.20)", background: "rgba(99,102,241,0.08)", fontSize: 9.5 }}>zero Python</span>
                </div>
                <div className="f-mono" style={{ padding: "1rem 1.25rem", fontSize: 12, lineHeight: 1.9 }}>
                  <div style={{ color: "#6366F1", fontWeight: 700 }}>customers:</div>
                  <div><span style={{ color: "#94A3B8" }}>  file: </span><span style={{ color: "#34D399" }}>customers.csv</span></div>
                  <div><span style={{ color: "#94A3B8" }}>  staging_table: </span><span style={{ color: "#34D399" }}>stg_customers</span></div>
                  <div><span style={{ color: "#94A3B8" }}>  load_strategy: </span><span style={{ color: "#FBBF24" }}>replace</span></div>
                  <div><span style={{ color: "#94A3B8" }}>  primary_key:</span></div>
                  <div><span style={{ color: "#94A3B8" }}>    - </span><span style={{ color: "#34D399" }}>customer_id</span></div>
                  <div style={{ color: "#1E293B", marginTop: "0.5rem" }}># That&apos;s it. OpenIngest handles the rest.</div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
