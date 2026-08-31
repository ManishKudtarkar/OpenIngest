"use client";
import { useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Copy, Check, ExternalLink, Zap } from "lucide-react";

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

/* ── Connector data ── */
type Connector = {
  id: string;
  name: string;
  version: "v1.0" | "v2.0" | "v3.0";
  install: string;
  color: string;
  category: string;
  desc: string;
  snip: { key: string; val: string; highlight?: boolean }[];
};

const CONNECTORS: Connector[] = [
  {
    id: "csv", name: "CSV", version: "v1.0", install: "built-in", color: "#6366F1", category: "File Formats",
    desc: "Default format. Reads comma-separated files from data/raw/ or any local path. Encoding and separator are configurable.",
    snip: [{ key: "type", val: "csv", highlight: true }, { key: "file", val: "customers.csv" }, { key: "encoding", val: "utf-8" }],
  },
  {
    id: "json", name: "JSON / NDJSON", version: "v1.0", install: "built-in", color: "#8B5CF6", category: "File Formats",
    desc: "Flat JSON arrays, nested record_path navigation, and newline-delimited NDJSON. No extra install needed.",
    snip: [{ key: "type", val: "json", highlight: true }, { key: "file", val: "orders.json" }, { key: "record_path", val: "data" }],
  },
  {
    id: "ftp", name: "FTP", version: "v1.0", install: "built-in", color: "#64748B", category: "File Formats",
    desc: "Download CSV, JSON, Parquet, or Excel from FTP servers. Format auto-detected from file extension.",
    snip: [{ key: "type", val: "ftp", highlight: true }, { key: "host", val: "${FTP_HOST}" }, { key: "remote_path", val: "/exports/file.csv" }],
  },
  {
    id: "excel", name: "Excel (.xlsx)", version: "v2.0", install: "openingest[excel]", color: "#22C55E", category: "File Formats",
    desc: "Read .xlsx workbooks directly. Multi-sheet support, header offset, skip rows, column projection and dtype overrides.",
    snip: [{ key: "type", val: "excel", highlight: true }, { key: "file", val: "budget.xlsx" }, { key: "sheet", val: "Q1" }],
  },
  {
    id: "parquet", name: "Parquet", version: "v2.0", install: "openingest[parquet]", color: "#A855F7", category: "File Formats",
    desc: "Columnar format with projection pushdown via columns: and predicate filters. Requires pyarrow.",
    snip: [{ key: "type", val: "parquet", highlight: true }, { key: "file", val: "events.parquet" }, { key: "columns", val: "[id, ts, type]" }],
  },
  {
    id: "s3", name: "Amazon S3", version: "v2.0", install: "openingest[s3]", color: "#FF9900", category: "Cloud Storage",
    desc: "Reads CSV, Parquet, JSON, or Excel from S3. IAM role, env variable, or explicit credential auth. Format auto-detected.",
    snip: [{ key: "type", val: "s3", highlight: true }, { key: "bucket", val: "company-data" }, { key: "key", val: "orders/2026.parquet" }, { key: "region", val: "us-east-1" }],
  },
  {
    id: "azure", name: "Azure Blob", version: "v2.0", install: "openingest[azure]", color: "#0078D4", category: "Cloud Storage",
    desc: "Azure Blob Storage via connection string or SAS token. Auto-detects format from blob name extension.",
    snip: [{ key: "type", val: "azure", highlight: true }, { key: "container", val: "company-data" }, { key: "blob", val: "orders.parquet" }],
  },
  {
    id: "gcs", name: "Google Cloud Storage", version: "v2.0", install: "openingest[gcs]", color: "#4285F4", category: "Cloud Storage",
    desc: "GCS via Application Default Credentials or explicit service account JSON. Supports all major file formats.",
    snip: [{ key: "type", val: "gcs", highlight: true }, { key: "bucket", val: "company-data" }, { key: "object", val: "events.csv" }, { key: "project", val: "my-gcp" }],
  },
  {
    id: "rest", name: "REST API", version: "v2.0", install: "openingest[api]", color: "#8B5CF6", category: "REST / HTTP",
    desc: "GET or POST any JSON endpoint. Bearer token, custom headers, ${ENV} expansion, offset and cursor pagination, retry with backoff.",
    snip: [{ key: "type", val: "rest", highlight: true }, { key: "url", val: "https://api.company.com/orders" }, { key: "record_path", val: "data" }],
  },
  {
    id: "postgresql", name: "PostgreSQL", version: "v3.0", install: "openingest[postgresql]", color: "#336791", category: "Databases",
    desc: "Read from any PostgreSQL database via SQL query or table name. Supports chunked reads, ${ENV} credentials, and watermark loads.",
    snip: [{ key: "type", val: "postgresql", highlight: true }, { key: "host", val: "${PG_HOST}" }, { key: "query", val: '"SELECT * FROM orders"' }],
  },
  {
    id: "mysql", name: "MySQL", version: "v3.0", install: "openingest[mysql]", color: "#F29111", category: "Databases",
    desc: "Read from MySQL via SQL query or table name. PyMySQL under the hood. Chunked reads and ${ENV} credentials.",
    snip: [{ key: "type", val: "mysql", highlight: true }, { key: "host", val: "${MYSQL_HOST}" }, { key: "table", val: "users" }],
  },
  {
    id: "mongodb", name: "MongoDB", version: "v3.0", install: "openingest[mongodb]", color: "#13AA52", category: "Databases",
    desc: "Read MongoDB collections as flat DataFrames. Filter documents, field projection, document limit, and _id suppression.",
    snip: [{ key: "type", val: "mongodb", highlight: true }, { key: "uri", val: "${MONGO_URI}" }, { key: "collection", val: "events" }],
  },
  {
    id: "sftp", name: "SFTP", version: "v3.0", install: "openingest[sftp]", color: "#94A3B8", category: "File Transfer",
    desc: "Download files from SFTP servers. Password or private key auth. Format auto-detected from remote file extension.",
    snip: [{ key: "type", val: "sftp", highlight: true }, { key: "host", val: "${SFTP_HOST}" }, { key: "remote_path", val: "/exports/daily.csv" }],
  },
  {
    id: "salesforce", name: "Salesforce", version: "v3.0", install: "openingest[salesforce]", color: "#00A1E0", category: "SaaS",
    desc: "Read Salesforce objects via SOQL. Username-password OAuth2 flow. Supports object, field selection, WHERE clause, or raw SOQL.",
    snip: [{ key: "type", val: "salesforce", highlight: true }, { key: "object", val: "Opportunity" }, { key: "fields", val: "[Id, Name, Amount]" }],
  },
  {
    id: "hubspot", name: "HubSpot", version: "v3.0", install: "openingest[hubspot]", color: "#FF7A59", category: "SaaS",
    desc: "Read HubSpot CRM objects: contacts, companies, deals, tickets. Cursor-based pagination. Private app access token auth.",
    snip: [{ key: "type", val: "hubspot", highlight: true }, { key: "object", val: "contacts" }, { key: "properties", val: "[email, createdate]" }],
  },
  {
    id: "stripe", name: "Stripe", version: "v3.0", install: "openingest[stripe]", color: "#635BFF", category: "SaaS",
    desc: "Read Stripe resource lists: charges, customers, invoices, subscriptions. Cursor pagination, created_after filter.",
    snip: [{ key: "type", val: "stripe", highlight: true }, { key: "resource", val: "charges" }, { key: "created_after", val: '"2024-01-01"' }],
  },
  {
    id: "google_sheets", name: "Google Sheets", version: "v3.0", install: "openingest[google_sheets]", color: "#0F9D58", category: "SaaS",
    desc: "Read Google Sheets via Sheets API v4. Service account JSON auth. Sheet name, cell range, and auto-detects headers.",
    snip: [{ key: "type", val: "google_sheets", highlight: true }, { key: "spreadsheet_id", val: "1BxiM..." }, { key: "sheet_name", val: "Q1_Budget" }],
  },
];

