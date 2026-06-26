import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/landing/WhatsAppButton";
import { HeroMEB } from "@/components/landing/meb/HeroMEB";
import { SocialProofMEB } from "@/components/landing/meb/SocialProofMEB";
import { CoursesMEB } from "@/components/landing/meb/CoursesMEB";
import { WaysToLearnMEB } from "@/components/landing/meb/WaysToLearnMEB";
import { TestimonialsMEB } from "@/components/landing/meb/TestimonialsMEB";
import { AboutMEB } from "@/components/landing/meb/AboutMEB";
import { PlatformMEB } from "@/components/landing/meb/PlatformMEB";
import { NewsletterMEB } from "@/components/landing/meb/NewsletterMEB";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* 1. Hook — light, human hero centered on courses */}
      <HeroMEB />

      {/* 2. Trust strip — 4 stats anchoring credibility */}
      <SocialProofMEB />

      {/* 3. Core offer — the course store (recorded video + PDFs, A1–C2) */}
      <CoursesMEB />

      {/* 4. Other ways to learn — live group classes + 1-on-1 */}
      <WaysToLearnMEB />

      {/* 5. Social proof — kills the "does this work?" objection */}
      <TestimonialsMEB />

      {/* 6. Who is Carlos — builds personal trust */}
      <AboutMEB />

      {/* 7. Platform — AI, mock exams, games, gamification, community */}
      <PlatformMEB />

      {/* 8. Final CTA — newsletter capture */}
      <NewsletterMEB />

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Landing;
