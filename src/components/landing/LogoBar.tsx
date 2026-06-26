import { Award, BookOpen, GraduationCap, Globe, FileCheck, Languages } from "lucide-react";

export const LogoBar = () => {
  const certifications = [
    { name: "Cambridge", icon: Award },
    { name: "IELTS", icon: BookOpen },
    { name: "TOEFL", icon: Globe },
    { name: "CELTA", icon: GraduationCap },
    { name: "DELTA", icon: FileCheck },
    { name: "C2 Proficiency", icon: Languages },
  ];

  return (
    <section className="py-12 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-muted-foreground text-sm font-medium mb-8">
          Preparación oficial para certificaciones internacionales
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center">
          {certifications.map((cert) => (
            <div
              key={cert.name}
              className="flex items-center justify-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-primary/5 transition-colors group"
            >
              <cert.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="font-semibold text-sm text-foreground">{cert.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};