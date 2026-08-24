"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";

/* ── animated spaced-letter word ── */
function SpacedWord({ word, delay = 0, color = "#F8FAFC" }: { word: string; delay?: number; color?: string }) {
  return (
    <span className="inline-flex overflow-hidden" aria-label={word}>
      {word.split("").map((ch, i) => (
        <motion.span
          key={i}
          initial={{ y: 60, opacity: 0, rotateX: -50 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          transition={{
            duration: 0.7,
            delay: delay + i * 0.045,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ color, display: "inline-block", marginRight: ch === " " ? "0.3em" : "0.04em" }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

/* ── terminal output lines ── */
const LINES = [
  { t: "$ openingest run",                                             c: "#A5B4FC", d: 200  },
  { t: "",                                                             c: "",        d: 600  },
  { t: "  Discovering 8 datasets...",                                  c: "#334155", d: 850  },
  { t: "  ✓  customers    →  stg_customers    replace       100.00%", c: "#10B981", d: 1100 },
  { t: "  ✓  orders       →  stg_orders       incremental    98.50%", c: "#10B981", d: 1310 },
  { t: "  ✓  products     →  stg_products     replace       100.00%", c: "#10B981", d: 1500 },
  { t: "  ✓  sessions     →  stg_sessions     replace       100.00%", c: "#10B981", d: 1680 },
  { t: "  ✓  employees    →  stg_employees    replace       100.00%", c: "#10B981", d: 1850 },
  { t: "  ✓  events       →  stg_events       incremental    99.20%", c: "#10B981", d: 2010 },
  { t: "  ✓  order_items  →  stg_order_items  replace       100.00%", c: "#10B981", d: 2160 },
  { t: "  ✓  reviews      →  stg_reviews      incremental    97.80%", c: "#10B981", d: 2300 },
  { t: "",                                                             c: "",        d: 2480 },
  { t: "  Schema   ── all 8 valid",                                   c: "#22D3EE", d: 2640 },
  { t: "  Quality  ── avg 99.4%",                                     c: "#22D3EE", d: 2820 },
  { t: "",                                                             c: "",        d: 2960 },
  { t: "  Rows    :  174,777",                                        c: "#A5B4FC", d: 3100 },
  { t: "  Time    :  4.21 sec",                                       c: "#A5B4FC", d: 3260 },
  { t: "  Status  :  SUCCESS ✓",                                      c: "#10B981", d: 3420 },
];

export default function HeroChapter() {
  const [vis, setVis] = useState<number[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ref = useRef<HTMLElement>(null);

  /* scroll-driven parallax */
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

  useEffect(() => {
    LINES.forEach((l, i) => {
      const t = setTimeout(() => setVis(p => [...p, i]), l.d);
      timers.current.push(t);
    });
    return () => timers.current.forEach(clearTimeout);
  }, []);

  return (
    <section ref={ref} id="hero" className="chapter" style={{ minHeight: "100vh" }}>
      {/* ── background ── */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute inset-0 bg-[#030507]" />
        <div className="absolute inset-0 grid-fine opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-5%,rgba(34,211,238,0.08),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_55%,#030507_100%)]" />
        <div className="absolute inset-0 noise" />
        {/* floating orbs */}
        <div className="orb orb-indigo absolute top-[20%] left-[10%] w-[500px] h-[500px] opacity-30 orb-drift" />
        <div className="orb orb-cyan   absolute top-[15%] right-[8%] w-[400px] h-[400px] opacity-20" style={{ animationDelay: "-4s" }} />
      </motion.div>

      <motion.div className="wrap relative z-10 pt-28 pb-20" style={{ opacity, scale }}>
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-16 xl:gap-24 items-center">

          {/* ── LEFT ── */}
          <div className="flex flex-col gap-8">

            {/* eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <span className="flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/6 px-4 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-[11px] font-semibold text-cyan-200 tracking-widest uppercase">
                  v3.0.5 · Open Source · PyPI
                </span>
              </span>
              <span className="tag text-[#475569] border-white/6 bg-white/2 text-[10px]">MIT</span>
            </motion.div>

            {/* headline — otsuka-style spaced letters */}
            <div className="perspective-[800px]">
              <h1 className="f-head font-bold leading-[1.04] tracking-[-0.04em]">
                <div className="text-[clamp(40px,7vw,72px)] text-white mb-1 overflow-hidden">
                  <SpacedWord word="Data" delay={0.3} />
                  {" "}
                  <SpacedWord word="Ingestion." delay={0.5} />
                </div>
                <div className="text-[clamp(40px,7vw,72px)] overflow-hidden">
                  <SpacedWord word="Zero" delay={0.8} color="#A5B4FC" />
                  {" "}
                  <SpacedWord word="Boilerplate." delay={1.0} color="#22D3EE" />
                </div>
              </h1>
            </div>

            {/* sub */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-[#64748B] text-[15px] sm:text-[16px] leading-[1.8] max-w-[480px]"
            >
              Register a dataset in YAML. OpenIngest handles{" "}
              <span className="text-[#94A3B8]">discovery → validation → quality → transform → PostgreSQL → Airflow</span>{" "}
              — automatically.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.9 }}
              className="flex flex-wrap gap-3"
            >
              <a
                href="#install"
                className="flex items-center gap-2 font-semibold text-[#030507] text-[13.5px] px-7 py-3.5 rounded-xl bg-cyan-300 hover:bg-white transition-all shadow-[0_0_50px_rgba(34,211,238,0.25)]"
              >
                Get started
              </a>
              <a
                href="https://github.com/manishkudtarkar/OpenIngest"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 font-semibold text-[#94A3B8] hover:text-white text-[13.5px] px-7 py-3.5 rounded-xl border border-white/8 hover:border-white/16 bg-white/3 hover:bg-white/6 transition-all"
              >
                GitHub →
              </a>
            </motion.div>

            {/* quick stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 2.2 }}
              className="grid grid-cols-4 gap-4 pt-4 border-t border-white/5"
            >
              {[
                ["174k", "rows / run"],
                ["17",   "connectors"],
                ["4.21s","pipeline"],
                ["99.4%","quality"],
              ].map(([v, l]) => (
                <div key={l}>
                  <div className="f-head text-[22px] sm:text-[26px] font-bold text-white leading-none">{v}</div>
                  <div className="text-[10.5px] text-[#334155] mt-1.5 tracking-wide">{l}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT: Terminal ── */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* glow behind terminal */}
            <div className="absolute -inset-8 rounded-3xl bg-gradient-to-br from-cyan-500/8 via-indigo-500/6 to-transparent blur-3xl pointer-events-none" />

            <div className="terminal relative">
              {/* window chrome */}
              <div className="terminal-bar justify-between">
                <div className="flex gap-1.5">
                  <div className="t-dot bg-[#FF5F57]" />
                  <div className="t-dot bg-[#FFBD2E]" />
                  <div className="t-dot bg-[#27C93F]" />
                </div>
                <div className="flex items-center gap-2 bg-white/4 rounded-lg px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-[#475569] f-mono">openingest · bash</span>
                </div>
                <div className="w-20" />
              </div>

              {/* output */}
              <div className="px-5 py-5 min-h-[360px] f-mono text-[11.5px] sm:text-[12px] leading-[1.9] overflow-x-auto">
                {LINES.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={vis.includes(i) ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.25 }}
                    style={{ color: line.c || "transparent", minWidth: "max-content" }}
                  >
                    {line.t || "\u00A0"}
                  </motion.div>
                ))}
                {vis.length < LINES.length && (
                  <span className="inline-block w-[6px] h-[13px] bg-cyan-400/80 blink ml-0.5" />
                )}
              </div>

              {/* status bar */}
              <div className="px-5 py-2.5 border-t border-white/5 bg-white/[0.015] flex items-center justify-between">
                <span className="text-[10px] text-[#1E293B] f-mono">python 3.12 · postgresql 15</span>
                <span className="text-[10px] text-emerald-400 f-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  connected
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="chapter-label">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown size={14} className="text-[#334155]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
