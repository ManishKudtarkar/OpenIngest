"use client";
import { useState } from "react";
import { ArrowRight, Copy, Check } from "lucide-react";
import GithubIcon from "./GithubIcon";

export default function CTA() {
  const [copied, setCopied] = useState(false);
  const cmd = 'pip install openingest';

  const copy = () => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="install" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[#04060d]" />
      {/* Big central glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[400px] bg-indigo-600/8 rounded-full blur-[120px]" />
      </div>
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

      <div className="section-container text-center">
        <div className="max-w-[720px] mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 tag text-indigo-400 border-indigo-500/20 bg-indigo-500/8 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Open Source · MIT · No vendor lock-in
        </div>

        <h2 className="f-head text-[44px] md:text-[58px] font-bold text-white leading-[1.05] tracking-[-0.03em] mb-6">
          Ship your first pipeline{" "}
          <span className="g-text">in minutes.</span>
        </h2>
        <p className="text-[#94A3B8] text-[16px] mb-10 leading-relaxed max-w-lg mx-auto">
          Install from PyPI, run <code className="text-[#A5B4FC] f-mono text-[14px]">openingest init</code>, and your first pipeline
          completes in seconds. No cloud account. No API key. No credit card.
        </p>

        {/* Install command */}
        <div className="flex justify-center mb-8">
          <button onClick={copy}
            className="flex items-center gap-3 panel-glow rounded-xl px-5 py-3 border border-white/8 hover:border-indigo-500/30 transition-all group">
            <span className="text-[#334155] f-mono text-[13px]">$</span>
            <code className="text-[#A5B4FC] f-mono text-[13px]">{cmd}</code>
            <span className="text-[#334155] group-hover:text-[#64748B] transition-colors">
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="https://github.com/manishkudtarkar/OpenIngest/blob/main/docs/GETTING_STARTED.md"
            target="_blank" rel="noopener noreferrer"
            className="relative flex items-center justify-center gap-2 font-semibold text-white text-[14px] px-8 py-4 rounded-xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 transition-all group-hover:from-indigo-500 group-hover:to-violet-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 blur-xl opacity-0 group-hover:opacity-40 transition-opacity" />
            <span className="relative">Read Getting Started</span>
            <ArrowRight size={15} className="relative group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a href="https://github.com/manishkudtarkar/OpenIngest"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 font-semibold text-[#94A3B8] hover:text-white text-[14px] px-8 py-4 rounded-xl border border-white/8 hover:border-white/15 bg-white/3 hover:bg-white/5 transition-all">
            <GithubIcon size={16} />
            Star on GitHub
          </a>
        </div>

        <p className="text-[12px] text-[#1E293B] mt-8">
          ⭐ Starring the repo helps others discover OpenIngest
        </p>
        </div>
      </div>
    </section>
  );
}
