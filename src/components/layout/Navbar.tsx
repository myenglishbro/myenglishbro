import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const ACCENT = "#4C6FFF";

const navLinks = [
  { label: "Store", href: "/store" },
  { label: "Live Classes", href: "/live-classes" },
  { label: "Programs", href: "/programs" },
  { label: "Lessons", href: "/lessons" },
  { label: "Resources", href: "/resources" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: scrolled ? "rgba(251,250,247,0.96)" : "rgba(251,250,247,0.82)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        boxShadow: scrolled ? "0 4px 20px -8px rgba(0,0,0,0.12)" : "none",
        transition: "box-shadow 0.3s, background 0.3s",
        fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "0 24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <span
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: "32px", height: "32px", borderRadius: "10px",
              background: ACCENT, color: "#fff",
              fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "18px", lineHeight: 1,
              flexShrink: 0,
            }}
          >
            m
          </span>
          <span
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 700, fontSize: "18px", letterSpacing: "-0.02em", color: "#1E2128",
            }}
          >
            myenglish<span style={{ color: ACCENT }}>bro</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          style={{
            alignItems: "center",
            gap: "4px",
          }}
          className="hidden md:flex"
        >
          {navLinks.map((link) =>
            link.href.startsWith("#") ? (
              <a
                key={link.label}
                href={link.href}
                style={{
                  padding: "7px 14px", borderRadius: "999px",
                  fontSize: "14.5px", fontWeight: 500, color: "#52565E",
                  textDecoration: "none", transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(76,111,255,0.08)";
                  (e.currentTarget as HTMLElement).style.color = ACCENT;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#52565E";
                }}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                style={{
                  padding: "7px 14px", borderRadius: "999px",
                  fontSize: "14.5px", fontWeight: 500, color: "#52565E",
                  textDecoration: "none", transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(76,111,255,0.08)";
                  (e.currentTarget as HTMLElement).style.color = ACCENT;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#52565E";
                }}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Desktop CTAs */}
        <div style={{ alignItems: "center", gap: "8px" }} className="hidden md:flex">
          <Link
            to="/auth"
            style={{
              padding: "9px 18px", borderRadius: "10px",
              fontWeight: 600, fontSize: "14px", color: "#52565E", textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = ACCENT)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#52565E")}
          >
            Log in
          </Link>
          <Link
            to="/auth?tab=register"
            style={{
              padding: "9px 18px", borderRadius: "10px",
              background: ACCENT, color: "#fff",
              fontWeight: 700, fontSize: "14px", textDecoration: "none",
              boxShadow: "0 8px 20px rgba(76,111,255,0.30)",
              transition: "box-shadow 0.15s, transform 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 28px rgba(76,111,255,0.40)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 20px rgba(76,111,255,0.30)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            Start free →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "38px", height: "38px", borderRadius: "10px",
            background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.08)",
            color: "#1E2128", cursor: "pointer",
          }}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div
          style={{
            borderTop: "1px solid rgba(0,0,0,0.06)",
            background: "#FBFAF7",
            padding: "12px 24px 20px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {navLinks.map((link) =>
              link.href.startsWith("#") ? (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  style={{
                    padding: "11px 14px", borderRadius: "12px",
                    fontSize: "15px", fontWeight: 500, color: "#52565E", textDecoration: "none",
                  }}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  style={{
                    padding: "11px 14px", borderRadius: "12px",
                    fontSize: "15px", fontWeight: 500, color: "#52565E", textDecoration: "none",
                  }}
                >
                  {link.label}
                </Link>
              )
            )}

            <div
              style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: "10px", marginTop: "12px", paddingTop: "16px",
                borderTop: "1px solid rgba(0,0,0,0.07)",
              }}
            >
              <Link
                to="/auth"
                onClick={() => setIsOpen(false)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  height: "44px", borderRadius: "12px",
                  border: "1.5px solid rgba(0,0,0,0.12)", color: "#1E2128",
                  fontWeight: 600, fontSize: "14px", textDecoration: "none",
                }}
              >
                Log in
              </Link>
              <Link
                to="/auth?tab=register"
                onClick={() => setIsOpen(false)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  height: "44px", borderRadius: "12px",
                  background: ACCENT, color: "#fff",
                  fontWeight: 700, fontSize: "14px", textDecoration: "none",
                }}
              >
                Start free →
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
