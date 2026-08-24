"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";
import GithubIcon from "../GithubIcon";

function AnimChar({ ch, delay }: { ch: string; delay: number }) {
  return (
    <motion.span
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: "inline-block" }}
    >
      {ch}
    </motion.span>
  );
}

function AnimWord({ word, delay = 0, className = "" }: { word: string; delay?: number; className?: string }) {
  return (
    <span className={`inline-flex overflow-hidden ${className}`} aria-label={word}>
      {word.split("").map((ch, i) => (
        <AnimChar key={i} ch={ch === " " ? "\u00A0" : ch} delay={delay + i * 0.038} />
      ))}
    </span>
  );
}

const LINES = [
  { t: "$ openingest run",                                              c: "#A5B4FC", d: 300  },
  { t: "",                                                              c: "",        d: 650  },
  { t: "  Discovering 8 datasets...",                                   c: "#334155", d: 900  },
  { t: "  ✓  customers    →  stg_customers    replace       100.00%",  c: "#10B981", d: 1100 },
  { t: "  ✓  orders       →  stg_orders       incremental    98.50%",  c: "#10B981", d: 1300 },
  { t: "  ✓  products     →  stg_products     replace       100.00%",  c: "#10B981", d: 1470 },
  { t: "  ✓  sessions     →  stg_sessions     replace       100.00%",  c: "#10B981", d: 1630 },
  { t: "  ✓  employees    →  stg_employees    replace       100.00%",  c: "#10B981", d: 1780 },
  { t: "  ✓  events       →  stg_events       incremental    99.20%",  c: "#10B981", d: 1920 },
  { t: "  ✓  order_items  →  stg_order_items  replace       100.00%",  c: "#10B981", d: 2050 },
  { t: "  ✓  reviews      →  stg_reviews      incremental    97.80%",  c: "#10B981", d: 2180 },
  { t: "",                                                              c: "",        d: 2360 },
  { t: "  Schema   ── all 8 valid",                                    c: "#22D3EE", d: 2520 },
  { t: "  Quality  ── avg 99.4%",                                      c: "#22D3EE", d: 2700 },
  { t: "",                                                              c: "",        d: 2850 },
  { t: "  Rows    :  174,777",                                         c: "#A5B4FC", d: 2990 },
  { t: "  Time    :  4.21 sec",                                        c: "#A5B4FC", d: 3130 },
  { t: "  Status  :  SUCCESS ✓",                                       c: "#10B981", d: 3280 },
];

