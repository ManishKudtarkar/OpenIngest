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
    before: "PM2.5, NO2(GT), Date Time",
    after: "pm25, no2, ts",
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
    before: '"12.4" (str)',
    after: "12.4 (float)",
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
    before: "8,420 rows",
    after: "7,981 rows",
    yaml: `  - type: filter
    expression: "pm25 >= 0 and no2 >= 0"`,
  },
  {
    type: "derive",
    accent: "#F59E0B",
    desc: "Compute new columns via df.eval() expressions.",
    before: "pm25, no2",
    after: "pm25, no2, aqi, ratio",
    yaml: `  - type: derive
    columns:
      aqi: "pm25 * 0.5 + no2 * 0.3"
      ratio: "pm25 / no2"`,
  },
  {
    type: "aggregate",
    accent: "#8B5CF6",
    desc: "Group-by aggregations — sum, mean, min, max, count.",
    before: "7,981 rows",
    after: "42 rows (by city)",
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
    before: "raw aqi",
    after: "aqi clipped 0–500",
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
    <section id="transforms" ref={ref} className="relative overflow-hidden" style={{ paddingTop: "clamp(5rem,9vw,8rem)", paddingBottom: "clamp(5rem,9vw,8rem)", background: "#060810" }}>
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute inset-0 grid-bg" style={{ opacity: 0.22 }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(245,158,11,0.12),transparent)" }} />
      </motion.div>

      <div className="site-pad relative z-10">
        <FadeUp>
          <span className="eyebrow" style={{ marginBottom: "1.5rem", display: "inline-flex" }}>Chapter 04 / Transformation Engine</span>
        </FadeUp>

        <FadeUp delay={0.05}>
          <h2 className="f-head" style={{ fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.04em", fontSize: "clamp(2.4rem,5.5vw,4.2rem)", marginBottom: "1.25rem" }}>
            <span style={{ color: "#F1F5F9" }}>Six YAML steps.</span>
            <br />
            <span className="g-amber">No Python required.</span>
          </h2>
          <p style={{ color: "#64748B", fontSize: 16, lineHeight: 1.7, maxWidth: 600, marginBottom: "clamp(3rem,5vw,4rem)" }}>
            Transformations run after quality checks, before the database write.
            Declare them in the <code className="f-mono" style={{ color: "#FDE68A", fontSize: 14, padding: "2px 6px", background: "rgba(253, 230, 138, 0.08)", borderRadius: "4px" }}>transforms:</code> block inside datasets.yaml.
          </p>
        </FadeUp>

        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-6 lg:gap-8 items-stretch">
          {/* left: step selector + detail */}
          <div className="flex flex-col gap-4">
            <FadeUp delay={0.1} className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {TRANSFORMS.map((t, i) => (
                <motion.button
                  key={t.type}
                  onClick={() => setActive(i)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`feat-card text-left p-3.5 transition-all ${active === i ? "border-white/12" : ""}`}
                  style={active === i ? { borderColor: t.accent + "35", background: t.accent + "09" } : {}}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-2 text-[11px] font-bold"
                    style={{ background: t.accent + "18", border: `1px solid ${t.accent}30`, color: t.accent }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="f-mono text-[13px] font-semibold leading-tight" style={{ color: active === i ? t.accent : "#64748B" }}>
                    {t.type}
                  </div>
                </motion.button>
              ))}
            </FadeUp>

            {/* detail card grows to fill remaining height */}
            <FadeUp delay={0.2} className="flex-1">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="glass rounded-2xl p-6 h-full flex flex-col"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: cur.accent, boxShadow: `0 0 10px ${cur.accent}70` }} />
                  <span className="text-white f-mono text-[15px] font-semibold">{cur.type}</span>
                  <span className="ml-auto text-[10px] f-mono px-2 py-0.5 rounded-full" style={{ color: cur.accent, background: cur.accent + "12", border: `1px solid ${cur.accent}25` }}>
                    step {active + 1}/6
                  </span>
                </div>
                <p className="text-[#94A3B8] text-[14px] leading-relaxed mb-5">{cur.desc}</p>

                {/* before → after preview */}
                <div className="mt-auto rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="text-[10px] f-mono uppercase tracking-wider text-[#52525B] mb-3">Effect on data</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-[9.5px] f-mono uppercase tracking-wide text-[#475569] mb-1">before</div>
                      <div className="f-mono text-[12px] text-[#94A3B8] truncate">{cur.before}</div>
                    </div>
                    <div className="text-[16px] shrink-0" style={{ color: cur.accent }}>→</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9.5px] f-mono uppercase tracking-wide text-[#475569] mb-1">after</div>
                      <div className="f-mono text-[12px] font-medium truncate" style={{ color: cur.accent }}>{cur.after}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </FadeUp>
          </div>

          {/* right: code editor */}
          <FadeUp delay={0.15}>
            <div className="terminal flex flex-col h-full">
              {/* editor tab bar */}
              <div className="terminal-bar justify-between shrink-0">
                <div className="flex gap-1.5">
                  <div className="t-dot bg-[#FF5F57]" />
                  <div className="t-dot bg-[#FFBD2E]" />
                  <div className="t-dot bg-[#27C93F]" />
                </div>
                <div className="flex items-center gap-1.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ color: "#52525B" }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[10.5px] text-[#71717A] f-mono font-medium">datasets.yaml</span>
                </div>
                <div className="w-16" />
              </div>

              {/* code area with line numbers */}
              <div className="flex-1 overflow-hidden">
                <motion.div
                  key={active}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="flex"
                >
                  {/* line-number gutter */}
                  <div className="shrink-0 py-5 pl-4 pr-3 text-right select-none" style={{ background: "rgba(255,255,255,0.015)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
                    {(() => {
                      const total = 3 + cur.yaml.split("\n").length;
                      return Array.from({ length: total }).map((_, n) => (
                        <div key={n} className="f-mono text-[11.5px] leading-[2]" style={{ color: "#3F3F46" }}>
                          {n + 1}
                        </div>
                      ));
                    })()}
                  </div>

                  {/* code lines */}
                  <div className="flex-1 py-5 pl-4 pr-5 overflow-x-auto">
                    <div className="f-mono text-[12.5px] leading-[2] text-[#7DD3FC] font-semibold">air_data:</div>
                    <div className="f-mono text-[12.5px] leading-[2] pl-3" style={{ color: "#3F3F46" }}>
                      staging_table: <span style={{ color: "#3F3F46" }}>stg_air_clean</span>
                    </div>
                    <div className="f-mono text-[12.5px] leading-[2] pl-3 italic" style={{ color: "#3F3F46" }}>
                      # source, load_strategy...
                    </div>
                    {cur.yaml.split("\n").map((line, idx) => {
                      const trimmed = line.trim();

                      if (line.startsWith("transforms")) {
                        return (
                          <div key={idx} className="f-mono text-[12.5px] leading-[2] font-bold" style={{ color: "#A78BFA" }}>
                            {line}
                          </div>
                        );
                      }

                      if (trimmed.startsWith("- type:")) {
                        const indent = line.substring(0, line.indexOf("-"));
                        const typeName = trimmed.split(":")[1]?.trim() || "";
                        return (
                          <div key={idx} className="f-mono text-[12.5px] leading-[2]">
                            <span style={{ color: "#52525B" }}>{indent}- </span>
                            <span style={{ color: "#A1A1AA" }}>type</span>
                            <span style={{ color: "#52525B" }}>: </span>
                            <span style={{ color: cur.accent, fontWeight: "700" }}>{typeName}</span>
                          </div>
                        );
                      }

                      if (trimmed.startsWith("#")) {
                        return (
                          <div key={idx} className="f-mono text-[11.5px] leading-[2] italic" style={{ color: "#3F3F46" }}>
                            {line}
                          </div>
                        );
                      }

                      if (trimmed.includes(":") && !trimmed.startsWith("-")) {
                        const colonIndex = line.indexOf(":");
                        const indent = line.substring(0, line.length - line.trimStart().length);
                        const key = line.substring(indent.length, colonIndex);
                        const value = line.substring(colonIndex + 1).trim();

                        let valueColor = "#FCD34D";
                        if (value.startsWith('"')) valueColor = "#6EE7B7";
                        else if (value.startsWith("[")) valueColor = "#FDE68A";
                        else if (value.match(/^[0-9.]+$/)) valueColor = "#F0ABFC";

                        return (
                          <div key={idx} className="f-mono text-[12.5px] leading-[2] whitespace-pre">
                            <span>{indent}</span>
                            <span style={{ color: "#A1A1AA" }}>{key}</span>
                            <span style={{ color: "#52525B" }}>:</span>
                            {value && <span style={{ color: valueColor, marginLeft: "0.5em" }}>{value}</span>}
                          </div>
                        );
                      }

                      return (
                        <div key={idx} className="f-mono text-[12.5px] leading-[2] whitespace-pre" style={{ color: "#71717A" }}>
                          {line || "\u00A0"}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              {/* editor status bar / pipeline flow */}
              <div className="shrink-0 flex items-center justify-between px-4 py-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {["source", "validate", "quality", "transform", "db"].map((s, i) => (
                    <div key={s} className="flex items-center gap-1.5">
                      <span
                        className="text-[9.5px] f-mono px-2 py-0.5 rounded font-semibold tracking-wide transition-colors"
                        style={
                          s === "transform"
                            ? { color: cur.accent, background: cur.accent + "15" }
                            : { color: "#52525B" }
                        }
                      >
                        {s}
                      </span>
                      {i < 4 && <span className="text-[#3F3F46] text-[9px]">›</span>}
                    </div>
                  ))}
                </div>
                <span className="text-[9.5px] f-mono text-[#52525B] hidden sm:block">YAML · UTF-8</span>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
