import { Link } from "react-router-dom";

const ACCENT = "#4C6FFF";

const levels = [
  { code: "A1", name: "Beginner", color: "#10B981", tint: "rgba(16,185,129,0.12)", text: "#0E9C6E", desc: "Start from zero with clear video lessons and printable PDFs." },
  { code: "A2", name: "Elementary", color: "#14B8A6", tint: "rgba(20,184,166,0.12)", text: "#0D9488", desc: "Build everyday vocabulary and grammar with guided practice." },
  { code: "B1", name: "Intermediate", color: "#06B6D4", tint: "rgba(6,182,212,0.12)", text: "#0891B2", desc: "Speak with confidence in real-world situations and at work." },
  { code: "B2", name: "Upper-Int.", color: "#3B82F6", tint: "rgba(59,130,246,0.12)", text: "#2563EB", desc: "Master fluency and prep for Cambridge B2 First with mock exams." },
  { code: "C1", name: "Advanced", color: "#4C6FFF", tint: "rgba(76,111,255,0.12)", text: "#4C6FFF", desc: "Refine advanced grammar and nail C1 Advanced & IELTS." },
  { code: "C2", name: "Proficiency", color: "#7C5CFF", tint: "rgba(124,92,255,0.12)", text: "#6D4DE6", desc: "Reach native-like mastery and the C2 Proficiency certificate." },
];

const bundleFeatures = [
  "6 complete levels (A1–C2)",
  "300+ HD video lessons",
  "Unlimited PDF downloads",
  "Lifetime updates + support",
];

export const CoursesMEB = () => {
  return (
    <section
      id="lessons"
      style={{
        background: "#fff",
        padding: "clamp(72px,10vh,116px) 24px",
        fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
        color: "#1E2128",
      }}
    >
      <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: "640px", margin: "0 auto 52px" }}>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "6px 14px", borderRadius: "999px", background: "rgba(76,111,255,0.10)",
              color: ACCENT, fontWeight: 600, fontSize: "12.5px", letterSpacing: "0.04em",
              textTransform: "uppercase", marginBottom: "18px",
            }}
          >
            Self-paced courses
          </div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(32px,4vw,48px)", lineHeight: 1.08, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Recorded courses + PDFs, <span style={{ color: ACCENT }}>at your own pace.</span>
          </h2>
          <p style={{ fontSize: "18px", lineHeight: 1.55, color: "#5F636B", margin: 0 }}>
            HD video lessons and downloadable resources for every level — from total beginner to mastery.
            Try any course free for 24 hours.
          </p>
        </div>

        {/* Levels grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(232px,1fr))", gap: "18px" }}>
          {levels.map((lv) => (
            <Link
              key={lv.code}
              to="/store"
              style={{
                display: "flex", flexDirection: "column", background: "#fff",
                border: "1px solid rgba(0,0,0,0.08)", borderRadius: "20px", overflow: "hidden",
                boxShadow: "0 14px 36px -30px rgba(0,0,0,0.28)", textDecoration: "none", color: "inherit",
              }}
            >
              <div style={{ height: "6px", background: lv.color }} />
              <div style={{ padding: "22px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <span
                    style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      minWidth: "46px", height: "32px", padding: "0 10px", borderRadius: "9px",
                      background: lv.tint, color: lv.text,
                      fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "15px",
                    }}
                  >
                    {lv.code}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: "14.5px" }}>{lv.name}</span>
                </div>
                <p style={{ fontSize: "13.5px", color: "#6E7178", lineHeight: 1.5, margin: "0 0 16px", flex: 1 }}>{lv.desc}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12.5px", color: "#9296A0" }}>Monthly · Lifetime</span>
                  <span style={{ fontSize: "13.5px", fontWeight: 700, color: lv.text }}>View →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Full Access bundle */}
        <div
          style={{
            marginTop: "24px", background: "rgba(76,111,255,0.05)", border: `2px solid ${ACCENT}`,
            borderRadius: "26px", padding: "clamp(28px,4vw,44px)", display: "flex", flexWrap: "wrap",
            gap: "36px", alignItems: "center", boxShadow: "0 28px 64px -34px rgba(76,111,255,0.5)",
          }}
        >
          <div style={{ flex: "1 1 320px", minWidth: "280px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "5px 13px", borderRadius: "999px", background: ACCENT, color: "#fff", fontWeight: 700, fontSize: "12px", marginBottom: "14px" }}>
              ★ Best value · Save 50%
            </div>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(24px,2.6vw,30px)", lineHeight: 1.12, margin: "0 0 12px" }}>
              Full Access — all 6 levels
            </h3>
            <p style={{ fontSize: "15.5px", lineHeight: 1.55, color: "#5F636B", margin: "0 0 18px" }}>
              Every course from A1 to C2 in one plan: 300+ video lessons, unlimited downloadable PDFs,
              lifetime updates and WhatsApp support.
            </p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "9px" }}>
              {bundleFeatures.map((f) => (
                <li key={f} style={{ display: "flex", gap: "9px", fontSize: "14px", color: "#52565E" }}>
                  <span style={{ color: ACCENT, fontWeight: 700 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ flex: "1 1 240px", maxWidth: "300px" }}>
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
              <div style={{ flex: 1, background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "16px", padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "11.5px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "#6E7178", marginBottom: "6px" }}>Monthly</div>
                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "30px", lineHeight: 1 }}>S/50</div>
                <div style={{ fontSize: "12px", color: "#9296A0", marginTop: "2px" }}>per month</div>
              </div>
              <div style={{ flex: 1, background: "#fff", border: `2px solid ${ACCENT}`, borderRadius: "16px", padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "11.5px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: ACCENT, marginBottom: "6px" }}>Lifetime</div>
                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "30px", lineHeight: 1, color: ACCENT }}>S/500</div>
                <div style={{ fontSize: "12px", color: "#9296A0", marginTop: "2px" }}>one payment</div>
              </div>
            </div>
            <Link
              to="/store"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                height: "52px", borderRadius: "14px", background: ACCENT, color: "#fff",
                fontWeight: 700, fontSize: "15.5px", textDecoration: "none",
                boxShadow: "0 14px 30px rgba(76,111,255,0.34)",
              }}
            >
              Get full access <span style={{ fontSize: "17px" }}>→</span>
            </Link>
            <p style={{ fontSize: "12.5px", color: "#6E7178", textAlign: "center", margin: "12px 0 0" }}>
              Free 24h trial · Pay with Yape, Plin, transfer or PayPal
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
