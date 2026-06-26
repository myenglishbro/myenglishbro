import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, BookOpen, HelpCircle, Clock, Phone, ArrowRight } from "lucide-react";

const Support = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 font-display mb-2">Soporte</h1>
        <p className="text-slate-500">
          ¿Dudas? Estamos para ayudarte
        </p>
      </div>

      {/* Contact Options */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="dashboard-card p-6 animate-fade-in-up">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-red-100">
              <Mail className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 font-display mb-2">Email</h3>
              <p className="text-sm text-slate-500 mb-4">
                Respuesta en menos de 24 horas
              </p>
              <a href="mailto:soporte@acelinguam">
                <Button className="bg-slate-800 hover:bg-slate-900 text-white rounded-xl">
                  Enviar email
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </div>

        <div className="dashboard-card p-6 animate-fade-in-up animate-delay-100">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-100">
              <MessageCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 font-display mb-2">WhatsApp</h3>
              <p className="text-sm text-slate-500 mb-4">
                Disponible Lun-Vie 9am-6pm
              </p>
              <a 
                href="https://wa.link/8rlrd2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Iniciar chat
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Help Center */}
      <div className="dashboard-card p-8 mb-8 animate-fade-in-up animate-delay-200">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 font-display mb-4">
            Centro de ayuda
          </h2>
          <p className="text-slate-500 mb-8 max-w-lg mx-auto">
            Encuentra respuestas a las preguntas más frecuentes, guías de uso y tutoriales para aprovechar al máximo tu curso.
          </p>
          <div className="flex gap-4 justify-center">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-primary">
              <BookOpen className="h-4 w-4 mr-2" />
              Ver guías
            </Button>
            <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
              Ver FAQ
            </Button>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up animate-delay-300">
        <div className="dashboard-card p-6 text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Horario de atención</h3>
          <p className="text-sm text-slate-500">
            Lunes a Viernes<br />
            9:00 AM - 6:00 PM (Lima)
          </p>
        </div>

        <div className="dashboard-card p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Email directo</h3>
          <p className="text-sm text-slate-500">
            soporte@myeacelinguam
          </p>
        </div>

        <div className="dashboard-card p-6 text-center">
          <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Phone className="h-6 w-6 text-violet-600" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Tiempo de respuesta</h3>
          <p className="text-sm text-slate-500">
            Menos de 24 horas<br />
            días hábiles
          </p>
        </div>
      </div>
    </div>
  );
};

export default Support;