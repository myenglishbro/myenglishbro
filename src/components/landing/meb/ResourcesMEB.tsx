import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const categories = ["All", "Grammar", "Vocabulary", "Cambridge", "IELTS", "Speaking", "Writing", "Templates"];

const resources = [
  { title: "Essential Grammar Reference", desc: "Complete A1–C2 grammar rules with examples and exercises.", category: "Grammar", free: true, pages: "42 pages", emoji: "📘" },
  { title: "Cambridge B2 Word List", desc: "600+ essential vocabulary items for the B2 First exam.", category: "Cambridge", free: true, pages: "28 pages", emoji: "📗" },
  { title: "Speaking Cheat Sheet", desc: "Key phrases and structures for IELTS and Cambridge speaking tests.", category: "Speaking", free: false, pages: "12 pages", emoji: "🗣️" },
  { title: "IELTS Writing Templates", desc: "Proven templates for Task 1 and Task 2 essays.", category: "IELTS", free: false, pages: "20 pages", emoji: "✍️" },
  { title: "C1 Advanced Vocabulary Pack", desc: "Advanced collocations, idioms, and formal language for C1.", category: "Vocabulary", free: true, pages: "35 pages", emoji: "📙" },
  { title: "Weekly Study Planner", desc: "Printable planner to organize your English study sessions.", category: "Templates", free: true, pages: "4 pages", emoji: "📅" },
  { title: "Cambridge Reading Strategies", desc: "10 proven techniques to score higher on reading tasks.", category: "Cambridge", free: false, pages: "16 pages", emoji: "📖" },
  { title: "Pronunciation Guide", desc: "IPA chart + audio links for difficult English sounds.", category: "Speaking", free: false, pages: "18 pages", emoji: "🔊" },
];

export const ResourcesMEB = () => {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? resources : resources.filter((r) => r.category === active);

  return (
    <section id="resources" className="py-28 px-6 lg:px-20" style={{ background: "#f8fafc" }}>
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 text-primary" style={{ background: "hsl(207 79% 28% / 0.08)" }}>
            Free Resources
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-5" style={{ fontFamily: "Poppins, sans-serif" }}>
            Download. Study.
            <span className="text-primary"> Improve.</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Professionally designed resources to support your English learning journey—completely free to download.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={
                active === cat
                  ? { background: "hsl(207 79% 28%)", color: "white" }
                  : { background: "white", color: "hsl(215 16% 47%)", border: "1px solid hsl(220 13% 91%)" }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Resource cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {filtered.map((res) => (
            <div key={res.title} className="group bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden flex flex-col">
              {/* Thumbnail */}
              <div className="h-32 flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(207 79% 28% / 0.08), hsl(180 68% 39% / 0.08))" }}>
                <span className="text-5xl">{res.emoji}</span>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "hsl(207 79% 28% / 0.08)", color: "hsl(207 79% 28%)" }}>{res.category}</span>
                  <span className="text-xs text-muted-foreground">{res.pages}</span>
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1.5 leading-snug" style={{ fontFamily: "Poppins, sans-serif" }}>{res.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">{res.desc}</p>

                {res.free ? (
                  <Button size="sm" className="w-full rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-white">
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Free Download
                  </Button>
                ) : (
                  <Link to="/auth?tab=register">
                    <Button size="sm" variant="outline" className="w-full rounded-xl text-xs font-semibold border-slate-200">
                      <Lock className="h-3.5 w-3.5 mr-1.5" />
                      Free Account Required
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View all CTA */}
        <div className="text-center">
          <Link to="/store">
            <Button variant="outline" size="lg" className="h-12 px-8 rounded-2xl font-semibold border-2 border-slate-200 hover:border-primary/30 hover:bg-primary/5">
              View All Resources
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
