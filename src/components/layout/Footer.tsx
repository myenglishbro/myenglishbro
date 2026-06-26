import { Link } from "react-router-dom";
import { GraduationCap, Mail, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-16">
      <div className="container mx-auto px-6 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground font-display">Acelingua</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-md leading-relaxed mb-6">
              Centro de idiomas premium para profesionales hispanohablantes. 
              Domina niveles A1 a C2 con cursos en plataforma, clases grupales en vivo y preparación para exámenes internacionales.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Youtube, href: "#" },
                { icon: Linkedin, href: "#" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 font-display">Learn</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/programs" className="text-muted-foreground hover:text-primary transition-colors">
                  Programs
                </Link>
              </li>
              <li>
                <Link to="/live-classes" className="text-muted-foreground hover:text-primary transition-colors">
                  Live Classes
                </Link>
              </li>
              <li>
                <Link to="/store" className="text-muted-foreground hover:text-primary transition-colors">
                  Platform Courses
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 font-display">Soporte</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/#faq" className="text-muted-foreground hover:text-primary transition-colors">
                  Preguntas frecuentes
                </a>
              </li>
              <li>
                <a href="mailto:soporte@acelingua.com" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contacto
                </a>
              </li>
              <li>
                <Link to="/dashboard/support" className="text-muted-foreground hover:text-primary transition-colors">
                  Centro de ayuda
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Acelingua Language Center. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacidad
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Términos
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
