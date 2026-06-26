import { Award, Users, Clock, CheckCircle, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import instructorPhoto from "@/assets/instructor-photo.png";

export const InstructorSection = () => {
  const certifications = ["CELTA", "DELTA", "C2 Proficiency"];
  const stats = [
    { icon: Clock, value: "10+ años", label: "Experiencia" },
    { icon: Users, value: "5,000+", label: "Alumnos" },
    { icon: Award, value: "98%", label: "Satisfacción" },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Photo */}
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src={instructorPhoto} 
                alt="Carlos - Tu instructor de inglés"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 lg:right-8 bg-white border border-slate-100 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-education-secondary/10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-education-secondary" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Certificado</div>
                  <div className="text-xs text-slate-500">Cambridge</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Bio */}
          <div>
            <Badge className="mb-4 bg-education-primary/10 text-education-primary border-0 text-xs font-semibold px-3 py-1">
              Conoce a tu instructor
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 font-display">
              Aprende con un experto certificado
            </h2>
            
            <p className="text-slate-600 mb-8 leading-relaxed text-lg">
              Con más de 10 años de experiencia enseñando inglés avanzado a profesionales hispanohablantes, 
              he ayudado a miles de estudiantes a alcanzar sus objetivos y dominar el inglés real de la vida diaria.
            </p>

            {/* Quote */}
            <div className="bg-education-primary/5 border-l-4 border-education-primary rounded-r-xl p-6 mb-8">
              <Quote className="h-8 w-8 text-education-primary/40 mb-2" />
              <p className="text-slate-800 font-medium italic">
                "Mi misión es simple: que hables inglés con la misma confianza que en español, 
                sin traducciones mentales ni miedos."
              </p>
            </div>

            {/* Certifications */}
            <div className="mb-8">
              <p className="text-xs font-semibold text-slate-900 mb-3 uppercase tracking-wide">Certificaciones:</p>
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert) => (
                  <Badge key={cert} variant="outline" className="text-xs border-slate-200 bg-slate-50 text-slate-700">
                    <Award className="h-3 w-3 mr-1.5 text-education-primary" />
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                  <stat.icon className="h-5 w-5 text-education-primary mx-auto mb-2" />
                  <div className="font-bold text-slate-900 text-sm">{stat.value}</div>
                  <div className="text-xs text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};