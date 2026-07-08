"use client";
import { useEffect, useRef, useState } from "react";

const METRICS = [
  { raw: 174777, fmt: (v: number) => v.toLocaleString(),          display: "174,777", label: "rows loaded",        sub: "per pipeline run",         c: "#6366F1" },
  { raw: 8,      fmt: (v: number) => v.toString(),                display: "8",       label: "datasets",           sub: "registered in YAML",       c: "#22D3EE" },
  { raw: 421,    fmt: (v: number) => (v / 100).toFixed(2) + "s", display: "4.21s",   label: "pipeline duration",  sub: "end-to-end",               c: "#10B981" },
  { raw: 994,    fmt: (v: number) => (v / 10).toFixed(1) + "%",  display: "99.4%",   label: "avg quality score",  sub: "across all datasets",      c: "#F59E0B" },
  { raw: 32,     fmt: (v: number) => v.toString(),                display: "32",      label: "Airflow tasks",      sub: "8 datasets × 4 tasks",     c: "#8B5CF6" },
  { raw: 5,      fmt: (v: number) => v.toString(),                display: "5",       label: "milestones shipped", sub: "v1.0 complete",             c: "#14B8A6" },
];

export default function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [vals, setVals] = useState(METRICS.map(() => 0));

  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); ob.disconnect(); }
    }, { threshold: 0.2 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
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
  }, [started]);

  return (
    <section className="relative py-20 overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-[#04060d]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(99,102,241,0.06),transparent)]" />

      <div className="relative max-w-[1380px] mx-auto px-5 sm:px-6 lg:px-12">

        {/* Label */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 tag text-indigo-400 border-indigo-500/20 bg-indigo-500/6 mb-4">
            Real run · OI-20260703-3BB09C
          </div>
          <h2 className="f-head text-[30px] sm:text-[36px] font-bold text-white tracking-[-0.02em]">
            By the numbers.
          </h2>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {METRICS.map((m, i) => (
            <div key={m.label}
              className="group relative panel rounded-2xl p-5 text-center overflow-hidden hover:border-white/12 transition-all duration-300 hover:-translate-y-0.5">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(circle at 50% 100%, ${m.c}10, transparent 70%)` }} />
              <div className="relative">
                <div className="f-head text-[28px] sm:text-[32px] font-bold leading-none mb-2" style={{ color: m.c }}>
                  {started ? m.fmt(vals[i]) : "—"}
                </div>
                <div className="text-[12px] text-[#94A3B8] font-medium leading-snug">{m.label}</div>
                <div className="text-[10px] text-[#334155] mt-1">{m.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-[11px] text-[#1E293B] mt-6 f-mono">
          Run ID: OI-20260703-3BB09C · PostgreSQL 15 · Python 3.12 · Airflow 2.9
        </p>
      </div>
    </section>
  );
}
