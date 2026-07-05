"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import GithubIcon from "./GithubIcon";

const NAV = [
  { label: "Features",    href: "#features" },
  { label: "How It Works",href: "#architecture" },
  { label: "Connectors",  href: "#connectors" },
  { label: "CLI",         href: "#cli" },
  { label: "Roadmap",     href: "#roadmap" },
  { label: "Docs",        href: "#docs" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
      scrolled
        ? "bg-[#04060d]/80 backdrop-blur-2xl border-b border-white/5 py-3"
        : "bg-transparent py-5"
    }`}>
      <div className="max-w-[1380px] mx-auto px-6 lg:px-12 flex items-center justify-between">

        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
            <svg className="relative w-8 h-8 p-1.5" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L3 6v8l7 4 7-4V6L10 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M10 2v14M3 6l7 4 7-4" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="f-head font-bold text-[15px] tracking-tight text-white">OpenIngest</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV.map(l => (
            <a key={l.label} href={l.href}
              className="text-[13px] text-[#94A3B8] hover:text-white transition-colors px-3.5 py-2 rounded-lg hover:bg-white/4">
              {l.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2">
          <a href="https://github.com/manishkudtarkar/OpenIngest"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[13px] text-[#94A3B8] hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/4">
            <GithubIcon size={15} />
            <span>GitHub</span>
          </a>
          <a href="#install"
            className="relative text-[13px] font-semibold text-white px-4 py-2 rounded-lg overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 transition-all group-hover:from-indigo-500 group-hover:to-violet-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
            <span className="relative">Get Started</span>
          </a>
        </div>

        <button className="md:hidden text-[#94A3B8] hover:text-white p-2" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/5 bg-[#04060d]/95 backdrop-blur-2xl px-5 py-4 flex flex-col gap-1">
          {NAV.map(l => (
            <a key={l.label} href={l.href}
              className="text-[#94A3B8] hover:text-white text-sm py-2.5 px-3 rounded-lg hover:bg-white/4 transition-colors"
              onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <a href="#install"
            className="mt-2 text-center text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 rounded-lg"
            onClick={() => setOpen(false)}>Get Started</a>
        </div>
      )}
    </nav>
  );
}
