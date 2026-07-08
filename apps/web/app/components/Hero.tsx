"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import GithubIcon from "./GithubIcon";

const LINES = [
  { t: "$ openingest run", c: "#A5B4FC", d: 0 },
  { t: "", c: "", d: 400 },
  { t: "  Discovering 8 datasets...", c: "#475569", d: 700 },
  { t: "  ✓  customers    →  stg_customers    replace       100.00%", c: "#10B981", d: 1050 },
  { t: "  ✓  orders       →  stg_orders       incremental    98.50%", c: "#10B981", d: 1320 },
  { t: "  ✓  products     →  stg_products     replace       100.00%", c: "#10B981", d: 1560 },
  { t: "  ✓  sessions     →  stg_sessions     replace       100.00%", c: "#10B981", d: 1780 },
  { t: "  ✓  employees    →  stg_employees    replace       100.00%", c: "#10B981", d: 1980 },
  { t: "  ✓  events       →  stg_events       incremental    99.20%", c: "#10B981", d: 2180 },
  { t: "  ✓  order_items  →  stg_order_items  replace       100.00%", c: "#10B981", d: 2360 },
  { t: "  ✓  reviews      →  stg_reviews      incremental    97.80%", c: "#10B981", d: 2540 },
  { t: "", c: "", d: 2740 },
  { t: "  Schema    ──  all 8 valid", c: "#22D3EE", d: 2940 },
  { t: "  Quality   ──  avg 99.4%", c: "#22D3EE", d: 3140 },
  { t: "", c: "", d: 3300 },
  { t: "  Run ID  :  OI-20260703-3BB09C", c: "#64748B", d: 3480 },
  { t: "  Rows    :  174,777", c: "#A5B4FC", d: 3680 },
  { t: "  Time    :  4.21 sec", c: "#A5B4FC", d: 3860 },
  { t: "  Status  :  SUCCESS ✓", c: "#10B981", d: 4060 },
];

const STATS = [
  { value: "174,777", label: "rows / run" },
  { value: "8",       label: "datasets"   },
  { value: "4.21s",   label: "runtime"    },
  { value: "99.4%",   label: "quality"    },
];

export default function Hero() {
  const [vis, setVis] = useState<number[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    LINES.forEach((l, i) => {
      const t = setTimeout(() => setVis(p => [...p, i]), l.d);
      timers.current.push(t);
    });
    return () => timers.current.forEach(clearTimeout);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#04060d]">
        <div className="absolute inset-0 grid-fine opacity-40" />
        {/* Top cyan ray */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(34,211,238,0.10),transparent)]" />
        {/* Bottom fade */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_60%,#04060d_100%)]" />
        <div className="absolute inset-0 noise opacity-60" />
      </div>

      <div className="section-container pt-28 pb-16">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 xl:gap-20 items-center">          {/* ── LEFT ── */}
          <div className="flex flex-col gap-8">

            {/* Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/6 px-4 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-[12px] font-semibold text-cyan-200 tracking-wide">v2.0 · Open Source</span>
              </div>
              <span className="tag text-[#64748B] border-white/8 bg-white/3">MIT License</span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="f-head font-bold leading-[1.03] text-white">
                <span className="block text-[42px] sm:text-[54px] lg:text-[64px] tracking-[-0.03em]">
                  Data ingestion.
                </span>
                <span className="block text-[42px] sm:text-[54px] lg:text-[64px] tracking-[-0.03em] g-text">
                  Zero boilerplate.
                </span>
              </h1>
              <p className="mt-5 text-[#94A3B8] text-[16px] sm:text-[17px] leading-[1.75] max-w-[520px]">
                OpenIngest discovers files, validates schemas, runs quality checks,
                loads PostgreSQL, and generates Airflow DAGs — all from one YAML config.
                No Python. No SQL. No DAG edits.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <a href="#install"
                className="flex items-center gap-2 font-semibold text-[#020c10] text-[14px] px-7 py-3.5 rounded-xl bg-cyan-300 hover:bg-white transition-colors shadow-[0_0_40px_rgba(34,211,238,0.20)]">
                Get started free
                <ArrowRight size={15} />
              </a>
              <a href="https://github.com/manishkudtarkar/OpenIngest"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 font-semibold text-[#CBD5E1] hover:text-white text-[14px] px-7 py-3.5 rounded-xl border border-white/8 hover:border-white/16 bg-white/3 hover:bg-white/6 transition-all">
                <GithubIcon size={16} />
                Star on GitHub
                <Star size={12} className="text-amber-400 fill-amber-400" />
              </a>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3 pt-1 border-t border-white/6">
              {STATS.map(s => (
                <div key={s.label} className="pt-4">
                  <div className="f-head text-[22px] sm:text-[26px] font-bold text-white leading-none">{s.value}</div>
                  <div className="text-[11px] text-[#475569] mt-1.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Terminal ── */}
          <div className="relative">
            {/* Outer glow */}
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-cyan-500/8 via-indigo-500/5 to-transparent blur-2xl pointer-events-none" />

            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#04060d]/90 shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
              {/* Window chrome */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/7 bg-white/[0.025]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
                <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-[#475569] f-mono">openingest · bash</span>
                </div>
                <div className="w-20" />
              </div>

              {/* Output */}
              <div className="px-5 py-5 min-h-[380px] f-mono text-[12px] sm:text-[12.5px] leading-[1.85] overflow-x-auto">
                {LINES.map((line, i) => (
                  <div key={i}
                    className="min-w-max transition-all duration-200"
                    style={{
                      opacity: vis.includes(i) ? 1 : 0,
                      transform: vis.includes(i) ? "none" : "translateY(3px)",
                      color: line.c || "transparent",
                    }}>
                    {line.t || "\u00A0"}
                  </div>
                ))}
                {vis.length < LINES.length && (
                  <span className="inline-block w-[7px] h-[13px] bg-cyan-400/80 blink ml-0.5" />
                )}
              </div>

              {/* Status bar */}
              <div className="px-5 py-2.5 border-t border-white/7 bg-white/[0.025] flex items-center justify-between">
                <span className="text-[11px] text-[#334155] f-mono">python 3.12 · postgresql 15 · airflow 2.9</span>
                <span className="text-[11px] text-emerald-400 f-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  connected
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
