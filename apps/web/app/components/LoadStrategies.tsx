import { RefreshCw, Plus, TrendingUp } from "lucide-react";

const STRATEGIES = [
  {
    icon: RefreshCw,
    name: "replace",
    sub: "Truncate + full reload",
    desc: "Wipes the staging table and reloads all data on each run. Best for reference tables that are fully replaced.",
    used: ["customers", "products", "sessions", "employees", "order_items"],
    code: `load_strategy: replace`,
    c: "#6366F1",
  },
  {
    icon: Plus,
    name: "append",
    sub: "Insert new rows only",
    desc: "Adds rows without touching existing records. Best for immutable event logs where history never changes.",
    used: ["(future connector)"],
    code: `load_strategy: append`,
    c: "#22D3EE",
  },
  {
    icon: TrendingUp,
    name: "incremental",
    sub: "Watermark + hash CDC + upsert",
    desc: "Filters by watermark column, detects changed rows via SHA-256 hash, upserts using ON CONFLICT DO UPDATE. State persisted in pipeline_incremental_state.",
    used: ["orders", "events", "reviews"],
    code: `load_strategy: incremental\nincremental_column: order_time\nhash_columns:\n  - customer_id\n  - subtotal_usd`,
    c: "#8B5CF6",
  },
];

export default function LoadStrategies() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-[#080c18]" />
      <div className="absolute inset-0 dot-grid opacity-20" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="section-container">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 tag text-violet-400 border-violet-500/25 bg-violet-500/8 mb-5">
            Load strategies
          </div>
          <h2 className="f-head text-[38px] md:text-[48px] font-bold text-white leading-[1.1] tracking-[-0.025em] mb-4">
            Right strategy for every dataset.
          </h2>
          <p className="text-[#94A3B8] text-[15px] max-w-lg mx-auto">
            Set once in YAML. Watermarks, hashes, upserts, and state tables handled automatically.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {STRATEGIES.map(({ icon: Icon, name, sub, desc, used, code, c }) => (
            <div key={name} className="panel rounded-2xl p-6 overflow-hidden relative group hover:border-white/10 transition-all">
              <div className="absolute top-0 inset-x-0 h-px"
                style={{ background: `linear-gradient(to right, transparent, ${c}50, transparent)` }} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `radial-gradient(circle at 50% 0%, ${c}08 0%, transparent 60%)` }} />

              <div className="relative">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${c}15`, border: `1px solid ${c}25` }}>
                  <Icon size={19} style={{ color: c }} />
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="f-head font-bold text-white text-[17px]">{name}</h3>
                  </div>
                  <p className="text-[12px] font-medium" style={{ color: c }}>{sub}</p>
                </div>

                <p className="text-[#64748B] text-[13px] leading-relaxed mb-5">{desc}</p>

                {/* Used by */}
                <div className="mb-5">
                  <div className="text-[10px] text-[#334155] uppercase tracking-wider mb-2">Used by</div>
                  <div className="flex flex-wrap gap-1.5">
                    {used.map(u => (
                      <span key={u} className="text-[11px] f-mono text-[#64748B] bg-white/4 px-2 py-0.5 rounded border border-white/6">
                        {u}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Code */}
                <div className="bg-[#04060d]/80 rounded-lg border border-white/6 px-4 py-3 f-mono text-[11.5px] leading-[1.9]">
                  {code.split("\n").map((line, i) => {
                    const [k, v] = line.split(": ");
                    return (
                      <div key={i}>
                        {v !== undefined ? (
                          <><span className="text-[#CBD5E1]">{k}: </span><span className="text-[#FBBF24]">{v}</span></>
                        ) : (
                          <span className="text-[#CBD5E1]">{line}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
