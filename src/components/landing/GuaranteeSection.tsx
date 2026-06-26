import { Shield, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export const GuaranteeSection = () => {
  const benefits = [
    "Acceso completo durante 24 horas sin compromiso",
    "Prueba las lecciones y recursos disponibles",
    "Si no es para ti, devolvemos el 100% de tu dinero",
    "Sin preguntas, sin complicaciones",
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-4xl mx-auto px-6">
        <Card className="landing-card border-secondary/30 p-8 md:p-12 overflow-hidden relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="text-center mb-10">
              {/* Shield icon with glow */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary/10 rounded-full mb-6 relative">
                <div className="absolute inset-0 bg-secondary/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                <Shield className="h-10 w-10 text-secondary relative" />
              </div>
              
              <h2 className="section-title mb-4">
                Garantía de satisfacción total
              </h2>
              
              <p className="text-xl text-muted-foreground">
                Prueba el curso durante <span className="text-secondary font-bold">24 horas</span> sin riesgo
              </p>
            </div>

            <div className="space-y-4 mb-10">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-secondary/5 rounded-xl border border-secondary/10">
                  <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-foreground font-medium">{benefit}</p>
                </div>
              ))}
            </div>

            <div className="bg-muted/50 rounded-2xl p-6 text-center border border-border">
              <p className="text-foreground font-semibold mb-2">
                ¿Por qué ofrecemos esta garantía?
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Porque estamos seguros de que nuestro método funciona. La gran mayoría de nuestros alumnos 
                continúan porque ven resultados reales desde el primer día.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};