export default function HeroChapter() {
  const [vis, setVis] = useState<number[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  useEffect(() => {
    LINES.forEach((l, i) => {
      const t = setTimeout(() => setVis(p => [...p, i]), l.d);
      timers.current.push(t);
    });
    return () => timers.current.forEach(clearTimeout);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex flex-col justify-center overflow-hidden"
      style={{ minHeight: "100svh" }}
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-[#030507]" />
      <div className="absolute inset-0 grid-fine opacity-[0.35]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(34,211,238,0.07),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_80%_60%,rgba(99,102,241,0.06),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_60%,#030507_100%)]" />
      <div className="absolute inset-0 noise pointer-events-none" />
      {/* orbs */}
      <div className="orb orb-indigo absolute top-[15%] left-[5%] w-[600px] h-[600px] opacity-25 orb-drift pointer-events-none" />
      <div className="orb orb-cyan absolute top-[10%] right-[5%] w-[500px] h-[500px] opacity-15 pointer-events-none" style={{ animationDelay: "-5s" }} />

      <motion.div
        className="wrap relative z-10"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        {/* Top spacer for navbar */}
        <div className="pt-28 pb-16 lg:pb-20">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-12 xl:gap-20 items-center min-h-[calc(100svh-8rem)]">

            {/* ─── LEFT COLUMN ─── */}
            <div className="flex flex-col justify-center gap-8 lg:gap-10">

              {/* Eyebrow badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="flex items-center gap-3 flex-wrap"
              >
                <span className="flex items-center gap-2.5 rounded-full border border-cyan-400/25 bg-cyan-400/8 px-4 py-2">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span className="text-[11.5px] font-semibold text-cyan-200 tracking-[0.12em] uppercase">
                    v3.0.5 · Open Source · PyPI
                  </span>
                </span>
                <span className="tag text-[#475569] border-white/8 bg-white/3 text-[10.5px]">MIT License</span>
              </motion.div>

              {/* Headline — large cinematic type */}
              <div>
                <h1 className="f-head font-bold leading-[1.0] tracking-[-0.04em] select-none">
                  {/* Line 1: white */}
                  <div className="overflow-hidden">
                    <div className="text-[clamp(54px,8.5vw,96px)] text-white">
                      <AnimWord word="Data" delay={0.2} />
                      <span style={{ display: "inline-block", width: "0.25em" }} />
                      <AnimWord word="Ingestion." delay={0.38} />
                    </div>
                  </div>
                  {/* Line 2: gradient */}
                  <div className="overflow-hidden mt-1">
                    <div className="text-[clamp(54px,8.5vw,96px)]">
                      <AnimWord word="Zero" delay={0.75} className="text-[#A5B4FC]" />
                      <span style={{ display: "inline-block", width: "0.25em" }} />
                      <AnimWord word="Boilerplate." delay={0.92} className="text-[#22D3EE]" />
                    </div>
                  </div>
                </h1>
              </div>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.65, ease: [0.16, 1, 0.3, 1] }}
                className="text-[#64748B] text-[15px] sm:text-[17px] leading-[1.75] max-w-[500px]"
              >
                Register a dataset in YAML. OpenIngest handles{" "}
                <span className="text-[#94A3B8]">
                  discovery → validation → quality → transforms → PostgreSQL → Airflow
                </span>{" "}
                automatically.
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.95 }}
                className="flex flex-wrap gap-3"
              >
                <a
                  href="#install"
                  className="flex items-center gap-2.5 font-semibold text-[#020c10] text-[14px] px-8 py-4 rounded-xl bg-cyan-300 hover:bg-white transition-all shadow-[0_0_60px_rgba(34,211,238,0.20)] hover:shadow-[0_0_60px_rgba(255,255,255,0.15)]"
                >
                  Get started free
                  <ArrowRight size={15} />
                </a>
                <a
                  href="https://github.com/manishkudtarkar/OpenIngest"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 font-semibold text-[#94A3B8] hover:text-white text-[14px] px-8 py-4 rounded-xl border border-white/8 hover:border-white/18 bg-white/3 hover:bg-white/6 transition-all"
                >
                  <GithubIcon size={16} />
                  Star on GitHub
                </a>
              </motion.div>

              {/* Stats strip */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.1, delay: 2.25 }}
                className="grid grid-cols-4 gap-6 pt-6 border-t border-white/6"
              >
                {[
                  ["174k",  "rows / run"],
                  ["17",    "connectors"],
                  ["4.21s", "runtime"],
                  ["99.4%", "quality"],
                ].map(([v, l]) => (
                  <div key={l}>
                    <div className="f-head text-[clamp(22px,3vw,32px)] font-bold text-white leading-none tabular-nums">{v}</div>
                    <div className="text-[11px] text-[#334155] mt-2 tracking-wide uppercase">{l}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ─── RIGHT COLUMN: Terminal ─── */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.0, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full"
            >
              {/* glow halo */}
              <div className="absolute -inset-10 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-indigo-500/8 to-transparent blur-3xl pointer-events-none" />

              <div className="terminal relative w-full">
                {/* chrome bar */}
                <div className="terminal-bar flex items-center justify-between px-5 py-3.5">
                  <div className="flex gap-2">
                    <div className="t-dot" style={{ background: "#FF5F57" }} />
                    <div className="t-dot" style={{ background: "#FFBD2E" }} />
                    <div className="t-dot" style={{ background: "#27C93F" }} />
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] text-[#475569] f-mono">openingest · bash</span>
                  </div>
                  <div className="w-20" />
                </div>

                {/* output body */}
                <div
                  className="px-6 py-6 f-mono text-[12px] sm:text-[12.5px] leading-[1.95] overflow-x-auto"
                  style={{ minHeight: "420px" }}
                >
                  {LINES.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={vis.includes(i) ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.2 }}
                      style={{
                        color: line.c || "transparent",
                        whiteSpace: "pre",
                        minWidth: "max-content",
                      }}
                    >
                      {line.t || "\u00A0"}
                    </motion.div>
                  ))}
                  {vis.length < LINES.length && (
                    <span
                      className="inline-block blink"
                      style={{
                        width: 7, height: 14,
                        background: "rgba(34,211,238,0.8)",
                        marginLeft: 2,
                        verticalAlign: "middle",
                        display: "inline-block",
                      }}
                    />
                  )}
                </div>

                {/* status footer */}
                <div className="px-6 py-3 border-t border-white/5 bg-white/[0.018] flex items-center justify-between">
                  <span className="text-[10.5px] text-[#1E293B] f-mono">python 3.12 · postgresql 15 · airflow 2.9</span>
                  <span className="text-[10.5px] text-emerald-400 f-mono flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    connected
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 z-10"
      >
        <span className="chapter-label tracking-[0.2em]">Scroll</span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown size={13} className="text-[#334155]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
