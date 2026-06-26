const ACCENT = "#4C6FFF";

const featured = {
  quote:
    "I went from B1 to C1 in 8 months. Carlos's method is nothing like a normal class — practical, personal, and genuinely motivating. The AI tools and games make it addictive in the best way.",
  name: "Valeria Quispe",
  role: "Marketing Manager · Lima",
  initials: "VQ",
  resultTop: "B1 → C1",
  resultBottom: "in 8 months",
};

const cards = [
  {
    quote: "I passed Cambridge B2 First on the first try, scoring 176. The mock exams are scary-accurate to the real thing.",
    tag: "B2 First — 176/180", tagColor: "#0D9488", tagBg: "rgba(13,148,136,0.10)",
    name: "Diego Fernández", role: "Software Engineer · Arequipa", initials: "DF", avatar: "#0D9488",
  },
  {
    quote: "Carlos made IELTS feel manageable. His study plan and weekly feedback took my writing from 5.5 to 7.0.",
    tag: "IELTS Writing 5.5 → 7.0", tagColor: "#7C5CFF", tagBg: "rgba(124,92,255,0.10)",
    name: "Camila Torres", role: "University Student · Cusco", initials: "CT", avatar: "#7C5CFF",
  },
  {
    quote: "Within 3 months I was running international meetings confidently in English. A real game-changer for my business.",
    tag: "Business English in 3 months", tagColor: "#4C6FFF", tagBg: "rgba(76,111,255,0.10)",
    name: "Andrés Medina", role: "Business Owner · Trujillo", initials: "AM", avatar: "#4C6FFF",
  },
];

export const TestimonialsMEB = () => {
  return (
    <section
      id="stories"
      style={{
        background: "#fff",
        padding: "clamp(72px,10vh,116px) 24px",
        fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
        color: "#1E2128",
      }}
    >
      <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: "620px", margin: "0 auto 52px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "999px", background: "rgba(76,111,255,0.10)", color: ACCENT, fontWeight: 600, fontSize: "12.5px", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "18px" }}>
            Student stories
          </div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(32px,4vw,48px)", lineHeight: 1.08, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Real people, <span style={{ color: ACCENT }}>real progress.</span>
          </h2>
          <p style={{ fontSize: "18px", lineHeight: 1.55, color: "#5F636B", margin: 0 }}>
            Don't just take my word for it — here's what happens when you stick with it.
          </p>
        </div>

        {/* Featured */}
        <div
          style={{
            background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: "26px",
            padding: "clamp(28px,4vw,48px)", marginBottom: "22px",
            boxShadow: "0 24px 60px -34px rgba(0,0,0,0.28)",
            display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "center",
          }}
        >
          <div style={{ flex: "1 1 380px" }}>
            <div style={{ display: "flex", gap: "3px", marginBottom: "18px", color: "#F5A623", fontSize: "18px" }}>★★★★★</div>
            <blockquote style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "clamp(20px,2.2vw,26px)", lineHeight: 1.4, letterSpacing: "-0.01em", margin: "0 0 22px", color: "#22252C" }}>
              &ldquo;{featured.quote}&rdquo;
            </blockquote>
            <div style={{ display: "flex", alignItems: "center", gap: "13px" }}>
              <span style={{ width: "46px", height: "46px", borderRadius: "50%", background: ACCENT, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "15px" }}>
                {featured.initials}
              </span>
              <div>
                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "15.5px" }}>{featured.name}</div>
                <div style={{ fontSize: "13px", color: "#6E7178" }}>{featured.role}</div>
              </div>
            </div>
          </div>
          <div style={{ flex: "0 0 auto" }}>
            <div style={{ background: "rgba(76,111,255,0.08)", border: "1px solid rgba(76,111,255,0.16)", borderRadius: "18px", padding: "20px 26px", textAlign: "center" }}>
              <div style={{ fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: ACCENT, marginBottom: "6px" }}>Result</div>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "22px", color: "#1E2128" }}>{featured.resultTop}</div>
              <div style={{ fontSize: "13px", color: "#6E7178", marginTop: "2px" }}>{featured.resultBottom}</div>
            </div>
          </div>
        </div>

        {/* 3 cards */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "18px" }}>
          {cards.map((c) => (
            <div
              key={c.name}
              style={{
                flex: "1 1 280px", background: "#fff", border: "1px solid rgba(0,0,0,0.07)",
                borderRadius: "20px", padding: "24px", boxShadow: "0 14px 36px -28px rgba(0,0,0,0.25)",
              }}
            >
              <div style={{ display: "flex", gap: "2px", marginBottom: "12px", color: "#F5A623", fontSize: "13px" }}>★★★★★</div>
              <blockquote style={{ fontSize: "14.5px", lineHeight: 1.55, color: "#52565E", margin: "0 0 16px" }}>
                &ldquo;{c.quote}&rdquo;
              </blockquote>
              <span style={{ display: "inline-block", fontSize: "12px", fontWeight: 600, color: c.tagColor, background: c.tagBg, padding: "3px 10px", borderRadius: "999px", marginBottom: "16px" }}>
                {c.tag}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "11px", paddingTop: "14px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                <span style={{ width: "38px", height: "38px", borderRadius: "12px", background: c.avatar, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px" }}>
                  {c.initials}
                </span>
                <div>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "14px" }}>{c.name}</div>
                  <div style={{ fontSize: "12px", color: "#6E7178" }}>{c.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
