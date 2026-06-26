import { Link } from "react-router-dom";
import instructorPhoto from "@/assets/instructor-photo.png";

const ACCENT = "#4C6FFF";
const ACCENT_TINT = "rgba(76,111,255,0.12)";
const ACCENT_TINT_SOFT = "rgba(76,111,255,0.06)";

const trustBadges = ["HD video + PDFs", "Every level A1–C2", "Free 24h trial"];

export const HeroMEB = () => {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#FBFAF7",
        fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
        color: "#1E2128",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute", top: "-180px", right: "-160px",
          width: "560px", height: "560px", borderRadius: "50%",
          background: ACCENT_TINT_SOFT, filter: "blur(20px)", pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "1180px", margin: "0 auto",
          padding: "clamp(56px,8vh,96px) 24px clamp(64px,9vh,104px)",
          position: "relative", zIndex: 1,
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "clamp(40px,5vw,80px)" }}>
          {/* LEFT */}
          <div style={{ flex: "1 1 460px", maxWidth: "580px" }}>
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: "9px",
                padding: "7px 15px 7px 12px", borderRadius: "999px",
                background: ACCENT_TINT, color: ACCENT,
                fontWeight: 600, fontSize: "13.5px", marginBottom: "24px",
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: ACCENT, display: "inline-block", flexShrink: 0 }} />
              Online English courses · A1–C2
            </div>

            <h1
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800,
                fontSize: "clamp(40px,5.2vw,68px)", lineHeight: 1.03,
                letterSpacing: "-0.025em", margin: "0 0 22px",
              }}
            >
              Learn English with a{" "}
              <span
                style={{
                  display: "inline-block", color: ACCENT, background: ACCENT_TINT,
                  padding: "0 0.12em", borderRadius: "10px", transform: "rotate(-1.6deg)",
                }}
              >
                bro
              </span>{" "}
              who actually gets you.
            </h1>

            <p style={{ fontSize: "clamp(17px,1.4vw,20px)", lineHeight: 1.55, color: "#5F636B", margin: "0 0 34px", maxWidth: "510px" }}>
              Recorded video courses and downloadable PDFs for every level — plus live group classes,
              1-on-1 coaching and AI practice. Learn your way, at your pace.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginBottom: "32px" }}>
              <Link
                to="/store"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "10px",
                  padding: "15px 26px", borderRadius: "15px", background: ACCENT, color: "#fff",
                  fontWeight: 700, fontSize: "16px", textDecoration: "none",
                  boxShadow: "0 14px 30px rgba(76,111,255,0.34)",
                }}
              >
                Browse courses <span style={{ fontSize: "18px", lineHeight: 1 }}>→</span>
              </Link>
              <Link
                to="/store"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "9px",
                  padding: "15px 24px", borderRadius: "15px", background: "#fff", color: "#1E2128",
                  fontWeight: 600, fontSize: "16px", textDecoration: "none",
                  border: "1.5px solid rgba(0,0,0,0.10)",
                }}
              >
                Start free 24h trial
              </Link>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {trustBadges.map((label) => (
                <span
                  key={label}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    padding: "8px 14px", borderRadius: "999px", background: "#fff",
                    border: "1px solid rgba(0,0,0,0.07)", fontSize: "13.5px", fontWeight: 500, color: "#52565E",
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, display: "inline-block", flexShrink: 0 }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div
            style={{
              flex: "1 1 400px", maxWidth: "500px", position: "relative",
              minHeight: "520px", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute", width: "86%", height: "90%",
                borderRadius: "200px 200px 32px 32px", background: ACCENT_TINT, top: "24px", left: "9%",
              }}
            />
            <div
              style={{
                position: "relative", width: "100%", maxWidth: "430px", height: "520px",
                borderRadius: "200px 200px 32px 32px", overflow: "hidden", background: ACCENT_TINT_SOFT,
                boxShadow: "0 30px 60px -28px rgba(0,0,0,0.30)",
              }}
            >
              <img
                src={instructorPhoto}
                alt="Carlos Apolaya — MyEnglishBro"
                style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 18%" }}
              />
            </div>

            <div
              style={{
                position: "absolute", left: "-14px", bottom: "34px",
                display: "flex", alignItems: "center", gap: "12px",
                padding: "13px 18px 13px 14px", borderRadius: "18px",
                background: "#fff", boxShadow: "0 16px 36px -14px rgba(0,0,0,0.28)",
              }}
            >
              <span style={{ flexShrink: 0, width: "11px", height: "11px", borderRadius: "50%", background: ACCENT, boxShadow: `0 0 0 4px ${ACCENT_TINT}`, display: "inline-block" }} />
              <div>
                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "16px", lineHeight: 1.15 }}>
                  Carlos Apolaya
                </div>
                <div style={{ fontSize: "13px", color: "#6E7178", marginTop: "2px" }}>Founder &amp; your coach</div>
              </div>
            </div>

            <div
              className="animate-float"
              style={{
                position: "absolute", top: "14px", right: "-10px",
                padding: "14px 18px", borderRadius: "18px 18px 18px 4px",
                background: "#fff", boxShadow: "0 14px 34px -16px rgba(0,0,0,0.30)", maxWidth: "200px",
              }}
            >
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "15.5px", lineHeight: 1.3, color: "#1E2128" }}>
                You speak better today than yesterday.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
