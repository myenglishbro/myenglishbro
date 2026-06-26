import { useEffect, useState } from "react";

const BENEFITS = [
  { icon: "▣", title: "Clases online", text: "en vivo" },
  { icon: "✦", title: "Expertos", text: "Cambridge" },
  { icon: "▤", title: "Simulacros", text: "reales" },
  { icon: "✧", title: "Tutor IA", text: "integrado" },
];

const EXAMS = [
  "CAMBRIDGE B1",
  "B2 FIRST",
  "C1 ADVANCED",
  "IELTS",
  "LINGUASKILL",
  "APTIS",
  "TOEFL",
  "PTE ACADEMIC",
];

export function Hero({ data }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 120);
    return () => clearTimeout(t);
  }, []);

  const up = (ms = 0) => ({
    opacity: show ? 1 : 0,
    transform: show ? "none" : "translateY(16px)",
    transition: `opacity .7s ease ${ms}ms, transform .7s ease ${ms}ms`,
  });

  return (
    <section
      id="inicio"
      className="relative isolate min-h-screen overflow-hidden bg-[#054A91] text-white"
    >
      <style>{`
      @keyframes offerMarquee {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

.offer-marquee {
  animation: offerMarquee 125s linear infinite;
}

.offer-marquee:hover {
  animation-play-state: paused;
}
     @keyframes marquee {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

.exam-marquee {
  animation: marquee 22s linear infinite;
}

.exam-marquee:hover {
  animation-play-state: paused;
}

`}</style>

      {/* Offer bar */}
    <div className="relative z-30 h-14 overflow-hidden bg-[#F34CB5]">
  <div className="offer-marquee flex h-full w-max items-center gap-20 whitespace-nowrap px-10 text-sm font-bold text-white">

    {Array(8)
      .fill(null)
      .map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <span>🎓</span>
          <span>
            Obtén hasta <strong>20% OFF</strong> en programas Cambridge e IELTS
          </span>

          <span className="opacity-50">•</span>

          <span>
            Clases online en vivo
          </span>

          <span className="opacity-50">•</span>

          <span>
            Simulacros reales
          </span>

          <span className="opacity-50">•</span>

          <span>
            Tutor IA integrado
          </span>

          <span className="opacity-50">•</span>

          <span>
            Speaking Clubs semanales
          </span>
        </div>
      ))}
  </div>
</div>

      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_35%,rgba(38,183,199,.26),transparent_30%),radial-gradient(circle_at_76%_28%,rgba(10,114,201,.55),transparent_34%),linear-gradient(135deg,#054A91_0%,#0A26F4_52%,#054A91_100%)]" />
        <div className="absolute left-[-12%] top-[22%] h-[520px] w-[520px] rounded-full bg-[#26B7C7]/20 blur-[150px]" />
        <div className="absolute bottom-[-24%] right-[-12%] h-[560px] w-[560px] rounded-full bg-[#F59E0B]/14 blur-[170px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-10 pt-16 md:px-10 md:pt-24">
        <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
          {/* Copy */}
          <div className="relative z-20">
            <div
              className="inline-flex items-center gap-2 rounded-full bg-white/13 px-5 py-2 text-xs font-black uppercase backdrop-blur-xl"
              style={up(0)}
            >
              <span className="h-2 w-2 rounded-full bg-white" />
              Cursos
            </div>

            <h1
              className="mt-7 max-w-2xl text-[clamp(2.25rem,4.35vw,4.7rem)] font-black leading-[1.02] tracking-[-0.055em]"
              style={up(40)}
            >
              👋 Nunca más volverás a decir
              <br />
              <span className="relative inline-block">
                “My English is very bad”
                <span className="absolute -bottom-1 left-0 -z-10 h-3 w-full bg-[#F34CB5]/60" />
              </span>
            </h1>

            <p
              className="mt-6 max-w-lg text-base leading-7 text-white/82 md:text-lg"
              style={up(170)}
            >
              Gana fluidez y confianza con clases online en vivo, expertos
              Cambridge, simulacros reales y acompañamiento personalizado.
            </p>

            <div
              className="mt-9 flex flex-wrap items-center gap-5"
              style={up(250)}
            >
              <a
                href="#cursos"
                className="group inline-flex items-center justify-center rounded-full bg-[#F59E0B] px-9 py-4 text-sm font-black text-[#054A91] shadow-[0_22px_55px_rgba(245,158,11,.35)] transition hover:-translate-y-1 hover:bg-[#FFC83D]"
              >
                Inscribirme ahora
                <span className="ml-4 transition group-hover:translate-x-1">
                  →
                </span>
              </a>

              <div className="text-xs font-bold text-white/80">
                <p className="text-base leading-none">⭐⭐⭐⭐⭐</p>
                <p className="mt-1">
                  <span className="font-black text-white">+1 500</span>{" "}
                  estudiantes
                </p>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div
            className="relative hidden min-h-[430px] items-end justify-center lg:flex"
            style={up(160)}
          >
            <div className="absolute bottom-14 right-24 h-[350px] w-[350px] rounded-full border-[38px] border-[#26B7C7]/26" />
            <div className="absolute bottom-8 right-10 h-[260px] w-[260px] rounded-full bg-[#0A72C9]/22 blur-[50px]" />

         


<div className="relative rounded-[2.5rem] bg-white/10 p-4 backdrop-blur-xl border border-white/10">
  <img
    src={data?.heroImage ?? "/hero-student.png"}
    alt="Estudiante de inglés"
    className="relative z-20 max-h-[500px] rounded-[2rem] object-contain"
  />
</div>
          </div>
        </div>

        {/* Benefits */}
        <div
          className="mt-12 grid gap-5 border-y border-white/15 py-7 md:grid-cols-4"
          style={up(330)}
        >
          {BENEFITS.map((item) => (
            <div key={item.title} className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 text-xl backdrop-blur-xl">
                {item.icon}
              </div>
              <div>
                <p className="text-base font-black">{item.title}</p>
                <p className="text-base font-black text-white/75">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Exam carousel */}
        <div
          className="mt-9 rounded-[1.75rem] border border-white/15 bg-white/8 p-4 shadow-[0_30px_90px_rgba(0,0,0,.18)] backdrop-blur-xl"
          style={up(420)}
        >
          <div className="overflow-hidden">
            <div className="exam-marquee flex w-max gap-4">
              {[...EXAMS, ...EXAMS].map((exam, index) => (
                <div
                  key={`${exam}-${index}`}
                  className="flex min-w-[168px] items-center justify-center rounded-2xl bg-white px-5 py-5 text-center text-base font-black text-[#054A91] shadow-sm transition hover:-translate-y-0.5"
                >
                  {exam}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#F34CB5]" />
          <span className="h-3 w-3 rounded-full bg-white/65" />
          <span className="h-3 w-3 rounded-full bg-white/65" />
        </div>
      </div>
    </section>
  );
}