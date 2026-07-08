import Image from "next/image";
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
    <footer className="relative border-t border-white/7 bg-[#04060d] py-14">
      <div className="section-container">
        <div className="grid md:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
                <Image src="/openingest.png" alt="OpenIngest logo" width={28} height={28} className="h-7 w-7 object-contain" />
              </span>
              <span className="f-head font-bold text-white">OpenIngest</span>
            </div>
            <p className="text-[13px] text-[#64748B] leading-relaxed max-w-[260px]">
              Configuration-driven data ingestion. YAML in, clean data out.
            </p>
            <a href="https://github.com/manishkudtarkar/OpenIngest"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex mt-4 text-[#64748B] hover:text-white transition-colors" aria-label="GitHub">
              <GithubIcon size={18} />
            </a>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[11px] text-[#64748B] uppercase font-semibold mb-4">Links</h4>
            <div className="space-y-2.5">
              {LINKS.map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                  className="block text-[13px] text-[#64748B] hover:text-white transition-colors">
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Stack */}
          <div>
            <h4 className="text-[11px] text-[#64748B] uppercase font-semibold mb-4">Stack</h4>
            <div className="flex flex-wrap gap-1.5">
              {["Python 3.12","PostgreSQL 15","Airflow 2.9","Docker","Pandas","SQLAlchemy","Ruff","Mypy","Pytest"].map(t => (
                <span key={t} className="text-[11px] f-mono text-[#94A3B8] bg-white/4 border border-white/7 px-2 py-0.5 rounded-md">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/4 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-[#475569]">© 2026 OpenIngest · MIT License · Built for modern data engineering</p>
          <p className="text-[12px] text-[#475569] f-mono">v2.0.0</p>
        </div>
      </div>
    </footer>
  );
}
