const STACK = [
  { emoji: "🐍", label: "Python 3.12" },
  { emoji: "🐘", label: "PostgreSQL 15" },
  { emoji: "🌀", label: "Airflow 2.9" },
  { emoji: "🐳", label: "Docker" },
  { emoji: "🐼", label: "Pandas" },
  { emoji: "🔗", label: "SQLAlchemy" },
  { emoji: "⚙️", label: "GitHub Actions" },
  { emoji: "✅", label: "Pytest" },
  { emoji: "🔍", label: "Ruff + Mypy" },
];

export default function TrustedBy() {
  return (
    <section className="relative py-12 border-y border-white/5">
      <div className="absolute inset-0 bg-gradient-to-r from-[#04060d] via-indigo-950/10 to-[#04060d]" />
      <div className="relative max-w-[1380px] mx-auto px-6 lg:px-12">
        <p className="text-center text-[11px] text-[#334155] uppercase tracking-[0.25em] font-semibold mb-8">
          Powered by the modern open-source data stack
        </p>
        <div className="flex flex-wrap items-center justify-center gap-5 md:gap-8">
          {STACK.map(({ emoji, label }) => (
            <div key={label}
              className="flex items-center gap-2 text-[#475569] hover:text-[#94A3B8] transition-colors group cursor-default">
              <span className="text-base group-hover:scale-110 transition-transform">{emoji}</span>
              <span className="text-[13px] font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
