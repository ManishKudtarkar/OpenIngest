"use client";
import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight, Star, ExternalLink, Package } from "lucide-react";
import GithubIcon from "../GithubIcon";

/* ── Data ── */
const LINKS = {
  Documentation: [
    { label: "Getting Started",  href: "https://github.com/manishkudtarkar/OpenIngest/blob/main/docs/GETTING_STARTED.md" },
    { label: "CLI Reference",    href: "https://github.com/manishkudtarkar/OpenIngest/blob/main/docs/CLI_REFERENCE.md" },
    { label: "Connectors Guide", href: "https://github.com/manishkudtarkar/OpenIngest/blob/main/docs/CONNECTORS.md" },
    { label: "Transformations",  href: "https://github.com/manishkudtarkar/OpenIngest/blob/main/README.md#transformations" },
  ],
  Project: [
    { label: "GitHub",           href: "https://github.com/manishkudtarkar/OpenIngest" },
    { label: "PyPI",             href: "https://pypi.org/project/openingest/" },
    { label: "Issues",           href: "https://github.com/manishkudtarkar/OpenIngest/issues" },
    { label: "Releases",         href: "https://github.com/manishkudtarkar/OpenIngest/releases" },
    { label: "License",          href: "https://github.com/manishkudtarkar/OpenIngest/blob/main/LICENSE" },
  ],
};

const STACK = [
  "Python 3.12", "PostgreSQL 15", "Apache Airflow 2.9",
  "Docker", "Pandas", "SQLAlchemy", "Ruff", "Mypy", "Pytest",
];

const MILESTONES = [
  { v: "v1.0", label: "Discovery, validation, quality, CLI, Airflow, CI",  done: true  },
  { v: "v2.0", label: "Excel, JSON, Parquet, S3, Azure, GCS, REST API",    done: true  },
  { v: "v2.5", label: "Built-in scheduler, Slack/email notifications",      done: true  },
  { v: "v3.0", label: "9 new connectors, transformation engine, 93 tests", done: true  },
  { v: "v3.0.5", label: "PyPI stable · pip install openingest",             done: true  },
  { v: "v4.0", label: "Web dashboard, RBAC, Snowflake / BigQuery",          done: false },
];

const BADGES = [
  { label: "MIT License",   color: "#10B981", bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.20)" },
  { label: "93 Tests",      color: "#6366F1", bg: "rgba(99,102,241,0.10)", border: "rgba(99,102,241,0.20)" },
  { label: "17 Connectors", color: "#22D3EE", bg: "rgba(34,211,238,0.10)", border: "rgba(34,211,238,0.20)" },
  { label: "v3.0.5",        color: "#F59E0B", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.20)" },
];

/* ── Mini link component ── */
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.3rem",
        color: "#475569",
        fontSize: 13,
        lineHeight: 1,
        textDecoration: "none",
        transition: "color 0.2s",
        padding: "0.3rem 0",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#CBD5E1"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#475569"; }}
    >
      {children}
    </a>
  );
}

