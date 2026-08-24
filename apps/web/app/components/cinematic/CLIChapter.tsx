"use client";
import { useRef, useState } from "react";
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

type LS = "cmd" | "ok" | "info" | "dim" | "sep" | "blank";
const lineColor: Record<LS, string> = {
  cmd: "#A5B4FC", ok: "#10B981", info: "#22D3EE", dim: "#334155", sep: "#1E293B", blank: "transparent",
};

const CMDS = [
  {
    label: "run",
    cmd: "openingest run",
    desc: "Full pipeline across all datasets",
    lines: [
      ["══════════════════════════════════════", "sep"],
      ["OPENINGEST  ·  OI-20260703-3BB09C", "info"],
      ["══════════════════════════════════════", "sep"],
      ["", "blank"],
      ["  ✓  customers    →  stg_customers    replace       100.00%", "ok"],
      ["  ✓  orders       →  stg_orders       incremental    98.50%", "ok"],
      ["  ✓  products     →  stg_products     replace       100.00%", "ok"],
      ["  ✓  sessions     →  stg_sessions     replace       100.00%", "ok"],
      ["  ✓  employees    →  stg_employees    replace       100.00%", "ok"],
      ["  ✓  events       →  stg_events       incremental    99.20%", "ok"],
      ["  ✓  order_items  →  stg_order_items  replace       100.00%", "ok"],
      ["  ✓  reviews      →  stg_reviews      incremental    97.80%", "ok"],
      ["", "blank"],
      ["  Rows Loaded :  174,777", "info"],
      ["  Duration    :  4.21 sec", "info"],
      ["  Status      :  SUCCESS ✓", "ok"],
      ["══════════════════════════════════════", "sep"],
    ] as [string, LS][],
  },
  {
    label: "--dry-run",
    cmd: "openingest run --dry-run",
    desc: "Validate + quality. Zero DB writes",
    lines: [
      ["  DRY RUN MODE — no database writes", "info"],
      ["", "blank"],
      ["  customers    schema=✓  quality=100.0%  PASS", "ok"],
      ["  orders       schema=✓  quality=98.5%   PASS", "ok"],
      ["  products     schema=✓  quality=100.0%  PASS", "ok"],
      ["  events       schema=✓  quality=99.2%   PASS", "ok"],
      ["", "blank"],
      ["  Dry run complete. 0 rows written.", "info"],
    ] as [string, LS][],
  },
  {
    label: "--dataset",
    cmd: "openingest run --dataset orders",
    desc: "Run a single dataset only",
    lines: [
      ["  Strategy      :  incremental", "info"],
      ["  Watermark col :  order_time", "info"],
      ["", "blank"],
      ["  Schema   →  PASS", "ok"],
      ["  Quality  →  PASS (98.50%)", "ok"],
      ["", "blank"],
      ["  New rows     :  1,240", "info"],
      ["  Changed rows :  18  (hash diff)", "info"],
      ["  Upserted     :  1,258  →  stg_orders", "ok"],
      ["  Duration     :  0.81 sec  ·  SUCCESS", "ok"],
    ] as [string, LS][],
  },
  {
    label: "validate",
    cmd: "openingest validate",
    desc: "Schema validation across all datasets",
    lines: [
      ["  customers    required=6   present=6   extra=0   ✓", "ok"],
      ["  orders       required=5   present=5   extra=0   ✓", "ok"],
      ["  products     required=6   present=6   extra=0   ✓", "ok"],
      ["  events       required=10  present=10  extra=0   ✓", "ok"],
      ["", "blank"],
      ["  All 8 schemas valid.", "ok"],
    ] as [string, LS][],
  },
  {
    label: "quality",
    cmd: "openingest quality",
    desc: "Quality scores — no data loaded",
    lines: [
      ["  Dataset       Quality    Nulls   Dupes   Status", "dim"],
      ["  ──────────    ────────   ─────   ─────   ──────", "dim"],
      ["  customers     100.00%    0       0       PASS", "ok"],
      ["  orders         98.50%    3       0       PASS", "ok"],
      ["  events         99.20%    8       0       PASS", "ok"],
      ["  reviews        97.80%    12      4       PASS", "ok"],
      ["", "blank"],
      ["  Overall Quality Score  →  99.4%", "info"],
    ] as [string, LS][],
  },
  {
    label: "history",
    cmd: "openingest history --limit 5",
    desc: "Run history with timing",
    lines: [
      ["  Run ID              Timestamp              Rows     Dur    Status", "dim"],
      ["  ──────────────────  ─────────────────────  ──────   ────   ──────", "dim"],
      ["  OI-20260703-3BB09C  2026-07-03 09:42:11    174,777  4.21s  ✓ OK", "ok"],
      ["  OI-20260702-A12F4E  2026-07-02 09:38:04    174,230  4.18s  ✓ OK", "ok"],
      ["  OI-20260701-9C5E3A  2026-07-01 09:41:38    173,890  4.24s  ✓ OK", "ok"],
    ] as [string, LS][],
  },
];

