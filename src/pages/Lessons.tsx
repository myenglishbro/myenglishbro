import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementsCarousel } from "@/components/dashboard/AnnouncementsCarousel";
import { BookOpen } from "lucide-react";

const ACCENT = "#4C6FFF";

const NIVELES = ["All", "A1", "A2", "B1", "B2", "C1", "C2"];
const CATEGORIAS = [
  "All",
  "Grammar",
  "Vocabulary",
  "Listening",
  "Pronunciation",
  "Speaking",
  "Reading",
  "Writing",
  "Tips",
];

const NIVEL_COLORS: Record<string, string> = {
  A1: "#22c55e",
  A2: "#84cc16",
  B1: "#eab308",
  B2: "#f97316",
  C1: "#ef4444",
  C2: "#8b5cf6",
  All: ACCENT,
};

type LeccionPublica = {
  id: string;
  titulo: string;
  slug: string;
  descripcion: string | null;
  youtube_url: string | null;
  imagen_url: string | null;
  nivel: string;
  categoria: string;
  created_at: string;
};

const Lessons = () => {
  const [nivelFilter, setNivelFilter] = useState("All");
  const [categoriaFilter, setCategoriaFilter] = useState("All");

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ["lecciones-publicas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lecciones_publicas")
        .select("id, titulo, slug, descripcion, youtube_url, imagen_url, nivel, categoria, created_at")
        .eq("publicado", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as LeccionPublica[];
    },
  });

  const filtered = lessons.filter((l) => {
    const matchNivel = nivelFilter === "All" || l.nivel === nivelFilter || l.nivel === "All";
    const matchCat = categoriaFilter === "All" || l.categoria === categoriaFilter;
    return matchNivel && matchCat;
  });

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
      <section style={{ padding: "clamp(56px,8vh,96px) 24px clamp(32px,4vh,56px)" }}>
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
            Free Lessons
          </div>
          <h1
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: "clamp(32px,5vw,52px)", fontWeight: 800,
              letterSpacing: "-0.03em", lineHeight: 1.1,
              margin: "0 0 18px",
            }}
          >
            Learn English,{" "}
            <span style={{ color: ACCENT }}>free</span>
          </h1>
          <p
            style={{
              fontSize: "clamp(15px,2vw,18px)", color: "#5A6272",
              lineHeight: 1.6, margin: "0 auto",
            }}
          >
            Explicaciones claras, videos y ejercicios interactivos para mejorar tu inglés.
            Sin registro, sin costo.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section style={{ padding: "0 24px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", marginBottom: "8px" }}>
            {/* Level filter */}
            <div>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>
                Level
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {NIVELES.map((n) => (
                  <button
                    key={n}
                    onClick={() => setNivelFilter(n)}
                    style={{
                      padding: "5px 14px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: 600,
                      border: "1.5px solid",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      background: nivelFilter === n ? (NIVEL_COLORS[n] || ACCENT) : "transparent",
                      borderColor: nivelFilter === n ? (NIVEL_COLORS[n] || ACCENT) : "#E5E7EB",
                      color: nivelFilter === n ? "#fff" : "#6B7280",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>
                Topic
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {CATEGORIAS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategoriaFilter(c)}
                    style={{
                      padding: "5px 14px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: 600,
                      border: "1.5px solid",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      background: categoriaFilter === c ? ACCENT : "transparent",
                      borderColor: categoriaFilter === c ? ACCENT : "#E5E7EB",
                      color: categoriaFilter === c ? "#fff" : "#6B7280",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result count */}
          {!isLoading && (
            <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "16px" }}>
              {filtered.length} lección{filtered.length !== 1 ? "es" : ""}
            </p>
          )}
        </div>
      </section>

      {/* Grid + Sidebar */}
      <section style={{ padding: "0 24px clamp(60px,10vh,120px)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", gap: "32px", alignItems: "flex-start" }}>
          {/* Lessons grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {isLoading ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "24px",
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: "220px",
                      borderRadius: "16px",
                      background: "#F3F4F6",
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <BookOpen style={{ width: 48, height: 48, color: "#D1D5DB", margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#6B7280", marginBottom: "8px" }}>
                  No hay lecciones en esta combinación
                </h3>
                <p style={{ color: "#9CA3AF", fontSize: "14px" }}>
                  Prueba con otro nivel o categoría
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "24px",
                }}
              >
                {filtered.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))}
              </div>
            )}
          </div>

          {/* Sticky sidebar */}
          <div style={{ width: "280px", flexShrink: 0, position: "sticky", top: "88px" }}>
            <AnnouncementsCarousel />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const LessonCard = ({ lesson }: { lesson: LeccionPublica }) => {
  const nivelColor = NIVEL_COLORS[lesson.nivel] || ACCENT;

  return (
    <Link
      to={`/lessons/${lesson.slug}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <article
        style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1.5px solid #F0F0EE",
          overflow: "hidden",
          transition: "transform 0.18s, box-shadow 0.18s, border-color 0.18s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px -8px rgba(76,111,255,0.18)";
          (e.currentTarget as HTMLElement).style.borderColor = ACCENT;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
          (e.currentTarget as HTMLElement).style.borderColor = "#F0F0EE";
        }}
      >
        {/* Thumbnail */}
        {lesson.imagen_url ? (
          <div style={{ height: "160px", overflow: "hidden" }}>
            <img
              src={lesson.imagen_url}
              alt={lesson.titulo}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ) : (
          <div
            style={{
              height: "120px",
              background: `linear-gradient(135deg, ${nivelColor}18 0%, ${ACCENT}10 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BookOpen style={{ width: 40, height: 40, color: nivelColor, opacity: 0.6 }} />
          </div>
        )}

        {/* Content */}
        <div style={{ padding: "18px 20px 20px" }}>
          {/* Badges */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-block",
                padding: "2px 10px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 700,
                background: `${nivelColor}18`,
                color: nivelColor,
                letterSpacing: "0.04em",
              }}
            >
              {lesson.nivel}
            </span>
            <span
              style={{
                display: "inline-block",
                padding: "2px 10px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 600,
                background: "#F3F4F6",
                color: "#6B7280",
              }}
            >
              {lesson.categoria}
            </span>
          </div>

          <h3
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#1E2128",
              lineHeight: 1.3,
              marginBottom: "8px",
              fontFamily: "'Bricolage Grotesque', sans-serif",
            }}
          >
            {lesson.titulo}
          </h3>

          {lesson.descripcion && (
            <p
              style={{
                fontSize: "13px",
                color: "#6B7280",
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical" as const,
                overflow: "hidden",
              }}
            >
              {lesson.descripcion}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
};

export default Lessons;
