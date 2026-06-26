import { Button } from "@/components/ui/button";
import { MessageCircle, Video, Youtube, Send } from "lucide-react";

const Community = () => {
  const socialLinks = [
    {
      name: "Canal de WhatsApp",
      description: "Únete a nuestro canal oficial para tips diarios y actualizaciones",
      icon: MessageCircle,
      url: "https://whatsapp.com/channel/0029Vb0hd9TADTO5mGsjsO2Y",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
    },
    {
      name: "TikTok",
      description: "Contenido educativo corto y entretenido para aprender inglés",
      icon: Video,
      url: "https://www.tiktok.com/@acelingua",
      color: "bg-slate-900",
      hoverColor: "hover:bg-slate-800",
    },
    {
      name: "YouTube",
      description: "Videos completos, tutoriales y clases grabadas",
      icon: Youtube,
      url: "https://www.youtube.com/@acelingua",
      color: "bg-red-600",
      hoverColor: "hover:bg-red-700",
    },
    {
      name: "Telegram",
      description: "Grupo exclusivo para estudiantes con recursos adicionales",
      icon: Send,
      url: "https://t.me/+KedLi1PcdmNhZjNh",
      color: "bg-sky-500",
      hoverColor: "hover:bg-sky-600",
    },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Comunidad</h1>
        <p className="text-slate-500">
          Conéctate con nosotros en todas nuestras redes sociales
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {socialLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-2xl p-6 shadow-soft hover:shadow-soft-lg transition-all duration-300 border border-slate-100 hover:border-slate-200"
          >
            <div className="flex items-start gap-4">
              <div className={`${link.color} ${link.hoverColor} p-3 rounded-xl text-white transition-colors`}>
                <link.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-primary transition-colors">
                  {link.name}
                </h3>
                <p className="text-sm text-slate-500">
                  {link.description}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Featured TikTok */}
      <div className="mt-8 bg-white rounded-2xl p-6 shadow-soft border border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Video destacado</h2>
        <a
          href="https://vt.tiktok.com/ZSHToPGnrHkfw-k5cTl/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
        >
          <Video className="h-5 w-5" />
          Ver video destacado en TikTok →
        </a>
      </div>

      {/* Contact CTA */}
      <div className="mt-8 bg-gradient-to-br from-primary/5 to-emerald-500/5 rounded-2xl p-6 border border-primary/10">
        <div className="flex items-start gap-4">
          <div className="bg-primary p-3 rounded-xl text-white">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800 mb-2">
              ¿Tienes preguntas?
            </h3>
            <p className="text-slate-500 mb-4">
              Contáctanos directamente por WhatsApp para soporte y consultas sobre cursos.
            </p>
            <Button
              asChild
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <a href="https://wa.link/8rlrd2" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contactar por WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
