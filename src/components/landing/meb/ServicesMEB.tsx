import { Button } from "@/components/ui/button";
import { CheckCircle2, Star, ArrowRight, Clock, BookOpen, MessageCircle } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

const privateFeatures = [
  "General English (A1–C2)",
  "Cambridge exam preparation",
  "IELTS preparation",
  "Business English",
  "Speaking & pronunciation",
  "Job interview coaching",
  "Academic English",
  "Flexible scheduling",
];

const packageFeatures = [
  "10 private lessons (1-on-1)",
  "Personalized study plan",
  "Weekly homework & feedback",
  "Progress tracking dashboard",
  "Access to all resources",
  "Priority scheduling",
];

export const ServicesMEB = () => {
  return (
    <section id="lessons" className="py-28 px-6 lg:px-20" style={{ background: "#f8fafc" }}>
      <div className="container mx-auto max-w-6xl">

        {/* Header */}
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 text-primary"
            style={{ background: "hsl(239 84% 60% / 0.08)" }}
          >
            Private Lessons
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold text-foreground mb-5"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Learn directly with me,
            <br />
            <span className="text-primary">one-to-one.</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Personalized lessons adapted to your goals, schedule, and learning style. No group classes — only you.
          </p>
        </ScrollReveal>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

          {/* Card 1: Private Lessons */}
          <ScrollReveal className="relative rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "hsl(239 84% 60% / 0.10)" }}
              >
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">One-to-One</div>
                <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Private English Lesson
                </h3>
              </div>
            </div>

            <div className="mb-6 pb-6 border-b border-slate-100">
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-muted-foreground font-medium">S/</span>
                <span className="text-5xl font-black text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>60</span>
                <span className="text-muted-foreground text-sm">/hour</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">60-minute session via Zoom / Google Meet</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {privateFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>

            <a href="#book">
              <Button className="w-full h-12 rounded-2xl font-semibold text-sm bg-primary hover:bg-primary/90 text-white">
                Book a Lesson
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </ScrollReveal>

          {/* Card 2: Premium Package */}
          <ScrollReveal
            delay={120}
            className="relative rounded-3xl p-8 border-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            style={{ borderColor: "#4f46e5", background: "linear-gradient(160deg, #312e81, #1e1b4b)" }}
          >
            {/* Most Popular badge */}
            <div
              className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg"
              style={{ background: "linear-gradient(90deg, #f59e0b, #f97316)" }}
            >
              <Star className="h-3.5 w-3.5 fill-white" />
              Most Popular
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/15">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-xs text-blue-200 uppercase tracking-wider font-medium">Best Value</div>
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Premium Package
                </h3>
              </div>
            </div>

            <div className="mb-6 pb-6 border-b border-white/20">
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-blue-200 font-medium">S/</span>
                <span className="text-5xl font-black text-white" style={{ fontFamily: "Poppins, sans-serif" }}>550</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-blue-100 text-sm">10 hours</span>
                <span className="text-blue-300">·</span>
                <span className="text-blue-200 text-xs line-through">S/600</span>
                <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">Save S/50</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {packageFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-teal-300 mt-0.5 shrink-0" />
                  <span className="text-sm text-blue-100">{f}</span>
                </li>
              ))}
            </ul>

            <a href="#book">
              <Button className="w-full h-12 rounded-2xl font-semibold text-sm border-0 text-primary bg-white hover:bg-blue-50">
                Get the Package
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </ScrollReveal>
        </div>

        {/* Trust line */}
        <ScrollReveal delay={80}>
          <p className="text-center text-sm text-muted-foreground mt-8">
            Free first consultation · No long-term commitment · Cancel anytime
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};
