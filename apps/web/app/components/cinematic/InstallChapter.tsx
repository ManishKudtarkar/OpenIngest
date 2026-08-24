"use client";
import { useState, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Copy, Check, ArrowRight } from "lucide-react";
import GithubIcon from "../GithubIcon";

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Install",
    code: "pip install openingest",
    note: "Registers the openingest CLI. Windows: add Python Scripts to PATH if needed.",
  },
  {
    n: "02",
    title: "Scaffold a project",
    code: "openingest init my-pipeline\ncd my-pipeline",
    note: "Creates configs/, data/raw/, .env, and docker-compose.yml for you.",
  },
  {
    n: "03",
    title: "Configure database",
    code: "# .env\nDATABASE_URL=postgresql://user:password@localhost:5432/openingest",
    note: null,
  },
  {
    n: "04",
    title: "Start PostgreSQL",
    code: "docker compose up -d",
    note: "PostgreSQL on 5432. Airflow UI at localhost:8080 — login: admin / admin.",
  },
  {
    n: "05",
    title: "Infer config and run",
    code: "openingest infer data/raw/customers.csv\nopeningest run",
    note: "Discovers files, validates schemas, checks quality, loads PostgreSQL.",
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="absolute top-3 right-3 flex items-center gap-1.5 text-[10.5px] text-[#334155] hover:text-white transition-colors opacity-0 group-hover:opacity-100 bg-[#030507]/80 rounded-lg px-2 py-1"
    >
      {copied
        ? <><Check size={11} className="text-emerald-400" /> copied</>
        : <><Copy size={11} /> copy</>}
    </button>
  );
}

