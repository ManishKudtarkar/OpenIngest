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

const CONNECTORS = [
  { name: "CSV",            version: "v1.0", install: "built-in",                      color: "#6366F1", snip: 'type: csv\nfile: customers.csv' },
  { name: "JSON / NDJSON",  version: "v1.0", install: "built-in",                      color: "#8B5CF6", snip: 'type: json\nfile: orders.json\nrecord_path: data' },
  { name: "FTP",            version: "v1.0", install: "built-in",                      color: "#64748B", snip: 'type: ftp\nhost: ${FTP_HOST}\nremote_path: /exports/file.csv' },
  { name: "Excel",          version: "v2.0", install: "openingest[excel]",             color: "#22C55E", snip: 'type: excel\nfile: budget.xlsx\nsheet: Q1' },
  { name: "Parquet",        version: "v2.0", install: "openingest[parquet]",           color: "#A855F7", snip: 'type: parquet\nfile: events.parquet\ncolumns: [id, ts]' },
  { name: "Amazon S3",      version: "v2.0", install: "openingest[s3]",               color: "#FF9900", snip: 'type: s3\nbucket: my-bucket\nkey: orders/2026.parquet' },
  { name: "Azure Blob",     version: "v2.0", install: "openingest[azure]",            color: "#0078D4", snip: 'type: azure\ncontainer: data\nblob: orders.parquet' },
  { name: "Google Cloud",   version: "v2.0", install: "openingest[gcs]",              color: "#4285F4", snip: 'type: gcs\nbucket: data\nobject: events.csv' },
  { name: "REST API",       version: "v2.0", install: "openingest[api]",              color: "#8B5CF6", snip: 'type: rest\nurl: https://api.company.com/orders\nrecord_path: data' },
  { name: "PostgreSQL",     version: "v3.0", install: "openingest[postgresql]",       color: "#336791", snip: 'type: postgresql\nhost: ${PG_HOST}\nquery: "SELECT * FROM orders"' },
  { name: "MySQL",          version: "v3.0", install: "openingest[mysql]",            color: "#F29111", snip: 'type: mysql\nhost: ${MYSQL_HOST}\ntable: users' },
  { name: "MongoDB",        version: "v3.0", install: "openingest[mongodb]",          color: "#13AA52", snip: 'type: mongodb\nuri: ${MONGO_URI}\ncollection: events' },
  { name: "SFTP",           version: "v3.0", install: "openingest[sftp]",             color: "#94A3B8", snip: 'type: sftp\nhost: ${SFTP_HOST}\nremote_path: /exports/daily.csv' },
  { name: "Salesforce",     version: "v3.0", install: "openingest[salesforce]",       color: "#00A1E0", snip: 'type: salesforce\nobject: Opportunity\nfields: [Id, Name, Amount]' },
  { name: "HubSpot",        version: "v3.0", install: "openingest[hubspot]",          color: "#FF7A59", snip: 'type: hubspot\nobject: contacts\nproperties: [email, createdate]' },
  { name: "Stripe",         version: "v3.0", install: "openingest[stripe]",           color: "#635BFF", snip: 'type: stripe\nresource: charges\ncreated_after: "2024-01-01"' },
  { name: "Google Sheets",  version: "v3.0", install: "openingest[google_sheets]",   color: "#0F9D58", snip: 'type: google_sheets\nspreadsheet_id: 1BxiM...\nsheet_name: Q1' },
];

