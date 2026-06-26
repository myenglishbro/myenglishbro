import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Monitor, Video, BookOpen, Award, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WhatsAppButton } from "@/components/landing/WhatsAppButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const levelColors: Record<string, { bg: string; light: string; text: string }> = {
  A1: { bg: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-600" },
  A2: { bg: "bg-teal-500", light: "bg-teal-50", text: "text-teal-600" },
  B1: { bg: "bg-cyan-500", light: "bg-cyan-50", text: "text-cyan-600" },
  B2: { bg: "bg-blue-500", light: "bg-blue-50", text: "text-blue-600" },
  C1: { bg: "bg-indigo-500", light: "bg-indigo-50", text: "text-indigo-600" },
  IELTS: { bg: "bg-purple-500", light: "bg-purple-50", text: "text-purple-600" },
};

const Programs = () => {
  const navigate = useNavigate();

  const { data: programas = [], isLoading } = useQuery({
    queryKey: ["programas-public-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programas_en_vivo")
        .select("*")
        .order("fecha_inicio", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 lg:px-20 bg-gradient-to-br from-slate-50 via-white to-primary/5">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="bg-primary/10 text-primary border-0 mb-6 text-xs font-semibold px-4 py-1.5">
            ACELINGUA PROGRAMS
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-foreground mb-6 leading-tight">
            Structured programs for{" "}
            <span className="text-gradient-primary">every level</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Each program is available as a self-paced platform course or as a live group program 
            with certified teachers via Zoom or Google Meet.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-border shadow-sm">
              <Monitor className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Platform Course</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-border shadow-sm">
              <Video className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium text-foreground">Live Group Program</span>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-20 px-6 lg:px-20">
        <div className="container mx-auto max-w-6xl">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-80 rounded-2xl" />
              ))}
            </div>
          ) : programas.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No hay programas disponibles en este momento.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {programas.map((programa) => {
                const colors = levelColors[programa.nivel] || { bg: "bg-primary", light: "bg-primary/5", text: "text-primary" };
                return (
                  <Card key={programa.id} className="rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className={`${colors.bg} p-6 text-white`}>
                      <Badge className="bg-white/20 text-white border-0 mb-3 text-xs font-bold">
                        {programa.nivel}
                      </Badge>
                      <h3 className="text-2xl font-bold font-display">{programa.nombre}</h3>
                    </div>
                    <div className="p-6 space-y-5">
                      {programa.descripcion && (
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {programa.descripcion}
                        </p>
                      )}
                      <div className="space-y-3">
                        <div className={`flex items-center gap-3 p-3 ${colors.light} rounded-xl`}>
                          <Monitor className={`h-5 w-5 ${colors.text} flex-shrink-0`} />
                          <div>
                            <p className="text-sm font-semibold text-foreground">Platform Course</p>
                            <p className="text-xs text-muted-foreground">Self-paced digital course & exercises</p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-3 p-3 ${colors.light} rounded-xl`}>
                          <Video className={`h-5 w-5 ${colors.text} flex-shrink-0`} />
                          <div>
                            <p className="text-sm font-semibold text-foreground">Live Program</p>
                            <p className="text-xs text-muted-foreground">Group classes + platform access</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        className="w-full bg-foreground hover:bg-foreground/90 text-background font-semibold rounded-xl"
                        onClick={() => navigate(`/programs/${programa.slug}`)}
                      >
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Why Acelingua */}
      <section className="py-20 px-6 lg:px-20 bg-card">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-12">
            Why choose Acelingua?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Award, title: "Certified Teachers", desc: "Cambridge-certified instructors with 10+ years of experience" },
              { icon: Users, title: "Small Groups", desc: "Maximum 8 students per group for personalized attention" },
              { icon: Globe, title: "International Prep", desc: "Preparation for Cambridge, IELTS and TOEFL exams" },
              { icon: BookOpen, title: "Full Platform", desc: "Digital course, exercises and downloadable resources included" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 lg:px-20 bg-gradient-to-br from-primary to-primary/80">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4 font-display">
            Ready to start your English journey?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Choose your program and learning format. Start today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-background text-primary hover:bg-background/90 px-8 py-6 rounded-full font-semibold shadow-lg"
              onClick={() => navigate("/store")}
            >
              Browse Courses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              className="bg-transparent border-2 border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-6 rounded-full font-semibold"
              onClick={() => navigate("/live-classes")}
            >
              Live Programs
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Programs;
