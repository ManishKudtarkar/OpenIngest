"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const BEFORE = [
  "New dataset → write a brand new Python script",
  "Manually author SQL DDL for each staging table",
  "Schema changes break pipelines silently",
  "Quality issues only appear in downstream reports",
  "Airflow DAG must be edited for every new source",
  "No run history, quality scores, or lineage",
];
const AFTER = [
  "New dataset → add one YAML block, done",
  "Tables auto-created from inferred column types",
  "Schema validation blocks bad data before load",
  "Quality engine scores every dataset every run",
  "New YAML entry auto-generates a DAG task group",
  "Full metadata, quality, and lineage every run",
];

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 36 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

const MARQUEE_ITEMS = [
  "Dataset Discovery","Schema Validation","Data Quality Engine","Incremental Loading",
  "Auto DDL","Metadata Logging","Airflow DAG","17 Connectors",
  "YAML Transforms","Slack + Email Alerts","Built-in Scheduler","Docker Ready",
];

export default function ManifestoChapter() {
  return (
    <section
      id="manifesto"
      style={{ background: "#060810", position: "relative", overflow: "hidden", paddingTop: "clamp(5rem,9vw,8rem)", paddingBottom: "clamp(5rem,9vw,8rem)" }}
    >
      {/* top / bottom separator lines */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.25),transparent)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.18),transparent)" }} />
      {/* bg texture */}
      <div className="absolute inset-0 dot-bg" style={{ opacity: 0.15 }} />
      {/* giant background "01" */}
      <div className="f-head absolute select-none pointer-events-none" style={{
        right: "-1rem", top: "50%", transform: "translateY(-50%)",
        fontSize: "clamp(140px,22vw,260px)", fontWeight: 900,
        letterSpacing: "-0.06em", lineHeight: 1, color: "transparent",
        WebkitTextStroke: "1px rgba(99,102,241,0.06)",
      }}>01</div>

      <div className="site-pad relative z-10">

        <FadeUp>
          <span className="eyebrow" style={{ marginBottom: "2rem", display: "inline-flex" }}>Chapter 01 / The Problem</span>
        </FadeUp>

        <FadeUp delay={0.08}>
          <h2 className="f-head" style={{ fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.04em", fontSize: "clamp(2.6rem,7vw,5rem)", marginBottom: "1.5rem" }}>
            <span style={{ display: "block", color: "#F1F5F9" }}>The old way is expensive.</span>
            <span className="g-indigo-cyan" style={{ display: "block" }}>This is the fix.</span>
          </h2>
        </FadeUp>

        <FadeUp delay={0.16}>
          <p style={{ color: "#475569", fontSize: "clamp(15px,1.5vw,18px)", lineHeight: 1.8, maxWidth: 600, marginBottom: "clamp(3rem,5vw,4.5rem)" }}>
            Every data team builds the same ingestion layer from scratch —
            ad-hoc scripts, manual DDL, zero standards, zero observability.
            OpenIngest makes it a one-time YAML configuration problem.
          </p>
        </FadeUp>

        {/* ─── Before / After ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          {/* BEFORE */}
          <FadeUp delay={0.22}>
            <div style={{
              borderRadius: "1.25rem",
              border: "1px solid rgba(244,63,94,0.14)",
              background: "linear-gradient(160deg,rgba(244,63,94,0.04) 0%,rgba(244,63,94,0.01) 100%)",
              padding: "clamp(1.5rem,3vw,2.5rem)",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(244,63,94,0.45),transparent)" }} />
              {/* header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "2rem" }}>
                <div style={{ width: 40, height: 40, borderRadius: "0.75rem", background: "rgba(244,63,94,0.10)", border: "1px solid rgba(244,63,94,0.20)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#F43F5E", fontSize: 16, fontWeight: 700 }}>✕</span>
                </div>
                <div>
                  <div className="f-head" style={{ color: "#F1F5F9", fontWeight: 700, fontSize: 15 }}>Without OpenIngest</div>
                  <div style={{ color: "rgba(244,63,94,0.5)", fontSize: 12, marginTop: 2 }}>Script per dataset · no standards</div>
                </div>
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {BEFORE.map(s => (
                  <li key={s} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <span style={{ color: "rgba(244,63,94,0.35)", fontSize: 13, lineHeight: 1.6, flexShrink: 0 }}>✕</span>
                    <span style={{ color: "#334155", fontSize: 14, lineHeight: 1.65 }}>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>

          {/* AFTER */}
          <FadeUp delay={0.34}>
            <div style={{
              borderRadius: "1.25rem",
              border: "1px solid rgba(16,185,129,0.16)",
              background: "linear-gradient(160deg,rgba(16,185,129,0.05) 0%,rgba(16,185,129,0.01) 100%)",
              padding: "clamp(1.5rem,3vw,2.5rem)",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(16,185,129,0.45),transparent)" }} />
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "2rem" }}>
                <div style={{ width: 40, height: 40, borderRadius: "0.75rem", background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.20)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#10B981", fontSize: 16, fontWeight: 700 }}>✓</span>
                </div>
                <div>
                  <div className="f-head" style={{ color: "#F1F5F9", fontWeight: 700, fontSize: 15 }}>With OpenIngest</div>
                  <div style={{ color: "rgba(16,185,129,0.55)", fontSize: 12, marginTop: 2 }}>Config-driven · zero repetition</div>
                </div>
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {AFTER.map(s => (
                  <li key={s} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <span style={{ color: "rgba(16,185,129,0.65)", fontSize: 13, lineHeight: 1.6, flexShrink: 0 }}>✓</span>
                    <span style={{ color: "#CBD5E1", fontSize: 14, lineHeight: 1.65 }}>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>
        </div>

        {/* marquee */}
        <FadeUp delay={0.5}>
          <div style={{ marginTop: "clamp(3rem,5vw,5rem)", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "1.25rem 0" }}>
            <div className="marquee-track">
              {[...Array(2)].map((_, ri) => (
                <div key={ri} style={{ display: "flex", alignItems: "center", gap: "3.5rem", paddingRight: "3.5rem" }}>
                  {MARQUEE_ITEMS.map(t => (
                    <span key={t} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: 11, color: "#1E293B", textTransform: "uppercase", letterSpacing: "0.14em", whiteSpace: "nowrap" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(99,102,241,0.35)", display: "inline-block", flexShrink: 0 }} />
                      {t}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
