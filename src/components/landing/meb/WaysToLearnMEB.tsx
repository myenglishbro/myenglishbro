import { Link } from "react-router-dom";
import { Users, MessageCircle } from "lucide-react";

const ACCENT = "#4C6FFF";
const TEAL = "#0D9488";

export const WaysToLearnMEB = () => {
  return (
    <section
      id="ways"
      style={{
        background: "#FBFAF7",
        padding: "clamp(72px,10vh,116px) 24px",
        fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
        color: "#1E2128",
      }}
    >
      <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: "620px", margin: "0 auto 48px" }}>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "6px 14px", borderRadius: "999px", background: "rgba(76,111,255,0.10)",
              color: ACCENT, fontWeight: 600, fontSize: "12.5px", letterSpacing: "0.04em",
              textTransform: "uppercase", marginBottom: "18px",
            }}
          >
            More ways to learn
          </div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(32px,4vw,48px)", lineHeight: 1.08, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Prefer real-time? <span style={{ color: ACCENT }}>I've got you.</span>
          </h2>
          <p style={{ fontSize: "18px", lineHeight: 1.55, color: "#5F636B", margin: 0 }}>
            Add live group programs or private coaching on top of your courses — whatever fits how you learn best.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "22px", justifyContent: "center" }}>
          {/* Live group */}
          <div
            style={{
              flex: "1 1 360px", maxWidth: "480px", background: "#fff",
              border: "1px solid rgba(0,0,0,0.08)", borderRadius: "24px", padding: "32px",
              boxShadow: "0 16px 40px -30px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "14px", background: "rgba(13,148,136,0.12)", marginBottom: "18px" }}>
              <Users size={23} color={TEAL} strokeWidth={1.7} />
            </div>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "21px", margin: "0 0 8px" }}>Live group classes</h3>
            <p style={{ fontSize: "15px", lineHeight: 1.55, color: "#6E7178", margin: "0 0 18px" }}>
              Small groups with certified teachers on Zoom or Google Meet. Includes full access to the course platform.
            </p>
            <ul style={{ listStyle: "none", margin: "0 0 24px", padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {["Max 8 students per group", "Live on Zoom / Google Meet", "Flexible weekly schedules"].map((f) => (
                <li key={f} style={{ display: "flex", gap: "10px", fontSize: "14.5px", color: "#52565E" }}>
                  <span style={{ color: TEAL, fontWeight: 700 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <Link
              to="/live-classes"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                height: "50px", borderRadius: "14px", background: "#fff",
                border: "1.5px solid rgba(13,148,136,0.4)", color: TEAL,
                fontWeight: 700, fontSize: "15px", textDecoration: "none",
              }}
            >
              See live classes <span style={{ fontSize: "17px" }}>→</span>
            </Link>
          </div>

          {/* 1-on-1 */}
          <div
            style={{
              flex: "1 1 360px", maxWidth: "480px", background: "#fff",
              border: "1px solid rgba(0,0,0,0.08)", borderRadius: "24px", padding: "32px",
              boxShadow: "0 16px 40px -30px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "14px", background: "rgba(76,111,255,0.12)", marginBottom: "18px" }}>
              <MessageCircle size={23} color={ACCENT} strokeWidth={1.7} />
            </div>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "21px", margin: "0 0 8px" }}>1-on-1 private lessons</h3>
            <p style={{ fontSize: "15px", lineHeight: 1.55, color: "#6E7178", margin: "0 0 18px" }}>
              Personal coaching with me, built entirely around your goals, schedule and pace.{" "}
              <strong style={{ color: "#1E2128" }}>S/60 / hour.</strong>
            </p>
            <ul style={{ listStyle: "none", margin: "0 0 24px", padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {["Fully personalized lessons", "Cambridge & IELTS prep", "60-min sessions via Zoom"].map((f) => (
                <li key={f} style={{ display: "flex", gap: "10px", fontSize: "14.5px", color: "#52565E" }}>
                  <span style={{ color: ACCENT, fontWeight: 700 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <Link
              to="/programs"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                height: "50px", borderRadius: "14px", background: ACCENT, color: "#fff",
                fontWeight: 700, fontSize: "15px", textDecoration: "none",
                boxShadow: "0 14px 30px rgba(76,111,255,0.34)",
              }}
            >
              Book a lesson <span style={{ fontSize: "17px" }}>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