export default function CLIChapter() {
  const [idx, setIdx] = useState(0);
  const active = CMDS[idx];
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id="cli" ref={ref} className="relative overflow-hidden" style={{ paddingTop: "clamp(5rem,9vw,8rem)", paddingBottom: "clamp(5rem,9vw,8rem)", background: "#02030a" }}>
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute inset-0 grid-bg" style={{ opacity: 0.28 }} />
        <div style={{ position: "absolute", left: 0, top: "50%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.07),transparent 70%)", filter: "blur(80px)", transform: "translateY(-50%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(16,185,129,0.15),transparent)" }} />
      </motion.div>

      <div className="site-pad relative z-10">
        <FadeUp>
          <span className="eyebrow" style={{ marginBottom: "2rem", display: "inline-flex" }}>Chapter 05 / CLI</span>
        </FadeUp>

        <FadeUp delay={0.05}>
          <h2 className="f-head" style={{ fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.04em", fontSize: "clamp(2.4rem,5.5vw,4.2rem)", marginBottom: "1rem" }}>
            <span style={{ color: "#F1F5F9" }}>Everything</span>
            <br />
            <span className="g-green">from the terminal.</span>
          </h2>
          <p style={{ color: "#475569", fontSize: 16, lineHeight: 1.75, marginBottom: "clamp(2.5rem,4vw,3.5rem)" }}>
            Real output. Real runs. Every number is accurate.
          </p>
        </FadeUp>

        <div className="grid lg:grid-cols-5 gap-5">
          {/* picker */}
          <FadeUp delay={0.1} className="lg:col-span-2 flex flex-col gap-1.5">
            {CMDS.map((c, i) => (
              <motion.button
                key={c.label}
                onClick={() => setIdx(i)}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.15 }}
                className={`text-left px-4 py-3.5 rounded-xl border transition-all
                  ${idx === i
                    ? "border-white/10 bg-white/4"
                    : "border-transparent hover:border-white/5 text-[#334155] hover:text-[#64748B]"
                  }`}
              >
                <div className="text-[13px] font-semibold f-mono mb-1" style={{ color: idx === i ? "#A5B4FC" : undefined }}>
                  {c.label}
                </div>
                <div className="text-[11px] text-[#334155] leading-snug">{c.desc}</div>
              </motion.button>
            ))}

            {/* extra commands list */}
            <div className="mt-4 glass rounded-xl px-4 py-3">
              <div className="text-[10px] text-[#334155] uppercase tracking-wider mb-2">Also available</div>
              {["report", "dashboard", "scheduler start", "doctor", "infer", "profile", "graph", "init", "airflow build", "docker init"].map(cmd => (
                <div key={cmd} className="f-mono text-[10.5px] text-[#1E293B] leading-[1.9]">
                  openingest <span className="text-[#334155]">{cmd}</span>
                </div>
              ))}
            </div>
          </FadeUp>

          {/* terminal */}
          <FadeUp delay={0.15} className="lg:col-span-3">
            <div className="terminal">
              <div className="terminal-bar justify-between">
                <div className="flex gap-1.5">
                  <div className="t-dot bg-[#FF5F56]" />
                  <div className="t-dot bg-[#FFBD2E]" />
                  <div className="t-dot bg-[#27C93F]" />
                </div>
                <span className="text-[10px] text-[#334155] f-mono">bash — openingest</span>
                <div className="w-14" />
              </div>
              <div className="px-5 py-5 min-h-[300px] f-mono text-[11.5px] leading-[1.9]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#6366F1]">❯</span>
                  <span className="text-[#A5B4FC]">{active.cmd}</span>
                </div>
                {active.lines.map(([text, style], i) => (
                  <motion.div
                    key={`${idx}-${i}`}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: i * 0.04 }}
                    style={{ color: style === "blank" ? "transparent" : lineColor[style] }}
                  >
                    {text || "\u00A0"}
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
