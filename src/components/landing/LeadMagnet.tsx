import { useState } from "react";
import { Gift, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const LeadMagnet = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("¡Clase gratuita enviada! Revisa tu email.");
      setEmail("");
    }
  };

  return (
    <section className="py-20 bg-background">
      <div className="max-w-4xl mx-auto px-6">
        <Card className="landing-card border-secondary/30 p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/10 rounded-full mb-6">
              <Gift className="h-8 w-8 text-secondary" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold font-mono text-foreground mb-4">
              Clase gratuita: 5 errores comunes
            </h2>
            
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Descubre los 5 errores más comunes que cometen los hispanohablantes al hablar inglés 
              y cómo corregirlos de inmediato. Clase en video de 25 minutos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-12 bg-input border-white/10 text-foreground"
                />
              </div>
              <Button type="submit" size="lg" className="btn-primary h-12 whitespace-nowrap">
                Obtener clase gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center mt-4 font-mono">
              No spam. Solo contenido de valor para mejorar tu inglés.
            </p>
          </form>

          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="font-bold text-foreground mb-1 font-mono text-sm">📧 Email inmediato</div>
                <div className="text-xs text-muted-foreground">Acceso en segundos</div>
              </div>
              <div>
                <div className="font-bold text-foreground mb-1 font-mono text-sm">🎯 100% Práctico</div>
                <div className="text-xs text-muted-foreground">Aplica hoy mismo</div>
              </div>
              <div>
                <div className="font-bold text-foreground mb-1 font-mono text-sm">✅ Sin compromiso</div>
                <div className="text-xs text-muted-foreground">Totalmente gratis</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
