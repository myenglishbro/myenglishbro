import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Eye, MessageCircle, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Announcement {
  id: string;
  titulo: string;
  descripcion: string | null;
  imagen_url: string | null;
  link_url: string | null;
  preview_url: string | null;
  orden: number;
}

const getEmbedUrl = (url: string): string | null => {
  const youtube = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/,
  );
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;

  const driveFile = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFile) return `https://drive.google.com/file/d/${driveFile[1]}/preview`;

  const driveId = url.match(/drive\.google\.com\/(?:open|uc)\?id=([a-zA-Z0-9_-]+)/);
  if (driveId) return `https://drive.google.com/file/d/${driveId[1]}/preview`;

  return null;
};

const isImageUrl = (url: string) => /\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i.test(url);

export const AnnouncementsCarousel = () => {
  const [preview, setPreview] = useState<Announcement | null>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, titulo, descripcion, imagen_url, link_url, preview_url, orden")
        .eq("activo", true)
        .order("orden");
      if (error) throw error;
      return data as Announcement[];
    },
  });

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  useEffect(() => {
    if (!api || isHovering || announcements.length <= 1) return;
    const interval = setInterval(() => api.scrollNext(), 4500);
    return () => clearInterval(interval);
  }, [api, isHovering, announcements.length]);

  if (announcements.length === 0) return null;

  const previewSource = preview?.preview_url ?? preview?.imagen_url ?? null;
  const embedUrl = previewSource ? getEmbedUrl(previewSource) : null;
  const previewIsImage = previewSource ? isImageUrl(previewSource) || !preview?.preview_url : false;

  return (
    <>
      <div
        className="animate-fade-in-up"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <h3 className="text-sm font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
          <span>📢</span> Anuncios
        </h3>

        <Carousel opts={{ loop: announcements.length > 1, align: "start" }} setApi={setApi}>
          <CarouselContent className="-ml-0">
            {announcements.map((slide) => {
              const clickable = !!(slide.preview_url || slide.imagen_url);
              return (
                <CarouselItem key={slide.id} className="pl-0">
                  <div className="dashboard-card overflow-hidden">
                    <div
                      onClick={clickable ? () => setPreview(slide) : undefined}
                      className={`group relative w-full aspect-[4/3] bg-gradient-to-br from-primary/10 via-white to-indigo-50 ${
                        clickable ? "cursor-pointer" : ""
                      }`}
                    >
                      {slide.imagen_url ? (
                        <img
                          src={slide.imagen_url}
                          alt={slide.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Megaphone className="h-10 w-10 text-primary/30" />
                        </div>
                      )}
                      <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-white bg-black/50 backdrop-blur px-2.5 py-1 rounded-full">
                        🔥 Oferta especial
                      </span>
                      <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/55 to-transparent" />
                      {clickable && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/25 transition-colors">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2.5">
                            <Eye className="h-4 w-4 text-slate-700" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h4 className="text-sm font-bold text-slate-800 leading-snug mb-1">
                        {slide.titulo}
                      </h4>
                      {slide.descripcion && (
                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                          {slide.descripcion}
                        </p>
                      )}
                      {slide.link_url && (
                        <a href={slide.link_url} target="_blank" rel="noopener noreferrer">
                          <Button
                            size="sm"
                            className="w-full bg-[#25D366] hover:bg-[#1ebe57] text-white rounded-lg gap-1.5 text-xs h-8"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            WhatsApp
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        {announcements.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {announcements.map((_, i) => (
              <button
                key={i}
                onClick={() => api?.scrollTo(i)}
                aria-label={`Ir al anuncio ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? "w-5 bg-primary" : "w-1.5 bg-slate-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-xl light" style={{ colorScheme: "light" }}>
          <DialogHeader>
            <DialogTitle>{preview?.titulo}</DialogTitle>
          </DialogHeader>
          {previewSource &&
            (embedUrl ? (
              <div className="w-full aspect-video rounded-lg overflow-hidden border border-slate-200">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            ) : previewIsImage ? (
              <img
                src={previewSource}
                alt={preview?.titulo}
                className="w-full max-h-[70vh] object-contain rounded-lg"
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500 mb-4">
                  Esta vista previa se abre en una pestaña nueva.
                </p>
                <a href={previewSource} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    Abrir vista previa
                  </Button>
                </a>
              </div>
            ))}
        </DialogContent>
      </Dialog>
    </>
  );
};
