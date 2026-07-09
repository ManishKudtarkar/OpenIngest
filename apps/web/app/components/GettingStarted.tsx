"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

const STEPS = [
  {
    n: "01",
    title: "Install OpenIngest",
    code: `pip install openingest`,
    note: "Gives you the openingest CLI. Windows: add Python Scripts to PATH if needed.",
  },
  {
    n: "02",
    title: "Create a project",
    code: `openingest init my-pipeline
cd my-pipeline`,
    note: "Scaffolds configs/, data/raw/, .env, and docker-compose.yml for you.",
  },
  {
    n: "03",
    title: "Configure database",
    code: `# Edit .env:
DATABASE_URL=postgresql://user:password@localhost:5432/openingest`,
    note: null,
  },
  {
    n: "04",
    title: "Start PostgreSQL",
    code: `docker compose up -d`,
    note: "PostgreSQL on 5432. Airflow UI at localhost:8080 — login: admin / admin",
  },
  {
    n: "05",
    title: "Drop your data and run",
    code: `# Drop CSV/Excel/Parquet files into data/raw/
openingest infer data/raw/customers.csv   # auto-generate config
openingest run                             # load everything`,
    note: "Discovers datasets, validates schemas, checks quality, loads PostgreSQL.",
  },
  {
    n: "06",
    title: "Explore the CLI",
    code: `openingest validate     # schema only
openingest quality      # quality scores
openingest report       # latest run summary
openingest history      # run history
openingest dashboard    # monitoring view`,
    note: null,
  },
];

function Block({ code }: { code: string }) {
  const [c, setC] = useState(false);
  return (
    <div className="relative group">
      <div className="panel-glow rounded-xl px-5 py-4 f-mono text-[12.5px] text-[#10B981] leading-[1.85] overflow-x-auto">
        {code.split("\n").map((l, i) => (
          <div key={i}
            style={{ color: l.startsWith("#") ? "#334155" : l.startsWith("openingest") ? "#A5B4FC" : "#10B981" }}>
            {l}
          </div>
        ))}
      </div>
      <button
        onClick={() => { navigator.clipboard.writeText(code); setC(true); setTimeout(() => setC(false), 2000); }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] text-[#475569] hover:text-white">
        {c ? <><Check size={12} className="text-emerald-400" /> Copied</> : <><Copy size={12} /> Copy</>}
      </button>
    </div>
  );
}

export default function GettingStarted() {
  return (
    <section id="getting-started" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[#080c18]" />
      <div className="absolute left-0 top-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[100px]" />

      <div className="section-container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 tag text-emerald-400 border-emerald-500/25 bg-emerald-500/8 mb-5">
            6 steps · &lt;10 minutes
          </div>
          <h2 className="f-head text-[42px] md:text-[52px] font-bold text-white leading-[1.1] tracking-[-0.025em] mb-4">
            Up and running fast.
          </h2>
          <p className="text-[#94A3B8] text-[16px]">
            From clone to 174,777 rows loaded in under 10 minutes.
          </p>
        </div>

        <div className="space-y-0">
          {STEPS.map((step, i) => (
            <div key={step.n} className="flex gap-6">
              {/* Spine */}
              <div className="flex flex-col items-center w-10 shrink-0">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center shrink-0">
                  <span className="f-head text-[11px] font-bold text-indigo-400">{step.n}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-px flex-1 bg-gradient-to-b from-indigo-500/25 to-transparent min-h-[32px] my-2" />
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 ${i < STEPS.length - 1 ? "pb-10" : ""}`}>
                <h3 className="f-head font-semibold text-white text-[15px] mb-3">{step.title}</h3>
                <Block code={step.code} />
                {step.note && (
                  <p className="text-[12px] text-[#334155] mt-2 leading-relaxed">{step.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Expected output */}
        <div className="mt-14 panel-glow rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/5 bg-white/2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[12px] text-[#475569] f-mono">Expected output · openingest run</span>
          </div>
          <div className="px-5 py-5 f-mono text-[12px] leading-[1.9] overflow-x-auto">
            <div className="text-[#475569]">Run ID : OI-20260703-3BB09C</div>
            <div className="text-[#1E293B]">&nbsp;</div>
            {[
              ["customers",   "stg_customers",   "replace",     "100.00%"],
              ["orders",      "stg_orders",       "incremental", "98.50%"],
              ["products",    "stg_products",     "replace",     "100.00%"],
              ["sessions",    "stg_sessions",     "replace",     "100.00%"],
              ["employees",   "stg_employees",    "replace",     "100.00%"],
              ["events",      "stg_events",       "incremental", "99.20%"],
              ["order_items", "stg_order_items",  "replace",     "100.00%"],
              ["reviews",     "stg_reviews",      "incremental", "97.80%"],
            ].map(([n, t, s, q]) => (
              <div key={n} className="flex gap-2">
                <span className="text-[#10B981]">✓</span>
                <span className="text-[#64748B] w-14 shrink-0">{n}</span>
                <span className="text-[#334155]">→</span>
                <span className="text-[#475569] w-24 shrink-0">{t}</span>
                <span className="text-[#1E293B] w-14 shrink-0">{s}</span>
                <span className="text-[#22D3EE]">{q}</span>
              </div>
            ))}
            <div className="text-[#1E293B]">&nbsp;</div>
            <div><span className="text-[#64748B]">Rows     : </span><span className="text-[#A5B4FC]">174,777</span></div>
            <div><span className="text-[#64748B]">Duration : </span><span className="text-[#A5B4FC]">4.21 sec</span></div>
            <div><span className="text-[#64748B]">Status   : </span><span className="text-[#10B981] font-bold">SUCCESS ✓</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
