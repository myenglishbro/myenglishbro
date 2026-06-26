import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/landing/WhatsAppButton";
import { Hero } from "@/components/landing/Hero";
import { LiveCourses } from "@/components/landing/LiveCourses";
import { Teachers } from "@/components/landing/Teachers";
import { ExamPrices } from "@/components/landing/ExamPrices";
import { Bundles } from "@/components/landing/Bundles";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingTestimonials } from "@/components/landing/LandingTestimonials";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const heroData = {
  heroImage: "/hero-student.png",
};

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* SECTION 1 — Hero */}
      <Hero data={heroData} />

      {/* SECTION 2 — Cursos en vivo */}
      <LiveCourses />

      {/* SECTION 3 — Equipo docente */}
      <Teachers />

      {/* SECTION 4 — Mock Tests */}
      <ExamPrices />

      {/* SECTION 5 — Acelingua Box */}
      <Bundles />

      {/* SECTION 6 — How It Works */}
      <HowItWorks />

      {/* SECTION 7 — Testimonials */}
      <LandingTestimonials />

      {/* SECTION 8 — FAQ */}
      <LandingFAQ />

      {/* SECTION 9 — Final CTA */}
      <section className="py-24 px-6 lg:px-20" style={{ background: 'linear-gradient(135deg, hsl(207 79% 28%), hsl(180 68% 39%))' }}>
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4 font-display">
            Start your English journey with Acelingua
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-10 leading-relaxed">
            Join thousands of students learning English with our platform courses and live group programs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-background text-primary hover:bg-background/90 px-8 py-6 rounded-full font-semibold shadow-lg text-base"
              onClick={() => navigate("/programs")}
            >
              Explore Programs
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              className="bg-transparent border-2 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-6 rounded-full font-semibold text-base"
              onClick={() => navigate("/#placement-test")}
            >
              Take Placement Test
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Landing;
