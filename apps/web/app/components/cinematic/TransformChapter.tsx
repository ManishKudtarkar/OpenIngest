"use client";
import { useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

const TRANSFORMS = [
  {
    type: "rename",
    accent: "#6366F1",
    desc: "Rename columns from source names to clean pipeline names.",
    yaml: `transforms:
  - type: rename
    columns:
      "PM2.5": pm25
      "NO2(GT)": no2
      "Date Time": ts`,
  },
  {
    type: "cast",
    accent: "#22D3EE",
    desc: "Cast column types — int, float, str, bool, date, datetime.",
    yaml: `  - type: cast
    columns:
      pm25: float
      no2: float
      ts: datetime`,
  },
  {
    type: "filter",
    accent: "#10B981",
    desc: "Drop rows that don't match a pandas df.query() expression.",
    yaml: `  - type: filter
    expression: "pm25 >= 0 and no2 >= 0"`,
  },
  {
    type: "derive",
    accent: "#F59E0B",
    desc: "Compute new columns via df.eval() expressions.",
    yaml: `  - type: derive
    columns:
      aqi: "pm25 * 0.5 + no2 * 0.3"
      ratio: "pm25 / no2"`,
  },
  {
    type: "aggregate",
    accent: "#8B5CF6",
    desc: "Group-by aggregations — sum, mean, min, max, count.",
    yaml: `  - type: aggregate
    group_by: [City, Date]
    aggregations:
      pm25: mean
      aqi: mean`,
  },
  {
    type: "python",
    accent: "#EC4899",
    desc: "Call any Python function by dotted import path or inline code.",
    yaml: `  - type: python
    function: utils.transforms.normalise_aqi
    # OR inline:
    code: "df['aqi'] = df['aqi'].clip(0, 500)"`,
  },
];

export default function TransformChapter() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const cur = TRANSFORMS[active];

  return (
    <section id="transforms" ref={ref} className="relative py-32 overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute inset-0 bg-[#080c18]" />
        <div className="absolute inset-0 grid-fine opacity-15" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/10 to-transparent" />
        <div className="chapter-num absolute left-1/2 -translate-x-1/2 top-8 opacity-[0.025]">04</div>
      </motion.div>

      <div className="wrap relative z-10">
        <FadeUp>
          <div className="chapter-label mb-8 flex items-center gap-3">
            <span className="w-8 h-px bg-amber-500/40" />
            <span>Chapter 04</span>
            <span className="text-[#1E293B]">/</span>
            <span className="text-[#334155]">Transformation Engine</span>
          </div>
        </FadeUp>

        <FadeUp delay={0.05}>
          <h2 className="f-head font-bold leading-[1.06] tracking-[-0.03em] text-[clamp(28px,4vw,48px)] text-white mb-4">
            Six YAML steps.<br/>
            <span className="g-text">No Python required.</span>
          </h2>
          <p className="text-[#475569] text-[14px] leading-relaxed mb-12 max-w-xl">
            Transformations run after quality checks, before the database write.
            Declare them in <code className="text-amber-400 f-mono text-[13px]">transforms:</code> blocks inside datasets.yaml.
          </p>
        </FadeUp>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* transform type pills */}
          <div>
            <FadeUp delay={0.1} className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {TRANSFORMS.map((t, i) => (
                <motion.button
                  key={t.type}
                  onClick={() => setActive(i)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`feat-card text-left p-4 transition-all ${active === i ? "border-white/12" : ""}`}
                  style={active === i ? { borderColor: t.accent + "30", background: t.accent + "08" } : {}}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center mb-3 text-[11px] font-bold"
                    style={{ background: t.accent + "15", border: `1px solid ${t.accent}25`, color: t.accent }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="f-mono text-[12px] font-semibold" style={{ color: active === i ? t.accent : "#64748B" }}>
                    {t.type}
                  </div>
                </motion.button>
              ))}
            </FadeUp>

            <FadeUp delay={0.2}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="glass rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: cur.accent }} />
                  <span className="text-white f-mono text-[13px] font-semibold">{cur.type}</span>
                </div>
                <p className="text-[#64748B] text-[13px] leading-relaxed">{cur.desc}</p>
              </motion.div>
            </FadeUp>
          </div>

          {/* live YAML preview */}
          <FadeUp delay={0.15} className="lg:sticky lg:top-28">
            <div className="terminal">
              <div className="terminal-bar justify-between">
                <div className="flex gap-1.5">
                  <div className="t-dot bg-[#FF5F57]" />
                  <div className="t-dot bg-[#FFBD2E]" />
                  <div className="t-dot bg-[#27C93F]" />
                </div>
                <span className="text-[10px] text-[#334155] f-mono">configs/datasets.yaml</span>
                <div className="w-16" />
              </div>
              <div className="px-5 py-5 min-h-[280px]">
                <div className="f-mono text-[11.5px] text-[#475569] mb-2">air_data:</div>
                <div className="f-mono text-[11.5px] text-[#334155] mb-2">{"  ..."}  <span className="text-[#1E293B]"># source, staging_table, etc.</span></div>
                <motion.div
                  key={active}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {cur.yaml.split("\n").map((line, i) => {
                    const trimmed = line;
                    let color = "#64748B";
                    if (trimmed.includes("type:")) color = cur.accent;
                    else if (trimmed.startsWith("transforms")) color = "#A5B4FC";
                    else if (trimmed.trim().startsWith("- ") || trimmed.trim().startsWith("#")) color = "#334155";
                    else if (trimmed.includes(":") && !trimmed.startsWith(" ")) color = "#94A3B8";
                    return (
                      <div key={i} className="f-mono text-[11.5px] leading-[1.9]" style={{ color }}>
                        {line || "\u00A0"}
                      </div>
                    );
                  })}
                </motion.div>
              </div>
            </div>

            {/* flow diagram */}
            <div className="mt-4 glass rounded-xl p-4 flex items-center gap-2 flex-wrap">
              {["source", "validate", "quality", "transform", "→ db"].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <span
                    className="text-[10.5px] f-mono px-2 py-1 rounded border"
                    style={
                      s === "transform"
                        ? { color: cur.accent, borderColor: cur.accent + "30", background: cur.accent + "10" }
                        : { color: "#334155", borderColor: "rgba(255,255,255,0.06)", background: "transparent" }
                    }
                  >
                    {s}
                  </span>
                  {i < 4 && <span className="text-[#1E293B] text-[10px]">›</span>}
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
