import {
  Boxes,
  CheckCircle2,
  Container,
  Database,
  GitBranch,
  Layers3,
  Sparkles,
  TerminalSquare,
  Workflow,
} from "lucide-react";

const STACK = [
  { icon: TerminalSquare, label: "Python 3.12" },
  { icon: Database, label: "PostgreSQL 15" },
  { icon: Workflow, label: "Airflow 2.9" },
  { icon: Container, label: "Docker" },
  { icon: Layers3, label: "Pandas" },
  { icon: Boxes, label: "SQLAlchemy" },
  { icon: GitBranch, label: "GitHub Actions" },
  { icon: CheckCircle2, label: "Pytest" },
  { icon: Sparkles, label: "Ruff + Mypy" },
];

export default function TrustedBy() {
  return (
    <section className="relative border-y border-white/6 bg-[#04060d] py-10">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.05),transparent)]" />
      <div className="relative max-w-[1380px] mx-auto px-5 sm:px-6 lg:px-12">
        <p className="text-center text-[11px] text-[#64748B] uppercase font-semibold mb-7">
          Built on the modern open-source data stack
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
          {STACK.map(({ icon: Icon, label }) => (
            <div key={label}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/7 bg-white/[0.025] px-3 text-[#94A3B8] transition-colors hover:border-cyan-300/20 hover:text-white">
              <Icon size={15} className="text-cyan-300/80" />
              <span className="text-[12px] font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
