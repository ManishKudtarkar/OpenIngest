import {
  Search, ShieldCheck, Sparkles, Database, TableProperties, BookMarked,
  Wind, TerminalSquare, BarChart3, Container, GitBranch, Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: Search,
    title: "Dynamic Discovery",
    desc: "Scans your source config and builds Dataset objects automatically. Zero changes when adding new sources.",
    src: "core/discovery.py",
    accent: "#6366F1",
    span: false,
  },
  {
    icon: ShieldCheck,
    title: "Schema Validation",
    desc: "Validates required columns, catches missing and extra fields before any data moves. Fails fast, fails early.",
    src: "core/validation.py",
    accent: "#22D3EE",
    span: false,
  },
  {
    icon: Sparkles,
    title: "Data Quality Engine",
    desc: "Non-null, unique, range, regex, and custom df.eval() rules per dataset. 0–100% quality score on every run.",
    src: "core/quality.py",
    accent: "#10B981",
    span: true,
  },
  {
    icon: Database,
    title: "Incremental Loading",
    desc: "Watermark filter + SHA-256 hash CDC + ON CONFLICT DO UPDATE. Only new and changed rows processed. State persisted.",
    src: "core/incremental.py",
    accent: "#8B5CF6",
    span: false,
  },
  {
    icon: TableProperties,
    title: "Auto Table Creation",
    desc: "Infers PostgreSQL column types from source data. Creates staging tables on first run. No SQL, no migrations.",
    src: "utils/db.py",
    accent: "#3B82F6",
    span: false,
  },
  {
    icon: BookMarked,
    title: "Metadata Tracking",
    desc: "Every execution records run ID, status, duration, rows loaded, and quality scores in pipeline_runs.",
    src: "utils/metadata_logger.py",
    accent: "#F59E0B",
    span: false,
  },
  {
    icon: Wind,
    title: "Airflow Integration",
    desc: "Auto-generates one task group per dataset — discover → validate → quality → ingest. Add dataset to YAML, DAG updates.",
    src: "core/airflow/task_factory.py",
    accent: "#14B8A6",
    span: false,
  },
  {
    icon: TerminalSquare,
    title: "Powerful CLI",
    desc: "run · validate · quality · report · history · scheduler · dashboard · --dry-run · --dataset. Everything terminal-first.",
    src: "scripts/openingest.py",
    accent: "#EC4899",
    span: true,
  },
  {
    icon: BarChart3,
    title: "Observability Dashboard",
    desc: "Pipeline history, dataset health, quality trends, incremental state, and execution reports in one view.",
    src: "core/reporting.py",
    accent: "#F97316",
    span: false,
  },
  {
    icon: Container,
    title: "Docker Ready",
    desc: "docker compose up -d starts PostgreSQL on 5432 and Airflow at localhost:8080. One command, full stack.",
    src: "docker-compose.yml",
    accent: "#0EA5E9",
    span: false,
  },
  {
    icon: GitBranch,
    title: "CI/CD Built-in",
    desc: "GitHub Actions runs Ruff lint, Mypy type-check, and Pytest + coverage on every push to main.",
    src: ".github/workflows/ci.yml",
    accent: "#A855F7",
    span: false,
  },
  {
    icon: Zap,
    title: "Config-Driven Everything",
    desc: "One YAML file. No Python, no SQL, no DAG edits. Register a dataset and openingest run handles everything.",
    src: "configs/datasets.yaml",
    accent: "#EAB308",
    span: false,
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#04060d] via-[#06090f] to-[#04060d]" />

      <div className="relative max-w-[1380px] mx-auto px-5 sm:px-6 lg:px-12">

        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 tag text-cyan-300 border-cyan-300/20 bg-cyan-300/6 mb-5">
            <Zap size={11} fill="currentColor" />
            12 production-grade components
          </div>
          <h2 className="f-head text-[38px] md:text-[50px] font-bold text-white leading-[1.1] tracking-[-0.025em] mb-5">
            Everything you need.
            <span className="block g-text">Nothing you don&apos;t.</span>
          </h2>
          <p className="text-[#64748B] text-[15px] leading-relaxed">
            Every component is real, tested, and connected.
            Add YAML. OpenIngest does the rest.
          </p>
        </div>

        {/* Bento-style grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FEATURES.map(({ icon: Icon, title, desc, src, accent, span }) => (
            <div key={title}
              className={`group relative panel rounded-2xl p-5 hover:border-white/12 transition-all duration-300 overflow-hidden ${span ? "lg:col-span-2" : ""}`}>

              {/* Hover gradient sweep from top */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(160deg, ${accent}12 0%, transparent 55%)` }} />

              {/* Accent line top */}
              <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(to right, transparent, ${accent}60, transparent)` }} />

              <div className="relative">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${accent}12`, border: `1px solid ${accent}22` }}>
                  <Icon size={17} style={{ color: accent }} />
                </div>

                <h3 className="f-head font-semibold text-white text-[14px] mb-2 leading-snug">{title}</h3>
                <p className="text-[#64748B] text-[12.5px] leading-relaxed mb-4 group-hover:text-[#94A3B8] transition-colors">{desc}</p>

                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full" style={{ background: accent }} />
                  <code className="text-[10.5px] text-[#334155] f-mono group-hover:text-[#475569] transition-colors">{src}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
