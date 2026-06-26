import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // PayPal order ID

  useEffect(() => {
    // Verificar que el pago se haya procesado correctamente
    const verifyPayment = async () => {
      if (!token) {
        toast.error("No se encontró información del pago");
        return;
      }

      try {
        // Llamar al webhook manualmente para asegurar procesamiento
        const { error } = await supabase.functions.invoke('paypal-webhook', {
          body: {
            event_type: 'CHECKOUT.ORDER.APPROVED',
            resource: { id: token }
          }
        });

        if (error) {
          console.error('Error processing payment:', error);
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
      }
    };

    verifyPayment();
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-secondary/20 p-4">
            <CheckCircle className="h-16 w-16 text-secondary" />
          </div>
        </div>

        <h1 className="text-3xl font-bold font-mono text-foreground mb-4">
          ¡Pago exitoso!
        </h1>

        <p className="text-muted-foreground mb-8">
          Tu pago ha sido procesado correctamente. Ya tienes acceso a tu(s) curso(s).
        </p>

        <div className="bg-card/50 border border-border rounded-lg p-4 mb-8">
          <p className="text-sm text-muted-foreground mb-2">
            Recibirás un email de confirmación en breve con los detalles de tu compra.
          </p>
          <p className="text-sm text-foreground font-mono">
            ID de orden: {token}
          </p>
        </div>

        <Button
          size="lg"
          className="w-full btn-primary"
          onClick={() => navigate('/dashboard/courses')}
        >
          Ir a Mis Cursos
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-4"
          onClick={() => navigate('/')}
        >
          Volver al inicio
        </Button>
      </Card>
    </div>
  );
};

export default Success;
