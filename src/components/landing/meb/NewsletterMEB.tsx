import { useState } from "react";

const ACCENT = "#4C6FFF";

export const NewsletterMEB = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section
      style={{
        background: "#FBFAF7",
        padding: "clamp(56px,8vh,96px) 24px clamp(72px,10vh,112px)",
        fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "860px", margin: "0 auto", position: "relative", overflow: "hidden",
          borderRadius: "30px", background: "linear-gradient(135deg,#4C6FFF,#3954E0)",
          padding: "clamp(36px,5vw,64px)", textAlign: "center",
        }}
      >
        <div aria-hidden="true" style={{ position: "absolute", top: "-120px", left: "50%", transform: "translateX(-50%)", width: "520px", height: "300px", background: "radial-gradient(ellipse at 50% 0%,rgba(255,255,255,0.22),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "999px", background: "rgba(255,255,255,0.16)", color: "#fff", fontWeight: 600, fontSize: "12.5px", letterSpacing: "0.03em", marginBottom: "20px" }}>
            Free weekly resources
          </div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(28px,3.6vw,42px)", lineHeight: 1.1, letterSpacing: "-0.02em", color: "#fff", margin: "0 0 14px" }}>
            English that sticks,<br />in your inbox every week.
          </h2>
          <p style={{ fontSize: "16.5px", lineHeight: 1.55, color: "rgba(255,255,255,0.88)", margin: "0 auto 8px", maxWidth: "520px" }}>
            Join 2,000+ learners getting weekly grammar tips, vocab packs and Cambridge strategies.
          </p>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", margin: "0 0 30px" }}>
            Subscribe and grab the <strong style={{ color: "#fff" }}>B2 Vocabulary Survival Pack</strong> free.
          </p>

          {submitted ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.16)", color: "#fff", fontWeight: 600, fontSize: "16px", padding: "16px 28px", borderRadius: "16px" }}>
              You're in! Check your inbox for the free pack.
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: "10px", maxWidth: "460px", margin: "0 auto" }}>
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ flex: "1 1 220px", height: "52px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.14)", color: "#fff", fontSize: "15px", padding: "0 18px", outline: "none", fontFamily: "'Hanken Grotesk', sans-serif" }}
              />
              <button
                type="submit"
                style={{ height: "52px", padding: "0 26px", border: 0, borderRadius: "14px", background: "#fff", color: "#3954E0", fontWeight: 700, fontSize: "15px", cursor: "pointer", fontFamily: "'Hanken Grotesk', sans-serif" }}
              >
                Subscribe →
              </button>
            </form>
          )}
          <p style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.65)", margin: "18px 0 0" }}>No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
};
