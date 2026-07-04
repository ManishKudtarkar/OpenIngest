"use client";
import { useState } from "react";

type LineStyle = "cmd" | "ok" | "info" | "dim" | "sep" | "blank";
const CMDS: {
  label: string;
  cmd: string;
  desc: string;
  lines: [string, LineStyle][];
}[] = [
  {
    label: "run",
    cmd: "openingest run",
    desc: "Full pipeline across all datasets.",
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
      ["══════════════════════════════════════", "sep"],
      ["  Run ID      :  OI-20260703-3BB09C", "info"],
      ["  Datasets    :  8", "info"],
      ["  Rows Loaded :  174,777", "info"],
      ["  Duration    :  4.21 sec", "info"],
      ["  Status      :  SUCCESS ✓", "ok"],
      ["══════════════════════════════════════", "sep"],
    ],
  },
  {
    label: "--dry-run",
    cmd: "openingest run --dry-run",
    desc: "Validate + quality check. No writes.",
    lines: [
      ["  DRY RUN MODE — no database writes", "info"],
      ["", "blank"],
      ["  customers    schema=✓  quality=100.0%  PASS", "ok"],
      ["  orders       schema=✓  quality=98.5%   PASS", "ok"],
      ["  products     schema=✓  quality=100.0%  PASS", "ok"],
      ["  sessions     schema=✓  quality=100.0%  PASS", "ok"],
      ["  employees    schema=✓  quality=100.0%  PASS", "ok"],
      ["  events       schema=✓  quality=99.2%   PASS", "ok"],
      ["  order_items  schema=✓  quality=100.0%  PASS", "ok"],
      ["  reviews      schema=✓  quality=97.8%   PASS", "ok"],
      ["", "blank"],
      ["  Dry run complete.  0 rows written.", "info"],
    ],
  },
  {
    label: "--dataset",
    cmd: "openingest run --dataset orders",
    desc: "Run a single dataset only.",
    lines: [
      ["  Dataset       :  orders", "info"],
      ["  Strategy      :  incremental", "info"],
      ["  Watermark col :  order_time", "info"],
      ["", "blank"],
      ["  Schema   →  PASS", "ok"],
      ["  Quality  →  PASS (98.50%)", "ok"],
      ["", "blank"],
      ["  New rows     :  1,240", "info"],
      ["  Changed rows :  18  (hash diff)", "info"],
      ["  Upserted     :  1,258  →  stg_orders", "ok"],
      ["", "blank"],
      ["  Duration  :  0.81 sec  ·  SUCCESS", "ok"],
    ],
  },
  {
    label: "quality",
    cmd: "openingest quality",
    desc: "Quality scores across all datasets.",
    lines: [
      ["  Dataset       Quality    Nulls   Dupes   Status", "dim"],
      ["  ──────────    ────────   ─────   ─────   ──────", "dim"],
      ["  customers     100.00%    0       0       PASS", "ok"],
      ["  orders         98.50%    3       0       PASS", "ok"],
      ["  products      100.00%    0       0       PASS", "ok"],
      ["  sessions      100.00%    0       0       PASS", "ok"],
      ["  employees     100.00%    0       0       PASS", "ok"],
      ["  events         99.20%    8       0       PASS", "ok"],
      ["  order_items   100.00%    0       0       PASS", "ok"],
      ["  reviews        97.80%    12      4       PASS", "ok"],
      ["", "blank"],
      ["  Overall Quality Score  →  99.4%", "info"],
    ],
  },
  {
    label: "history",
    cmd: "openingest history --limit 5",
    desc: "Pipeline run history with timing.",
    lines: [
      ["  Run ID              Timestamp              Rows     Dur    Status", "dim"],
      ["  ──────────────────  ─────────────────────  ──────   ────   ──────", "dim"],
      ["  OI-20260703-3BB09C  2026-07-03 09:42:11    174,777  4.21s  ✓ OK", "ok"],
      ["  OI-20260702-A12F4E  2026-07-02 09:38:04    174,230  4.18s  ✓ OK", "ok"],
      ["  OI-20260701-9C5E3A  2026-07-01 09:41:38    173,890  4.24s  ✓ OK", "ok"],
      ["  OI-20260630-7D2B1C  2026-06-30 09:39:22    173,412  4.19s  ✓ OK", "ok"],
      ["  OI-20260629-5A3F9E  2026-06-29 09:43:55    172,965  4.22s  ✓ OK", "ok"],
    ],
  },
  {
    label: "validate",
    cmd: "openingest validate",
    desc: "Schema-only pass. No data loaded.",
    lines: [
      ["  Running schema validation across 8 datasets...", "info"],
      ["", "blank"],
      ["  customers    required=6   present=6   extra=0   ✓", "ok"],
      ["  orders       required=5   present=5   extra=0   ✓", "ok"],
      ["  products     required=6   present=6   extra=0   ✓", "ok"],
      ["  sessions     required=6   present=6   extra=0   ✓", "ok"],
      ["  employees    required=8   present=8   extra=0   ✓", "ok"],
      ["  events       required=10  present=10  extra=0   ✓", "ok"],
      ["  order_items  required=5   present=5   extra=0   ✓", "ok"],
      ["  reviews      required=6   present=6   extra=0   ✓", "ok"],
      ["", "blank"],
      ["  All 8 schemas valid.", "ok"],
    ],
  },
];

