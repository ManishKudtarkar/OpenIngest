"use client";
import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

const BEFORE = [
  "New dataset → write a new Python script",
  "Manually write SQL DDL for each staging table",
  "Schema changes break pipelines silently",
  "Quality issues surface in downstream reports",
  "Airflow DAG needs editing for every new source",
  "No run history. No quality scores. No lineage.",
];
const AFTER = [
  "New dataset → add one YAML block, done",
  "Tables auto-created from inferred column types",
  "Schema validation blocks bad data before load",
  "Quality engine scores every dataset every run",
  "New YAML entry auto-generates a DAG task group",
  "Full metadata, quality, lineage on every run",
];

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function ManifestoChapter() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section id="manifesto" ref={ref} className="relative py-32 overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute inset-0 bg-[#050810]" />
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        {/* big background number */}
        <div className="chapter-num absolute -right-8 top-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.025]">
          01
        </div>
      </motion.div>

      <div className="wrap relative z-10">
        {/* chapter label */}
        <FadeUp>
          <div className="chapter-label mb-8 flex items-center gap-3">
            <span className="w-8 h-px bg-indigo-500/40" />
            <span>Chapter 01</span>
            <span className="text-[#1E293B]">/</span>
            <span className="text-[#334155]">The Problem</span>
          </div>
        </FadeUp>

        {/* main headline */}
        <FadeUp delay={0.1}>
          <h2 className="f-head font-bold leading-[1.06] tracking-[-0.03em] mb-6 max-w-3xl">
            <span className="block text-[clamp(32px,5vw,56px)] text-white">
              The old way is expensive.
            </span>
            <span className="block text-[clamp(32px,5vw,56px)] g-text">
              This is the fix.
            </span>
          </h2>
        </FadeUp>

        <FadeUp delay={0.2}>
          <p className="text-[#475569] text-[15px] leading-relaxed max-w-xl mb-16">
            Every data team builds the same ingestion layer from scratch — ad-hoc scripts, manual DDL, no standards.
            OpenIngest makes it a one-time YAML problem.
          </p>
        </FadeUp>

        {/* before / after grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Before */}
          <FadeUp delay={0.3}>
            <div
              className="rounded-2xl p-7 relative overflow-hidden border"
              style={{ borderColor: "rgba(244,63,94,0.10)", background: "rgba(244,63,94,0.02)" }}
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-rose-500/8 border border-rose-500/15 flex items-center justify-center">
                  <span className="text-rose-400 text-[14px] leading-none">✕</span>
                </div>
                <div>
                  <div className="f-head font-bold text-white text-[13.5px]">Without OpenIngest</div>
                  <div className="text-[11px] text-rose-500/50 mt-0.5">Script per dataset · No standards</div>
                </div>
              </div>
              <ul className="space-y-3">
                {BEFORE.map(s => (
                  <li key={s} className="flex gap-3 text-[13px] text-[#334155] leading-snug">
                    <span className="text-rose-500/30 mt-0.5 shrink-0 text-[12px]">✕</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>

          {/* After */}
          <FadeUp delay={0.45}>
            <div
              className="rounded-2xl p-7 relative overflow-hidden border"
              style={{ borderColor: "rgba(16,185,129,0.12)", background: "rgba(16,185,129,0.02)" }}
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/8 border border-emerald-500/15 flex items-center justify-center">
                  <span className="text-emerald-400 text-[14px] leading-none">✓</span>
                </div>
                <div>
                  <div className="f-head font-bold text-white text-[13.5px]">With OpenIngest</div>
                  <div className="text-[11px] text-emerald-500/50 mt-0.5">Config-driven · Zero repetition</div>
                </div>
              </div>
              <ul className="space-y-3">
                {AFTER.map(s => (
                  <li key={s} className="flex gap-3 text-[13px] text-[#94A3B8] leading-snug">
                    <span className="text-emerald-400/70 mt-0.5 shrink-0 text-[12px]">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>
        </div>

        {/* marquee strip */}
        <FadeUp delay={0.6} className="mt-20 overflow-hidden border-y border-white/4 py-5">
          <div className="marquee-track">
            {[...Array(2)].map((_, ri) => (
              <div key={ri} className="flex items-center gap-12 pr-12">
                {[
                  "Discovery", "Schema Validation", "Data Quality", "Incremental Loading",
                  "Auto Table Creation", "Metadata Tracking", "Airflow DAG", "17 Connectors",
                  "YAML Transforms", "Slack Alerts", "CLI", "Docker Ready",
                ].map(t => (
                  <span key={t} className="flex items-center gap-3 text-[11.5px] text-[#334155] uppercase tracking-[0.12em] whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/40" />
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
