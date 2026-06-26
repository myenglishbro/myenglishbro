const stats = [
  { value: "500+", label: "Students learning", color: "#1E2128" },
  { value: "300+", label: "Video lessons + PDFs", color: "#1E2128" },
  { value: "4.9★", label: "Average rating", color: "#1E2128" },
  { value: "Cambridge", label: "Exam-focused", color: "#4C6FFF" },
];

export const SocialProofMEB = () => {
  return (
    <section
      style={{
        background: "#FBFAF7",
        padding: "0 24px clamp(56px,8vh,88px)",
        fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px", margin: "0 auto", background: "#fff",
          border: "1px solid rgba(0,0,0,0.07)", borderRadius: "24px",
          boxShadow: "0 20px 50px -30px rgba(0,0,0,0.25)",
          display: "flex", flexWrap: "wrap",
        }}
      >
        {stats.map((s, i) => (
          <div
            key={s.label}
            style={{
              flex: "1 1 200px", padding: "28px 24px", textAlign: "center",
              borderRight: i < stats.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
            }}
          >
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "34px", lineHeight: 1, color: s.color }}>
              {s.value}
            </div>
            <div style={{ fontSize: "13.5px", color: "#6E7178", marginTop: "8px" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
