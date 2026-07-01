import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";

const posts = [
  {
    category: "Cambridge Tips",
    title: "How to Score 180+ on the B2 First Reading Paper",
    excerpt: "The strategies that consistently get my students into the top percentile—including the one technique almost nobody talks about.",
    readTime: "7 min read",
    date: "Jun 20, 2026",
    emoji: "📖",
    gradient: "from-blue-500 to-blue-700",
  },
  {
    category: "Vocabulary",
    title: "50 Advanced Collocations You Need to Sound Natural",
    excerpt: "Stop translating from Spanish. These are the exact word combinations that will make your English flow like a native speaker.",
    readTime: "5 min read",
    date: "Jun 15, 2026",
    emoji: "💬",
    gradient: "from-teal-500 to-teal-700",
  },
  {
    category: "Study Techniques",
    title: "The 20-Minute Daily Routine That Transformed My Students' English",
    excerpt: "Consistency beats intensity every time. Here's the simple routine my most successful students follow without fail.",
    readTime: "4 min read",
    date: "Jun 10, 2026",
    emoji: "⏱️",
    gradient: "from-violet-500 to-violet-700",
  },
];

export const BlogMEB = () => {
  return (
    <section id="blog" className="py-28 px-6 lg:px-20" style={{ background: "#f8fafc" }}>
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 text-primary" style={{ background: "hsl(207 79% 28% / 0.08)" }}>
              Blog
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>
              English insights,
              <span className="text-primary"> weekly.</span>
            </h2>
          </div>
          <Button variant="outline" className="h-12 px-6 rounded-2xl font-semibold border-2 border-slate-200 hover:border-primary/30 shrink-0">
            View All Articles
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Posts grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article key={post.title} className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:border-slate-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col">
              {/* Thumbnail */}
              <div className={`h-44 flex items-center justify-center bg-gradient-to-br ${post.gradient} relative overflow-hidden`}>
                <span className="text-6xl">{post.emoji}</span>
                <div className="absolute inset-0 bg-black/10" />
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "hsl(207 79% 28% / 0.08)", color: "hsl(207 79% 28%)" }}>
                    {post.category}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>

                <h3 className="font-bold text-foreground leading-snug mb-3 group-hover:text-primary transition-colors" style={{ fontFamily: "Poppins, sans-serif" }}>
                  {post.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">{post.excerpt}</p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs text-muted-foreground">{post.date}</span>
                  <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read more <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
