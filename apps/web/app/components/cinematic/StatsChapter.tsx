"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

const METRICS = [
  { raw: 174777, fmt: (v: number) => v >= 1000 ? Math.floor(v/1000)+"k" : String(v), label: "rows loaded",       sub: "per pipeline run",          c: "#6366F1" },
  { raw: 17,     fmt: (v: number) => String(v),                                        label: "connectors",        sub: "CSV to Google Sheets",       c: "#22D3EE" },
  { raw: 421,    fmt: (v: number) => (v/100).toFixed(2)+"s",                           label: "pipeline runtime",  sub: "8 datasets end-to-end",      c: "#10B981" },
  { raw: 994,    fmt: (v: number) => (v/10).toFixed(1)+"%",                            label: "quality score",     sub: "avg across all datasets",    c: "#F59E0B" },
  { raw: 93,     fmt: (v: number) => String(v),                                        label: "tests passing",     sub: "ruff + mypy clean",           c: "#8B5CF6" },
  { raw: 6,      fmt: (v: number) => String(v),                                        label: "transform types",   sub: "rename→cast→filter→…",        c: "#EC4899" },
];

const FEATURES = [
  { title: "Dynamic Discovery",    src: "core/discovery.py",        accent: "#6366F1", desc: "Scans YAML and builds Dataset objects automatically. Zero code changes when adding sources." },
  { title: "Schema Validation",    src: "core/validation.py",       accent: "#22D3EE", desc: "Required columns verified, extra fields caught. Pipeline stops before any data moves." },
  { title: "Data Quality Engine",  src: "core/quality.py",          accent: "#10B981", desc: "Non-null, unique, range, regex, custom df.eval() rules. 0–100% score every run." },
  { title: "Incremental Loading",  src: "core/incremental.py",      accent: "#8B5CF6", desc: "Watermark filter + SHA-256 hash CDC + upsert. State persisted between runs." },
  { title: "Auto Table Creation",  src: "utils/db.py",              accent: "#3B82F6", desc: "Infers PostgreSQL types from source data. Tables created on first run. No SQL." },
  { title: "Metadata Tracking",    src: "utils/metadata_logger.py", accent: "#F59E0B", desc: "Run ID, status, duration, rows, quality logged to pipeline_runs every execution." },
  { title: "Airflow Integration",  src: "core/airflow/",            accent: "#14B8A6", desc: "One task group per dataset. discover → validate → quality → ingest. Auto from YAML." },
  { title: "Built-in Scheduler",   src: "core/scheduler.py",        accent: "#A855F7", desc: "scheduler start --cron @daily. No Airflow required for simple schedules." },
  { title: "Slack + Email Alerts", src: "core/notifications.py",    accent: "#EC4899", desc: "Webhook and SMTP notifications on success/failure with configurable retry." },
  { title: "Data Lineage",         src: "core/lineage.py",          accent: "#F97316", desc: "ASCII + Mermaid + JSON lineage graph. openingest graph command." },
  { title: "Docker Ready",         src: "docker-compose.yml",       accent: "#0EA5E9", desc: "PostgreSQL + Airflow in one command. docker compose up -d." },
  { title: "CI/CD Built-in",       src: ".github/workflows/",       accent: "#A855F7", desc: "Ruff lint + Mypy type-check + Pytest coverage on every push. 93 tests." },
];

