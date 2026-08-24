"use client";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
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
  { n: "01", title: "Install",             code: "pip install openingest",                                                      note: "Registers the openingest CLI. Windows: add Python Scripts to PATH." },
  { n: "02", title: "Scaffold a project",  code: "openingest init my-pipeline\ncd my-pipeline",                                 note: "Creates configs/, data/raw/, .env, and docker-compose.yml." },
  { n: "03", title: "Configure database",  code: "# .env\nDATABASE_URL=postgresql://user:password@localhost:5432/openingest",   note: null },
  { n: "04", title: "Start PostgreSQL",    code: "docker compose up -d",                                                         note: "PostgreSQL on 5432. Airflow at localhost:8080 — admin / admin." },
  { n: "05", title: "Infer config & run",  code: "openingest infer data/raw/customers.csv\nopeningest run",                     note: "Discovers files, validates schemas, checks quality, loads PostgreSQL." },
];

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); }}
      style={{
        position: "absolute", top: 10, right: 10,
        display: "flex", alignItems: "center", gap: 4,
        fontSize: 10.5, color: "#334155",
        background: "rgba(2,3,10,0.85)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 8, padding: "4px 10px",
        cursor: "pointer",
        opacity: 0, transition: "opacity .2s",
      }}
      className="copy-btn"
    >
      {done ? <><Check size={10} color="#10B981" /> copied</> : <><Copy size={10} /> copy</>}
    </button>
  );
}

