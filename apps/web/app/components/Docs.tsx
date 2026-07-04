import { Download, Zap, BookOpen, TerminalSquare, Settings, Wind, Users, Code2 } from "lucide-react";

const DOCS = [
  { icon: Download,       title: "Installation",   desc: "pip install and CLI setup in under 2 minutes.",                 href: "#getting-started", c: "#10B981" },
  { icon: Zap,            title: "Quick Start",    desc: "Clone → .env → docker compose up → openingest run.",           href: "#getting-started", c: "#F59E0B" },
  { icon: BookOpen,       title: "Architecture",   desc: "Discovery → validation → quality → load → Airflow → monitor.", href: "#architecture",    c: "#6366F1" },
  { icon: TerminalSquare, title: "CLI Reference",  desc: "run · validate · quality · report · history · dashboard.",     href: "#cli",             c: "#22D3EE" },
  { icon: Settings,       title: "Configuration",  desc: "datasets.yaml · pipeline.yaml · validation_rules.yaml.",       href: "#features",        c: "#F97316" },
  { icon: Wind,           title: "Airflow Guide",  desc: "Dynamic task groups, @daily schedule, Airflow UI walkthrough.", href: "#architecture",    c: "#14B8A6" },
  { icon: Users,          title: "Contributing",   desc: "Fork, branch, pytest, PR. All contributions welcome.",         href: "https://github.com/manishkudtarkar/OpenIngest", c: "#A855F7" },
  { icon: Code2,          title: "API Reference",  desc: "core/, utils/, models/ — fully typed with Mypy.",              href: "https://github.com/manishkudtarkar/OpenIngest", c: "#EC4899" },
];

export default function Docs() {
  return (
    <section id="docs" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[#080c18]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="relative max-w-[1380px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 tag text-cyan-400 border-cyan-500/25 bg-cyan-500/8 mb-5">
            Documentation
          </div>
          <h2 className="f-head text-[42px] md:text-[52px] font-bold text-white leading-[1.1] tracking-[-0.025em] mb-4">
            Everything documented.
          </h2>
          <p className="text-[#94A3B8] text-[16px]">Production in one afternoon.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DOCS.map(({ icon: Icon, title, desc, href, c }) => (
            <a key={title} href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="panel rounded-2xl p-5 hover:border-white/10 transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden block">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `radial-gradient(circle at 50% 0%, ${c}08 0%, transparent 60%)` }} />
              <div className="relative">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${c}15`, border: `1px solid ${c}25` }}>
                  <Icon size={15} style={{ color: c }} />
                </div>
                <h3 className="f-head font-semibold text-[#CBD5E1] text-[13px] mb-1.5 group-hover:text-white transition-colors">{title}</h3>
                <p className="text-[#334155] text-[12px] leading-relaxed group-hover:text-[#475569] transition-colors">{desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
