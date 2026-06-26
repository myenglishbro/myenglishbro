import { Users, Star, Award, BookOpen } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export const StatsSection = () => {
  const stats = [
    { icon: Users, value: 2500, label: "Estudiantes activos", suffix: "+", color: "bg-primary/10 text-primary" },
    { icon: Star, value: 4.9, label: "Valoración media", suffix: "★", color: "bg-accent/10 text-accent" },
    { icon: Award, value: 95, label: "Éxito en exámenes", suffix: "%", color: "bg-secondary/10 text-secondary" },
    { icon: BookOpen, value: 150, label: "Lecciones disponibles", suffix: "+", color: "bg-accent-sky/10 text-accent-sky" },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="section-title mb-4">
            Resultados que hablan por sí solos
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Miles de profesionales ya han transformado su inglés con nosotros
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
}

const StatCard = ({ icon: Icon, value, label, suffix, color, delay }: StatCardProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isDecimal = value % 1 !== 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(interval);
        } else {
          setCount(current);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, isVisible, delay]);

  return (
    <div
      ref={ref}
      className="text-center p-8 bg-card border border-border rounded-2xl shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300"
    >
      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 ${color}`}>
        <Icon className="h-7 w-7" />
      </div>
      <div className="text-4xl font-bold text-foreground mb-2 font-display">
        {isDecimal ? count.toFixed(1) : Math.floor(count).toLocaleString()}
        {suffix}
      </div>
      <div className="text-muted-foreground text-sm font-medium">{label}</div>
    </div>
  );
};