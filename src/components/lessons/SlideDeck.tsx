import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize, Minimize } from "lucide-react";

interface SlideDeckProps {
  html: string;
}

interface Slide {
  innerHtml: string;
  coverImageSrc: string | null;
  isHero: boolean;
}

function parseSlides(html: string): Slide[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const sections = Array.from(doc.querySelectorAll("section.slide"));

  if (sections.length === 0) return [];

  return sections.map((section) => {
    const isHero = section.classList.contains("hero");
    // The authoring prompt wraps every slide's content in <div class="container">,
    // so the real content root for cover-image detection is that div when present
    // — not `section` itself, which would only ever have one child (the wrapper).
    const contentRoot = section.querySelector(":scope > .container") ?? section;
    const img = contentRoot.querySelector(":scope > img");
    const isCover = !!img && contentRoot.children.length <= 2;

    if (isCover && img) {
      const clone = section.cloneNode(true) as HTMLElement;
      const cloneRoot = clone.querySelector(":scope > .container") ?? clone;
      cloneRoot.querySelector(":scope > img")?.remove();
      return { innerHtml: clone.innerHTML, coverImageSrc: img.getAttribute("src"), isHero };
    }
    return { innerHtml: section.innerHTML, coverImageSrc: null, isHero };
  });
}

/**
 * Renders `contenido_html` as a fullscreen-capable slide deck when the
 * pasted HTML uses <section class="slide">...</section> blocks. Falls
 * back to `null` (caller renders the plain .html-fragment-content div)
 * for HTML that predates this convention.
 */
export function SlideDeck({ html }: SlideDeckProps) {
  const slides = useMemo(() => parseSlides(html), [html]);
  const [index, setIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (next: number) => {
      if (slides.length === 0) return;
      setIndex(((next % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(index + 1);
      if (e.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, goTo]);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen();
    }
  };

  if (slides.length === 0) return null;

  const slide = slides[index];

  return (
    <div ref={containerRef} className={`slide-deck ${isFullscreen ? "slide-deck-fullscreen" : ""}`}>
      <div
        key={index}
        className={`slide-deck-slide ${slide.coverImageSrc ? "slide-deck-slide-cover" : ""} ${slide.isHero ? "slide-deck-slide-hero" : ""}`}
        style={slide.coverImageSrc ? { backgroundImage: `url(${slide.coverImageSrc})` } : undefined}
      >
        <div className="html-fragment-content slide-deck-slide-content" dangerouslySetInnerHTML={{ __html: slide.innerHtml }} />
      </div>

      <button
        type="button"
        className="slide-deck-fullscreen-btn"
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
      >
        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
      </button>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            className="slide-deck-nav slide-deck-nav-prev"
            onClick={() => goTo(index - 1)}
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="slide-deck-nav slide-deck-nav-next"
            onClick={() => goTo(index + 1)}
            aria-label="Siguiente slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="slide-deck-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`slide-deck-dot ${i === index ? "slide-deck-dot-active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Ir a la slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
