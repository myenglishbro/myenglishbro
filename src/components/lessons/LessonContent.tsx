import { useMemo } from "react";
import { SlideDeck } from "./SlideDeck";

interface LessonContentProps {
  html: string;
}

/**
 * Renders contenido_html either as a slide deck (when it contains
 * <section class="slide"> blocks) or as plain styled HTML, so older
 * lessons pasted before the slide convention keep working.
 */
export function LessonContent({ html }: LessonContentProps) {
  const isSlideFormat = useMemo(() => /<section[^>]*class=["'][^"']*\bslide\b/i.test(html), [html]);

  if (isSlideFormat) {
    return <SlideDeck html={html} />;
  }

  return <div className="html-fragment-content" dangerouslySetInnerHTML={{ __html: html }} />;
}
