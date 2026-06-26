import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 12,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          days--;
        }
        if (days < 0) {
          days = 0;
          hours = 0;
          minutes = 0;
          seconds = 0;
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-primary to-accent-sky p-6 rounded-xl text-white border border-white/10">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Clock className="h-5 w-5" />
        <p className="text-xs font-bold font-mono uppercase tracking-wider">
          La oferta termina en:
        </p>
      </div>
      
      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="text-center">
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 mb-2 border border-white/20">
              <div className="text-3xl font-bold font-mono">
                {String(value).padStart(2, '0')}
              </div>
            </div>
            <div className="text-xs uppercase tracking-wide opacity-90 font-mono">
              {unit === 'days' ? 'Días' : 
               unit === 'hours' ? 'Horas' : 
               unit === 'minutes' ? 'Min' : 'Seg'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
