import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Coins, Zap, Medal, Flame, BarChart2, Target } from "lucide-react";

const features = [
  {
    Icon: Coins,
    title: "Coins",
    desc: "Earn coins for every lesson, activity, and daily challenge you complete. Spend them in the shop.",
    gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    glow: "rgba(251,191,36,0.20)",
  },
  {
    Icon: Zap,
    title: "XP Points",
    desc: "Level up your profile with XP. The more you practice, the higher your English level badge.",
    gradient: "linear-gradient(135deg, #a78bfa, #7c3aed)",
    glow: "rgba(167,139,250,0.20)",
  },
  {
    Icon: Medal,
    title: "Badges",
    desc: "Unlock achievement badges for milestones: first lesson, first exam, 7-day streak, and more.",
    gradient: "linear-gradient(135deg, #34d399, #059669)",
    glow: "rgba(52,211,153,0.20)",
  },
  {
    Icon: Flame,
    title: "Daily Streaks",
    desc: "Log in and practice every day to build your streak. Protect it with streak freeze shields.",
    gradient: "linear-gradient(135deg, #f97316, #ea580c)",
    glow: "rgba(249,115,22,0.20)",
  },
  {
    Icon: BarChart2,
    title: "Leaderboards",
    desc: "Compete weekly and monthly with other learners. Top 3 earn exclusive prizes and badges.",
    gradient: "linear-gradient(135deg, #60a5fa, #3b82f6)",
    glow: "rgba(96,165,250,0.20)",
  },
  {
    Icon: Target,
    title: "Challenges",
    desc: "New daily and weekly missions keep your practice fresh and your motivation high.",
    gradient: "linear-gradient(135deg, #f472b6, #db2777)",
    glow: "rgba(244,114,182,0.20)",
  },
];

export const GamificationMEB = () => {
  return (
    <section
      className="py-28 px-6 lg:px-20 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a0818 0%, #0d0b1f 60%, #080717 100%)" }}
    >
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.12), transparent 70%)" }} />

      <div className="container mx-auto max-w-6xl relative z-10">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
            style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd" }}
          >
            Gamification
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-5"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Learning that feels like
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #60a5fa, #2dd4bf)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              playing a game.
            </span>
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: "#94a3b8" }}>
            Stay motivated with a full gamification system inspired by the best language learning apps in the world.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {features.map(({ Icon, title, desc, gradient, glow }) => (
            <div
              key={title}
              className="group rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] cursor-default"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
            >
              {/* Icon with gradient */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{ background: gradient, boxShadow: `0 8px 24px ${glow}` }}
              >
                <Icon className="h-6 w-6 text-white" />
              </div>

              <h3
                className="font-bold text-white mb-2"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl p-6 md:p-8 border"
          style={{ background: "rgba(59,130,246,0.07)", borderColor: "rgba(59,130,246,0.18)" }}
        >
          <div>
            <div
              className="text-lg font-bold text-white mb-1"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Ready to earn your first badge?
            </div>
            <div className="text-sm" style={{ color: "#94a3b8" }}>
              Create a free account and start your streak today.
            </div>
          </div>
          <Link to="/auth?tab=register">
            <Button
              className="h-12 px-8 rounded-2xl font-semibold text-sm border-0 shrink-0 text-white"
              style={{ background: "linear-gradient(135deg, #4f46e5, #0d9488)" }}
            >
              Start for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
