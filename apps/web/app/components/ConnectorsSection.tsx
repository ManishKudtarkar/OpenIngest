"use client";
import { useState } from "react";
import { Cloud, Database, Globe, FileSpreadsheet, FileJson, Zap, Server, Package } from "lucide-react";

type ConnectorGroup = {
  category: string;
  icon: React.ElementType;
  accent: string;
  connectors: Connector[];
};

type Connector = {
  name: string;
  label: string;
  icon: string;
  desc: string;
  version: string;
  snippet: { lines: [string, string][] }; // [text, color]
};

const GROUPS: ConnectorGroup[] = [
  {
    category: "File Formats",
    icon: Package,
    accent: "#6366F1",
    connectors: [
      {
        name: "csv",
        label: "CSV",
        icon: "📄",
        desc: "Comma-separated values. The existing default — fully supported.",
        version: "v1.0 ✅",
        snippet: {
          lines: [
            ["source:", "#CBD5E1"],
            ["  type: csv", "#FBBF24"],
            ["  file: customers.csv", "#34D399"],
          ],
        },
      },
      {
        name: "excel",
        label: "Excel (.xlsx)",
        icon: "📊",
        desc: "Read directly from .xlsx workbooks. Supports multi-sheet and header offset.",
        version: "v2.0",
        snippet: {
          lines: [
            ["source:", "#CBD5E1"],
            ["  type: excel", "#FBBF24"],
            ["  file: budget_2026.xlsx", "#34D399"],
            ["  sheet: Q1", "#34D399"],
          ],
        },
      },
      {
        name: "json",
        label: "JSON",
        icon: "{}",
        desc: "Flat arrays, nested objects, and newline-delimited JSON (NDJSON).",
        version: "v2.0",
        snippet: {
          lines: [
            ["source:", "#CBD5E1"],
            ["  type: json", "#FBBF24"],
            ["  file: orders.json", "#34D399"],
            ["  record_path: data", "#34D399"],
          ],
        },
      },
      {
        name: "parquet",
        label: "Parquet",
        icon: "⚡",
        desc: "Columnar format with projection pushdown and predicate filtering.",
        version: "v2.0",
        snippet: {
          lines: [
            ["source:", "#CBD5E1"],
            ["  type: parquet", "#FBBF24"],
            ["  file: events.parquet", "#34D399"],
            ["  columns: [id, ts, type]", "#94A3B8"],
          ],
        },
      },
    ],
  },
  {
    category: "Cloud Storage",
    icon: Cloud,
    accent: "#22D3EE",
    connectors: [
      {
        name: "s3",
        label: "Amazon S3",
        icon: "🟠",
        desc: "Reads CSV, Parquet, JSON, or Excel directly from any S3 bucket. IAM role, env var, or explicit key auth.",
        version: "v2.0",
        snippet: {
          lines: [
            ["source:", "#CBD5E1"],
            ["  type: s3", "#FBBF24"],
            ["  bucket: company-data", "#34D399"],
            ["  key: customers/2026.csv", "#34D399"],
            ["  region: us-east-1", "#94A3B8"],
          ],
        },
      },
      {
        name: "azure",
        label: "Azure Blob",
        icon: "🔵",
        desc: "Azure Blob Storage via connection string or SAS token. All file formats supported.",
        version: "v2.0",
        snippet: {
          lines: [
            ["source:", "#CBD5E1"],
            ["  type: azure", "#FBBF24"],
            ["  container: company-data", "#34D399"],
            ["  blob: orders/orders.parquet", "#34D399"],
            ["  connection_string: ${AZURE_CONN}", "#94A3B8"],
          ],
        },
      },
      {
        name: "gcs",
        label: "Google Cloud Storage",
        icon: "🔴",
        desc: "GCS via Application Default Credentials or explicit service account JSON.",
        version: "v2.0",
        snippet: {
          lines: [
            ["source:", "#CBD5E1"],
            ["  type: gcs", "#FBBF24"],
            ["  bucket: company-data", "#34D399"],
            ["  object: products/latest.csv", "#34D399"],
            ["  project: my-gcp-project", "#94A3B8"],
          ],
        },
      },
    ],
  },
  {
    category: "REST API",
    icon: Globe,
    accent: "#8B5CF6",
    connectors: [
      {
        name: "rest",
        label: "REST / HTTP",
        icon: "🌐",
        desc: "GET or POST any JSON API. Bearer token, headers, pagination (offset or cursor), env var expansion.",
        version: "v2.0",
        snippet: {
          lines: [
            ["source:", "#CBD5E1"],
            ["  type: rest", "#FBBF24"],
            ["  url: https://api.company.com/orders", "#34D399"],
            ["  headers:", "#CBD5E1"],
            ["    Authorization: Bearer ${TOKEN}", "#94A3B8"],
            ["  record_path: data", "#34D399"],
            ["  pagination:", "#CBD5E1"],
            ["    type: offset  limit: 500", "#94A3B8"],
          ],
        },
      },
    ],
  },
];