const VERSION_COLOR: Record<string, { text: string; bg: string; border: string }> = {
  "v1.0": { text: "#10B981", bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.22)" },
  "v2.0": { text: "#6366F1", bg: "rgba(99,102,241,0.10)", border: "rgba(99,102,241,0.22)" },
  "v3.0": { text: "#22D3EE", bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.20)" },
};

const CATEGORIES = ["File Formats", "Cloud Storage", "REST / HTTP", "Databases", "File Transfer", "SaaS"];

/* ── Copy button ── */
function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  if (!text || text === "built-in") return null;
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(`pip install ${text}`); setDone(true); setTimeout(() => setDone(false), 2000); }}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "5px 12px",
        borderRadius: 8,
        border: `1px solid ${done ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.08)"}`,
        background: done ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.04)",
        color: done ? "#10B981" : "#64748B",
        fontSize: 11.5,
        fontFamily: "JetBrains Mono, monospace",
        cursor: "pointer",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={e => { if (!done) { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.14)"; (e.currentTarget as HTMLElement).style.color = "#CBD5E1"; }}}
      onMouseLeave={e => { if (!done) { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "#64748B"; }}}
    >
      {done ? <><Check size={11} /> copied!</> : <><Copy size={11} /> pip install {text}</>}
    </button>
  );
}

