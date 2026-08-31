"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ArrowUpRight, Menu, X, Star } from "lucide-react";
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
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });

    // Track active section via IntersectionObserver
    const sections = NAV.map(n => document.querySelector(n.href) as HTMLElement).filter(Boolean);
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive("#" + entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach(s => observer.observe(s));

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* ── Top announcement bar ── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 60,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          background: "linear-gradient(90deg, rgba(99,102,241,0.12) 0%, rgba(34,211,238,0.08) 50%, rgba(99,102,241,0.12) 100%)",
          borderBottom: "1px solid rgba(99,102,241,0.12)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <span style={{
          display: "flex", alignItems: "center", gap: "0.4rem",
          fontSize: 11.5, fontWeight: 600, color: "#94A3B8",
          letterSpacing: "0.04em",
        }}>
          <span style={{
            background: "linear-gradient(90deg, #818CF8, #22D3EE)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontWeight: 700,
          }}>
            v3.0.5 is live
          </span>
          <span style={{ color: "#334155" }}>·</span>
          <span>17 connectors · YAML transforms · 93 tests</span>
          <span style={{ color: "#334155" }}>·</span>
          <a
            href="https://pypi.org/project/openingest/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#22D3EE",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              fontWeight: 600,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#67E8F9")}
            onMouseLeave={e => (e.currentTarget.style.color = "#22D3EE")}
          >
            pip install openingest <ArrowUpRight size={11} />
          </a>
        </span>
      </div>

      {/* ── Main navbar ── */}
      <nav
        style={{
          position: "fixed",
          top: 36,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: "0.625rem 0",
          transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          background: scrolled
            ? "rgba(2, 3, 10, 0.72)"
            : "transparent",
          backdropFilter: scrolled ? "blur(32px) saturate(180%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(32px) saturate(180%)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.055)"
            : "1px solid transparent",
          boxShadow: scrolled
            ? "0 1px 40px rgba(0,0,0,0.35), inset 0 -1px 0 rgba(255,255,255,0.03)"
            : "none",
        }}
      >
        {/* Subtle indigo glow under nav when scrolled */}
        {scrolled && (
          <div style={{
            position: "absolute",
            bottom: -1,
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.35), transparent)",
            pointerEvents: "none",
          }} />
        )}

        <div
          style={{
            width: "100%",
            maxWidth: 1200,
            marginLeft: "auto",
            marginRight: "auto",
            paddingLeft: "clamp(1.25rem, 4vw, 3.5rem)",
            paddingRight: "clamp(1.25rem, 4vw, 3.5rem)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          {/* ── Logo ── */}
          <a
            href="#"
            aria-label="OpenIngest home"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <span style={{
              width: 36,
              height: 36,
              borderRadius: "0.625rem",
              border: "1px solid rgba(255,255,255,0.09)",
              background: "rgba(255,255,255,0.05)",
              display: "grid",
              placeItems: "center",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
              flexShrink: 0,
              transition: "transform 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "")}
            >
              <Image
                src="/openingest.png"
                alt="OpenIngest"
                width={24}
                height={24}
                priority
                style={{ width: 24, height: 24, objectFit: "contain" }}
              />
            </span>
            <span style={{
              fontFamily: "Space Grotesk, system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: "#F1F5F9",
              letterSpacing: "-0.02em",
            }}>
              OpenIngest
            </span>
          </a>

          {/* ── Desktop nav links — glassmorphism pill ── */}
          <div
            className="hidden lg:flex"
            style={{
              alignItems: "center",
              gap: "0.125rem",
              padding: "0.3rem",
              borderRadius: "0.875rem",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            {NAV.map(l => {
              const isActive = active === l.href;
              return (
                <a
                  key={l.label}
                  href={l.href}
                  style={{
                    fontSize: 12.5,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#F1F5F9" : "#64748B",
                    padding: "0.45rem 0.875rem",
                    borderRadius: "0.625rem",
                    textDecoration: "none",
                    letterSpacing: "0.01em",
                    transition: "color 0.2s, background 0.2s",
                    background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
                    position: "relative",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = "#CBD5E1";
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = "#64748B";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }
                  }}
                >
                  {l.label}
                  {isActive && (
                    <span style={{
                      position: "absolute",
                      bottom: 4,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 16,
                      height: 1.5,
                      borderRadius: 99,
                      background: "linear-gradient(90deg, #6366F1, #22D3EE)",
                    }} />
                  )}
                </a>
              );
            })}
          </div>

          {/* ── Right actions ── */}
          <div className="hidden lg:flex" style={{ alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
            {/* GitHub */}
            <a
              href="https://github.com/manishkudtarkar/OpenIngest"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: 12.5,
                color: "#64748B",
                textDecoration: "none",
                padding: "0.45rem 0.875rem",
                borderRadius: "0.75rem",
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.03)",
                transition: "color 0.2s, background 0.2s, border-color 0.2s",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = "#F1F5F9";
                el.style.background = "rgba(255,255,255,0.07)";
                el.style.borderColor = "rgba(255,255,255,0.12)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = "#64748B";
                el.style.background = "rgba(255,255,255,0.03)";
                el.style.borderColor = "rgba(255,255,255,0.07)";
              }}
            >
              <GithubIcon size={14} />
              <span>GitHub</span>
              <Star size={11} style={{ color: "#F59E0B", fill: "#F59E0B", marginLeft: 1 }} />
            </a>

            {/* CTA — pip install */}
            <a
              href="#install"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: 12.5,
                fontWeight: 700,
                color: "#020c10",
                textDecoration: "none",
                padding: "0.5rem 1.125rem",
                borderRadius: "0.75rem",
                background: "linear-gradient(135deg, #22D3EE 0%, #67E8F9 100%)",
                boxShadow: "0 0 30px rgba(34,211,238,0.25), inset 0 1px 0 rgba(255,255,255,0.35)",
                transition: "filter 0.2s, box-shadow 0.2s, transform 0.2s",
                letterSpacing: "0.01em",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.filter = "brightness(1.1)";
                el.style.boxShadow = "0 0 50px rgba(34,211,238,0.40), inset 0 1px 0 rgba(255,255,255,0.35)";
                el.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.filter = "";
                el.style.boxShadow = "0 0 30px rgba(34,211,238,0.25), inset 0 1px 0 rgba(255,255,255,0.35)";
                el.style.transform = "";
              }}
            >
              {/* Shine sweep */}
              <span style={{
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "60%",
                height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                transform: "skewX(-20deg)",
                animation: "shine 3s ease-in-out infinite",
              }} />
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, position: "relative" }}>pip install</span>
              <ArrowUpRight size={12} style={{ position: "relative" }} />
            </a>
          </div>

          {/* Mobile burger */}
          <button
            className="lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "0.625rem",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              color: "#64748B",
              cursor: "pointer",
              transition: "color 0.2s",
              flexShrink: 0,
            }}
          >
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: 36 + 52,
            left: "1rem",
            right: "1rem",
            zIndex: 49,
            borderRadius: "1.25rem",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(6,8,16,0.92)",
            backdropFilter: "blur(40px) saturate(160%)",
            WebkitBackdropFilter: "blur(40px) saturate(160%)",
            padding: "0.75rem",
            boxShadow: "0 25px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          {NAV.map(l => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                color: active === l.href ? "#F1F5F9" : "#94A3B8",
                fontSize: 14,
                fontWeight: active === l.href ? 600 : 400,
                padding: "0.75rem 0.875rem",
                borderRadius: "0.75rem",
                textDecoration: "none",
                background: active === l.href ? "rgba(255,255,255,0.05)" : "transparent",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              {l.label}
            </a>
          ))}
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0.5rem 0" }} />
          <a
            href="#install"
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.875rem 1rem",
              borderRadius: "0.875rem",
              background: "linear-gradient(135deg, #22D3EE, #67E8F9)",
              color: "#020c10",
              fontWeight: 700,
              fontSize: 13.5,
              textDecoration: "none",
              boxShadow: "0 0 30px rgba(34,211,238,0.20)",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            pip install openingest
          </a>
        </div>
      )}

      {/* Shine animation keyframes */}
      <style>{`
        @keyframes shine {
          0%   { left: -100% }
          30%  { left: 130% }
          100% { left: 130% }
        }
      `}</style>
    </>
  );
}