export default function ConnectorsSection() {
  const [active, setActive] = useState<string>("s3");

  const allConnectors = GROUPS.flatMap(g => g.connectors);
  const activeConnector = allConnectors.find(c => c.name === active) || allConnectors[0];
  const activeGroup = GROUPS.find(g => g.connectors.some(c => c.name === active))!;

  return (
    <section id="connectors" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[#04060d]" />
      <div className="absolute inset-0 grid-fine opacity-20" />
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-cyan-600/4 rounded-full blur-[120px] -translate-y-1/2" />

      <div className="relative max-w-[1380px] mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 tag text-cyan-400 border-cyan-500/25 bg-cyan-500/8 mb-5">
            v2.0 Connectors
          </div>
          <h2 className="f-head text-[42px] md:text-[52px] font-bold text-white leading-[1.1] tracking-[-0.025em] mb-4">
            Any source. One config.
          </h2>
          <p className="text-[#94A3B8] text-[16px] max-w-xl mx-auto">
            Connect to cloud storage, REST APIs, and all major file formats —
            just add a <code className="text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded f-mono text-[13px]">source:</code> block to your dataset config.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">

          {/* Left: connector picker */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {GROUPS.map(group => {
              const GIcon = group.icon;
              return (
                <div key={group.category}>
                  <div className="flex items-center gap-2 mb-2">
                    <GIcon size={12} style={{ color: group.accent }} />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                      style={{ color: group.accent }}>
                      {group.category}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {group.connectors.map(c => (
                      <button key={c.name}
                        onClick={() => setActive(c.name)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all
                        ${active === c.name
                          ? "border-white/12 bg-white/4"
                          : "border-transparent hover:border-white/6 hover:bg-white/2"
                        }`}>
                        <span className="text-lg w-7 text-center">{c.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className={`text-[13px] font-semibold f-head truncate ${active === c.name ? "text-white" : "text-[#64748B]"}`}>
                            {c.label}
                          </div>
                        </div>
                        <span className={`tag text-[10px] shrink-0 ${
                          c.version.includes("✅")
                            ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/8"
                            : "text-indigo-400 border-indigo-500/20 bg-indigo-500/8"
                        }`}>
                          {c.version}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: active connector detail */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Info card */}
            <div className="panel-glow rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px"
                style={{ background: `linear-gradient(to right, transparent, ${activeGroup.accent}40, transparent)` }} />

              <div className="flex items-start gap-4 mb-5">
                <span className="text-3xl">{activeConnector.icon}</span>
                <div>
                  <h3 className="f-head font-bold text-white text-[18px]">{activeConnector.label}</h3>
                  <p className="text-[#64748B] text-[13px] mt-1 leading-relaxed max-w-md">
                    {activeConnector.desc}
                  </p>
                </div>
              </div>

              {/* Config snippet */}
              <div className="bg-[#020408] rounded-xl border border-white/5 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
                  <span className="text-[11px] text-[#334155] f-mono">configs/datasets.yaml</span>
                  <span className={`tag text-[10px] ${
                    activeConnector.version.includes("✅")
                      ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/8"
                      : "text-indigo-400 border-indigo-500/20 bg-indigo-500/8"
                  }`}>
                    {activeConnector.version}
                  </span>
                </div>
                <div className="px-5 py-4 f-mono text-[12.5px] leading-[1.9]">
                  <div className="text-[#334155] mb-1"># Dataset config with {activeConnector.label} source</div>
                  <div className="text-[#CBD5E1]">my_dataset:</div>
                  <div className="ml-2">
                    {activeConnector.snippet.lines.map(([text, color], i) => (
                      <div key={i} style={{ color }}>{text}</div>
                    ))}
                  </div>
                  <div className="text-[#475569] mt-1">  staging_table: stg_my_dataset</div>
                  <div className="text-[#475569]">  load_strategy: replace</div>
                </div>
              </div>
            </div>

            {/* ConnectorRegistry info */}
            <div className="panel rounded-2xl p-5 relative overflow-hidden">
              <div className="text-[11px] text-[#334155] uppercase tracking-widest mb-3">Plugin Architecture (v3.0)</div>
              <div className="bg-[#020408] rounded-xl border border-white/5 px-4 py-4 f-mono text-[11.5px] leading-[1.9]">
                <div className="text-[#334155] mb-1"># Install a third-party connector plugin</div>
                <div className="text-[#A5B4FC]">pip install openingest-snowflake</div>
                <div className="text-[#A5B4FC]">pip install openingest-salesforce</div>
                <div className="text-[#1E293B]">&nbsp;</div>
                <div className="text-[#334155] mb-1"># Registers automatically on import</div>
                <div><span className="text-[#CBD5E1]">ConnectorRegistry</span><span className="text-[#94A3B8]">.register(</span><span className="text-[#34D399]">"snowflake"</span><span className="text-[#94A3B8]">, SnowflakeConnector)</span></div>
                <div className="text-[#1E293B]">&nbsp;</div>
                <div className="text-[#334155] mb-1"># Then use in YAML:</div>
                <div><span className="text-[#CBD5E1]">source:</span></div>
                <div><span className="text-[#94A3B8]">  type: </span><span className="text-[#FBBF24]">snowflake</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
