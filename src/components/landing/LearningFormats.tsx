import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const LearningFormats = () => {
  const navigate = useNavigate();

  const formats = [
    {
      icon: Monitor,
      badge: "SELF-PACED",
      title: "Platform Courses",
      description:
        "Learn at your own pace with structured video lessons, interactive exercises, downloadable resources, and exam simulations — available 24/7 on the Acelingua platform.",
      cta: "Browse Courses",
      action: () => navigate("/store"),
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Users,
      badge: "INSTRUCTOR-LED",
      title: "Live Group Programs",
      description:
        "Join scheduled group cohorts with a certified instructor. Small classes via Zoom with real-time interaction, feedback, and full platform access included.",
      cta: "View Programs",
      action: () => navigate("/live-classes"),
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
  ];

  return (
    <section className="py-20 px-6 lg:px-20 bg-card">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-14">
          <Badge className="bg-accent/10 text-accent border-0 mb-4 text-xs font-semibold px-4 py-1.5">
            TWO LEARNING FORMATS
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            Choose how you want to learn
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Whether you prefer self-paced study or live classes with a teacher, Acelingua has you covered.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {formats.map((format) => (
            <Card
              key={format.title}
              className="p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-14 h-14 ${format.bgColor} rounded-2xl flex items-center justify-center mb-6`}>
                <format.icon className={`h-7 w-7 ${format.color}`} />
              </div>
              <Badge variant="outline" className="mb-3 text-[10px] font-semibold tracking-wider">
                {format.badge}
              </Badge>
              <h3 className="text-xl font-bold text-foreground font-display mb-3">
                {format.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                {format.description}
              </p>
              <Button
                variant="outline"
                className="rounded-xl font-semibold"
                onClick={format.action}
              >
                {format.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
