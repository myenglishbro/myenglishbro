import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingCart } from "lucide-react";

const products = [
  { name: "MyEnglishBro Hoodie", price: "S/120", tag: "Bestseller", emoji: "👕", bg: "from-slate-800 to-slate-900", badge: "🔥" },
  { name: "Grammar Ninja Mug", price: "S/45", tag: "New", emoji: "☕", bg: "from-blue-800 to-blue-900", badge: "✨" },
  { name: "Cambridge Prep Flashcards", price: "S/65", tag: "Study Kit", emoji: "📇", bg: "from-teal-700 to-teal-900", badge: "📚" },
  { name: "English Study Notebook", price: "S/35", tag: "Essential", emoji: "📓", bg: "from-violet-800 to-violet-900", badge: "⭐" },
  { name: "B2 Digital Pack", price: "S/25", tag: "Digital", emoji: "💾", bg: "from-rose-800 to-rose-900", badge: "🆕" },
  { name: "MEB Sticker Pack", price: "S/15", tag: "Fun", emoji: "🎨", bg: "from-amber-700 to-amber-900", badge: "🎉" },
];

export const ShopMEB = () => {
  return (
    <section id="shop" className="py-28 px-6 lg:px-20 bg-white">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 text-primary" style={{ background: "hsl(207 79% 28% / 0.08)" }}>
              The Shop
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>
              Rep your
              <span className="text-primary"> English journey.</span>
            </h2>
          </div>
          <Link to="/store">
            <Button variant="outline" className="h-12 px-6 rounded-2xl font-semibold border-2 border-slate-200 hover:border-primary/30 shrink-0">
              Visit the Shop
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.map((product) => (
            <div key={product.name} className="group cursor-pointer">
              {/* Product image placeholder */}
              <div className={`relative aspect-square rounded-2xl mb-3 overflow-hidden bg-gradient-to-br ${product.bg} flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.03] shadow-sm`}>
                <span className="text-5xl">{product.emoji}</span>
                <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center text-sm">
                  {product.badge}
                </div>
              </div>
              {/* Info */}
              <div>
                <span className="text-xs font-medium text-muted-foreground mb-0.5 block">{product.tag}</span>
                <h3 className="text-sm font-bold text-foreground leading-snug mb-1">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-primary">{product.price}</span>
                  <button className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-primary/10" style={{ color: "hsl(207 79% 28%)" }}>
                    <ShoppingCart className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Banner */}
        <div className="mt-10 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6" style={{ background: "linear-gradient(135deg, hsl(207 79% 28% / 0.06), hsl(180 68% 39% / 0.06))", border: "1px solid hsl(207 79% 28% / 0.1)" }}>
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold text-foreground mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>Free shipping on orders over S/100</h3>
            <p className="text-sm text-muted-foreground">All orders ship within 3–5 business days. Peru-wide delivery.</p>
          </div>
          <Link to="/store" className="shrink-0">
            <Button className="h-12 px-8 rounded-2xl font-semibold bg-primary hover:bg-primary/90 text-white">
              Shop Now
              <ShoppingCart className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