export default function InstallChapter() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section
      id="install"
      ref={ref}
      className="relative overflow-hidden"
      style={{ paddingTop: "clamp(6rem,10vw,10rem)", paddingBottom: "clamp(6rem,10vw,10rem)" }}
    >
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute inset-0 bg-[#030507]" />
        <div className="absolute inset-0 grid-fine opacity-[0.2]" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[900px] h-[600px] orb orb-indigo opacity-[0.15]" />
        </div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
      </motion.div>

      <div className="wrap relative z-10">

        <FadeUp>
          <div className="chapter-label mb-10 flex items-center gap-3">
            <span className="w-10 h-px bg-cyan-500/40" />
            <span>Chapter 07</span>
            <span className="text-[#1E293B] mx-1">/</span>
            <span className="text-[#334155]">Get Started</span>
          </div>
        </FadeUp>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-16 xl:gap-24 items-start">

          {/* Left: steps */}
          <div>
            <FadeUp delay={0.05}>
              <h2
                className="f-head font-bold leading-[1.04] tracking-[-0.035em] mb-4"
                style={{ fontSize: "clamp(36px,5.5vw,60px)" }}
              >
                <span className="text-white">Up and running</span>
                <br />
                <span className="g-text">in 5 steps.</span>
              </h2>
              <p className="text-[#475569] text-[16px] leading-relaxed mb-14">
                From zero to 174,777 rows loaded in under 10 minutes.
              </p>
            </FadeUp>

            <div>
              {STEPS.map((step, i) => (
                <FadeUp key={step.n} delay={0.1 + i * 0.09}>
                  <div className="flex gap-6">
                    {/* Spine */}
                    <div className="flex flex-col items-center w-12 shrink-0">
                      <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center shrink-0">
                        <span className="f-head text-[12px] font-bold text-indigo-400">{step.n}</span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className="w-px flex-1 bg-gradient-to-b from-indigo-500/25 to-transparent min-h-[28px] my-2" />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`flex-1 min-w-0 ${i < STEPS.length - 1 ? "pb-10" : ""}`}>
                      <h3 className="f-head font-semibold text-white text-[15px] mb-3.5">{step.title}</h3>
                      <div className="relative group glass-glow rounded-xl px-5 py-4 f-mono text-[12px] leading-[1.9] overflow-x-auto">
                        {step.code.split("\n").map((l, li) => (
                          <div
                            key={li}
                            style={{
                              color: l.startsWith("#") ? "#334155"
                                : l.startsWith("openingest") ? "#A5B4FC"
                                : l.startsWith("DATABASE_URL") ? "#34D399"
                                : "#10B981",
                              whiteSpace: "pre",
                            }}
                          >
                            {l}
                          </div>
                        ))}
                        <CopyButton text={step.code} />
                      </div>
                      {step.note && (
                        <p className="text-[12px] text-[#334155] mt-2.5 leading-relaxed">{step.note}</p>
                      )}
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>

          {/* Right: terminal + CTA */}
          <div className="lg:sticky lg:top-24 flex flex-col gap-5">
            <FadeUp delay={0.2}>
              <div className="terminal">
                <div className="terminal-bar flex items-center justify-between px-5 py-3.5">
                  <div className="flex gap-2">
                    <div className="t-dot" style={{ background: "#FF5F57" }} />
                    <div className="t-dot" style={{ background: "#FFBD2E" }} />
                    <div className="t-dot" style={{ background: "#27C93F" }} />
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 ml-auto">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] text-[#475569] f-mono">expected output</span>
                  </div>
                </div>
                <div className="px-6 py-5 f-mono text-[12px] leading-[1.95]">
                  <div className="text-[#A5B4FC] mb-1">$ openingest run</div>
                  <div className="text-[#334155]">&nbsp;</div>
                  <div className="text-[#475569] mb-1">Run ID : OI-20260703-3BB09C</div>
                  <div className="text-[#334155]">&nbsp;</div>
                  {[
                    ["customers",   "stg_customers",  "replace",     "100.00%"],
                    ["orders",      "stg_orders",     "incremental", " 98.50%"],
                    ["products",    "stg_products",   "replace",     "100.00%"],
                    ["events",      "stg_events",     "incremental", " 99.20%"],
                    ["order_items", "stg_order_items","replace",     "100.00%"],
                  ].map(([n, t, , q]) => (
                    <div key={n} className="flex gap-3">
                      <span className="text-[#10B981] shrink-0">✓</span>
                      <span className="text-[#64748B] w-14 shrink-0 truncate">{n}</span>
                      <span className="text-[#334155] w-24 shrink-0 truncate">{t}</span>
                      <span className="text-[#22D3EE]">{q}</span>
                    </div>
                  ))}
                  <div className="text-[#334155] mt-2">&nbsp;</div>
                  <div className="flex gap-3"><span className="text-[#475569] w-20">Rows</span><span className="text-[#A5B4FC]">174,777</span></div>
                  <div className="flex gap-3"><span className="text-[#475569] w-20">Duration</span><span className="text-[#A5B4FC]">4.21 sec</span></div>
                  <div className="flex gap-3"><span className="text-[#475569] w-20">Status</span><span className="text-[#10B981] font-bold">SUCCESS ✓</span></div>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.32}>
              <div className="glass-glow rounded-2xl p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/35 to-transparent" />

                <div className="inline-flex items-center gap-2 tag text-indigo-400 border-indigo-500/20 bg-indigo-500/8 mb-6 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Open Source · MIT · No vendor lock-in
                </div>

                <h3 className="f-head font-bold text-white mb-2.5" style={{ fontSize: "clamp(22px,2.5vw,28px)" }}>
                  Ship your first pipeline
                  <br />
                  <span className="g-text">in minutes.</span>
                </h3>
                <p className="text-[#475569] text-[14px] mb-7 leading-relaxed">
                  No cloud account. No API key. No credit card.
                </p>

                <div className="flex justify-center mb-6">
                  <div className="glass-glow rounded-xl px-6 py-3.5 flex items-center gap-3">
                    <span className="text-[#334155] f-mono text-[13px]">$</span>
                    <code className="text-[#A5B4FC] f-mono text-[13px] select-all">pip install openingest</code>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="https://github.com/manishkudtarkar/OpenIngest/blob/main/docs/GETTING_STARTED.md"
                    target="_blank" rel="noopener noreferrer"
                    className="relative flex items-center justify-center gap-2.5 font-semibold text-white text-[13.5px] px-7 py-3.5 rounded-xl overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 group-hover:from-indigo-500 group-hover:to-violet-500 transition-all" />
                    <span className="relative">Read the docs</span>
                    <ArrowRight size={14} className="relative group-hover:translate-x-0.5 transition-transform" />
                  </a>
                  <a
                    href="https://github.com/manishkudtarkar/OpenIngest"
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 font-semibold text-[#94A3B8] hover:text-white text-[13.5px] px-7 py-3.5 rounded-xl border border-white/8 hover:border-white/18 bg-white/3 hover:bg-white/6 transition-all"
                  >
                    <GithubIcon size={16} />
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
