import { GraduationCap, Gamepad2, BookOpen, Trophy, ShoppingBag, Globe, ArrowRight } from "lucide-react";

const cards = [
  {
    Icon: GraduationCap,
    title: "Learn",
    subtitle: "Private Coaching",
    desc: "One-to-one lessons tailored to your goals. Cambridge, IELTS, Business English, or General fluency.",
    features: ["Personalized study plan", "Cambridge & IELTS prep", "Business English"],
    accent: "#3b82f6",
    gradFrom: "#eff6ff",
    gradTo: "#dbeafe",
  },
  {
    Icon: Gamepad2,
    title: "Practice",
    subtitle: "Games · AI · Mock Exams",
    desc: "Make practice addictive. AI conversation partner, vocabulary games, and full Cambridge mock exams.",
    features: ["Word Survivor game", "AI speaking partner", "B1–C2 mock exams"],
    accent: "#7c3aed",
    gradFrom: "#f5f3ff",
    gradTo: "#ede9fe",
  },
  {
    Icon: BookOpen,
    title: "Resources",
    subtitle: "Grammar · Vocabulary · Templates",
    desc: "Download free grammar guides, vocabulary packs, Cambridge cheat sheets, and study planners.",
    features: ["Grammar deep-dives", "Vocabulary packs", "IELTS writing templates"],
    accent: "#0d9488",
    gradFrom: "#f0fdfa",
    gradTo: "#ccfbf1",
  },
  {
    Icon: Trophy,
    title: "Challenges",
    subtitle: "Daily Missions · Badges · Rewards",
    desc: "Daily missions, weekly leaderboards, achievement badges, and streak rewards that keep you coming back.",
    features: ["Daily missions", "Achievement badges", "Weekly leaderboard"],
    accent: "#d97706",
    gradFrom: "#fffbeb",
    gradTo: "#fef3c7",
  },
  {
    Icon: ShoppingBag,
    title: "Shop",
    subtitle: "Merch · Books · Digital Products",
    desc: "Exclusive MyEnglishBro hoodies, notebooks, digital study packs, and learning accessories.",
    features: ["Exclusive merch", "Digital study packs", "Flashcard sets"],
    accent: "#be185d",
    gradFrom: "#fff1f2",
    gradTo: "#ffe4e6",
  },
  {
    Icon: Globe,
    title: "Community",
    subtitle: "Discord · WhatsApp · Events",
    desc: "A real English-speaking community with live events, weekly challenges, and support from Carlos.",
    features: ["Discord community", "Live webinars", "Weekly newsletter"],
    accent: "#15803d",
    gradFrom: "#f0fdf4",
    gradTo: "#dcfce7",
  },
];

export const EcosystemMEB = () => {
  return (
    <section className="py-28 px-6 lg:px-20 bg-white">
      <div className="container mx-auto max-w-6xl">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 text-primary"
            style={{ background: "hsl(207 79% 28% / 0.08)" }}
          >
            Learning Ecosystem
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold text-foreground mb-5"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Everything you need
            <br />
            <span className="text-primary">in one place.</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            MyEnglishBro is more than lessons. It's a complete ecosystem — learn, practice, compete, and grow, all together.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(({ Icon, title, subtitle, desc, features, accent, gradFrom, gradTo }) => (
            <div
              key={title}
              className="group relative rounded-3xl p-7 border border-slate-200/60 bg-white hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Subtle gradient fill on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none"
                style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
              />

              <div className="relative z-10">
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${accent}18` }}
                >
                  <Icon className="h-7 w-7" style={{ color: accent }} />
                </div>

                {/* Title */}
                <h3
                  className="text-xl font-bold text-foreground mb-1"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {title}
                </h3>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: accent }}>
                  {subtitle}
                </p>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-2">
                  {features.map((f) => (
                    <span
                      key={f}
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: `${accent}12`, color: accent }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <p className="text-muted-foreground text-sm mb-4">
            All features available in your free account — no credit card required.
          </p>
          <a href="#lessons" className="inline-flex items-center gap-2 font-semibold text-primary hover:text-primary/80 transition-colors text-sm">
            Get started today <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
