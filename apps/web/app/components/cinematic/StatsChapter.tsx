"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

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
  { raw: 174777, fmt: (v: number) => v >= 1000 ? (v / 1000).toFixed(0) + "k" : v.toString(), display: "174k", label: "rows loaded",        sub: "per pipeline run",       c: "#6366F1" },
  { raw: 17,     fmt: (v: number) => v.toString(),                                             display: "17",   label: "connectors",          sub: "CSV to Google Sheets",   c: "#22D3EE" },
  { raw: 421,    fmt: (v: number) => (v / 100).toFixed(2) + "s",                               display: "4.21s",label: "pipeline duration",   sub: "8 datasets end-to-end",  c: "#10B981" },
  { raw: 994,    fmt: (v: number) => (v / 10).toFixed(1) + "%",                                display: "99.4%",label: "quality score",       sub: "avg across all datasets", c: "#F59E0B" },
  { raw: 93,     fmt: (v: number) => v.toString(),                                             display: "93",   label: "tests passing",       sub: "ruff + mypy clean",       c: "#8B5CF6" },
  { raw: 6,      fmt: (v: number) => v.toString(),                                             display: "6",    label: "transform types",     sub: "rename→cast→filter→…",    c: "#EC4899" },
];

const FEATURES = [
  { title: "Dynamic Discovery",    src: "core/discovery.py",        accent: "#6366F1", desc: "Scans YAML config and builds Dataset objects automatically. Zero code changes when adding sources." },
  { title: "Schema Validation",    src: "core/validation.py",       accent: "#22D3EE", desc: "Required columns verified, missing and extra fields caught. Pipeline halts before any data moves." },
  { title: "Data Quality Engine",  src: "core/quality.py",          accent: "#10B981", desc: "Non-null, unique, range, regex, and custom df.eval() rules. 0–100% score on every single run." },
  { title: "Incremental Loading",  src: "core/incremental.py",      accent: "#8B5CF6", desc: "Watermark filter + SHA-256 hash CDC + ON CONFLICT DO UPDATE. State persisted between runs." },
  { title: "Auto Table Creation",  src: "utils/db.py",              accent: "#3B82F6", desc: "Infers PostgreSQL column types from source data. Creates staging tables on first run. No SQL." },
  { title: "Metadata Tracking",    src: "utils/metadata_logger.py", accent: "#F59E0B", desc: "Run ID, status, duration, rows loaded, and quality scores written to pipeline_runs every time." },
  { title: "Airflow Integration",  src: "core/airflow/",            accent: "#14B8A6", desc: "One task group per dataset — discover → validate → quality → ingest. DAG auto-updates from YAML." },
  { title: "Built-in Scheduler",   src: "core/scheduler.py",        accent: "#A855F7", desc: "openingest scheduler start --cron @daily. No Airflow needed for simple scheduling." },
  { title: "Slack + Email Alerts", src: "core/notifications.py",    accent: "#EC4899", desc: "Webhook and SMTP notifications on success/failure. Configurable retry policies." },
  { title: "Data Lineage",         src: "core/lineage.py",          accent: "#F97316", desc: "ASCII + Mermaid + JSON lineage graph export. openingest graph command." },
  { title: "Docker Ready",         src: "docker-compose.yml",       accent: "#0EA5E9", desc: "PostgreSQL + Airflow in one command. docker compose up -d and you are running." },
  { title: "CI/CD Built-in",       src: ".github/workflows/",       accent: "#A855F7", desc: "Ruff lint, Mypy type-check, Pytest with coverage on every push. 93 tests." },
];

export default function StatsChapter() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

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
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ paddingTop: "clamp(6rem,10vw,10rem)", paddingBottom: "clamp(6rem,10vw,10rem)" }}
    >
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute inset-0 bg-[#060a12]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(99,102,241,0.06),transparent)]" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />
      </motion.div>

      <div className="wrap relative z-10">

        <FadeUp>
          <div className="chapter-label mb-4 flex items-center gap-3">
            <span className="w-10 h-px bg-indigo-500/40" />
            <span>By the numbers</span>
            <span className="text-[#1E293B] mx-1">·</span>
            <span className="text-[#1E293B] f-mono text-[10px]">OI-20260703-3BB09C</span>
          </div>
        </FadeUp>

        <FadeUp delay={0.06}>
          <h2 className="f-head font-bold leading-[1.04] tracking-[-0.035em] mb-16" style={{ fontSize: "clamp(36px,5.5vw,60px)" }}>
            <span className="text-white">Real run.</span>{" "}
            <span className="g-text">Real numbers.</span>
          </h2>
        </FadeUp>

        {/* Metrics */}
        <div ref={metricsRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-24">
          {METRICS.map((m, i) => (
            <FadeUp key={m.label} delay={i * 0.07}>
              <div
                className="feat-card text-center group"
                style={{ padding: "1.75rem 1.25rem" }}
              >
                <div
                  className="f-head font-bold leading-none mb-3 tabular-nums"
                  style={{ fontSize: "clamp(28px,4vw,42px)", color: m.c }}
                >
                  {metricsVisible ? m.fmt(vals[i]) : "—"}
                </div>
                <div className="text-[12.5px] text-[#64748B] font-medium leading-snug">{m.label}</div>
                <div className="text-[10.5px] text-[#1E293B] mt-1.5">{m.sub}</div>
              </div>
            </FadeUp>
          ))}
        </div>

        {/* Features header */}
        <FadeUp>
          <h2
            className="f-head font-bold leading-[1.04] tracking-[-0.035em] mb-4"
            style={{ fontSize: "clamp(36px,5.5vw,58px)" }}
          >
            <span className="text-white">13 production-grade</span>
            <br />
            <span className="g-text">components.</span>
          </h2>
          <p className="text-[#475569] text-[16px] leading-relaxed mb-12 max-w-xl">
            Every component is tested, wired together, and used on real runs.
            Add YAML. OpenIngest does the rest.
          </p>
        </FadeUp>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {FEATURES.map(({ title, src, accent, desc }, i) => (
            <FadeUp key={title} delay={(i % 4) * 0.05 + Math.floor(i / 4) * 0.04}>
              <div
                className="feat-card group h-full"
                style={{ padding: "1.5rem" }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  (e.currentTarget as HTMLElement).style.setProperty("--mx", `${e.clientX - rect.left}px`);
                  (e.currentTarget as HTMLElement).style.setProperty("--my", `${e.clientY - rect.top}px`);
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-5 shrink-0"
                  style={{ background: accent + "14", border: `1px solid ${accent}22` }}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: accent }} />
                </div>
                <h3 className="f-head font-semibold text-white text-[14px] mb-2.5 leading-snug">{title}</h3>
                <p className="text-[#475569] text-[12.5px] leading-relaxed mb-5 group-hover:text-[#64748B] transition-colors flex-1">
                  {desc}
                </p>
                <div className="flex items-center gap-2 mt-auto">
                  <div className="w-1 h-1 rounded-full shrink-0" style={{ background: accent }} />
                  <code className="text-[10.5px] text-[#1E293B] f-mono group-hover:text-[#334155] transition-colors">{src}</code>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
