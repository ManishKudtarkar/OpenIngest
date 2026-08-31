"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";
import GithubIcon from "../GithubIcon";

/* ── Per-character animation ── */
function Word({
  text, delay = 0, className = "",
}: { text: string; delay?: number; className?: string }) {
  return (
    <span className={`inline-flex overflow-hidden ${className}`} aria-label={text}>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.65, delay: delay + i * 0.032, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "inline-block" }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

/* ── Terminal lines ── */
const LINES = [
  { t: "$ openingest run",                                             c: "#818CF8", d: 300  },
  { t: "",                                                             c: "",        d: 700  },
  { t: "  Discovering 8 datasets...",                                  c: "#334155", d: 950  },
  { t: "  ✓  customers    →  stg_customers    replace       100.00%", c: "#10B981", d: 1150 },
  { t: "  ✓  orders       →  stg_orders       incremental    98.50%", c: "#10B981", d: 1340 },
  { t: "  ✓  products     →  stg_products     replace       100.00%", c: "#10B981", d: 1510 },
  { t: "  ✓  sessions     →  stg_sessions     replace       100.00%", c: "#10B981", d: 1670 },
  { t: "  ✓  employees    →  stg_employees    replace       100.00%", c: "#10B981", d: 1820 },
  { t: "  ✓  events       →  stg_events       incremental    99.20%", c: "#10B981", d: 1960 },
  { t: "  ✓  order_items  →  stg_order_items  replace       100.00%", c: "#10B981", d: 2090 },
  { t: "  ✓  reviews      →  stg_reviews      incremental    97.80%", c: "#10B981", d: 2220 },
  { t: "",                                                             c: "",        d: 2400 },
  { t: "  Schema   ──  all 8 valid",                                  c: "#22D3EE", d: 2560 },
  { t: "  Quality  ──  avg 99.4%",                                    c: "#22D3EE", d: 2740 },
  { t: "",                                                             c: "",        d: 2900 },
  { t: "  Rows    :  174,777",                                        c: "#818CF8", d: 3050 },
  { t: "  Time    :  4.21 sec",                                       c: "#818CF8", d: 3210 },
  { t: "  Status  :  SUCCESS ✓",                                      c: "#10B981", d: 3380 },
];

export default function HeroChapter() {
  const [vis, setVis] = useState<number[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const y    = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const fade = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

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
      className="relative overflow-hidden"
      style={{ minHeight: "100svh", display: "flex", flexDirection: "column", justifyContent: "center" }}
    >
      {/* ── BACKGROUND ── */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y }}>
        <div className="absolute inset-0" style={{ background: "#02030a" }} />
        <div className="absolute inset-0 grid-bg" style={{ opacity: 0.4 }} />
        {/* top glow */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 90% 55% at 50% -8%, rgba(34,211,238,0.09), transparent)" }} />
        {/* bottom fade */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, #02030a 100%)" }} />
        {/* orbs */}
        <div
          className="absolute orb-drift"
          style={{
            top: "15%", left: "4%",
            width: 700, height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.28), transparent 70%)",
            filter: "blur(90px)",
            opacity: 0.25,
          }}
        />
        <div
          className="absolute"
          style={{
            top: "8%", right: "2%",
            width: 500, height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34,211,238,0.20), transparent 70%)",
            filter: "blur(80px)",
            opacity: 0.18,
            animationDelay: "-6s",
          }}
        />
      </motion.div>

      {/* ── CONTENT ── */}
      <motion.div
        className="site-pad relative z-10"
        style={{ opacity: fade }}
      >
        <div
          className="grid items-center gap-12 xl:gap-20"
          style={{
            gridTemplateColumns: "1fr 1fr",
            paddingTop: "clamp(7.5rem, 12vw, 10rem)",
            paddingBottom: "clamp(4rem, 8vw, 6rem)",
          }}
        >
          {/* ─── LEFT ─── */}
          <div className="flex flex-col gap-8 lg:gap-10">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="flex items-center gap-3 flex-wrap"
            >
              <span style={{
                display: "flex", alignItems: "center", gap: "0.6rem",
                borderRadius: "99px",
                border: "1px solid rgba(34,211,238,0.22)",
                background: "rgba(34,211,238,0.07)",
                padding: "6px 16px",
              }}>
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#A5F3FC", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  v3.0.5 · Open Source · PyPI
                </span>
              </span>
              <span className="tag" style={{ color: "#475569", borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", fontSize: 10.5 }}>
                MIT License
              </span>
            </motion.div>

            {/* Headline */}
            <div className="f-head" style={{ fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.045em" }}>
              <div style={{ fontSize: "clamp(3.2rem, 8vw, 6rem)", color: "#F1F5F9", overflow: "hidden" }}>
                <Word text="Data" delay={0.18} />
                <span style={{ display: "inline-block", width: "0.22em" }} />
                <Word text="Ingestion." delay={0.32} />
              </div>
              <div style={{ fontSize: "clamp(3.2rem, 8vw, 6rem)", overflow: "hidden", marginTop: "0.04em" }}>
                <Word text="Zero" delay={0.70} className="g-indigo-cyan" />
                <span style={{ display: "inline-block", width: "0.22em" }} />
                <Word text="Boilerplate." delay={0.86} className="g-cyan" />
              </div>
            </div>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ color: "#64748B", fontSize: "clamp(15px,1.5vw,17px)", lineHeight: 1.8, maxWidth: 500 }}
            >
              Register a dataset in YAML. OpenIngest handles{" "}
              <span style={{ color: "#94A3B8" }}>
                discovery → validation → quality → transforms → PostgreSQL → Airflow
              </span>{" "}
              automatically. No Python. No SQL.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 1.9 }}
              style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}
            >
              <a
                href="#install"
                style={{
                  display: "flex", alignItems: "center", gap: "0.6rem",
                  padding: "14px 32px",
                  borderRadius: "14px",
                  background: "#22D3EE",
                  color: "#020c10",
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                  boxShadow: "0 0 60px rgba(34,211,238,0.22)",
                  transition: "background .2s, box-shadow .2s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#22D3EE"; }}
              >
                Get started free <ArrowRight size={15} />
              </a>
              <a
                href="https://github.com/manishkudtarkar/OpenIngest"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: "0.6rem",
                  padding: "14px 32px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.09)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#94A3B8",
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                  transition: "background .2s, color .2s, border-color .2s",
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#fff"; el.style.background = "rgba(255,255,255,0.08)"; el.style.borderColor = "rgba(255,255,255,0.16)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#94A3B8"; el.style.background = "rgba(255,255,255,0.04)"; el.style.borderColor = "rgba(255,255,255,0.09)"; }}
              >
                <GithubIcon size={16} /> Star on GitHub
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.1, delay: 2.2 }}
              style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              {[["174k","rows / run"],["17","connectors"],["4.21s","runtime"],["99.4%","quality"]].map(([v, l]) => (
                <div key={l}>
                  <div className="f-head" style={{ fontSize: "clamp(24px,3vw,36px)", fontWeight: 800, color: "#F1F5F9", lineHeight: 1, letterSpacing: "-0.03em" }}>{v}</div>
                  <div style={{ fontSize: 11, color: "#334155", marginTop: "0.5rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>{l}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ─── RIGHT: Terminal ─── */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.95, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "relative" }}
          >
            {/* halo */}
            <div style={{
              position: "absolute", inset: "-2.5rem",
              borderRadius: "2rem",
              background: "radial-gradient(ellipse at 50% 40%, rgba(99,102,241,0.14) 0%, transparent 70%)",
              filter: "blur(30px)",
              pointerEvents: "none",
            }} />
            <div className="terminal">
              {/* chrome */}
              <div className="term-bar" style={{ justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 7 }}>
                  <div className="t-dot" style={{ background: "#FF5F57" }} />
                  <div className="t-dot" style={{ background: "#FFBD2E" }} />
                  <div className="t-dot" style={{ background: "#27C93F" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "4px 12px" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block", animation: "pulse-ring 2.2s ease-out infinite" }} />
                  <span className="f-mono" style={{ fontSize: 10.5, color: "#475569" }}>openingest · bash</span>
                </div>
                <div style={{ width: 80 }} />
              </div>

              {/* output */}
              <div
                className="f-mono"
                style={{ padding: "1.5rem 1.5rem 1.5rem", minHeight: 430, fontSize: 12.5, lineHeight: 1.95, overflowX: "auto" }}
              >
                {LINES.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={vis.includes(i) ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.2 }}
                    style={{ color: line.c || "transparent", whiteSpace: "pre", minWidth: "max-content" }}
                  >
                    {line.t || "\u00A0"}
                  </motion.div>
                ))}
                {vis.length < LINES.length && (
                  <span className="blink" style={{ display: "inline-block", width: 7, height: 14, background: "rgba(34,211,238,0.75)", verticalAlign: "middle", marginLeft: 2 }} />
                )}
              </div>

              {/* footer */}
              <div style={{
                padding: "10px 20px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(255,255,255,0.015)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span className="f-mono" style={{ fontSize: 10.5, color: "#1E293B" }}>python 3.12 · postgresql 15 · airflow 2.9</span>
                <span className="f-mono" style={{ fontSize: 10.5, color: "#10B981", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block" }} className="pulse-ring" />
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
        transition={{ delay: 3.6, duration: 1.2 }}
        style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 10 }}
      >
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#334155" }}>Scroll</span>
        <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
          <ArrowDown size={13} color="#334155" />
        </motion.div>
      </motion.div>
    </section>
  );
}
