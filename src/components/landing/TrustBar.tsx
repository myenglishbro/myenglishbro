import { Users, Star, Award, BookOpen } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export const TrustBar = () => {
  const stats = [
    { icon: Users, value: 2500, label: "Estudiantes activos", suffix: "+", color: "bg-primary/10 text-primary" },
    { icon: Star, value: 4.9, label: "Valoración media", suffix: "★", color: "bg-accent/10 text-accent" },
    { icon: Award, value: 95, label: "Éxito en exámenes", suffix: "%", color: "bg-secondary/10 text-secondary" },
    { icon: BookOpen, value: 0, label: "Cambridge · IELTS · TOEFL", suffix: "", color: "bg-accent-sky/10 text-accent-sky", isText: true },
  ];

  return (
    <section className="py-12 bg-card border-y border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} delay={index * 100} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface StatCardProps {
  icon: any;
  value: number;
  label: string;
  suffix: string;
  color: string;
  delay: number;
  isText?: boolean;
}

const StatCard = ({ icon: Icon, value, label, suffix, color, delay, isText }: StatCardProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isDecimal = value % 1 !== 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || isText) return;
    const timer = setTimeout(() => {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) { setCount(value); clearInterval(interval); }
        else setCount(current);
      }, duration / steps);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, isVisible, delay, isText]);

  return (
    <div ref={ref} className="flex items-center gap-4 p-5 bg-background rounded-xl border border-border shadow-soft">
      <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        {isText ? (
          <p className="text-sm font-bold text-foreground leading-tight">Preparación</p>
        ) : (
          <p className="text-xl font-bold text-foreground font-display">
            {isDecimal ? count.toFixed(1) : Math.floor(count).toLocaleString()}{suffix}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
};