export default function ConnectorsChapter() {
  const [activeId, setActiveId] = useState("csv");
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  const active = CONNECTORS.find(c => c.id === activeId)!;
  const vc = VERSION_COLOR[active.version];

  return (
    <section id="connectors" ref={ref}
      style={{ position: "relative", overflow: "hidden", background: "#02030a", paddingTop: "clamp(5rem,9vw,8rem)", paddingBottom: "clamp(5rem,9vw,8rem)" }}>

      {/* bg */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: bgY }}>
        <div className="absolute inset-0 grid-bg" style={{ opacity: 0.25 }} />
        <div style={{ position: "absolute", top: "50%", right: 0, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.07),transparent 70%)", filter: "blur(100px)", transform: "translateY(-50%)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.22),transparent)" }} />
      </motion.div>

      <div className="site-pad relative z-10">

        {/* Header */}
        <FadeUp>
          <span className="eyebrow" style={{ marginBottom: "2rem", display: "inline-flex" }}>Chapter 03 / Connectors</span>
        </FadeUp>
        <FadeUp delay={0.06}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "clamp(2.5rem,4vw,4rem)", flexWrap: "wrap", gap: "1rem" }}>
            <h2 className="f-head" style={{ fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.04em", fontSize: "clamp(2.4rem,5.5vw,4.2rem)" }}>
              <span style={{ color: "#F1F5F9" }}>Any source.</span>
              <br />
              <span className="g-violet">One config block.</span>
            </h2>
            <span style={{
              fontSize: 11.5, fontWeight: 700, color: "#818CF8",
              padding: "6px 14px", borderRadius: 99,
              border: "1px solid rgba(99,102,241,0.22)",
              background: "rgba(99,102,241,0.08)",
              flexShrink: 0,
            }}>
              17 connectors · v3.0
            </span>
          </div>
        </FadeUp>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.5rem", alignItems: "start" }}>

          {/* ── LEFT: Picker list ── */}
          <FadeUp delay={0.1}>
            <div style={{
              background: "rgba(6,8,16,0.75)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "1.25rem",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}>
              {CATEGORIES.map(cat => {
                const items = CONNECTORS.filter(c => c.category === cat);
                return (
                  <div key={cat}>
                    {/* Category header */}
                    <div style={{
                      padding: "0.6rem 1rem 0.4rem",
                      fontSize: 9.5, fontWeight: 700,
                      color: "#1E293B",
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                      borderTop: cat !== "File Formats" ? "1px solid rgba(255,255,255,0.04)" : "none",
                      marginTop: cat !== "File Formats" ? "0.25rem" : 0,
                    }}>
                      {cat}
                    </div>
                    {/* Items */}
                    {items.map(c => {
                      const isActive = activeId === c.id;
                      const vc2 = VERSION_COLOR[c.version];
                      return (
                        <motion.button
                          key={c.id}
                          onClick={() => setActiveId(c.id)}
                          whileHover={{ x: isActive ? 0 : 3 }}
                          transition={{ duration: 0.15 }}
                          style={{
                            width: "100%", display: "flex", alignItems: "center",
                            gap: "0.75rem", padding: "0.6rem 1rem",
                            border: "none", cursor: "pointer",
                            background: isActive
                              ? `linear-gradient(90deg, ${c.color}12, ${c.color}06)`
                              : "transparent",
                            borderLeft: `2px solid ${isActive ? c.color : "transparent"}`,
                            transition: "background 0.2s, border-color 0.2s",
                            textAlign: "left",
                          }}
                        >
                          {/* Color dot */}
                          <div style={{
                            width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                            background: isActive ? c.color : "#1E293B",
                            boxShadow: isActive ? `0 0 8px ${c.color}60` : "none",
                            transition: "background 0.2s, box-shadow 0.2s",
                          }} />

                          {/* Name */}
                          <span className="f-head" style={{
                            fontSize: 12.5, flex: 1,
                            color: isActive ? "#F1F5F9" : "#475569",
                            fontWeight: isActive ? 600 : 400,
                            transition: "color 0.2s",
                          }}>
                            {c.name}
                          </span>

                          {/* Version badge */}
                          <span style={{
                            fontSize: 9.5, fontWeight: 700,
                            padding: "2px 7px", borderRadius: 99,
                            border: `1px solid ${isActive ? vc2.border : "rgba(255,255,255,0.05)"}`,
                            background: isActive ? vc2.bg : "rgba(255,255,255,0.02)",
                            color: isActive ? vc2.text : "#1E293B",
                            transition: "all 0.2s",
                            flexShrink: 0,
                          }}>
                            {c.version}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </FadeUp>

          {/* ── RIGHT: Detail panel ── */}
          <FadeUp delay={0.16}>
            <motion.div
              key={activeId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >

              {/* ── Main card ── */}
              <div style={{
                background: "rgba(6,8,16,0.82)",
                border: `1px solid ${active.color}22`,
                borderRadius: "1.25rem",
                overflow: "hidden",
                boxShadow: `0 0 80px ${active.color}10, 0 20px 60px rgba(0,0,0,0.35)`,
                position: "relative",
              }}>
                {/* Top accent gradient line */}
                <div style={{ height: 2, background: `linear-gradient(90deg, transparent 0%, ${active.color}80 30%, ${active.color}60 70%, transparent 100%)` }} />

                {/* Card header */}
                <div style={{
                  padding: "1.5rem 1.75rem",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  background: `linear-gradient(135deg, ${active.color}08 0%, transparent 60%)`,
                  display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                    {/* Icon circle */}
                    <div style={{
                      width: 48, height: 48, borderRadius: "0.875rem", flexShrink: 0,
                      background: `${active.color}15`,
                      border: `1px solid ${active.color}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: `0 0 24px ${active.color}20`,
                    }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: active.color, boxShadow: `0 0 12px ${active.color}80` }} />
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
                        <h3 className="f-head" style={{ fontSize: 20, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.02em" }}>
                          {active.name}
                        </h3>
                        <span style={{
                          fontSize: 10.5, fontWeight: 700,
                          padding: "3px 10px", borderRadius: 99,
                          border: `1px solid ${vc.border}`,
                          background: vc.bg, color: vc.text,
                        }}>
                          {active.version}
                        </span>
                      </div>
                      <p style={{ color: "#64748B", fontSize: 13.5, lineHeight: 1.65, maxWidth: 480 }}>
                        {active.desc}
                      </p>
                    </div>
                  </div>

                  {/* Install pill */}
                  <div style={{ flexShrink: 0 }}>
                    {active.install === "built-in" ? (
                      <span style={{
                        display: "flex", alignItems: "center", gap: 5,
                        fontSize: 11.5, fontWeight: 600, color: "#10B981",
                        padding: "6px 14px", borderRadius: 8,
                        border: "1px solid rgba(16,185,129,0.22)",
                        background: "rgba(16,185,129,0.08)",
                      }}>
                        <Zap size={11} fill="currentColor" /> built-in
                      </span>
                    ) : (
                      <CopyBtn text={active.install} />
                    )}
                  </div>
                </div>

                {/* YAML config block */}
                <div style={{ padding: "1.5rem 1.75rem" }}>
                  <div style={{
                    borderRadius: "0.875rem",
                    border: "1px solid rgba(255,255,255,0.06)",
                    overflow: "hidden",
                    background: "#010208",
                  }}>
                    {/* code header bar */}
                    <div style={{
                      padding: "0.625rem 1.125rem",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      background: "rgba(255,255,255,0.02)",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <span className="f-mono" style={{ fontSize: 10.5, color: "#334155" }}>
                        configs/datasets.yaml
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF5F57" }} />
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFBD2E" }} />
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#27C93F" }} />
                      </div>
                    </div>

                    {/* code body */}
                    <div className="f-mono" style={{ padding: "1.25rem 1.375rem", fontSize: 12.5, lineHeight: 1.95 }}>
                      {/* dataset name */}
                      <div style={{ color: "#818CF8", fontWeight: 700, marginBottom: 2 }}>my_dataset:</div>
                      {/* source block */}
                      <div style={{ color: "#475569", paddingLeft: "1rem" }}>source:</div>
                      {/* snip lines */}
                      {active.snip.map((line, i) => (
                        <div key={i} style={{ paddingLeft: "2rem" }}>
                          <span style={{ color: "#94A3B8" }}>{line.key}: </span>
                          <span style={{ color: line.highlight ? active.color : "#34D399", fontWeight: line.highlight ? 700 : 400 }}>
                            {line.val}
                          </span>
                        </div>
                      ))}
                      {/* common fields */}
                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", marginTop: "0.75rem", paddingTop: "0.75rem" }}>
                        <div style={{ paddingLeft: "1rem" }}>
                          <span style={{ color: "#475569" }}>staging_table: </span>
                          <span style={{ color: "#34D399" }}>stg_{active.id.replace(/[^a-z0-9]/g, "_")}</span>
                        </div>
                        <div style={{ paddingLeft: "1rem" }}>
                          <span style={{ color: "#475569" }}>load_strategy: </span>
                          <span style={{ color: "#FBBF24" }}>replace</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Bottom two mini-cards row ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>

                {/* Plugin card */}
                <div style={{
                  background: "rgba(6,8,16,0.75)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "1.25rem",
                  padding: "1.25rem 1.5rem",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.35),transparent)" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#6366F1" }} />
                    <span className="f-head" style={{ fontSize: 12, fontWeight: 700, color: "#818CF8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Plugin Architecture
                    </span>
                  </div>
                  <div style={{
                    background: "#010208",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: "0.625rem",
                    padding: "0.875rem 1rem",
                  }}>
                    <div className="f-mono" style={{ fontSize: 11.5, lineHeight: 1.85 }}>
                      <div style={{ color: "#334155", marginBottom: 4 }}>{`# register any connector`}</div>
                      <div>
                        <span style={{ color: "#818CF8" }}>ConnectorRegistry</span>
                        <span style={{ color: "#475569" }}>.register(</span>
                        <span style={{ color: "#34D399" }}>&quot;my_db&quot;</span>
                        <span style={{ color: "#475569" }}>,</span>
                        <span style={{ color: "#FBBF24" }}> MyConnector</span>
                        <span style={{ color: "#475569" }}>)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Docs card */}
                <a
                  href="https://github.com/manishkudtarkar/OpenIngest/blob/main/docs/CONNECTORS.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "rgba(6,8,16,0.75)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "1.25rem",
                    padding: "1.25rem 1.5rem",
                    textDecoration: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(34,211,238,0.22)"; el.style.boxShadow = "0 0 30px rgba(34,211,238,0.06)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,0.07)"; el.style.boxShadow = "none"; }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(34,211,238,0.30),transparent)" }} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22D3EE" }} />
                      <span className="f-head" style={{ fontSize: 12, fontWeight: 700, color: "#22D3EE", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Full Docs
                      </span>
                    </div>
                    <ExternalLink size={13} color="#334155" />
                  </div>
                  <p style={{ color: "#334155", fontSize: 12.5, lineHeight: 1.65 }}>
                    All 17 connectors with full config examples, authentication options, and tips.
                  </p>
                  <span style={{ fontSize: 11.5, color: "#22D3EE", fontWeight: 600 }}>
                    docs/CONNECTORS.md →
                  </span>
                </a>
              </div>

              {/* ── All connectors quick grid ── */}
              <div style={{
                background: "rgba(6,8,16,0.75)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "1.25rem",
                padding: "1.25rem 1.5rem",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)" }} />
                <div style={{ fontSize: 9.5, fontWeight: 700, color: "#1E293B", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "1rem" }}>
                  All connectors
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {CONNECTORS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setActiveId(c.id)}
                      style={{
                        fontSize: 11, fontWeight: activeId === c.id ? 600 : 400,
                        padding: "4px 12px",
                        borderRadius: 99,
                        border: `1px solid ${activeId === c.id ? c.color + "35" : "rgba(255,255,255,0.06)"}`,
                        background: activeId === c.id ? `${c.color}12` : "rgba(255,255,255,0.02)",
                        color: activeId === c.id ? c.color : "#334155",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={e => { if (activeId !== c.id) { (e.currentTarget as HTMLElement).style.color = "#64748B"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.10)"; }}}
                      onMouseLeave={e => { if (activeId !== c.id) { (e.currentTarget as HTMLElement).style.color = "#334155"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)"; }}}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

            </motion.div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
