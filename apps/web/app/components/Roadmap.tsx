"use client";
import { useState } from "react";
import {
  CheckCircle2, Circle, Zap, Package, Cloud, Globe, Clock, Bell,
  Puzzle, GitBranch, ArrowRight, Server, FileJson, FileSpreadsheet,
  BarChart3, Shield, Layers,
} from "lucide-react";

// ─── v1.0 shipped milestones ─────────────────────────────────────────────────
const SHIPPED = [
  { id: "M1", label: "Discovery + PostgreSQL", items: ["Dataset discovery", "Config loader", "Schema validation", "PostgreSQL loader"] },
  { id: "M2", label: "Metadata + History",     items: ["Metadata logging", "Pipeline history", "Reporting engine"] },
  { id: "M3", label: "Docker + Airflow",        items: ["Docker support", "Apache Airflow 2.9", "Dynamic DAG generation"] },
  { id: "M4", label: "Zero-SQL Onboarding",     items: ["Auto schema inference", "Datatype inference", "Zero-SQL onboarding"] },
  { id: "M5", label: "Quality + CLI + CI",      items: ["Data quality engine", "Incremental loading", "Full CLI", "GitHub Actions CI/CD"] },
];

// ─── upcoming versions ────────────────────────────────────────────────────────
const VERSIONS = [
  {
    version: "v2.0",
    label: "Multi-format + Cloud",
    headline: "Every data source, one config.",
    status: "shipped",
    accent: "#10B981",
    icon: Cloud,
    groups: [
      {
        title: "Multi-format",
        icon: Package,
        items: [
          { label: "Excel (.xlsx)",         done: true },
          { label: "JSON + NDJSON",         done: true },
          { label: "Parquet (columnar)",    done: true },
          { label: "CSV",                   done: true },
        ],
      },
      {
        title: "Cloud Storage",
        icon: Cloud,
        items: [
          { label: "Amazon S3",             done: true },
          { label: "Azure Blob Storage",    done: true },
          { label: "Google Cloud Storage",  done: true },
        ],
      },
      {
        title: "REST API",
        icon: Globe,
        items: [
          { label: "GET / POST + headers",  done: true },
          { label: "Bearer token + ${ENV}", done: true },
          { label: "Offset + cursor paging",done: true },
        ],
      },
    ],
    snipLines: [
      [["source:",              "#CBD5E1"]],
      [["  type: ", "#94A3B8"], ["s3",                "#FBBF24"]],
      [["  bucket: ","#94A3B8"],["company-data",       "#34D399"]],
      [["  key: ",   "#94A3B8"],["orders/2026.csv",    "#34D399"]],
    ],
  },
  {
    version: "v2.5",
    label: "Scheduling + Observability",
    headline: "Run without Airflow. Know when it fails.",
    status: "shipped",
    accent: "#10B981",
    icon: Clock,
    groups: [
      {
        title: "Built-in Cron Scheduler",
        icon: Clock,
        items: [
          { label: "openingest scheduler start", done: true },
          { label: "openingest run --schedule",  done: true },
          { label: "Preset aliases (@daily…)",   done: true },
        ],
      },
      {
        title: "Notifications",
        icon: Bell,
        items: [
          { label: "Slack webhook on success/fail", done: true },
          { label: "Email (SMTP) alerts",           done: true },
          { label: "Retry policies",                done: false },
        ],
      },
      {
        title: "Dataset Profiling",
        icon: BarChart3,
        items: [
          { label: "Column statistics",             done: false },
          { label: "Null / dupe distributions",     done: false },
        ],
      },
    ],
    snipLines: [
      [["notifications:",                 "#CBD5E1"]],
      [["  slack:",                       "#94A3B8"]],
      [["    webhook: ", "#94A3B8"], ["${SLACK_URL}", "#34D399"]],
      [["    on: ", "#94A3B8"],      ["[success, failure]", "#FBBF24"]],
    ],
  },
  {
    version: "v3.0",
    label: "Enterprise Platform",
    headline: "Extensible. Observable. Enterprise-ready.",
    status: "next",
    accent: "#6366F1",
    icon: Puzzle,
    groups: [
      {
        title: "Plugin Architecture",
        icon: Puzzle,
        items: [
          { label: "pip install openingest-*",      done: true },
          { label: "ConnectorRegistry.register()",  done: true },
          { label: "Custom connector SDK",          done: false },
        ],
      },
      {
        title: "Data Lineage",
        icon: GitBranch,
        items: [
          { label: "Lineage graph engine",          done: true },
          { label: "ASCII + Mermaid + JSON export", done: true },
          { label: "Web lineage visualizer",        done: false },
        ],
      },
      {
        title: "Enterprise",
        icon: Shield,
        items: [
          { label: "Web dashboard",                 done: false },
          { label: "RBAC",                          done: false },
          { label: "Multi-environment support",     done: false },
          { label: "PyPI public release",           done: false },
        ],
      },
    ],
    snipLines: [
      [["pip install ", "#94A3B8"], ["openingest-snowflake", "#A5B4FC"]],
      [["pip install ", "#94A3B8"], ["openingest-salesforce", "#A5B4FC"]],
      [["# auto-registers on import",              "#334155"]],
      [["source:",                                 "#CBD5E1"]],
      [["  type: ", "#94A3B8"], ["snowflake",      "#FBBF24"]],
    ],
  },
];