export default function ConnectorsChapter() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const cur = CONNECTORS[active];

  return (
    <section id="connectors" ref={ref} className="relative overflow-hidden" style={{ paddingTop: "clamp(5rem,9vw,8rem)", paddingBottom: "clamp(5rem,9vw,8rem)", background: "#02030a" }}>
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute inset-0 grid-bg" style={{ opacity: 0.28 }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.18),transparent)" }} />
        <div style={{ position: "absolute", top: "50%", right: 0, width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.08),transparent 70%)", filter: "blur(100px)", transform: "translateY(-50%)", pointerEvents: "none" }} />
      </motion.div>

      <div className="site-pad relative z-10">
        <FadeUp>
          <span className="eyebrow" style={{ marginBottom: "2rem", display: "inline-flex" }}>Chapter 03 / Connectors</span>
        </FadeUp>

        <FadeUp delay={0.05}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "clamp(2.5rem,4vw,4rem)", flexWrap: "wrap", gap: "1rem" }}>
            <h2 className="f-head" style={{ fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.04em", fontSize: "clamp(2.4rem,5.5vw,4.2rem)" }}>
              <span style={{ color: "#F1F5F9" }}>Any source.</span>
              <br />
              <span className="g-violet">One config block.</span>
            </h2>
            <span className="tag" style={{ color: "#818CF8", borderColor: "rgba(99,102,241,0.22)", background: "rgba(99,102,241,0.08)", fontSize: 11, flexShrink: 0 }}>
              17 connectors · v3.0
            </span>
          </div>
        </FadeUp>

        <div className="grid lg:grid-cols-[340px_1fr] gap-6">
          {/* picker list */}
          <FadeUp delay={0.1}>
            <div className="flex flex-col gap-1 max-h-[520px] overflow-y-auto pr-2"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#1e293b transparent" }}>
              {CONNECTORS.map((c, i) => (
                <motion.button
                  key={c.name}
                  onClick={() => setActive(i)}
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.15 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all
                    ${active === i
                      ? "border-white/10 bg-white/4"
                      : "border-transparent hover:border-white/5 hover:bg-white/2"}`}
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: active === i ? c.color : "#334155" }}
                  />
                  <span className={`text-[13px] font-medium f-head flex-1 transition-colors ${active === i ? "text-white" : "text-[#475569]"}`}>
                    {c.name}
                  </span>
                  <span
                    className="tag text-[9.5px] shrink-0"
                    style={active === i
                      ? { color: c.color, borderColor: c.color + "25", background: c.color + "10" }
                      : { color: "#334155", borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}
                  >
                    {c.version}
                  </span>
                </motion.button>
              ))}
            </div>
          </FadeUp>

          {/* detail panel */}
          <FadeUp delay={0.2}>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="glass-glow rounded-2xl overflow-hidden"
            >
              {/* accent line */}
              <div className="h-px" style={{ background: `linear-gradient(to right, transparent, ${cur.color}60, transparent)` }} />

              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="f-head font-bold text-white text-[18px]">{cur.name}</h3>
                      <span className="tag text-[10px]" style={{ color: cur.color, borderColor: cur.color + "25", background: cur.color + "10" }}>
                        {cur.version}
                      </span>
                    </div>
                    <div className="text-[12px] text-[#334155] f-mono">{cur.install}</div>
                  </div>
                  {cur.install !== "built-in" && (
                    <div className="glass rounded-lg px-3 py-1.5">
                      <code className="text-[11px] text-[#A5B4FC] f-mono">pip install {cur.install}</code>
                    </div>
                  )}
                </div>

                {/* yaml config block */}
                <div className="rounded-xl border border-white/6 overflow-hidden bg-[#010306]">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/[0.015]">
                    <span className="text-[10.5px] text-[#334155] f-mono">configs/datasets.yaml</span>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: cur.color }} />
                  </div>
                  <div className="px-5 py-4 f-mono text-[12px] leading-[1.9]">
                    <div className="text-[#6366F1] font-bold mb-0.5">my_dataset:</div>
                    <div className="text-[#334155] mb-1.5 ml-2">source:</div>
                    {cur.snip.split("\n").map((line, i) => {
                      const [k, ...rest] = line.split(": ");
                      const v = rest.join(": ");
                      return (
                        <div key={i} className="ml-4">
                          <span className="text-[#94A3B8]">{k}: </span>
                          <span className="text-[#34D399]">{v}</span>
                        </div>
                      );
                    })}
                    <div className="text-[#334155] mt-2 ml-2">staging_table: <span className="text-[#34D399]">stg_{cur.name.toLowerCase().replace(/\s+/g,"_").replace(/\//g,"_")}</span></div>
                    <div className="text-[#334155] ml-2">load_strategy: <span className="text-[#FBBF24]">replace</span></div>
                  </div>
                </div>

                {/* plugin note */}
                <div className="mt-4 glass rounded-xl px-4 py-3">
                  <div className="text-[11px] text-[#334155] mb-1.5 uppercase tracking-wider font-semibold">Plugin architecture</div>
                  <code className="text-[11px] text-[#A5B4FC] f-mono leading-relaxed">
                    ConnectorRegistry.register(&quot;my_db&quot;, MyConnector)
                  </code>
                </div>
              </div>
            </motion.div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
