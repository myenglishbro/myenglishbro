import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MessageCircle } from "lucide-react";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { useHorarioQuery } from "@/hooks/useHorario";

const Horario = () => {
  const { data: slots = [], isLoading } = useHorarioQuery();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Horario de clases
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Estos son los horarios en los que Juan está disponible para dictar clases, de lunes a domingo, de 6:00 AM a 11:00 PM.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lunes a Domingo · 6:00 AM - 11:00 PM</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando horario...</p>
          ) : (
            <ScheduleGrid slots={slots} ocupadoLabel="Clase con Juan" />
          )}
          <div className="mt-5 pt-5 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              ¿Ves un horario disponible que te sirve? Escríbele por WhatsApp para coordinar tu clase.
            </p>
            <a href="https://wa.link/e86mee" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-emerald-300 text-emerald-600 hover:bg-emerald-50">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contactar por WhatsApp
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Horario;