export default function InstallChapter() {
  return (
    <section
      id="install"
      style={{ background: "#02030a", position: "relative", overflow: "hidden", paddingTop: "clamp(5rem,9vw,8rem)", paddingBottom: "clamp(5rem,9vw,8rem)" }}
    >
      <div className="absolute inset-0 grid-bg" style={{ opacity: 0.22 }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.20),transparent)" }} />
      {/* central glow */}
      <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.10),transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />

      <style>{`.copy-btn-wrap:hover .copy-btn { opacity: 1 !important; }`}</style>

      <div className="site-pad relative z-10">
        <FadeUp>
          <span className="eyebrow" style={{ marginBottom: "2rem", display: "inline-flex" }}>Chapter 07 / Get Started</span>
        </FadeUp>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(2.5rem,5vw,5rem)", alignItems: "start" }}>
          {/* Left */}
          <div>
            <FadeUp delay={0.06}>
              <h2 className="f-head" style={{ fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.04em", fontSize: "clamp(2.4rem,5.5vw,4.2rem)", marginBottom: "1rem" }}>
                <span style={{ color: "#F1F5F9" }}>Up and running</span>
                <br />
                <span className="g-cyan">in 5 steps.</span>
              </h2>
              <p style={{ color: "#475569", fontSize: 16, lineHeight: 1.75, marginBottom: "clamp(2.5rem,4vw,3.5rem)" }}>
                From zero to 174,777 rows loaded in under 10 minutes.
              </p>
            </FadeUp>

            <div>
              {STEPS.map((step, i) => (
                <FadeUp key={step.n} delay={0.1 + i * 0.09}>
                  <div style={{ display: "flex", gap: "1.5rem" }}>
                    {/* spine */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 44, flexShrink: 0 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: "50%",
                        background: "rgba(99,102,241,0.10)",
                        border: "1px solid rgba(99,102,241,0.25)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <span className="f-head" style={{ fontSize: 12, fontWeight: 700, color: "#818CF8" }}>{step.n}</span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div style={{ width: 1, flex: 1, background: "linear-gradient(to bottom, rgba(99,102,241,0.22), transparent)", minHeight: 24, margin: "0.5rem 0" }} />
                      )}
                    </div>

                    {/* content */}
                    <div style={{ flex: 1, paddingBottom: i < STEPS.length - 1 ? "2.5rem" : 0 }}>
                      <div className="f-head" style={{ fontSize: 15, fontWeight: 600, color: "#F1F5F9", marginBottom: "0.875rem" }}>{step.title}</div>
                      <div
                        className="copy-btn-wrap"
                        style={{
                          position: "relative",
                          background: "rgba(6,8,16,0.80)",
                          border: "1px solid rgba(99,102,241,0.20)",
                          borderRadius: "0.875rem",
                          padding: "1rem 1.25rem",
                          boxShadow: "0 0 40px rgba(99,102,241,0.06)",
                        }}
                      >
                        {step.code.split("\n").map((l, li) => (
                          <div key={li} className="f-mono" style={{
                            fontSize: 12.5, lineHeight: 1.85, whiteSpace: "pre",
                            color: l.startsWith("#") ? "#334155"
                              : l.startsWith("openingest") ? "#818CF8"
                              : l.startsWith("DATABASE_URL") ? "#34D399"
                              : "#10B981",
                          }}>{l}</div>
                        ))}
                        <CopyBtn text={step.code} />
                      </div>
                      {step.note && (
                        <p style={{ fontSize: 12, color: "#334155", marginTop: "0.6rem", lineHeight: 1.65 }}>{step.note}</p>
                      )}
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>

          {/* Right */}
          <div style={{ position: "sticky", top: "5.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <FadeUp delay={0.2}>
              <div className="terminal">
                <div className="term-bar" style={{ justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: 7 }}>
                    <div className="t-dot" style={{ background: "#FF5F57" }} />
                    <div className="t-dot" style={{ background: "#FFBD2E" }} />
                    <div className="t-dot" style={{ background: "#27C93F" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "4px 12px" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block" }} className="pulse-ring" />
                    <span className="f-mono" style={{ fontSize: 10.5, color: "#475569" }}>expected output</span>
                  </div>
                </div>
                <div className="f-mono" style={{ padding: "1.25rem 1.5rem", fontSize: 12, lineHeight: 1.95 }}>
                  <div style={{ color: "#818CF8", marginBottom: 4 }}>$ openingest run</div>
                  <div style={{ color: "#1E293B" }}>&nbsp;</div>
                  <div style={{ color: "#475569" }}>Run ID : OI-20260703-3BB09C</div>
                  <div style={{ color: "#1E293B" }}>&nbsp;</div>
                  {[
                    ["customers",   "stg_customers",   "replace",     "100.00%"],
                    ["orders",      "stg_orders",      "incremental", " 98.50%"],
                    ["products",    "stg_products",    "replace",     "100.00%"],
                    ["events",      "stg_events",      "incremental", " 99.20%"],
                    ["order_items", "stg_order_items", "replace",     "100.00%"],
                  ].map(([n, t, , q]) => (
                    <div key={n} style={{ display: "flex", gap: 10 }}>
                      <span style={{ color: "#10B981", flexShrink: 0 }}>✓</span>
                      <span style={{ color: "#64748B", width: 72, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n}</span>
                      <span style={{ color: "#334155", width: 100, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t}</span>
                      <span style={{ color: "#22D3EE" }}>{q}</span>
                    </div>
                  ))}
                  <div style={{ color: "#1E293B" }}>&nbsp;</div>
                  <div><span style={{ color: "#475569" }}>Rows     : </span><span style={{ color: "#818CF8" }}>174,777</span></div>
                  <div><span style={{ color: "#475569" }}>Duration : </span><span style={{ color: "#818CF8" }}>4.21 sec</span></div>
                  <div><span style={{ color: "#475569" }}>Status   : </span><span style={{ color: "#10B981", fontWeight: 700 }}>SUCCESS ✓</span></div>
                </div>
              </div>
            </FadeUp>

            {/* CTA */}
            <FadeUp delay={0.32}>
              <div style={{
                background: "rgba(6,8,16,0.80)",
                border: "1px solid rgba(99,102,241,0.22)",
                borderRadius: "1.25rem",
                padding: "2.5rem",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 0 80px rgba(99,102,241,0.07)",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.40),transparent)" }} />

                <span className="tag" style={{ color: "#818CF8", borderColor: "rgba(99,102,241,0.22)", background: "rgba(99,102,241,0.08)", marginBottom: "1.5rem", display: "inline-flex", fontSize: 11 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block", flexShrink: 0 }} className="pulse-ring" />
                  Open Source · MIT · No vendor lock-in
                </span>

                <h3 className="f-head" style={{ fontSize: "clamp(1.6rem,2.5vw,2rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "#F1F5F9", marginBottom: "0.75rem" }}>
                  Ship your first pipeline
                  <br />
                  <span className="g-indigo-cyan">in minutes.</span>
                </h3>

                <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.7, marginBottom: "1.75rem" }}>
                  No cloud account. No API key. No credit card.
                </p>

                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "0.75rem",
                  background: "rgba(2,3,10,0.80)",
                  border: "1px solid rgba(99,102,241,0.22)",
                  borderRadius: "0.875rem",
                  padding: "0.875rem 1.5rem",
                  marginBottom: "1.75rem",
                }}>
                  <span className="f-mono" style={{ fontSize: 12.5, color: "#334155" }}>$</span>
                  <code className="f-mono" style={{ fontSize: 13, color: "#818CF8" }}>pip install openingest</code>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <a
                    href="https://github.com/manishkudtarkar/OpenIngest/blob/main/docs/GETTING_STARTED.md"
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                      padding: "0.875rem 1.5rem", borderRadius: "0.875rem",
                      background: "linear-gradient(135deg,#4F46E5,#7C3AED)",
                      color: "#fff", fontWeight: 700, fontSize: 14,
                      textDecoration: "none",
                      transition: "filter .2s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = "brightness(1.12)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = ""; }}
                  >
                    Read the docs <ArrowRight size={14} />
                  </a>
                  <a
                    href="https://github.com/manishkudtarkar/OpenIngest"
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                      padding: "0.875rem 1.5rem", borderRadius: "0.875rem",
                      border: "1px solid rgba(255,255,255,0.09)",
                      background: "rgba(255,255,255,0.04)",
                      color: "#94A3B8", fontWeight: 700, fontSize: 14,
                      textDecoration: "none",
                      transition: "color .2s, background .2s",
                    }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#fff"; el.style.background = "rgba(255,255,255,0.08)"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#94A3B8"; el.style.background = "rgba(255,255,255,0.04)"; }}
                  >
                    <GithubIcon size={16} /> Star on GitHub
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
