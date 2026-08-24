"use client";
import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

const BEFORE = [
  "New dataset → write a brand new Python script",
  "Manually write SQL DDL for each staging table",
  "Schema changes break pipelines silently",
  "Quality issues surface only in downstream reports",
  "Airflow DAG needs editing for every new source",
  "No run history, no quality scores, no lineage",
];
const AFTER = [
  "New dataset → add one YAML block, done",
  "Tables auto-created from inferred column types",
  "Schema validation blocks bad data before load",
  "Quality engine scores every dataset every run",
  "New YAML entry auto-generates a DAG task group",
  "Full metadata, quality scores, lineage every run",
];

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function ManifestoChapter() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id="manifesto" ref={ref} className="relative overflow-hidden" style={{ paddingTop: "clamp(6rem,10vw,10rem)", paddingBottom: "clamp(6rem,10vw,10rem)" }}>
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute inset-0 bg-[#060a12]" />
        <div className="absolute inset-0 dot-grid opacity-[0.18]" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent" />
        <div
          className="chapter-num absolute -right-6 top-1/2 -translate-y-1/2 select-none pointer-events-none"
          style={{ opacity: 0.018, fontSize: "clamp(120px,20vw,220px)" }}
        >01</div>
      </motion.div>

      <div className="wrap relative z-10">

        <FadeUp>
          <div className="chapter-label mb-10 flex items-center gap-3">
            <span className="w-10 h-px bg-indigo-500/40" />
            <span>Chapter 01</span>
            <span className="text-[#1E293B] mx-1">/</span>
            <span className="text-[#334155]">The Problem</span>
          </div>
        </FadeUp>

        <FadeUp delay={0.08}>
          <h2 className="f-head font-bold leading-[1.04] tracking-[-0.035em] mb-6" style={{ fontSize: "clamp(38px,6vw,68px)" }}>
            <span className="block text-white">The old way is expensive.</span>
            <span className="block g-text">This is the fix.</span>
          </h2>
        </FadeUp>

        <FadeUp delay={0.16}>
          <p className="text-[#475569] text-[16px] sm:text-[17px] leading-[1.8] max-w-2xl mb-16">
            Every data team builds the same ingestion layer from scratch —
            ad-hoc scripts, manual DDL, no standards, no observability.
            OpenIngest makes it a one-time YAML configuration problem.
          </p>
        </FadeUp>

        <div className="grid md:grid-cols-2 gap-5">
          {/* BEFORE */}
          <FadeUp delay={0.24}>
            <div
              className="rounded-2xl p-8 relative overflow-hidden border h-full"
              style={{ borderColor: "rgba(244,63,94,0.12)", background: "rgba(244,63,94,0.025)" }}
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <span className="text-rose-400 text-[16px] font-bold leading-none">✕</span>
                </div>
                <div>
                  <div className="f-head font-bold text-white text-[15px]">Without OpenIngest</div>
                  <div className="text-[12px] text-rose-500/50 mt-0.5">Script per dataset · no standards</div>
                </div>
              </div>
              <ul className="space-y-4">
                {BEFORE.map(s => (
                  <li key={s} className="flex gap-3 text-[14px] text-[#334155] leading-relaxed">
                    <span className="text-rose-500/35 shrink-0 text-[13px] mt-0.5">✕</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>

          {/* AFTER */}
          <FadeUp delay={0.36}>
            <div
              className="rounded-2xl p-8 relative overflow-hidden border h-full"
              style={{ borderColor: "rgba(16,185,129,0.14)", background: "rgba(16,185,129,0.025)" }}
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <span className="text-emerald-400 text-[16px] font-bold leading-none">✓</span>
                </div>
                <div>
                  <div className="f-head font-bold text-white text-[15px]">With OpenIngest</div>
                  <div className="text-[12px] text-emerald-500/50 mt-0.5">Config-driven · zero repetition</div>
                </div>
              </div>
              <ul className="space-y-4">
                {AFTER.map(s => (
                  <li key={s} className="flex gap-3 text-[14px] text-[#CBD5E1] leading-relaxed">
                    <span className="text-emerald-400/70 shrink-0 text-[13px] mt-0.5">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>
        </div>

        {/* Marquee strip */}
        <FadeUp delay={0.5} className="mt-20 overflow-hidden border-y border-white/5 py-5">
          <div className="marquee-track">
            {[...Array(2)].map((_, ri) => (
              <div key={ri} className="flex items-center gap-14 pr-14">
                {[
                  "Dataset Discovery", "Schema Validation", "Data Quality Engine", "Incremental Loading",
                  "Auto DDL", "Metadata Logging", "Airflow DAG", "17 Connectors",
                  "YAML Transforms", "Slack + Email", "Built-in Scheduler", "Docker Ready",
                ].map(t => (
                  <span key={t} className="flex items-center gap-3 text-[11px] text-[#1E293B] uppercase tracking-[0.14em] whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/30" />
                    {t}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
