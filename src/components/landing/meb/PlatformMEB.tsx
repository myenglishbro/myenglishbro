import { Link } from "react-router-dom";
import { Bot, FileText, Gamepad2, Zap, BarChart3, Users } from "lucide-react";

const ACCENT = "#4C6FFF";

export const PlatformMEB = () => {
  return (
    <section
      id="platform"
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
            Inside the platform
          </div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(32px,4vw,48px)", lineHeight: 1.08, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            More than videos. <span style={{ color: ACCENT }}>A whole toolkit.</span>
          </h2>
          <p style={{ fontSize: "18px", lineHeight: 1.55, color: "#5F636B", margin: 0 }}>
            Every course comes with the tools that make practice stick — included free with your account.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "18px" }}>
          {/* AI - wide */}
          <div style={{ gridColumn: "span 2", minWidth: "260px", background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: "22px", padding: "30px", boxShadow: "0 16px 40px -30px rgba(0,0,0,0.22)" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "46px", height: "46px", borderRadius: "14px", background: "rgba(76,111,255,0.12)", marginBottom: "18px" }}>
              <Bot size={22} color={ACCENT} strokeWidth={1.8} />
            </div>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "19px", margin: "0 0 8px" }}>AI conversation partner</h3>
            <p style={{ fontSize: "14.5px", lineHeight: 1.55, color: "#6E7178", margin: "0 0 16px", maxWidth: "560px" }}>
              Practice speaking and writing with an AI tutor, 24/7. Instant feedback on grammar, vocabulary and
              fluency — between lessons, whenever it suits you.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {["Real-time correction", "Fluency feedback", "Essay review"].map((t) => (
                <span key={t} style={{ fontSize: "12.5px", color: "#52565E", background: "#F4F3EF", border: "1px solid rgba(0,0,0,0.06)", padding: "5px 11px", borderRadius: "999px" }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Mock exams */}
          <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: "22px", padding: "26px", boxShadow: "0 16px 40px -30px rgba(0,0,0,0.22)" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "13px", background: "rgba(13,148,136,0.12)", marginBottom: "16px" }}>
              <FileText size={21} color="#0D9488" strokeWidth={1.8} />
            </div>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "17px", margin: "0 0 8px" }}>Cambridge mock exams</h3>
            <p style={{ fontSize: "14px", lineHeight: 1.55, color: "#6E7178", margin: "0 0 14px" }}>Full B1–C2 papers with answer keys, scoring rubrics and model answers.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {["B2 First", "C1 Advanced"].map((t) => (
                <span key={t} style={{ fontSize: "11.5px", fontWeight: 600, color: "#0D9488", background: "rgba(13,148,136,0.10)", padding: "3px 9px", borderRadius: "999px" }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Games */}
          <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: "22px", padding: "26px", boxShadow: "0 16px 40px -30px rgba(0,0,0,0.22)" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "13px", background: "rgba(245,166,35,0.14)", marginBottom: "16px" }}>
              <Gamepad2 size={21} color="#E08A00" strokeWidth={1.8} />
            </div>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "17px", margin: "0 0 8px" }}>Vocabulary games</h3>
            <p style={{ fontSize: "14px", lineHeight: 1.55, color: "#6E7178", margin: 0 }}>Word Survivor, flashcard battles and speed rounds. The fastest way to build vocabulary — and enjoy it.</p>
          </div>

          {/* Gamification */}
          <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: "22px", padding: "26px", boxShadow: "0 16px 40px -30px rgba(0,0,0,0.22)" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "13px", background: "rgba(124,92,255,0.13)", marginBottom: "16px" }}>
              <Zap size={21} color="#7C5CFF" strokeWidth={1.8} />
            </div>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "17px", margin: "0 0 8px" }}>XP · badges · streaks</h3>
            <p style={{ fontSize: "14px", lineHeight: 1.55, color: "#6E7178", margin: 0 }}>Daily missions, weekly leaderboards and streak rewards that keep you showing up.</p>
          </div>

          {/* Progress */}
          <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: "22px", padding: "26px", boxShadow: "0 16px 40px -30px rgba(0,0,0,0.22)" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "13px", background: "rgba(76,111,255,0.12)", marginBottom: "16px" }}>
              <BarChart3 size={21} color={ACCENT} strokeWidth={1.8} />
            </div>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "17px", margin: "0 0 8px" }}>Progress dashboard</h3>
            <p style={{ fontSize: "14px", lineHeight: 1.55, color: "#6E7178", margin: 0 }}>See your XP, streak and real skill gains over time — so you always know where you stand.</p>
          </div>

          {/* Community - wide */}
          <div style={{ gridColumn: "span 2", minWidth: "260px", background: "rgba(76,111,255,0.07)", border: "1px solid rgba(76,111,255,0.14)", borderRadius: "22px", padding: "26px", display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "52px", height: "52px", borderRadius: "16px", background: "#fff", boxShadow: "0 8px 20px -10px rgba(0,0,0,0.2)" }}>
              <Users size={24} color={ACCENT} strokeWidth={1.7} />
            </div>
            <div style={{ flex: "1 1 240px" }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "17px", margin: "0 0 5px" }}>An active community</h3>
              <p style={{ fontSize: "14px", lineHeight: 1.55, color: "#5F636B", margin: 0 }}>Discord, WhatsApp groups, live webinars and a weekly newsletter. You're never learning alone.</p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "42px" }}>
          <p style={{ fontSize: "14px", color: "#6E7178", margin: "0 0 18px" }}>Every tool is included free with your account — no credit card needed to start.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
            <Link to="/auth?tab=register" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 26px", borderRadius: "14px", background: ACCENT, color: "#fff", fontWeight: 700, fontSize: "15px", textDecoration: "none", boxShadow: "0 14px 30px rgba(76,111,255,0.34)" }}>
              Create free account <span style={{ fontSize: "17px" }}>→</span>
            </Link>
            <Link to="/store" style={{ display: "inline-flex", alignItems: "center", padding: "14px 24px", borderRadius: "14px", background: "#fff", color: "#1E2128", fontWeight: 600, fontSize: "15px", textDecoration: "none", border: "1.5px solid rgba(0,0,0,0.10)" }}>
              Browse courses
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
