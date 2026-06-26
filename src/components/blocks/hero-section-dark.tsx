import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, Award, BookOpen, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  badge?: string
  title: string
  titleGradient?: string
  subtitle: string
  primaryCtaText: string
  primaryCtaAction: () => void
  secondaryCtaText: string
  secondaryCtaAction: () => void
  features?: Array<{ text: string }>
  bottomImage: string
}

const CertificationBadges = () => (
  <div className="flex items-center justify-center gap-4 flex-wrap">
    {[
      { name: "Cambridge", icon: Award },
      { name: "IELTS", icon: BookOpen },
      { name: "TOEFL", icon: Globe },
    ].map((cert) => (
      <div
        key={cert.name}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm"
      >
        <cert.icon className="h-4 w-4 text-education-primary" />
        <span className="text-sm font-medium text-slate-700">{cert.name}</span>
      </div>
    ))}
  </div>
)

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  (
    {
      className,
      badge,
      title,
      titleGradient,
      subtitle,
      primaryCtaText,
      primaryCtaAction,
      secondaryCtaText,
      secondaryCtaAction,
      features = [],
      bottomImage,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn("relative overflow-hidden bg-gradient-to-br from-education-light via-white to-certification-light/30", className)} ref={ref} {...props}>
        {/* Background decorations */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-education-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-education-secondary/5 rounded-full blur-3xl" />
        
        <section className="relative max-w-full mx-auto">
          <div className="max-w-screen-xl mx-auto px-4 pt-32 pb-20 md:pt-40 md:pb-28 gap-12 md:px-8">
            <div className="space-y-6 max-w-3xl leading-0 lg:leading-5 mx-auto text-center">
              {/* Certification Badges */}
              <div className="animate-fade-in-up">
                <CertificationBadges />
              </div>

              {badge && (
                <Badge className="bg-education-primary/10 text-education-primary border-0 px-4 py-1.5 text-xs font-semibold animate-fade-in-up animate-delay-100">
                  {badge}
                </Badge>
              )}
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-slate-900 leading-tight animate-fade-in-up animate-delay-200">
                {title}
                {titleGradient && (
                  <span className="block text-gradient-primary">
                    {titleGradient}
                  </span>
                )}
              </h1>
              
              <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 leading-relaxed animate-fade-in-up animate-delay-300">
                {subtitle}
              </p>
              
              <div className="items-center justify-center gap-4 space-y-4 sm:flex sm:space-y-0 pt-4 animate-fade-in-up animate-delay-400">
                <Button
                  size="lg"
                  onClick={primaryCtaAction}
                  className="bg-education-primary hover:bg-education-primary/90 text-white text-base px-8 py-6 rounded-full font-semibold shadow-lg shadow-education-primary/30"
                >
                  {primaryCtaText}
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={secondaryCtaAction}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-6 rounded-full font-semibold"
                >
                  {secondaryCtaText}
                </Button>
              </div>

              {features.length > 0 && (
                <div className="flex gap-8 pt-8 text-sm justify-center flex-wrap animate-fade-in-up animate-delay-400">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-education-secondary" />
                      <span className="text-slate-600 font-medium">{feature.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {bottomImage && (
              <div className="mt-20 mx-4 md:mx-10 relative z-10 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                <div className="bg-white rounded-2xl overflow-hidden p-2 shadow-2xl border border-slate-100">
                  <img
                    src={bottomImage}
                    className="w-full rounded-xl"
                    alt="Plataforma Acelingua Language Center"
                  />
                </div>
                {/* Floating elements */}
                <div className="hidden md:block absolute -left-6 top-1/4 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-education-secondary/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-education-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900">+2,500</p>
                      <p className="text-xs text-slate-500">Estudiantes</p>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block absolute -right-6 bottom-1/4 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-certification-gold/10 rounded-full flex items-center justify-center">
                      <Award className="h-5 w-5 text-certification-gold" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900">98%</p>
                      <p className="text-xs text-slate-500">Satisfacción</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    )
  },
)
HeroSection.displayName = "HeroSection"

export { HeroSection }