const STATUS_META: Record<string, { label: string; pill: string }> = {
  shipped: { label: "Shipped ✓", pill: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" },
  next:    { label: "Up next",   pill: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25" },
  planned: { label: "Planned",   pill: "text-violet-400 bg-violet-500/10 border-violet-500/25" },
  future:  { label: "Future",    pill: "text-teal-400 bg-teal-500/10 border-teal-500/25" },
};

// Lineage mini-diagram for v3.0 preview
function LineagePreview() {
  const steps = [
    { label: "customers.csv", type: "source" },
    { label: "Schema Validation", type: "check" },
    { label: "Quality Engine", type: "check" },
    { label: "stg_customers", type: "table" },
    { label: "warehouse.customers", type: "warehouse" },
  ];
  const colors: Record<string, string> = {
    source: "#64748B", check: "#22D3EE", table: "#6366F1", warehouse: "#10B981",
  };
  return (
    <div className="mt-4 bg-[#020408] rounded-xl border border-white/5 px-4 py-4">
      <div className="text-[10px] text-[#334155] uppercase tracking-wider mb-3">Lineage preview</div>
      <div className="flex flex-col gap-0">
        {steps.map((step, i) => (
          <div key={step.label} className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: colors[step.type] }} />
              <span className="f-mono text-[11px]" style={{ color: colors[step.type] }}>{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="ml-[3px] w-px h-4 bg-gradient-to-b from-white/10 to-transparent" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Roadmap() {
  const [expandedVer, setExpandedVer] = useState<string | null>("v2.0");

  return (
    <section id="roadmap" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[#04060d]" />
      <div className="absolute inset-0 grid-fine opacity-20" />
      <div className="absolute top-1/2 left-1/2 w-[900px] h-[400px] bg-indigo-600/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />

      <div className="relative max-w-[1380px] mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 tag text-indigo-400 border-indigo-500/25 bg-indigo-500/8 mb-5">
            Roadmap
          </div>
          <h2 className="f-head text-[42px] md:text-[52px] font-bold text-white leading-[1.1] tracking-[-0.025em] mb-4">
            Where we&apos;re going.
          </h2>
          <p className="text-[#94A3B8] text-[16px] max-w-2xl mx-auto">
            v1.0 ships a complete production ingestion framework.
            v2.0 adds every data source. v2.5 adds scheduling and alerts.
            v3.0 makes it enterprise-grade.
          </p>
        </div>

        {/* ── v1.0 shipped strip ── */}
        <div className="panel rounded-2xl p-6 border-emerald-500/15 mb-6 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex items-center gap-3 lg:w-44 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>
              <div>
                <div className="f-head font-bold text-white text-[15px]">v1.0</div>
                <span className="tag text-[10px] text-emerald-400 border-emerald-500/20 bg-emerald-500/8">
                  Shipped ✓
                </span>
              </div>
            </div>

            <div className="flex-1 grid sm:grid-cols-5 gap-3">
              {SHIPPED.map(m => (
                <div key={m.id}>
                  <div className="tag text-[10px] text-emerald-400 border-emerald-500/15 bg-emerald-500/6 mb-2 w-fit">
                    {m.id}
                  </div>
                  <div className="space-y-1">
                    {m.items.map(item => (
                      <div key={item} className="flex items-start gap-1.5 text-[11px] text-[#475569]">
                        <CheckCircle2 size={9} className="text-emerald-500/50 mt-0.5 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── v2.0 / v2.5 / v3.0 ── */}
        <div className="flex flex-col gap-4">
          {VERSIONS.map(ver => {
            const Icon = ver.icon;
            const meta = STATUS_META[ver.status];
            const isOpen = expandedVer === ver.version;

            return (
              <div key={ver.version}
                className="panel rounded-2xl overflow-hidden relative group transition-all"
                style={{ borderColor: isOpen ? `${ver.accent}20` : undefined }}>
                <div className="absolute top-0 inset-x-0 h-px"
                  style={{ background: `linear-gradient(to right, transparent, ${ver.accent}40, transparent)` }} />

                {/* Collapsed / header row */}
                <button
                  onClick={() => setExpandedVer(isOpen ? null : ver.version)}
                  className="w-full flex items-center gap-5 px-6 py-5 text-left hover:bg-white/2 transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${ver.accent}15`, border: `1px solid ${ver.accent}25` }}>
                    <Icon size={16} style={{ color: ver.accent }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="f-head font-bold text-white text-[16px]">{ver.version}</span>
                      <span className="text-[13px] text-[#475569]">{ver.label}</span>
                    </div>
                    <p className="text-[12px] text-[#334155] mt-0.5">{ver.headline}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Feature count pills */}
                    <div className="hidden md:flex gap-2">
                      {ver.groups.map(g => (
                        <span key={g.title}
                          className="tag text-[10px] text-[#475569] border-white/8 bg-white/3">
                          {g.title}
                        </span>
                      ))}
                    </div>
                    <span className={`tag text-[10px] ${meta.pill}`}>{meta.label}</span>
                    <ArrowRight size={13}
                      className={`text-[#334155] transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
                  </div>
                </button>

                {/* Expanded body */}
                {isOpen && (
                  <div className="border-t border-white/5 px-6 pb-6 pt-5">
                    <div className="grid lg:grid-cols-4 gap-5">
                      {/* Feature groups — 3 columns */}
                      {ver.groups.map(group => {
                        const GIcon = group.icon;
                        return (
                          <div key={group.title}>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                                style={{ background: `${ver.accent}15`, border: `1px solid ${ver.accent}20` }}>
                                <GIcon size={11} style={{ color: ver.accent }} />
                              </div>
                              <span className="text-[12px] font-semibold f-head"
                                style={{ color: ver.accent }}>
                                {group.title}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {group.items.map(item => (
                                <div key={item.label}
                                  className="flex items-start gap-2 text-[12px]"
                                  style={{ color: item.done ? "#475569" : "#64748B" }}>
                                  {item.done
                                    ? <CheckCircle2 size={11} className="text-emerald-500/60 mt-[1px] shrink-0" />
                                    : <Circle size={11} className="mt-[1px] shrink-0" style={{ color: "#1E293B" }} />
                                  }
                                  {item.label}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                      {/* Config snippet / preview — 1 column */}
                      <div>
                        <div className="text-[11px] text-[#334155] uppercase tracking-wider mb-3">
                          Config example
                        </div>
                        <div className="bg-[#020408] rounded-xl border border-white/5 px-4 py-3 f-mono text-[11px] leading-[1.9]">
                          <div className="text-[#334155] mb-1">
                            # {ver.version} config
                          </div>
                          {ver.snipLines.map((row, ri) => (
                            <div key={ri}>
                              {row.map(([text, color], ci) => (
                                <span key={ci} style={{ color }}>{text}</span>
                              ))}
                            </div>
                          ))}
                        </div>

                        {/* Lineage preview for v3.0 */}
                        {ver.version === "v3.0" && <LineagePreview />}

                        {/* Notification preview for v2.5 */}
                        {ver.version === "v2.5" && (
                          <div className="mt-4 bg-[#020408] rounded-xl border border-white/5 px-4 py-3">
                            <div className="text-[10px] text-[#334155] uppercase tracking-wider mb-2">Slack alert</div>
                            <div className="flex items-start gap-2.5">
                              <div className="w-1 h-full rounded-full bg-emerald-500 self-stretch shrink-0 min-h-[40px]" />
                              <div className="f-mono text-[10.5px] leading-[1.7]">
                                <div className="text-white font-semibold">✅ OpenIngest — SUCCESS</div>
                                <div className="text-[#475569]">Run: OI-20260703-3BB09C</div>
                                <div className="text-[#475569]">Rows: 174,777 · 4.21s</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Install hint */}
                        {ver.version === "v2.0" && (
                          <div className="mt-4 bg-[#020408] rounded-xl border border-white/5 px-4 py-3">
                            <div className="text-[10px] text-[#334155] uppercase tracking-wider mb-2">Install extras</div>
                            <div className="f-mono text-[10.5px] text-[#A5B4FC] leading-[1.9]">
                              <div>pip install openingest[s3]</div>
                              <div>pip install openingest[azure]</div>
                              <div>pip install openingest[parquet]</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 panel rounded-2xl p-6 border-indigo-500/12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="f-head font-semibold text-white text-[15px] mb-1">
              Want to contribute or sponsor a feature?
            </h3>
            <p className="text-[13px] text-[#475569]">
              Open an issue, submit a PR, or reach out on GitHub. All contributions welcome.
            </p>
          </div>
          <a href="https://github.com/manishkudtarkar/OpenIngest/issues"
            target="_blank" rel="noopener noreferrer"
            className="relative flex items-center gap-2 font-semibold text-white text-[13px] px-6 py-3 rounded-xl overflow-hidden shrink-0 group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 group-hover:from-indigo-500 group-hover:to-violet-500 transition-all" />
            <span className="relative">Open an Issue on GitHub</span>
          </a>
        </div>
      </div>
    </section>
  );
}
