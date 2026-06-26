import { Card } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-mono text-dashboard-text mb-2">Settings</h1>
          <p className="text-dashboard-muted text-sm">
            Configura tu cuenta y preferencias
          </p>
        </div>

        <div className="dashboard-card p-12 text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-dashboard-accent-purple/10 flex items-center justify-center mx-auto mb-6">
            <SettingsIcon className="h-10 w-10 text-dashboard-accent-purple" />
          </div>
          <h2 className="text-2xl font-bold font-mono text-dashboard-text mb-3">
            Próximamente
          </h2>
          <p className="text-dashboard-muted max-w-md mx-auto">
            Estamos trabajando en añadir configuración de cuenta, preferencias de notificaciones, 
            opciones de idioma y más. Mantente atento a las actualizaciones.
          </p>
        </div>
      </div>
  );
};

export default Settings;
