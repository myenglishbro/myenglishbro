import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight, RefreshCw } from "lucide-react";

const Pending = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-primary/20 p-4">
            <Clock className="h-16 w-16 text-primary animate-pulse" />
          </div>
        </div>

        <h1 className="text-3xl font-bold font-mono text-foreground mb-4">
          Pago pendiente
        </h1>

        <p className="text-muted-foreground mb-8">
          Tu pago está siendo procesado. Esto puede tomar unos minutos.
        </p>

        <div className="bg-card/50 border border-border rounded-lg p-4 mb-8">
          <p className="text-sm text-muted-foreground mb-2">
            Te notificaremos por email cuando el pago se complete.
          </p>
          <p className="text-sm text-foreground font-mono">
            Estado: Procesando
          </p>
        </div>

        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full btn-primary"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowRight className="mr-2 h-5 w-5" />
            Ir al Dashboard
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Verificar estado
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-6">
          Si el pago no se completa en 24 horas, contáctanos.
        </p>
      </Card>
    </div>
  );
};

export default Pending;
