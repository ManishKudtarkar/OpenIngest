import GithubIcon from "./GithubIcon";

const LINKS = [
  { label: "GitHub",          href: "https://github.com/manishkudtarkar/OpenIngest" },
  { label: "Getting Started", href: "https://github.com/manishkudtarkar/OpenIngest/blob/main/docs/GETTING_STARTED.md" },
  { label: "Issues",          href: "https://github.com/manishkudtarkar/OpenIngest/issues" },
  { label: "Releases",        href: "https://github.com/manishkudtarkar/OpenIngest/releases" },
  { label: "CI Status",       href: "https://github.com/manishkudtarkar/OpenIngest/actions" },
  { label: "License",         href: "https://github.com/manishkudtarkar/OpenIngest/blob/main/LICENSE" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-[#04060d] py-14">
      <div className="max-w-[1380px] mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="relative w-7 h-7">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600" />
                <svg className="relative w-7 h-7 p-1.5" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L3 6v8l7 4 7-4V6L10 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M10 2v14M3 6l7 4 7-4" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="f-head font-bold text-white">OpenIngest</span>
            </div>
            <p className="text-[13px] text-[#334155] leading-relaxed max-w-[220px]">
              Configuration-driven data ingestion. YAML in, clean data out.
            </p>
            <a href="https://github.com/manishkudtarkar/OpenIngest"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex mt-4 text-[#334155] hover:text-white transition-colors" aria-label="GitHub">
              <GithubIcon size={18} />
            </a>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[11px] text-[#1E293B] uppercase tracking-[0.15em] font-semibold mb-4">Links</h4>
            <div className="space-y-2.5">
              {LINKS.map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                  className="block text-[13px] text-[#334155] hover:text-[#94A3B8] transition-colors">
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Stack */}
          <div>
            <h4 className="text-[11px] text-[#1E293B] uppercase tracking-[0.15em] font-semibold mb-4">Stack</h4>
            <div className="flex flex-wrap gap-1.5">
              {["Python 3.12","PostgreSQL 15","Airflow 2.9","Docker","Pandas","SQLAlchemy","Ruff","Mypy","Pytest"].map(t => (
                <span key={t} className="text-[11px] f-mono text-[#1E293B] bg-white/3 border border-white/5 px-2 py-0.5 rounded-md">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/4 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-[#1E293B]">© 2026 OpenIngest · MIT License · Built for Modern Data Engineering</p>
          <p className="text-[12px] text-[#1E293B] f-mono">v1.0.0</p>
        </div>
      </div>
    </footer>
  );
}
