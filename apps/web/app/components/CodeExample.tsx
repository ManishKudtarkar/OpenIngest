"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

type Seg = [string, string]; // [type, text]

const DATASETS: {
  name: string;
  strategy: string;
  accent: string;
  segments: Seg[][];
}[] = [
  {
    name: "customers",
    strategy: "replace",
    accent: "#6366F1",
    segments: [
      [["k", "  customers:"]],
      [["k", "    file: "], ["s", "customers.csv"]],
      [["k", "    staging_table: "], ["s", "stg_customers"]],
      [["k", "    load_strategy: "], ["v", "replace"]],
      [["k", "    primary_key:"], ["c", "  # unique row identifier"]],
      [["k", "      - "], ["s", "customer_id"]],
      [["k", "    required_columns:"]],
      [["k", "      - "], ["s", "customer_id"]],
      [["k", "      - "], ["s", "name"]],
      [["k", "      - "], ["s", "email"]],
      [["k", "      - "], ["s", "country"]],
      [["k", "      - "], ["s", "age"]],
      [["k", "      - "], ["s", "signup_date"]],
      [["k", "    unique_columns:"]],
      [["k", "      - "], ["s", "customer_id"]],
      [["k", "    non_null_columns:"]],
      [["k", "      - "], ["s", "customer_id"]],
      [["k", "      - "], ["s", "email"]],
    ],
  },
  {
    name: "orders",
    strategy: "incremental",
    accent: "#8B5CF6",
    segments: [
      [["k", "  orders:"]],
      [["k", "    file: "], ["s", "orders.csv"]],
      [["k", "    staging_table: "], ["s", "stg_orders"]],
      [["k", "    load_strategy: "], ["v", "incremental"]],
      [["k", "    incremental_column: "], ["s", "order_time"], ["c", "  # watermark"]],
      [["k", "    hash_columns:"], ["c", "  # change detection"]],
      [["k", "      - "], ["s", "customer_id"]],
      [["k", "      - "], ["s", "subtotal_usd"]],
      [["k", "      - "], ["s", "total_usd"]],
      [["k", "      - "], ["s", "payment_method"]],
      [["k", "    primary_key:"]],
      [["k", "      - "], ["s", "order_id"]],
      [["k", "    required_columns:"]],
      [["k", "      - "], ["s", "order_id"]],
      [["k", "      - "], ["s", "customer_id"]],
      [["k", "      - "], ["s", "order_time"]],
      [["k", "      - "], ["s", "subtotal_usd"]],
      [["k", "      - "], ["s", "total_usd"]],
    ],
  },
  {
    name: "events",
    strategy: "incremental",
    accent: "#14B8A6",
    segments: [
      [["k", "  events:"]],
      [["k", "    file: "], ["s", "events.csv"]],
      [["k", "    staging_table: "], ["s", "stg_events"]],
      [["k", "    load_strategy: "], ["v", "incremental"]],
      [["k", "    incremental_column: "], ["s", "timestamp"]],
      [["k", "    hash_columns:"]],
      [["k", "      - "], ["s", "session_id"]],
      [["k", "      - "], ["s", "event_type"]],
      [["k", "      - "], ["s", "amount_usd"]],
      [["k", "    primary_key:"]],
      [["k", "      - "], ["s", "event_id"]],
      [["k", "    non_null_columns:"]],
      [["k", "      - "], ["s", "event_id"]],
      [["k", "      - "], ["s", "session_id"]],
      [["k", "      - "], ["s", "event_type"]],
    ],
  },
];

const segColor: Record<string, string> = {
  k: "#CBD5E1",
  s: "#34D399",
  v: "#FBBF24",
  c: "#334155",
};

export default function CodeExample() {
  const [idx, setIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const ds = DATASETS[idx];

  const rawText = `datasets:\n${ds.segments.map(r => r.map(([, t]) => t).join("")).join("\n")}`;

  const copy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[#04060d]" />
      <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px]" />

      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left */}
          <div className="lg:sticky lg:top-28">
            <div className="inline-flex items-center gap-2 tag text-violet-400 border-violet-500/25 bg-violet-500/8 mb-6">
              Zero boilerplate
            </div>
            <h2 className="f-head text-[38px] md:text-[48px] font-bold text-white leading-[1.1] tracking-[-0.025em] mb-5">
              One file.{" "}
              <span className="g-text-warm">Everything automated.</span>
            </h2>
            <p className="text-[#94A3B8] text-[15px] leading-relaxed mb-8">
              This is the real <code className="text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded f-mono text-[13px]">configs/datasets.yaml</code>.
              Register your dataset once — OpenIngest creates the table, validates schemas,
              runs quality checks, and loads with the right strategy on every run.
            </p>

            {/* Dataset tabs */}
            <div className="flex flex-col gap-2 mb-8">
              {DATASETS.map((d, i) => (
                <button key={d.name} onClick={() => setIdx(i)}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all text-left
                  ${idx === i
                    ? "border-white/12 bg-white/4 text-white"
                    : "border-transparent hover:border-white/6 text-[#64748B] hover:text-[#94A3B8]"
                  }`}>
                  <span className="f-mono text-[13px] font-semibold">{d.name}</span>
                  <span className="tag text-[11px] font-medium"
                    style={{
                      color: d.accent,
                      borderColor: `${d.accent}30`,
                      background: `${d.accent}10`,
                    }}>
                    {d.strategy}
                  </span>
                </button>
              ))}
            </div>

            <ul className="space-y-2.5">
              {[
                "8 datasets configured — 5 replace, 3 incremental",
                "Tables auto-created from inferred column types",
                "Incremental: watermark + SHA-256 hash CDC + upsert",
                "Quality rules per dataset: non_null, unique, range",
              ].map(s => (
                <li key={s} className="flex items-start gap-2.5 text-[13px] text-[#64748B]">
                  <Check size={13} className="text-emerald-400 mt-[3px] shrink-0" />{s}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: code block */}
          <div className="panel-glow rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-white/2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
              </div>
              <span className="text-[11px] text-[#334155] f-mono">configs/datasets.yaml</span>
              <button onClick={copy}
                className="flex items-center gap-1.5 text-[11px] text-[#475569] hover:text-white transition-colors">
                {copied
                  ? <><Check size={12} className="text-emerald-400" /> Copied</>
                  : <><Copy size={12} /> Copy</>}
              </button>
            </div>

            {/* Code */}
            <div className="px-5 py-5 f-mono text-[12.5px] leading-[1.9] overflow-x-auto min-h-[360px]">
              <div className="text-[#6366F1] font-bold mb-1">datasets:</div>
              {ds.segments.map((row, ri) => (
                <div key={ri}>
                  {row.map(([type, text], ci) => (
                    <span key={ci} style={{ color: segColor[type] ?? "#CBD5E1" }}>{text}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
