"use client";
import { useState, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Copy, Check, ArrowRight } from "lucide-react";
import GithubIcon from "../GithubIcon";

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

const STEPS = [
  {
    n: "01", title: "Install",
    code: "pip install openingest",
    note: "Registers the openingest CLI. Windows: add Python Scripts to PATH if needed.",
  },
  {
    n: "02", title: "Scaffold a project",
    code: "openingest init my-pipeline\ncd my-pipeline",
    note: "Creates configs/, data/raw/, .env, and docker-compose.yml.",
  },
  {
    n: "03", title: "Set your database URL",
    code: "# .env\nDATABASE_URL=postgresql://user:password@localhost:5432/openingest",
    note: null,
  },
  {
    n: "04", title: "Start PostgreSQL",
    code: "docker compose up -d",
    note: "PostgreSQL on 5432. Airflow UI at localhost:8080 — admin / admin.",
  },
  {
    n: "05", title: "Infer config and run",
    code: "openingest infer data/raw/customers.csv\nopeningest run",
    note: "Discovers files, validates schemas, loads PostgreSQL — done.",
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="absolute top-3 right-3 flex items-center gap-1 text-[10.5px] text-[#334155] hover:text-white transition-colors opacity-0 group-hover:opacity-100"
    >
      {copied ? <><Check size={11} className="text-emerald-400" /> copied</> : <><Copy size={11} /> copy</>}
    </button>
  );
}

