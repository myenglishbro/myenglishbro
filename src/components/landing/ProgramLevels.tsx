import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Monitor, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const levels = [
  { level: "A1", name: "Foundations", desc: "Start from scratch with essential vocabulary and basic communication.", color: "bg-emerald-500" },
  { level: "A2", name: "Pre-Intermediate", desc: "Build confidence with everyday conversations and simple grammar.", color: "bg-teal-500" },
  { level: "B1", name: "PET Preparation", desc: "Develop intermediate skills and prepare for Cambridge B1 Preliminary.", color: "bg-cyan-500" },
  { level: "B2", name: "FCE Preparation", desc: "Master upper-intermediate English and prepare for Cambridge B2 First.", color: "bg-blue-500" },
  { level: "C1", name: "CAE Preparation", desc: "Achieve advanced proficiency and prepare for Cambridge C1 Advanced.", color: "bg-indigo-500" },
  { level: "IELTS", name: "IELTS Preparation", desc: "Targeted preparation for the IELTS exam across all four skills.", color: "bg-purple-500" },
];

export const ProgramLevels = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-6 lg:px-20 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-14">
          <Badge className="bg-primary/10 text-primary border-0 mb-4 text-xs font-semibold px-4 py-1.5">
            ALL LEVELS
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            Programs for every level
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From absolute beginners to exam preparation — find the right program for your goals.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((l) => (
            <Card key={l.level} className="p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <Badge className={`${l.color} text-white border-0 font-bold w-fit mb-4`}>
                {l.level}
              </Badge>
              <h3 className="text-lg font-bold text-foreground font-display mb-2">{l.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-grow">{l.desc}</p>

              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><Monitor className="h-3.5 w-3.5" /> Platform Course</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Live Program</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-xl font-semibold"
                onClick={() => navigate("/programs")}
              >
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
