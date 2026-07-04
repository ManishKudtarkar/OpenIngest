"use client";
import { useEffect, useRef, useState } from "react";

const METRICS = [
  { raw: 174777, display: "174,777", label: "Rows loaded per run", sub: "across 8 datasets", c: "#6366F1" },
  { raw: 8,      display: "8",       label: "Datasets registered", sub: "in datasets.yaml",  c: "#22D3EE" },
  { raw: 421,    display: "4.21",    label: "Seconds pipeline",    sub: "4.21s total",        c: "#10B981" },
  { raw: 5,      display: "5",       label: "Milestones shipped",  sub: "v1.0 complete",      c: "#8B5CF6" },
  { raw: 994,    display: "99.4%",   label: "Average quality",     sub: "across all datasets",c: "#F59E0B" },
  { raw: 32,     display: "32",      label: "Airflow tasks",       sub: "8 datasets × 4",     c: "#14B8A6" },
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
    const dur = 1600;
    let t0: number | null = null;
    const raf = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVals(METRICS.map(m => Math.floor(m.raw * ease)));
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [started]);

  const fmt = (m: typeof METRICS[0], v: number) => {
    if (m.display.includes(".")) return (v / 100).toFixed(2);
    if (m.display.includes("%")) return (v / 10).toFixed(1) + "%";
    if (m.raw > 10000) return v.toLocaleString();
    return v.toString();
  };

  return (
    <section className="relative py-20 overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-[#04060d]" />
      <div className="absolute inset-0 grid-fine opacity-30" />
      <div className="absolute top-1/2 left-1/2 w-[800px] h-[300px] bg-indigo-600/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />

      <div className="relative max-w-[1380px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 tag text-indigo-400 border-indigo-500/25 bg-indigo-500/8 mb-4">
            Real metrics · Real run
          </div>
          <h2 className="f-head text-[32px] font-bold text-white tracking-[-0.02em]">
            By the numbers.
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {METRICS.map((m, i) => (
            <div key={m.label}
              className="panel rounded-2xl p-5 text-center relative overflow-hidden group hover:border-white/10 transition-all hover:-translate-y-0.5">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `radial-gradient(circle at 50% 100%, ${m.c}08 0%, transparent 70%)` }} />
              <div className="relative">
                <div className="f-head text-[26px] lg:text-[30px] font-bold mb-1" style={{ color: m.c }}>
                  {started ? fmt(m, vals[i]) : "—"}
                </div>
                <div className="text-[12px] text-[#94A3B8] font-medium leading-snug mb-1">{m.label}</div>
                <div className="text-[10px] text-[#334155]">{m.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
