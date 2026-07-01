import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, BookOpen } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ACCENT, NIVEL_COLORS, type LeccionPublica } from "@/components/lessons/LessonCard";

export const LessonsSlider = ({ lessons }: { lessons: LeccionPublica[] }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  useEffect(() => {
    if (!api || isHovering || lessons.length <= 1) return;
    const interval = setInterval(() => api.scrollNext(), 5500);
    return () => clearInterval(interval);
  }, [api, isHovering, lessons.length]);

  if (lessons.length === 0) return null;

  return (
    <section style={{ padding: "clamp(28px,4vh,44px) 24px 0" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            marginBottom: "16px",
          }}
        >
          <Sparkles style={{ width: 18, height: 18, color: ACCENT }} />
          <h2
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: "clamp(18px,2.4vw,22px)", fontWeight: 800,
              letterSpacing: "-0.02em", margin: 0,
            }}
          >
            Lecciones nuevas
          </h2>
        </div>

        <div
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          style={{
            position: "relative",
            borderRadius: "28px",
            overflow: "hidden",
            border: "1.5px solid #EEF0F4",
            boxShadow: "0 16px 48px -22px rgba(20,24,40,0.18)",
            paddingBottom: lessons.length > 1 ? "44px" : "0",
            background: "#fff",
          }}
        >
          <Carousel opts={{ loop: lessons.length > 1 }} setApi={setApi}>
            <CarouselContent className="ml-0">
              {lessons.map((lesson) => {
                const nivelColor = NIVEL_COLORS[lesson.nivel] || ACCENT;
                return (
                  <CarouselItem key={lesson.id} className="pl-0">
                    <Link
                      to={`/lessons/${lesson.slug}`}
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "stretch",
                        textDecoration: "none",
                        minHeight: "clamp(300px,38vh,380px)",
                        background: `linear-gradient(120deg, ${nivelColor}14 0%, ${ACCENT}0A 55%, #FBFAF7 100%)`,
                      }}
                    >
                      {/* Text content */}
                      <div
                        style={{
                          flex: "1 1 320px",
                          padding: "clamp(24px,4vw,44px)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                        }}
                      >
                        <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
                          <span
                            style={{
                              display: "inline-flex", alignItems: "center",
                              padding: "3px 12px", borderRadius: "999px",
                              fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em",
                              textTransform: "uppercase",
                              background: ACCENT, color: "#fff",
                            }}
                          >
                            Nuevo
                          </span>
                          <span
                            style={{
                              padding: "3px 12px", borderRadius: "999px",
                              fontSize: "11px", fontWeight: 700,
                              background: `${nivelColor}1c`, color: nivelColor,
                            }}
                          >
                            {lesson.nivel}
                          </span>
                          <span
                            style={{
                              padding: "3px 12px", borderRadius: "999px",
                              fontSize: "11px", fontWeight: 600,
                              background: "#F3F4F6", color: "#6B7280",
                            }}
                          >
                            {lesson.categoria}
                          </span>
                        </div>

                        <h3
                          style={{
                            fontFamily: "'Bricolage Grotesque', sans-serif",
                            fontSize: "clamp(21px,2.8vw,30px)", fontWeight: 800,
                            letterSpacing: "-0.02em", lineHeight: 1.2,
                            color: "#1E2128", margin: "0 0 10px",
                          }}
                        >
                          {lesson.titulo}
                        </h3>

                        {lesson.descripcion && (
                          <p
                            style={{
                              fontSize: "14px", lineHeight: 1.6,
                              color: "#5A6272",
                              margin: "0 0 20px",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical" as const,
                              overflow: "hidden",
                            }}
                          >
                            {lesson.descripcion}
                          </p>
                        )}

                        <span
                          style={{
                            display: "inline-flex", alignItems: "center", gap: "6px",
                            fontSize: "14px", fontWeight: 700, color: ACCENT,
                          }}
                        >
                          Ver lección <ArrowRight style={{ width: 15, height: 15 }} />
                        </span>
                      </div>

                      {/* Framed image */}
                      <div
                        style={{
                          flex: "1 1 300px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "clamp(20px,3vw,32px)",
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            maxWidth: "420px",
                            height: "clamp(200px,26vh,280px)",
                            borderRadius: "20px",
                            overflow: "hidden",
                            border: "5px solid #fff",
                            boxShadow: "0 18px 44px -16px rgba(20,24,40,0.28)",
                            padding: lesson.imagen_url ? "8px" : "0",
                            boxSizing: "border-box",
                            background: lesson.imagen_url
                              ? `linear-gradient(135deg, ${nivelColor}14 0%, ${ACCENT}0A 100%)`
                              : `linear-gradient(135deg, ${nivelColor} 0%, ${ACCENT} 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {lesson.imagen_url ? (
                            <img
                              src={lesson.imagen_url}
                              alt={lesson.titulo}
                              style={{ maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto", objectFit: "contain", borderRadius: "12px" }}
                            />
                          ) : (
                            <BookOpen style={{ width: 56, height: 56, color: "rgba(255,255,255,0.85)" }} />
                          )}
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>

          {lessons.length > 1 && (
            <div
              style={{
                position: "absolute", bottom: "16px", left: 0, right: 0,
                display: "flex", justifyContent: "center", gap: "6px", zIndex: 2,
              }}
            >
              {lessons.map((_, i) => (
                <button
                  key={i}
                  onClick={() => api?.scrollTo(i)}
                  aria-label={`Ir a la lección ${i + 1}`}
                  style={{
                    height: "6px",
                    width: i === current ? "22px" : "6px",
                    borderRadius: "999px",
                    border: "none",
                    cursor: "pointer",
                    background: i === current ? ACCENT : "#E5E7EB",
                    transition: "all 0.2s",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
