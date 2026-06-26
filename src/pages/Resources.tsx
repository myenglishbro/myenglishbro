import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Download, FileText } from "lucide-react";

const ACCENT = "#4C6FFF";

type Resource = {
  title: string;
  description: string;
  level: string;
  levelColor: string;
  levelBg: string;
  tag: string;
  href: string;
};

const resources: Resource[] = [
  // Agrega tus recursos aquí — cada objeto es una tarjeta descargable.
  // Ejemplo:
  // {
  //   title: "B2 Vocabulary Survival Pack",
  //   description: "200 palabras clave para el Cambridge B2 First con ejemplos y ejercicios.",
  //   level: "B2",
  //   levelColor: "#2563EB",
  //   levelBg: "rgba(59,130,246,0.12)",
  //   tag: "PDF · 18 páginas",
  //   href: "https://tu-link-de-descarga.com/b2-vocab.pdf",
  // },
];

const emptyState = resources.length === 0;

const Resources = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FBFAF7",
        fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
        color: "#1E2128",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <Navbar />

      {/* Hero */}
      <section style={{ padding: "clamp(56px,8vh,96px) 24px clamp(40px,6vh,72px)" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "6px 16px", borderRadius: "999px",
              background: "rgba(76,111,255,0.10)", color: ACCENT,
              fontWeight: 600, fontSize: "13px", letterSpacing: "0.04em",
              textTransform: "uppercase", marginBottom: "22px",
            }}
          >
            Free resources
          </div>
          <h1
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800,
              fontSize: "clamp(36px,5vw,60px)", lineHeight: 1.05,
              letterSpacing: "-0.025em", margin: "0 0 18px",
            }}
          >
            Download, practice,{" "}
            <span style={{ color: ACCENT }}>level up.</span>
          </h1>
          <p style={{ fontSize: "clamp(16px,1.4vw,19px)", lineHeight: 1.6, color: "#5F636B", margin: 0 }}>
            Everything here is free. PDFs, vocabulary packs, grammar guides and more —
            grab what you need and start using it today.
          </p>
        </div>
      </section>

      {/* Resources grid */}
      <section style={{ padding: "0 24px clamp(72px,10vh,112px)" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          {emptyState ? (
            /* Estado vacío — se ve bien mientras agregas recursos */
            <div
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: "16px",
                padding: "clamp(64px,10vh,96px) 24px",
                background: "#fff", border: "1px dashed rgba(0,0,0,0.12)",
                borderRadius: "24px", textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "64px", height: "64px", borderRadius: "18px",
                  background: "rgba(76,111,255,0.10)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <FileText size={28} color={ACCENT} strokeWidth={1.6} />
              </div>
              <div>
                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "20px", marginBottom: "8px" }}>
                  Coming soon
                </div>
                <p style={{ fontSize: "15px", color: "#6E7178", margin: 0, maxWidth: "380px" }}>
                  Free resources are on their way. Check back soon — or subscribe to the newsletter
                  to get them straight to your inbox.
                </p>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              {resources.map((r) => (
                <ResourceCard key={r.title} resource={r} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

const ResourceCard = ({ resource: r }: { resource: Resource }) => (
  <div
    style={{
      background: "#fff", border: "1px solid rgba(0,0,0,0.08)",
      borderRadius: "20px", overflow: "hidden",
      boxShadow: "0 14px 36px -28px rgba(0,0,0,0.28)",
      display: "flex", flexDirection: "column",
    }}
  >
    {/* Color bar */}
    <div style={{ height: "5px", background: r.levelColor }} />

    <div style={{ padding: "22px", flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            minWidth: "42px", height: "28px", padding: "0 10px", borderRadius: "8px",
            background: r.levelBg, color: r.levelColor,
            fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "13px",
          }}
        >
          {r.level}
        </span>
        <span style={{ fontSize: "12px", color: "#9296A0", fontWeight: 500 }}>{r.tag}</span>
      </div>

      <div style={{ flex: 1 }}>
        <h3
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700,
            fontSize: "17px", margin: "0 0 8px", lineHeight: 1.3,
          }}
        >
          {r.title}
        </h3>
        <p style={{ fontSize: "13.5px", color: "#6E7178", lineHeight: 1.5, margin: 0 }}>
          {r.description}
        </p>
      </div>

      <a
        href={r.href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          height: "44px", borderRadius: "12px",
          background: "rgba(76,111,255,0.08)", color: ACCENT,
          fontWeight: 700, fontSize: "14px", textDecoration: "none",
          border: "1px solid rgba(76,111,255,0.18)",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(76,111,255,0.14)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(76,111,255,0.08)")}
      >
        <Download size={15} strokeWidth={2.2} />
        Download free
      </a>
    </div>
  </div>
);

export default Resources;
