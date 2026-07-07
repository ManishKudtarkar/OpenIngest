"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Database, FileCode2, ShieldCheck } from "lucide-react";
import GithubIcon from "./GithubIcon";

const LINES = [
  { t: "$ openingest run", c: "#A5B4FC", d: 0 },
  { t: "", c: "", d: 500 },
  { t: "  Discovering datasets...", c: "#64748B", d: 800 },
  { t: "  OK  customers       ->  stg_customers    replace", c: "#10B981", d: 1200 },
  { t: "  OK  orders          ->  stg_orders       incremental", c: "#10B981", d: 1550 },
  { t: "  OK  products        ->  stg_products     replace", c: "#10B981", d: 1850 },
  { t: "  OK  sessions        ->  stg_sessions     replace", c: "#10B981", d: 2150 },
  { t: "  OK  events          ->  stg_events       incremental", c: "#10B981", d: 2450 },
  { t: "", c: "", d: 3350 },
  { t: "  Schema Validation   --  all pass", c: "#22D3EE", d: 3600 },
  { t: "  Quality Engine      --  avg 99.4%", c: "#22D3EE", d: 3900 },
  { t: "", c: "", d: 4150 },
  { t: "  Run ID    :  OI-20260703-3BB09C", c: "#94A3B8", d: 4400 },
  { t: "  Rows      :  174,777", c: "#A5B4FC", d: 4650 },
  { t: "  Duration  :  4.21 sec", c: "#A5B4FC", d: 4900 },
  { t: "  Status    :  SUCCESS", c: "#10B981", d: 5200 },
];

const FLOW = [
  { icon: FileCode2, label: "YAML config", value: "8 datasets" },
  { icon: ShieldCheck, label: "Validation", value: "all pass" },
  { icon: Database, label: "PostgreSQL", value: "174,777 rows" },
];

export default function Hero() {
  const [vis, setVis] = useState<number[]>([]);
  const refs = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    LINES.forEach((l, i) => {
      const t = setTimeout(() => setVis(p => [...p, i]), l.d);
      timers.push(t);
    });
    refs.current = timers;
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-[#04060d]">
        <div className="absolute inset-0 grid-fine opacity-45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.13),transparent_34%),linear-gradient(180deg,rgba(4,6,13,0)_0%,#04060d_94%)]" />
        <div className="absolute inset-0 noise" />
      </div>

      <div className="relative max-w-[1380px] mx-auto px-5 sm:px-6 lg:px-12 pt-28 pb-14 grid lg:grid-cols-[0.92fr_1.08fr] gap-10 xl:gap-14 items-center w-full">
        <div className="flex flex-col gap-7">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-[12px] font-medium text-cyan-200">Open source data ingestion</span>
            </div>
            <span className="tag text-[#94A3B8] border-white/10 bg-white/4">MIT License</span>
          </div>

          <div>
            <h1 className="f-head text-[44px] sm:text-[58px] lg:text-[70px] font-bold leading-[1.02] text-white">
              Production data ingestion from one YAML file.
            </h1>
            <p className="mt-6 text-[#94A3B8] text-[16px] sm:text-[17px] leading-[1.75] max-w-xl">
              OpenIngest discovers files, validates schemas, runs data quality checks,
              loads PostgreSQL, and generates Airflow tasks without hand-written pipeline code.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a href="#install"
              className="flex items-center gap-2 font-semibold text-[#041016] text-[14px] px-6 py-3 rounded-xl bg-cyan-300 hover:bg-cyan-200 transition-all shadow-[0_18px_50px_rgba(34,211,238,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70">
              <span>Start building</span>
              <ArrowRight size={15} />
            </a>
            <a href="https://github.com/manishkudtarkar/OpenIngest"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 font-semibold text-[#CBD5E1] hover:text-white text-[14px] px-6 py-3 rounded-xl border border-white/8 hover:border-white/16 bg-white/4 hover:bg-white/7 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50">
              <GithubIcon size={16} />
              View on GitHub
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              ["174k+", "rows / run"],
              ["8", "datasets"],
              ["4.21s", "runtime"],
              ["99.4%", "quality"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <span className="f-head text-[20px] font-bold text-white">{v}</span>
                <span className="block text-[11px] text-[#64748B] mt-0.5">{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#070b14]/88 shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="grid gap-3 border-b border-white/7 bg-white/[0.03] p-4 sm:grid-cols-3">
              {FLOW.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl border border-white/8 bg-[#04060d]/50 p-3">
                  <Icon size={16} className="mb-3 text-cyan-300" />
                  <div className="text-[11px] text-[#64748B]">{label}</div>
                  <div className="mt-1 text-[13px] font-semibold text-white">{value}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/7 bg-[#04060d]/70">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-[#64748B] f-mono">openingest -- bash</span>
              </div>
              <div className="w-16" />
            </div>

            <div className="px-4 sm:px-5 py-5 min-h-[370px] bg-[#04060d]/82 f-mono text-[11px] sm:text-[12.5px] leading-[1.85] overflow-x-auto">
              {LINES.map((line, i) => (
                <div key={i}
                  className="min-w-max transition-all duration-300"
                  style={{
                    opacity: vis.includes(i) ? 1 : 0,
                    transform: vis.includes(i) ? "translateY(0)" : "translateY(4px)",
                    color: line.c || "transparent",
                  }}>
                  {line.t || "\u00A0"}
                </div>
              ))}
              {vis.length < LINES.length && (
                <span className="inline-block w-[7px] h-[14px] bg-cyan-300/80 blink ml-0.5" />
              )}
            </div>

            <div className="px-5 py-2.5 border-t border-white/7 bg-white/[0.03] flex items-center justify-between">
              <span className="text-[11px] text-[#64748B] f-mono">python 3.12 / postgresql 15</span>
              <span className="text-[11px] text-emerald-400 f-mono flex items-center gap-1.5">
                <CheckCircle2 size={12} />
                connected
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#04060d] to-transparent pointer-events-none" />
    </section>
  );
}
