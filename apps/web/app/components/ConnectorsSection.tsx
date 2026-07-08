"use client";
import { useState } from "react";
import {
  Cloud, Globe, Package, CheckCircle2,
  FileText, FileCode, Layers, Zap,
  Server, HardDrive, Wifi,
} from "lucide-react";

type Connector = {
  id: string;
  label: string;
  Icon: React.ElementType;
  iconColor: string;
  desc: string;
  version: string;
  installed: string;
  snip: [string, string][];
};

type Group = {
  category: string;
  HeadIcon: React.ElementType;
  accent: string;
  items: Connector[];
};

const GROUPS: Group[] = [
  {
    category: "File Formats",
    HeadIcon: Package,
    accent: "#6366F1",
    items: [
      {
        id: "csv",
        label: "CSV",
        Icon: FileText,
        iconColor: "#6366F1",
        desc: "Default format. Comma-separated files from data/raw/ or any local path. Encoding and separator configurable.",
        version: "v1.0",
        installed: "built-in",
        snip: [
          ["source:", "#CBD5E1"],
          ["  type: csv", "#FBBF24"],
          ["  file: customers.csv", "#34D399"],
        ],
      },
      {
        id: "excel",
        label: "Excel (.xlsx)",
        Icon: Layers,
        iconColor: "#22C55E",
        desc: "Read .xlsx workbooks directly. Multi-sheet support, header offset, skip rows, column projection, dtype overrides.",
        version: "v2.0",
        installed: "pip install openingest[excel]",
        snip: [
          ["source:", "#CBD5E1"],
          ["  type: excel", "#FBBF24"],
          ["  file: budget_2026.xlsx", "#34D399"],
          ["  sheet: Q1", "#94A3B8"],
        ],
      },
      {
        id: "json",
        label: "JSON",
        Icon: FileCode,
        iconColor: "#F59E0B",
        desc: "Flat JSON arrays, nested record_path navigation, and newline-delimited NDJSON (lines: true).",
        version: "v2.0",
        installed: "built-in",
        snip: [
          ["source:", "#CBD5E1"],
          ["  type: json", "#FBBF24"],
          ["  file: orders.json", "#34D399"],
          ["  record_path: data", "#94A3B8"],
        ],
      },
      {
        id: "parquet",
        label: "Parquet",
        Icon: Zap,
        iconColor: "#A855F7",
        desc: "Columnar format with projection pushdown (columns:) and predicate filters. Requires pyarrow.",
        version: "v2.0",
        installed: "pip install openingest[parquet]",
        snip: [
          ["source:", "#CBD5E1"],
          ["  type: parquet", "#FBBF24"],
          ["  file: events.parquet", "#34D399"],
          ["  columns: [id, ts, type]", "#94A3B8"],
        ],
      },
    ],
  },
  {
    category: "Cloud Storage",
    HeadIcon: Cloud,
    accent: "#22D3EE",
    items: [
      {
        id: "s3",
        label: "Amazon S3",
        Icon: Server,
        iconColor: "#FF9900",
        desc: "Reads CSV, Parquet, JSON, or Excel from S3. IAM role, environment variable, or explicit credential auth.",
        version: "v2.0",
        installed: "pip install openingest[s3]",
        snip: [
          ["source:", "#CBD5E1"],
          ["  type: s3", "#FBBF24"],
          ["  bucket: company-data", "#34D399"],
          ["  key: orders/2026.parquet", "#34D399"],
          ["  region: us-east-1", "#94A3B8"],
        ],
      },
      {
        id: "azure",
        label: "Azure Blob",
        Icon: HardDrive,
        iconColor: "#0078D4",
        desc: "Azure Blob Storage via connection string or SAS token. Auto-detects format from blob name extension.",
        version: "v2.0",
        installed: "pip install openingest[azure]",
        snip: [
          ["source:", "#CBD5E1"],
          ["  type: azure", "#FBBF24"],
          ["  container: company-data", "#34D399"],
          ["  blob: orders/orders.parquet", "#34D399"],
          ["  connection_string: ${AZURE_CONN}", "#94A3B8"],
        ],
      },
      {
        id: "gcs",
        label: "Google Cloud Storage",
        Icon: Cloud,
        iconColor: "#4285F4",
        desc: "GCS via Application Default Credentials or explicit service account JSON file.",
        version: "v2.0",
        installed: "pip install openingest[gcs]",
        snip: [
          ["source:", "#CBD5E1"],
          ["  type: gcs", "#FBBF24"],
          ["  bucket: company-data", "#34D399"],
          ["  object: products/latest.csv", "#34D399"],
          ["  project: my-gcp-project", "#94A3B8"],
        ],
      },
    ],
  },
  {
    category: "REST API",
    HeadIcon: Globe,
    accent: "#8B5CF6",
    items: [
      {
        id: "rest",
        label: "REST / HTTP API",
        Icon: Wifi,
        iconColor: "#8B5CF6",
        desc: "GET or POST any JSON endpoint. Bearer token, custom headers, ${ENV} expansion, offset and cursor pagination, automatic retry with backoff.",
        version: "v2.0",
        installed: "pip install openingest[api]",
        snip: [
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
    ],
  },
];

const ALL = GROUPS.flatMap(g => g.items);

export default function ConnectorsSection() {
  const [activeId, setActiveId] = useState("s3");

  const active = ALL.find(c => c.id === activeId) ?? ALL[0];
  const activeGroup = GROUPS.find(g => g.items.some(c => c.id === activeId))!;

  return (
    <section id="connectors" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[#04060d]" />
      <div className="absolute inset-0 grid-fine opacity-15" />
      <div className="absolute top-1/2 right-0 w-[700px] h-[700px] bg-indigo-600/4 rounded-full blur-[140px] -translate-y-1/2" />

      <div className="section-container">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 tag text-indigo-400 border-indigo-500/20 bg-indigo-500/6 mb-5">
            v2.0 · 9 connectors
          </div>
          <h2 className="f-head text-[38px] md:text-[50px] font-bold text-white leading-[1.1] tracking-[-0.025em] mb-4">
            Any source. One config block.
          </h2>
          <p className="text-[#64748B] text-[15px] max-w-lg mx-auto leading-relaxed">
            Add a <code className="text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded f-mono text-[12px]">source:</code> block
            to any dataset entry and OpenIngest routes reads through the right connector automatically.
          </p>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-6">

          {/* ── Left: grouped picker ── */}
          <div className="flex flex-col gap-5">
            {GROUPS.map(group => {
              const GH = group.HeadIcon;
              return (
                <div key={group.category}>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <GH size={11} style={{ color: group.accent }} />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em]"
                      style={{ color: group.accent }}>
                      {group.category}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {group.items.map(c => {
                      const CIcon = c.Icon;
                      const isActive = activeId === c.id;
                      return (
                        <button key={c.id}
                          onClick={() => setActiveId(c.id)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all group
                          ${isActive
                            ? "border-white/12 bg-white/5"
                            : "border-transparent hover:border-white/6 hover:bg-white/2"
                          }`}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                            style={{
                              background: isActive ? `${c.iconColor}18` : "rgba(255,255,255,0.04)",
                              border: `1px solid ${isActive ? c.iconColor + "30" : "rgba(255,255,255,0.07)"}`,
                            }}>
                            <CIcon size={14} style={{ color: isActive ? c.iconColor : "#475569" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-[13px] font-semibold f-head transition-colors ${isActive ? "text-white" : "text-[#64748B] group-hover:text-[#94A3B8]"}`}>
                              {c.label}
                            </div>
                          </div>
                          <span className={`tag text-[10px] shrink-0 transition-colors ${
                            c.version === "v1.0"
                              ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/8"
                              : isActive
                                ? "text-indigo-300 border-indigo-400/30 bg-indigo-400/10"
                                : "text-[#334155] border-white/6 bg-white/2"
                          }`}>
                            {c.version}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Right: detail panel ── */}
          <div className="flex flex-col gap-4">
            {/* Main card */}
            <div className="panel-glow rounded-2xl p-6 relative overflow-hidden flex-1">
              <div className="absolute top-0 inset-x-0 h-px"
                style={{ background: `linear-gradient(to right, transparent, ${activeGroup.accent}50, transparent)` }} />

              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${active.iconColor}15`, border: `1px solid ${active.iconColor}25` }}>
                  <active.Icon size={20} style={{ color: active.iconColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h3 className="f-head font-bold text-white text-[17px]">{active.label}</h3>
                    <span className={`tag text-[10px] ${
                      active.version === "v1.0"
                        ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/8"
                        : "text-indigo-300 border-indigo-400/25 bg-indigo-400/8"
                    }`}>
                      {active.version}
                    </span>
                  </div>
                  <p className="text-[#64748B] text-[13px] leading-relaxed">{active.desc}</p>
                </div>
              </div>

              {/* YAML config */}
              <div className="rounded-xl border border-white/6 overflow-hidden bg-[#020408]">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
                  <span className="text-[11px] text-[#334155] f-mono">configs/datasets.yaml</span>
                  <span className="text-[11px] text-[#334155] f-mono">{active.installed}</span>
                </div>
                <div className="px-5 py-4 f-mono text-[12.5px] leading-[1.9]">
                  <div className="text-[#334155] mb-1.5"># {active.label} source</div>
                  <div className="text-[#475569]">my_dataset:</div>
                  <div className="ml-3">
                    {active.snip.map(([text, color], i) => (
                      <div key={i} style={{ color }}>{text}</div>
                    ))}
                  </div>
                  <div className="text-[#334155] mt-1.5">  staging_table: stg_my_dataset</div>
                  <div className="text-[#334155]">  load_strategy: replace</div>
                </div>
              </div>
            </div>

            {/* Plugin card */}
            <div className="panel rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span className="text-[12px] font-semibold text-white f-head">Plugin architecture</span>
                <span className="tag text-[10px] text-teal-400 border-teal-500/20 bg-teal-500/8 ml-auto">v3.0</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#020408] px-4 py-3 f-mono text-[11px] leading-[1.9]">
                <div className="text-[#334155] mb-1"># Third-party connector plugins</div>
                <div className="text-[#A5B4FC]">pip install openingest-snowflake</div>
                <div className="text-[#A5B4FC]">pip install openingest-salesforce</div>
                <div className="text-[#1E293B] select-none">&nbsp;</div>
                <div><span className="text-[#CBD5E1]">ConnectorRegistry</span><span className="text-[#64748B]">.register(</span><span className="text-[#34D399]">&quot;snowflake&quot;</span><span className="text-[#64748B]">, SnowflakeConnector)</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
