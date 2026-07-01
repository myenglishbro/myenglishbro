import { Link } from "react-router-dom";
import { Mail, Facebook, Instagram, Youtube, ExternalLink } from "lucide-react";

const footerLinks = {
  learn: [
    { label: "Private Lessons", href: "#lessons" },
    { label: "Platform", href: "/store" },
    { label: "Free Resources", href: "/resources" },
    { label: "Free Lessons", href: "/lessons" },
    { label: "Cambridge Prep", href: "#platform" },
    { label: "IELTS Prep", href: "#platform" },
  ],
  community: [
    { label: "Discord", href: "#community" },
    { label: "WhatsApp Group", href: "#community" },
    { label: "Newsletter", href: "#newsletter" },
    { label: "Student Community", href: "#community" },
    { label: "Live Events", href: "#community" },
  ],
  shop: [
    { label: "Merch", href: "#shop" },
    { label: "Books & Flashcards", href: "#shop" },
    { label: "Digital Products", href: "#shop" },
    { label: "Study Packs", href: "#shop" },
  ],
};

export const Footer = () => {
  return (
    <footer style={{ background: "#0a1628" }}>
      <div className="container mx-auto px-6 lg:px-20 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm" style={{ background: "linear-gradient(135deg, #3b82f6, #14b8a6)" }}>
                MEB
              </div>
              <span className="text-lg font-bold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>MyEnglishBro</span>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: "#64748b" }}>
              A complete English learning ecosystem. Private coaching, AI practice, games, resources, and community—all in one place.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
                { icon: Instagram, href: "https://instagram.com/_myenglishbro", label: "Instagram" },
                { icon: Youtube, href: "https://youtube.com/c/MyEnglishBro", label: "YouTube" },
                { icon: Mail, href: "mailto:hello@myenglishbro.com", label: "Email" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                  style={{ background: "rgba(255,255,255,0.07)", color: "#64748b" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "linear-gradient(135deg, #3b82f6, #14b8a6)"; (e.currentTarget as HTMLAnchorElement).style.color = "white"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLAnchorElement).style.color = "#64748b"; }}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {(Object.entries(footerLinks) as [string, { label: string; href: string }[]][]).map(([section, links]) => (
            <div key={section}>
              <h3 className="font-semibold text-white capitalize mb-4 text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>{section}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("#") || link.href.startsWith("/") ? (
                      <Link
                        to={link.href.startsWith("/") ? link.href : "/"}
                        className="text-sm transition-colors hover:text-white"
                        style={{ color: "#64748b" }}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-sm transition-colors hover:text-white" style={{ color: "#64748b" }}>{link.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-xs" style={{ color: "#475569" }}>
            © {new Date().getFullYear()} MyEnglishBro · Carlos Apolaya Sánchez. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-5 items-center">
            <a href="#" className="text-xs transition-colors hover:text-white" style={{ color: "#475569" }}>Privacy Policy</a>
            <a href="#" className="text-xs transition-colors hover:text-white" style={{ color: "#475569" }}>Terms of Service</a>
            <a href="https://acelingua.com" target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 transition-colors hover:text-white" style={{ color: "#475569" }}>
              AceLingua Language Center <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
