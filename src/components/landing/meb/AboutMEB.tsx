import instructorPhoto from "@/assets/instructor-photo.png";

const ACCENT = "#4C6FFF";

const credentials = [
  "Cambridge-certified trainer",
  "Teaching since 2015",
  "500+ students coached",
  "B2, C1 & C2 exam specialist",
];

export const AboutMEB = () => {
  return (
    <section
      id="about"
      style={{
        background: "#FBFAF7",
        padding: "clamp(72px,10vh,116px) 24px",
        fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
        color: "#1E2128",
      }}
    >
      <div style={{ maxWidth: "1080px", margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "clamp(40px,5vw,72px)", alignItems: "center" }}>
        <div style={{ flex: "1 1 360px", maxWidth: "440px", position: "relative", margin: "0 auto" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: "18px -18px -18px 18px", borderRadius: "200px 200px 32px 32px", background: "rgba(76,111,255,0.10)" }} />
          <div style={{ position: "relative", borderRadius: "200px 200px 32px 32px", overflow: "hidden", aspectRatio: "4 / 5", boxShadow: "0 30px 60px -30px rgba(0,0,0,0.32)" }}>
            <img src={instructorPhoto} alt="Carlos Apolaya Sánchez" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%" }} />
          </div>
          <div style={{ position: "absolute", top: "-18px", right: "-12px", width: "92px", height: "92px", borderRadius: "22px", background: "#fff", boxShadow: "0 18px 40px -18px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "28px", color: ACCENT, lineHeight: 1 }}>10+</div>
            <div style={{ fontSize: "11px", color: "#6E7178", textAlign: "center", marginTop: "2px", lineHeight: 1.2 }}>
              years<br />teaching
            </div>
          </div>
        </div>

        <div style={{ flex: "1 1 380px", maxWidth: "540px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "999px", background: "rgba(76,111,255,0.10)", color: ACCENT, fontWeight: 600, fontSize: "12.5px", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "18px" }}>
            About me
          </div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(32px,4vw,48px)", lineHeight: 1.08, letterSpacing: "-0.02em", margin: "0 0 18px" }}>
            Hey, I'm Carlos —<br /><span style={{ color: ACCENT }}>your English bro.</span>
          </h2>
          <p style={{ fontSize: "17px", lineHeight: 1.6, color: "#5F636B", margin: "0 0 16px" }}>
            I'm a Cambridge-certified teacher from Peru. For 10+ years I've helped Spanish speakers stop
            freezing up and start actually speaking — with real confidence.
          </p>
          <p style={{ fontSize: "15.5px", lineHeight: 1.6, color: "#6E7178", margin: "0 0 26px" }}>
            I built MyEnglishBro to package everything I teach into courses you can take anytime, plus the
            tools and community to keep you going.
          </p>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "11px" }}>
            {credentials.map((c) => (
              <li key={c} style={{ display: "flex", gap: "9px", fontSize: "14.5px", color: "#52565E" }}>
                <span style={{ color: ACCENT, fontWeight: 700 }}>✓</span>{c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