export default function StatsChapter() {
  const metricsRef = useRef<HTMLDivElement>(null);
  const metricsVisible = useInView(metricsRef, { once: true, margin: "-80px" });
  const [vals, setVals] = useState(METRICS.map(() => 0));

  useEffect(() => {
    if (!metricsVisible) return;
    const dur = 2000;
    let t0: number | null = null;
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setVals(METRICS.map(m => Math.floor(m.raw * ease)));
      if (p < 1) requestAnimationFrame(tick);
      else setVals(METRICS.map(m => m.raw));
    };
    requestAnimationFrame(tick);
  }, [metricsVisible]);

  return (
    <section
      id="stats"
      style={{ background: "#060810", position: "relative", overflow: "hidden", paddingTop: "clamp(5rem,9vw,8rem)", paddingBottom: "clamp(5rem,9vw,8rem)" }}
    >
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(99,102,241,0.06), transparent)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)" }} />

      <div className="site-pad relative z-10">
        <FadeUp>
          <span className="eyebrow" style={{ marginBottom: "1rem", display: "inline-flex" }}>By the numbers · OI-20260703-3BB09C</span>
        </FadeUp>

        <FadeUp delay={0.06}>
          <h2 className="f-head" style={{ fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.04em", fontSize: "clamp(2.4rem,5.5vw,4rem)", marginBottom: "clamp(3rem,5vw,4.5rem)" }}>
            <span style={{ color: "#F1F5F9" }}>Real run.</span>{" "}
            <span className="g-indigo-cyan">Real numbers.</span>
          </h2>
        </FadeUp>

        {/* Metrics grid */}
        <div ref={metricsRef} style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "1rem", marginBottom: "clamp(4rem,7vw,6rem)" }}>
          {METRICS.map((m, i) => (
            <FadeUp key={m.label} delay={i * 0.07}>
              <div style={{
                background: "rgba(10,13,22,0.7)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "1.25rem",
                padding: "2rem 1.75rem",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                transition: "border-color .3s, transform .25s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${m.c}25`; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLElement).style.transform = ""; }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: m.c, opacity: 0.4 }} />
                <div className="f-head" style={{ fontSize: "clamp(2.2rem,4vw,3.5rem)", fontWeight: 800, letterSpacing: "-0.03em", color: m.c, lineHeight: 1, marginBottom: "0.6rem" }}>
                  {metricsVisible ? m.fmt(vals[i]) : "—"}
                </div>
                <div style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: "#1E293B", marginTop: 4 }}>{m.sub}</div>
              </div>
            </FadeUp>
          ))}
        </div>

        {/* Features */}
        <FadeUp>
          <h2 className="f-head" style={{ fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.04em", fontSize: "clamp(2.2rem,5vw,3.8rem)", marginBottom: "1rem" }}>
            <span style={{ color: "#F1F5F9" }}>13 production-grade</span>
            <br />
            <span className="g-indigo-cyan">components.</span>
          </h2>
          <p style={{ color: "#475569", fontSize: 16, lineHeight: 1.75, maxWidth: 560, marginBottom: "clamp(2.5rem,4vw,3.5rem)" }}>
            Every component is tested, wired together, and exercised on every real pipeline run.
          </p>
        </FadeUp>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "1rem" }}>
          {FEATURES.map(({ title, src, accent, desc }, i) => (
            <FadeUp key={title} delay={(i % 4) * 0.05 + Math.floor(i / 4) * 0.04}>
              <div
                style={{
                  background: "rgba(10,13,22,0.65)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "1.25rem",
                  padding: "1.5rem",
                  position: "relative",
                  overflow: "hidden",
                  transition: "border-color .3s, transform .25s, box-shadow .3s",
                  cursor: "default",
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${accent}28`; el.style.transform = "translateY(-2px)"; el.style.boxShadow = `0 16px 50px rgba(0,0,0,0.3)`; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,0.07)"; el.style.transform = ""; el.style.boxShadow = ""; }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${accent}40,transparent)` }} />
                <div style={{ width: 36, height: 36, borderRadius: "0.75rem", background: `${accent}14`, border: `1px solid ${accent}22`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: accent }} />
                </div>
                <div className="f-head" style={{ fontSize: 14, fontWeight: 600, color: "#F1F5F9", marginBottom: "0.5rem" }}>{title}</div>
                <p style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.65, marginBottom: "1rem" }}>{desc}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: accent, flexShrink: 0 }} />
                  <code className="f-mono" style={{ fontSize: 10.5, color: "#1E293B" }}>{src}</code>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
