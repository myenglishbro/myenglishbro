import { Badge } from "@/components/ui/badge";
import { ClipboardList, Target, CreditCard, Rocket } from "lucide-react";

const steps = [
  { icon: ClipboardList, step: "1", title: "Take the placement test", desc: "Discover your current level with our free diagnostic test." },
  { icon: Target, step: "2", title: "Choose your level", desc: "Select the program that matches your goals and proficiency." },
  { icon: CreditCard, step: "3", title: "Enroll in a course or live program", desc: "Pick self-paced learning or a scheduled group cohort." },
  { icon: Rocket, step: "4", title: "Start learning with Acelingua", desc: "Access the platform, join live classes, and track your progress." },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 px-6 lg:px-20 bg-card">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-14">
          <Badge className="bg-accent/10 text-accent border-0 mb-4 text-xs font-semibold px-4 py-1.5">
            HOW IT WORKS
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            Get started in 4 simple steps
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="flex items-start gap-5">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <s.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary mb-1">STEP {s.step}</p>
                <h3 className="font-bold text-foreground mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