export default function CinematicFooter() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText("pip install openingest");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer style={{ position: "relative", background: "#02030a", overflow: "hidden" }}>

      {/* ── Top separator glow ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.40) 30%, rgba(34,211,238,0.30) 70%, transparent 100%)",
      }} />

      {/* ── Background decoration ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.07) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: "linear-gradient(rgba(99,102,241,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.025) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        pointerEvents: "none",
      }} />

      {/* ── Big watermark ── */}
      <div style={{
        position: "absolute",
        bottom: -20,
        left: "50%",
        transform: "translateX(-50%)",
        fontFamily: "Space Grotesk, sans-serif",
        fontWeight: 900,
        fontSize: "clamp(80px, 18vw, 200px)",
        letterSpacing: "-0.06em",
        color: "transparent",
        WebkitTextStroke: "1px rgba(99,102,241,0.05)",
        whiteSpace: "nowrap",
        userSelect: "none",
        pointerEvents: "none",
        lineHeight: 1,
      }}>
        OpenIngest
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{
        position: "relative", zIndex: 10,
        width: "100%", maxWidth: 1440,
        marginLeft: "auto", marginRight: "auto",
        paddingLeft: "clamp(1.25rem, 4.5vw, 5.5rem)",
        paddingRight: "clamp(1.25rem, 4.5vw, 5.5rem)",
        paddingTop: "clamp(4rem, 7vw, 6rem)",
        paddingBottom: "2rem",
      }}>

        {/* ── CTA strip ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "2rem",
          alignItems: "center",
          padding: "2.5rem 3rem",
          borderRadius: "1.5rem",
          background: "rgba(10,13,22,0.70)",
          border: "1px solid rgba(99,102,241,0.18)",
          boxShadow: "0 0 80px rgba(99,102,241,0.07), inset 0 1px 0 rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          marginBottom: "clamp(3rem, 5vw, 5rem)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* accent line */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.50), rgba(34,211,238,0.40), transparent)" }} />

          <div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "clamp(1.5rem, 3vw, 2.25rem)", letterSpacing: "-0.04em", color: "#F1F5F9", marginBottom: "0.5rem" }}>
              Start ingesting data today.
            </div>
            <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.7, maxWidth: 500 }}>
              Open source. MIT licensed. No cloud account, no API key, no credit card. Just YAML.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-end", flexShrink: 0 }}>
            {/* Copy pip install */}
            <button
              onClick={copy}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.875rem 1.5rem",
                borderRadius: "0.875rem",
                background: "rgba(2,3,10,0.80)",
                border: "1px solid rgba(99,102,241,0.25)",
                cursor: "pointer",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.5)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(99,102,241,0.12)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.25)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
            >
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "#818CF8" }}>
                $ pip install openingest
              </span>
              <span style={{
                fontSize: 10.5, fontWeight: 600,
                color: copied ? "#10B981" : "#334155",
                padding: "2px 8px",
                borderRadius: 6,
                background: copied ? "rgba(16,185,129,0.10)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${copied ? "rgba(16,185,129,0.20)" : "rgba(255,255,255,0.06)"}`,
                transition: "all 0.2s",
                minWidth: 44,
                textAlign: "center",
              }}>
                {copied ? "✓ copied" : "copy"}
              </span>
            </button>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <a
                href="https://github.com/manishkudtarkar/OpenIngest/blob/main/docs/GETTING_STARTED.md"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: "0.35rem",
                  fontSize: 12.5, fontWeight: 700, color: "#020c10",
                  padding: "0.6rem 1.25rem",
                  borderRadius: "0.75rem",
                  background: "linear-gradient(135deg, #22D3EE, #67E8F9)",
                  boxShadow: "0 0 24px rgba(34,211,238,0.25)",
                  textDecoration: "none",
                  transition: "filter 0.2s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = "brightness(1.1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = ""; }}
              >
                Read the docs <ArrowUpRight size={12} />
              </a>
              <a
                href="https://github.com/manishkudtarkar/OpenIngest"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: "0.35rem",
                  fontSize: 12.5, fontWeight: 600, color: "#94A3B8",
                  padding: "0.6rem 1.25rem",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                  textDecoration: "none",
                  transition: "color 0.2s, background 0.2s",
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#fff"; el.style.background = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#94A3B8"; el.style.background = "rgba(255,255,255,0.04)"; }}
              >
                <GithubIcon size={14} />
                <Star size={12} style={{ color: "#F59E0B", fill: "#F59E0B" }} />
                Star
              </a>
            </div>
          </div>
        </div>

        {/* ── Main footer grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1.5fr",
          gap: "clamp(2rem, 4vw, 4rem)",
          marginBottom: "clamp(3rem, 5vw, 4rem)",
        }}>

          {/* Brand column */}
          <div>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1rem" }}>
              <span style={{
                width: 38, height: 38,
                borderRadius: "0.75rem",
                border: "1px solid rgba(255,255,255,0.09)",
                background: "rgba(255,255,255,0.05)",
                display: "grid", placeItems: "center",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
              }}>
                <Image src="/openingest.png" alt="OpenIngest" width={26} height={26} style={{ width: 26, height: 26, objectFit: "contain" }} />
              </span>
              <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 16, color: "#F1F5F9", letterSpacing: "-0.02em" }}>
                OpenIngest
              </span>
            </div>

            <p style={{ color: "#334155", fontSize: 13.5, lineHeight: 1.75, maxWidth: 280, marginBottom: "1.5rem" }}>
              Configuration-driven data ingestion framework. Register a dataset in YAML — discovery, quality, transforms, and PostgreSQL loading handled automatically.
            </p>

            {/* Badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.5rem" }}>
              {BADGES.map(b => (
                <span key={b.label} style={{
                  fontSize: 10.5, fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 99,
                  border: `1px solid ${b.border}`,
                  background: b.bg,
                  color: b.color,
                  letterSpacing: "0.02em",
                }}>
                  {b.label}
                </span>
              ))}
            </div>

            {/* Social row */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <a href="https://github.com/manishkudtarkar/OpenIngest" target="_blank" rel="noopener noreferrer"
                style={{
                  width: 34, height: 34, borderRadius: "0.625rem",
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.03)",
                  display: "grid", placeItems: "center",
                  color: "#475569", textDecoration: "none",
                  transition: "color 0.2s, background 0.2s, border-color 0.2s",
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#F1F5F9"; el.style.background = "rgba(255,255,255,0.07)"; el.style.borderColor = "rgba(255,255,255,0.14)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#475569"; el.style.background = "rgba(255,255,255,0.03)"; el.style.borderColor = "rgba(255,255,255,0.07)"; }}
                aria-label="GitHub"
              >
                <GithubIcon size={15} />
              </a>
              <a href="https://pypi.org/project/openingest/" target="_blank" rel="noopener noreferrer"
                style={{
                  width: 34, height: 34, borderRadius: "0.625rem",
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.03)",
                  display: "grid", placeItems: "center",
                  color: "#475569", textDecoration: "none",
                  transition: "color 0.2s, background 0.2s, border-color 0.2s",
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#F59E0B"; el.style.background = "rgba(245,158,11,0.08)"; el.style.borderColor = "rgba(245,158,11,0.20)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#475569"; el.style.background = "rgba(255,255,255,0.03)"; el.style.borderColor = "rgba(255,255,255,0.07)"; }}
                aria-label="PyPI"
              >
                <Package size={15} />
              </a>
            </div>
          </div>

          {/* Docs links */}
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "1.25rem" }}>
              Documentation
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {LINKS.Documentation.map(l => (
                <FooterLink key={l.label} href={l.href}>
                  {l.label}
                  <ExternalLink size={10} style={{ opacity: 0.4, flexShrink: 0 }} />
                </FooterLink>
              ))}
            </div>
          </div>

          {/* Project links */}
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "1.25rem" }}>
              Project
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {LINKS.Project.map(l => (
                <FooterLink key={l.label} href={l.href}>
                  {l.label}
                  <ExternalLink size={10} style={{ opacity: 0.4, flexShrink: 0 }} />
                </FooterLink>
              ))}
            </div>
          </div>

          {/* Stack + milestones */}
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "1.25rem" }}>
              Stack
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.75rem" }}>
              {STACK.map(t => (
                <span key={t} style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 10.5,
                  color: "#475569",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  padding: "3px 9px",
                  borderRadius: "0.4rem",
                }}>
                  {t}
                </span>
              ))}
            </div>

            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "1rem" }}>
              Milestones
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              {MILESTONES.map(m => (
                <div key={m.v} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                  <span style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    color: m.done ? "#6366F1" : "#1E293B",
                    background: m.done ? "rgba(99,102,241,0.10)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${m.done ? "rgba(99,102,241,0.22)" : "rgba(255,255,255,0.05)"}`,
                    padding: "2px 7px",
                    borderRadius: "0.35rem",
                    flexShrink: 0,
                    marginTop: 1,
                  }}>
                    {m.v}
                  </span>
                  <span style={{ fontSize: 11.5, color: m.done ? "#475569" : "#1E293B", lineHeight: 1.5 }}>
                    {m.done ? "✓ " : "○ "}{m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          paddingTop: "1.5rem",
          paddingBottom: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "#1E293B" }}>
              © 2026 OpenIngest · MIT License
            </span>
            <span style={{ fontSize: 12, color: "#1E293B" }}>
              Built for modern data engineering
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* Live indicators */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block", animation: "pulse-ring 2.2s ease-out infinite" }} />
              <span style={{ fontSize: 11, color: "#1E293B", fontFamily: "JetBrains Mono, monospace" }}>PyPI live</span>
            </div>
            <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.06)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366F1", display: "inline-block" }} />
              <span style={{ fontSize: 11, color: "#1E293B", fontFamily: "JetBrains Mono, monospace" }}>CI passing</span>
            </div>
            <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.06)" }} />
            <span style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 11.5,
              fontWeight: 700,
              color: "#334155",
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.15)",
              padding: "2px 10px",
              borderRadius: "0.375rem",
            }}>
              v3.0.5
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
