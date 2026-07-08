"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
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
        ? "bg-[#04060d]/88 backdrop-blur-2xl border-b border-white/8 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.22)]"
        : "bg-transparent py-5"
    }`}>
      <div className="section-container flex items-center justify-between">

        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60">
          <span className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-transform group-hover:-translate-y-0.5">
            <Image
            src="/openingest.png"
            alt="OpenIngest logo"
              width={32}
              height={32}
              priority
              className="h-8 w-8 object-contain"
          />
          </span>
          <span className="f-head font-bold text-[16px] text-white">OpenIngest</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 rounded-2xl border border-white/7 bg-white/[0.03] p-1">
          {NAV.map(l => (
            <a key={l.label} href={l.href}
              className="text-[13px] text-[#94A3B8] hover:text-white transition-colors px-3.5 py-2 rounded-xl hover:bg-white/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50">
              {l.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2">
          <a href="https://github.com/manishkudtarkar/OpenIngest"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[13px] text-[#94A3B8] hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-white/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50">
            <GithubIcon size={15} />
            <span>GitHub</span>
          </a>
          <a href="#install"
            className="relative flex items-center gap-1.5 text-[13px] font-semibold text-[#041016] px-4 py-2 rounded-xl overflow-hidden bg-cyan-300 transition-all hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70">
            <span>Get Started</span>
            <ArrowRight size={14} />
          </a>
        </div>

        <button
          className="md:hidden text-[#94A3B8] hover:text-white p-2 rounded-xl border border-white/8 bg-white/4"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden mx-4 mt-3 rounded-2xl border border-white/8 bg-[#070b14]/96 backdrop-blur-2xl p-3 shadow-2xl">
          {NAV.map(l => (
            <a key={l.label} href={l.href}
              className="block text-[#94A3B8] hover:text-white text-sm py-3 px-3 rounded-xl hover:bg-white/6 transition-colors"
              onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <a href="#install"
            className="mt-2 flex items-center justify-center gap-2 text-sm font-semibold text-[#041016] bg-cyan-300 px-4 py-3 rounded-xl"
            onClick={() => setOpen(false)}>Get Started</a>
        </div>
      )}
    </nav>
  );
}
