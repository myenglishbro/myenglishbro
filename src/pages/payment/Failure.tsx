import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

const Failure = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-destructive/20 p-4">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
        </div>

        <h1 className="text-3xl font-bold font-mono text-foreground mb-4">
          Pago cancelado
        </h1>

        <p className="text-muted-foreground mb-8">
          Tu pago no se pudo completar. No se realizó ningún cargo a tu cuenta.
        </p>

        <div className="bg-card/50 border border-border rounded-lg p-4 mb-8">
          <p className="text-sm text-muted-foreground mb-2">
            Posibles razones:
          </p>
          <ul className="text-sm text-muted-foreground text-left space-y-1">
            <li>• Cancelaste el pago</li>
            <li>• Fondos insuficientes</li>
            <li>• Error de conexión</li>
            <li>• Datos de pago incorrectos</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full btn-primary"
            onClick={() => navigate('/#pricing')}
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Intentar de nuevo
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Volver al inicio
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-6">
          ¿Necesitas ayuda? Contáctanos por WhatsApp
        </p>
      </Card>
    </div>
  );
};

export default Failure;
