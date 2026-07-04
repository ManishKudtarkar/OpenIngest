"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import GithubIcon from "./GithubIcon";

const LINES = [
  { t: "$ openingest run", c: "#A5B4FC", d: 0 },
  { t: "", c: "", d: 500 },
  { t: "  Discovering datasets...", c: "#64748B", d: 800 },
  { t: "  ✓  customers       →  stg_customers    replace", c: "#10B981", d: 1200 },
  { t: "  ✓  orders          →  stg_orders       incremental", c: "#10B981", d: 1550 },
  { t: "  ✓  products        →  stg_products     replace", c: "#10B981", d: 1850 },
  { t: "  ✓  sessions        →  stg_sessions     replace", c: "#10B981", d: 2150 },
  { t: "  ✓  employees       →  stg_employees    replace", c: "#10B981", d: 2450 },
  { t: "  ✓  events          →  stg_events       incremental", c: "#10B981", d: 2750 },
  { t: "  ✓  reviews         →  stg_reviews      incremental", c: "#10B981", d: 3050 },
  { t: "", c: "", d: 3350 },
  { t: "  Schema Validation   ──  all pass", c: "#22D3EE", d: 3600 },
  { t: "  Quality Engine      ──  avg 99.4%", c: "#22D3EE", d: 3900 },
  { t: "", c: "", d: 4150 },
  { t: "  Run ID    :  OI-20260703-3BB09C", c: "#94A3B8", d: 4400 },
  { t: "  Rows      :  174,777", c: "#A5B4FC", d: 4650 },
  { t: "  Duration  :  4.21 sec", c: "#A5B4FC", d: 4900 },
  { t: "  Status    :  SUCCESS ✓", c: "#10B981", d: 5200 },
];

export default function Hero() {
  const [vis, setVis] = useState<number[]>([]);
  const refs = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    LINES.forEach((l, i) => {
      const t = setTimeout(() => setVis(p => [...p, i]), l.d);
      refs.current.push(t);
    });
    return () => refs.current.forEach(clearTimeout);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 bg-[#04060d]">
        <div className="absolute inset-0 grid-fine opacity-60" />
        {/* Radial glow blobs */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[600px] bg-indigo-600/8 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[500px] bg-violet-600/6 rounded-full blur-[100px] translate-y-1/3" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-cyan-500/4 rounded-full blur-[80px] -translate-y-1/2" />
        {/* Subtle noise overlay */}
        <div className="absolute inset-0 noise" />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-24 right-16 w-2 h-2 rounded-full bg-indigo-400/60 float" style={{ animationDelay: "0s" }} />
      <div className="absolute top-48 right-64 w-1.5 h-1.5 rounded-full bg-cyan-400/40 float" style={{ animationDelay: "1.5s" }} />
      <div className="absolute bottom-32 left-24 w-2 h-2 rounded-full bg-violet-400/50 float" style={{ animationDelay: "3s" }} />
      <div className="absolute bottom-56 left-64 w-1 h-1 rounded-full bg-indigo-300/30 float" style={{ animationDelay: "2s" }} />

      <div className="relative max-w-[1380px] mx-auto px-6 lg:px-12 pt-24 pb-16 grid lg:grid-cols-2 gap-10 xl:gap-14 items-center w-full">

        {/* ── LEFT ── */}
        <div className="flex flex-col gap-8">

          {/* Eyebrow badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-indigo-500/8 border border-indigo-500/20 rounded-full px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-[12px] font-medium text-indigo-300">Open Source · v1.0.0</span>
            </div>
            <span className="tag text-[#64748B] border-white/10 bg-white/3">MIT License</span>
          </div>

          {/* Headline */}
          <div>
            <h1 className="f-head text-[56px] lg:text-[68px] font-bold leading-[1.0] tracking-[-0.03em] text-white">
              Data ingestion,{" "}
              <span className="block">
                <span className="g-text">zero code.</span>
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-[#94A3B8] text-[17px] leading-[1.7] max-w-lg">
            OpenIngest discovers your datasets, validates schemas, runs quality checks, loads data
            into PostgreSQL, and generates Airflow DAGs — all from a single YAML file.
            No Python. No SQL. No DAG edits.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <a href="#install"
              className="relative flex items-center gap-2 font-semibold text-white text-[14px] px-6 py-3 rounded-xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 transition-all group-hover:from-indigo-500 group-hover:to-violet-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 blur-xl opacity-0 group-hover:opacity-40 transition-opacity" />
              <span className="relative">Get Started</span>
              <ArrowRight size={15} className="relative group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a href="https://github.com/manishkudtarkar/OpenIngest"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 font-semibold text-[#CBD5E1] hover:text-white text-[14px] px-6 py-3 rounded-xl border border-white/8 hover:border-white/15 bg-white/3 hover:bg-white/5 transition-all">
              <GithubIcon size={16} />
              View on GitHub
            </a>
          </div>

          {/* Micro stats */}
          <div className="flex items-center gap-6 pt-2 border-t border-white/5">
            {[
              ["174,777", "rows / run"],
              ["8", "datasets"],
              ["4.21s", "runtime"],
              ["99.4%", "quality"],
            ].map(([v, l]) => (
              <div key={l} className="flex flex-col">
                <span className="f-head text-[18px] font-bold text-white">{v}</span>
                <span className="text-[11px] text-[#475569] mt-0.5">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Terminal ── */}
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute -inset-4 bg-gradient-to-br from-indigo-600/10 to-violet-600/10 rounded-3xl blur-2xl" />

          <div className="relative panel-glow rounded-2xl overflow-hidden">
            {/* Terminal chrome */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-white/2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
              </div>
              <div className="flex items-center gap-2 bg-white/4 rounded-lg px-3 py-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-[#64748B] f-mono">openingest — bash</span>
              </div>
              <div className="w-16" />
            </div>

            {/* Terminal body */}
            <div className="px-5 py-5 min-h-[400px] bg-[#04060d]/70 f-mono text-[12.5px] leading-[1.85]">
              {LINES.map((line, i) => (
                <div key={i}
                  className="transition-all duration-300"
                  style={{
                    opacity: vis.includes(i) ? 1 : 0,
                    transform: vis.includes(i) ? "translateY(0)" : "translateY(4px)",
                    color: line.c || "transparent",
                  }}>
                  {line.t || "\u00A0"}
                </div>
              ))}
              {vis.length < LINES.length && (
                <span className="inline-block w-[7px] h-[14px] bg-indigo-400/80 blink ml-0.5" />
              )}
            </div>

            {/* Bottom status bar */}
            <div className="px-5 py-2.5 border-t border-white/5 bg-white/2 flex items-center justify-between">
              <span className="text-[11px] text-[#475569] f-mono">python 3.12 · postgresql 15</span>
              <span className="text-[11px] text-emerald-400 f-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                connected
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#04060d] to-transparent pointer-events-none" />
    </section>
  );
}
