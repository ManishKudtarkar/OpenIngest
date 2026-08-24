"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

const METRICS = [
  { raw: 174777, fmt: (v: number) => v.toLocaleString(),          label: "rows loaded",       sub: "per pipeline run",        c: "#6366F1" },
  { raw: 17,     fmt: (v: number) => v.toString(),                label: "connectors",         sub: "CSV to Google Sheets",    c: "#22D3EE" },
  { raw: 421,    fmt: (v: number) => (v / 100).toFixed(2) + "s", label: "pipeline duration",  sub: "8 datasets end-to-end",   c: "#10B981" },
  { raw: 994,    fmt: (v: number) => (v / 10).toFixed(1) + "%",  label: "avg quality score",  sub: "across all datasets",     c: "#F59E0B" },
  { raw: 93,     fmt: (v: number) => v.toString(),                label: "tests passing",      sub: "ruff + mypy clean",       c: "#8B5CF6" },
  { raw: 6,      fmt: (v: number) => v.toString(),                label: "transforms",         sub: "rename→cast→filter→…",    c: "#EC4899" },
];

const FEATURES = [
  { title: "Dynamic Discovery",     src: "core/discovery.py",         accent: "#6366F1", desc: "Scans config and builds Dataset objects automatically." },
  { title: "Schema Validation",     src: "core/validation.py",        accent: "#22D3EE", desc: "Blocks bad data before any rows move." },
  { title: "Data Quality Engine",   src: "core/quality.py",           accent: "#10B981", desc: "Non-null, unique, range, regex, custom rules. 0–100% score." },
  { title: "Incremental Loading",   src: "core/incremental.py",       accent: "#8B5CF6", desc: "Watermark + SHA-256 hash CDC + upsert. State persisted." },
  { title: "Auto Table Creation",   src: "utils/db.py",               accent: "#3B82F6", desc: "Infers PostgreSQL types. Creates tables on first run." },
  { title: "Metadata Tracking",     src: "utils/metadata_logger.py",  accent: "#F59E0B", desc: "Run ID, status, duration, rows, quality logged every run." },
  { title: "Airflow Integration",   src: "core/airflow/",             accent: "#14B8A6", desc: "One task group per dataset. Add YAML, DAG auto-updates." },
  { title: "Built-in Scheduler",    src: "core/scheduler.py",         accent: "#A855F7", desc: "@daily / @hourly / cron. No Airflow needed." },
  { title: "Slack + Email Alerts",  src: "core/notifications.py",     accent: "#EC4899", desc: "On success/failure. Retry policies. SMTP + webhook." },
  { title: "Data Lineage",          src: "core/lineage.py",           accent: "#F97316", desc: "ASCII + Mermaid + JSON export. openingest graph." },
  { title: "Docker Ready",          src: "docker-compose.yml",        accent: "#0EA5E9", desc: "PostgreSQL + Airflow. docker compose up -d." },
  { title: "CI/CD Built-in",        src: ".github/workflows/",        accent: "#A855F7", desc: "Ruff · Mypy · Pytest on every push." },
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
    const dur = 1800;
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
    <section id="stats" ref={containerRef} className="relative py-32 overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute inset-0 bg-[#080c18]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(99,102,241,0.06),transparent)]" />
        <div className="chapter-num absolute right-0 bottom-0 opacity-[0.025]">06</div>
      </motion.div>

      <div className="wrap relative z-10">
        {/* animated metrics */}
        <FadeUp>
          <div className="chapter-label mb-10 flex items-center gap-3">
            <span className="w-8 h-px bg-indigo-500/40" />
            <span>By the numbers</span>
            <span className="text-[#1E293B]">·</span>
            <span className="text-[#1E293B] f-mono text-[10px]">OI-20260703-3BB09C</span>
          </div>
        </FadeUp>

        <div ref={metricsRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-20">
          {METRICS.map((m, i) => (
            <FadeUp key={m.label} delay={i * 0.06}>
              <div className="feat-card text-center group">
                <div className="f-head text-[clamp(24px,3vw,32px)] font-bold leading-none mb-2" style={{ color: m.c }}>
                  {metricsVisible ? m.fmt(vals[i]) : "—"}
                </div>
                <div className="text-[12px] text-[#475569] font-medium leading-snug">{m.label}</div>
                <div className="text-[10px] text-[#1E293B] mt-1">{m.sub}</div>
              </div>
            </FadeUp>
          ))}
        </div>

        {/* feature grid */}
        <FadeUp>
          <h2 className="f-head font-bold leading-[1.06] tracking-[-0.03em] text-[clamp(28px,4vw,44px)] text-white mb-3">
            13 production-grade<br/><span className="g-text">components.</span>
          </h2>
          <p className="text-[#475569] text-[14px] leading-relaxed mb-10 max-w-lg">
            Every component tested, connected, and used in real runs.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FEATURES.map(({ title, src, accent, desc }, i) => (
            <FadeUp key={title} delay={Math.floor(i / 4) * 0.05 + (i % 4) * 0.04}>
              <div
                className="feat-card group"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  (e.currentTarget as HTMLElement).style.setProperty("--mx", `${e.clientX - rect.left}px`);
                  (e.currentTarget as HTMLElement).style.setProperty("--my", `${e.clientY - rect.top}px`);
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center mb-4 shrink-0"
                  style={{ background: accent + "12", border: `1px solid ${accent}20` }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
                </div>
                <h3 className="f-head font-semibold text-white text-[13px] mb-2 leading-snug">{title}</h3>
                <p className="text-[#475569] text-[12px] leading-relaxed mb-4 group-hover:text-[#64748B] transition-colors">
                  {desc}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full" style={{ background: accent }} />
                  <code className="text-[10px] text-[#1E293B] f-mono group-hover:text-[#334155] transition-colors">{src}</code>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
