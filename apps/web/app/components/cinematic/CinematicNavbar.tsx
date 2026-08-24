"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import GithubIcon from "../GithubIcon";

const NAV = [
  { label: "Manifesto",  href: "#manifesto"  },
  { label: "Pipeline",   href: "#pipeline"   },
  { label: "Connectors", href: "#connectors" },
  { label: "Transforms", href: "#transforms" },
  { label: "CLI",        href: "#cli"        },
  { label: "Install",    href: "#install"    },
];

export default function CinematicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ${
        scrolled
          ? "bg-[#030507]/90 backdrop-blur-2xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="wrap flex items-center justify-between py-4">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group" aria-label="OpenIngest home">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl border border-white/8 bg-white/4 transition-transform group-hover:-translate-y-0.5">
            <Image src="/openingest.png" alt="OpenIngest" width={28} height={28} priority className="h-7 w-7 object-contain" />
          </span>
          <span className="f-head font-bold text-[15px] text-white tracking-tight">OpenIngest</span>
        </a>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV.map(l => (
            <a
              key={l.label}
              href={l.href}
              className="text-[12.5px] text-[#64748B] hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/4 tracking-wide"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden lg:flex items-center gap-2">
          <a
            href="https://github.com/manishkudtarkar/OpenIngest"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[12.5px] text-[#64748B] hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/4"
          >
            <GithubIcon size={14} />
            <span>GitHub</span>
          </a>
          <a
            href="#install"
            className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#030507] bg-cyan-300 hover:bg-white px-4 py-2 rounded-xl transition-all"
          >
            pip install
            <ArrowUpRight size={12} />
          </a>
        </div>

        {/* Mobile burger */}
        <button
          className="lg:hidden text-[#64748B] hover:text-white p-2 rounded-lg border border-white/6 bg-white/3 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden mx-4 mb-4 rounded-2xl border border-white/6 bg-[#080b10]/96 backdrop-blur-2xl p-3">
          {NAV.map(l => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-[#94A3B8] hover:text-white text-sm py-3 px-3 rounded-xl hover:bg-white/4 transition-colors tracking-wide"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#install"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 text-sm font-semibold text-[#030507] bg-cyan-300 px-4 py-3 rounded-xl"
          >
            pip install openingest
          </a>
        </div>
      )}
    </nav>
  );
}