export default function InstallChapter() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id="install" ref={ref} className="relative py-32 overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute inset-0 bg-[#030507]" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[500px] orb orb-indigo opacity-20" />
        </div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        <div className="chapter-num absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.025]">07</div>
      </motion.div>

      <div className="wrap relative z-10">
        <FadeUp>
          <div className="chapter-label mb-10 flex items-center gap-3">
            <span className="w-8 h-px bg-cyan-500/40" />
            <span>Chapter 07</span>
            <span className="text-[#1E293B]">/</span>
            <span className="text-[#334155]">Get Started</span>
          </div>
        </FadeUp>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* left */}
          <div>
            <FadeUp delay={0.05}>
              <h2 className="f-head font-bold leading-[1.06] tracking-[-0.03em] text-[clamp(28px,4vw,52px)] text-white mb-4">
                Up and running<br/>
                <span className="g-text">in 5 steps.</span>
              </h2>
              <p className="text-[#475569] text-[14px] leading-relaxed mb-12">
                From zero to 174,777 rows loaded in under 10 minutes.
              </p>
            </FadeUp>

            {/* steps */}
            <div className="space-y-0">
              {STEPS.map((step, i) => (
                <FadeUp key={step.n} delay={0.1 + i * 0.08}>
                  <div className="flex gap-5">
                    {/* spine */}
                    <div className="flex flex-col items-center w-10 shrink-0">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/8 border border-indigo-500/20 flex items-center justify-center">
                        <span className="f-head text-[11px] font-bold text-indigo-400">{step.n}</span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className="w-px flex-1 bg-gradient-to-b from-indigo-500/20 to-transparent min-h-[24px] my-2" />
                      )}
                    </div>

                    {/* content */}
                    <div className={`flex-1 ${i < STEPS.length - 1 ? "pb-8" : ""}`}>
                      <h3 className="f-head font-semibold text-white text-[14px] mb-3">{step.title}</h3>
                      <div className="relative group glass-glow rounded-xl px-5 py-3.5 f-mono text-[11.5px] leading-[1.85] overflow-x-auto">
                        {step.code.split("\n").map((l, li) => (
                          <div key={li} style={{
                            color: l.startsWith("#") ? "#334155"
                              : l.startsWith("openingest") ? "#A5B4FC"
                              : l.startsWith("DATABASE_URL") ? "#34D399"
                              : "#10B981"
                          }}>
                            {l}
                          </div>
                        ))}
                        <CopyButton text={step.code} />
                      </div>
                      {step.note && (
                        <p className="text-[11.5px] text-[#334155] mt-2 leading-relaxed">{step.note}</p>
                      )}
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>

          {/* right: expected output + CTA */}
          <div className="lg:sticky lg:top-24 flex flex-col gap-5">
            <FadeUp delay={0.2}>
              <div className="terminal">
                <div className="terminal-bar">
                  <div className="flex gap-1.5">
                    <div className="t-dot bg-[#FF5F57]" />
                    <div className="t-dot bg-[#FFBD2E]" />
                    <div className="t-dot bg-[#27C93F]" />
                  </div>
                  <div className="flex items-center gap-2 bg-white/4 rounded-lg px-3 py-1 ml-auto">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-[#475569] f-mono">expected output</span>
                  </div>
                </div>
                <div className="px-5 py-5 f-mono text-[11.5px] leading-[1.9]">
                  <div className="text-[#A5B4FC]">$ openingest run</div>
                  <div className="text-[#334155]">&nbsp;</div>
                  <div className="text-[#475569]">Run ID : OI-20260703-3BB09C</div>
                  <div className="text-[#334155]">&nbsp;</div>
                  {[
                    ["customers",   "stg_customers",   "replace",     "100.00%"],
                    ["orders",      "stg_orders",       "incremental", "98.50%"],
                    ["products",    "stg_products",     "replace",     "100.00%"],
                    ["events",      "stg_events",       "incremental", "99.20%"],
                  ].map(([n, t, s, q]) => (
                    <div key={n} className="flex gap-2">
                      <span className="text-[#10B981]">✓</span>
                      <span className="text-[#475569] w-12 shrink-0">{n}</span>
                      <span className="text-[#334155] w-20 shrink-0">{t}</span>
                      <span className="text-[#1E293B] w-14 shrink-0">{s}</span>
                      <span className="text-[#22D3EE]">{q}</span>
                    </div>
                  ))}
                  <div className="text-[#334155]">&nbsp;</div>
                  <div><span className="text-[#475569]">Rows     : </span><span className="text-[#A5B4FC]">174,777</span></div>
                  <div><span className="text-[#475569]">Duration : </span><span className="text-[#A5B4FC]">4.21 sec</span></div>
                  <div><span className="text-[#475569]">Status   : </span><span className="text-[#10B981] font-bold">SUCCESS ✓</span></div>
                </div>
              </div>
            </FadeUp>

            {/* CTA card */}
            <FadeUp delay={0.3}>
              <div className="glass-glow rounded-2xl p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

                <div className="inline-flex items-center gap-2 tag text-indigo-400 border-indigo-500/20 bg-indigo-500/6 mb-5 text-[10.5px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Open Source · MIT · No vendor lock-in
                </div>

                <h3 className="f-head font-bold text-white text-[22px] tracking-tight mb-2">
                  Ship your first pipeline<br/>
                  <span className="g-text">in minutes.</span>
                </h3>
                <p className="text-[#475569] text-[13px] mb-6 leading-relaxed">
                  No cloud account. No API key. No credit card.
                </p>

                <div className="flex justify-center mb-5">
                  <div className="glass-glow rounded-xl px-5 py-3 flex items-center gap-3">
                    <span className="text-[#334155] f-mono text-[13px]">$</span>
                    <code className="text-[#A5B4FC] f-mono text-[13px]">pip install openingest</code>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="https://github.com/manishkudtarkar/OpenIngest/blob/main/docs/GETTING_STARTED.md"
                    target="_blank" rel="noopener noreferrer"
                    className="relative flex items-center justify-center gap-2 font-semibold text-white text-[13px] px-6 py-3 rounded-xl overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 group-hover:from-indigo-500 group-hover:to-violet-500 transition-all" />
                    <span className="relative">Read the docs</span>
                    <ArrowRight size={14} className="relative group-hover:translate-x-0.5 transition-transform" />
                  </a>
                  <a
                    href="https://github.com/manishkudtarkar/OpenIngest"
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 font-semibold text-[#94A3B8] hover:text-white text-[13px] px-6 py-3 rounded-xl border border-white/8 hover:border-white/15 bg-white/3 hover:bg-white/5 transition-all"
                  >
                    <GithubIcon size={15} />
                    Star on GitHub
                  </a>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
