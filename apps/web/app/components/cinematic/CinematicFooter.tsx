import Image from "next/image";
import GithubIcon from "../GithubIcon";

const LINKS = [
  { label: "GitHub",          href: "https://github.com/manishkudtarkar/OpenIngest" },
  { label: "Getting Started", href: "https://github.com/manishkudtarkar/OpenIngest/blob/main/docs/GETTING_STARTED.md" },
  { label: "CLI Reference",   href: "https://github.com/manishkudtarkar/OpenIngest/blob/main/docs/CLI_REFERENCE.md" },
  { label: "Connectors",      href: "https://github.com/manishkudtarkar/OpenIngest/blob/main/docs/CONNECTORS.md" },
  { label: "Issues",          href: "https://github.com/manishkudtarkar/OpenIngest/issues" },
  { label: "Releases",        href: "https://github.com/manishkudtarkar/OpenIngest/releases" },
  { label: "PyPI",            href: "https://pypi.org/project/openingest/" },
  { label: "License",         href: "https://github.com/manishkudtarkar/OpenIngest/blob/main/LICENSE" },
];

export default function CinematicFooter() {
  return (
    <footer className="relative border-t border-white/5 bg-[#030507] py-16">
      {/* top line glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/15 to-transparent" />

      <div className="wrap">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/8 bg-white/4">
                <Image src="/openingest.png" alt="OpenIngest" width={26} height={26} className="h-6.5 w-6.5 object-contain" />
              </span>
              <span className="f-head font-bold text-white text-[15px]">OpenIngest</span>
            </div>
            <p className="text-[13px] text-[#334155] leading-relaxed max-w-[240px] mb-5">
              Configuration-driven data ingestion.<br/>
              YAML in, clean data out.
            </p>
            <a
              href="https://github.com/manishkudtarkar/OpenIngest"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex text-[#334155] hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <GithubIcon size={18} />
            </a>
          </div>

          {/* links */}
          <div>
            <h4 className="text-[10px] text-[#334155] uppercase tracking-widest font-semibold mb-5">Links</h4>
            <div className="grid grid-cols-2 gap-2">
              {LINKS.map(l => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank" rel="noopener noreferrer"
                  className="text-[12.5px] text-[#334155] hover:text-white transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* stack */}
          <div>
            <h4 className="text-[10px] text-[#334155] uppercase tracking-widest font-semibold mb-5">Stack</h4>
            <div className="flex flex-wrap gap-1.5">
              {["Python 3.12", "PostgreSQL 15", "Airflow 2.9", "Docker", "Pandas", "SQLAlchemy", "Ruff", "Mypy", "Pytest"].map(t => (
                <span key={t} className="text-[10.5px] f-mono text-[#475569] bg-white/3 border border-white/5 px-2 py-0.5 rounded-md">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/4 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[11.5px] text-[#1E293B]">
            © 2026 OpenIngest · MIT License · Built for modern data engineering
          </p>
          <p className="text-[11.5px] text-[#1E293B] f-mono">v3.0.5</p>
        </div>
      </div>
    </footer>
  );
}
