import {
  Search, ShieldCheck, Sparkles, Database, TableProperties, BookMarked,
  Wind, TerminalSquare, BarChart3, Container, GitBranch, Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: Search,
    title: "Dynamic Discovery",
    desc: "Scans your data directory and auto-converts every file into a Dataset object. Zero config changes when adding sources.",
    src: "core/discovery.py",
    accent: "#6366F1",
  },
  {
    icon: ShieldCheck,
    title: "Schema Validation",
    desc: "Validates required columns, catches missing and extra fields, checks registration. Fails fast — before any data moves.",
    src: "core/validation.py",
    accent: "#22D3EE",
  },
  {
    icon: Sparkles,
    title: "Data Quality Engine",
    desc: "Configurable non_null, unique, and range rules per dataset. Produces a 0–100% quality score and PASS/FAIL on every run.",
    src: "core/quality.py",
    accent: "#10B981",
  },
  {
    icon: Database,
    title: "Incremental Loading",
    desc: "Watermark-based filtering + SHA-256 hash CDC + ON CONFLICT DO UPDATE. Only new and changed rows. State persisted between runs.",
    src: "core/incremental.py",
    accent: "#8B5CF6",
  },
  {
    icon: TableProperties,
    title: "Auto Table Creation",
    desc: "Infers column types from your source and creates PostgreSQL staging tables automatically. No SQL, no migrations to write.",
    src: "utils/db.py",
    accent: "#3B82F6",
  },
  {
    icon: BookMarked,
    title: "Metadata Tracking",
    desc: "Every execution records run ID, status, duration, rows loaded, and quality scores in pipeline_runs and pipeline_dataset_runs.",
    src: "utils/metadata_logger.py",
    accent: "#F59E0B",
  },
  {
    icon: Wind,
    title: "Airflow Integration",
    desc: "Auto-generates one task group per dataset inside openingest_dynamic_pipeline. Add a dataset to YAML — the DAG updates itself.",
    src: "core/airflow/task_factory.py",
    accent: "#14B8A6",
  },
  {
    icon: TerminalSquare,
    title: "Powerful CLI",
    desc: "run · validate · quality · report · history · dashboard · --dry-run · --dataset. Everything in the terminal.",
    src: "scripts/openingest.py",
    accent: "#EC4899",
  },
  {
    icon: BarChart3,
    title: "Monitoring Dashboard",
    desc: "Pipeline history, dataset health, quality trends, incremental state, and execution reports. Runs inside the terminal.",
    src: "core/reporting.py",
    accent: "#F97316",
  },
  {
    icon: Container,
    title: "Docker Ready",
    desc: "docker compose up -d starts PostgreSQL on 5432 and Airflow at localhost:8080 in one command. No manual setup.",
    src: "docker-compose.yml",
    accent: "#0EA5E9",
  },
  {
    icon: GitBranch,
    title: "CI/CD Built-in",
    desc: "GitHub Actions runs Ruff lint, Mypy type-checking, and Pytest + coverage on every push to main. Zero configuration.",
    src: ".github/workflows/ci.yml",
    accent: "#A855F7",
  },
  {
    icon: Zap,
    title: "Config-Driven Everything",
    desc: "One YAML file. No Python. No SQL. No DAG code. Register your dataset and openingest run handles everything end to end.",
    src: "configs/datasets.yaml",
    accent: "#EAB308",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#04060d] via-[#080c18] to-[#04060d]" />

      <div className="relative max-w-[1380px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 tag text-cyan-300 border-cyan-300/25 bg-cyan-300/8 mb-5">
            <Zap size={11} fill="currentColor" />
            Built for production
          </div>
          <h2 className="f-head text-[42px] md:text-[52px] font-bold text-white leading-[1.1] mb-5">
            Every component you need,{" "}
            <span className="g-text">nothing you don&apos;t.</span>
          </h2>
          <p className="text-[#94A3B8] text-[16px] leading-relaxed">
            12 production-grade components that work together seamlessly.
            Add YAML. OpenIngest does the rest.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, src, accent }) => (
            <div key={title}
              className="group relative panel rounded-lg p-5 hover:border-white/12 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(180deg, ${accent}10 0%, transparent 76%)` }} />

              <div className="relative">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}>
                  <Icon size={17} style={{ color: accent }} />
                </div>
                <h3 className="f-head font-semibold text-white text-[14px] mb-2 leading-snug">{title}</h3>
                <p className="text-[#64748B] text-[12.5px] leading-relaxed mb-4">{desc}</p>
                <code className="text-[10.5px] text-[#334155] f-mono">{src}</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
