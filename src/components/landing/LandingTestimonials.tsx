import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "María González",
    role: "Marketing Manager",
    type: "Platform Course",
    text: "The platform courses are perfectly structured. I improved my grammar and passed my B2 exam on the first attempt.",
    avatar: "M",
  },
  {
    name: "Carlos Rodríguez",
    role: "Software Engineer",
    type: "Live Program",
    text: "The live group program gave me the confidence to speak in meetings. Having a teacher and classmates made all the difference.",
    avatar: "C",
  },
  {
    name: "Ana Martínez",
    role: "Business Consultant",
    type: "IELTS Preparation",
    text: "I prepared for IELTS with the platform and achieved a 7.5 band score. The exam simulations were incredibly helpful.",
    avatar: "A",
  },
];

export const LandingTestimonials = () => {
  return (
    <section className="py-20 px-6 lg:px-20 bg-background">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-14">
          <Badge className="bg-accent/10 text-accent border-0 mb-4 text-xs font-semibold px-4 py-1.5">
            TESTIMONIALS
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            What our students say
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <Card key={i} className="p-6 rounded-2xl border shadow-sm">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-foreground text-sm italic leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm" style={{ background: 'linear-gradient(135deg, hsl(207 79% 28%), hsl(180 68% 39%))' }}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                  <Badge variant="outline" className="mt-1 text-[10px] border-border">
                    {t.type}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
