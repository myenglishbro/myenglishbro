import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

export const ACCENT = "#4C6FFF";

export const NIVEL_COLORS: Record<string, string> = {
  A1: "#22c55e",
  A2: "#84cc16",
  B1: "#eab308",
  B2: "#f97316",
  C1: "#ef4444",
  C2: "#8b5cf6",
  All: ACCENT,
};

export type LeccionPublica = {
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

export const LessonCard = ({ lesson }: { lesson: LeccionPublica }) => {
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
