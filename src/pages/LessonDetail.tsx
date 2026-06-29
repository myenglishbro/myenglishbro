import { Link, useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChevronLeft } from "lucide-react";

const ACCENT = "#4C6FFF";

const NIVEL_COLORS: Record<string, string> = {
  A1: "#22c55e",
  A2: "#84cc16",
  B1: "#eab308",
  B2: "#f97316",
  C1: "#ef4444",
  C2: "#8b5cf6",
  All: ACCENT,
};

const toEmbedUrl = (url: string): string => {
  if (!url) return "";
  // Already embed
  if (url.includes("/embed/")) return url;
  // youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  // youtube.com/watch?v=ID
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  return url;
};

const LessonDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: lesson, isLoading, isError } = useQuery({
    queryKey: ["leccion-publica", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lecciones_publicas")
        .select("*")
        .eq("slug", slug)
        .eq("publicado", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
    retry: false,
  });

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#FBFAF7", fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
        <Navbar />
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "80px 24px" }}>
          <div style={{ height: "40px", background: "#F3F4F6", borderRadius: "8px", marginBottom: "24px", animation: "pulse 1.5s infinite" }} />
          <div style={{ height: "400px", background: "#F3F4F6", borderRadius: "12px", animation: "pulse 1.5s infinite" }} />
        </div>
      </div>
    );
  }

  if (isError || !lesson) {
    return <Navigate to="/lessons" replace />;
  }

  const nivelColor = NIVEL_COLORS[lesson.nivel] || ACCENT;
  const embedUrl = lesson.youtube_url ? toEmbedUrl(lesson.youtube_url) : null;

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

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "clamp(32px,6vh,64px) 24px clamp(60px,10vh,120px)" }}>
        {/* Back */}
        <Link
          to="/lessons"
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            fontSize: "14px", fontWeight: 600, color: "#6B7280",
            textDecoration: "none", marginBottom: "32px",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
        >
          <ChevronLeft style={{ width: 16, height: 16 }} />
          All Lessons
        </Link>

        {/* Badges */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-block", padding: "3px 12px", borderRadius: "999px",
              fontSize: "12px", fontWeight: 700,
              background: `${nivelColor}18`, color: nivelColor,
              letterSpacing: "0.04em",
            }}
          >
            {lesson.nivel}
          </span>
          <span
            style={{
              display: "inline-block", padding: "3px 12px", borderRadius: "999px",
              fontSize: "12px", fontWeight: 600,
              background: "#F3F4F6", color: "#6B7280",
            }}
          >
            {lesson.categoria}
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: "clamp(26px,4vw,40px)", fontWeight: 800,
            letterSpacing: "-0.025em", lineHeight: 1.2,
            marginBottom: lesson.descripcion ? "14px" : "32px",
          }}
        >
          {lesson.titulo}
        </h1>

        {lesson.descripcion && (
          <p
            style={{
              fontSize: "17px", color: "#5A6272", lineHeight: 1.65,
              marginBottom: "32px",
            }}
          >
            {lesson.descripcion}
          </p>
        )}

        <hr style={{ border: "none", borderTop: "1.5px solid #F0F0EE", marginBottom: "40px" }} />

        {/* Featured YouTube embed */}
        {embedUrl && (
          <div
            style={{
              position: "relative", paddingBottom: "56.25%", height: 0,
              overflow: "hidden", borderRadius: "14px",
              background: "#000", marginBottom: "40px",
              boxShadow: "0 8px 32px -8px rgba(0,0,0,0.18)",
            }}
          >
            <iframe
              src={embedUrl}
              title={lesson.titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: "absolute", top: 0, left: 0,
                width: "100%", height: "100%",
                border: "none",
              }}
            />
          </div>
        )}

        {/* HTML Content */}
        {lesson.contenido_html && (
          <div
            className="lesson-content"
            style={{
              fontSize: "16px", lineHeight: 1.75, color: "#2D3748",
            }}
            dangerouslySetInnerHTML={{ __html: lesson.contenido_html }}
          />
        )}

        {!lesson.contenido_html && !embedUrl && (
          <p style={{ color: "#9CA3AF", fontStyle: "italic", textAlign: "center", padding: "40px 0" }}>
            Contenido próximamente.
          </p>
        )}

        {/* Footer meta */}
        <div style={{ marginTop: "60px", paddingTop: "24px", borderTop: "1.5px solid #F0F0EE" }}>
          <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
            Publicado el{" "}
            {new Date(lesson.created_at).toLocaleDateString("es-PE", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </main>

      <Footer />

      <style>{`
        .lesson-content h1, .lesson-content h2, .lesson-content h3,
        .lesson-content h4, .lesson-content h5, .lesson-content h6 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 1.6em 0 0.6em;
          color: #1E2128;
        }
        .lesson-content h2 { font-size: 1.5em; }
        .lesson-content h3 { font-size: 1.25em; }
        .lesson-content p { margin: 0 0 1.2em; }
        .lesson-content ul, .lesson-content ol {
          padding-left: 1.6em;
          margin: 0 0 1.2em;
        }
        .lesson-content li { margin-bottom: 0.4em; }
        .lesson-content strong { font-weight: 700; color: #1E2128; }
        .lesson-content em { font-style: italic; }
        .lesson-content a { color: ${ACCENT}; text-decoration: underline; }
        .lesson-content blockquote {
          border-left: 3px solid ${ACCENT};
          margin: 1.4em 0;
          padding: 8px 0 8px 20px;
          color: #5A6272;
          font-style: italic;
        }
        .lesson-content pre, .lesson-content code {
          font-family: monospace;
          background: #F3F4F6;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.9em;
        }
        .lesson-content pre {
          padding: 16px;
          overflow-x: auto;
          margin: 1.2em 0;
        }
        .lesson-content pre code { background: none; padding: 0; }
        .lesson-content iframe {
          max-width: 100%;
          border-radius: 10px;
          display: block;
          margin: 1.6em auto;
        }
        .lesson-content img {
          max-width: 100%;
          border-radius: 10px;
          display: block;
          margin: 1.6em auto;
        }
        .lesson-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.4em 0;
          font-size: 0.9em;
        }
        .lesson-content th, .lesson-content td {
          border: 1px solid #E5E7EB;
          padding: 8px 12px;
          text-align: left;
        }
        .lesson-content th {
          background: #F9FAFB;
          font-weight: 600;
          color: #374151;
        }
      `}</style>
    </div>
  );
};

export default LessonDetail;
