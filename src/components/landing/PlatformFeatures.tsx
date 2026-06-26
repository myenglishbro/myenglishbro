import { Badge } from "@/components/ui/badge";
import { BookOpen, Headphones, Languages, ClipboardCheck, Download } from "lucide-react";

const features = [
  { icon: BookOpen, title: "Interactive Grammar Exercises", desc: "Practice grammar with structured exercises aligned to your level." },
  { icon: Headphones, title: "Listening Practice", desc: "Improve comprehension with real-world audio and video content." },
  { icon: Languages, title: "Vocabulary Training", desc: "Build your vocabulary with themed word banks and spaced repetition." },
  { icon: ClipboardCheck, title: "Exam Simulations", desc: "Prepare for Cambridge and IELTS with timed practice tests." },
  { icon: Download, title: "Downloadable Resources", desc: "Access PDFs, worksheets, and study guides offline." },
];

export const PlatformFeatures = () => {
  return (
    <section className="py-20 px-6 lg:px-20 bg-background">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-14">
          <Badge className="bg-primary/10 text-primary border-0 mb-4 text-xs font-semibold px-4 py-1.5">
            ACELINGUA PLATFORM
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            Practice English anytime with the Acelingua Platform
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Your digital learning hub — available 24/7 with all the tools you need to improve.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border hover:shadow-sm transition-shadow"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