const lineColor: Record<LineStyle, string> = {
  cmd:   "#A5B4FC",
  ok:    "#10B981",
  info:  "#22D3EE",
  dim:   "#334155",
  sep:   "#1E293B",
  blank: "transparent",
};

export default function CLISection() {
  const [idx, setIdx] = useState(0);
  const active = CMDS[idx];

  return (
    <section id="cli" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[#080c18]" />
      <div className="absolute inset-0 grid-fine opacity-40" />
      <div className="absolute left-0 top-1/2 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[100px] -translate-y-1/2" />

      <div className="relative max-w-[1380px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 tag text-indigo-400 border-indigo-500/25 bg-indigo-500/8 mb-5">
            Command Line Interface
          </div>
          <h2 className="f-head text-[42px] md:text-[52px] font-bold text-white leading-[1.1] tracking-[-0.025em] mb-4">
            Everything from the terminal.
          </h2>
          <p className="text-[#94A3B8] text-[16px]">
            Real output. Real run. Every number is accurate.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-5">
          {/* Picker */}
          <div className="lg:col-span-2 flex flex-col gap-1.5">
            {CMDS.map((c, i) => (
              <button key={c.label} onClick={() => setIdx(i)}
                className={`text-left px-4 py-3.5 rounded-xl border transition-all
                ${idx === i
                  ? "border-white/10 bg-white/4 text-white"
                  : "border-transparent hover:border-white/6 text-[#475569] hover:text-[#94A3B8]"
                }`}>
                <div className="text-[13px] font-semibold f-mono mb-1"
                  style={{ color: idx === i ? "#A5B4FC" : undefined }}>
                  {c.label}
                </div>
                <div className="text-[12px] text-[#334155] leading-snug">{c.desc}</div>
              </button>
            ))}
          </div>

          {/* Terminal */}
          <div className="lg:col-span-3 panel-glow rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-white/2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
              </div>
              <span className="text-[11px] text-[#334155] f-mono">bash — openingest</span>
              <div className="w-16" />
            </div>

            <div className="px-5 py-5 min-h-[320px] f-mono text-[12px] leading-[1.9]">
              {/* Prompt */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[#6366F1]">❯</span>
                <span className="text-[#A5B4FC]">{active.cmd}</span>
              </div>
              {active.lines.map(([text, style], i) => (
                <div key={i} style={{ color: style === "blank" ? "transparent" : lineColor[style] }}>
                  {text || "\u00A0"}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
